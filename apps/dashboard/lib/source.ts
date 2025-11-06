import { resolveIcon } from "@recurse/fumadocs/icons";
import { loader } from "fumadocs-core/source";
import { dashboard, docs } from "@/.source";

// Docs source for documentation pages only (without API docs transformer)
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

// Dashboard source for dashboard pages (without API docs transformer)
export const dashboardSource = loader({
  baseUrl: "/",
  source: dashboard.toFumadocsSource(),
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
              const contentDir = path.join(process.cwd(), "content/dashboard");
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
