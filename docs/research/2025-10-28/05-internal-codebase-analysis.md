## 2025-10-28T02:55:29Z

### Context
Analyzing existing cursor rules in apps/docs/.cursor/rules/ and current codebase patterns to understand what can be reused, what needs enhancement, and what needs creation from scratch for the root-level cursor rules.

### Internal Research - Existing Cursor Rules

**Review of apps/docs/.cursor/rules/:**

1. **ultracite.mdc**
   - Status: Well-structured, comprehensive
   - Content: Complete Ultracite/Biome linting rules
   - Reusability: Can copy and enhance for monorepo
   - Size: ~300 lines of detailed rules

2. **fumadocs-folder-structure.mdc**
   - Status: Comprehensive guide
   - Content: Complete meta.json patterns, folder organization
   - Reusability: Perfect for inclusion/reference
   - Key sections: Folder types, icon usage, sidebar labels

3. **fumadocs-mdx-reference.mdc**
   - Status: Complete MDX components reference
   - Content: Cards, Steps, Accordions, code blocks
   - Reusability: Can be referenced or included

4. **docs-writing-rules.mdc**
   - Status: Detailed writing guidelines
   - Content: User-centric focus, typography, blacklisted words
   - Reusability: Excellent for documentation content
   - Specific to Recurse.cc brand voice

5. **docs-structure-overview.mdc**
   - Status: Project-specific context
   - Content: Current docs status, content gaps
   - Reusability: Reference for understanding current state

6. **rage-context.mdc**
   - Status: Comprehensive product context
   - Content: RAGE technology, API endpoints, vision
   - Reusability: Important context for all development

7. **faq-component-usage.mdc**
   - Status: Specific component guide
   - Content: FAQ component patterns
   - Reusability: Lower priority

**README.md:**
   - Basic guidance about Biome handling class sorting
   - Can be incorporated into ultracite.mdc

### Internal Research - Codebase Patterns

**TypeScript Configuration (apps/docs/tsconfig.json):**
- Strict mode enabled: `"strict": true`
- Module resolution: `"bundler"`
- Path aliases: `"@/*": ["./*"]`
- JSX: `"preserve"`
- Target: ES2017
- Incremental builds enabled
- Plugin: `next`

**Next.js Configuration (apps/docs/next.config.mjs):**
- Fumadocs MDX integration
- Rewrites for `/docs/:slug*.mdx` → `/llms.mdx/:slug*`
- React strict mode enabled
- Minimal configuration (good pattern)

**Fumadocs Configuration (apps/docs/source.config.ts):**
- Two collections: docs and dashboard
- Custom frontmatter schema with `sidebar_label`
- Shared code themes (minimal-accent-dark/light)
- Last modified time from git
- MDX options for syntax highlighting

**Component Patterns:**
- UI components in `components/ui/`
- Feature components organized by domain
- Auth components in `components/auth/`
- Graph view as complex nested component

**Package Structure:**
- packages/api: Minimal (just package.json)
- packages/auth: Minimal (just package.json)
- packages/ui: Minimal (just package.json)
- All need content migration

**Workspace Configuration:**
- `pnpm-workspace.yaml` exists and correct
- Defines apps/* and packages/*
- Ready for monorepo expansion

### Gaps Identified

**Missing Rules:**
1. **general.mdc** - No bootstrapping protocol exists
2. **typescript.mdc** - No TypeScript-specific conventions
3. **next.mdc** - No Next.js patterns documented
4. **routing.mdc** - No routing conventions
5. **monorepo.mdc** - No monorepo patterns

**Existing Rules to Enhance:**
1. **ultracite.mdc** - Add monorepo-specific linting
2. **fumadocs.mdc** - Needs creation (references to existing)

**Configuration Gaps:**
1. No tsconfig.base.json at root
2. No shared Tailwind config
3. No shared biome.jsonc at root
4. No Turborepo configuration

**Documentation Gaps:**
1. No overview.yaml (project ledger)
2. No CHANGELOG.md (audit trail)
3. No docs/context/ (context maps)
4. No docs/tasks/ (workflow tracking)

### Contradictions

None found. Existing rules are consistent and well-structured.

### Cross-References

**Ultracite + TypeScript:**
- Ultracite handles many TS linting rules
- typescript.mdc should complement, not duplicate
- Focus typescript.mdc on conventions, not linting

**Fumadocs + Next.js:**
- Fumadocs works within Next.js App Router
- next.mdc should cover general Next.js
- fumadocs.mdc should cover Fumadocs-specific

**Monorepo + All Rules:**
- monorepo.mdc should reference other rules
- Each framework rule should note monorepo considerations

### Synthesis

**What to Reuse:**
1. ultracite.mdc - Copy and enhance
2. fumadocs-folder-structure.mdc - Reference/include
3. fumadocs-mdx-reference.mdc - Reference/include
4. docs-writing-rules.mdc - Keep for content guidelines
5. rage-context.mdc - Keep for product context

**What to Create:**
1. general.mdc - Complete bootstrap protocol
2. typescript.mdc - TS conventions (complementing Ultracite)
3. next.mdc - Next.js 15 patterns
4. routing.mdc - App Router specifics
5. monorepo.mdc - Monorepo patterns
6. fumadocs.mdc - Consolidate existing fumadocs rules + monorepo guidance

**What to Enhance:**
1. ultracite.mdc - Add monorepo-specific considerations

### Proposed Actions

1. Create root `.cursor/rules/` directory
2. Copy ultracite.mdc and enhance
3. Create general.mdc from bootstrap template
4. Create typescript.mdc based on research + current tsconfig
5. Create next.mdc based on research + current patterns
6. Create routing.mdc focused on App Router
7. Create fumadocs.mdc consolidating existing rules
8. Create monorepo.mdc based on research + current setup
9. Keep existing apps/docs/.cursor/rules/ for migration reference

