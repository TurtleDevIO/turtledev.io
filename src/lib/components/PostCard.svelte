<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatDate } from '$lib/utils/date';
	let { post }: { post: Post } = $props();
</script>

<article class="rounded-lg p-6 mb-4 bg-base-200">
	<a href="/blog/{post.slug}" class="group block">
		<h2 class="text-[24px] font-semibold mb-3 group-hover:text-primary transition-colors">
			{post.title}
		</h2>
		<p class="text-base-content/70 leading-relaxed mb-3">{post.description}</p>
		<div class="flex items-center gap-3 text-sm text-base-content/60 flex-wrap">
			<div class="flex items-center gap-3 whitespace-nowrap">
				<time>{formatDate(post.date)}</time>
				{#if post.readingTime}
					<span>·</span>
					<span class="flex items-center gap-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						{post.readingTime} min
					</span>
				{/if}
			</div>
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
