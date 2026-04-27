<script lang="ts">
	import { siteConfig } from '$lib/config';

	interface Props {
		size?: 'sm' | 'md';
		class?: string;
	}

	let { size = 'md', class: className = '' }: Props = $props();

	const sizes = {
		sm: { button: 'w-9 h-9', icon: 'w-4 h-4', bg: 'bg-base-300' },
		md: { button: 'w-10 h-10', icon: 'w-5 h-5', bg: 'bg-base-200' }
	} as const;
</script>

<div class="flex gap-3 {className}">
	<a
		href={siteConfig.socials.youtube}
		target="_blank"
		rel="noopener noreferrer"
		class="inline-flex items-center justify-center {sizes[size].button} rounded-full {sizes[size].bg} hover:bg-primary hover:text-primary-content transition-colors"
		aria-label="YouTube"
	>
		<svg class={sizes[size].icon} fill="currentColor" viewBox="0 0 24 24">
			<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
		</svg>
	</a>
	<a
		href={siteConfig.socials.github}
		target="_blank"
		rel="noopener noreferrer"
		class="inline-flex items-center justify-center {sizes[size].button} rounded-full {sizes[size].bg} hover:bg-primary hover:text-primary-content transition-colors"
		aria-label="GitHub"
	>
		<svg class={sizes[size].icon} fill="currentColor" viewBox="0 0 24 24">
			<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
		</svg>
	</a>
	<a
		href={siteConfig.socials.rss}
		class="inline-flex items-center justify-center {sizes[size].button} rounded-full {sizes[size].bg} hover:bg-primary hover:text-primary-content transition-colors"
		aria-label="RSS Feed"
	>
		<svg class={sizes[size].icon} fill="currentColor" viewBox="0 0 24 24">
			<path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
		</svg>
	</a>
</div>
