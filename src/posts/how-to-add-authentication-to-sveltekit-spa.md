---
title: "How to Add Authentication to a SvelteKit SPA"
description: "Learn how to implement authentication in a SvelteKit SPA with HTTP-only cookies, reactive auth state, and protected routes using a clean, straightforward approach."
date: "2025-10-22"
categories: ["svelte", "authentication", "security", "tutorial", "web-development", "typescript", "spa"]
published: true
readingTime: 30
---

# How to Add Authentication to a SvelteKit SPA

Building on our [previous tutorial](/blog/how-to-build-sveltekit-spa-with-fastapi-backend) where we created a SvelteKit SPA with a FastAPI backend, let's add authentication to our application.

> **Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready SvelteKit boilerplate with authentication, payments, and more built-in.

This tutorial demonstrates a minimal authentication implementation for learning purposes, covering:

- HTTP-only cookie-based sessions
- Reactive auth state management with Svelte 5 runes
- Protected routes with automatic redirects
- Optimized auth checks with caching

> **Note**: This is a tutorial project for learning concepts. For production applications, use solutions like [FastSvelte](https://fastsvelte.dev), Auth.js, Lucia, or your backend framework's authentication library.

> **[Complete source code available on GitHub](https://github.com/TurtleDevIO/sveltekit-spa-authentication)**

## Prerequisites

- Completed the [SvelteKit SPA with FastAPI tutorial](/blog/how-to-build-sveltekit-spa-with-fastapi-backend) or have a similar setup
- Basic understanding of SvelteKit and FastAPI
- Familiarity with Svelte 5 runes (`$state`, `$effect`)

## Authentication Flow

Our authentication system uses HTTP-only cookies for secure session management. Here's how the complete flow works:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LOGIN FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

Browser                    SvelteKit Frontend              FastAPI Backend
   │                              │                              │
   │  1. Enter credentials        │                              │
   │  ──────────────────────────> │                              │
   │                              │                              │
   │                              │  2. POST /auth/login         │
   │                              │  {email, password}           │
   │                              │  ──────────────────────────> │
   │                              │                              │
   │                              │                              │  3. Validate
   │                              │                              │     credentials
   │                              │                              │
   │                              │  4. Set-Cookie: session=xxx  │
   │                              │     (HTTP-only, SameSite)    │
   │                              │  <────────────────────────── │
   │                              │                              │
   │  5. Cookie stored            │                              │
   │  <────────────────────────── │                              │
   │     (inaccessible to JS)     │                              │
   │                              │                              │
   │  6. Redirect to /welcome     │                              │
   │  <────────────────────────── │                              │
   │                              │                              │
```

**Step-by-step breakdown:**

1. User enters their email and password in the login form
2. Frontend sends credentials to the backend's `/auth/login` endpoint
3. Backend validates the credentials against the user database (inmemory for this tutorial).
4. Backend creates a session token and sends it back as an HTTP-only cookie
5. Browser automatically stores the cookie (JavaScript cannot access it due to `httponly` flag)
6. Frontend redirects the user to the dashboard/welcome page

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATED REQUEST                           │
└─────────────────────────────────────────────────────────────────────┘

Browser                    SvelteKit Frontend              FastAPI Backend
   │                              │                              │
   │  1. Navigate to /todos       │                              │
   │  ──────────────────────────> │                              │
   │                              │                              │
   │                              │  2. GET /users/me            │
   │                              │     Cookie: session=xxx      │
   │                              │  ──────────────────────────> │
   │                              │                              │
   │                              │                              │  3. Validate
   │                              │                              │     session
   │                              │                              │
   │                              │  4. {id, email, ...}         │
   │                              │  <────────────────────────── │
   │                              │                              │
   │  5. Update auth store        │                              │
   │  <────────────────────────── │                              │
   │                              │                              │
   │  6. GET /todos               │                              │
   │     Cookie: session=xxx      │                              │
   │  ──────────────────────────────────────────────────────────> │
   │                              │                              │
   │                              │                              │  7. Validate
   │                              │                              │     session
   │                              │                              │
   │  8. Todo list data           │                              │
   │  <────────────────────────────────────────────────────────── │
   │                              │                              │
```

**Step-by-step breakdown:**

1. User navigates to a protected route (e.g., `/todos`)
2. Frontend calls `/users/me` to verify authentication; browser automatically includes the session cookie
3. Backend validates the session token from the cookie
4. Backend returns the authenticated user's information
5. Frontend updates the auth store with user data, marking them as authenticated
6. Browser requests the todo list; session cookie is automatically sent
7. Backend validates the session token again (every protected endpoint validates the session)
8. Backend returns the todo data for the authenticated user

### Key Security Features to Keep in Mind

Before we dive into the code, here are the important security concepts we're implementing:

**HTTP-only Cookies**: We store session tokens in HTTP-only cookies, which makes them completely inaccessible to JavaScript. This is your first line of defense against XSS attacks - even if malicious JavaScript somehow runs on your site, it can't steal the session token.

**SameSite Protection**: We use `SameSite=Lax` during development (allows cookies on redirects, which is handy for testing). In production, you'd want `SameSite=Strict` for maximum CSRF protection - this ensures cookies are only sent for same-site requests.

**Credentials Configuration**: Axios needs to know it should send cookies with cross-origin requests. We configure `withCredentials: true` globally so every API call automatically includes our session cookie.

**Session Validation on Every Request**: Here's a critical principle - never trust the client. Every single protected endpoint validates the session cookie before processing the request. The frontend auth state is just for UX; real security happens on the backend.

---

## Backend Implementation

> **Quick note**: This backend is intentionally minimal - it's just here to demonstrate the SvelteKit SPA authentication flow. We're using in-memory storage, plain-text passwords, and other shortcuts you'd never use in production. The focus of this tutorial is the frontend auth implementation.

Our backend does three key things:

**1. Creates sessions when users log in**

```python
@app.post("/auth/login")
def login(request: LoginRequest, response: Response):
    user_data = MOCK_USERS.get(request.email)

    if not user_data or user_data["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create session token
    token = create_session(user_data["id"])

    # Set HTTP-only cookie
    set_session_cookie(response, token)

    return LoginSuccess(user_id=user_data["id"], email=request.email)
```

When login succeeds, we generate a cryptographically secure token and store the session:

```python
def create_session(user_id: int) -> str:
    """Create a new session and return the token"""
    token = secrets.token_urlsafe(32)
    sessions[token] = user_id  # In-memory dict for this tutorial
    return token
```

The `secrets.token_urlsafe(32)` generates a 32-byte random token that's safe for URLs and cookies - it's unpredictable and impossible to guess. This is way better than using `random` or `uuid`, which aren't cryptographically secure.

In a real application, you'd save this session to your database instead of an in-memory dictionary. That way sessions persist across server restarts and can be managed (e.g., expired, revoked).

Then we send it as an HTTP-only cookie:

```python
def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=3600,  # 1 hour
        path="/"
    )
```

**2. Validates sessions on protected endpoints**

```python
@app.get("/todos")
def list_todos(user: User = Depends(get_current_user)):
    return list(todos.values())
```

The `Depends(get_current_user)` dependency extracts the session cookie, validates it, and returns the user - or raises a 401 if invalid:

```python
def get_current_user(request: Request) -> User:
    """Dependency to get current authenticated user"""
    token = request.cookies.get("session")

    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = sessions[token]
    # Look up user from database and return User object
    # ...
```

This runs automatically before every protected endpoint. If the session is invalid, the endpoint never executes - FastAPI returns 401 immediately.

**3. Clears sessions on logout**

```python
@app.post("/auth/logout", status_code=204)
def logout(request: Request, response: Response, user: User = Depends(get_current_user)):
    token = get_session_token(request)
    if token:
        invalidate_session(token)
    clear_session_cookie(response)
```

The important part for the frontend is how we configure CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,  # Critical: allows cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

That `allow_credentials=True` is essential - without it, the browser won't send or receive cookies in cross-origin requests.

---

## Frontend Implementation

Now for the fun part - building a clean, reactive authentication system for our SvelteKit SPA. Since we're building a pure client-side app (no SSR), we have full control over the auth flow. We'll break this into three pieces: configuring axios, creating an auth store, and managing sessions.

### Step 1: Configure Axios to Send Cookies

Remember those HTTP-only cookies the backend sends? By default, axios won't include them in requests. We need to tell it to send credentials:

```typescript
// lib/api/axios-config.ts
import axios from 'axios';

axios.defaults.withCredentials = true;
```

That's it! Now import this file at the root of your app (in `+layout.ts`) so it runs before anything else:

```typescript
// routes/+layout.ts
import '$lib/api/axios-config';

export const csr = true;
export const ssr = false;
export const prerender = false;
```

This ensures every axios request includes cookies, and every response can set cookies.

### Step 2: Build a Reactive Auth Store

We'll use Svelte 5's runes to create a simple, reactive auth store:

```typescript
// lib/auth/auth.svelte.ts
import type { User } from '$lib/api/gen/model';

class AuthStore {
    user = $state<User | null>(null);
    isLoading = $state(true);

    get isAuthenticated(): boolean {
        return this.user !== null;
    }

    setUser(user: User | null) {
        this.user = user;
        this.isLoading = false;
    }

    clear() {
        this.user = null;
        this.isLoading = false;
    }
}

export const authStore = new AuthStore();
```

This is beautifully simple. The `$state` rune makes `user` and `isLoading` reactive - any component that reads them automatically updates when they change. No subscriptions, no boilerplate.

### Step 3: Session Validation with Smart Caching

Here's where it gets interesting. We need to validate the user's session by calling `/users/me`, but we don't want to hammer that endpoint on every page navigation. Let's add caching:

```typescript
// lib/auth/session.ts
const api = getFastAPI();

let lastSuccessfulCheck = 0;
const AUTH_CHECK_EXPIRES_MS = 20000; // 20 seconds

export async function ensureAuthenticated(): Promise<boolean> {
    const now = Date.now();

    // Skip check if user is authenticated and we verified recently
    if (authStore.isAuthenticated && now - lastSuccessfulCheck < AUTH_CHECK_EXPIRES_MS) {
        return true;
    }

    // Show loading spinner only on initial auth check
    if (!authStore.isAuthenticated) {
        authStore.setLoading(true);
    }

    try {
        const response = await api.getCurrentUser();
        authStore.setUser(response.data);
        lastSuccessfulCheck = now;
        return true;
    } catch (error) {
        authStore.clear();
        window.location.href = '/login';
        return false;
    }
}
```

> **About the 20-second cache**: This is NOT the same as your session expiry time. This is purely a performance optimization to avoid hammering the `/users/me` endpoint. Your actual session might last 30-60 minutes on the backend. Even if you set this cache to something longer, it's fine - as soon as the user makes any API call (fetching todos, creating items, etc.), the backend will validate the session. If it's expired, you'll get a 401 and handle it.
>
> Here's the thing: imagine you have two protected pages that don't fetch any data from the API. When navigating between them, calling `/users/me` is the only way to verify you're still logged in. But from a security standpoint, even if we skipped this check entirely, it's fine - the user can't access any actual data without the backend validating their session. This check is more about UX (showing the correct UI state, redirecting to login if needed) than security. Real security happens on the backend.

### Step 4: Protect Routes with a Layout

Instead of calling `ensureAuthenticated()` in every protected page, we can use SvelteKit's route groups to protect multiple routes at once. Create a layout for protected routes:

```svelte
<!-- routes/(protected)/+layout.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { ensureAuthenticated } from '$lib/auth/session';
    import { authStore } from '$lib/auth/auth.svelte';

    let { children } = $props();

    onMount(async () => {
        await ensureAuthenticated();
    });
</script>

{#if authStore.isLoading}
    <!-- Loading state - prevents flash of unauthenticated content -->
    <div class="loading">Loading...</div>
{:else if authStore.isAuthenticated}
    <!-- Authenticated content -->
    {@render children()}
{:else}
    <!-- Not authenticated - shouldn't show since redirect happens -->
    <div class="loading">Redirecting to login...</div>
{/if}
```

The three states handle:
1. **Loading**: Shows while we're checking authentication
2. **Authenticated**: Renders the protected pages
3. **Not authenticated**: Fallback state (rarely shown since `ensureAuthenticated` redirects)

Now any route inside the `(protected)` folder automatically requires authentication:

```
routes/
  (protected)/
    +layout.svelte      ← Auth check happens here
    todos/
      +page.svelte      ← Automatically protected
    profile/
      +page.svelte      ← Automatically protected
  login/
    +page.svelte        ← Public route
```

The layout validates the session once, and all child pages benefit from it. Clean and DRY!

### Step 5: Logout

Logging out is straightforward:

```typescript
export async function logout(): Promise<void> {
    try {
        await api.logout();
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        authStore.clear();
        lastSuccessfulCheck = 0;
        goto('/login');
    }
}
```

Even if the API call fails, we clear the local state and redirect. The session might still exist on the backend, but the user can't access protected routes without re-authenticating.

---

## Wrapping Up

You now have a working authentication system for your SvelteKit SPA! We covered:

- Setting up HTTP-only cookie-based sessions
- Building a reactive auth store with Svelte 5 runes
- Smart caching to optimize backend calls
- Protecting routes with layouts
- Handling login and logout flows

The complete code is available in the [GitHub repository](https://github.com/TurtleDevIO/sveltekit-spa-authentication).

### Next Steps

This covers the authentication fundamentals, but production apps need features like password reset, email verification, OAuth, and role-based access control. If you need a production-ready solution with all of this built-in, check out [FastSvelte](https://fastsvelte.dev).
