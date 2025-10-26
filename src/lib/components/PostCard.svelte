<script lang="ts">
	import type { Post } from '$lib/types';
	let { post }: { post: Post } = $props();
</script>

<article class="rounded-lg p-6 mb-4 bg-base-200">
	<a href="/blog/{post.slug}" class="group block">
		<h2 class="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
			{post.title}
		</h2>
		<p class="text-base-content/70 leading-relaxed mb-3">{post.description}</p>
		<div class="flex items-center gap-2 text-sm text-base-content/60">
			<time>{post.date}</time>
			{#if post.readingTime}
				<span>·</span>
				<span>{post.readingTime} min read</span>
			{/if}
			{#if post.categories && post.categories.length > 0}
				<span>·</span>
				<div class="flex gap-2 flex-wrap">
					{#each post.categories as category}
						<span class="badge badge-outline badge-sm">{category}</span>
					{/each}
				</div>
			{/if}
		</div>
	</a>
</article>
