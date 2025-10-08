<script lang="ts">
	import { siteConfig } from '$lib/config';
	import type { Post } from '$lib/types';
	import PostCard from '$lib/components/PostCard.svelte';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<svelte:head>
	<!-- JSON-LD Organization Schema -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": ${JSON.stringify(siteConfig.name)},
		"url": ${JSON.stringify(siteConfig.url)},
		"logo": "${siteConfig.url}${siteConfig.ogImage}",
		"description": ${JSON.stringify(siteConfig.description)},
		"email": ${JSON.stringify(siteConfig.email)},
		"sameAs": [
			${JSON.stringify(siteConfig.socials.youtube)},
			${JSON.stringify(siteConfig.socials.github)},
			${JSON.stringify(siteConfig.socials.kofi)}
		]
	}
	<\/script>`}
</svelte:head>

<div class="container mx-auto px-4 py-12 max-w-3xl">
	<!-- Hero/Intro Section -->
	<div class="mb-12">
		<h1 class="text-3xl font-bold mb-4">Welcome</h1>
		<p class="text-base-content/80 leading-relaxed mb-4">
			{siteConfig.description}
		</p>
		<p class="text-base-content/60 italic mb-6">
			"{siteConfig.motto}"
		</p>

		<!-- Social Icons -->
		<div class="flex gap-3">
			<a
				href={siteConfig.socials.youtube}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content transition-colors"
				aria-label="YouTube"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
				</svg>
			</a>
			<a
				href={siteConfig.socials.github}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content transition-colors"
				aria-label="GitHub"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
			</a>
			<a
				href={siteConfig.socials.kofi}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content transition-colors"
				aria-label="Ko-fi"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
				</svg>
			</a>
		</div>
	</div>

	<!-- Posts List -->
	<div>
		{#each posts as post}
			<PostCard {post} />
		{/each}
	</div>
</div>
