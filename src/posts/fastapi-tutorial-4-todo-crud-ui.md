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

In [Tutorial 3](/blog/fastapi-tutorial-3-sveltekit-spa-setup-orval) we wired up a SvelteKit SPA with a type-safe Orval-generated client and verified it could talk to our FastAPI backend. In this tutorial we'll turn that scaffolding into a working todo app: list, create, toggle, and delete.

## Prerequisites

- Completed [Tutorial 3](/blog/fastapi-tutorial-3-sveltekit-spa-setup-orval) or cloned the [03-frontend-setup branch](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/03-frontend-setup)
- FastAPI backend running on `localhost:8000`

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev), a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## The mental model: every async operation has four states

Every async operation in your app (loading a list, submitting a form, toggling a checkbox) moves through the same four states:

```
idle (button ready)  →  loading (request in flight)  →  success (item appears / toast)
                                                      ↘  error (toast)
```

Once you see the app this way, the three questions above answer themselves:

- **How to load data?** We will be using SvelteKits universal load functions ( `+page.ts`) with the stream pattern. Other options were `page.ts` without streaming and `onMount`. In a real web application, there will be scenarios/pages where you would prefer or have to use the other two. (See [the head-to-head comparison](/blog/sveltekit-spa-load-functions-vs-onmount) and the practical [when-to-use-each guide](/blog/sveltekit-spa-when-to-use-load-functions-and-onmount) for the full picture.)
- **How to surface errors?** It depends on which operation failed. If data loading fails, the page is broken. The user is staring at an empty screen with nothing to do. That error belongs inline, right where the content should be. If a mutation fails (creating, updating, or deleting something), the page is still perfectly usable. The user just needs to know their action didn't go through. That's a toast: a brief, dismissible message that doesn't hijack the page.
- **How to give feedback?** The same split applies. While data is loading, show a skeleton where the content will appear. While a mutation is in flight, disable the button so the user knows something is happening and can't accidentally fire it twice. On success, sometimes a toast makes sense, but often the UI change itself is enough: the new item appears in the list, the deleted item disappears. You don't always need to announce it.

Here is how that maps to concrete UI across both operation types:

