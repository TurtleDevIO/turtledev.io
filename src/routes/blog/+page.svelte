<script lang="ts">
	import type { Post } from '$lib/types';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<div class="container mx-auto px-4 py-12 max-w-4xl">
	<header class="mb-12">
		<h1 class="text-4xl font-bold mb-2">Blog</h1>
		<p class="text-base-content/60">All posts ({posts.length})</p>
	</header>

	<div class="space-y-4">
		{#each posts as post}
			<article
				class="border border-base-300 rounded-lg p-6 hover:shadow-md transition-shadow bg-base-100"
			>
				<a href="/blog/{post.slug}" class="group">
					<h2 class="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
						{post.title}
					</h2>
					<div class="flex items-center gap-3 text-sm text-base-content/60 mb-3">
						<time>{post.date}</time>
						{#if post.categories.length > 0}
							<span>•</span>
							<div class="flex gap-2">
								{#each post.categories as category}
									<span>#{category}</span>
								{/each}
							</div>
						{/if}
					</div>
					<p class="text-base-content/80">{post.description}</p>
				</a>
			</article>
		{/each}
	</div>
</div>
