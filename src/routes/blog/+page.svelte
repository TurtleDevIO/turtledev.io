<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import { siteConfig } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo
	title={`Blog - ${siteConfig.name}`}
	description={`Posts from ${siteConfig.name} on SvelteKit, FastAPI, Linux, and modern web development.`}
/>

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
