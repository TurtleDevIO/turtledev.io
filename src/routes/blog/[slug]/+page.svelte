<script lang="ts">
	let { data } = $props();
</script>

<article class="container mx-auto px-4 py-12 max-w-3xl">
	<header class="mb-12 pb-8 border-b border-base-300">
		<h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">{data.meta.title}</h1>
		<div class="flex items-center gap-3 text-sm text-base-content/60">
			<time datetime={data.meta.date}>{data.meta.date}</time>
			{#if data.meta.categories.length > 0}
				<span>•</span>
				<div class="flex gap-2">
					{#each data.meta.categories as category}
						<span>#{category}</span>
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<div class="prose prose-lg max-w-none mb-12">
		{@render data.content()}
	</div>

	<footer class="pt-8 border-t border-base-300">
		<a href="/blog" class="text-primary hover:underline">← Back to blog</a>
	</footer>
</article>
