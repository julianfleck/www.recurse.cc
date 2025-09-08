import type { PageTreeTransformer } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import { createElement } from "react";
import { Book, Rocket, Bot, Share2, Brain } from "lucide-react";
import { transformerOpenAPI } from "fumadocs-openapi/server";
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
			{
				name: "flatten-folders-into-separators",
				root(root) {
					const namesToFlatten = new Set(["Guide", "API Documentation"]);
					const children: typeof root.children = [];
					for (const node of root.children) {
						if (
							node.type === "folder" &&
							namesToFlatten.has(String(node.name))
						) {
							children.push({ type: "separator", name: node.name });
							if (node.index) children.push(node.index);
							for (const child of node.children)
								if (child.type !== "separator") children.push(child);
							continue;
						}
						children.push(node);
					}
					return { ...root, children };
				},
			} satisfies PageTreeTransformer,
		],
		resolveIcon(icon) {
			if (!icon) return undefined;
			switch (icon.toLowerCase()) {
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
				default:
					return undefined;
			}
		},
	},
});
