<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	let email = $state('');

	onMount(() => {
		email = ['hello', 'turtledev.io'].join('@');
	});

	const pageTitle = `Contact - ${siteConfig.name}`;
	const pageDescription = `Get in touch with ${siteConfig.name}. Email is the best way to reach Harun for questions, feedback, or collaboration.`;
	const pageUrl = `${siteConfig.url}/contact`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={pageUrl} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
</svelte:head>

<div class="container mx-auto px-4 py-16 max-w-3xl">
	<h1 class="text-4xl font-bold mb-8">Contact</h1>

	<div class="prose prose-lg max-w-none">
		<p>Best way to reach me is email. I check it regularly and read everything.</p>
		{#if email}
			<a href="mailto:{email}" class="text-primary hover:underline text-lg font-medium not-prose">
				{email}
			</a>
		{/if}
	</div>
</div>
