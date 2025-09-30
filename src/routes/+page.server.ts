import { getPosts } from '$lib/utils/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allPosts = await getPosts();
	const recentPosts = allPosts.slice(0, 5); // Get 5 most recent posts

	return {
		posts: recentPosts
	};
};
