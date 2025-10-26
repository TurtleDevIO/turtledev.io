<script lang="ts">
	import { siteConfig } from '$lib/config';
	import ThemeToggle from './ThemeToggle.svelte';
	import { themeStore } from '$lib/utils/theme.svelte';

	let iconSrc = $derived(themeStore.isDark ? '/images/icon-dark.png' : '/images/icon-light.png');
	let mobileMenuOpen = $state(false);

	const toggleMobileMenu = () => {
		mobileMenuOpen = !mobileMenuOpen;
	};
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

			<!-- Desktop Menu -->
			<ul class="hidden md:flex gap-6 items-center">
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

			<!-- Mobile Menu Button -->
			<button
				class="md:hidden btn btn-ghost btn-square"
				onclick={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					{#if mobileMenuOpen}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden mt-4 pb-4">
				<ul class="flex flex-col gap-4">
					<li>
						<a
							href="/"
							class="block hover:text-primary transition-colors"
							onclick={toggleMobileMenu}
						>
							Home
						</a>
					</li>
					<li>
						<a
							href="/blog"
							class="block hover:text-primary transition-colors"
							onclick={toggleMobileMenu}
						>
							Blog
						</a>
					</li>
					<li>
						<a
							href="/about"
							class="block hover:text-primary transition-colors"
							onclick={toggleMobileMenu}
						>
							About
						</a>
					</li>
					<li>
						<a
							href="/contact"
							class="block hover:text-primary transition-colors"
							onclick={toggleMobileMenu}
						>
							Contact
						</a>
					</li>
					<li>
						<ThemeToggle />
					</li>
				</ul>
			</div>
		{/if}
	</nav>
</header>
