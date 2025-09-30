import { getPosts } from '$lib/utils/posts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
	const posts = await getPosts();
	return posts.map((post) => ({ slug: post.slug }));
};
