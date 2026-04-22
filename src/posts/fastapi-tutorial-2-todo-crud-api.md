---
title: 'Full-stack FastAPI Tutorial 2: Building the Todo CRUD API'
description: 'Build a complete REST API for a todo app with FastAPI. Learn Pydantic models, in-memory storage, PUT vs PATCH, CORS configuration, and OpenAPI operation IDs.'
date: '2026-04-22'
categories: ['fastapi', 'python', 'tutorial']
published: true
readingTime: 18
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>

Welcome back! In [Tutorial 1](/blog/fastapi-tutorial-1-project-setup-crud-api) we set up our FastAPI project with `uv`, Pydantic Settings, Ruff, and VS Code tooling. Now it's time to actually build the CRUD API for our todo app.

By the end of this tutorial, you'll have a fully working REST API with endpoints to create, read, update, and delete todos. We'll also wire up CORS so our frontend can talk to it.

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## Prerequisites

- Completed [Tutorial 1](/blog/fastapi-tutorial-1-project-setup-crud-api) or cloned the [01-backend-setup branch](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/01-backend-setup)
- Basic familiarity with REST API concepts (GET, POST, PUT, DELETE)

## One Small Structure Change

Before we write any API code, let's move the existing files into an `app/` subfolder. Grouping all application code under one folder clearly separates what ships to production from project tooling like tests, HTTP files, and config — and gives us a natural place to add more modules as the project grows.

```sh
mkdir app tests # We will be adding tests in a later tutorial.
mv main.py settings.py app/
```

Your backend folder should now look like this:

```
backend/
├── app/
│   ├── routes/
│   │   ├── ping_route.py
│   │   └── todo_route.py
│   ├── main.py
│   ├── models.py
│   └── settings.py
├── tests/
├── http/
└── pyproject.toml
```

We also move the root `GET /` endpoint from Tutorial 1 into its own `app/routes/ping_route.py` with the path `/ping`. Every route lives in a dedicated file under `routes/` — `main.py` only wires things together.

Notice that we don't use `__init__.py`. Python's namespace packages (available since Python 3.3) handle imports just fine without it, and skipping it avoids circular import traps and hidden side effects that `__init__.py` files tend to introduce as the codebase grows. Frankly, I also don't like seeing them cluttering up every folder in the file tree.

We use absolute imports everywhere (`from app.models import Todo`) rather than relative ones (`from .models import Todo`). They're more explicit and easier to read — you always know exactly where something comes from without having to mentally resolve `..` chains.

Let's start the dev server with `uvicorn`:

```sh
uv run uvicorn app.main:app --reload
```

## Designing the Todo Model

Before writing any endpoints, let's think about what a todo item actually looks like. At minimum we need:

- **id** - unique identifier
- **title** - the text of the todo
- **completed** - whether it's done
- **created_at** - when it was created (useful for sorting)

For creating a todo, we only need the title - the server generates the id and timestamps. For updating, we might want to change the title, the completed status, or both.

This leads us to three separate Pydantic models. Create `app/models.py`:

```py
from datetime import datetime

from pydantic import BaseModel


class TodoCreate(BaseModel):
    title: str


class TodoUpdate(BaseModel):
    title: str
    completed: bool


class TodoPatch(BaseModel):
    title: str | None = None
    completed: bool | None = None


class Todo(BaseModel):
    id: int
    title: str
    completed: bool
    created_at: datetime
```

Here's the thinking behind the split:

- **`TodoCreate`** - what the client sends when creating a todo. Just a title.
- **`TodoUpdate`** - used for `PUT` requests. Both fields are required because `PUT` replaces the entire resource.
- **`TodoPatch`** - used for `PATCH` requests. Both fields are optional because `PATCH` applies partial updates.
- **`Todo`** - the full representation we send back to the client. Includes server-generated fields like `id` and `created_at`.

### PUT vs PATCH - what's the difference?

`PUT` replaces the resource entirely so all fields are required, while `PATCH` applies a partial update so all fields are optional.

## In-Memory Storage

For now, we'll use a Python dictionary to store todos. This means data is lost when the server restarts, but it keeps our API code focused on the HTTP layer. We'll add a real database in a future tutorial.

In `app/routes/todo_route.py`, add the storage at the top of the file:

```py
todos: dict[int, Todo] = {}
next_id = 1
```

Using a dict keyed by ID gives us O(1) lookups by ID. The `next_id` variable is our simple auto-increment mechanism.

## Building the Endpoints

We keep the routes in a separate `app/routes/todo_route.py` file. This keeps `main.py` clean — it only handles app setup and wiring — and makes it easy to add more resource types later (auth routes, user routes, etc.).

### GET /todos

Let's start with the simplest endpoint to introduce the pattern:

```py
from fastapi import APIRouter, HTTPException

from app.models import Todo, TodoCreate, TodoPatch, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])

todos: dict[int, Todo] = {}
next_id = 1


@router.get("", response_model=list[Todo], operation_id="get_todos")
def get_todos():
    return list(todos.values())


@router.get("/{todo_id}", response_model=Todo, operation_id="get_todo")
def get_todo(todo_id: int):
    todo = todos.get(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
```

`APIRouter` works just like the main `app` object but for a subset of routes. The `prefix="/todos"` means we write `""` and `"/{todo_id}"` instead of repeating `/todos` on every endpoint. The `response_model` tells FastAPI what shape to serialize the response to — it strips any extra fields and validates the output.

