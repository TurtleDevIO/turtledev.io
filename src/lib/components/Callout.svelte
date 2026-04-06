<script lang="ts">
	import type { Snippet } from 'svelte';

	type CalloutType = 'promo' | 'note' | 'warning' | 'tip' | 'info';

	let { type = 'note', children }: { type?: CalloutType; children: Snippet } = $props();

	const styles = {
		promo: 'bg-primary/10 border-primary',
		note: 'bg-info/10 border-info',
		warning: 'bg-warning/10 border-warning',
		tip: 'bg-success/10 border-success',
		info: 'bg-info/10 border-info'
	};
</script>

<div class="my-3 p-4 rounded-lg border-l-4 flex gap-3 items-start text-lg leading-relaxed {styles[type]}">
	<div class="shrink-0 self-start pt-1.5">
		<svg
			class="w-5 h-5 block"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			{#if type === 'promo'}
				<path d="M4.5 16.5c-1.5 1.25-2 5-2 5s3.75-.5 5-2c.625-.625 1-1.375 1-2.125C8.5 16 8 15.5 6.5 15.5c-.75 0-1.5.375-2 1z" />
				<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
				<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
				<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
			{:else if type === 'info'}
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<path d="M12 8h.01" />
			{:else if type === 'note'}
				<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
				<path d="M14 2v4a2 2 0 0 0 2 2h4" />
				<path d="M10 9H8" />
				<path d="M16 13H8" />
				<path d="M16 17H8" />
			{:else if type === 'warning'}
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
				<path d="M12 9v4" />
				<path d="M12 17h.01" />
			{:else if type === 'tip'}
				<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
				<path d="M9 18h6" />
				<path d="M10 22h4" />
			{/if}
		</svg>
	</div>
	<div class="flex-1 [&>*]:mt-0 [&>*]:mb-0 [&>strong]:font-semibold [&>a]:underline">
		{@render children()}
	</div>
</div>
