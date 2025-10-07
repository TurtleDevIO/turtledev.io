<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} - Turtle Dev</title>
	<meta name="description" content={data.meta.description} />

	<!-- Open Graph -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:url" content={`https://turtledev.io/blog/${data.meta.slug}`} />
	<meta property="article:published_time" content={data.meta.date} />
	{#each data.meta.categories as category}
		<meta property="article:tag" content={category} />
	{/each}

	<!-- Twitter Card -->
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />

	<!-- Canonical URL -->
	<link rel="canonical" href={`https://turtledev.io/blog/${data.meta.slug}`} />
</svelte:head>

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
