<script lang="ts">
	import { siteConfig } from '$lib/config';
</script>

<div class="mb-12">
	<h1 class="text-[34px] font-bold mb-4">{siteConfig.introHeading}</h1>
	<p class="text-base-content/80 leading-relaxed mb-4">
		{@html siteConfig.introDescription}
	</p>
	

</div>
