<script lang="ts">
	import type { Post } from '$lib/types';
	import PostCard from '$lib/components/PostCard.svelte';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<div class="container mx-auto px-4 py-12 max-w-3xl">
	<header class="mb-12">
		<h1 class="text-4xl font-bold mb-2">Blog</h1>
		<p class="text-base-content/60">All posts ({posts.length})</p>
	</header>

	<div>
		{#each posts as post}
			<PostCard {post} />
		{/each}
	</div>
</div>
