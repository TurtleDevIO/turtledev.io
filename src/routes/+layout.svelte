<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { themeStore } from '$lib/utils/theme.svelte';
	import { siteConfig } from '$lib/config';
	import { onMount } from 'svelte';
	import { track } from '@vercel/analytics';

	let { children } = $props();

	onMount(() => {
		themeStore.init();

		// Track clicks on FastSvelte links so we know which posts drive referrals.
		// Links live in markdown across many posts, so we delegate from the document
		// rather than wiring an onclick into every link.
		function handleFastSvelteClick(event: MouseEvent) {
			const anchor = (event.target as HTMLElement | null)?.closest('a');
			if (!anchor || !anchor.hostname.endsWith('fastsvelte.dev')) return;

			track('fastsvelte-click', {
				post: window.location.pathname,
				href: anchor.href
			});
		}

		document.addEventListener('click', handleFastSvelteClick);
		return () => document.removeEventListener('click', handleFastSvelteClick);
	});
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<meta name="description" content={siteConfig.longDescription} />
	<meta name="keywords" content={siteConfig.keywords} />
	<meta name="author" content={siteConfig.author} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:title" content={siteConfig.title} />
	<meta property="og:description" content={siteConfig.longDescription} />
	<meta property="og:url" content={siteConfig.url} />
	<meta property="og:image" content={`${siteConfig.url}${siteConfig.ogImage}`} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteConfig.title} />
	<meta name="twitter:description" content={siteConfig.longDescription} />
	<meta name="twitter:image" content={`${siteConfig.url}${siteConfig.ogImage}`} />
</svelte:head>

<div class="flex flex-col min-h-screen">
	<Header />

	<main class="flex-1">
		{@render children?.()}
	</main>

	<Footer />
</div>
