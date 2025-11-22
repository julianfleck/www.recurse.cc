import { resolveIcon } from "@recurse/fumadocs/icons";
import { loader } from "fumadocs-core/source";
import type { Page } from "fumadocs-core/source";
import type { ComponentType } from "react";
import type { BlogFrontmatter, BlogSummary } from "./types";

type FumadocsCollection = {
	toFumadocsSource: () => Parameters<typeof loader>[0]["source"];
};

type BlogPage = Page & {
	data: BlogFrontmatter & {
		body: ComponentType<any>;
	};
};

const dateSorter = (a: BlogSummary, b: BlogSummary) =>
	new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf();

function createPickFrontmatter() {
	return function pickFrontmatter(page: Page): BlogSummary {
		const data = page.data as BlogFrontmatter;
		return {
			title: data.title,
			description: data.description,
			publishedAt: data.publishedAt,
			tags: data.tags ?? [],
			substackUrl: data.substackUrl,
			heroImage: data.heroImage,
			sidebar_label: data.sidebar_label,
			slug: page.slugs,
			url: page.url,
		};
	};
}

export function createBlogHelpers(collection: FumadocsCollection) {
	const blogSource = loader({
		baseUrl: "/blog",
		source: collection.toFumadocsSource(),
		pageTree: {
			resolveIcon(icon) {
				return resolveIcon(icon);
			},
		},
	});

	const pickFrontmatter = createPickFrontmatter();

	function getAllBlogPosts(): BlogSummary[] {
		return blogSource.getPages().map(pickFrontmatter).sort(dateSorter);
	}

	function getBlogPage(slug: string[]): BlogPage | undefined {
		const page = blogSource.getPage(slug);
		if (!page) {
			return undefined;
		}
		return page as BlogPage;
	}

	function findBlogPost(slug: string[]): BlogSummary | undefined {
		const page = getBlogPage(slug);
		if (!page) {
			return undefined;
		}
		return pickFrontmatter(page);
	}

	function generateBlogParams() {
		return blogSource.generateParams();
	}

	return {
		blogSource,
		getAllBlogPosts,
		getBlogPage,
		findBlogPost,
		generateBlogParams,
	};
}

