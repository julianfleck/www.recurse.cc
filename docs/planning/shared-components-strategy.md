# Shared Components Strategy

## Overview

All shared UI components are organized in `packages/ui` and `packages/fumadocs` to ensure consistency and reusability across all apps (docs, dashboard, www).

## Package Structure

### `@recurse/ui`
**Purpose:** Generic UI components that don't depend on fumadocs

**Location:** `packages/ui/src/components/`

**Dependencies:** Only generic dependencies (Radix UI, lucide-react, etc.)

**Components:**
- Basic UI: `avatar`, `badge`, `button`, `card`, `checkbox`, `input`, `label`, etc.
- Complex UI: `calendar`, `command`, `dialog`, `dropdown-menu`, `select`, `table`, etc.
- Utility: `theme-provider`, `spinner`, `progress-circle`, etc.

**Exports:**
- `@recurse/ui/components` - All UI components
- `@recurse/ui/lib` - Utilities (`cn`, `mergeRefs`, `useUIStore`)

### `@recurse/fumadocs`
**Purpose:** Fumadocs-specific components

**Location:** `packages/fumadocs/src/components/`

**Dependencies:** `fumadocs-core`, `fumadocs-ui`, `@recurse/ui/lib` (for utilities)

**Components:**
- `toc` - Table of contents
- `toc-clerk` - Enhanced TOC with visual indicators
- `toc-thumb` - TOC navigation thumb

**Exports:**
- `@recurse/fumadocs` - All fumadocs components, icons, themes

## Import Patterns

### ✅ Correct (Use Package Aliases)

```typescript
// In shared packages - use package aliases
import { Button } from "@recurse/ui/components";
import { cn } from "@recurse/ui/lib";
import { TOCItems } from "@recurse/fumadocs";

// In apps - use package aliases
import { Button } from "@recurse/ui/components";
import { TOCItems } from "@recurse/fumadocs";
```

### ❌ Incorrect (Don't Use App-Level Aliases in Packages)

```typescript
// ❌ DON'T use app-level aliases in shared packages
import { Button } from "@/components/ui/button";  // BAD
import { cn } from "@/lib/utils";  // BAD
```

## Dependency Management

### Rule: All dependencies must be declared in package.json

1. **If a component imports a dependency**, it MUST be in `package.json` dependencies
2. **Check dependencies when adding new components** - ensure all imports are satisfied
3. **Use peerDependencies** for React/React-DOM (shared across apps)

### Current Dependencies (`@recurse/ui`)

**Required:**
- `react-day-picker` - for `calendar` component
- `cmdk` - for `command` component
- `class-variance-authority` - for variant props
- All Radix UI primitives used by components

**Utilities:**
- `tailwind-merge` - for `cn` utility
- `zustand` - for `useUIStore`
- `next-themes` - for `ThemeProvider`

## Circular Dependencies

### Prevention Strategy

1. **Use package aliases** (`@recurse/ui/components`) instead of relative imports between components
2. **Export order matters** - export components in dependency order:
   - Base components first (`button`, `badge`, `avatar`)
   - Components that depend on base components (`command`, `calendar`, `copy-button`)
   - Complex components last
3. **Utilities are separate** - `@recurse/ui/lib` has no component dependencies

### Current Safe Export Order

```typescript
// Base components (no internal dependencies)
export * from './avatar';
export * from './badge';
export * from './button';      // Exports before tooltip (used by button)
export * from './tooltip';      // Can use button

// Complex components (depend on base)
export * from './command';      // Uses dialog
export * from './dialog';       // Used by command
export * from './calendar';     // Uses button
export * from './copy-button';  // Uses button
```

## Build Verification

### Automated Build Checking

Run `pnpm build:check` to verify all apps build successfully:

```bash
pnpm build:check
```

This script:
1. Installs dependencies
2. Builds each app sequentially (docs, dashboard, www)
3. Reports success/failure for each
4. Exits with error code if any build fails

### Manual Verification

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/docs && pnpm build
cd apps/dashboard && pnpm build
cd apps/www && pnpm build
```

## Best Practices

1. **Always use package aliases** in shared packages (`@recurse/ui/components`, `@recurse/fumadocs`)
2. **Declare all dependencies** in the package's `package.json`
3. **Check build errors** after making changes - run `pnpm build:check`
4. **Test in all apps** - components should work across docs, dashboard, and www
5. **Avoid app-specific imports** - don't use `@/` aliases in shared packages
6. **Keep fumadocs components separate** - only in `packages/fumadocs`

## Migration Checklist

When moving components to shared packages:

- [ ] Move component to appropriate package (`ui` or `fumadocs`)
- [ ] Update all imports to use package aliases
- [ ] Add missing dependencies to `package.json`
- [ ] Update exports in `src/index.ts` or `src/components/index.ts`
- [ ] Remove from app-level components if moved
- [ ] Update app imports to use package alias
- [ ] Run `pnpm build:check` to verify
- [ ] Test in all apps that use the component

## Troubleshooting

### "Module not found" errors

1. Check if dependency is in `package.json`
2. Run `pnpm install` in the package directory
3. Verify import path uses package alias (not relative path or app alias)

### Circular dependency warnings

1. Check export order in `index.ts`
2. Ensure components use package aliases, not relative imports
3. Verify no component imports itself indirectly

### Build failures

1. Run `pnpm build:check` to see which app fails
2. Check error message for missing dependencies
3. Verify all imports use correct package aliases
4. Ensure `package.json` has all required dependencies

