import {
	defineConfig,
	defineDocs,
	frontmatterSchema,
	metaSchema,
} from "fumadocs-mdx/config";
import minimalAccentDark from "./styles/minimal-accent-dark.json";
import minimalAccentLight from "./styles/minimal-accent-light.json";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections#define-docs
export const docs = defineDocs({
	docs: {
		schema: frontmatterSchema,
	},
	meta: {
		schema: metaSchema,
	},
});

export default defineConfig({
	lastModifiedTime: "git",
	mdxOptions: {
		rehypeCodeOptions: {
			themes: {
				light: minimalAccentLight as unknown as any,
				dark: minimalAccentDark as unknown as any,
			},
		},
	},
});
