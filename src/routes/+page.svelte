<script lang="ts">
	import { siteConfig } from '$lib/config';
	import type { Post } from '$lib/types';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<div class="bg-base-200 py-20 border-b border-base-300">
	<div class="container mx-auto px-4 text-center">
		<div class="max-w-2xl mx-auto">
			<h1 class="text-5xl font-bold mb-4">{siteConfig.name}</h1>
			<p class="text-xl text-base-content/70 mb-8">{siteConfig.description}</p>
			<a
				href="/blog"
				class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
			>
				Read the Blog →
			</a>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-16">
	<div class="flex items-center justify-between mb-8">
		<h2 class="text-3xl font-bold">Recent Posts</h2>
		<a href="/blog" class="text-primary hover:underline">View all →</a>
	</div>

	<div class="space-y-4">
		{#each posts as post}
			<article
				class="border border-base-300 rounded-lg p-6 hover:shadow-md transition-shadow bg-base-100"
			>
				<a href="/blog/{post.slug}" class="group">
					<h3 class="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
						{post.title}
					</h3>
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
