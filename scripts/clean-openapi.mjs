import { readdir, readFile, rm } from "node:fs/promises";
import * as path from "node:path";

const ROOT = "content/docs/api-documentation";
const HEADER_PREFIX = "<!-- AUTO-GENERATED:";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!entry.name.endsWith(".mdx")) continue;
    try {
      const text = await readFile(full, "utf8");
      if (text.startsWith(HEADER_PREFIX)) {
        await rm(full);
        console.log("Removed", full);
      }
    } catch {}
  }
}

await walk(ROOT);
console.log("Cleaned auto-generated OpenAPI docs.");
