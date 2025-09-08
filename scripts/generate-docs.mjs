import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, readdir, rm, stat, unlink, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { generateFilesOnly } from "fumadocs-openapi";

const GENERATED_HEADER =
	"<!-- AUTO-GENERATED: fumadocs-openapi (safe to overwrite) -->\n\n";

const options = {
	input: ["http://localhost:8000/openapi.json"],
	output: "./content/docs/(API Documentation)",
	includeDescription: true,
	groupBy: "route",
	name: { algorithm: "v2" },
};

// Clean previously generated files while preserving meta.json files
async function cleanOutputExceptMeta(root) {
    try {
        const entries = await readdir(root, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(root, entry.name);
            if (entry.isDirectory()) {
                await cleanOutputExceptMeta(full);
                // remove dir if empty after cleaning
                try {
                    await rm(full, { recursive: false });
                } catch {}
                continue;
            }

            // Preserve meta.json files
            if (entry.name.toLowerCase() === "meta.json") continue;

            await unlink(full);
        }
    } catch (err) {
        // ignore when folder doesn't exist
    }
}

await cleanOutputExceptMeta(options.output);

const files = await generateFilesOnly(options);

function flattenPathForSearch(originalPath) {
	// Only flatten under the Search group directory
	const groupRoot = path.join(options.output, "search");
	const normalized = path.normalize(originalPath);
	if (!normalized.startsWith(groupRoot + path.sep)) return originalPath;

	// Compute path inside search folder (relative subpath after search/)
	const inside = path.relative(groupRoot, normalized);
	if (!inside.includes(path.sep)) return originalPath;

	// Replace nested segments with dashes to create a flat filename
	// e.g. frames/status/job_id/get.mdx -> frames-status-job_id-get.mdx
	const flatName = inside.split(path.sep).join("-");
	return path.join(groupRoot, flatName);
}

let written = 0;
let skipped = 0;

for (const file of files) {
	// Optionally rewrite paths to flatten search/* subtrees
	const targetPath = flattenPathForSearch(file.path);
	const dir = path.dirname(targetPath);
	await mkdir(dir, { recursive: true });

	let existing = null;
	try {
		await access(targetPath, fsConstants.F_OK);
		existing = await readFile(targetPath, "utf8");
	} catch {}

	if (existing != null && !existing.startsWith("<!-- AUTO-GENERATED:")) {
		// manual edit detected; skip overwriting
		skipped++;
		continue;
	}

	const content = `${GENERATED_HEADER}${file.content}`;
	await writeFile(targetPath, content, "utf8");
	written++;
}

console.log(`OpenAPI docs: written ${written}, skipped ${skipped}`);
