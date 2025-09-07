import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
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

const files = await generateFilesOnly(options);

let written = 0;
let skipped = 0;

for (const file of files) {
	const dir = path.dirname(file.path);
	await mkdir(dir, { recursive: true });

	let existing = null;
	try {
		await access(file.path, fsConstants.F_OK);
		existing = await readFile(file.path, "utf8");
	} catch {}

	if (existing != null && !existing.startsWith("<!-- AUTO-GENERATED:")) {
		// manual edit detected; skip overwriting
		skipped++;
		continue;
	}

	const content = `${GENERATED_HEADER}${file.content}`;
	await writeFile(file.path, content, "utf8");
	written++;
}

console.log(`OpenAPI docs: written ${written}, skipped ${skipped}`);
