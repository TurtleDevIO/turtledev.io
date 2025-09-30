# TurtleDev.io

Personal software development blog built with SvelteKit, DaisyUI, and MDsveX.

## Features

- 📝 Markdown-based blog posts with MDsveX
- 🎨 PaperMod-inspired theme with DaisyUI
- 🌓 Dark/light mode toggle with system preference detection
- ⚡ Static site generation with adapter-static
- 🎯 Syntax highlighting with Shiki
- 📊 Vercel Analytics integration
- 🚀 Automated deployments via GitHub Actions

## Tech Stack

- **SvelteKit 5** - Modern Svelte framework with runes
- **TypeScript** - Type-safe development
- **TailwindCSS v4** - Utility-first CSS
- **DaisyUI** - Component library
- **MDsveX** - Markdown processing for Svelte
- **Shiki** - Beautiful syntax highlighting

## Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev

# or open in browser
npm run dev -- --open
```

## Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Deployment

This project uses automated deployments via GitHub Actions:

- **Pull Requests**: Automatically deploy preview on Vercel
- **Main Branch**: Automatically deploy to production on merge

### Setup GitHub Secrets

See [.github/VERCEL_SETUP.md](.github/VERCEL_SETUP.md) for instructions on configuring:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Git Workflow

⚠️ **Never push directly to main branch**

1. Create a feature branch
2. Make your changes
3. Create a pull request
4. Review and merge

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable components
│   ├── utils/          # Utility functions
│   ├── config.ts       # Site configuration
│   └── types.ts        # TypeScript types
├── posts/              # Blog posts (markdown)
├── routes/
│   ├── blog/           # Blog routes
│   └── api/            # API endpoints
└── app.css             # Global styles
```

## Writing Blog Posts

Create a new markdown file in `src/posts/`:

```markdown
---
title: "Your Post Title"
description: "Brief description"
date: "2025-01-15"
categories: ["category1", "category2"]
published: true
---

# Your Content Here
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Guidelines for Claude Code
- [BLOG_IMPLEMENTATION_PLAN.md](BLOG_IMPLEMENTATION_PLAN.md) - Implementation plan
- [BLOG_POST_DRAFT.md](BLOG_POST_DRAFT.md) - Tutorial blog post draft
