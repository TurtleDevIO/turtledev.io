import { getPosts } from '$lib/utils/posts';
import { siteConfig } from '$lib/config';
import type { Post } from '$lib/types';
import type { RequestHandler } from './$types';

export const prerender = true;

// Map a post's category to a section heading. First matching category wins.
// Posts with no matching category fall into "Other" - add a mapping here
// when a genuinely new topic area shows up, not for every new post.
const categoryToSection: Record<string, string> = {
	fastapi: 'FastAPI & Full-Stack Tutorials',
	sveltekit: 'SvelteKit & Svelte',
	svelte: 'SvelteKit & Svelte',
	linux: 'Linux & Terminal',
	terminal: 'Linux & Terminal',
	javafx: 'JavaFX & Spring Boot',
	meta: 'Meta'
};

const sectionOrder = [
	'FastAPI & Full-Stack Tutorials',
	'SvelteKit & Svelte',
	'Linux & Terminal',
	'JavaFX & Spring Boot',
	'Meta'
];

function sectionFor(categories: string[]): string {
	for (const category of categories) {
		const section = categoryToSection[category];
		if (section) return section;
	}
	return 'Other';
}

function groupBySection(posts: Post[]): Map<string, Post[]> {
	const sections = new Map<string, Post[]>();
	for (const post of posts) {
		const section = sectionFor(post.categories);
		if (!sections.has(section)) sections.set(section, []);
		sections.get(section)?.push(post);
	}
	return sections;
}

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	const siteUrl = siteConfig.url;
	const sections = groupBySection(posts);
	const orderedSections = [
		...sectionOrder,
		...[...sections.keys()].filter((section) => !sectionOrder.includes(section))
	];

	const body = orderedSections
		.filter((section) => sections.has(section))
		.map((section) => {
			const items = (sections.get(section) ?? [])
				.map((post) => `- [${post.title}](${siteUrl}/blog/${post.slug}): ${post.description}`)
				.join('\n');
			return `## ${section}\n\n${items}`;
		})
		.join('\n\n');

	const llmsTxt = `# ${siteConfig.name}

> ${siteConfig.longDescription}

${siteConfig.name} also builds [Fastsvelte](https://fastsvelte.dev), a SvelteKit SaaS starter kit - many posts here reference patterns and decisions that come directly from building it.

${body}
`.trim();

	return new Response(llmsTxt, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
