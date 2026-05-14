import Fuse from 'fuse.js';
import type { Post } from '$lib/types';

export interface SearchIndex {
	fuse: Fuse<Post>;
	posts: Post[];
}

let cached: SearchIndex | null = null;
let inflight: Promise<SearchIndex> | null = null;

export async function loadSearchIndex(fetcher: typeof fetch = fetch): Promise<SearchIndex> {
	if (cached) return cached;
	if (inflight) return inflight;

	inflight = (async () => {
		const res = await fetcher('/api/posts');
		const posts: Post[] = await res.json();

		const fuse = new Fuse(posts, {
			keys: [
				{ name: 'title', weight: 0.5 },
				{ name: 'description', weight: 0.3 },
				{ name: 'categories', weight: 0.2 }
			],
			threshold: 0.2,
			ignoreLocation: true,
			includeScore: false
		});

		cached = { fuse, posts };
		return cached;
	})();

	try {
		return await inflight;
	} finally {
		inflight = null;
	}
}
