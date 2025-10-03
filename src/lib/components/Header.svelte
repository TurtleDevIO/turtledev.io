<script lang="ts">
	import { siteConfig } from '$lib/config';
	import ThemeToggle from './ThemeToggle.svelte';
	import { themeStore } from '$lib/utils/theme.svelte';

	let iconSrc = $derived(themeStore.isDark ? '/images/icon-dark.png' : '/images/icon-light.png');
</script>

<header class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-sm">
	<nav class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 hover:text-primary transition-colors">
				<img src={iconSrc} alt="Turtle" class="w-8 h-8" />
				<div class="flex flex-col">
					<span class="text-xl font-bold">{siteConfig.name}</span>
					<span class="text-xs text-base-content/60 italic">{siteConfig.motto}</span>
				</div>
			</a>
			<ul class="flex gap-6 items-center">
				<li>
					<a href="/" class="hover:text-primary transition-colors">Home</a>
				</li>
				<li>
					<a href="/blog" class="hover:text-primary transition-colors">Blog</a>
				</li>
				<li>
					<a href="/about" class="hover:text-primary transition-colors">About</a>
				</li>
				<li>
					<a href="/contact" class="hover:text-primary transition-colors">Contact</a>
				</li>
				<li>
					<ThemeToggle />
				</li>
			</ul>
		</div>
	</nav>
</header>
