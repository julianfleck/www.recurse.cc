import { loader } from "fumadocs-core/source";
import { transformerOpenAPI } from "fumadocs-openapi/server";
import { Book, Bot, Brain, FileText, FolderPlus, Info, Rocket, Share2, UserPlus, Download } from "lucide-react";
import { createElement } from "react";
import { docs } from "@/.source";

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
	// it assigns a URL to your pages
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	pageTree: {
		// add OpenAPI badges/tags to page items generated from OpenAPI
		transformers: [transformerOpenAPI()],
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
				default:
					return undefined;
			}
		},
	},
});
