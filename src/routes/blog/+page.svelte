<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import { siteConfig } from '$lib/config';

	let { data } = $props();

	const pageTitle = `Blog - ${siteConfig.name}`;
	const pageDescription = `Posts from ${siteConfig.name} on SvelteKit, FastAPI, Linux, and modern web development.`;
	const pageUrl = `${siteConfig.url}/blog`;
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

<div class="container mx-auto px-4 py-12 max-w-3xl">
	<header class="mb-12">
		<h1 class="text-4xl font-bold mb-2">Blog</h1>
		<p class="text-base-content/60">All posts ({data.posts.length})</p>
	</header>

	<div>
		{#each data.posts as post}
			<PostCard {post} />
		{/each}
	</div>
</div>
