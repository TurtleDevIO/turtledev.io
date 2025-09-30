<script lang="ts">
	import { onMount } from 'svelte';
	import { getTheme, toggleTheme, isDarkTheme, type Theme } from '$lib/utils/theme';

	let currentTheme = $state<Theme>('papermod');
	let mounted = $state(false);

	onMount(() => {
		currentTheme = getTheme();
		mounted = true;
		console.log('ThemeToggle mounted, current theme:', currentTheme);
	});

	function handleToggle() {
		console.log('Toggle clicked, current theme:', currentTheme);
		currentTheme = toggleTheme();
		console.log('New theme:', currentTheme);
	}
</script>

{#if mounted}
	<button
		onclick={handleToggle}
		class="btn btn-ghost btn-sm btn-circle"
		aria-label="Toggle theme"
		title={isDarkTheme(currentTheme) ? 'Switch to light mode' : 'Switch to dark mode'}
	>
		{#if isDarkTheme(currentTheme)}
			<!-- Sun icon for light mode -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
				/>
			</svg>
		{:else}
			<!-- Moon icon for dark mode -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
				/>
			</svg>
		{/if}
	</button>
{/if}
