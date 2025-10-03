export interface Post {
	title: string;
	description: string;
	date: string;
	categories: string[];
	published: boolean;
	slug: string;
	readingTime?: number;
}
