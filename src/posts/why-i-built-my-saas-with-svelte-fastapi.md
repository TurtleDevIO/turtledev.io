---
title: "Why I Built My SaaS with Svelte + FastAPI (and Why You Might Too)"
description: "An in-depth look at why I chose Svelte and FastAPI for my SaaS application, including the benefits and trade-offs of this modern tech stack."
date: "2025-10-06"
categories: ["svelte", "fastapi", "saas", "web-development", "sveltekit"]
published: true
readingTime: 10
---

# Why I Switched from SvelteKit SSR to a Svelte + FastAPI SPA

Hi, I’m Harun 👋 — a software engineer and founder of [**BrokerGuard.ai**](https://brokerguard.ai), an AI-powered platform that helps insurance brokers automatically audit submissions and detect errors before they reach underwriters.

Over the past few years, I’ve built and scaled multiple SaaS products — and like many developers, I’ve gone through the “what stack should I use?” struggle more times than I’d like to admit.

When I first started building my SaaS, I went with what everyone seemed to be using — **SvelteKit with SSR** deployed on Vercel.
If I were a React person, I probably would’ve gone with **Next.js**, and my experience would have been pretty similar.

On paper, it sounded great: one stack, one deployment, everything in TypeScript.
But in reality? It didn’t take long before the cracks showed up.

* The app felt slow on first load — mostly due to **cold starts** on Vercel’s serverless functions.
* Every page render was triggering backend logic that didn’t really belong in the frontend.
* And because I needed **AI features and heavy data processing**, I still had to maintain a **Python backend** for those tasks.

At some point, I realized I was maintaining **two backends** — one for frontend with SSR and another for AI backend — both reading and writing to the same database.
It felt messy and inefficient. 🥴

---

## When SEO Doesn’t Matter (as Much as You Think)

One of the main selling points of SSR is **SEO**.
But let’s be honest — for a **SaaS dashboard**, SEO doesn’t really matter.

Your authenticated app isn’t being crawled by Google anyway.
SEO matters for your *marketing site*, *landing pages*, and *blog posts* — not your user dashboard.

And for those, a **separate SvelteKit app** with **static generation** gives you way more flexibility and blazing speed.
In one of the AI startups I worked at, our landing page was built with **WordPress** and no one from the dev team was responsible for it. It was marketing team's reponsibility. So, I highly recommend to separate your marketing site and the actual SaaS app. For example, host the landing page on *mysaas.com* and the app on app.mysaas.com. 
---

## 🧩 Why Vercel Pushes SSR

Vercel’s business model is built around **serverless rendering**, not static hosting.
SSR keeps apps running on their infrastructure continuously, which means more usage → more billing.
It’s not a bad thing — it just means SSR is what fits *their* model, not necessarily *yours*.

If your app doesn’t need SEO and runs mostly behind login, **static + API** is cheaper, faster, and simpler to scale.
---

## The Hosting Reality

Another advantage often mentioned about SSR (Next.js or SvelteKit) is the simplicity of **deploying everything to one place** — Vercel, Netlify, etc. But I needed some python backend anyway for AI tasks, so I had to host that somewhere. The first thought was of course serverless functions (AWS Lambda, Azure Functions). And I've many years of experience with AWS Lambda and Azure Functions. They are great for small tasks. Especially for jobs that run periodically or in response to events that can tolerate some delay. However, for a real web API, they start to show their limitations. 

1. Cold starts: This can be solved by pinging your API periodically. But yet another thing to maintain.
2. Deployment complexity: AWS Lambda requires packaging your code and dependencies, setting up IAM roles, and configuring API Gateway. Azure Functions are easier but still require some setup.
3. Web frameworks: When building a web api, you really feel the need for a framework but most web frameworks are not designed to run in serverless environments. I've tried AWS python power tools in the past, it is no where near FastAPI or Flask.

So, I decided to **dockerize my backend** and host it on **Azure Container Apps**. It turned out to be a perfect middle ground:

* Costs around **$10/month** for a small app when 1 replica is running all the time. Much cheaper if you set up min replicas to `0` but that will suffer from cold starts. So, for production, I recommend at least `1` min replica.
* **Auto-scales** when traffic grows.
* And the **free tier** is surprisingly generous:

  * 180,000 vCPU-seconds
  * 360,000 GiB-seconds
  * 2 million requests/month
    More than enough for an early-stage SaaS.

Since I was already on Azure, I tried **Azure Static Web Apps** for hosting the SPA frontend.
It’s fast, simple, and **free** — 100 GB bandwidth, 3 custom domains, and seamless CI/CD integration with GitHub.

For the database, you can even use the **free Postgres instance on Vercel**.
Or, if you prefer, keep your **frontend + DB** on Vercel and your **backend** on Azure (or any other provider).
This flexibility is exactly what I love about separating concerns.

---

## After Switching to SPA + FastAPI

Once I switched, the difference was night and day.

The app now feels **snappy** — pages load instantly, navigation is smooth, and no more random SSR delays. I like the new development experience much more. Clean separation of frontend and backend concerns. Backend does the heavy lifting, frontend just consumes the API and renders the UI. DB writes, Oauth, AI calls, Stripe integration — all handled in the backend.

Another win for me is **Independent deploys**. I can deploy the frontend anytime without touching the backend, and vice versa.
Hotfix a frontend bug? Just redeploy the SPA.
Need to update the backend schema? Do it safely, without breaking the UI.

Yes, you need to set up **two pipelines** — but with **GitHub Actions** it's very easy and AI tools are great at generating YAMLs now. I use a simple workflow for the frontend:

---

## Bonus: How to Get Azure Credits

If you have a startup, you can get **free Azure credits** through the **[Microsoft for Startups Founders Hub](https://www.microsoft.com/startups)** program. Most startups are eligible, for at least $5000 in credits. I got $25,000 in credits for my startup, which is more than enough to cover hosting costs for the first year or two.

---


## Bonus 2: Client Code Generation

With FastAPI’s OpenAPI spec, you can generate API client code automatically with **[Orval](https://orval.dev)** (for TypeScript) or **OpenAPI Generator**. This means whenever you update your backend API, you just regenerate the client code and your frontend stays in sync.
No more writing fetch wrappers manually — your SPA gets typed functions for every endpoint.
(We’ll cover this in detail in an upcoming post 😉)

---

## What’s Next

In the coming weeks, I’ll be diving deeper into:

* How to setup Svelte + FastAPI from scratch.
* Session-based authentication with secure cookies.
* Handling authentication and protected routes in a SvelteKit SPA.

Each topic will be part of a growing tutorial series around **[FastSvelte](https://fastsvelte.dev/)**, my open-source SaaS starter kit.
