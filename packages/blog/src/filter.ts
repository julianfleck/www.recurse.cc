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
 */
export function loadBlogConfig(rootDir: string = process.cwd()): BlogConfiguration {
	const configPath = join(rootDir, "content", "blog", "configuration.json");
	try {
		const raw = readFileSync(configPath, "utf8");
		return JSON.parse(raw) as BlogConfiguration;
	} catch {
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
	// Escape special regex characters except *
	const escapedPattern = pattern
		.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
		.replace(/\*/g, ".*");
	const regex = new RegExp(`^${escapedPattern}$`, "i");
	return regex.test(text);
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

