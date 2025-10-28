# Vercel Monorepo Configuration Guide

## Current Setup

We have three separate Vercel projects connected to the same GitHub repository:

1. **www.recurse.cc** (root project)
2. **docs** (docs.recurse.cc)
3. **dashboard** (dashboard.recurse.cc)

## Required Vercel Dashboard Configuration

For each project, you need to configure the following in the Vercel dashboard:

### For docs.recurse.cc Project

1. Go to https://vercel.com/dashboard
2. Select the "docs" project
3. Go to **Settings** → **General**
4. Under **Root Directory**, enter: `apps/docs`
5. Save changes

### For dashboard Project

1. Go to https://vercel.com/dashboard
2. Select the "dashboard" project
3. Go to **Settings** → **General**
4. Under **Root Directory**, enter: `apps/dashboard`
5. Save changes

### For www.recurse.cc Project

1. Go to https://vercel.com/dashboard
2. Select the "www.recurse.cc" project
3. Go to **Settings** → **General**
4. Under **Root Directory**, enter: `apps/www` (or leave empty if root is fine)
5. Save changes

## Build Settings

All projects should use:
- **Build Command**: `pnpm build` (default Next.js)
- **Output Directory**: `.next` (default Next.js)
- **Install Command**: `pnpm install` (default)
- **Framework Preset**: Next.js

## Ignored Build Step (Optional)

To optimize deployments, you can add an ignored build step for each project:

### For docs Project
```bash
git diff HEAD^ HEAD --quiet ./apps/docs/
```

### For dashboard Project
```bash
git diff HEAD^ HEAD --quiet ./apps/dashboard/
```

This ensures deployments only trigger when files in the specific app directory change.

## Troubleshooting

### "No Next.js version detected" Error
Check:
1. Root Directory setting is correct in Vercel dashboard
2. The `package.json` exists in the specified root directory
3. The `package.json` contains "next" in dependencies or devDependencies

### Missing Dependencies Error
If you see module not found errors (e.g., `@tanstack/react-table`):
- Make sure dashboard-specific components are NOT in `apps/docs`
- Each app should only have components it actually uses
- Dashboard-specific features belong only in `apps/dashboard`

### Fixing Build Errors
After making changes to the monorepo structure:
1. Clean up cross-app dependencies
2. Ensure each app only imports what it needs
3. Commit and push changes
4. Vercel will automatically redeploy

## Project IDs

- **docs**: `prj_xLfC1dClSxlymwRnRrJdrk7DY28B`
- **dashboard**: `prj_X4hhVFz65uoK3xGMHqo9cANJyrGA`
- **www**: Check Vercel dashboard

