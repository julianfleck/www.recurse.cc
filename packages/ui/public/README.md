# Shared Assets

This directory contains shared assets (fonts, logos, images) used across all apps in the monorepo.

## Structure

```
public/
├── fonts/
│   └── Switzer/          # Switzer variable font files (.woff, .woff2)
├── images/               # Shared images (light/dark variants, etc.)
└── logos/                # Logo files
    └── recurse-logo.svg  # Main Recurse.cc logo
```

## How It Works

Assets in this directory are automatically synced to each app's `public/ui-assets/` folder via symlinks created by the `sync-assets` script.

### Syncing

The sync happens automatically:
- Before `pnpm dev` (via `predev` hook)
- Before `pnpm build` (via `prebuild` hook)
- Or manually: `pnpm --filter @recurse/ui sync-assets`

### Accessing Assets

Assets are accessible via `/ui-assets/...` paths in all apps:

```tsx
// Logo
<img src="/ui-assets/logos/recurse-logo.svg" alt="Logo" />

// Or use the Logo component
import { Logo } from "@recurse/ui/components/logo";
<Logo size={120} />
```

### Adding New Assets

1. Add files to the appropriate subdirectory (`fonts/`, `images/`, `logos/`)
2. Run `pnpm --filter @recurse/ui sync-assets` to update symlinks
3. Reference via `/ui-assets/...` paths

## Fonts

Switzer fonts are already configured and available via:

```tsx
import "@recurse/ui/styles/switzer.css";
```

Font files should be placed in `fonts/Switzer/` with the naming convention:
- `Switzer-Variable.woff2`
- `Switzer-Variable.woff`
- `Switzer-VariableItalic.woff2`
- `Switzer-VariableItalic.woff`

