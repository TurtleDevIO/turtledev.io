<script lang="ts">
	import { siteConfig } from '$lib/config';

	const pageTitle = `About - ${siteConfig.name}`;
	const pageDescription = `About Harun, a Canadian software developer with nearly two decades of industry experience writing about software architecture, simplicity, and craftsmanship.`;
	const pageUrl = `${siteConfig.url}/about`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={pageUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-16">
	<h1 class="mb-10 text-4xl font-bold">About</h1>

	<div class="prose prose-lg max-w-none space-y-5">
		<p>Hey! 👋</p>

		<p>
			I'm Harun, a software developer from Canada with almost two decades of experience in the
			industry.
		</p>

		<p>
			I care deeply about software architecture, simplicity, and craftsmanship. In my experience,
			taking the time to understand a problem and evaluate possible solutions before jumping into
			coding gets you where you want to go faster, with a lot less pain along the way.
		</p>

		<p>
			TurtleDev is where I share what I've learned while building with this mindset. The tutorials,
			articles, and guides here also serve as my personal notes. I hope you find something useful in them.
		</p>
	</div>
</div>
