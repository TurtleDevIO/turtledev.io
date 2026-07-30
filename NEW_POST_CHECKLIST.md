# New Blog Post Checklist

Runbook to follow for every new post, start to finish.

## Writing

- [ ] Create the `.md` file in `src/posts/`
- [ ] Fill in frontmatter: `title`, `description`, `date`, `categories`, `published`, `readingTime`
- [ ] Follow the writing style guide in `CLAUDE.md` (conversational tone, explain the why, no em dashes)
- [ ] Add internal links to related posts where relevant
- [ ] Add alt text to any images

## Before Publishing

- [ ] Run `npm run dev` and proofread the rendered post
- [ ] Run `npm run build` to confirm it builds cleanly
- [ ] Confirm the post appears on `/blog`, in `sitemap.xml`, `rss.xml`, and `llms.txt` (these are generated automatically from `src/posts/`, so this is just a sanity check)
- [ ] If the post covers a genuinely new topic area (not just a new post in an existing category), add a mapping for it in `categoryToSection` in `src/routes/llms.txt/+server.ts` so it doesn't fall into "Other"

## Git & Deploy

- [ ] Push a feature branch (never push directly to `main`)
- [ ] Open the PR manually (do not use `gh pr create`)
- [ ] Check the Vercel preview deployment linked in the PR comment
- [ ] Merge to `main` once reviewed - production deploy happens automatically

## After Publishing (optional promotion)

- [ ] Share on relevant Reddit/StackOverflow threads if applicable
- [ ] Share on socials (YouTube, etc.) if applicable
