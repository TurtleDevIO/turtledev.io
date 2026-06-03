---
title: 'Full-stack FastAPI Tutorial 1: Project Setup & Tooling'
description: 'Set up a FastAPI project with uv, configure Ruff for code quality, optimize VS Code settings, and manage environment configuration with Pydantic Settings.'
date: '2026-04-03'
categories: ['fastapi', 'python', 'tutorial']
published: true
readingTime: 15
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>

This is the first tutorial in a series where we'll build a full-stack todo application with FastAPI and Svelte (and with other modern frontend frameworks such as React later).

In this tutorial, we'll set up a FastAPI project with modern tooling using `uv` (a fast Python package manager), configure Pydantic Settings for environment management, set up Ruff for linting and formatting, and optimize VS Code workspace settings. In the next tutorial, we'll implement the actual CRUD APIs for our todo application.

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## Prerequisites

Before we start, you'll need:

- **uv installed**: Follow the [installation guide](https://docs.astral.sh/uv/getting-started/installation/)

<Callout type="info">

If Python is already installed on your system, uv will detect and use it automatically. However, uv can also manage Python versions for you - it will install missing Python versions as needed, so you don't even need Python pre-installed to get started.

</Callout>

- **Basic understanding of Python and REST APIs**
- **A terminal and code editor** (we'll use VS Code in this tutorial)

## Project Structure

First, we need to create a folder for the backend and another one for the frontend. For the first few tutorials, we'll be working in the backend folder.

```
fullstack-fastapi-tutorial/
├── backend/                  # FastAPI (all backend tutorials)
├── frontend/                 # SvelteKit SPA
└── README.md
```

Navigate to the backend folder and initialize a new uv project:

```sh
cd backend
uv init --app
```

This initializes a uv project with an application structure. Check the generated `.python-version` and `pyproject.toml` files to see what uv created for you. Now run `uv run main.py` inside the `backend` folder:

```sh
uv run main.py
```

You should see output like this:

```
Using CPython 3.14.0
Creating virtual environment at: .venv
Hello from backend!
```

The virtual environment (`.venv`) was created automatically since this is the first run. If you run `uv run main.py` again, you'll only see "Hello from backend!" on subsequent runs.

## Installing FastAPI

Now let's add FastAPI as a dependency:

```sh
uv add "fastapi[standard]"
```

The `[standard]` extra includes recommended dependencies like `uvicorn` (ASGI server), `pydantic-settings`, and `python-multipart` for file uploads. This gives you everything you need for most FastAPI applications.

Now let's write a minimal FastAPI application. Replace the code in `main.py` with this:

```py
# src/backend/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

```sh
uv run fastapi dev main.py
```

You should see logs similar to:

```sh
  FastAPI   Starting development server 🚀

             Searching for package file structure from directories with __init__.py files
             Importing from /home/harun/workspace/fullstack-fastapi-tutorial/backend

    module   🐍 main.py

      code   Importing the FastAPI app object from the module with the following code:

             from main import app

       app   Using import string: main:app

    server   Server started at http://127.0.0.1:8000
    server   Documentation at http://127.0.0.1:8000/docs

       tip   Running in development mode, for production use: fastapi run

             Logs:

      INFO   Will watch for changes in these directories: ['.../fullstack-fastapi-tutorial/backend']
      INFO   Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
      INFO   Started reloader process [41080] using WatchFiles
      INFO   Started server process [41094]
      INFO   Waiting for application startup.
      INFO   Application startup complete.
      INFO   127.0.0.1:58782 - "GET / HTTP/1.1" 200
      INFO   127.0.0.1:58782 - "GET /favicon.ico HTTP/1.1" 404
```

Now if you go to [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser, you should see the JSON response from our API.

```json
{ "message": "Hello World" }
```

Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to see the auto-generated Swagger/OpenAPI documentation.

Also notice the "Will watch for changes in these directories" line in the logs above. This means any changes you make to your Python files will automatically restart the server. This is called **"hot-reload"**.

## Testing Your API with HTTP Files

Instead of using tools like Postman or cURL commands, we'll use `.http` files to test our API. These files let you define and execute HTTP requests directly in VS Code, live in version control, serve as executable documentation, and work great with AI coding assistants.

First, install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for VS Code.

Create a new `http/` folder in your backend directory and add a `test.http` file:

```
backend/
├── http/
│   └── test.http    # API test requests
├── main.py
├── settings.py
└── ...
```

Add the following to `http/test.http`:

```http
### Get root endpoint
GET http://localhost:8000/
```

In VS Code, you'll see a "Send Request" link appear above the request. Click it to execute the request, and you'll see the response in a split pane:

```json
HTTP/1.1 200 OK
content-length: 65
content-type: application/json

{
  "message": "Hello World! Welcome to FastAPI Backend."
}
```

The `###` comment syntax lets you define multiple requests in the same file. As we build our todo API, we'll add more requests here.

## Environment Configuration

Let's set up project settings using a `.env` file with [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings) for type-safe configuration management.

Create a `settings.py` file:

```py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    project_name: str = "FastAPI Backend" # Default/fallback value


settings = Settings()

```

And update the `main.py` to use this setting.

```py
from fastapi import FastAPI

from settings import settings

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": f"Hello World! Welcome to {settings.project_name}."}

```

The `model_config` tells Pydantic Settings where to read configuration from. In our case, it's the `.env` file.

### Creating Environment Files

Create a `.env.example` file:

```
PROJECT_NAME=FastAPI Backend  # Name of the project, used in the welcome message.
```

While `.env` is gitignored, `.env.example` is committed to the repository. Never put secrets in `.env.example` - its purpose is to show other developers what environment variables are needed and provide safe default values.

Copy `.env.example` to `.env` - this will hold your actual configuration:

```
PROJECT_NAME=FastAPI Backend
```

Now go to [http://127.0.0.1:8000](http://127.0.0.1:8000) and you should see the config in the message.

```json
{ "message": "Hello World! Welcome to TurtleDev FastAPI Tutorial." }
```

Pydantic Settings will also read environment variables directly from your shell. For example, running `export PROJECT_NAME="My Project"` will set `settings.project_name` even without a `.env` file. This is typically how configuration works in production environments like staging or prod.

## Setting Up Code Quality Tools

Let's add Ruff for linting and formatting. Ruff is an extremely fast Python linter and formatter written in Rust that replaces tools like Black, isort, flake8, and more.

Add Ruff as a dev dependency to the project:

```sh
uv add --dev ruff
```

Verify that dev dependencies have a separate section in `pyproject.toml`:

```toml
[dependency-groups]
dev = [
    "ruff>=0.15.8",
]
```

### Configuring Ruff

You can now run `ruff check .` to lint your code and `ruff format .` to format it. Let's add project-specific linting and formatting rules to `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100

[tool.ruff.lint]
extend-select = ["I"]

[tool.ruff.format]
quote-style = "double"
```

### VS Code Integration

Running `ruff check . --fix` will automatically fix linting and formatting errors. But in VS Code, we can make this even easier. Install the [Ruff VS Code extension](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff) and add the following workspace settings to `.vscode/settings.json`:

```json
{
	"[python]": {
		"editor.formatOnSave": true,
		"editor.codeActionsOnSave": {
			"source.fixAll": "explicit",
			"source.organizeImports": "explicit"
		},
		"editor.defaultFormatter": "charliermarsh.ruff"
	}
}
```

While the VS Code extension is convenient, you can always run `ruff check .` and `ruff format .` from the terminal. This is useful for developers not using VS Code and for running Ruff in CI/CD pipelines (we'll set up GitHub Actions in a future tutorial).

Another important setting to add is `python.defaultInterpreterPath`. This ensures VS Code recognizes the correct virtual environment and Python interpreter on any machine:

```json
{
	"[python]": {
		"editor.formatOnSave": true,
		"editor.codeActionsOnSave": {
			"source.fixAll": "explicit",
			"source.organizeImports": "explicit"
		},
		"editor.defaultFormatter": "charliermarsh.ruff"
	},
	"python.defaultInterpreterPath": "${workspaceFolder}/backend/.venv/bin/python"
}
```

See the [Ruff VS Code documentation](https://github.com/astral-sh/ruff-vscode?tab=readme-ov-file#settings) for more configuration options.

Since Ruff handles both linting and formatting, you can disable or uninstall other Python linter/formatter extensions (like pylint, autopep8, Black, etc.) to avoid conflicts and redundancy.

## Managing .gitignore Files

Each folder will have its own `.gitignore` file for its specific needs. For example, the backend folder should have a `.gitignore` that ignores `.venv/`, `.env`, `__pycache__/`, and `*.pyc` files. We can also add another `.gitignore` to the root directory if needed.

## Next Steps

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

We've completed the initial project setup! In the [next tutorial](/blog/fastapi-tutorial-2-todo-crud-api), we'll implement the actual CRUD APIs for our todo application.

<Callout type="tip">

Source code for this tutorial: [GitHub](https://github.com/TurtleDevIO/fullstack-fastapi-tutorial/tree/01-backend-setup)

</Callout>

Smooth Coding!
