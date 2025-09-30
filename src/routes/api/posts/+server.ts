import { json } from '@sveltejs/kit';
import { getPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	return json(posts);
};
