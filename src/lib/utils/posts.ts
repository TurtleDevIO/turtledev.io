import type { Post } from '$lib/types';

function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	// Remove code blocks, HTML tags, and count words
	const plainText = content
		.replace(/```[\s\S]*?```/g, '') // Remove code blocks
		.replace(/<[^>]*>/g, '') // Remove HTML tags
		.replace(/[#*_~`]/g, ''); // Remove markdown syntax
	const words = plainText.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function getPosts(): Promise<Post[]> {
	let posts: Post[] = [];

	// Import raw markdown content
	const mdPaths = import.meta.glob('/src/posts/*.md', { eager: true, query: '?raw', import: 'default' });

	// Import metadata
	const metaPaths = import.meta.glob('/src/posts/*.md', { eager: true });

	for (const path in metaPaths) {
		const file = metaPaths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata as Omit<Post, 'slug'>;

			// Calculate reading time only if not provided in frontmatter
			let readingTime = metadata.readingTime;
			if (!readingTime) {
				const rawPath = path + '?raw';
				const rawContent = mdPaths[rawPath] as string || '';
				readingTime = calculateReadingTime(rawContent);
			}

			const post = { ...metadata, slug, readingTime } satisfies Post;

			if (post.published) {
				posts.push(post);
			}
		}
	}

	posts = posts.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return posts;
}
