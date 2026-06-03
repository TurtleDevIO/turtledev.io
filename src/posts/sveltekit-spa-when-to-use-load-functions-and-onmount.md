---
title: 'SvelteKit SPA: when to use onMount, page.ts (awaited), and page.ts (stream)'
description: "A practical guide to picking the right data loading pattern for each page in a SvelteKit SPA. All three approaches have a place; here's how to choose."
date: '2026-05-13'
categories: ['sveltekit', 'svelte', 'spa']
published: true
readingTime: 8
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>

A couple of days ago I [evaluated the three SvelteKit SPA data loading patterns](/blog/sveltekit-spa-load-functions-vs-onmount) and landed on a nuanced verdict: `onMount` isn't wrong if you know what you're doing, and between the two [SvelteKit load function](https://svelte.dev/docs/kit/load#Universal-vs-server-When-does-which-load-function-run) variants, stream wins for most pages while awaited wins for editable forms.

Honestly, I did all that investigation to pick one and stick with it. I wanted a single default for [FastSvelte](https://fastsvelte.dev) so the starter would be consistent across every page. But after I finished writing the post, I realized the real beauty of SvelteKit is that we get to choose the right one for the right scenario and benefit from all three in a single app. That's the framing this post takes: instead of which one wins, when to reach for each.

Three patterns, three different jobs:

- **`onMount`** is the most flexible. It can be used for any data loading scenario, but it really shines when you need lifecycle hooks beyond data fetching: WebSocket subscriptions, polling, file uploads with progress.
- **`page.ts` (awaited)** is for pages where the data IS the form: profile editors, settings pages, single-entity edits.
- **`page.ts` (stream)** is for everything else: lists, dashboards, search results, anything where you want instant navigation and a skeleton.

This post walks through when to reach for each, with concrete examples from a typical app.

<Callout type="promo">

**Want this pattern in a working starter?** [FastSvelte](https://fastsvelte.dev) is a production-ready FastAPI + SvelteKit starter that uses all three patterns where they fit, plus authentication, payments, and more.

</Callout>

## Use `onMount` when the page has lifecycle needs beyond data

SvelteKit Load functions (`page.ts` ones) only do one thing: fetch data before (or alongside) rendering. They run once and return a value. Anything that needs to keep running after that (a WebSocket connection, a polling timer, an event listener) belongs in `onMount`.

### Live updates over WebSocket

A chat page, a notifications panel, anything where the server pushes events:

```ts
import { onMount, onDestroy } from 'svelte';

let messages = $state<Message[]>([]);
let ws: WebSocket;

onMount(() => {
	ws = new WebSocket('wss://api.example.com/chat');
	ws.onmessage = (e) => {
		messages = [...messages, JSON.parse(e.data)];
	};
});

onDestroy(() => ws?.close());
```

The connection lives as long as the component does. A load function can't help here. It would open the socket, return, and never close it.

### Polling for updates

Same shape, different mechanism:

```ts
let stats = $state<Stats | null>(null);
let timer: ReturnType<typeof setInterval>;

onMount(() => {
	refresh();
	timer = setInterval(refresh, 5000);
});

onDestroy(() => clearInterval(timer));

async function refresh() {
	const { data } = await getStats();
	stats = data;
}
```

### File upload progress

Tracking XHR progress events requires a long-lived handler that can update reactive state as bytes flow:

```ts
function handleUpload(file: File) {
	const xhr = new XMLHttpRequest();
	xhr.upload.onprogress = (e) => {
		progress = (e.loaded / e.total) * 100;
	};
	xhr.open('POST', '/upload');
	xhr.send(file);
}
```

The handler itself doesn't need `onMount`, but it almost always shows up alongside other lifecycle code (cancel on unmount, cleanup on errors), so `onMount` ends up being the natural home for the page.

### Mixing with load functions

Worth noting: `onMount` and load functions are not mutually exclusive on the same page. A dashboard can load its main data via `page.ts` (stream) and use `onMount` to open a WebSocket for live updates on top of it. The load function handles the initial render; `onMount` runs after the component mounts and layers the realtime behavior on top. Use both when both are needed.

## Use `page.ts` (awaited) for pages that edit a single entity

Editable forms are the one place where awaited beats stream in a clear way. The reason is subtle but worth understanding.

When you edit a profile or a settings page, you want two things:

1. The form pre-filled with the current server values.
2. A way to detect unsaved changes (dirty state) so you can warn the user before they navigate away.

With awaited, the load function awaits the request before returning:

```ts
// +page.ts
export const load: PageLoad = async ({ depends }) => {
	depends('app:profile');
	return { profile: await getProfile().then((r) => r.data) };
};
```

And `data.profile` arrives as resolved data, ready to act as a clean reference:

```svelte
<!-- +page.svelte -->
<script lang="ts">
    import { invalidate } from '$app/navigation';

    let { data } = $props();
    let form = $state({ ...data.profile });

    const isDirty = $derived(
        form.name !== data.profile.name || form.email !== data.profile.email
    );

    async function handleSave() {
        await patchProfile(form);
        await invalidate('app:profile');
    }
</script>
```

`data.profile` is the server truth, `form` is the user's edit. Dirty detection is one line.

With stream, `data.profile` is a promise. You'd need `$effect` to wait for it before initializing the form, and you'd lose the cheap reference for dirty checks. (See the [stream form code sample](/blog/sveltekit-spa-load-functions-vs-onmount#editable-forms) in the previous post for what that looks like.) With `onMount`, you'd maintain your own `original` snapshot manually and update it on every save.

The other reason awaited fits forms: blocking navigation is fine here. A profile or settings page is one entity. There's no list to skeleton in, and the load is usually quick. By the time the user hovers, the data is preloaded. By the time they click, it's already there.

If the load is genuinely slow and you still want a skeleton, you can render one from the parent layout using the `navigating` store. Match on the target route and show the skeleton until the load resolves:

```svelte
<!-- +layout.svelte -->
<script lang="ts">
    import { navigating } from '$app/state';
    let { children } = $props();
</script>

{#if navigating.to?.route.id === '/settings'}
    <SettingsSkeleton />
{:else}
    {@render children()}
{/if}
```

That gives you a skeleton without giving up the clean `data.profile` reference.

**Pages that fit this pattern:**

- Profile and account settings
- Single-record edit pages (`/customers/123/edit`)
- Onboarding step forms with prefilled values
- Anything where the initial data IS the form

## Use `page.ts` (stream) for lists, dashboards, and everything else

This is the default. For any page where the data is the _content_ (not a form to edit), stream wins. For a complete working example of this pattern, see [Tutorial 4: Building the Todo CRUD UI](/blog/fastapi-tutorial-4-todo-crud-ui).

A typical list page:

```ts
// +page.ts
export const load: PageLoad = ({ depends }) => {
	depends('app:todos');
	return { todos: getTodos().then((r) => r.data) };
};
```

```svelte
{#await data.todos}
    <TodosSkeleton />
{:then todos}
    {#each todos as todo}...{/each}
{:catch}
    <p>Could not load todos.</p>
{/await}
```

Three things you get for free:

1. **Instant navigation.** The shell renders immediately. The user sees something while the request is in flight, instead of staring at the old page or a blank one.
2. **Built-in loading and error states.** `{#await}` gives you pending, resolved, and error branches in the template. No `loading` or `error` variables to track.
3. **Automatic preloading.** Add `data-sveltekit-preload-data` to the link and the request starts on hover. By the time the user clicks, the promise may already be settled.

Plus the usual load function benefits (these apply to `page.ts` (awaited) too): `invalidate('app:todos')` after every mutation re-fetches and re-renders, with no manual state patching. Param reactivity is automatic as well. Navigating from `/todos/1` to `/todos/2` re-runs the load with the new id and cancels the in-flight request from the previous navigation.

**Pages that fit this pattern:**

- Lists with CRUD (todo lists, product catalogs, posts)
- Search results
- Dashboards with multiple async data sources
- Detail pages without inline editing
- Anything where a skeleton is a better UX than blocking on the navigation

## A quick recap

| If the page...                                           | Use                 |
| -------------------------------------------------------- | ------------------- |
| ... has subscriptions, polling, or other lifecycle needs | `onMount`           |
| ... is an editable form with one entity                  | `page.ts` (awaited) |
| ... loads content for the user to view or interact with  | `page.ts` (stream)  |

Most real apps will end up using all three. A typical project of mine has a handful of list and dashboard pages on stream, one or two settings pages on awaited, and a page or two with `onMount` for realtime or device-specific features. That's not a sign that your codebase is inconsistent. It's a sign that different pages have different shapes, and SvelteKit gives you the right tool for each.

If you haven't seen the head-to-head comparison with scoring, that's [over here](/blog/sveltekit-spa-load-functions-vs-onmount). This post is the practical follow-up: not which one wins on paper, but which one fits the page in front of you.

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev), a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

Smooth Coding!
