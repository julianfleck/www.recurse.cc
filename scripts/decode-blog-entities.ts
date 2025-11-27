import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, "content", "blog");

function decodeHtmlEntities(text: string): string {
	if (!text) return text;
	
	// Decode numeric entities like &#8127; or &#x1F4A9;
	// Use fromCodePoint to handle all Unicode code points (including > 65535)
	let decoded = text.replace(/&#(\d+);|&#x([0-9A-Fa-f]+);/g, (match, dec, hex) => {
		const codePoint = dec ? Number.parseInt(dec, 10) : Number.parseInt(hex, 16);
		try {
			return String.fromCodePoint(codePoint);
		} catch {
			// Fallback for invalid code points
			return match;
		}
	});
	
	// Decode named entities like &apos; &amp; &quot; &lt; &gt;
	// Order matters: &amp; must be last to avoid double-decoding
	decoded = decoded
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&nbsp;/g, " ")
		.replace(/&mdash;/g, "—")
		.replace(/&ndash;/g, "–")
		.replace(/&hellip;/g, "…")
		.replace(/&amp;/g, "&");
	
	return decoded;
}

async function getAllMdxFiles(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });
	
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		
		if (entry.isDirectory()) {
			// Recursively search subdirectories
			const subFiles = await getAllMdxFiles(fullPath);
			files.push(...subFiles);
		} else if (entry.isFile() && entry.name.endsWith(".mdx")) {
			files.push(fullPath);
		}
	}
	
	return files;
}

async function processFile(filePath: string): Promise<boolean> {
	try {
		const content = await readFile(filePath, "utf8");
		const parsed = matter(content);
		
		// Check if title or description contain HTML entities
		const originalTitle = parsed.data.title as string | undefined;
		const originalDescription = parsed.data.description as string | undefined;
		
		if (!originalTitle && !originalDescription) {
			return false; // No frontmatter fields to decode
		}
		
		// Decode HTML entities
		const decodedTitle = originalTitle ? decodeHtmlEntities(originalTitle) : undefined;
		const decodedDescription = originalDescription ? decodeHtmlEntities(originalDescription) : undefined;
		
		// Check if anything changed
		const titleChanged = decodedTitle !== originalTitle;
		const descriptionChanged = decodedDescription !== originalDescription;
		
		if (!titleChanged && !descriptionChanged) {
			return false; // No changes needed
		}
		
		// Update frontmatter
		const updatedFrontmatter = {
			...parsed.data,
			...(decodedTitle !== undefined && { title: decodedTitle }),
			...(decodedDescription !== undefined && { description: decodedDescription }),
			// Also update sidebar_label if it matches the title
			...(parsed.data.sidebar_label === originalTitle && decodedTitle && {
				sidebar_label: decodedTitle,
			}),
		};
		
		// Reconstruct file content
		const updatedContent = matter.stringify(parsed.content, updatedFrontmatter);
		
		// Write back to file
		await writeFile(filePath, updatedContent, "utf8");
		
		return true;
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error);
		return false;
	}
}

async function main() {
	console.log("→ Scanning for blog posts with HTML entities...");
	console.log(`   Content directory: ${CONTENT_ROOT}`);
	
	const mdxFiles = await getAllMdxFiles(CONTENT_ROOT);
	console.log(`   Found ${mdxFiles.length} MDX file(s)`);
	
	if (mdxFiles.length === 0) {
		console.log("✓ No files to process");
		return;
	}
	
	let processed = 0;
	let updated = 0;
	let errors = 0;
	
	for (const filePath of mdxFiles) {
		processed++;
		const relativePath = path.relative(ROOT, filePath);
		const wasUpdated = await processFile(filePath);
		
		if (wasUpdated) {
			updated++;
			console.log(`   ✓ Updated: ${relativePath}`);
		} else {
			console.log(`   - Skipped: ${relativePath} (no entities found or already decoded)`);
		}
	}
	
	console.log("\n→ Summary:");
	console.log(`   Processed: ${processed} file(s)`);
	console.log(`   Updated: ${updated} file(s)`);
	console.log(`   Errors: ${errors} file(s)`);
	
	if (updated > 0) {
		console.log("\n✓ HTML entities decoded successfully!");
		console.log("   You may need to restart your dev server to see the changes.");
	} else {
		console.log("\n✓ No HTML entities found to decode.");
	}
}

main().catch((error) => {
	console.error("Decode blog entities failed:", error);
	process.exitCode = 1;
});

