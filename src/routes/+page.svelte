<script lang="ts">
	import { siteConfig } from '$lib/config';
	import type { Post } from '$lib/types';
	import PostCard from '$lib/components/PostCard.svelte';
	import IntroSection from '$lib/components/IntroSection.svelte';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<svelte:head>
	<!-- JSON-LD Organization Schema -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": ${JSON.stringify(siteConfig.name)},
		"url": ${JSON.stringify(siteConfig.url)},
		"logo": "${siteConfig.url}${siteConfig.ogImage}",
		"description": ${JSON.stringify(siteConfig.description)},
		"email": ${JSON.stringify(siteConfig.email)},
		"sameAs": [
			${JSON.stringify(siteConfig.socials.youtube)},
			${JSON.stringify(siteConfig.socials.github)},
			${JSON.stringify(siteConfig.socials.kofi)}
		]
	}
	<\/script>`}
</svelte:head>

<div class="container mx-auto px-4 py-12 max-w-3xl">
	<IntroSection />

	<!-- Posts List -->
	<div>
		{#each posts as post}
			<PostCard {post} />
		{/each}
	</div>
</div>
