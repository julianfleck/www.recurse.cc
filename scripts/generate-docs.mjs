import { constants as fsConstants } from "node:fs";
import {
	access,
	mkdir,
	readdir,
	readFile,
	rm,
	unlink,
	writeFile,
} from "node:fs/promises";
import * as path from "node:path";
import { generateFilesOnly } from "fumadocs-openapi";

const GENERATED_HEADER = "<!-- AUTO-GENERATED: fumadocs-openapi (safe to overwrite) -->";

const options = {
	input: ["http://localhost:8000/openapi.json"],
	output: "./content/docs/(API Documentation)",
	includeDescription: true,
	groupBy: "route",
	name: { algorithm: "v2" },
};

// Clean previously generated files while preserving ONLY root meta.json
async function cleanOutput(root) {
	try {
		const entries = await readdir(root, { withFileTypes: true });
		for (const entry of entries) {
			const full = path.join(root, entry.name);
			// keep root meta.json, remove everything else recursively
			if (entry.isFile() && entry.name.toLowerCase() === "meta.json") continue;
			await rm(full, { recursive: true, force: true });
		}
	} catch (err) {
		// ignore when folder doesn't exist
	}
}

await cleanOutput(options.output);

const files = await generateFilesOnly(options);

function flattenPathAllGroups(originalPath) {
	// Flatten any nested path inside any first-level group under options.output
	const normalized = path.normalize(originalPath);
	const rel = path.relative(options.output, normalized);
	const parts = rel.split(path.sep);
	if (parts.length <= 2) return originalPath; // already flat (group/file)
	const group = parts[0];
	const tail = parts.slice(1).join("-");
	return path.join(options.output, group, tail);
}

let written = 0;
let skipped = 0;

for (const file of files) {
	// Flatten nested subfolders for all groups
	const targetPath = flattenPathAllGroups(file.path);
	const dir = path.dirname(targetPath);
	await mkdir(dir, { recursive: true });

	let existing = null;
	try {
		await access(targetPath, fsConstants.F_OK);
		existing = await readFile(targetPath, "utf8");
	} catch {}

	if (
		existing != null &&
		!existing.includes("AUTO-GENERATED: fumadocs-openapi")
	) {
		// manual edit detected; skip overwriting
		skipped++;
		continue;
	}

	// Insert header after frontmatter if present
	let content = file.content;
	if (content.startsWith("---")) {
		const lines = content.split(/\r?\n/);
		let endIdx = -1;
		for (let i = 1; i < lines.length; i++) {
			if (lines[i].trim() === "---") {
				endIdx = i;
				break;
			}
		}
		if (endIdx !== -1) {
			const frontmatter = lines.slice(0, endIdx + 1).join("\n");
			const rest = lines.slice(endIdx + 1).join("\n");
			content = `${frontmatter}\n\n${GENERATED_HEADER}\n\n${rest}`;
		} else {
			content = `${GENERATED_HEADER}\n\n${content}`;
		}
	} else {
		content = `${GENERATED_HEADER}\n\n${content}`;
	}
	await writeFile(targetPath, content, "utf8");
	written++;
}

console.log(`OpenAPI docs: written ${written}, skipped ${skipped}`);
