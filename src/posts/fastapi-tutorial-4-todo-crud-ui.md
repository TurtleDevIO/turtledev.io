---
title: 'Full-stack FastAPI Tutorial 4: Building the Todo CRUD UI'
description: 'Build a full CRUD UI on top of our generated API client using SvelteKit stream load functions and invalidate for mutations.'
date: '2026-05-05'
categories: ['sveltekit', 'svelte', 'tutorial']
published: true
readingTime: 15
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>

In [Tutorial 3](/blog/fastapi-tutorial-3-sveltekit-spa-setup-orval) we wired up a SvelteKit SPA with a type-safe Orval-generated client and verified it could talk to our FastAPI backend. The home page has a "Fetch Todos" button and a hardcoded list. Functional, but not a real app yet.

In this tutorial we'll turn that scaffolding into a working todo app: list, create, toggle, and delete. But we're going to use this as an excuse to settle three questions every SPA eventually has to answer:

1. **Where do we load data?** `+page.ts`, `onMount`, or something else?
2. **How do we surface errors?** Inline banners, toasts, or the SvelteKit error page?
3. **How do we give the user feedback** when an action succeeds or fails?

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev), a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## Prerequisites

- Completed [Tutorial 3](/blog/fastapi-tutorial-3-sveltekit-spa-setup-orval) or cloned the [03-frontend-setup branch](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/03-frontend-setup)
- FastAPI backend running on `localhost:8000`

## The mental model: every async operation has four states

Every async operation in your app (loading a list, submitting a form, toggling a checkbox) moves through the same four states:

```
idle  →  loading  →  success
                  ↘  error
```

Once you see the app this way, the three questions above answer themselves:

- **Where to load data?** In a `+page.ts` load function, using the stream pattern: return the promise without awaiting it, so navigation stays instant and the component handles the pending state with `{#await}`. (See [SvelteKit SPA: onMount vs page.ts](/blog/sveltekit-spa-load-functions-vs-onmount) for a full comparison.)
- **How to surface errors?** Depends on which operation failed. Loading data: show it inline, because the page can't proceed without it. Mutating data: show a toast, because the page is still usable and the user just needs to know their action didn't take.
- **How to give feedback?** Same split. The state of the operation tells you what UI to show.

| Situation | Where it shows up |
| --- | --- |
| Data is loading | Inline skeleton via `{#await}` |
| Data load failed | Inline error via `{:catch}` |
| Mutation in progress | Disabled button |
| Mutation succeeded | Toast (or silent, if the UI change speaks for itself) |
| Mutation failed | Toast |

Two display surfaces (inline and toast) and a clear rule for which one to use.

<Callout type="info">

This isn't a SvelteKit pattern or a Svelte pattern. It's a UI pattern. The same split works in React, Vue, or vanilla JS; we're expressing it in Svelte 5 here.

</Callout>

## Data loading: stream

SvelteKit gives you three ways to load data in a SPA: `onMount`, a `+page.ts` that awaits the data before rendering (blocking navigation), or a `+page.ts` that returns a promise and lets the component handle the pending state (stream). We compare all three in depth in [this post](/blog/sveltekit-spa-load-functions-vs-onmount). For a CRUD list like this one, stream is the right choice.

With stream, the load function returns immediately without blocking navigation:

```ts
// +page.ts
export const load: PageLoad = ({ depends }) => {
    depends('app:todos');
    return { todos: getTodos().then((r) => r.data) };
};
```

The component receives `data.todos` as a promise and handles the three states with `{#await}`:

```svelte
{#await data.todos}
    <!-- skeleton -->
{:then todos}
    <!-- list -->
{:catch}
    <!-- error -->
{/await}
```

The second benefit: mutations become a single line. After every API call, you call `invalidate('app:todos')` and SvelteKit re-runs the load function. The server is always the source of truth, and there is no local state to patch manually.

## Listing todos

Create `frontend/src/routes/+page.ts`:

```ts
import { getTodos } from '$lib/api/gen/todos';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ depends }) => {
    depends('app:todos');
    return { todos: getTodos().then((r) => r.data) };
};
```

Then replace `frontend/src/routes/+page.svelte` with:

