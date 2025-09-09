import { IconApi, IconUserScreen } from "@tabler/icons-react";
import { loader } from "fumadocs-core/source";
import { transformerOpenAPI } from "fumadocs-openapi/server";
import {
	Book,
	Bot,
	Brain,
	Code,
	Download,
	FileText,
	FolderPlus,
	HandMetal,
	Info,
	Rocket,
	Share2,
	UserPlus,
} from "lucide-react";
import { createElement } from "react";
import { docs } from "@/.source";

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
	// it assigns a URL to your pages
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	pageTree: {
		// add OpenAPI badges/tags to page items generated from OpenAPI
		transformers: [
			transformerOpenAPI(),
			// Custom transformer to support sidebar_label
			{
				name: "sidebar-label",
				file(node, filePath) {
					// For Fumadocs MDX, the frontmatter data is available through the file system
					// We need to check if this file has sidebar_label in its frontmatter
					if (filePath && filePath.endsWith(".mdx")) {
						try {
							// Try to read the file and check for sidebar_label
							const fs = require("fs");
							const path = require("path");
							const contentDir = path.join(process.cwd(), "content/docs");
							const fullPath = path.join(contentDir, filePath);

							if (fs.existsSync(fullPath)) {
								const content = fs.readFileSync(fullPath, "utf-8");
								const sidebarMatch = content.match(/sidebar_label:\s*(.+)/);
								if (sidebarMatch) {
									const sidebarLabel = sidebarMatch[1].replace(
										/^["']|["']$/g,
										"",
									);
									return {
										...node,
										name: sidebarLabel,
									};
								}
							}
						} catch (error) {
							// If reading fails, continue with original node
							console.warn("Failed to read sidebar_label from file:", filePath);
						}
					}
					return node;
				},
			},
		],
		resolveIcon(icon) {
			if (!icon) return undefined;
			switch (icon.toLowerCase()) {
				// Lucide icons
				case "book":
					return createElement(Book, { className: "size-4" });
				case "rocket":
					return createElement(Rocket, { className: "size-4" });
				case "bot":
					return createElement(Bot, { className: "size-4" });
				case "share2":
					return createElement(Share2, { className: "size-4" });
				case "brain":
					return createElement(Brain, { className: "size-4" });
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

				// Tabler icons
				case "api":
					return createElement(IconApi, { className: "size-4" });
				case "user-screen":
					return createElement(IconUserScreen, { className: "size-4" });

				default:
					return undefined;
			}
		},
	},
});
