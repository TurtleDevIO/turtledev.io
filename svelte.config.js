import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Cache the highlighter instance as a Promise to avoid creating multiple instances
let highlighterPromise;

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	rehypePlugins: [
		rehypeSlug,
		[
			rehypeAutolinkHeadings,
			{
				behavior: 'append',
				content: {
					type: 'element',
					tagName: 'svg',
					properties: {
						className: ['heading-anchor-icon'],
						ariaHidden: 'true',
						xmlns: 'http://www.w3.org/2000/svg',
						width: '16',
						height: '16',
						viewBox: '0 0 24 24',
						fill: 'none',
						stroke: 'currentColor',
						strokeWidth: '2',
						strokeLinecap: 'round',
						strokeLinejoin: 'round'
					},
					children: [
						{
							type: 'element',
							tagName: 'path',
							properties: { d: 'M9 17H7A5 5 0 0 1 7 7h2' },
							children: []
						},
						{
							type: 'element',
							tagName: 'path',
							properties: { d: 'M15 7h2a5 5 0 1 1 0 10h-2' },
							children: []
						},
						{
							type: 'element',
							tagName: 'line',
							properties: { x1: '8', x2: '16', y1: '12', y2: '12' },
							children: []
						}
					]
				}
			}
		]
	],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			if (!highlighterPromise) {
				highlighterPromise = createHighlighter({
					themes: ['github-dark'],
					langs: [
						'javascript',
						'typescript',
						'svelte',
						'bash',
						'css',
						'html',
						'python',
						'json',
						'toml',
						'sh',
						'http',
						'ini',
						'java',
						'xml'
					]
				});
			}
			const highlighter = await highlighterPromise;
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'github-dark' }));
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
