<script lang="ts">
	import { page } from '$app/state';
	import { siteConfig } from '$lib/config';

	let {
		title,
		description,
		ogTitle,
		ogDescription,
		image = `${siteConfig.url}${siteConfig.ogImage}`,
		canonical
	}: {
		title: string;
		description: string;
		ogTitle?: string;
		ogDescription?: string;
		image?: string;
		canonical?: string;
	} = $props();

	const url = $derived.by(() => {
		if (canonical) return canonical;
		const path = page.url.pathname;
		return path === '/' ? `${siteConfig.url}/` : `${siteConfig.url}${path.replace(/\/+$/, '')}`;
	});

	const socialTitle = $derived(ogTitle ?? title);
	const socialDescription = $derived(ogDescription ?? description);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={socialTitle} />
	<meta property="og:description" content={socialDescription} />
	<meta property="og:image" content={image} />
	<meta property="og:site_name" content={siteConfig.name} />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={url} />
	<meta property="twitter:title" content={socialTitle} />
	<meta property="twitter:description" content={socialDescription} />
	<meta property="twitter:image" content={image} />
</svelte:head>
