---
title: "Building a Static Blog with SvelteKit 5 and DaisyUI"
description: "A comprehensive guide to creating a modern, fast, and beautiful static blog using SvelteKit 5, MDsveX, and DaisyUI"
date: "2025-01-15"
categories: ["svelte", "sveltekit", "tutorial", "webdev"]
published: false
---

# Building a Static Blog with SvelteKit 5 and DaisyUI

In this tutorial, we'll build a fully static, markdown-based blog using the latest SvelteKit 5, MDsveX for markdown processing, and DaisyUI for beautiful components. By the end, you'll have a fast, SEO-friendly blog that's perfect for sharing your thoughts and driving traffic to your projects.

## What We're Building

A statically generated blog with:
- Markdown-based blog posts with frontmatter
- Syntax highlighting with Shiki
- Clean, minimal design inspired by PaperMod theme
- Full static generation for blazing-fast performance
- Type-safe with TypeScript

## Tech Stack

- **SvelteKit 5** - Framework with the latest runes-based reactivity
- **TypeScript** - Type safety throughout
- **MDsveX** - Markdown processing for Svelte
- **Shiki** - Beautiful syntax highlighting
- **DaisyUI** - Component library built on TailwindCSS v4
- **adapter-static** - For static site generation

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of Svelte and SvelteKit
- Familiarity with Markdown

---

## Step 1: Project Setup

We started with a fresh SvelteKit project created using:

```bash
npx sv create
```

Selected options:
- SvelteKit minimal template
- TypeScript
- Prettier, ESLint

Then installed our dependencies:

```bash
npm install -D @sveltejs/adapter-static mdsvex shiki
npm install daisyui
```

### Initial Configuration

We configured `adapter-static` in `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: [vitePreprocess(), mdsvex()],
  kit: {
    adapter: adapter()
  },
  extensions: ['.svelte', '.svx']
};

export default config;
```

And integrated DaisyUI in `src/app.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@plugin "daisyui";
```

---

## Step 2: Type Definitions and Configuration

First, we'll create the type definitions for our blog posts and site configuration.

Create `src/lib/types.ts`:

```typescript
export interface Post {
	title: string;
	description: string;
	date: string;
	categories: string[];
	published: boolean;
	slug: string;
}
```

Create `src/lib/config.ts`:

```typescript
export const siteConfig = {
	name: 'TurtleDev',
	url: 'https://turtledev.io',
	description: 'Software development blog - quality technical content and insights',
	author: 'Harun'
};
```

---

## Step 3: Setting Up MDsveX with Shiki

Install Shiki for syntax highlighting:

```bash
npm install -D shiki
```

Update `svelte.config.js` to configure MDsveX with Shiki:

```javascript
import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';

const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await createHighlighter({
				themes: ['github-dark'],
				langs: ['javascript', 'typescript', 'svelte', 'bash', 'css', 'html']
			});
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'github-dark' }));
			return `{@html \`${html}\` }`;
		}
	}
};

const config = {
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter()
	},
	extensions: ['.svelte', '.md', '.svx']
};

export default config;
```

**Key points:**
- We support both `.md` and `.svx` extensions
- Shiki uses async API with `createHighlighter`
- Using `github-dark` theme (can be customized)
- `escapeSvelte` prevents XSS attacks

---

## Step 4: Creating Your First Blog Post

Create the posts directory and add your first post:

```bash
mkdir src/posts
```

Create `src/posts/hello-world.md`:

```markdown
---
title: "Hello World - My First Blog Post"
description: "Welcome to my blog! This is my first post."
date: "2025-01-15"
categories: ["meta", "introduction"]
published: true
---

# Hello World!

Welcome to my blog! I'm excited to start sharing my journey.

## Code Examples

```typescript
let count = $state(0);

function increment() {
	count++;
}
```

Pretty cool, right?
```

**Frontmatter fields:**
- `title`: Post title
- `description`: Brief summary for post list
- `date`: Publication date (YYYY-MM-DD format)
- `categories`: Array of category tags
- `published`: Boolean to control visibility

---

## Step 5: Creating the Posts API

Create a utility function to load all posts. Create `src/lib/utils/posts.ts`:

```typescript
import type { Post } from '$lib/types';

