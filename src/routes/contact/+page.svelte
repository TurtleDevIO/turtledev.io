<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';

	let email = $state('');

	onMount(() => {
		email = ['hello', 'turtledev.io'].join('@');
	});
</script>

<Seo
	title={`Contact - ${siteConfig.name}`}
	description={`Get in touch with ${siteConfig.name}. Email is the best way to reach Harun for questions, feedback, or collaboration.`}
/>

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
