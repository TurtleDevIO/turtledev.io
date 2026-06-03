---
title: 'Full-stack FastAPI Tutorial 3: SvelteKit SPA Setup with DaisyUI and Orval'
description: 'Set up a SvelteKit SPA with adapter-static, disable SSR, add DaisyUI for styling, and auto-generate a type-safe TypeScript API client from your FastAPI OpenAPI spec using Orval.'
date: '2026-04-23'
categories: ['sveltekit', 'svelte', 'tutorial']
published: true
readingTime: 15
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>

Welcome back! In [Tutorial 2](/blog/fastapi-tutorial-2-todo-crud-api) we built a complete CRUD API for todos with FastAPI. Now it's time to build the frontend.

In this tutorial we'll scaffold a SvelteKit project, configure it as a pure SPA (no server-side rendering), add DaisyUI for styling, and use Orval to auto-generate a type-safe TypeScript API client directly from our FastAPI OpenAPI spec. By the end, you'll have a frontend that can talk to the backend with zero hand-written API boilerplate.

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## Prerequisites

- Completed [Tutorial 2](/blog/fastapi-tutorial-2-todo-crud-api) or cloned the [02-backend-crud branch](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/02-backend-crud)
- Node.js 22+ installed ([nvm](https://github.com/nvm-sh/nvm) recommended)

If you're curious why we're building a SPA instead of using SvelteKit's default SSR, check out [Why I Switched from SvelteKit SSR to SPA + FastAPI](/blog/why-i-switched-from-sveltekit-ssr-to-spa-fastapi).

## Scaffolding the Project

From the root of your `fullstack-fastapi-tutorial/` folder, run:

```sh
npx sv create frontend
```

When prompted, select:

- **Template:** SvelteKit minimal
- **Type checking:** TypeScript
- **Add-ons:** Tailwind CSS (needed for DaisyUI), `prettier`, `sveltekit-adapter`
- **Adapter:** static (`@sveltejs/adapter-static`)

Your project structure should now look like this:

```
fullstack-fastapi-tutorial/
├── backend/
└── frontend/
    ├── src/
    │   ├── lib/
    │   ├── routes/
    │   │   ├── +layout.svelte
    │   │   └── +page.svelte
    │   ├── app.d.ts
    │   └── app.html
    ├── svelte.config.js
    ├── vite.config.ts
    └── package.json
```

## Configuring SvelteKit as a Pure SPA

To turn SvelteKit into a pure SPA, we're going to do two things: configure the adapter fallback and disable SSR globally.

<Callout type="info">

For more details, check out the official [SvelteKit SPA docs](https://svelte.dev/docs/kit/single-page-apps).

</Callout>

### Switch to adapter-static

SvelteKit ships with `adapter-auto` which tries to detect your deployment environment. Since we want a static output, we need `adapter-static` instead. If you selected it during scaffolding it's already installed — otherwise run `npm install -D @sveltejs/adapter-static`.

Make sure your `svelte.config.js` look like this:

```js
import adapter from '@sveltejs/adapter-static';

const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			fallback: '200.html'
		})
	}
};

export default config;
```

The `fallback: '200.html'` option is important. In a SPA, every URL is handled by the client-side router. Without a fallback, navigating directly to `/todos` would return a 404 from the server. The fallback tells the static server to always serve your app's HTML, letting SvelteKit's router take over.

### Disable SSR Globally

Create `src/routes/+layout.ts`:

```ts
export const ssr = false;
```

That single line disables SSR for the entire app. SvelteKit reads this from the root layout and applies it to every route. You could also set it per-route, but for a pure SPA it makes more sense to do it globally.

## Adding DaisyUI

We'll use [DaisyUI](https://daisyui.com/) for UI components and Tailwind CSS for styling. The minimal SvelteKit template already includes `@tailwindcss/vite`, so we just need to install DaisyUI and enable it.

```sh
npm install daisyui
```

Open `src/routes/layout.css` and add the DaisyUI plugin:

```css
@import 'tailwindcss';
@plugin "daisyui";
```

That's it — Tailwind CSS v4 loads plugins directly in CSS with `@plugin`, no separate config file needed.

## Setting Up Orval

[Orval](https://orval.dev/) reads your FastAPI's OpenAPI spec and generates a fully typed TypeScript API client. Every endpoint becomes a function with correct input and return types. When you change the API, you re-run Orval and the client updates automatically.

Install Orval as a dev dependency:

```sh
npm install -D orval
```

Add a `generate` script to `package.json`:

```json
{
	"scripts": {
		"generate": "orval"
	}
}
```

Now create `orval.config.ts` at the root of the `frontend/` folder:

```ts
import { defineConfig } from 'orval';

export default defineConfig({
	default: {
		input: {
			target: 'http://localhost:8000/openapi.json'
		},
		output: {
			client: 'fetch',
			baseUrl: 'http://localhost:8000',
			target: './src/lib/api/gen',
			schemas: './src/lib/api/gen/model',
			mode: 'tags',
			clean: true
		}
	}
});
```

Let's break down the key options:

- **`input.target`** — Orval fetches the OpenAPI spec from your running FastAPI server. FastAPI exposes it at `/openapi.json` automatically.
- **`client: 'fetch'`** — Use the native `fetch` API. No axios needed.
- **`baseUrl`** — The API base URL prepended to every generated request. We'll make this configurable via environment variable in a later tutorial.
- **`output.target`** — Where to write the generated API functions.
- **`output.schemas`** — Where to write the generated TypeScript types.
- **`mode: 'tags'`** — One file per OpenAPI tag. Our `todos` tag becomes `gen/todos.ts`. This keeps the generated code organized as the API grows.
- **`clean: true`** — Delete and regenerate the output folder each time. Prevents stale generated files from hanging around after you rename or remove endpoints.

## Generating the API Client

Make sure your FastAPI backend is running:

```sh
cd backend
uv run uvicorn app.main:app --reload
```

Then from the `frontend/` folder:

```sh
npm run generate
```

Orval fetches `http://localhost:8000/openapi.json` and generates the client. You should see something like:

```sh
> frontend@0.0.1 generate
> orval

🍻 orval v8.8.1 - A swagger client generator for typescript
default Cleaning output folder
🎉 default - Your OpenAPI spec has been converted into ready to use orval!
```

Your `src/lib/api/gen/` folder now looks like this:

```
src/lib/api/gen/
├── model/
│   ├── index.ts
│   ├── todo.ts
│   ├── todoCreate.ts
│   ├── todoPatch.ts
│   ├── todoUpdate.ts
│   ├── hTTPValidationError.ts
│   ├── validationError.ts
│   └── validationErrorCtx.ts
├── ping.ts
└── todos.ts
```

Open `src/lib/api/gen/todos.ts` and you'll see the generated types and function for `getTodos`:

```ts
export type getTodosResponse200 = {
  data: Todo[]
  status: 200
}

export type getTodosResponseSuccess = getTodosResponse200 & {
  headers: Headers;
};

export type getTodosResponse = getTodosResponseSuccess

export const getTodos = async (options?: RequestInit): Promise<getTodosResponse> => { ... }
```

And `Todo` in `src/lib/api/gen/model/todo.ts` is a direct mirror of our Python Pydantic model:

```ts
export interface Todo {
	id: number;
	title: string;
	completed: boolean;
	created_at: string;
}
```

`getTodosResponse` is a wrapper Orval generates around the actual data — it bundles `data: Todo[]`, the HTTP `status` code, and `headers` together. This means when you call `getTodos()` you always have the status code available to check whether the request actually succeeded.

Notice how the function name matches the `operation_id` we set on the FastAPI route in Tutorial 2. `operation_id="get_todos"` → `getTodos()`. This is why we set explicit operation IDs — without them you'd get auto-generated names like `getTodosTodosGet`.

<Callout type="info">

Commit the generated files to git. This way anyone cloning the repo can run the app immediately without needing the backend running. Never edit the generated files manually — they'll be overwritten the next time you run `npm run generate`.

</Callout>

## A Quick Sanity Check

Let's verify the generated client actually works by calling it from the home page. Update `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { getTodos } from '$lib/api/gen/todos';
	import type { Todo } from '$lib/api/gen/model';

	let todos = $state<Todo[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function fetchTodos() {
		loading = true;
		error = null;
		try {
			const { data, status } = await getTodos();
			if (status === 200) {
				todos = data;
			} else {
				error = `Unexpected response: ${status}`;
			}
		} catch (e) {
			error = 'Failed to fetch todos. Is the backend running?';
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto mt-16 max-w-md px-4">
	<h1 class="mb-6 text-2xl font-bold">Todo App</h1>

	<button class="btn w-full btn-primary" onclick={fetchTodos} disabled={loading}>
		{loading ? 'Loading...' : 'Fetch Todos'}
	</button>

	{#if error}
		<div class="mt-4 alert text-sm alert-error">{error}</div>
	{/if}

	{#if todos.length > 0}
		<ul class="mt-4 space-y-2">
			{#each todos as todo}
				<li class="flex items-center gap-2">
					<span class="badge {todo.completed ? 'badge-success' : 'badge-ghost'}">
						{todo.completed ? '✓' : '○'}
					</span>
					{todo.title}
				</li>
			{/each}
		</ul>
	{:else if !loading}
		<p class="mt-4 text-center text-sm text-base-content/50">No todos yet.</p>
	{/if}
</div>
```

Notice how it already looks pretty decent with just a few class names — that's DaisyUI doing the heavy lifting. A quick rundown of the classes we used:

- **`btn btn-primary`** — a styled button in the primary color
- **`alert alert-error`** — a colored error message box
- **`badge badge-success` / `badge-ghost`** — small pill labels; green for completed, neutral for pending
- **`text-base-content/50`** — the theme's text color at 50% opacity, for muted text

Everything else (`max-w-md`, `mt-4`, `space-y-2`, etc.) is plain Tailwind utility classes.

Start the dev server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click "Fetch Todos". You should get back an empty array (no todos in the backend yet) with no errors.

Notice how TypeScript knows `data` is `Todo[]` and `todo.title` is a `string` — all inferred from the generated client.

## What's Next

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

We now have a SvelteKit SPA wired up to our FastAPI backend with a type-safe generated client. In the next tutorial we'll build the full CRUD UI — listing todos, adding new ones, toggling completion, renaming, and deleting them.

[Tutorial 4: Building the Todo CRUD UI](/blog/fastapi-tutorial-4-todo-crud-ui)

<Callout type="tip">

Source code for this tutorial: [GitHub](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/03-frontend-setup)

</Callout>

Smooth Coding!
