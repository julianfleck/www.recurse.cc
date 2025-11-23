export type BlogFrontmatter = {
	title: string;
	description?: string;
	publishedAt: string;
	tags?: string[];
	substackUrl: string;
	heroImage?: string;
	sidebar_label?: string;
	author?: string;
};

export type BlogSummary = BlogFrontmatter & {
	slug: string[];
	url: string;
};

