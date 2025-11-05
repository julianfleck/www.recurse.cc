import { loader } from "fumadocs-core/source";
import { transformerOpenAPI } from "fumadocs-openapi/server";
import { resolveIcon } from "@recurse/fumadocs/icons";
import { dashboard, docs } from "@/.source";

// Docs source for documentation pages
export const docsSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      transformerOpenAPI(),
      // Custom transformer to support sidebar_label
      {
        name: "sidebar-label",
        file(node, filePath) {
          if (filePath?.endsWith(".mdx")) {
            try {
              const fs = require("node:fs");
              const path = require("node:path");
              const contentDir = path.join(process.cwd(), "content/docs");
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

// Dashboard source for dashboard pages
export const dashboardSource = loader({
  baseUrl: "/dashboard",
  source: dashboard.toFumadocsSource(),
  pageTree: {
    resolveIcon(icon) {
      return resolveIcon(icon);
    },
  },
});

// Combined source for layouts that need both
export const combinedSource = {
  docs: docsSource,
  dashboard: dashboardSource,
};

// Export the docs source as default for backward compatibility
export const source = docsSource;

// Helper functions to get pages from specific sources
export function getPages(sourceType: "docs" | "dashboard" = "docs") {
  const source = sourceType === "docs" ? docsSource : dashboardSource;
  return source.getPages();
}

export function getPage(
  slugs: string[],
  sourceType: "docs" | "dashboard" = "docs"
) {
  const source = sourceType === "docs" ? docsSource : dashboardSource;
  return source.getPage(slugs);
}
