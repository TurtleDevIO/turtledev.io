import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';

// Cache the highlighter instance to avoid creating multiple instances
let highlighterInstance;

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			if (!highlighterInstance) {
				highlighterInstance = await createHighlighter({
					themes: ['github-dark'],
					langs: ['javascript', 'typescript', 'svelte', 'bash', 'css', 'html', 'python', 'json']
				});
			}
			const html = escapeSvelte(highlighterInstance.codeToHtml(code, { lang, theme: 'github-dark' }));
			return `{@html \`${html}\` }`;
		}
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			entries: ['*', '/sitemap.xml', '/404']
		}
	},
	extensions: ['.svelte', '.md', '.svx']
};

export default config;
