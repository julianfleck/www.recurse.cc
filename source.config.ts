import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";
import minimalAccentDark from "./styles/minimal-accent-dark.json" with {
  type: "json",
};
import minimalAccentLight from "./styles/minimal-accent-light.json" with {
  type: "json",
};

// Extend the frontmatter schema to include sidebar_label
const extendedFrontmatterSchema = frontmatterSchema.extend({
  sidebar_label: z.string().optional(),
});

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections#define-docs
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: extendedFrontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

// Dashboard collection
export const dashboard = defineDocs({
  dir: "content/dashboard",
  docs: {
    schema: extendedFrontmatterSchema,
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
