## 2025-10-28T02:55:29Z

### Context
Researching TypeScript 5.x best practices to create typescript.mdc cursor rule for the recurse.cc monorepo. Need to establish strict type safety conventions and module patterns that work across all apps and packages.

### Queries (External Research - Extract/Expand)
- "TypeScript 5.x best practices 2025 strict mode type safety"
- TypeScript official documentation
- Matt Pocock / Total TypeScript patterns
- Modern TypeScript conventions

### Sources (External)
1. Web search results (accessed: 2025-10-28T02:55:29Z)
   - Key findings: Monorepo structure recommendations, workspace configuration, TypeScript setup across packages
   - Focus on strict mode, proper module resolution, path aliases
   - Emphasis on shared tsconfig.base.json for consistency

### Extracted Practices

**Strict Mode Configuration:**
- Enable all strict flags in tsconfig.json
- Use `"strict": true` as baseline
- Additional recommended flags:
  - `"noUncheckedIndexedAccess": true` - safer array/object access
  - `"exactOptionalPropertyTypes": true` - stricter optional properties
  - `"noPropertyAccessFromIndexSignature": true` - explicit index access

**Module Patterns:**
- Use ES modules (`"module": "ESNext"`)
- Set `"moduleResolution": "bundler"` for Next.js 15
- Configure path aliases in base tsconfig
- Use `"isolatedModules": true` for better build performance

**Type Definition Conventions:**
- Prefer `type` for unions and primitives
- Prefer `interface` for object shapes (extensible)
- Use `export type` for type-only exports
- Avoid `any`, use `unknown` when type is truly unknown

**Error Handling:**
- Define custom error types
- Use discriminated unions for result types
- Avoid try-catch where type narrowing suffices

**Import/Export Patterns:**
- Use named exports for better tree-shaking
- Barrel exports (index.ts) for public API
- Use `import type` for type-only imports

### Internal Mapping

**Current TypeScript Setup:**
- apps/docs/tsconfig.json exists
- Uses Next.js configuration
- Path aliases configured: `@/*` points to root
- Strict mode already enabled

**Monorepo Considerations:**
- Need tsconfig.base.json at root for shared config
- Each app/package extends base config
- Workspace protocol for package references
- Consistent compiler options across all packages

### Synthesis

TypeScript 5.x in monorepo requires:
1. Shared base configuration (tsconfig.base.json)
2. Strict mode enabled universally
3. Path aliases for clean imports
4. Type-only imports/exports where applicable
5. Consistent module resolution strategy

The cursor rule should:
- Enforce strict mode
- Discourage `any` type
- Promote type safety patterns
- Guide proper import/export usage
- Integration with Ultracite rules (already handles some TS linting)

### Open Questions
- Testing framework preferences (for type testing)?
- Specific type utilities to recommend (zod, type-fest)?

### Proposed Actions
Create typescript.mdc with:
- Strict mode requirements
- Module and import conventions
- Type definition patterns
- Error handling guidelines
- Integration with existing Ultracite rules


