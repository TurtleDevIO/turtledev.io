---
title: 'Why I Switched from SvelteKit SSR to SPA + FastAPI'
description: 'How separating frontend and backend brought instant navigation, cleaner architecture, independent deployments, and happier development.'
date: '2025-10-06'
categories: ['sveltekit', 'fastapi', 'saas', 'spa']
published: true
readingTime: 10
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>

Hi, I'm Harun 👋, a software engineer who's been building SaaS products for the past few years.

I come from a backend background. To get into frontend development, I tried several frameworks (Angular, Vue, and React) but Svelte was the only framework I could understand just by looking at examples. It clicked immediately. Since then I've been using Svelte for everything including this [static blog](https://github.com/TurtleDevIO/turtledev.io).

SvelteKit is the natural next step: routing, SSR, full-stack features out of the box. But its default model is SSR, and there's a lot less content out there on using it as a pure SPA. So I went with SSR, same as everyone in the React world goes with Next.js.

Most of my projects also needed AI and ML, which meant a Python backend. So I ended up with two backends: one for SSR, one for the actual logic, both hitting the same database and talking to each other. That got messy fast.

The dev experience wasn't great either:

- Pages were slow, especially on Vercel. Cold starts on serverless functions didn't help.
- Every request that touched Python had an extra hop through the SSR layer.
- Backend logic kept bleeding into the frontend where it didn't belong.

Honestly, I don't remember the exact moment it clicked. At some point I just got tired of the two-backend setup and started looking for a way out. Being a backend developer at heart probably played a role. The idea of owning a clean API and treating the frontend as a thin presentation layer grew in my mind, and eventually I gave it a try.

## After Switching to SPA + FastAPI

Once I switched, the improvement was immediate.

Pages loaded instantly, navigation was smooth, no more cold start delays. More importantly, the architecture finally made sense. The backend did the heavy lifting, the frontend just consumed the API and rendered. DB writes, OAuth, AI calls, Stripe integration, all in the backend where they belonged.

The other big win was independent deploys. Frontend and backend shipped on their own schedules. Hotfix a UI bug? Redeploy the SPA without touching the backend. Update the schema? The frontend didn't care until you told it to.

You do need two pipelines instead of one, but with GitHub Actions it takes maybe 30 minutes to set up, and AI tools are pretty good at generating the YAML anyway.

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## When SEO Doesn't Matter

One of the main selling points of SSR is **SEO**. But for a **SaaS dashboard**, SEO doesn't really matter.

Your authenticated app isn't being crawled by Google anyway. SEO matters for your _marketing site_, _landing pages_, and _blog posts_, not your user dashboard.

And for those, a **separate SvelteKit app** with **static generation** gives you way more flexibility and blazing speed.
In one of the AI startups I worked at, our landing page was built with **WordPress** and no one from the dev team was responsible for it. It was the marketing team's responsibility. So, I highly recommend separating your marketing site from the actual SaaS app. For example, host the landing page on _mysaas.com_ and the app on _app.mysaas.com_.

## Why Vercel Pushes SSR

Vercel's business model is built around **serverless rendering**, not static hosting.
SSR keeps apps running on their infrastructure continuously, which means more usage → more billing.
It's not a bad thing. It just means SSR is what fits _their_ model, not necessarily _yours_.

If your app doesn't need SEO and runs mostly behind login, **static + API** is cheaper, faster, and simpler to scale.

## The Hosting Reality

Another advantage often mentioned about SSR (Next.js or SvelteKit) is the simplicity of **deploying everything to one place** (Vercel, Netlify, etc.). But I needed a Python backend anyway for AI tasks, so I had to host that somewhere. The first thought was serverless functions (AWS Lambda, Azure Functions). I've had many years of experience with both. They're great for small tasks, especially jobs that run periodically or can tolerate some delay. But for a real web API, they start to show their limitations.

1. Cold starts: solvable by pinging your API periodically, but yet another thing to maintain.
2. Deployment complexity: AWS Lambda requires packaging your code and dependencies, setting up IAM roles, and configuring API Gateway. Azure Functions are easier but still require some setup.
3. Web frameworks: when building a web API you really feel the need for a proper framework, but most aren't designed to run in serverless environments. I've tried AWS Lambda Powertools in the past — it's nowhere near FastAPI or Flask.

So, I decided to **dockerize my backend** and host it on **Azure Container Apps**. It turned out to be a perfect middle ground:

- Costs around **$10/month** for a small app with 1 replica running at all times. Much cheaper if you set min replicas to `0`, but that brings cold starts back. For production, I recommend at least `1`.
- **Auto-scales** when traffic grows.
- The **free tier** is surprisingly generous: 180,000 vCPU-seconds, 360,000 GiB-seconds, and 2 million requests/month. More than enough for an early-stage SaaS.

Since I was already on Azure, I tried **Azure Static Web Apps** for hosting the SPA frontend.
It's fast, simple, and **free**: 100 GB bandwidth, 3 custom domains, and seamless CI/CD integration with GitHub.

For the database, you can even use the **free Postgres instance on Vercel**.
Or keep your **frontend + DB** on Vercel and your **backend** on Azure (or any other provider).
This flexibility is exactly what I love about separating concerns.

## Bonus: How to Get Azure Credits

If you have a startup, you can get **free Azure credits** through the **[Microsoft for Startups Founders Hub](https://www.microsoft.com/startups)** program. Most startups are eligible for at least $5,000 in credits. I got $25,000 for my startup, which is more than enough to cover hosting costs for the first year or two.

## Bonus: Client Code Generation

With FastAPI's OpenAPI spec, you can generate API client code automatically with **[Orval](https://orval.dev)** (for TypeScript) or **OpenAPI Generator**. This means whenever you update your backend API, you just regenerate the client code and your frontend stays in sync.
No more writing fetch wrappers manually. Your SPA gets typed functions for every endpoint.
(I cover this in detail in [Full-stack FastAPI Tutorial 3: SvelteKit SPA Setup with Orval](/blog/fastapi-tutorial-3-sveltekit-spa-setup-orval) 😉)

<Callout type="promo">

**Building a production app?** Check out [FastSvelte](https://fastsvelte.dev) - a production-ready FastAPI + SvelteKit starter with authentication, payments, and more built-in.

</Callout>

## What's Next

In the coming weeks, I'll be diving deeper into:

- [How to Build a SvelteKit SPA with FastAPI Backend](/blog/how-to-build-sveltekit-spa-with-fastapi-backend)
- [Session-based authentication with secure cookies and protected routes in a SvelteKit SPA.](/blog/how-to-add-authentication-to-sveltekit-spa)

**See also:** [Full-stack FastAPI Tutorial 1: Project Setup & Tooling](/blog/fastapi-tutorial-1-project-setup-crud-api)

**Related:** [Using FastAPI with Svelte](https://fastsvelte.dev/fastapi-svelte) - how the SPA + API pairing works in production.

Smooth coding!
