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

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, "content", "blog");
const CACHE_PATH = path.join(ROOT, "scripts", ".substack-sync.json");
const FEED_URL = process.env.SUBSTACK_FEED_URL ?? "https://j0lian.substack.com/feed";
const TAG_FILTER = process.env.SUBSTACK_TAG_FILTER
	?.split(",")
	.map((tag) => tag.trim().toLowerCase())
	.filter(Boolean);
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

function shouldInclude(item: FeedItem): boolean {
	if (!TAG_FILTER?.length) {
		return true;
	}

	const categories = toArray(item.category).map((tag) => tag.toLowerCase());
	return categories.some((tag) => TAG_FILTER.includes(tag));
}

async function fetchFeed(): Promise<FeedItem[]> {
	const response = await fetch(FEED_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch RSS feed (${response.status})`);
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
): Promise<{ slug: string; path: string } | undefined> {
	const guid = typeof item.guid === "string" ? item.guid : item.guid?.["#text"];
	if (!guid) return undefined;
	if (cache.processed[guid]) {
		return undefined;
	}

	if (!shouldInclude(item)) {
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
	console.log("→ syncing Substack feed:", FEED_URL);
	const cache = await loadCache();
	const items = (await fetchFeed()).slice(0, MAX_ITEMS);
	const created: { slug: string; path: string }[] = [];

	for (const item of items) {
		try {
			const result = await processItem(item, cache);
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