export async function getPosts(): Promise<Post[]> {
	let posts: Post[] = [];

	const paths = import.meta.glob('/src/posts/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata as Omit<Post, 'slug'>;
			const post = { ...metadata, slug } satisfies Post;

			if (post.published) {
				posts.push(post);
			}
		}
	}

	posts = posts.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return posts;
}
```

**What this does:**
- `import.meta.glob` loads all `.md` files from `src/posts/`
- Extracts metadata and generates slug from filename
- Filters to only show published posts
- Sorts by date (newest first)

Now create the API endpoint at `src/routes/api/posts/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import { getPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	return json(posts);
};
```

---

## Step 6: Building the Blog Index Page

Create `src/routes/blog/+page.server.ts`:

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch('/api/posts');
	const posts = await response.json();

	return {
		posts
	};
};
```

Create `src/routes/blog/+page.svelte`:

```svelte
<script lang="ts">
	import type { Post } from '$lib/types';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-4xl font-bold mb-8">Blog</h1>

	<div class="grid gap-6">
		{#each posts as post}
			<article class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">
						<a href="/blog/{post.slug}" class="hover:underline">
							{post.title}
						</a>
					</h2>
					<p class="text-sm opacity-70">{post.date}</p>
					<p>{post.description}</p>
					<div class="card-actions justify-start mt-2">
						{#each post.categories as category}
							<span class="badge badge-primary">{category}</span>
						{/each}
					</div>
				</div>
			</article>
		{/each}
	</div>
</div>
```

**Svelte 5 features used:**
- `$props()` rune instead of `export let data`
- DaisyUI components (card, badge)

---

## Step 7: Dynamic Post Pages

Create `src/routes/blog/[slug]/+page.ts`:

```typescript
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const post = await import(`../../../posts/${params.slug}.md`);

		return {
			content: post.default,
			meta: post.metadata
		};
	} catch (e) {
		error(404, `Could not find ${params.slug}`);
	}
};
```

