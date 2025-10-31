# Shadcn Monorepo Template Research

## Current Situation

We're currently installing components to `apps/www` and copying to `packages/ui` because shadcn CLI validation fails when trying to install directly to `packages/ui`.

## The `next-monorepo` Template Option

### What is it?

**Confirmed:** The shadcn CLI supports `--template next-monorepo` option (verified via `shadcn init --help`)

The `shadcn init --template next-monorepo` command creates a monorepo structure with:
- `apps/` directory for Next.js applications
- `packages/` directory for shared packages (including UI components)
- Turborepo configured as the build system (likely)
- Proper shadcn CLI support for installing directly to packages

### How It Works

When you initialize with the monorepo template:
1. Creates proper monorepo structure
2. Sets up Turborepo for builds (assumed, needs verification)
3. Configures `components.json` to support installing to `packages/ui`
4. Components can be installed directly to shared packages

### Installation Process

```bash
# Initialize with monorepo template
pnpm dlx shadcn@latest init --template next-monorepo

# Then install components directly to packages
pnpm dlx shadcn@latest add @reui/tooltip-default
```

**Note:** This would need to be tested in a branch to see the exact structure it creates and how it differs from our current setup.

### What Would Change?

**If we migrate to this template:**

1. **Project Structure:**
   - Would create/update monorepo structure
   - Might add Turborepo configuration
   - Would restructure how components are organized

2. **components.json:**
   - Would need to be configured for monorepo pattern
   - Aliases would point to `@workspace/ui` or similar
   - Validation would pass because framework detection works

3. **Build System:**
   - Might introduce Turborepo (if not already present)
   - Could change how packages are built/linked

4. **Migration Effort:**
   - Need to verify compatibility with existing structure
   - Might need to adjust import paths
   - Could require updating CI/CD

### Pros and Cons

**Pros:**
- ✅ Direct installation to `packages/ui` works
- ✅ No manual copying needed
- ✅ Proper monorepo patterns
- ✅ Better developer experience

**Cons:**
- ⚠️ Requires project restructure
- ⚠️ May introduce Turborepo (new dependency)
- ⚠️ Migration risk
- ⚠️ Need to verify compatibility with current setup

## Recommendation

**For now:** Keep the current workflow (install to www, copy to packages/ui)
- It works reliably
- No structural changes needed
- Low risk

**Future consideration:** Research and test the monorepo template in a branch
- See if it's compatible with our current structure
- Evaluate migration effort
- Test if it solves the installation issue without breaking things

## Next Steps

1. Test `shadcn init --template next-monorepo` in a test branch
2. Compare resulting structure with current setup
3. Evaluate migration complexity
4. Document findings

