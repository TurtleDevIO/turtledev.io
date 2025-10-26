<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	const {
		repo,
		repoId,
		category,
		categoryId,
		mapping,
		reactionsEnabled,
		emitMetadata,
		inputPosition,
		theme,
		lang
	} = siteConfig.giscus;

	let giscusContainer: HTMLDivElement;

	onMount(() => {
		// Only load Giscus if repoId and categoryId are configured
		if (!repoId || !categoryId) {
			console.warn(
				'Giscus is not fully configured. Please visit https://giscus.app/ to get your repoId and categoryId.'
			);
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://giscus.app/client.js';
		script.setAttribute('data-repo', repo);
		script.setAttribute('data-repo-id', repoId);
		script.setAttribute('data-category', category);
		script.setAttribute('data-category-id', categoryId);
		script.setAttribute('data-mapping', mapping);
		script.setAttribute('data-strict', '0');
		script.setAttribute('data-reactions-enabled', reactionsEnabled);
		script.setAttribute('data-emit-metadata', emitMetadata);
		script.setAttribute('data-input-position', inputPosition);
		script.setAttribute('data-theme', theme);
		script.setAttribute('data-lang', lang);
		script.setAttribute('data-loading', 'lazy');
		script.crossOrigin = 'anonymous';
		script.async = true;

		giscusContainer.appendChild(script);
	});
</script>

<div class="giscus-container border-base-300 mt-12 border-t pt-8">
	<h2 class="mb-6 text-2xl font-bold">Comments</h2>
	<div bind:this={giscusContainer}></div>
</div>

<style>
	.giscus-container {
		width: 100%;
	}
</style>