```svelte
<script lang="ts">
    let { data } = $props();
</script>

<div class="mx-auto mt-16 max-w-md px-4">
    <h1 class="mb-6 text-2xl font-bold">Todos</h1>

    {#await data.todos}
        <div class="space-y-2">
            <div class="skeleton h-10 w-full"></div>
            <div class="skeleton h-10 w-full"></div>
            <div class="skeleton h-10 w-full"></div>
        </div>
    {:then todos}
        {#if todos.length === 0}
            <p class="text-center text-sm text-base-content/50">No todos yet.</p>
        {:else}
            <ul class="space-y-2">
                {#each todos as todo (todo.id)}
                    <li class="flex items-center gap-2">
                        <span class="badge {todo.completed ? 'badge-success' : 'badge-ghost'}">
                            {todo.completed ? '✓' : '○'}
                        </span>
                        {todo.title}
                    </li>
                {/each}
            </ul>
        {/if}
    {:catch}
        <div class="alert alert-error">
            <span class="text-sm">Could not load todos. Is the backend running?</span>
        </div>
    {/await}
</div>
```

The component script is a single line. No `loading`, `error`, or `todos` state variables. `{#await}` handles all three states in the template: pending shows skeletons, resolved shows the list, rejected shows the inline error.

Save both files, start the backend, and reload. You should see the skeletons briefly, then "No todos yet." Stop the backend and reload: the `{:catch}` branch appears. The key difference from `onMount`: navigate to this page and the shell renders immediately with skeletons, with no blank screen while the request is in flight.

## A minimal toast store

Before mutations, we need somewhere to send feedback. Mutation errors belong in toasts, not inline. We'll build a small store now and use it throughout.

Create `frontend/src/lib/toast.svelte.ts`:

```ts
type Toast = { id: number; type: 'success' | 'error'; message: string };

let nextId = 0;
const toasts = $state<Toast[]>([]);

function show(type: Toast['type'], message: string) {
    const id = nextId++;
    toasts.push({ id, type, message });
    setTimeout(() => {
        const i = toasts.findIndex((t) => t.id === id);
        if (i !== -1) toasts.splice(i, 1);
    }, 4000);
}

export function getToasts() {
    return toasts;
}

export const toast = {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message)
};
```

**The `.svelte.ts` extension matters.** It tells the compiler this module uses runes (`$state`). A plain `.ts` file would error.

**`toasts` is module-level `$state`.** Any file that calls `toast.success(...)` mutates the same array, and any component reading it re-renders. No subscriptions, no boilerplate.

Create `frontend/src/lib/components/Toaster.svelte`:

```svelte
<script lang="ts">
    import { getToasts } from '$lib/toast.svelte';

    const toasts = getToasts();
</script>

<div class="toast toast-top toast-end z-50">
    {#each toasts as t (t.id)}
        <div class="alert alert-{t.type}">
            <span>{t.message}</span>
        </div>
    {/each}
</div>
```

Mount it once in the root layout. Update `frontend/src/routes/+layout.svelte`:

```svelte
<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import Toaster from '$lib/components/Toaster.svelte';

    let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<Toaster />
```

Now any file in the app can call `toast.success(...)` or `toast.error(...)` and a notification appears for four seconds.

## Adding a todo

Every mutation in this app has the same shape:

1. Disable the trigger so the user cannot fire it twice.
2. Call the API inside `try`/`catch`.
3. On success, call `invalidate('app:todos')` and optionally toast.
4. On error, toast.
5. Re-enable the trigger in `finally`.

Update `+page.svelte` with the full script and add the form above the `{#await}` block:

```svelte
<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { createTodo, patchTodo, deleteTodo } from '$lib/api/gen/todos';
    import type { Todo } from '$lib/api/gen/model';
    import { toast } from '$lib/toast.svelte';

    let { data } = $props();

    let newTitle = $state('');
    let creating = $state(false);

    async function handleCreate(e: SubmitEvent) {
        e.preventDefault();
        const title = newTitle.trim();
        if (!title || creating) return;
        creating = true;
        try {
            const { status } = await createTodo({ title });
            if (status === 201) {
                newTitle = '';
                toast.success('Todo added');
                await invalidate('app:todos');
            } else {
                toast.error('Could not add todo');
            }
        } catch {
            toast.error('Network error. Try again.');
        } finally {
            creating = false;
        }
    }
</script>
```

