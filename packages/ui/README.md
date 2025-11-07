# @recurse/ui

Shared UI components and assets for the Recurse.cc monorepo.

## Assets

Shared assets (logos, fonts, images) are stored in `packages/ui/public/` and automatically synced to each app's `public/ui-assets/` folder via symlinks.

### Asset Structure

```
packages/ui/public/
├── fonts/
│   └── Switzer/          # Switzer variable font files
├── images/               # Shared images
└── logos/                # Logo files (SVG, PNG, etc.)
    └── recurse-logo.svg
```

### Syncing Assets

Assets are automatically synced when you run:
- `pnpm dev` (runs `predev` hook)
- `pnpm build` (runs `prebuild` hook)
- Or manually: `pnpm --filter @recurse/ui sync-assets`

The sync script creates symlinks from each app's `public/ui-assets/` to `packages/ui/public/`, allowing Next.js to serve shared assets.

### Using Assets

#### Logo Component

```tsx
import { Logo } from "@recurse/ui/components/logo";

<Logo size={120} className="drop-shadow-lg" />
```

#### Direct Asset Paths

```tsx
// In your components
<img src="/ui-assets/logos/recurse-logo.svg" alt="Logo" />
```

#### Fonts

Fonts are automatically available via the shared CSS:

```tsx
import "@recurse/ui/styles/switzer.css";
```

## Components

All components are exported from `@recurse/ui/components`:

```tsx
import { Button, Card, Logo } from "@recurse/ui/components";
```

## Development

### Adding New Assets

1. Add files to `packages/ui/public/`
2. Run `pnpm --filter @recurse/ui sync-assets` to update symlinks
3. Reference assets via `/ui-assets/...` paths

### Adding New Components

1. Create component in `packages/ui/src/components/`
2. Run `pnpm --filter @recurse/ui generate-exports` to update exports
3. Import from `@recurse/ui/components`

