<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { themeStore } from '$lib/utils/theme.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

<div class="flex flex-col min-h-screen">
	<Header />

	<main class="flex-1">
		{@render children?.()}
	</main>

	<Footer />
</div>
