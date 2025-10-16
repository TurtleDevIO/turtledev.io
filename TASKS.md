# SEO Optimization Tasks

## Critical SEO Tasks

### Meta Tags & Open Graph
- [x] Add comprehensive meta tags to `src/app.html` (description, keywords, author)
- [x] Implement Open Graph tags for social media sharing (og:title, og:description, og:image, og:type)
- [x] Add Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Create OG image at `/static/images/og-image.png` (1200x630px recommended)
- [x] Create dynamic meta tags for individual blog posts using frontmatter data

### Sitemap & Robots
- [x] Generate `sitemap.xml` with all blog posts and pages
- [x] Create `robots.txt` file to guide search engine crawlers
- [ ] Submit sitemap to Google Search Console and Bing Webmaster Tools

### Structured Data
- [x] Add JSON-LD schema markup for Article/BlogPosting on blog posts
- [x] Implement Organization schema on homepage
- [ ] Add breadcrumb schema for navigation

### Content & URLs
- [ ] Ensure all blog posts have descriptive, SEO-friendly URLs
- [ ] Add canonical URLs to prevent duplicate content issues
- [ ] Create internal linking strategy between related posts
- [ ] Add alt text to all images

### Technical SEO
- [ ] Verify all pages return proper HTTP status codes
- [ ] Ensure mobile responsiveness (test with Google Mobile-Friendly Test)
- [ ] Set up analytics tracking (Google Analytics/Plausible)
- [ ] Configure proper cache headers in deployment settings

## Template Repository Setup

### Centralize Configuration
- [x] Audit all hardcoded values across the codebase (site name, URLs, author, etc.)
- [x] Move all configuration to `src/lib/config.ts` (expanded with title, longDescription, keywords, ogImage)
- [x] Update all files to use config values instead of hardcoded strings
  - [x] `src/app.html` - removed meta tags (moved to +layout.svelte)
  - [x] `src/routes/+layout.svelte` - added dynamic meta tags using siteConfig
  - [x] `src/routes/sitemap.xml/+server.ts` - uses siteConfig.url
  - [x] `src/routes/blog/[slug]/+page.svelte` - uses siteConfig for all URLs and names
  - [x] `src/routes/+page.svelte` - added Organization schema using siteConfig

### GitHub Template
- [ ] Enable "Template repository" in GitHub settings
- [ ] Create comprehensive README with setup instructions
- [ ] Add template usage guide (how to customize config, add posts, deploy)

## Content Creation and SEO Strategy

### Blog Post 1: Svelte SPA + FastAPI Integration Tutorial (45 mins)

- [ ] Research keywords for target audience for blog post 1 (1o mins)
- [ ] Find 3-5 relevant Reddit/StackOverflow threads to link to (10 mins)
- [ ] Create accounts with turtledev.io email on Reddit, StackOverflow, Dev.to (10 mins)
- [ ] Share blog post on these platforms with thoughtful comments (15 mins)

### Blog Post 2: Svelte SPA and FastAPI integration tutorial (2.5-3 hours)

- [ ] Decide on the blog post outline and structure (5 mins)
- [ ] Write the blog post (60-90 mins)
- [ ] Create example repo on GitHub (15 mins)
- [ ] Research keywords for target audience for blog post 1 (1o mins)
- [ ] Write the frontmatter (title, description, keywords) (10 mins)
- [ ] Add internal links to related posts (5 mins)
- [ ] Find 3-5 relevant Reddit/StackOverflow threads to link to (10 mins)
- [ ] Create accounts with turtledev.io email on Reddit, StackOverflow, Dev.to (10 mins)
- [ ] Share blog post on these platforms with thoughtful comments (15 mins)

### Blog Post 2: YouTube Tutorial - Svelte SPA + FastAPI Integration (1.5-2 hours)
- [ ] Record screen walkthrough (no editing, raw) (30-45 mins)
- [ ] Editing (cut out mistakes, add intro/outro) (15 mins)
- [ ] Upload to YouTube with SEO-optimized title, description, tags (10 mins)
