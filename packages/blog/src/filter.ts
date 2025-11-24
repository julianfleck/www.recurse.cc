import { readFileSync } from "node:fs";
import { join } from "node:path";

export type BlogConfiguration = {
	rssFeeds: string[];
	tagWhitelist: string[];
	tagBlacklist: string[];
	titleBlacklist: string[];
};

export type BlogItem = {
	title: string;
	tags?: string[] | string;
};

/**
 * Loads blog configuration from content/blog/configuration.json
 * Resolves from monorepo root, handling both direct execution and Next.js server components
 */
export function loadBlogConfig(rootDir?: string): BlogConfiguration {
	// If rootDir not provided, try to find monorepo root
	let configRoot = rootDir;
	if (!configRoot) {
		const cwd = process.cwd();
		// If we're in apps/www or apps/docs, go up to monorepo root
		if (cwd.includes("/apps/")) {
			configRoot = join(cwd, "..", "..");
		} else {
			configRoot = cwd;
		}
	}
	
	const configPath = join(configRoot, "content", "blog", "configuration.json");
	try {
		const raw = readFileSync(configPath, "utf8");
		const parsed = JSON.parse(raw) as BlogConfiguration;
		
		// Debug: log config loading in development
		if (process.env.NODE_ENV === "development") {
			console.log(`[Blog Config] Loaded from: ${configPath}`);
			console.log(`[Blog Config] Title blacklist:`, parsed.titleBlacklist);
		}
		
		return parsed;
	} catch (error) {
		// Debug: log error in development
		if (process.env.NODE_ENV === "development") {
			console.error(`[Blog Config] Failed to load from ${configPath}:`, error);
		}
		// Return defaults if config file doesn't exist
		return {
			rssFeeds: ["https://j0lian.substack.com/feed"],
			tagWhitelist: [],
			tagBlacklist: [],
			titleBlacklist: [],
		};
	}
}

/**
 * Matches a string against a wildcard pattern.
 * Supports '*' for any sequence of characters.
 * Example: "You are the*" matches "You are the attractor..."
 */
export function matchesWildcard(text: string, pattern: string): boolean {
	if (!text || !pattern) return false;
	
	// Trim both for comparison
	const trimmedText = text.trim();
	const trimmedPattern = pattern.trim();
	
	// Escape special regex characters except *
	const escapedPattern = trimmedPattern
		.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
		.replace(/\*/g, ".*");
	const regex = new RegExp(`^${escapedPattern}$`, "i");
	return regex.test(trimmedText);
}

/**
 * Normalizes tags to an array of lowercase strings
 */
function normalizeTags(tags: string[] | string | undefined): string[] {
	if (!tags) return [];
	if (typeof tags === "string") return [tags.toLowerCase()];
	return tags.map((tag) => tag.toLowerCase());
}

/**
 * Checks if a blog item should be included based on configuration filters
 */
export function shouldIncludeBlogItem(
	item: BlogItem,
	config: BlogConfiguration,
): boolean {
	const title = item.title?.trim() ?? "";

	// Check title blacklist (wildcard matching)
	for (const blacklistPattern of config.titleBlacklist) {
		if (matchesWildcard(title, blacklistPattern)) {
			// Debug: log when article is filtered out
			if (process.env.NODE_ENV === "development") {
				console.log(`[Blog Filter] Excluding article: "${title}" (matched pattern: "${blacklistPattern}")`);
			}
			return false;
		}
	}

	const tags = normalizeTags(item.tags);

	// If whitelist exists, item must have at least one matching tag
	if (config.tagWhitelist.length > 0) {
		const normalizedWhitelist = config.tagWhitelist.map((tag) => tag.toLowerCase());
		const hasWhitelistedTag = tags.some((tag) =>
			normalizedWhitelist.some((whitelistTag) => matchesWildcard(tag, whitelistTag))
		);
		if (!hasWhitelistedTag) {
			return false;
		}
	}

	// Check tag blacklist (wildcard matching)
	const normalizedBlacklist = config.tagBlacklist.map((tag) => tag.toLowerCase());
	for (const blacklistPattern of normalizedBlacklist) {
		if (tags.some((tag) => matchesWildcard(tag, blacklistPattern))) {
			return false;
		}
	}

	return true;
}

