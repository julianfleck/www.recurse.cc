import type { SearchItem } from "./types";

/**
 * Static pages index for instant search without API calls
 * This is pre-populated with all documentation pages for faster initial results
 */
export const staticPages: SearchItem[] = [
	// Documentation Pages
	{
		id: "docs-introduction",
		title: "Introduction",
		summary: "Get started with Recurse and RAGE",
		type: "page",
		href: "/docs/introduction",
		breadcrumbs: ["Documentation"],
	},
	{
		id: "docs-quickstart",
		title: "Quickstart",
		summary: "Quick start guide for getting up and running",
		type: "page",
		href: "/docs/quickstart",
		breadcrumbs: ["Documentation"],
	},
	{
		id: "docs-why-rage",
		title: "Why RAGE",
		summary: "Understanding the benefits and use cases of RAGE",
		type: "page",
		href: "/docs/About/why-rage",
		breadcrumbs: ["Documentation", "About"],
	},
	{
		id: "docs-about-us",
		title: "About Us",
		summary: "Learn about the team behind Recurse",
		type: "page",
		href: "/docs/About/about-us",
		breadcrumbs: ["Documentation", "About"],
	},
	{
		id: "docs-pricing",
		title: "Pricing",
		summary: "Pricing information for Recurse",
		type: "page",
		href: "/docs/About/pricing",
		breadcrumbs: ["Documentation", "About"],
	},
	// API Documentation
	{
		id: "docs-api",
		title: "API Documentation",
		summary: "Complete API reference for RAGE",
		type: "page",
		href: "/docs/api-documentation",
		breadcrumbs: ["Documentation"],
	},
	{
		id: "docs-guide",
		title: "Guide",
		summary: "Comprehensive guides for using RAGE",
		type: "page",
		href: "/docs/guide",
		breadcrumbs: ["Documentation"],
	},
];

/**
 * Filter static pages by search term
 * Uses fuzzy matching on title and summary
 */
export function filterStaticPages(
	query: string,
	maxResults = 10,
): SearchItem[] {
	if (!query.trim()) {
		return [];
	}

	const lowerQuery = query.toLowerCase();
	const words = lowerQuery.split(/\s+/).filter(Boolean);

	// Score each page based on how well it matches the query
	const scored = staticPages
		.map((page) => {
			const titleLower = (page.title || "").toLowerCase();
			const summaryLower = (page.summary || "").toLowerCase();
			let score = 0;

			// Exact title match gets highest score
			if (titleLower === lowerQuery) {
				score += 100;
			} else if (titleLower.includes(lowerQuery)) {
				score += 50;
			}

			// Exact summary match
			if (summaryLower.includes(lowerQuery)) {
				score += 25;
			}

			// Word matches
			for (const word of words) {
				if (titleLower.includes(word)) {
					score += 10;
				}
				if (summaryLower.includes(word)) {
					score += 5;
				}
			}

			return { page, score };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults);

	return scored.map(({ page }) => page);
}
