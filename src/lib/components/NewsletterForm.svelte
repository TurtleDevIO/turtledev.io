<script lang="ts">
	import SocialLinks from './SocialLinks.svelte';

	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

	async function subscribe() {
		status = 'loading';

		try {
			const body = new URLSearchParams({
				'fields[email]': email,
				'ml-submit': '1',
				anticsrf: 'true'
			});

			await fetch(
				'https://assets.mailerlite.com/jsonp/2297071/forms/185910812004583156/subscribe',
				{ method: 'POST', body }
			);

			status = 'success';
			email = '';
		} catch {
			status = 'error';
		}
	}
</script>

<div class="bg-base-200 rounded-lg p-6 my-12">
	{#if status === 'success'}
		<p class="font-semibold text-base-content">You're in.</p>
		<p class="text-base-content/70 text-sm mt-1">New posts will find their way to you.</p>
	{:else}
		<p class="font-semibold text-base-content mb-2 pl-0.5">Subscribe for New Posts</p>
		<!-- svelte-ignore event_directive_deprecated -->
		<form on:submit={subscribe} class="flex gap-2">
			<input
				type="email"
				bind:value={email}
				placeholder="your@email.com"
				required
				class="input input-bordered flex-1 text-sm"
			/>
			<button type="submit" class="btn btn-primary text-sm" disabled={status === 'loading'}>
				{status === 'loading' ? 'Subscribing...' : 'Subscribe'}
			</button>
		</form>
		{#if status === 'error'}
			<p class="text-error text-sm mt-2">Something went wrong. Please try again.</p>
		{/if}
	{/if}

	<SocialLinks size="sm" class="mt-4" />
</div>
