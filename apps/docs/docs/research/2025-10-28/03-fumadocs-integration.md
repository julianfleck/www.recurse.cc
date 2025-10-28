## 2025-10-28T02:55:29Z

### Context
Researching Fumadocs framework to create fumadocs.mdc cursor rule. Fumadocs is used for documentation (apps/docs) and will be used for the blog (apps/www) and optional in-app help (apps/dashboard).

### Queries (External Research - Extract/Expand)
- "Fumadocs documentation framework configuration MDX"
- Official Fumadocs docs (https://fumadocs.vercel.app/)
- MDX component patterns
- Meta.json structure

### Sources (External)
1. Official Fumadocs Documentation (https://fumadocs.vercel.app/)
   - Accessed: 2025-10-28T02:55:29Z
   - Configuration guide
   - MDX components reference
   - Source API documentation

2. Existing cursor rules in apps/docs/.cursor/rules/:
   - fumadocs-folder-structure.mdc (comprehensive)
   - fumadocs-mdx-reference.mdc (complete)
   - docs-writing-rules.mdc (detailed)

### Extracted Practices

**Fumadocs Configuration:**
- `source.config.ts` defines content collections
- Use `defineDocs()` to create collections
- Support multiple collections (docs, dashboard, blog)
- Custom frontmatter schema with Zod
- MDX options for syntax highlighting

**Content Organization:**
- `content/` directory for all MDX files
- Nested folder structure for organization
- `meta.json` files control sidebar order and structure
- Frontmatter in MDX for page metadata

**Meta.json Structure:**
- `pages` array defines order
- Extract folders with `"...folder"`
- Separators: `"---Label---"` or `"---[Icon]Label---"`
- External links: `"[Text](url)"` or `"[Icon][Text](url)"`
- Folder configuration:
  - `title`: Display name
  - `icon`: Icon identifier
  - `pages`: Nested items
  - `defaultOpen`: Auto-expand
  - `root`: Sidebar tab

**Icon System:**
- Icons registered in `lib/source.ts`
- Supported libraries: Lucide React, Tabler Icons
- Icon resolver function maps names to components
- Used in meta.json and MDX frontmatter

**MDX Components:**
- Cards: Navigation and feature showcase
- Steps: Procedural instructions
- Accordions: Progressive disclosure, FAQs
- Tabs: Multi-option content
- Code blocks: Syntax highlighted
- Callouts: Important information

**Custom Sidebar Labels:**
- `sidebar_label` in frontmatter
- Different from page title
- Allows shorter sidebar text
- Custom transformer in source config

### Internal Mapping

**Current Fumadocs Setup:**
- fumadocs-core: 15.7.10
- fumadocs-mdx: 11.9.0
- fumadocs-ui: 15.7.10
- Two collections: docs and dashboard
- Custom transformers for sidebar labels
- Icon resolver with 15+ registered icons
- Shiki for syntax highlighting
- Custom color themes (minimal-accent-dark/light)

**Existing Rules (to reuse):**
- fumadocs-folder-structure.mdc: Complete meta.json guide
- fumadocs-mdx-reference.mdc: MDX components reference
- docs-writing-rules.mdc: Content writing guidelines

**Monorepo Considerations:**
- Fumadocs config shared via packages/fumadocs
- Icon resolver reusable across apps
- Syntax highlighting themes shared
- Content collections per app
- Each app has own source.config.ts

### Synthesis

Fumadocs in monorepo requires:
1. Shared configuration package (packages/fumadocs)
2. App-specific source.config.ts files
3. Consistent icon system across apps
4. Reusable MDX components
5. Standard meta.json patterns

The cursor rule should:
- Link to official docs (https://fumadocs.vercel.app/)
- Reference existing comprehensive rules
- Add monorepo-specific guidance
- Document shared vs app-specific config
- Cover icon registration process
- Include MDX component usage

### Open Questions
- Should blog use same meta.json structure?
- Icon library expansion strategy?

### Proposed Actions
Create fumadocs.mdc with:
- Link to official documentation
- Configuration patterns (source.config.ts)
- Meta.json structure reference (from existing rule)
- MDX component usage (from existing rule)
- Icon registration process
- Content organization conventions
- Shared package integration
- Reference to docs-writing-rules.mdc for content guidelines

