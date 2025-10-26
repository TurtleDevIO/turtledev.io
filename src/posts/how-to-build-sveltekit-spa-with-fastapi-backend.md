---
title: "How to Build a SvelteKit SPA with FastAPI Backend"
description: "Learn how to connect a Svelte SPA with a FastAPI backend using Orval to auto-generate TypeScript API clients from OpenAPI specs for full type safety and clean architecture."
date: "2025-10-15"
categories: ["svelte", "fastapi", "orval", "spa"]
published: true
readingTime: 25
---

# How to Build a SvelteKit SPA with FastAPI Backend

Hey there! 👋 In my [previous post](/blog/why-i-switched-from-sveltekit-ssr-to-spa-fastapi), I talked about why I moved from SvelteKit SSR to a Svelte SPA + FastAPI architecture. Today, I want to show you my setup with a simple project.

> **Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready SvelteKit boilerplate with authentication, payments, and more built-in.

We'll build a simple **todo list app** to demonstrate how the frontend and backend communicate, and how to write less and type-safe code by using **Orval** to auto-generate TypeScript API clients from FastAPI's OpenAPI specs. 

> **[Complete source code available on GitHub](https://github.com/TurtleDevIO/svelte-spa-fastapi-tutorial)**

## Project Structure

We'll organize our project into two directories:

```
todo-app/
├── backend/          # FastAPI Python backend
│   ├── main.py       # FastAPI app
│   ├── models.py     # Pydantic models
│   └── requirements.txt
│
└── frontend/         # SvelteKit SPA
    ├── src/
    │   ├── routes/   # Pages
    │   └── lib/      # API client & components
    └── package.json
```

## Backend: FastAPI Setup

Let's start with the backend. Create a `backend` directory and set up a virtual environment:

```bash
cd backend
python3 -m venv .venv  # Or python3.11, python3.12 for specific version
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### requirements.in

We'll use `pip-compile` from `pip-tools` to manage dependencies. This approach has several advantages:

1. **Simple dependency specification**: List only your direct dependencies without worrying about version pins
2. **Clear dependency tree**: The generated `requirements.txt` shows which packages are your direct dependencies and which are transitive (dependencies of dependencies)
3. **Reproducible builds**: All versions are pinned in `requirements.txt` for consistent installations
4. **Easy updates**: Run `pip-compile` again to update all packages to their latest compatible versions

Create a `requirements.in` file with our core dependencies (without version pins):

```txt
fastapi
uvicorn[standard]
pydantic
```

### Install pip-tools and compile dependencies

```bash
pip install pip-tools
pip-compile requirements.in
pip install -r requirements.txt
```

This generates a `requirements.txt` with all pinned dependencies. Notice how the generated file clearly shows which packages are your direct dependencies (marked with `# via -r requirements.in`) and which are transitive dependencies (marked with `# via <package-name>`).

Also notice that `pip-compile` doesn't add itself or `pip-tools` to the `requirements.txt` file, since it's only required for development, not for running the application

### models.py

We'll define our Pydantic models for the todo items:

```python
# backend/models.py
from pydantic import BaseModel

class TodoCreate(BaseModel):
    title: str
    completed: bool = False

class TodoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

class Todo(BaseModel):
    id: int
    title: str
    completed: bool
```

### main.py

Now let's create the FastAPI app with CRUD endpoints:

```python
# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Todo, TodoCreate, TodoUpdate

app = FastAPI()

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with a database in production)
todos: dict[int, Todo] = {}
next_id = 1

@app.get("/todos", response_model=list[Todo], operation_id="listTodos")
def list_todos():
    """Get all todos"""
    return list(todos.values())

@app.post("/todos", response_model=Todo, operation_id="createTodo")
def create_todo(todo_data: TodoCreate):
    """Create a new todo"""
    global next_id

    todo = Todo(
        id=next_id,
        title=todo_data.title,
        completed=todo_data.completed
    )
    todos[next_id] = todo
    next_id += 1

    return todo

@app.get("/todos/{todo_id}", response_model=Todo, operation_id="getTodo")
def get_todo(todo_id: int):
    """Get a specific todo"""
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todos[todo_id]

@app.put("/todos/{todo_id}", response_model=Todo, operation_id="updateTodo")
def update_todo(todo_id: int, todo_data: TodoUpdate):
    """Update a todo"""
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")

    todo = todos[todo_id]

    if todo_data.title is not None:
        todo.title = todo_data.title
    if todo_data.completed is not None:
        todo.completed = todo_data.completed

    return todo

@app.delete("/todos/{todo_id}", status_code=204, operation_id="deleteTodo")
def delete_todo(todo_id: int):
    """Delete a todo"""
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")

    del todos[todo_id]
```

**Important**: Notice the `operation_id` parameter in each route decorator. This tells FastAPI to use clean function names like `listTodos` and `createTodo` in the OpenAPI spec, instead of auto-generated names like `list_todos_todos_get`. When Orval generates the TypeScript client, it will use these operation IDs as function names, giving us a clean API.

### Start the backend

```bash
uvicorn main:app --reload
```

Your API is now running at `http://localhost:8000`. You can check the auto-generated API docs at `http://localhost:8000/docs` 🎉

### Test the API

Let's test our API endpoints with curl:

```bash
# List all todos (empty at first)
curl http://localhost:8000/todos

# Create a new todo
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn FastAPI", "completed": false}'

# List all todos (should show the one we just created)
curl http://localhost:8000/todos

# Get a specific todo (ID 1)
curl http://localhost:8000/todos/1

# Update a todo
curl -X PUT http://localhost:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a todo
curl -X DELETE http://localhost:8000/todos/1
```

You should see the API responding correctly with JSON data. The OpenAPI spec is also available at `http://localhost:8000/openapi.json` - this is what we'll use to generate our TypeScript client!

## Frontend: SvelteKit SPA

Now let's build the frontend. Create a new SvelteKit project:

```bash
npx sv create frontend
```

Select the following options:
- **Template**: SvelteKit minimal
- **Type checking**: Yes, using TypeScript syntax
- **Add-ons**: prettier
- **Package manager**: npm

### Configure as SPA

The project already comes with `@sveltejs/adapter-auto` which automatically detects your deployment environment. We just need to configure it as a SPA. We can also use static adapter with a fallback page as explained [here](https://svelte.dev/docs/kit/single-page-apps). Some hosting providers require this. 

Create `src/routes/+layout.ts` to configure SPA mode:

```typescript
export const csr = true;        // Enable client-side rendering
export const ssr = false;       // Disable server-side rendering
export const prerender = false; // Disable prerendering
```

This configuration makes it a true Single Page Application - all rendering happens in the browser

### Install Dependencies

```bash
npm install axios
npm install -D orval
```

### Setup Auto-Generated API Client

This is the magic part! Create `orval.config.cjs`:

```javascript
module.exports = {
    default: {
        input: {
            target: 'http://localhost:8000/openapi.json'  // Where to fetch the OpenAPI spec
        },
        output: {
            target: './src/lib/api/gen',                   // Output directory for generated code
            schemas: './src/lib/api/gen/model',            // Separate directory for TypeScript types
            client: 'axios',                               // Use axios for HTTP requests
            mode: 'split',                                 // Generate separate files per endpoint
            clean: true,                                   // Clean output directory before generating
            baseUrl: 'http://localhost:8000'               // Base URL for API requests
        }
    }
};
```

For more configuration options, check out the [Orval documentation](https://orval.dev/).

Add a `generate` script to `package.json`:

```json
{
    "scripts": {
        ...
        "generate": "npx orval --config orval.config.cjs"
    }
}
```

### Generate TypeScript Client

With your backend running, generate the API client:

```bash
npm run generate
```

Output should look like this:

```bash
> frontend@0.0.1 generate
> npx orval --config orval.config.cjs

🍻 Start orval v7.11.2 - A swagger client generator for typescript
default: Cleaning output folder
🎉 default - Your OpenAPI spec has been converted into ready to use orval!
```

This creates `src/lib/api/gen/` directory with fully typed functions for all your API endpoints.

### Build the UI

Create `src/routes/+page.svelte`:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { getFastAPI } from '$lib/api/gen/fastAPI';
    import type { Todo } from '$lib/api/gen/model';

    const api = getFastAPI();

    let todos = $state<Todo[]>([]);
    let newTodoTitle = $state('');
    let loading = $state(false);

    async function loadTodos() {
        loading = true;
        try {
            const response = await api.listTodos();
            todos = response.data;
        } catch (error) {
            console.error('Failed to load todos:', error);
        } finally {
            loading = false;
        }
    }

    async function addTodo() {
        if (!newTodoTitle.trim()) return;

        try {
            const response = await api.createTodo({
                title: newTodoTitle,
                completed: false
            });
            todos = [...todos, response.data];
            newTodoTitle = '';
        } catch (error) {
            console.error('Failed to create todo:', error);
        }
    }

    async function toggleTodo(todo: Todo) {
        try {
            const response = await api.updateTodo(todo.id, {
                completed: !todo.completed
            });
            todos = todos.map((t) =>
                t.id === todo.id ? response.data : t
            );
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    }

    async function removeTodo(id: number) {
        try {
            await api.deleteTodo(id);
            todos = todos.filter((t) => t.id !== id);
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    }

    onMount(() => {
        loadTodos();
    });
</script>

<div class="container">
    <h1>Todo List</h1>

    <div class="add-todo">
        <input
            type="text"
            bind:value={newTodoTitle}
            placeholder="What needs to be done?"
            onkeydown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onclick={addTodo}>Add</button>
    </div>

    {#if loading}
        <p>Loading...</p>
    {:else if todos.length === 0}
        <p class="empty">No todos yet. Add one above!</p>
    {:else}
        <ul class="todo-list">
            {#each todos as todo (todo.id)}
                <li class:completed={todo.completed}>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onchange={() => toggleTodo(todo)}
                    />
                    <span>{todo.title}</span>
                    <button
                        class="delete"
                        onclick={() => removeTodo(todo.id)}
                    >
                        ×
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
    }

    h1 {
        text-align: center;
        color: #333;
    }

    .add-todo {
        display: flex;
        gap: 0.5rem;
        margin: 2rem 0;
    }

    input[type='text'] {
        flex: 1;
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    button {
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }

    button:hover {
        background: #0056b3;
    }

    .todo-list {
        list-style: none;
        padding: 0;
    }

    .todo-list li {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .todo-list li span {
        flex: 1;
    }

    .todo-list li.completed span {
        text-decoration: line-through;
        color: #999;
    }

    .delete {
        background: #dc3545;
        padding: 0.25rem 0.75rem;
        font-size: 1.5rem;
        line-height: 1;
    }

    .delete:hover {
        background: #c82333;
    }

    .empty {
        text-align: center;
        color: #999;
        padding: 2rem;
    }
</style>
```

### Start the frontend

```bash
npm run dev
```

Your app is now running at `http://localhost:5173`! 

## Updating the API

When you make a change in the backend API like adding a new endpoint or changing a model:

```python
class TodoCreate(BaseModel):
    title: str
    completed: bool = False
    priority: str = "medium"  # New field!
```

Just regenerate the client:

```bash
npm run generate
```

TypeScript will now show errors in your frontend until you update the calls to include the new field.

## What We Built

In this tutorial, we:

✅ Created a FastAPI backend with CRUD endpoints
✅ Set up a SvelteKit SPA frontend
✅ Auto-generated TypeScript API client from OpenAPI spec
✅ Built a fully functional todo app with type safety

**Get the complete code**: [GitHub Repository](https://github.com/TurtleDevIO/svelte-spa-fastapi-tutorial)

If you want to see a production-ready version with authentication, multi-tenancy, and Stripe integration, check out [FastSvelte](https://fastsvelte.dev/).

Smooth coding!