| | In progress | Success | Error |
| --- | --- | --- | --- |
| Data load | Inline skeleton via [`{#await}`](https://svelte.dev/docs/svelte/await-expressions) | data appears | Inline error via `{:catch}` |
| Mutation | Disabled button | Toast (or silent) | Toast |


## Data loading: streaming with promises

SvelteKit gives you three ways to load data in a SPA: `onMount`, a `+page.ts` that awaits the data before rendering (blocking navigation), or a `+page.ts` that returns a promise and lets the component handle the pending state ([streaming with promises](https://svelte.dev/docs/kit/load#Streaming-with-promises)). We compare all three in depth in [this post](/blog/sveltekit-spa-load-functions-vs-onmount). For a CRUD list like this one, streaming with promises is the right choice.

To make the loading states easy to see, every endpoint in `todo_route.py` has a one-second artificial delay. Mutation endpoints (create, toggle, delete) also have a 20% chance of returning a 500 error, so you can watch the toast error state trigger without the list getting randomly broken mid-session. To disable either, comment out the relevant lines in each endpoint:

```python
# await asyncio.sleep(SIMULATED_DELAY)
# maybe_fail()
```

You would remove both entirely in a real app.

With streaming, the load function returns immediately without blocking navigation:

```ts
// +page.ts
export const load: PageLoad = ({ depends }) => {
    depends('app:todos');
    return { todos: getTodos().then((r) => r.data) };
};
```

The component receives `data.todos` as a promise and handles the three states with [`{#await}`](https://svelte.dev/docs/svelte/await-expressions):

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
        <div class="alert shadow-lg border-2 font-medium {t.type === 'success' ? 'alert-success' : 'alert-error'}">
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
    import { createTodo } from '$lib/api/gen/todos';
    import { toast } from '$lib/toast.svelte';

    let { data } = $props();

    let newTitle = $state('');
    let creating = $state(false); // disables the button while the request is in flight

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

## TodoItem component

Toggle, delete, and rename all operate on a single row. Instead of tracking `togglingId`, `deletingId`, `renamingId` by ID in the parent, we extract a `TodoItem` component. Each instance owns its own state as simple booleans, and `+page.svelte` stays focused on the list.

Create `frontend/src/lib/components/TodoItem.svelte`:

```svelte
<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { patchTodo, deleteTodo } from '$lib/api/gen/todos';
    import type { Todo } from '$lib/api/gen/model';
    import { toast } from '$lib/toast.svelte';

    let { todo }: { todo: Todo } = $props();

    let toggling = $state(false);
    let deleting = $state(false);
    let editing = $state(false);
    let editTitle = $state('');
    let renaming = $state(false);
    let editInput = $state<HTMLInputElement | null>(null);

    $effect(() => { if (editInput) editInput.focus(); });

    async function handleToggle() {
        toggling = true;
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
            toggling = false;
        }
    }

    async function handleDelete() {
        if (!confirm(`Delete "${todo.title}"?`)) return;
        deleting = true;
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
            deleting = false;
        }
    }

    function startEdit() {
        editing = true;
        editTitle = todo.title;
    }

    function cancelEdit() {
        editing = false;
        editTitle = '';
    }

    async function handleRename() {
        const title = editTitle.trim();
        if (!title || title === todo.title) { cancelEdit(); return; }
        editing = false;
        renaming = true;
        try {
            const { status } = await patchTodo(todo.id, { title });
            if (status === 200) {
                await invalidate('app:todos');
            } else {
                toast.error('Could not rename todo');
            }
        } catch {
            toast.error('Network error. Try again.');
        } finally {
            renaming = false;
            editTitle = '';
        }
    }
</script>

<li class="flex items-center gap-2">
    <input
        type="checkbox"
        class="checkbox"
        checked={todo.completed}
        disabled={toggling}
        onchange={handleToggle}
    />
    {#if editing}
        <input
            class="input input-bordered input-sm flex-1"
            bind:value={editTitle}
            bind:this={editInput}
            onkeydown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') cancelEdit();
            }}
        />
    {:else}
        <span
            class="flex-1 cursor-pointer {todo.completed ? 'text-base-content/50 line-through' : ''}"
            onclick={startEdit}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && startEdit()}
        >
            {renaming ? '...' : todo.title}
        </span>
    {/if}
    <button
        class="btn btn-ghost btn-sm"
        disabled={deleting}
        onclick={handleDelete}
    >
        {deleting ? '...' : '✕'}
    </button>
</li>
```

A few things worth calling out:

**Booleans instead of nullable IDs.** In a flat list in `+page.svelte` you need `togglingId: number | null` to know *which* row is busy. Inside the component, each instance only cares about itself, so `toggling: boolean` is enough.

**No success toast for toggle.** The checkbox flipping is the feedback. A toast on top would be noisy. We do toast on delete because the row disappearing is easy to miss.

**`editInput` and `$effect` for focus.** `editInput` is a reactive reference to the text input. The `$effect` fires whenever it changes — when the input mounts, `editInput` becomes non-null and the effect focuses it. No `autofocus` attribute needed.

**Rename: Enter saves, Escape cancels.** If the title is empty or unchanged, `cancelEdit` discards it without a request.

Now import it in `+page.svelte` and replace the `<li>` with `<TodoItem {todo} />`:

```svelte
<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { createTodo } from '$lib/api/gen/todos';
    import { toast } from '$lib/toast.svelte';
    import TodoItem from '$lib/components/TodoItem.svelte';

    let { data } = $props();
    // ... handleCreate unchanged
</script>

<!-- inside {#each} -->
<ul class="space-y-2">
    {#each todos as todo (todo.id)}
        <TodoItem {todo} />
    {/each}
</ul>
```

Save and try the full flow: add todos, toggle some, rename one, delete one, stop the backend mid-action. Everything should behave correctly.

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
