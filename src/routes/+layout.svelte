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
	<meta name="keywords" content={siteConfig.keywords} />
	<meta name="author" content={siteConfig.author} />
</svelte:head>

<div class="flex flex-col min-h-screen">
	<Header />

	<main class="flex-1">
		{@render children?.()}
	</main>

	<Footer />
</div>
