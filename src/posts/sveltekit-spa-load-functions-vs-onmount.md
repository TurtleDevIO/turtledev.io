---
title: 'SvelteKit SPA: onMount vs page.ts (awaited) vs page.ts (stream)'
description: 'A scored, scenario-by-scenario comparison of the three main data loading approaches in SvelteKit SPA mode, with a concrete recommendation on which to use and when.'
date: '2026-05-11'
categories: ['sveltekit', 'svelte', 'spa']
published: true
readingTime: 15
---

I've been building web applications with SvelteKit for the last five years, both SSR and SPA. A year ago I switched to SPA with a Python backend. Since then I've found myself using all three approaches depending on the page: `onMount`, a [SvelteKit load function](https://svelte.dev/docs/kit/load#Universal-vs-server-When-does-which-load-function-run) with awaited data, or a load function that returns a promise (stream), without really knowing whether any of them was the best option. Each has clear wins and clear trade-offs depending on what the page does. I finally decided to invest the time to investigate all three in depth and draw a proper conclusion. This article maps them out section by section so you can pick the right one for the right job.

## Mental model

### onMount

Reads and writes use the same pattern. Call a function, await the result, update state:

```ts
// reading
onMount(async () => {
	const { data } = await getTodos();
	todos = data;
});

// writing
async function handleCreate(title: string) {
	const { data } = await createTodo({ title });
	todos = [...todos, data];
}
```

### page.ts (awaited)

Reads happen in the load function before the component exists. Writes happen in event handlers inside the component and call `invalidate` to trigger a re-fetch:

```ts
// +page.ts
export const load: PageLoad = async () => {
	return { todos: await getTodos().then((r) => r.data) };
};

// +page.svelte
async function handleCreate(title: string) {
	await createTodo({ title });
	await invalidate('app:todos');
}
```

### page.ts (stream)

The load function returns an unawaited promise instead of resolved data. The component handles the pending state via `{#await}`. Writes still call `invalidate` to re-fetch, same as the awaited version:

```ts
// +page.ts
export const load: PageLoad = ({ depends }) => {
	depends('app:todos');
	return { todos: getTodos().then((r) => r.data) };
};

// +page.svelte
async function handleCreate(title: string) {
	await createTodo({ title });
	await invalidate('app:todos');
}
```

Both page.ts versions are identical for writes: `invalidate` after every mutation. They differ only in how they handle the initial load: awaited blocks navigation until data is ready, stream returns a promise and lets the component decide what to show while waiting. With `onMount`, there is one pattern for all data operations. Initial load, create, update, delete all look the same. With load functions, you have two patterns to juggle: the load function for reads and event handlers with `invalidate` for writes. The more pages you add, the more you context-switch between the two.

There is also a deeper issue: load functions only cover data fetching. For anything lifecycle-tied — polling with `setInterval`, WebSocket connections, file upload progress via XHR events — you still reach for `onMount`. `onMount` on its own is enough. Load functions are not. `onMount` wins on mental model simplicity.

## Mutations

### onMount

After a mutation, you update local state manually. The simplest option is to append the server response:

```ts
async function handleCreate(title: string) {
	const { data } = await createTodo({ title });
	todos = [...todos, data];
}
```

Or re-fetch the full list to sync with the server:

```ts
async function handleCreate(title: string) {
	await createTodo({ title });
	const { data } = await getTodos();
	todos = data;
}
```

Either way, you decide what to update after each mutation.

### page.ts (awaited) and stream

Both versions handle mutations identically: call the API, then invalidate the dependency. SvelteKit re-runs the load function and the component gets fresh data.

```ts
async function handleCreate(title: string) {
	await createTodo({ title });
	await invalidate('app:todos');
}
```

`invalidate` keeps the server as the source of truth. Every mutation follows the same pattern regardless of which fields changed or how complex the update is.

With `onMount`, you choose how to reconcile local state after each mutation: append, patch, or re-fetch. With load functions, you call `invalidate` and the framework handles the rest. Both page.ts versions win on mutations.

## Editable forms

An editable form loads existing data and lets the user modify it before saving.

### onMount

Local state is the form. Load the data into it, bind the fields to it, save it.

```ts
let profile = $state({ name: '', email: '' });
let original = $state({ name: '', email: '' });

onMount(async () => {
	const { data } = await getProfile();
	profile = { ...data };
	original = { ...data };
});

async function handleSave() {
	await patchProfile(profile);
	original = { ...profile };
}

const isDirty = $derived(profile.name !== original.name || profile.email !== original.email);
```

You need a separate `original` to compare against, and you have to update it manually after a successful save.

### page.ts (awaited)

`data.profile` is read-only, so you need a local copy for the form fields.

```ts
let { data } = $props();
let form = $state({ name: data.profile.name, email: data.profile.email });

async function handleSave() {
	await patchProfile(form);
	await invalidate('app:profile');
}
```

Because `data.profile` is resolved data, you can compare it against `form` to detect unsaved changes:

```ts
const isDirty = $derived(form.name !== data.profile.name || form.email !== data.profile.email);
```

### page.ts (stream)

`data.profile` is a promise, so you cannot read it directly to initialize form state. You need `$effect` to wait for it to resolve, plus a stale guard to handle navigating away before the promise settles.

```ts
let { data } = $props();
let form = $state<Profile | null>(null);

$effect(() => {
	let stale = false;
	data.profile.then((profile) => {
		if (!stale) form = { ...profile };
	});
	return () => {
		stale = true;
	};
});
```

Detecting unsaved changes is harder too, because you cannot compare `form` against `data.profile` without awaiting it first.

With awaited, `data.profile` is always the server's version and acts as the reference for free. With `onMount`, you maintain that reference yourself. Stream adds even more boilerplate just to initialize. `page.ts` (awaited) wins.

## Loading state

### onMount

The component mounts with empty state. You track loading manually and conditionally render a skeleton, spinner, or placeholder.

```ts
let todos = $state<Todo[]>([]);
let loading = $state(true);
let error = $state(false);

onMount(async () => {
	try {
		const { data } = await getTodos();
		todos = data;
	} catch {
		error = true;
	} finally {
		loading = false;
	}
});
```

```svelte
{#if loading}
    <TodosSkeleton />
{:else if error}
    <p>Could not load todos.</p>
{:else}
    {#each todos as todo}...{/each}
{/if}
```

### page.ts (awaited)

Navigation blocks until data is ready. The component always mounts with data, so there is nothing to show a skeleton for. The only loading feedback available is a progress bar in the layout, driven by the `navigating` store.

### page.ts (stream)

The load function returns an unawaited promise. Navigation is instant and `{#await}` handles the three states in one block.

```svelte
{#await data.todos}
    <TodosSkeleton />
{:then todos}
    {#each todos as todo}...{/each}
{:catch}
    <p>Could not load todos.</p>
{/await}
```

No extra state variables. Pending, resolved, and error are all handled in the template.

`onMount` can show any loading indicator you want, but you wire up `loading` state and error state yourself. Awaited cannot show page-level loading at all. Stream gets the same capability as `onMount` for free: `{#await}` gives you pending, resolved, and error branches in the template with no extra variables. `onMount` earns half a point for being capable; stream wins for making it effortless.

## Preloading

SvelteKit can run load functions before the user navigates. Add `data-sveltekit-preload-data` to a link and SvelteKit fires the load function on hover. By the time the user clicks, the data is already in flight or fully ready.

### onMount

There is no preloading hook for `onMount`. Data only fetches after the component mounts, so the user always waits for the request on every navigation.

### page.ts (awaited) and stream

Both versions benefit from `data-sveltekit-preload-data` automatically:

```html
<a href="/todos" data-sveltekit-preload-data>Todos</a>
```

For awaited, SvelteKit runs the load function on hover and caches the resolved data. Navigation is instant. For stream, the promise starts early on hover, so it may already be settled by the time the component renders.

Both page.ts versions win. `onMount` has no equivalent without manual caching.

## Param reactivity

When navigating from `/todos/1` to `/todos/2`, SvelteKit keeps the same component mounted and updates the URL. You need to re-fetch with the new id.

### onMount

`onMount` runs once when the component first mounts. It does not re-run when params change. To react to param changes you need `$effect` with the `page` store and a stale guard:

```ts
import { page } from '$app/state';

let todo = $state<Todo | null>(null);

$effect(() => {
	const id = page.params.id;
	let stale = false;
	getTodo(id).then(({ data }) => {
		if (!stale) todo = data;
	});
	return () => {
		stale = true;
	};
});
```

The stale guard is there because of a race condition. If the user navigates from `/todos/1` to `/todos/2` to `/todos/3` quickly, three fetches are in flight at the same time. If the request for `/todos/2` happens to resolve after the one for `/todos/3`, the state gets overwritten with stale data and the wrong todo is shown. The `$effect` cleanup runs whenever the param changes, setting `stale = true` on the previous fetch so its result is silently dropped.

### page.ts (awaited) and stream

The load function receives `params` as an argument. SvelteKit re-runs it automatically whenever params change — no extra code needed.

```ts
// awaited
export const load: PageLoad = async ({ params }) => {
	return { todo: await getTodo(params.id).then((r) => r.data) };
};

// stream
export const load: PageLoad = ({ params }) => {
	return { todo: getTodo(params.id).then((r) => r.data) };
};
```

`onMount` doesn't see param changes without reaching for `$effect` and a stale guard. With load functions, SvelteKit re-runs the load automatically on every param change and cancels any in-flight request from the previous navigation — no stale guard needed. Both page.ts versions win.

## Framework agnostic

SvelteKit is a meta-framework built on top of Svelte. For SPAs, [it can feel like more than you need](https://www.reddit.com/r/sveltejs/comments/1hdek06/spa_single_page_apps_feel_like_second_class/). If you ever decide to drop the meta-framework and go with pure Svelte and a router, how you wrote your data fetching layer matters a lot.

### onMount

Your data fetching is plain TypeScript: call a function, await the result, update state. Nothing about this is SvelteKit-specific. The API calls, the state variables, the mutation handlers: all of it would look identical in a Svelte app without SvelteKit, or could be adapted to another framework with minimal changes.

### page.ts (awaited) and stream

Load functions, `depends`, and `invalidate` are SvelteKit APIs. Your data fetching is wired into SvelteKit's routing system. If you drop SvelteKit, all of it gets rewritten.

`onMount` wins. Your fetching logic stays portable; load functions couple it to SvelteKit.

## What about layout / parent data?

Load functions can call `parent()` to access data already fetched by a parent layout or page without re-fetching it. On paper this looks like a clear load function advantage, since `onMount` has no equivalent and you would need a store or context to share that data instead.

We left it out of the scoring for one reason: in SPA mode, a Svelte store or context solves the same problem just as well, and most developers find it more explicit. `parent()` is primarily useful for SSR, where composing server-side data across layout boundaries avoids extra round-trips that you simply don't have in a SPA. The [SvelteKit docs](https://svelte.dev/docs/kit/load#Using-parent-data) also warn that `await parent()` can introduce accidental waterfalls if you are not careful. For SPAs, the cleaner answer is a store.

## What about TypeScript?

Load functions generate a `PageLoad` type from SvelteKit's `$types` module, which gives you typed `params`, `data`, and the load return value automatically. `onMount` has no equivalent — you rely on the return types of your API functions.

We left this out because in practice it is not a meaningful difference. If you use a code generator (like [openapi-ts](https://openapi-ts.dev/) or [orval](https://orval.dev/)) to generate typed API clients from your backend schema, your `onMount` code is just as fully typed as any load function. The typed `PageLoad` wrapper is convenient, but it does not give you anything a well-typed API client does not already provide.

## Verdict

Here is our final score table:

|                    | onMount | page.ts (awaited) | page.ts (stream) |
| ------------------ | :-----: | :---------------: | :--------------: |
| Mental model       |    1    |         0         |        0         |
| Mutations          |    0    |         1         |        1         |
| Editable forms     |    0    |         1         |        0         |
| Loading state      |   0.5   |         0         |        1         |
| Preloading         |    0    |         1         |        1         |
| Param reactivity   |    0    |         1         |        1         |
| Framework agnostic |    1    |         0         |        0         |
| **Total**          | **2.5** |       **4**       |      **4**       |

`onMount` wins on mental model and framework agnosticism. It gives you full control, but that control comes with responsibility. If you know what you are doing, building a SPA entirely with `onMount` is not wrong.

Load functions take some of that control away, but also take some of the burden. Between the two variants, stream is the clear winner for SPAs: instant navigation, built-in loading state, and automatic param reactivity with no extra code. The one exception is editable forms, where awaited has a genuine edge because `data` acts as a clean reference for dirty detection. And forms that edit a single entity rarely need a skeleton anyway, so blocking navigation is a fine trade.

If you decide to go with load functions, my recommendation is to use `page.ts` (awaited) for pages with editable forms and `page.ts` (stream) for everything else.

A couple of days after writing this, I changed my mind about the framing itself. The scoring exercise treats this as a winner-takes-all decision, but in a real app you reach for whichever pattern fits the page. The follow-up post, [when to use onMount, page.ts (awaited), and page.ts (stream)](/blog/sveltekit-spa-when-to-use-load-functions-and-onmount), walks through concrete scenarios per pattern.

This article took me two days to put together, and I learned a lot along the way — including changing my own opinion a few times ☺. I hope it saves you some of that time and helps you make a more informed choice for your own project. If anything is wrong or missing, let me know.

Smooth Coding!
