# Icon Resolver Consolidation

## Status: Partial Consolidation

## What Was Done

We consolidated duplicate `resolveIcon` functions across multiple files by:

1. **Created single source of truth**: `packages/fumadocs/src/icons.tsx` contains the canonical `resolveIcon` function
2. **Added subpath export**: Added `"./icons": "./src/icons.tsx"` to `packages/fumadocs/package.json` to allow importing without pulling in client components
3. **Updated imports**: Changed all files to import from `@recurse/fumadocs/icons` instead of duplicating the function:
   - `apps/docs/lib/source.ts`
   - `lib/source.ts`
   - `apps/dashboard/lib/source.ts`
   - `apps/docs/mdx-components.tsx`
   - `mdx-components.tsx`
   - `apps/dashboard/mdx-components.tsx`

## Current Limitation

**Important**: We're using a subpath export (`@recurse/fumadocs/icons`) as a workaround because importing from the main barrel export (`@recurse/fumadocs`) pulls in client components (`toc-thumb.tsx`, `toc-clerk.tsx`) that require `"use client"` directive, causing build errors in server components.

## Future Work Needed

### Proper Consolidation Strategy

1. **Separate exports by client/server boundary**:
   - Create separate barrel exports for server-safe utilities (`@recurse/fumadocs/server`)
   - Keep client components in separate exports (`@recurse/fumadocs/client`)
   - Update `package.json` exports to reflect this separation

2. **Consider reorganizing package structure**:
   ```
   packages/fumadocs/
   ├── src/
   │   ├── server/          # Server-safe utilities
   │   │   └── icons.tsx
   │   ├── client/          # Client components
   │   │   ├── toc-thumb.tsx
   │   │   └── toc-clerk.tsx
   │   └── index.ts         # Main export (client components)
   ```

3. **Update imports after reorganization**:
   - Server components import from `@recurse/fumadocs/server`
   - Client components import from `@recurse/fumadocs/client` or main export
   - This eliminates the need for the `/icons` subpath workaround

### Benefits of Proper Consolidation

- Cleaner import paths (no subpath workarounds)
- Clear separation of server vs client code
- Better TypeScript type safety
- Easier to understand what can be imported where
- Follows Next.js 15 App Router best practices

## Related Files

- `packages/fumadocs/src/icons.tsx` - Icon resolver implementation
- `packages/fumadocs/src/index.ts` - Barrel export (includes client components)
- `packages/fumadocs/package.json` - Package exports configuration

## Timeline

- **2025-01-XX**: Initial consolidation completed with subpath workaround
- **Future**: Proper server/client separation and package reorganization

