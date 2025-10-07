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
- [ ] Add JSON-LD schema markup for Article/BlogPosting on blog posts
- [ ] Implement Organization schema on homepage
- [ ] Add breadcrumb schema for navigation

### Performance & Core Web Vitals
- [ ] Optimize images (use WebP format, add width/height attributes)
- [ ] Implement lazy loading for images below the fold
- [ ] Add preload tags for critical resources in `src/app.html`
- [ ] Minimize JavaScript bundle size (check with Lighthouse)

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
