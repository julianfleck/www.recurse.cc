import type { SearchItem } from "./types";

/**
 * Static pages index for instant search without API calls
 * This is pre-populated with all documentation pages for faster initial results
 */
export const staticPages: SearchItem[] = [
	// Marketing Website Pages
	{
		id: "home",
		title: "Home",
		summary: "Turn your documents into living context for AI systems",
		type: "page",
		href: "/",
		breadcrumbs: [],
	},
	{
		id: "features",
		title: "Features",
		summary: "Explore the powerful features of RAGE",
		type: "page",
		href: "/features",
		breadcrumbs: [],
	},
	{
		id: "details",
		title: "Details",
		summary: "Learn more about how RAGE works",
		type: "page",
		href: "/details",
		breadcrumbs: [],
	},
	{
		id: "faq",
		title: "FAQ",
		summary: "Frequently asked questions about Recurse",
		type: "page",
		href: "/faq",
		breadcrumbs: [],
	},
	{
		id: "technology",
		title: "Technology",
		summary: "The technology behind RAGE",
		type: "page",
		href: "/technology",
		breadcrumbs: [],
	},
	// Feature Pages
	{
		id: "frame-parsing",
		title: "Semantic Frame Parsing",
		summary:
			"Automatically extract structured semantic frames from unstructured text, preserving meaning and relationships.",
		type: "page",
		href: "/features/frame-parsing",
		breadcrumbs: ["Features"],
	},
	{
		id: "recursive-memory",
		title: "Recursive Memory",
		summary:
			"Build knowledge graphs that learn from every interaction, creating self-improving memory systems.",
		type: "page",
		href: "/features/recursive-memory",
		breadcrumbs: ["Features"],
	},
	{
		id: "operations",
		title: "Context-Aware Operations",
		summary:
			"Smart operation suggestions that adapt to content type and context, with self-instructing capabilities.",
		type: "page",
		href: "/features/operations",
		breadcrumbs: ["Features"],
	},
	{
		id: "ingestion",
		title: "Multi-Source Ingestion",
		summary:
			"Ingest from any source—Slack, email, docs, audio—and transform into structured, queryable knowledge.",
		type: "page",
		href: "/features/ingestion",
		breadcrumbs: ["Features"],
	},
	// Documentation Pages
	{
		id: "docs-introduction",
		title: "Introduction",
		summary: "Get started with Recurse and RAGE",
		type: "page",
		href: "https://docs.recurse.cc/docs/introduction",
		breadcrumbs: ["Documentation"],
	},
	{
		id: "docs-quickstart",
		title: "Quickstart",
		summary: "Quick start guide for getting up and running",
		type: "page",
		href: "https://docs.recurse.cc/docs/quickstart",
		breadcrumbs: ["Documentation"],
	},
	{
		id: "docs-why-rage",
		title: "Why RAGE",
		summary: "Understanding the benefits and use cases of RAGE",
		type: "page",
		href: "https://docs.recurse.cc/docs/About/why-rage",
		breadcrumbs: ["Documentation", "About"],
	},
	{
		id: "docs-about-us",
		title: "About Us",
		summary: "Learn about the team behind Recurse",
		type: "page",
		href: "https://docs.recurse.cc/docs/About/about-us",
		breadcrumbs: ["Documentation", "About"],
	},
	{
		id: "docs-pricing",
		title: "Pricing",
		summary: "Pricing information for Recurse",
		type: "page",
		href: "https://docs.recurse.cc/docs/About/pricing",
		breadcrumbs: ["Documentation", "About"],
	},
	// API Documentation
	{
		id: "docs-api",
		title: "API Documentation",
		summary: "Complete API reference for RAGE",
		type: "page",
		href: "https://docs.recurse.cc/docs/api-documentation",
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
