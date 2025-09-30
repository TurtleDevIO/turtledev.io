# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a statically generated personal software development blog built with SvelteKit. The primary purpose is to provide quality technical content and drive attention to B2C projects such as fastsvelte.dev.

## Architecture

### Preprocessors
The project uses two preprocessors configured in `svelte.config.js`:
1. `vitePreprocess()` - for TypeScript/PostCSS preprocessing
2. `mdsvex()` - enables markdown content in `.svx` files

### File Extensions
- `.svelte` - Standard Svelte components
- `.svx` - Markdown files with Svelte component support (blog posts)

### Styling
- TailwindCSS v4 is integrated via `@tailwindcss/vite` plugin
- Global styles in `src/app.css` with `@import 'tailwindcss'`
- Typography plugin enabled for prose content
- DaisyUI component library integrated via plugin

### TypeScript Configuration
- Extends generated `.svelte-kit/tsconfig.json`
- Strict mode enabled with `checkJs: true`
- Uses `moduleResolution: "bundler"`
- Path aliases managed by SvelteKit config

## Content Strategy

- Blog posts written in Markdown (`.svx` files) with MDsveX
- Focus on high-quality technical content
- Drive traffic to B2C projects like fastsvelte.dev
- Static site generation for optimal performance and SEO

## Important Notes

- This project uses Svelte 5 syntax (`$props()`, runes)
- MDsveX requires both preprocessors in correct order (vitePreprocess first)
- The `prepare` script runs `svelte-kit sync` to generate types
- Use `adapter-static` or prerendering for static generation when deploying
