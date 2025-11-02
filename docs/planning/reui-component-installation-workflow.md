# Installing ReUI/Shadcn Components in Monorepo

## Quick Reference

### Install a New Component

```bash
# 1. Navigate to UI package
cd packages/ui

# 2. Install component from ReUI (preferred) or Shadcn
pnpm dlx shadcn@latest add @reui/<component-name> --yes
# OR
pnpm dlx shadcn@latest add <component-name> --yes

# 3. Auto-generate exports
pnpm generate-exports

# 4. Done! Use in any app
```

### Example: Installing Alert Component

```bash
cd packages/ui
pnpm dlx shadcn@latest add @reui/alert --yes
pnpm generate-exports
```

Then in any app:
```typescript
import { Alert, AlertTitle, AlertDescription } from "@recurse/ui/components";
```

## Detailed Workflow

### 1. Choose Your Component

**Priority Order:**
1. **ReUI** (default) - Enhanced shadcn components with better styling
2. **Shadcn** (fallback) - Standard components

**Browse Components:**
- ReUI: https://reui.io
- Shadcn: https://ui.shadcn.com

### 2. Install to Shared Package

Always install to `packages/ui`, never to individual apps:

```bash
cd /path/to/project/packages/ui

# ReUI component (preferred)
pnpm dlx shadcn@latest add @reui/alert --yes

# Shadcn component (fallback)
pnpm dlx shadcn@latest add button --yes
```

**Important:** The `--yes` flag skips prompts. Never use `--overwrite` unless you intend to replace custom components.

### 3. Auto-Generate Exports

After installing, run the export generator:

```bash
pnpm generate-exports
```

This automatically:
- Scans `src/components/` for all `.tsx` files
- Generates exports in `src/components/index.ts`
- Avoids duplicates (prefers top-level files over directories)
- Handles special directories (like `kibo-ui/`)

**Output:**
```
✅ Generated exports for 28 components
   - 28 regular components
📝 Updated: /path/to/packages/ui/src/components/index.ts
```

### 4. Use in Any App

Import from the shared package:

```typescript
// In apps/www, apps/docs, or apps/dashboard
import { Alert, AlertTitle } from "@recurse/ui/components";

// OR use full path
import { Alert } from "@recurse/ui/components/alert";
```

## File Structure

### Before Installation
```
packages/ui/
├── src/
│   └── components/
│       ├── button.tsx
│       ├── dialog.tsx
│       └── index.ts
```

### After Installing Alert
```
packages/ui/
├── src/
│   └── components/
│       ├── alert.tsx       # ← New component
│       ├── button.tsx
│       ├── dialog.tsx
│       └── index.ts        # ← Auto-updated
└── scripts/
    └── generate-exports.mjs
```

### Generated index.ts
```typescript
// Auto-generated exports - DO NOT EDIT MANUALLY
// Run `pnpm generate-exports` to regenerate this file

// UI Components
export * from './alert';    // ← Automatically added
export * from './button';
export * from './dialog';
// ... more exports
```

## How It Works

### Export Generation Script

Located at `packages/ui/scripts/generate-exports.mjs`:

1. **Scans** `src/components/` directory
2. **Finds** all `.tsx` files and directories
3. **Prefers** top-level `.tsx` files (e.g., `button.tsx` over `button/default.tsx`)
4. **Exports** special directories (like `kibo-ui/`) when no top-level file exists
5. **Writes** to `src/components/index.ts`

### Why Auto-Generate?

**Before (Manual):**
```typescript
// After installing alert.tsx, you had to manually add:
export * from './alert';
```

**After (Automatic):**
```bash
pnpm generate-exports  # Done!
```

**Benefits:**
- ✅ No manual editing needed
- ✅ No missing exports
- ✅ No duplicate exports
- ✅ Consistent export order

## Component Configuration

### Shadcn Config

