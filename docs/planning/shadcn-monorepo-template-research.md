# Shadcn Monorepo Template Research & Implementation

## ✅ Implementation Complete

We've successfully configured `packages/ui` to allow direct installation of shadcn/ReUI components without needing to copy from apps.

## What Changed

### 1. `packages/ui/components.json`
**Changed aliases from file paths to workspace package names:**
```json
{
  "aliases": {
    "components": "@recurse/ui/components",
    "utils": "@recurse/ui/lib/utils",
    "hooks": "@recurse/ui/hooks",
    "lib": "@recurse/ui/lib",
    "ui": "@recurse/ui/components"
  }
}
```

### 2. `packages/ui/package.json`
**Added wildcard exports for shadcn to resolve component paths:**
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./lib": "./src/lib/index.ts",
    "./lib/*": "./src/lib/*.ts",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

**Key:** Both direct exports (`./components`) and wildcard exports (`./components/*`) are needed:
- Direct exports: For app imports like `@recurse/ui/components`
- Wildcard exports: For shadcn to resolve `@recurse/ui/components/tooltip` → `src/components/tooltip.tsx`

### 3. `packages/ui/tsconfig.json`
**Updated path mapping to use wildcard pattern:**
```json
{
  "paths": {
    "@recurse/ui/*": ["./src/*"]
  }
}
```

## How It Works

When shadcn installs a component:
1. Resolves `@recurse/ui/components/tooltip` using package.json exports
2. Wildcard export `./components/*` matches `./components/tooltip`
3. Maps to `./src/components/tooltip.tsx`
4. Writes component file to correct location
5. Uses workspace aliases for imports (e.g., `@recurse/ui/lib/utils`)

## Usage

**Install components directly to packages/ui:**
```bash
cd packages/ui
pnpm dlx shadcn@latest add @reui/<component-name> --yes
```

**No more copying needed!** Components install directly where they belong.

## Why This Works

The shadcn CLI:
- Uses package.json `exports` to resolve where to write files
- Uses `components.json` aliases for import paths in generated code
- Requires wildcard exports (`./components/*`) to resolve subpaths
- Works in monorepo packages when configured correctly

## Benefits

✅ **Direct installation** - No copying from apps  
✅ **Clean workflow** - Single command installs to correct location  
✅ **Consistent imports** - Uses workspace package names  
✅ **Backward compatible** - Existing imports still work via direct exports

## Future Improvements

- Document this pattern in README
- Create helper script for common component installations
- Verify all apps can use components correctly
