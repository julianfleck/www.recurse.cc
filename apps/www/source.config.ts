import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from "fumadocs-mdx/config";
import { z } from "zod";

const blogFrontmatterSchema = frontmatterSchema.extend({
	sidebar_label: z.string().optional(),
	publishedAt: z.string(),
	tags: z.array(z.string()).default([]),
	substackUrl: z.string().url(),
	heroImage: z.string().optional(),
});

export const blog = defineDocs({
	dir: "../../content/blog",
	docs: {
		schema: blogFrontmatterSchema,
	},
	meta: {
		schema: metaSchema,
	},
});

export default defineConfig({
	lastModifiedTime: "git",
});


