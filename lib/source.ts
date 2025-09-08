import type { PageTreeTransformer } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import { transformerOpenAPI } from "fumadocs-openapi/server";
import { Book, Bot, Brain, Rocket, Share2 } from "lucide-react";
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
			{
				name: "flatten-and-hoist-guide-intro-quickstart",
				root(root) {
					const namesToFlatten = new Set(["Guide", "API Documentation"]);
					const hoistUrls = new Set(["/docs/introduction", "/docs/quickstart"]);
					const children: typeof root.children = [];
					for (const node of root.children) {
						if (
							node.type === "folder" &&
							namesToFlatten.has(String(node.name))
						) {
							if (String(node.name) === "Guide") {
								const hoisted: typeof root.children = [];
								const remaining: typeof root.children = [];
								if (node.index) {
									if (node.index.type === "page" && hoistUrls.has(node.index.url)) hoisted.push(node.index);
									else remaining.push(node.index);
								}
								for (const child of node.children) {
									if (child.type === "page" && hoistUrls.has(child.url)) hoisted.push(child);
									else if (child.type !== "separator") remaining.push(child);
								}

								children.push(...hoisted);
								children.push({ type: "separator", name: node.name });
								children.push(...remaining);
								continue;
							}

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