Create `src/routes/blog/[slug]/+page.svelte`:

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<article class="container mx-auto px-4 py-8 max-w-3xl">
	<header class="mb-8">
		<h1 class="text-5xl font-bold mb-4">{data.meta.title}</h1>
		<div class="flex items-center gap-4 text-sm opacity-70 mb-4">
			<time datetime={data.meta.date}>{data.meta.date}</time>
		</div>
		<div class="flex gap-2">
			{#each data.meta.categories as category}
				<span class="badge badge-primary">{category}</span>
			{/each}
		</div>
	</header>

	<div class="prose prose-lg max-w-none">
		{@render data.content()}
	</div>
</article>
```

**Important Svelte 5 note:** Use `{@render data.content()}` instead of the deprecated `<svelte:component this={data.content} />`.

---

## Step 8: Creating Header and Footer Components

Let's add a proper layout with navigation and footer.

Create `src/lib/components/Header.svelte`:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config';
</script>

<header class="navbar bg-base-100 shadow-lg">
	<div class="container mx-auto">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl font-bold">{siteConfig.name}</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<li><a href="/">Home</a></li>
				<li><a href="/blog">Blog</a></li>
			</ul>
		</div>
	</div>
</header>
```

Create `src/lib/components/Footer.svelte`:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config';

	const currentYear = new Date().getFullYear();
</script>

<footer class="footer footer-center p-10 bg-base-200 text-base-content mt-auto">
	<aside>
		<p class="font-bold">
			{siteConfig.name}
		</p>
		<p>
			{siteConfig.description}
		</p>
		<p class="text-sm opacity-70">
			© {currentYear} {siteConfig.author}. All rights reserved.
		</p>
	</aside>
</footer>
```

Update `src/routes/+layout.svelte` to include header and footer:

```svelte
<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex flex-col min-h-screen">
	<Header />

	<main class="flex-1">
		{@render children?.()}
	</main>

	<Footer />
</div>
```

**Layout structure:**
- Flexbox ensures footer stays at bottom
- Header and footer on every page
- Main content area grows to fill available space

---

## Step 9: Building the Home Page

Create a home page with hero section and recent posts.

Create `src/routes/+page.server.ts`:

```typescript
import { getPosts } from '$lib/utils/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allPosts = await getPosts();
	const recentPosts = allPosts.slice(0, 5); // Get 5 most recent posts

	return {
		posts: recentPosts
	};
};
```

Update `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config';
	import type { Post } from '$lib/types';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<div class="hero bg-base-200 py-20">
	<div class="hero-content text-center">
		<div class="max-w-2xl">
			<h1 class="text-5xl font-bold mb-4">{siteConfig.name}</h1>
			<p class="text-xl mb-8">{siteConfig.description}</p>
			<a href="/blog" class="btn btn-primary btn-lg">Read the Blog</a>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-16">
	<div class="flex items-center justify-between mb-8">
		<h2 class="text-3xl font-bold">Recent Posts</h2>
		<a href="/blog" class="btn btn-ghost">View all →</a>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each posts as post}
			<article class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
				<div class="card-body">
					<h3 class="card-title">
						<a href="/blog/{post.slug}" class="hover:underline">
							{post.title}
						</a>
					</h3>
					<p class="text-sm opacity-70">{post.date}</p>
					<p>{post.description}</p>
					<div class="card-actions justify-start mt-4">
						{#each post.categories as category}
							<span class="badge badge-sm badge-outline">{category}</span>
						{/each}
					</div>
				</div>
			</article>
		{/each}
	</div>
</div>
```

**Home page features:**
- Hero section with site title and description
- Call-to-action button to blog
- Responsive grid of 5 most recent posts
- "View all" link to full blog

---

## Step 10: Test Your Blog

Start the development server:

```bash
npm run dev
```

Visit:
- `http://localhost:5173` - Home page with recent posts
- `http://localhost:5173/blog` - Full blog listing
- `http://localhost:5173/blog/hello-world` - Individual post

---

## Step 11: Static Site Generation

Now let's configure the blog for static site generation so it can be deployed to any static hosting provider.

### Configure Prerendering

SvelteKit with `adapter-static` requires all routes to be prerenderable. We need to configure this properly.

We already have `export const prerender = true` in `src/routes/+layout.ts`, but we need to add it to a server file for API routes.

Create `src/routes/+layout.server.ts`:

```typescript
export const prerender = true;
```

Add prerender to the API endpoint in `src/routes/api/posts/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import { getPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	return json(posts);
};
```

### Configure Dynamic Route Generation

For dynamic routes like `/blog/[slug]`, we need to tell SvelteKit which pages to prerender. Create `src/routes/blog/[slug]/+page.server.ts`:

```typescript
import { getPosts } from '$lib/utils/posts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
	const posts = await getPosts();
	return posts.map((post) => ({ slug: post.slug }));
};
```

**What this does:**
- The `entries` function tells SvelteKit all possible values for the `[slug]` parameter
- During build, it will generate a static HTML file for each post
- This enables fully static site generation

### Build Your Site

Now build your static site:

```bash
npm run build
```

You should see output like:
```
✓ built in 2.44s
> Using @sveltejs/adapter-static
  Wrote site to "build"
  ✔ done
```

The `build/` directory now contains:
- `index.html` - Home page
- `blog.html` - Blog index
- `blog/hello-world.html` - Individual post pages
- `api/posts/` - Prerendered JSON data
- `_app/` - JavaScript and CSS assets

### Preview Production Build

Test your production build locally:

```bash
npm run preview
```

Visit the preview URL to verify everything works!

---

## Step 12: Styling with PaperMod Theme

Now let's style our blog with a clean, minimal theme inspired by Hugo's PaperMod.

### Configure TailwindCSS v4 Theme

With TailwindCSS v4, we configure themes directly in CSS using `@theme` blocks. Update `src/app.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';

/* DaisyUI theme configuration for TailwindCSS v4 */
@theme {
	--color-primary: #1e90ff;
	--color-secondary: #9b9c9d;
	--color-accent: #4169e1;
	--color-neutral: #2e2e33;
	--color-base-100: #ffffff;
	--color-base-200: #f8f9fa;
	--color-base-300: #e9ecef;
	--color-base-content: #1d1e20;
	--color-info: #3abff8;
	--color-success: #36d399;
	--color-warning: #fbbd23;
	--color-error: #f87272;
}

[data-theme='papermod_dark'] {
	--color-base-100: #1d1e20;
	--color-base-200: #2e2e33;
	--color-base-300: #414243;
	--color-base-content: #dadadb;
	--color-neutral: #414243;
}

/* PaperMod-inspired custom styles */
:root {
	--radius: 8px;
}

html {
	scroll-behavior: smooth;
}

/* Custom prose styling for blog posts */
.prose {
	@apply text-base-content;
	max-width: none;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
	@apply font-bold text-base-content;
}

.prose a {
	@apply text-primary no-underline hover:underline;
}

.prose code {
	@apply bg-base-200 px-1 py-0.5 rounded text-sm;
}

.prose pre {
	@apply bg-base-200 rounded-lg p-4 overflow-x-auto;
}

.prose pre code {
	@apply bg-transparent p-0;
}
```

**Key points:**
- TailwindCSS v4 uses `@theme` instead of JavaScript config
- CSS variables for light theme
- `[data-theme='papermod_dark']` selector for dark theme overrides
- Custom prose styles for readable blog content

### Update Components with PaperMod Style

Update the header for a clean, minimal look:

```svelte
<!-- src/lib/components/Header.svelte -->
<script lang="ts">
	import { siteConfig } from '$lib/config';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-sm border-b border-base-300">
	<nav class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<a href="/" class="text-xl font-bold hover:text-primary transition-colors">
				{siteConfig.name}
			</a>
			<ul class="flex gap-6 items-center">
				<li><a href="/" class="hover:text-primary transition-colors">Home</a></li>
				<li><a href="/blog" class="hover:text-primary transition-colors">Blog</a></li>
				<li><ThemeToggle /></li>
			</ul>
		</div>
	</nav>
</header>
```

**Styling features:**
- Sticky header with backdrop blur
- Minimal border at bottom
- Smooth hover transitions
- Theme toggle in navigation

---

## Step 13: Dark/Light Mode Toggle

Let's implement a theme toggle that respects system preferences and persists user choice.

### Create Theme Utility

Create `src/lib/utils/theme.ts`:

```typescript
import { browser } from '$app/environment';

export type Theme = 'papermod' | 'papermod_dark';

const THEME_KEY = 'theme';

export function getTheme(): Theme {
	if (!browser) return 'papermod';

	const stored = localStorage.getItem(THEME_KEY) as Theme | null;
	if (stored) return stored;

	// Check system preference
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'papermod_dark' : 'papermod';
}

export function setTheme(theme: Theme) {
	if (!browser) return;

	localStorage.setItem(THEME_KEY, theme);
	document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme(): Theme {
	const current = getTheme();
	const newTheme: Theme = current === 'papermod' ? 'papermod_dark' : 'papermod';
	setTheme(newTheme);
	return newTheme;
}

export function isDarkTheme(theme: Theme): boolean {
	return theme === 'papermod_dark';
}
```

### Create ThemeToggle Component

Create `src/lib/components/ThemeToggle.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { getTheme, toggleTheme, isDarkTheme, type Theme } from '$lib/utils/theme';

	let currentTheme = $state<Theme>('papermod');
	let mounted = $state(false);

	onMount(() => {
		currentTheme = getTheme();
		mounted = true;
	});

	function handleToggle() {
		currentTheme = toggleTheme();
	}
</script>

{#if mounted}
	<button
		onclick={handleToggle}
		class="btn btn-ghost btn-sm btn-circle"
		aria-label="Toggle theme"
		title={isDarkTheme(currentTheme) ? 'Switch to light mode' : 'Switch to dark mode'}
	>
		{#if isDarkTheme(currentTheme)}
			<!-- Sun icon -->
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
				stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
				<path stroke-linecap="round" stroke-linejoin="round"
					d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
			</svg>
		{:else}
			<!-- Moon icon -->
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
				stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
				<path stroke-linecap="round" stroke-linejoin="round"
					d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
			</svg>
		{/if}
	</button>
{/if}
```

### Initialize Theme on Page Load

Update `src/app.html` to prevent flash of wrong theme:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<script>
			// Initialize theme before page render to prevent flash
			const theme = localStorage.getItem('theme') ||
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'papermod_dark' : 'papermod');
			document.documentElement.setAttribute('data-theme', theme);
		</script>
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

**How it works:**
1. Inline script runs before page render
2. Checks localStorage for saved preference
3. Falls back to system preference (`prefers-color-scheme`)
4. Sets `data-theme` attribute immediately
5. No flash of unstyled content (FOUC)

---

## Conclusion

## Conclusion

[To be filled at the end...]

---

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev)
- [MDsveX Documentation](https://mdsvex.com)
- [DaisyUI Documentation](https://daisyui.com)
- [Shiki Documentation](https://shiki.style)
