import { createFromSource } from "fumadocs-core/search/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { source } from "@/lib/source";

// Regex for removing /docs prefix (defined at top level for performance)
const DOCS_PREFIX_REGEX = /^\/docs\//;
// Regex for splitting query into words
const QUERY_SPLIT_REGEX = /\s+/;

export async function GET(request: NextRequest) {
	const { GET: fumadocsGet } = createFromSource(source, {
		language: "english",
	});

	// Get the origin from the request
	const origin = request.headers.get("origin");

	// Determine allowed origins
	const allowedOrigins = [
		// Production www origin
		"https://www.recurse.cc",
		// Dev www origin
		"http://localhost:3002",
		// Dev dashboard origin (in case they want to search from dashboard too)
		"http://localhost:3001",
	];

	// Check if origin is allowed
	const isAllowedOrigin = origin && allowedOrigins.includes(origin);

	// Get search query
	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("query") || "";
	const queryLower = query.toLowerCase();
	const queryWords = queryLower
		.split(QUERY_SPLIT_REGEX)
		.filter((w) => w.length > 0);

	// Get the Fumadocs response (returns a Response object)
	const fumadocsResponse = await fumadocsGet(request);

	// Parse the response body
	const data = await fumadocsResponse.json();
	let itemsArray: unknown[] = [];
	if (Array.isArray(data?.items)) {
		itemsArray = data.items;
	} else if (Array.isArray(data)) {
		itemsArray = data;
	}

	type FumadocsItem = {
		type?: string;
		content?: unknown;
		hash?: string;
		url?: string;
		path?: string;
		title?: string;
		heading?: string;
	};

	// Extract text from React element children
	const extractTextFromChildren = (children: unknown): string => {
		if (typeof children === "string") {
			return children;
		}
		if (Array.isArray(children)) {
			return children
				.map((child) => {
					if (typeof child === "string") {
						return child;
					}
					if (child && typeof child === "object" && "props" in child) {
						return extractTextFromChildren(
							(child as { props?: { children?: unknown } }).props?.children,
						);
					}
					return "";
				})
				.join("");
		}
		if (children && typeof children === "object" && "props" in children) {
			return extractTextFromChildren(
				(children as { props?: { children?: unknown } }).props?.children,
			);
		}
		return "";
	};

	// Extract text from React element or string
	const extractTextFromTitle = (title: unknown): string => {
		if (typeof title === "string") {
			return title;
		}
		if (title && typeof title === "object" && "props" in title) {
			const reactElement = title as { props?: { children?: unknown } };
			return extractTextFromChildren(reactElement.props?.children);
		}
		return "";
	};

	// Extract headings from TOC array
	const extractHeadingsFromToc = (
		toc: unknown[],
		pagePath: string,
	): Array<{ title: string; url: string; level?: number }> => {
		const headings: Array<{ title: string; url: string; level?: number }> = [];
		for (const item of toc) {
			if (
				item &&
				typeof item === "object" &&
				"title" in item &&
				"url" in item
			) {
				const tocItem = item as {
					title: unknown;
					url: string;
					depth?: number;
				};
				const titleText = extractTextFromTitle(tocItem.title);
				if (!titleText) {
					continue;
				}
				const headingUrl = tocItem.url.startsWith("/")
					? tocItem.url
					: `${pagePath}${tocItem.url}`;
				headings.push({
					title: titleText,
					url: headingUrl,
					level: tocItem.depth,
				});
			}
		}
		return headings;
	};

	// Get all headings from a page using fumadocs source
	const getPageHeadings = (pageUrl: string) => {
		try {
			// Remove hash from URL to get page path
			const pagePath = pageUrl.split("#")[0];
			// Remove leading /docs if present
			const relativePath = pagePath.replace(DOCS_PREFIX_REGEX, "");

			const page = source.getPage(relativePath.split("/"));
			if (!page) {
				return [];
			}

			// Extract headings from page.data.toc (table of contents)
			const toc = page.data.toc;
			if (Array.isArray(toc)) {
				return extractHeadingsFromToc(toc, pagePath);
			}

			return [];
		} catch {
			return [];
		}
	};

	// Get headings from page source and search results, combined and deduplicated
	const getAllHeadingsForPage = (
		itemPagePath: string,
		allItems: FumadocsItem[],
		headingsCache: Map<
			string,
			Array<{ title: string; url: string; level?: number }>
		>,
	) => {
		// Get headings from cache or fetch them
		let pageHeadings = headingsCache.get(itemPagePath);
		if (!pageHeadings) {
			pageHeadings = getPageHeadings(itemPagePath);
			headingsCache.set(itemPagePath, pageHeadings);
		}

		// Also check headings from search results (they might match the query)
		const searchResultHeadings = allItems.filter((h) => {
			const headingPageUrl = (h.url || h.path || "").toString();
			const headingPagePath = headingPageUrl.split("#")[0];
			return (
				(h.type === "heading" || h.hash) &&
				headingPagePath === itemPagePath &&
				h.hash
			);
		});

		// Combine and deduplicate headings (prefer source headings over search results)
		const sourceHeadingsMap = new Map(
			pageHeadings.map((h) => {
				const anchor = h.url.split("#")[1] || "";
				return [anchor || h.url, { title: h.title, url: h.url, anchor }];
			}),
		);

		// Add search result headings if not already present
		for (const h of searchResultHeadings) {
			const headingUrl = (h.url || h.path || "").toString();
			const anchor = h.hash || headingUrl.split("#")[1] || "";
			const key = anchor || headingUrl;
			if (!sourceHeadingsMap.has(key)) {
				sourceHeadingsMap.set(key, {
					title: (h.content || h.title || h.heading || "") as string,
					url: headingUrl,
					anchor,
				});
			}
		}

		return {
			allHeadings: Array.from(sourceHeadingsMap.values()),
			tocHeadings: pageHeadings.map((h) => {
				const anchor = h.url.split("#")[1] || "";
				return { title: h.title, url: h.url, anchor, level: h.level };
			}),
		};
	};

	// Find closest heading from TOC based on anchor
	const findClosestHeadingFromToc = (
		itemAnchor: string,
		tocHeadings: Array<{
			title: string;
			url: string;
			anchor: string;
			level?: number;
		}>,
	) => {
		if (!itemAnchor || tocHeadings.length === 0) {
			return tocHeadings.length > 0 ? tocHeadings[0] : null;
		}

		const contentItemIndex = tocHeadings.findIndex(
			(h) => h.anchor === itemAnchor,
		);
		if (contentItemIndex > 0) {
			return tocHeadings[contentItemIndex - 1];
		}
		if (contentItemIndex === -1 && tocHeadings.length > 0) {
			return tocHeadings[0];
		}
		return null;
	};

	// Find closest heading using anchor matching
	const findClosestByAnchor = (
		itemAnchor: string,
		allHeadings: Array<{ title: string; url: string; anchor: string }>,
		tocHeadings: Array<{
			title: string;
			url: string;
			anchor: string;
			level?: number;
		}>,
	) => {
		if (!itemAnchor || allHeadings.length === 0) {
			return allHeadings.length > 0 ? allHeadings[0] : null;
		}

		// Try to find heading with matching anchor first
		const itemAnchorIndex = allHeadings.findIndex(
			(h) => h.anchor === itemAnchor,
		);
		if (itemAnchorIndex > 0) {
			return allHeadings[itemAnchorIndex - 1];
		}
		if (itemAnchorIndex === -1) {
			// Use TOC to find closest heading
			return findClosestHeadingFromToc(itemAnchor, tocHeadings);
		}
		return null;
	};

	// Process items to enrich content items with heading breadcrumbs
	const findClosestHeadingForItem = (
		item: FumadocsItem,
		allItems: FumadocsItem[],
		headingsCache: Map<
			string,
			Array<{ title: string; url: string; level?: number }>
		>,
	) => {
		const itemPageUrl = (item.url || item.path || "").toString();
		const itemPagePath = itemPageUrl.split("#")[0];
		const itemAnchor = itemPageUrl.split("#")[1];

		const { allHeadings, tocHeadings } = getAllHeadingsForPage(
			itemPagePath,
			allItems,
			headingsCache,
		);

		// Find the closest heading that precedes this content item
		let closestHeading = findClosestByAnchor(
			itemAnchor,
			allHeadings,
			tocHeadings,
		);

		// Fallback: use first heading if no match found
		if (!closestHeading && allHeadings.length > 0) {
			closestHeading = allHeadings[0];
		}

		const headingBreadcrumb = closestHeading
			? [closestHeading.title].filter(Boolean)
			: [];

		return {
			headingBreadcrumb,
			closestHeading: closestHeading
				? {
						title: closestHeading.title,
						url: closestHeading.url,
					}
				: null,
		};
	};

	// Cache for page headings to avoid duplicate fetches
	const pageHeadingsCache = new Map<
		string,
		Array<{ title: string; url: string; level?: number }>
	>();

	// Count keyword frequency per page and group by page → heading → content
	type PageScore = {
		pageUrl: string;
		pageTitle: string;
		score: number;
		headings: Map<
			string,
			{
				title: string;
				url: string;
				content: Array<{
					title: string;
					content: string;
					url: string;
					id: string;
				}>;
			}
		>;
	};

	// Helper to calculate relevance score
	const calculateScore = (text: string): number => {
		if (!text) {
			return 0;
		}
		if (!queryLower) {
			return 0;
		}
		const textLower = text.toLowerCase();
		let score = 0;
		for (const word of queryWords) {
			// Count occurrences of word in text
			const matches = textLower.match(new RegExp(word, "g"));
			if (matches) {
				score += matches.length;
			}
		}
		// Bonus for exact phrase match
		if (textLower.includes(queryLower)) {
			score += 5;
		}
		return score;
	};

	const pageScores = new Map<string, PageScore>();

	// Debug: log item types we receive
	const itemTypeCounts = new Map<string, number>();
	for (const item of itemsArray as FumadocsItem[]) {
		const itemType = item.type || "no-type";
		itemTypeCounts.set(itemType, (itemTypeCounts.get(itemType) || 0) + 1);
	}

	// Process items and group by page → heading
	for (const item of itemsArray as FumadocsItem[]) {
		const itemUrl = (item.url || item.path || "").toString();
		const pageUrl = itemUrl.split("#")[0];
		const itemAnchor = itemUrl.split("#")[1];

		if (!pageUrl) {
			continue;
		}

		// Get or create page score
		let pageScore = pageScores.get(pageUrl);
		if (!pageScore) {
			// Find page title
			const pageItem = (itemsArray as FumadocsItem[]).find((i) => {
				const itemPageUrl = (i.url || i.path || "").toString().split("#")[0];
				const isPageType = i.type === "page";
				const hasNoType = !i.type;
				const hasNoHash = !i.hash;
				const isPageItem = isPageType || (hasNoType && hasNoHash);
				return isPageItem && itemPageUrl === pageUrl;
			});
			const pageTitle = (pageItem?.title ||
				pageItem?.content ||
				"Untitled") as string;

			pageScore = {
				pageUrl,
				pageTitle: extractTextFromTitle(pageTitle),
				score: 0,
				headings: new Map(),
			};
			pageScores.set(pageUrl, pageScore);
		}

		// Determine item type
		const hasNoType = !item.type;
		const hasNoHash = !item.hash;
		const hasNoContent = !item.content;
		const isPageType = item.type === "page";
		const isHeadingType = item.type === "heading";
		const isTextType = item.type === "text";

		const isPage = isPageType || (hasNoType && hasNoHash && hasNoContent);
		const hasHash = Boolean(item.hash);
		const isHeading = isHeadingType || (hasHash && hasNoContent);
		const hasContentValue = Boolean(item.content);
		const isContentItem = isTextType || hasContentValue;
		const isContent = isContentItem && !isPage && !isHeading;

		// Debug: log first few items to understand classification
		if (itemsArray.indexOf(item) < 5) {
			let _classifiedAs = "unknown";
			if (isPage) {
				_classifiedAs = "page";
			} else if (isHeading) {
				_classifiedAs = "heading";
			} else if (isContent) {
				_classifiedAs = "content";
			}
		}

		if (isPage) {
			// Page match - boost score
			const pageText = (item.title || item.content || "") as string;
			pageScore.score += calculateScore(pageText) * 2; // Pages get higher weight
		} else if (isHeading) {
			// Heading match - create heading entry
			const headingTitle = extractTextFromTitle(
				(item.title || item.content || item.heading || "") as string,
			);
			if (!pageScore.headings.has(itemAnchor || itemUrl)) {
				pageScore.headings.set(itemAnchor || itemUrl, {
					title: headingTitle,
					url: itemUrl,
					content: [],
				});
			}
			// Boost score for heading matches
			pageScore.score += calculateScore(headingTitle) * 1.5;
		} else if (isContent) {
			// Content match - find closest heading and add to it
			const { closestHeading } = findClosestHeadingForItem(
				item,
				itemsArray as FumadocsItem[],
				pageHeadingsCache,
			);

			const headingTitle = closestHeading
				? extractTextFromTitle(closestHeading.title)
				: null;
			const headingUrl = closestHeading?.url || "";
			const headingAnchor = headingUrl.split("#")[1] || "";
			const headingKey = headingAnchor || headingUrl || "unassigned";

			// Get or create heading
			let heading = pageScore.headings.get(headingKey);
			if (!heading && headingTitle) {
				heading = {
					title: headingTitle,
					url: headingUrl || `${pageUrl}#${headingAnchor}`,
					content: [],
				};
				pageScore.headings.set(headingKey, heading);
			} else if (!heading) {
				// No heading found - create unassigned group
				heading = {
					title: "Content",
					url: pageUrl,
					content: [],
				};
				pageScore.headings.set("unassigned", heading);
			}

			// Add content item
			const contentText = (item.title || item.content || "") as string;
			const contentTitle = extractTextFromTitle(contentText);
			heading.content.push({
				title: contentTitle,
				content: contentText.slice(0, 200),
				url: itemUrl,
				id: itemUrl,
			});

			// Add to page score
			pageScore.score += calculateScore(contentText);
		}
	}

	// Convert to array and sort by score
	const rankedPages = Array.from(pageScores.values())
		.filter((page) => page.score > 0) // Only pages with matches
		.sort((a, b) => b.score - a.score) // Sort by score descending
		.slice(0, 20); // Limit to top 20 pages

	// Debug: log page structure before converting
	if (rankedPages.length > 0) {
	}

	// Convert to response format: pages with headings and content nested
	const responseData = rankedPages.map((page) => {
		// Include ALL headings, even if they don't have direct content matches
		// They might have nested headings or be important structural elements
		const headingsArray = Array.from(page.headings.values());

		return {
			type: "page",
			id: page.pageUrl,
			title: page.pageTitle,
			url: page.pageUrl,
			score: page.score,
			headings: headingsArray.map((heading) => ({
				type: "heading",
				id: heading.url,
				title: heading.title,
				url: heading.url,
				content: heading.content.map((item) => ({
					type: "text",
					id: item.id,
					title: item.title,
					content: item.content,
					url: item.url,
					closestHeading: {
						title: heading.title,
						url: heading.url,
					},
				})),
			})),
		};
	});

	const responseBody = JSON.stringify(responseData);

	// Create NextResponse with the processed body
	const response = new NextResponse(responseBody, {
		status: fumadocsResponse.status,
		statusText: fumadocsResponse.statusText,
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Copy existing headers from fumadocs response (except Content-Type which we set)
	fumadocsResponse.headers.forEach((value, key) => {
		if (key.toLowerCase() !== "content-type") {
			response.headers.set(key, value);
		}
	});

	// Add CORS headers
	if (isAllowedOrigin) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type");
		response.headers.set("Access-Control-Max-Age", "86400");
	}

	return response;
}

// Handle OPTIONS preflight requests
export function OPTIONS(request: NextRequest) {
	const origin = request.headers.get("origin");

	const allowedOrigins = [
		"https://www.recurse.cc",
		"http://localhost:3002",
		"http://localhost:3001",
	];

	const isAllowedOrigin = origin && allowedOrigins.includes(origin);

	const response = new NextResponse(null, {
		status: 204,
	});

	if (isAllowedOrigin) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type");
		response.headers.set("Access-Control-Max-Age", "86400");
	}

	return response;
}
