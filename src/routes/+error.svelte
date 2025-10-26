<script lang="ts">
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config';

	const is404 = $page.status === 404;
	const errorTitle = is404 ? 'Page Not Found' : `Error ${$page.status}`;
	const errorMessage = is404
		? "The page you're looking for doesn't exist. It might have been moved, or the URL might be incorrect."
		: $page.error?.message || 'Something went wrong. Please try again later.';
</script>

<svelte:head>
	<title>{errorTitle} - {siteConfig.name}</title>
</svelte:head>

<div class="container mx-auto px-4 py-16 max-w-2xl text-center">
	<div class="mb-8">
		{#if is404}
			<!-- Turtle illustration for 404 -->
			<div class="text-9xl mb-4">🐢</div>
			<h1 class="text-6xl font-bold mb-4">404</h1>
		{:else}
			<div class="text-9xl mb-4">⚠️</div>
			<h1 class="text-6xl font-bold mb-4">{$page.status}</h1>
		{/if}
	</div>

	<h2 class="text-2xl font-semibold mb-4">{errorTitle}</h2>
	<p class="text-lg text-base-content/70 mb-8">{errorMessage}</p>

	{#if is404}
		<div class="space-y-4 mb-8">
			<p class="text-base-content/60">Here are some helpful links instead:</p>
			<div class="flex flex-wrap gap-4 justify-center">
				<a href="/" class="btn btn-primary">Home</a>
				<a href="/blog" class="btn btn-outline">Blog</a>
				<a href="/about" class="btn btn-outline">About</a>
				<a href="/contact" class="btn btn-outline">Contact</a>
			</div>
		</div>

		<div class="mt-12 p-6 bg-base-200 rounded-lg">
			<p class="text-sm text-base-content/60 italic">
				"Slow is smooth, smooth is fast" - even when finding the right page takes a detour.
			</p>
		</div>
	{:else}
		<div class="flex gap-4 justify-center">
			<a href="/" class="btn btn-primary">Go Home</a>
			<button onclick={() => window.history.back()} class="btn btn-outline">Go Back</button>
		</div>
	{/if}
</div>