The `packages/ui/components.json` configures component installation:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "styles/base.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@recurse/ui/components",
    "utils": "@recurse/ui/lib/utils",
    "ui": "@recurse/ui/components",
    "lib": "@recurse/ui/lib",
    "hooks": "@recurse/ui/hooks"
  },
  "registries": {
    "@reui": "https://reui.io/{name}.json"
  }
}
```

**Key Settings:**
- `aliases.components`: Where components are installed
- `registries["@reui"]`: ReUI component registry
- `tailwind.css`: Centralized CSS location

## Troubleshooting

### Component Not Found After Install

**Problem:** Installed component but apps can't import it.

**Solution:**
```bash
cd packages/ui
pnpm generate-exports
```

### Import Errors

**Problem:** `Cannot resolve '@recurse/ui/components/alert'`

**Check:**
1. Component exists: `packages/ui/src/components/alert.tsx`
2. Exported: `packages/ui/src/components/index.ts` includes `export * from './alert'`
3. Package updated: Run `pnpm install` in app directory

### Duplicate Exports

**Problem:** Same component exported twice.

**Cause:** Both `component.tsx` and `component/` directory exist.

**Solution:** The script prefers top-level files. If you see duplicates, delete one:
```bash
# Keep top-level file
rm -rf packages/ui/src/components/component/
```

### Wrong Import Paths

**Problem:** Component imports from wrong paths (e.g., `@/components` instead of `@recurse/ui`).

**Fix:** Update imports in generated component:
```typescript
// Change:
import { cn } from '@/lib/utils';

// To:
import { cn } from '@recurse/ui/lib/utils';
```

Then run:
```bash
pnpm generate-exports
```

## Best Practices

### 1. Always Install to packages/ui

❌ **Wrong:**
```bash
cd apps/www
pnpm dlx shadcn@latest add button
```

✅ **Right:**
```bash
cd packages/ui
pnpm dlx shadcn@latest add button --yes
pnpm generate-exports
```

### 2. Run generate-exports After Every Install

Make it a habit:
```bash
pnpm dlx shadcn@latest add @reui/alert --yes && pnpm generate-exports
```

### 3. Never Edit index.ts Manually

The file is auto-generated. Your changes will be overwritten.

### 4. Use ReUI First

ReUI components are enhanced versions of Shadcn:
```bash
# Try ReUI first
pnpm dlx shadcn@latest add @reui/alert --yes

# Fall back to Shadcn if not available
pnpm dlx shadcn@latest add alert --yes
```

### 5. Verify Import Paths

After installing, check the component file:
```typescript
// Make sure imports use @recurse/ui, not relative paths
import { cn } from '@recurse/ui/lib/utils';  // ✅
import { cn } from '@/lib/utils';            // ❌
```

## Advanced Usage

### Installing Multiple Components

```bash
cd packages/ui

# Install multiple at once
pnpm dlx shadcn@latest add @reui/alert @reui/toast @reui/sheet --yes

# Then generate exports once
pnpm generate-exports
```

### Custom Components

For custom components (not from shadcn/ReUI):

1. Create the component file:
   ```bash
   packages/ui/src/components/my-component.tsx
   ```

2. Run export generator:
   ```bash
   pnpm generate-exports
   ```

3. It's automatically exported!

### Checking Available Components

List all exported components:
```bash
cd packages/ui
cat src/components/index.ts
```

## Summary

### Complete Workflow

```bash
# 1. Navigate to UI package
cd packages/ui

# 2. Install component
pnpm dlx shadcn@latest add @reui/alert --yes

# 3. Auto-generate exports
pnpm generate-exports

# 4. Use in any app
# import { Alert } from "@recurse/ui/components";
```

### Key Commands

| Command | Description |
|---------|-------------|
| `cd packages/ui` | Navigate to UI package |
| `pnpm dlx shadcn@latest add @reui/<name> --yes` | Install ReUI component |
| `pnpm dlx shadcn@latest add <name> --yes` | Install Shadcn component |
| `pnpm generate-exports` | Auto-generate exports |

### Key Files

| File | Purpose |
|------|---------|
| `packages/ui/src/components/index.ts` | Auto-generated exports |
| `packages/ui/scripts/generate-exports.mjs` | Export generator script |
| `packages/ui/components.json` | Shadcn configuration |
| `packages/ui/package.json` | Contains `generate-exports` script |

---

**No more manual export management! 🎉**

