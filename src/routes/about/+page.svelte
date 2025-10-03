<script lang="ts">
	import { siteConfig } from '$lib/config';
</script>

<div class="container mx-auto px-4 py-16 max-w-3xl">
	<h1 class="text-4xl font-bold mb-8">About</h1>

	<div class="prose prose-lg max-w-none">
		<p class="text-xl text-base-content/80 mb-6">
			{siteConfig.motto}
		</p>

		<p>
			Welcome to {siteConfig.name}, a software development blog focused on delivering quality technical content and insights.
		</p>

		<p>
			This blog is written by {siteConfig.author}, covering topics in software engineering, web development, and technology.
		</p>

		<p>
			The philosophy behind this blog is simple: take time to do things right, build momentum through quality work, and achieve sustainable speed through smooth execution.
		</p>
	</div>
</div>
