import { resolveIcon } from "@recurse/fumadocs/icons";
import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";

// Docs source for documentation pages only
export const docsSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      // Custom transformer to support sidebar_label
      {
        name: "sidebar-label",
        file(node, filePath) {
          if (filePath?.endsWith(".mdx")) {
            try {
              const fs = require("node:fs");
              const path = require("node:path");
              // Read from root-level content directory (same as source.config.ts)
              // process.cwd() is apps/docs, so go up two levels to root
              const contentDir = path.join(process.cwd(), "../../content/docs");
              const fullPath = path.join(contentDir, filePath);

              if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, "utf-8");
                const sidebarMatch = content.match(/sidebar_label:\s*(.+)/);
                if (sidebarMatch) {
                  const sidebarLabel = sidebarMatch[1].replace(
                    /^["']|["']$/g,
                    ""
                  );
                  return {
                    ...node,
                    name: sidebarLabel,
                  };
                }
              }
            } catch (_error) {}
          }
          return node;
        },
      },
    ],
    resolveIcon(icon) {
      return resolveIcon(icon);
    },
  },
});

// Export the docs source as default for backward compatibility
export const source = docsSource;