### Wiring it up in main.py

```py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.todo_route import router as todo_router
from app.settings import settings

app = FastAPI(title=settings.project_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo_router)
```

`include_router` registers all the routes from `todo_route.py` onto the main app. This is how FastAPI keeps large applications organized — each resource gets its own router file, and `main.py` just wires them together.

Start the server and try it out:

```sh
curl http://localhost:8000/todos
```

```json
[]
```

Empty for now — let's add some todos.

### Create: POST /todos

```py
@router.post("", response_model=Todo, status_code=201, operation_id="create_todo")
def create_todo(body: TodoCreate):
    global next_id
    todo = Todo(
        id=next_id,
        title=body.title,
        completed=False,
        created_at=datetime.now(timezone.utc),
    )
    todos[next_id] = todo
    next_id += 1
    return todo
```

```sh
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'
```

```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": false,
  "created_at": "2026-04-22T10:00:00Z"
}
```

A few things worth noting here:

- `status_code=201` - successful POST requests should return 201 Created, not 200 OK. The 201 tells the client that a new resource was created.
- `datetime.now(timezone.utc)` - always store timestamps in UTC. Never store local time - it causes headaches when your server or users are in different timezones.
- We set `completed=False` on the server side. When creating a todo, it should always start as incomplete - we don't let the client set this.

### Partial Update: PATCH /todos/:id

The PATCH implementation is the most interesting:

```py
patch_data = body.model_dump(exclude_unset=True)
updated = todo.model_copy(update=patch_data)
```

`exclude_unset=True` is the key here. It tells Pydantic to only include fields the client actually sent, not fields that defaulted to `None`. So if the client sends `{"completed": true}`, `patch_data` will be `{"completed": True}` - not `{"completed": True, "title": None}`. Then `model_copy(update=patch_data)` creates a new Todo with only those fields changed.

```sh
curl -X PATCH http://localhost:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": true,
  "created_at": "2026-04-22T10:00:00Z"
}
```

Only `completed` changed — `title` stayed the same.

### Delete: DELETE /todos/:id

```py
@router.delete("/{todo_id}", status_code=204, operation_id="delete_todo")
def delete_todo(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    del todos[todo_id]
```

Notice there's no `return` statement. A successful DELETE returns `204 No Content` - the response body is empty by convention. FastAPI handles this automatically when `status_code=204`.

```sh
curl -X DELETE http://localhost:8000/todos/1
# 204 No Content — no response body
```

### Operation IDs

You might have noticed `operation_id="get_todos"` on each endpoint. FastAPI generates these automatically if you don't set them, but auto-generated IDs look like `get_todos_todos_get` - ugly and fragile (they change when you rename the function).

Setting explicit, clean operation IDs matters because they become the function names when you auto-generate API clients from the OpenAPI spec - which is exactly what we'll do in Tutorial 3 with Orval.

## CORS Configuration

CORS (Cross-Origin Resource Sharing) controls which domains can make requests to your API. Without it, your frontend running on `localhost:5173` would be blocked from calling your API on `localhost:8000`.

```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

We're pulling `allowed_origins` from settings so it can be configured per environment. Update `app/settings.py`:

```py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    project_name: str = "FastAPI Backend"
    allowed_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
```

The default allows `localhost:5173` (the default SvelteKit dev server port) for local development. In production you'd override this with your actual frontend domain via environment variable.


<Callout type="info">

`allow_credentials=True` is required when your frontend sends cookies or auth headers. We'll need this in the authentication tutorial.

</Callout>

## Testing with HTTP Files

Create `http/todos.http` in your backend folder:

```http
### Create a todo
POST http://localhost:8000/todos
Content-Type: application/json

{"title": "Buy groceries"}

### Create another todo
POST http://localhost:8000/todos
Content-Type: application/json

{"title": "Write blog post"}

### Get all todos
GET http://localhost:8000/todos

### Get a single todo
GET http://localhost:8000/todos/1

### Update a todo (PUT - replaces the entire resource)
PUT http://localhost:8000/todos/1
Content-Type: application/json

{"title": "Buy groceries and cook dinner", "completed": false}

### Toggle completed (PATCH - partial update)
PATCH http://localhost:8000/todos/1
Content-Type: application/json

{"completed": true}

### Delete a todo
DELETE http://localhost:8000/todos/1

### Get a todo that doesn't exist (404)
GET http://localhost:8000/todos/999
```

Start the server and run through these requests:

```sh
uv run uvicorn app.main:app --reload
```

If you haven't set up the REST Client extension yet, check [Tutorial 1](/blog/fastapi-tutorial-1-project-setup-crud-api#testing-your-api-with-http-files) where we covered it.

Try them in order. After creating two todos, GET /todos should return both. After patching todo 1, only `completed` should change - `title` stays the same. The 404 request at the end should return:

```json
{"detail": "Todo not found"}
```

### Interactive Docs

FastAPI generates interactive Swagger docs at [http://localhost:8000/docs](http://localhost:8000/docs). You can test all endpoints directly in the browser. Notice how the operation IDs we set appear as clean names in the docs.

## What's Next

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

We now have a fully working CRUD API and a clean project structure ready for growth. Next up, we'll switch to the frontend and set up a SvelteKit SPA that auto-generates a type-safe API client from our OpenAPI spec using Orval.

<Callout type="tip">

Source code for this tutorial: [GitHub](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/02-backend-crud)

</Callout>

Smooth Coding!
