import { IconApi, IconRun, IconUserScreen } from "@tabler/icons-react";
import { loader } from "fumadocs-core/source";
import { transformerOpenAPI } from "fumadocs-openapi/server";
import {
  Book,
  Bot,
  Code,
  Download,
  Edit,
  FileText,
  FolderPlus,
  Globe,
  HandMetal,
  HelpCircle,
  Info,
  Lightbulb,
  Rocket,
  Rss,
  Share2,
  UserPlus,
} from "lucide-react";
import { createElement } from "react";
import { docs } from "@/.source";

// Docs source for documentation pages only
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

// Icon resolver function
function resolveIcon(icon?: string) {
  if (!icon) {
    return;
  }
  switch (icon.toLowerCase()) {
    // Lucide icons
    case "book":
      return createElement(Book, { className: "size-4" });
    case "rocket":
      return createElement(Rocket, { className: "size-4" });
    case "rss":
      return createElement(Rss, { className: "size-4" });
    case "bot":
      return createElement(Bot, { className: "size-4" });
    case "share2":
      return createElement(Share2, { className: "size-4" });
    case "info":
      return createElement(Info, { className: "size-4" });
    case "filetext":
      return createElement(FileText, { className: "size-4" });
    case "userplus":
      return createElement(UserPlus, { className: "size-4" });
    case "folderplus":
      return createElement(FolderPlus, { className: "size-4" });
    case "download":
      return createElement(Download, { className: "size-4" });
    case "code":
      return createElement(Code, { className: "size-4" });
    case "hand-metal":
      return createElement(HandMetal, { className: "size-4" });
    case "edit":
      return createElement(Edit, { className: "size-4" });
    case "globe":
      return createElement(Globe, { className: "size-4" });
    case "lightbulb":
      return createElement(Lightbulb, { className: "size-4" });
    case "help-circle":
      return createElement(HelpCircle, { className: "size-4" });

    // Tabler icons
    case "api":
      return createElement(IconApi, { className: "size-4" });
    case "user-screen":
      return createElement(IconUserScreen, { className: "size-4" });
    case "run":
      return createElement(IconRun, { className: "size-4" });

    default:
      return;
  }
}

// Export the docs source as default for backward compatibility
export const source = docsSource;
