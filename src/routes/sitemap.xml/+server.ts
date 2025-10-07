import { getPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	const siteUrl = 'https://turtledev.io';

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${siteUrl}</loc>
		<changefreq>weekly</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc>${siteUrl}/blog</loc>
		<changefreq>weekly</changefreq>
		<priority>0.9</priority>
	</url>
	<url>
		<loc>${siteUrl}/about</loc>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>${siteUrl}/contact</loc>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>
	${posts
		.map(
			(post) => `
	<url>
		<loc>${siteUrl}/blog/${post.slug}</loc>
		<lastmod>${post.date}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.7</priority>
	</url>`
		)
		.join('')}
</urlset>`.trim();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
