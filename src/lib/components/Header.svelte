<script lang="ts">
	import { siteConfig } from '$lib/config';
	import ThemeToggle from './ThemeToggle.svelte';
	import { themeStore } from '$lib/utils/theme.svelte';

	let iconSrc = $derived(themeStore.isDark ? '/icon-dark.png' : '/icon-light.png');
</script>

<header class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-sm border-b border-base-300">
	<nav class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 text-xl font-bold hover:text-primary transition-colors">
				<img src={iconSrc} alt="Turtle" class="w-8 h-8" />
				{siteConfig.name}
			</a>
			<ul class="flex gap-6 items-center">
				<li>
					<a href="/" class="hover:text-primary transition-colors">Home</a>
				</li>
				<li>
					<a href="/blog" class="hover:text-primary transition-colors">Blog</a>
				</li>
				<li>
					<ThemeToggle />
				</li>
			</ul>
		</div>
	</nav>
</header>
