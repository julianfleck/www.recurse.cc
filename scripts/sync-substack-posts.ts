import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { XMLParser } from "fast-xml-parser";
import matter from "gray-matter";
import TurndownService from "turndown";

type FeedItem = {
	title: string;
	link: string;
	guid: string | { "#text": string };
	description?: string;
	category?: string | string[];
	"content:encoded"?: string;
	pubDate: string;
	enclosure?: {
		"@_url"?: string;
	};
	"dc:creator"?: string;
};

type SyncCache = {
	processed: Record<string, string>;
};

type BlogConfiguration = {
	rssFeeds: string[];
	tagWhitelist: string[];
	tagBlacklist: string[];
	titleBlacklist: string[];
};

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, "content", "blog");
const CONFIG_PATH = path.join(CONTENT_ROOT, "configuration.json");
const CACHE_PATH = path.join(ROOT, "scripts", ".substack-sync.json");
const MAX_ITEMS = Number(process.env.SUBSTACK_MAX_ITEMS ?? 10);

const turndown = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
});

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

async function ensureDir(dir: string) {
	await mkdir(dir, { recursive: true });
}

async function loadJSON<T>(filePath: string, fallback: T): Promise<T> {
	try {
		const raw = await readFile(filePath, "utf8");
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

async function saveJSON(filePath: string, data: unknown) {
	await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function loadConfig(): Promise<BlogConfiguration> {
	return loadJSON<BlogConfiguration>(CONFIG_PATH, {
		rssFeeds: ["https://j0lian.substack.com/feed"],
		tagWhitelist: [],
		tagBlacklist: [],
		titleBlacklist: [],
	});
}

async function loadCache(): Promise<SyncCache> {
	return loadJSON<SyncCache>(CACHE_PATH, { processed: {} });
}

async function saveCache(cache: SyncCache) {
	await saveJSON(CACHE_PATH, cache);
}

function toArray<T>(value: T | T[] | undefined): T[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

/**
 * Matches a string against a wildcard pattern.
 * Supports '*' for any sequence of characters.
 * Example: "You are the*" matches "You are the attractor..."
 */
function matchesWildcard(text: string, pattern: string): boolean {
	// Escape special regex characters except *
	const escapedPattern = pattern
		.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
		.replace(/\*/g, ".*");
	const regex = new RegExp(`^${escapedPattern}$`, "i");
	return regex.test(text);
}

function shouldInclude(item: FeedItem, config: BlogConfiguration): boolean {
	const title = item.title?.trim() ?? "";
	
	// Check title blacklist (wildcard matching)
	for (const blacklistPattern of config.titleBlacklist) {
		if (matchesWildcard(title, blacklistPattern)) {
			return false;
		}
	}

	const categories = toArray(item.category).map((tag) => tag.toLowerCase());
	
	// If whitelist exists, item must have at least one matching tag
	if (config.tagWhitelist.length > 0) {
		const normalizedWhitelist = config.tagWhitelist.map((tag) => tag.toLowerCase());
		const hasWhitelistedTag = categories.some((tag) =>
			normalizedWhitelist.some((whitelistTag) => matchesWildcard(tag, whitelistTag))
		);
		if (!hasWhitelistedTag) {
			return false;
		}
	}

	// Check tag blacklist (wildcard matching)
	const normalizedBlacklist = config.tagBlacklist.map((tag) => tag.toLowerCase());
	for (const blacklistPattern of normalizedBlacklist) {
		if (categories.some((tag) => matchesWildcard(tag, blacklistPattern))) {
			return false;
		}
	}

	return true;
}

async function fetchFeed(feedUrl: string): Promise<FeedItem[]> {
	const response = await fetch(feedUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch RSS feed ${feedUrl} (${response.status})`);
	}
	const xmlText = await response.text();
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
	});
	const parsed = parser.parse(xmlText);
	const items: FeedItem[] = parsed?.rss?.channel?.item ?? [];
	return items;
}

async function writeFrontmatterFile(
	targetPath: string,
	content: string,
	frontmatter: Record<string, unknown>,
) {
	const finalContent = matter.stringify(content, frontmatter);
	await writeFile(targetPath, finalContent, "utf8");
}

async function updateYearMeta(yearDir: string, slug: string, year: string) {
	const metaPath = path.join(yearDir, "meta.json");
	const meta = await loadJSON(metaPath, {
		title: year,
		pages: [],
		defaultOpen: true,
		icon: "book",
	});

	if (!meta.pages.includes(slug)) {
		meta.pages.unshift(slug);
		await saveJSON(metaPath, meta);
	}
}

async function updateRootMeta(year: string) {
	const metaPath = path.join(CONTENT_ROOT, "meta.json");
	const meta = await loadJSON(metaPath, { pages: [] });

	if (!meta.pages.includes(year)) {
		meta.pages.unshift(year);
		await saveJSON(metaPath, meta);
	}
}

async function fileExists(filePath: string) {
	try {
		await access(filePath, fsConstants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function processItem(
	item: FeedItem,
	cache: SyncCache,
	config: BlogConfiguration,
): Promise<{ slug: string; path: string } | undefined> {
	const guid = typeof item.guid === "string" ? item.guid : item.guid?.["#text"];
	if (!guid) return undefined;
	if (cache.processed[guid]) {
		return undefined;
	}

	if (!shouldInclude(item, config)) {
		return undefined;
	}

	const title = item.title?.trim();
	if (!title) return undefined;

	const slug = slugify(title);
	const publishedAt = new Date(item.pubDate);
	if (Number.isNaN(publishedAt.valueOf())) {
		return undefined;
	}
	const year = String(publishedAt.getUTCFullYear());
	const yearDir = path.join(CONTENT_ROOT, year);
	const targetPath = path.join(yearDir, `${slug}.mdx`);

	const exists = await fileExists(targetPath);
	if (exists) {
		cache.processed[guid] = targetPath;
		return undefined;
	}

	const html = item["content:encoded"] ?? item.description ?? "";
	const mdxBody = turndown.turndown(html);
	const frontmatter = {
		title,
		description: item.description?.trim(),
		publishedAt: publishedAt.toISOString(),
		tags: toArray(item.category),
		substackUrl: item.link,
		heroImage: item.enclosure?.["@_url"],
		author: item["dc:creator"] ?? "Recurse Team",
		sidebar_label: title,
	};

	await ensureDir(yearDir);
	await writeFrontmatterFile(targetPath, mdxBody, frontmatter);
	await updateYearMeta(yearDir, slug, year);
	await updateRootMeta(year);

	cache.processed[guid] = targetPath;
	return { slug, path: targetPath };
}

async function main() {
	const config = await loadConfig();
	console.log("→ Loading blog configuration from:", CONFIG_PATH);
	console.log(`   RSS Feeds: ${config.rssFeeds.length}`);
	console.log(`   Tag whitelist: ${config.tagWhitelist.length > 0 ? config.tagWhitelist.join(", ") : "none"}`);
	console.log(`   Tag blacklist: ${config.tagBlacklist.length > 0 ? config.tagBlacklist.join(", ") : "none"}`);
	console.log(`   Title blacklist: ${config.titleBlacklist.length > 0 ? config.titleBlacklist.join(", ") : "none"}`);

	const cache = await loadCache();
	const allItems: FeedItem[] = [];

	// Fetch from all configured RSS feeds
	for (const feedUrl of config.rssFeeds) {
		console.log(`→ Fetching RSS feed: ${feedUrl}`);
		try {
			const items = await fetchFeed(feedUrl);
			allItems.push(...items);
			console.log(`   ✓ Found ${items.length} items`);
		} catch (error) {
			console.error(`   ✗ Failed to fetch feed ${feedUrl}:`, error);
		}
	}

	// Sort by publication date (newest first) and limit
	const sortedItems = allItems
		.sort((a, b) => {
			const dateA = new Date(a.pubDate).valueOf();
			const dateB = new Date(b.pubDate).valueOf();
			return dateB - dateA;
		})
		.slice(0, MAX_ITEMS);

	const created: { slug: string; path: string }[] = [];

	for (const item of sortedItems) {
		try {
			const result = await processItem(item, cache, config);
			if (result) {
				created.push(result);
			}
		} catch (error) {
			console.error("Failed to process feed item:", item?.title ?? "<unknown>", error);
		}
	}

	await saveCache(cache);

	if (created.length === 0) {
		console.log("✓ No new posts to sync");
		return;
	}

	console.log(`✓ Synced ${created.length} new post(s):`);
	for (const entry of created) {
		console.log(`   • ${entry.slug} (${entry.path})`);
	}
}

main().catch((error) => {
	console.error("Substack sync failed:", error);
	process.exitCode = 1;
});


