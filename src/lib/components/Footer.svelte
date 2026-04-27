<script lang="ts">
	import { siteConfig } from '$lib/config';
	import SocialLinks from './SocialLinks.svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-base-100 mt-auto">
	<div class="container mx-auto px-4 py-8">
		<div class="text-center space-y-4">
			<SocialLinks class="justify-center" />

			<div class="space-y-2">
				<p class="text-sm text-base-content/70">
					© {currentYear} {siteConfig.author}. All rights reserved.
				</p>
				<p class="text-xs text-base-content/50">
					{siteConfig.description}
				</p>
			</div>
		</div>
	</div>
</footer>
