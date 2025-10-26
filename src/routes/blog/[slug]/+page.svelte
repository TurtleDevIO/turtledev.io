<script lang="ts">
	import { siteConfig } from '$lib/config';
	import Giscus from '$lib/components/Giscus.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} - {siteConfig.name}</title>
	<meta name="description" content={data.meta.description} />

	<!-- Open Graph -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:url" content={`${siteConfig.url}/blog/${data.meta.slug}`} />
	<meta property="article:published_time" content={data.meta.date} />
	{#each data.meta.categories as category}
		<meta property="article:tag" content={category} />
	{/each}

	<!-- Twitter Card -->
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />

	<!-- Canonical URL -->
	<link rel="canonical" href={`${siteConfig.url}/blog/${data.meta.slug}`} />

	<!-- JSON-LD Schema -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"headline": ${JSON.stringify(data.meta.title)},
		"description": ${JSON.stringify(data.meta.description)},
		"datePublished": ${JSON.stringify(data.meta.date)},
		"author": {
			"@type": "Person",
			"name": ${JSON.stringify(siteConfig.author)}
		},
		"publisher": {
			"@type": "Organization",
			"name": ${JSON.stringify(siteConfig.name)},
			"logo": {
				"@type": "ImageObject",
				"url": "${siteConfig.url}${siteConfig.ogImage}"
			}
		},
		"mainEntityOfPage": {
			"@type": "WebPage",
			"@id": "${siteConfig.url}/blog/${data.meta.slug}"
		},
		"keywords": ${JSON.stringify(data.meta.categories.join(', '))},
		"articleSection": ${JSON.stringify(data.meta.categories[0] || 'Technology')},
		"timeRequired": "PT${data.meta.readingTime}M"
	}
	<\/script>`}
</svelte:head>

<article class="container mx-auto px-4 py-12 max-w-3xl">
	<header class="mb-8 pb-6 border-b border-base-300">
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

	<!-- Comments Section -->
	<Giscus />

	<footer class="pt-8 border-t border-base-300 mt-12">
		<a href="/blog" class="text-primary hover:underline">← Back to blog</a>
	</footer>
</article>
