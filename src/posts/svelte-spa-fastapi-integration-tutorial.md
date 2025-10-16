---
title: "Svelte SPA and FastAPI Integration Tutorial"
description: "Learn how to build a simple todo app with Svelte SPA frontend and FastAPI backend, with auto-generated TypeScript API clients for full type safety."
date: "2025-10-15"
categories: ["svelte", "fastapi", "tutorial", "web-development", "typescript", "python"]
published: true
readingTime: 8
---

# Svelte SPA and FastAPI Integration Tutorial

Hey there! 👋 In my [previous post](/blog/why-i-switched-from-sveltekit-ssr-to-spa-fastapi), I talked about why I moved from SvelteKit SSR to a Svelte SPA + FastAPI architecture. Today, I want to show you exactly how to build one.

We'll build a simple **todo list app** to demonstrate how the frontend and backend communicate, and how to keep everything type-safe with auto-generated API clients. No authentication, no complex features—just the essentials.

## Why This Stack?

Before we dive in, here's why this architecture is great:

- **Type Safety**: Changes in backend automatically flow to frontend via generated TypeScript types
- **Clean Separation**: Backend handles data, frontend handles UI
- **Independent Deployment**: Deploy frontend and backend separately
- **Best Tools**: Use Python for backend logic, TypeScript/Svelte for UI

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

Let's start with the backend. Create a `backend` directory and add these files:

### requirements.txt

```txt
fastapi==0.115.0
uvicorn==0.32.0
pydantic==2.9.0
```

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

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

@app.get("/todos", response_model=list[Todo])
def list_todos():
    """Get all todos"""
    return list(todos.values())

@app.post("/todos", response_model=Todo)
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

@app.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    """Get a specific todo"""
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todos[todo_id]

@app.put("/todos/{todo_id}", response_model=Todo)
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

@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    """Delete a todo"""
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")

    del todos[todo_id]
```

### Start the backend

```bash
uvicorn main:app --reload
```

Your API is now running at `http://localhost:8000`. You can check the auto-generated API docs at `http://localhost:8000/docs` 🎉

## Frontend: SvelteKit SPA

Now let's build the frontend. Create a new SvelteKit project:

```bash
npm create svelte@latest frontend
# Choose:
# - Skeleton project
# - TypeScript
# - Add Prettier, ESLint if you want
```

### Configure as SPA

Install the static adapter:

```bash
cd frontend
npm install -D @sveltejs/adapter-static
```

Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-static';

export default {
    kit: {
        adapter: adapter({
            fallback: 'index.html'  // SPA mode
        })
    }
};
```

Create `src/routes/+layout.ts` to disable SSR:

```typescript
export const ssr = false;
export const prerender = true;
```

### Install Dependencies

```bash
npm install axios
npm install -D orval
```

### Setup Auto-Generated API Client

This is the magic part! Create `orval.config.cjs`:

```javascript
module.exports = {
    api: {
        input: 'http://localhost:8000/openapi.json',
        output: {
            target: './src/lib/api/gen/endpoints.ts',
            client: 'axios',
            mode: 'single',
            override: {
                mutator: {
                    path: './src/lib/api/axios.js',
                    name: 'axiosInstance'
                }
            }
        }
    }
};
```

Create the axios instance at `src/lib/api/axios.js`:

```javascript
import Axios from 'axios';

export const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8000'
});
```

Add a script to `package.json`:

```json
{
    "scripts": {
        "dev": "vite dev",
        "build": "vite build",
        "generate": "npx orval --config orval.config.cjs"
    }
}
```

### Generate TypeScript Client

With your backend running, generate the API client:

```bash
npm run generate
```

This creates `src/lib/api/gen/endpoints.ts` with fully typed functions for all your API endpoints!

### Build the UI

Create `src/routes/+page.svelte`:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import {
        listTodos,
        createTodo,
        updateTodo,
        deleteTodo
    } from '$lib/api/gen/endpoints';
    import type { Todo } from '$lib/api/gen/endpoints';

    let todos = $state<Todo[]>([]);
    let newTodoTitle = $state('');
    let loading = $state(false);

    async function loadTodos() {
        loading = true;
        try {
            const response = await listTodos();
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
            const response = await createTodo({
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
            const response = await updateTodo(todo.id, {
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
            await deleteTodo(id);
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

Your app is now running at `http://localhost:5173`! 🎉

## How It All Works Together

Here's the beautiful part:

1. **Backend defines the API**: FastAPI with Pydantic models
2. **OpenAPI spec is auto-generated**: FastAPI creates this at `/openapi.json`
3. **Orval generates TypeScript client**: Run `npm run generate` to create typed functions
4. **Frontend uses typed functions**: Full autocomplete and type checking

When you change a backend model:

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

TypeScript will now show errors in your frontend until you update the calls to include the new field. No more "undefined is not a function" errors!

## What We Built

In this tutorial, we:

✅ Created a FastAPI backend with CRUD endpoints
✅ Set up a SvelteKit SPA frontend
✅ Auto-generated TypeScript API client from OpenAPI spec
✅ Built a fully functional todo app with type safety

## Next Steps

Want to take this further? Here are some ideas:

- **Add a database**: Replace in-memory storage with PostgreSQL using SQLAlchemy
- **Add validation**: Use Pydantic validators for better error messages
- **Add filtering**: Filter todos by completed/pending status
- **Deploy it**: Host backend on Azure Container Apps, frontend on Azure Static Web Apps

If you want to see a production-ready version with authentication, multi-tenancy, and Stripe integration, check out [FastSvelte](https://fastsvelte.dev/)—my open-source SaaS starter kit that uses this exact architecture!

Happy coding! 🚀
