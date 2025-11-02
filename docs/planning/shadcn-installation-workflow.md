# Shadcn/ReUI Component Installation Workflow

## Current Approach: Install to www, Copy to packages/ui

**Why?** The shadcn CLI requires framework detection (Next.js) and validates `components.json`. Since `packages/ui` is a library package (not an app), it fails validation. Installing to `apps/www` works because it's a Next.js app with proper framework detection.

## ✅ NEW: Direct Installation (Recommended)

**Install components directly to packages/ui:**
```bash
cd packages/ui
pnpm dlx shadcn@latest add @reui/<component-name> --yes
```

**⚠️ Important:** Do NOT use `--overwrite` flag when installing to packages/ui if we already have custom implementations (like button). Use `--overwrite` only for new components or when you intentionally want to replace existing ones.

### Update import paths after installation
shadcn will generate imports using `@recurse/ui/lib/utils`. Check and update if needed:
```typescript
// shadcn generates:
import { cn } from '@recurse/ui/lib/utils';

// Should be (if utils.ts exists):
import { cn } from '@recurse/ui/lib/utils';

// Or (if using index.ts):
import { cn } from '@recurse/ui/lib';
```

### Update exports
Add to `packages/ui/src/components/index.ts`:
```typescript
export * from './<component-name>';
```

---

## ⚠️ OLD METHOD: Install to www, Copy to packages/ui (Fallback)

**Use this only if direct installation fails:**

### Step 1: Install to www app
```bash
cd apps/www
pnpm dlx shadcn@latest add @reui/<component-name> --yes --overwrite
```

This installs to `apps/www/components/ui/<component-name>.tsx`

### Step 2: Copy to packages/ui
```bash
# Copy the component file
cp apps/www/components/ui/<component-name>.tsx packages/ui/src/components/<component-name>.tsx
```

### Step 3: Update import paths
Change imports in the copied file:
```typescript
// Change FROM:
import { cn } from '@/lib/utils';

// Change TO:
import { cn } from '@recurse/ui/lib';
```

### Step 4: Update exports
Add to `packages/ui/src/components/index.ts`:
```typescript
export * from './<component-name>';
```

### Step 5: Update imports in apps (if component was already used)
Update all apps to use the shared component:
```typescript
// Before
import { Component } from '@/components/ui/component';

// After  
import { Component } from '@recurse/ui/components';
```

## Why Not Install Directly to packages/ui?

The shadcn CLI fails with:
```
Validation failed:
- resolvedPaths: Required,Required,Required,Required
```

**Root cause:** 
- shadcn CLI requires framework detection (Next.js/React)
- `packages/ui` is a library package, not a Next.js app
- Framework detection fails → validation fails

**Potential solutions:**
1. ✅ **Current approach:** Install to www, copy to packages/ui (works reliably)
2. ⚠️ **Add Next.js config:** Add `next.config.js` to packages/ui (hacky, might break builds)
3. ⚠️ **Use monorepo template:** Initialize with `shadcn init --template next-monorepo` (would restructure project)

## Future Improvements

1. **Create install script** - Automate the copy-and-update process:
   ```bash
   ./scripts/install-component.sh @reui/tooltip-default
   ```

2. **Add to CI** - Verify components are in sync between www and packages/ui

3. **Document pattern** - Make this workflow clear for all developers

## Components Installed This Way

- ✅ tooltip (from @reui/tooltip-default)

## Quick Reference

**To install a new component:**
```bash
# 1. Install to www
cd apps/www && pnpm dlx shadcn@latest add @reui/<name> --yes --overwrite

# 2. Copy to packages/ui  
cp components/ui/<name>.tsx ../../packages/ui/src/components/<name>.tsx

# 3. Fix imports (search/replace)
# @/lib/utils → @recurse/ui/lib

# 4. Add to exports
# Add to packages/ui/src/components/index.ts

# 5. Update app imports (if needed)
# @/components/ui/<name> → @recurse/ui/components
```