```svelte
<form onsubmit={handleCreate} class="mb-6 flex gap-2">
    <input
        type="text"
        class="input input-bordered flex-1"
        placeholder="What needs doing?"
        bind:value={newTitle}
        disabled={creating}
    />
    <button class="btn btn-primary" type="submit" disabled={creating || !newTitle.trim()}>
        {creating ? 'Adding...' : 'Add'}
    </button>
</form>
```

**`invalidate('app:todos')` re-runs the load function.** The component re-renders with the latest data from the server. No manual state patching, no risk of the list going out of sync.

**`creating` is still needed.** `invalidate` handles data re-fetching, but we still need to track whether the submission is in flight to disable the button and show "Adding...".

**The form lives outside the `{#await}` block.** It is available immediately, even while the list is loading. Users can start typing before the existing todos finish loading.

## Toggling completion

Add state and a handler to `<script>`:

```ts
let togglingId = $state<number | null>(null);

async function handleToggle(todo: Todo) {
    if (togglingId !== null) return;
    togglingId = todo.id;
    try {
        const { status } = await patchTodo(todo.id, { completed: !todo.completed });
        if (status === 200) {
            await invalidate('app:todos');
        } else {
            toast.error('Could not update todo');
        }
    } catch {
        toast.error('Network error. Try again.');
    } finally {
        togglingId = null;
    }
}
```

Replace the `<li>` inside the `{:then}` block:

```svelte
<li class="flex items-center gap-2">
    <input
        type="checkbox"
        class="checkbox"
        checked={todo.completed}
        disabled={togglingId === todo.id}
        onchange={() => handleToggle(todo)}
    />
    <span class="flex-1 {todo.completed ? 'text-base-content/50 line-through' : ''}">
        {todo.title}
    </span>
</li>
```

**`togglingId` holds the ID of the row being toggled, not a boolean.** This disables just that row mid-update, not every checkbox. If you need concurrent toggles across rows, switch to a `Set<number>`.

**No success toast.** The checkbox flipping is the feedback. A toast on top of that would be noisy.

## Deleting a todo

Add state and a handler to `<script>`:

```ts
let deletingId = $state<number | null>(null);

async function handleDelete(todo: Todo) {
    if (!confirm(`Delete "${todo.title}"?`)) return;
    deletingId = todo.id;
    try {
        const { status } = await deleteTodo(todo.id);
        if (status === 204) {
            toast.success('Todo deleted');
            await invalidate('app:todos');
        } else {
            toast.error('Could not delete todo');
        }
    } catch {
        toast.error('Network error. Try again.');
    } finally {
        deletingId = null;
    }
}
```

Add the delete button inside `<li>`:

```svelte
<button
    class="btn btn-ghost btn-sm"
    disabled={deletingId === todo.id}
    onclick={() => handleDelete(todo)}
>
    {deletingId === todo.id ? '...' : '✕'}
</button>
```

**We toast on success here, unlike toggle.** The row disappearing is easy to miss. The toast confirms what was deleted.

Save and try the full flow: add todos, toggle some, delete one, stop the backend mid-action. Everything should behave correctly.

## Recap: the rules we just applied

| Rule | Where we applied it |
| --- | --- |
| Data loads in `+page.ts` (stream) | Load function returns `{ todos: getTodos().then(...) }` |
| Loading state handled by `{#await}` | Pending: skeleton, resolved: list, rejected: inline error |
| `invalidate` after every mutation | Replaces manual state patching; server is always source of truth |
| Each async operation owns its state | `creating`, `togglingId`, `deletingId`, never reused |
| Mutation feedback goes through toasts | Every `try`/`catch` ends in `toast.success()` or `toast.error()` |

The stream approach removes a whole category of bugs: local state going out of sync with the server. The trade-off is a re-fetch on every mutation. For most apps, that is the right call.

## What's next

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev), a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

We've got a working CRUD UI, but we're calling the generated API client directly from each page. That's fine until we add authentication, at which point every request needs to send a session cookie, every 401 needs to redirect to login, and you really don't want to rewrite that logic in every component.

That's the subject of the next tutorial: a thin API client wrapper that centralizes auth handling and error normalization. The mutation pattern from this post stays exactly the same; the `try`/`catch`/`toast`/`invalidate` shape doesn't change. We're just moving the cross-cutting concerns out of every page and into one place.

<Callout type="tip">

Source code for this tutorial: [GitHub](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/04-frontend-crud)

</Callout>

Smooth Coding!
