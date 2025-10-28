# Fumadocs Patches

This package contains the full Fumadocs source in `_source/` plus our customizations.

## Our Customizations

### 1. Icon Resolver (`src/icons.tsx`)
Added support for:
- Lucide React icons
- Tabler Icons (IconApi, IconRun, IconUserScreen)

### 2. Custom Transformer (`src/transformers.ts`)
Added `sidebarLabelTransformer` to support `sidebar_label` in frontmatter for shorter sidebar text.

### 3. Custom Themes (`styles/`)
- `minimal-accent-dark.json` - Dark theme for code highlighting
- `minimal-accent-light.json` - Light theme for code highlighting

## Updating Fumadocs

When Fumadocs releases updates:

1. Update `_source/`:
   ```bash
   cd packages/fumadocs/_source
   git pull origin main
   ```

2. Review changes and check if our patches still work

3. Update version in `package.json` to match Fumadocs version

4. Test thoroughly

## Using in Apps

Apps should use `@recurse/fumadocs` which exports:
- Our custom icon resolver
- Our custom transformers
- Our custom themes

Then configure source.config.ts:

```typescript
import { themes, sidebarLabelTransformer } from '@recurse/fumadocs';
import { transformerOpenAPI } from 'fumadocs-openapi/server';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: extendedFrontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  lastModifiedTime: 'git',
  mdxOptions: {
    rehypeCodeOptions: {
      themes,
    },
  },
});
```


