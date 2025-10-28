## 2025-10-28T03:15:00Z

### Context
Auditing cursor rules to ensure apply patterns and globs make sense. We don't want to overload the agent but guide it appropriately.

### Current Patterns Analysis

#### general.mdc
- **Pattern**: `globs: ["**/*"]`, `alwaysApply: true`
- **Analysis**: ✅ Correct - Core protocol should always be present
- **Scope**: All files, always applied

#### typescript.mdc
- **Pattern**: `globs: ["**/*.{ts,tsx}"]`, `alwaysApply: false`
- **Analysis**: ✅ Good - Only applies to TypeScript files
- **Scope**: All .ts and .tsx files

#### next.mdc
- **Pattern**: `globs: ["**/app/**/*.{ts,tsx}", "**/next.config.{js,mjs,ts}"]`, `alwaysApply: false`
- **Analysis**: ✅ Specific - App Router and Next.js config files
- **Scope**: App routes and Next.js configs

#### routing.mdc
- **Pattern**: `globs: ["**/app/**/*.{ts,tsx}"]`, `alwaysApply: false`
- **Analysis**: ⚠️ Overlaps with next.mdc - Both target same files
- **Issue**: Redundant pattern with next.mdc
- **Recommendation**: Keep separate for organization, but should merge into next.mdc or be more specific

#### fumadocs.mdc
- **Pattern**: `globs: ["**/*.mdx", "**/meta.json", "**/source.config.ts"]`, `alwaysApply: false`
- **Analysis**: ✅ Specific - MDX content and Fumadocs config
- **Scope**: Documentation content files

#### ultracite.mdc
- **Pattern**: `globs: ["**/*.{ts,tsx,js,jsx}"]`, `alwaysApply: true`
- **Analysis**: ✅ Good - Linting applies to all code files, always
- **Scope**: All code files

#### monorepo.mdc
- **Pattern**: `globs: ["**/package.json", "**/pnpm-workspace.yaml"]`, `alwaysApply: false`
- **Analysis**: ✅ Specific - Package management files
- **Scope**: Package config files

### Issues Identified

**Issue 1: Overlap between next.mdc and routing.mdc**
- Both target `**/app/**/*.{ts,tsx}`
- Redundant patterns
- **Solution**: Merge routing.mdc into next.mdc (routing is a subset of Next.js)

**Issue 2: No specificity for packages**
- Rules apply to `apps/` and `packages/` equally
- Some rules should be app-specific (e.g., Next.js patterns don't apply to packages)
- **Solution**: Use more specific globs like `apps/**/app/**/*.{ts,tsx}`

**Issue 3: Fumadocs glob too broad**
- `**/*.mdx` catches all MDX files including node_modules
- **Solution**: Specify content directories like `apps/**/content/**/*.mdx`

### Proposed Changes

1. **Merge routing.mdc into next.mdc** - Routing is part of Next.js
2. **Make globs more specific** - Use `apps/**/` prefix for app-specific rules
3. **Restrict fumadocs glob** - Target content directories only
4. **Keep monorepo.mdc broad** - Applies to all package.json files

### Evaluation

**Confidence**: High (0.9)
**Priority**: Medium - Rules work but can be optimized
**Risk**: Low - Changes improve specificity without breaking functionality

### Proposed Actions

Update rules with more specific globs to avoid overloading agent while maintaining guidance.

