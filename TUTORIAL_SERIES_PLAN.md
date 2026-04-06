# Todo App Tutorial Series: SvelteKit SPA + FastAPI

A progressive tutorial series teaching full-stack development with modern patterns. Each tutorial has an accompanying YouTube video and builds on the previous one.

## Series Overview

**Target Audience:** Developers who want to learn full-stack development with modern patterns
**End Product:** A todo app with authentication, CRUD operations, and polished UX
**Marketing Goal:** Showcase patterns used in [FastSvelte](https://fastsvelte.dev/)

### Repository

**Monorepo:** `fullstack-fastapi-tutorial`

```
fullstack-fastapi-tutorial/
├── backend/                  # FastAPI (all backend tutorials)
├── frontend/                 # SvelteKit SPA (initial frontend)
├── frontend-react/           # React SPA (future)
├── frontend-vue/             # Vue SPA (future)
└── README.md
```

### YouTube Playlists

Videos are reusable across playlists. Backend videos appear in all full-stack playlists.

| Playlist | Videos |
|----------|--------|
| SvelteKit & FastAPI Full Stack | FastAPI 1-4 + SvelteKit SPA 1-4 |
| React & FastAPI Full Stack | FastAPI 1-4 + React SPA 1-4 (future) |
| Vue & FastAPI Full Stack | FastAPI 1-4 + Vue SPA 1-4 (future) |

### Branch & Video Naming

| Branch | YouTube Title |
|--------|---------------|
| `01-backend-setup` | FastAPI Tutorial 1: Project Setup & Dev Environment |
| `02-backend-crud` | FastAPI Tutorial 2: Building the Todo CRUD API |
| `03-backend-auth` | FastAPI Tutorial 3: Session Authentication |
| `04-backend-user-todos` | FastAPI Tutorial 4: User Data Isolation |
| `05-backend-testing` | FastAPI Tutorial 5: Testing with Pytest |
| `06-backend-docker` | FastAPI Tutorial 6: Dockerizing the API |
| `07-frontend-setup` | SvelteKit SPA Tutorial 1: Setup with Orval |
| `08-frontend-crud` | SvelteKit SPA Tutorial 2: Building the CRUD UI |
| `09-frontend-auth` | SvelteKit SPA Tutorial 3: Authentication Flow |
| `10-frontend-validation` | SvelteKit SPA Tutorial 4: Form Validation & Polish |

---

# Part 1: Backend (FastAPI)

Complete the backend first. This becomes the reusable API for all frontend implementations.

---

## Tutorial 1: Project Setup & Todo CRUD API

**Branch:** `01-backend-crud`
**YouTube:** FastAPI Tutorial 1: Project Setup & CRUD API
**Estimated Read Time:** 20 min
**Video Length:** ~15 min

### Learning Outcomes
- Set up a FastAPI project with proper structure
- Create CRUD endpoints for todos
- Understand Pydantic models for request/response validation
- Configure CORS for frontend communication

### Key Topics
- Install and use `uv` for Python package management
- FastAPI project initialization with `uv init --app`
- Pydantic models (TodoCreate, TodoUpdate, Todo)
- OpenAPI spec with meaningful `operation_id`s
- CORS middleware configuration
- Testing endpoints with curl

### End State
Working FastAPI backend with todo CRUD endpoints (in-memory storage)

---

## Tutorial 2: Simple Authentication

**Branch:** `02-backend-auth`
**YouTube:** FastAPI Tutorial 2: Session Authentication
**Estimated Read Time:** 20 min
**Video Length:** ~12 min

> **Note:** This is a simplified auth implementation for learning purposes. For production apps, use [FastSvelte](https://fastsvelte.dev/) or established auth libraries.

### Learning Outcomes
- Understand session-based authentication concepts
- Implement login/logout/signup endpoints
- Protect routes with dependency injection
- Use HTTP-only cookies for session storage

### Key Topics
- Why HTTP-only cookies (XSS protection basics)
- Session tokens with `secrets.token_urlsafe()`
- Setting cookies (httponly, samesite)
- FastAPI `Depends()` for route protection
- Simple password hashing (bcrypt)
- In-memory user/session storage

### End State
Backend with working auth endpoints (signup, login, logout, me)

---

## Tutorial 3: User-Specific Todos

**Branch:** `03-backend-user-todos`
**YouTube:** FastAPI Tutorial 3: User Data Isolation
**Estimated Read Time:** 15 min
**Video Length:** ~10 min

### Learning Outcomes
- Associate todos with authenticated users
- Implement data isolation on backend
- Understand the "never trust the client" principle

### Key Topics
- Adding `user_id` to todo model
- Protecting todo endpoints with `get_current_user`
- Filtering todos by current user in all operations
- Data isolation pattern (always check user_id)

### End State
Complete backend - todos are user-specific and protected

---

## Tutorial 4: Error Handling

**Branch:** `04-backend-errors`
**YouTube:** FastAPI Tutorial 4: Error Handling
**Estimated Read Time:** 15 min
**Video Length:** ~10 min

### Learning Outcomes
- Design consistent error responses
- Create custom exception classes
- Understand error codes vs HTTP status codes

### Key Topics
- `AppException` base class with error codes
- Specific exceptions (NotFound, Unauthorized, ValidationError)
- Global exception handler
- Consistent error response format
- Meaningful error codes for frontend handling

### End State
Backend with structured error handling ready for any frontend

---

# Part 2: Frontend (SvelteKit)

Build the SvelteKit SPA using the completed backend.

---

## Tutorial 5: SvelteKit SPA Setup

**Branch:** `05-frontend-setup`
**YouTube:** SvelteKit SPA Tutorial 1: Setup with Orval
**Estimated Read Time:** 15 min
**Video Length:** ~10 min

### Learning Outcomes
- Configure SvelteKit as a pure SPA (no SSR)
- Auto-generate TypeScript API client with Orval
- Understand the frontend-backend communication flow

### Key Topics
- SvelteKit SPA configuration (`ssr: false`, `csr: true`)
- Orval configuration and code generation
- Axios setup with `withCredentials: true`
- Type-safe API calls from generated client

### End State
SvelteKit project configured as SPA with auto-generated API client

---

## Tutorial 6: Todo CRUD UI

**Branch:** `06-frontend-crud`
**YouTube:** SvelteKit SPA Tutorial 2: Building the CRUD UI
**Estimated Read Time:** 20 min
**Video Length:** ~15 min

### Learning Outcomes
- Build reactive UI with Svelte 5 runes (`$state`)
- Implement all CRUD operations
- Handle loading and error states

### Key Topics
- Svelte 5 `$state` for local component state
- List rendering with `{#each}`
- Form handling (input binding, submit)
- Loading states and empty states
- Basic error handling with try/catch

### End State
Fully functional todo UI (no auth yet - all todos visible)

---

## Tutorial 7: Authentication UI

**Branch:** `07-frontend-auth`
**YouTube:** SvelteKit SPA Tutorial 3: Authentication Flow
**Estimated Read Time:** 25 min
**Video Length:** ~15 min

### Learning Outcomes
- Build a reactive auth store with Svelte 5 runes
- Implement protected routes with SvelteKit layouts
- Handle authentication flow (login, logout, session validation)

### Key Topics
- Auth store class with `$state` runes
- `ensureAuthenticated()` function with caching
- Route groups for protected pages `(protected)/`
- Login/signup forms
- Global 401 handling with axios interceptors
- Redirect after login/logout

### End State
Complete auth flow - users can sign up, log in, and access protected todo page

---

## Tutorial 8: Form Validation & Polish

**Branch:** `08-frontend-validation`
**YouTube:** SvelteKit SPA Tutorial 4: Form Validation & Polish
**Estimated Read Time:** 20 min
**Video Length:** ~12 min

### Learning Outcomes
- Implement client-side validation with Zod
- Create reusable form validation utility
- Handle errors gracefully with user feedback

### Key Topics
- Zod schema definition
- `useFormValidation` utility pattern
- Real-time validation on input change
- Displaying field-level errors
- Toast notifications for API errors
- UX best practices

### End State
Polished todo app with validation and error handling

---

## Series Wrap-Up Post (No Code)

**No branch - blog post only**

A summary post covering:
- What we built across all tutorials
- Architecture overview diagram
- Links to all tutorials and branches
- What's missing for production:
  - Database persistence
  - Password reset / email verification
  - OAuth providers
  - Role-based access control
  - Rate limiting
- FastSvelte CTA - get all of this production-ready

---

## Repository Structure (Final)

```
fullstack-fastapi-tutorial/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── auth.py
│   ├── exceptions.py
│   ├── pyproject.toml          # uv project config
│   └── uv.lock                 # uv lockfile
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── (protected)/
│   │   │   │   ├── +layout.svelte
│   │   │   │   └── todos/
│   │   │   └── +layout.ts
│   │   └── lib/
│   │       ├── api/
│   │       │   ├── gen/              # Auto-generated by Orval
│   │       │   └── axios-config.ts
│   │       ├── auth/
│   │       │   ├── auth.svelte.ts
│   │       │   └── session.ts
│   │       └── util/
│   │           └── useFormValidation.svelte.ts
│   ├── orval.config.cjs
│   └── package.json
├── frontend-react/               # Future
├── frontend-vue/                 # Future
└── README.md
```

---

## Key Differentiators

1. **SPA-first approach** - Most tutorials use SSR; we show SPA + API architecture
2. **Reusable backend** - Same API for SvelteKit, React, Vue tutorials
3. **Auto-generated API client** - Orval from OpenAPI spec, not manual axios calls
4. **HTTP-only cookie auth** - Secure sessions, not JWT in localStorage
5. **Svelte 5 runes** - Modern `$state` patterns, not legacy stores
6. **Progressive complexity** - Each tutorial builds on the last with clear branches
7. **YouTube companion** - Video for each tutorial

---

## Content Guidelines

### Writing Style
- Conversational, friendly tone
- Explain the "why" behind decisions
- Keep code focused - skip boilerplate/CSS unless relevant
- Link to full source in GitHub branch

### Each Tutorial Structure
1. **Introduction** (~50 words) - What we're building, FastSvelte callout
2. **Prerequisites** - Link to previous branch, tools needed
3. **Main Content** (~15-20 min read) - Step-by-step with explanations
4. **Wrap Up** - Summary, GitHub link, FastSvelte CTA, next tutorial link

### Auth Disclaimer
Every auth-related tutorial should include:
> This is a simplified implementation for learning. For production apps, use [FastSvelte](https://fastsvelte.dev/) or established auth libraries with proper security measures.

---

## Future Frontend Series

Using the same `backend/` in the monorepo. Backend videos (FastAPI Tutorial 1-4) are reused in all playlists.

### React Series (in `frontend-react/`)

| Branch | YouTube Title |
|--------|---------------|
| `09-react-setup` | React SPA Tutorial 1: Setup with TanStack Query |
| `10-react-crud` | React SPA Tutorial 2: Building the CRUD UI |
| `11-react-auth` | React SPA Tutorial 3: Authentication Flow |
| `12-react-validation` | React SPA Tutorial 4: Form Validation & Polish |

### Vue Series (in `frontend-vue/`)

| Branch | YouTube Title |
|--------|---------------|
| `13-vue-setup` | Vue SPA Tutorial 1: Setup with Pinia |
| `14-vue-crud` | Vue SPA Tutorial 2: Building the CRUD UI |
| `15-vue-auth` | Vue SPA Tutorial 3: Authentication Flow |
| `16-vue-validation` | Vue SPA Tutorial 4: Form Validation & Polish |

### Other Ideas
- **TanStack Query variant** - Replace Orval with TanStack Query in SvelteKit
- **Database tutorial** - Add SQLite/PostgreSQL to backend
- **Deployment** - Deploy to Railway/Fly.io/Vercel
