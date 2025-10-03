<script lang="ts">
	import { siteConfig } from '$lib/config';
</script>

<div class="container mx-auto px-4 py-16 max-w-3xl">
	<h1 class="text-4xl font-bold mb-8">Contact</h1>

	<div class="prose prose-lg max-w-none">
		<p class="text-xl text-base-content/80 mb-6">
			Get in touch
		</p>

		<p>
			Have questions, suggestions, or want to discuss a topic? Feel free to reach out.
		</p>

		<div class="not-prose mt-8">
			<div class="bg-base-200 rounded-lg p-6">
				<h2 class="text-xl font-bold mb-4">Email</h2>
				<a href="mailto:{siteConfig.email}" class="text-primary hover:underline text-lg">
					{siteConfig.email}
				</a>
			</div>
		</div>
	</div>
</div>
