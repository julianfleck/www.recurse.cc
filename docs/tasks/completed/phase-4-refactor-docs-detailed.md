# Phase 4: Refactor apps/docs - Detailed Plan

**Created:** 2025-10-28T04:30:00Z  
**Status:** Planning

## Current State

apps/docs contains:
- `/docs/*` - Documentation (KEEP)
- `/dashboard/*` - Dashboard pages (MOVE to apps/dashboard)
- `/login`, `/signup`, `/forgot-password` - Auth pages (MOVE to apps/dashboard)
- `/` - Homepage with links to docs/dashboard (MOVE to apps/www as placeholder)
- `/api/auth/*` - Auth API routes (MOVE to apps/dashboard)
- `/api/docs-search/` - Docs search (KEEP)
- `/api/search/` - General search (probably MOVE to apps/dashboard)

## Target State

apps/docs should ONLY have:
- `/docs/*` - Documentation pages
- `/api/docs-search/` - Documentation search
- `/` - Homepage that redirects to /docs or shows docs landing

## What to Move

### Move to apps/dashboard:
- `app/dashboard/**` - All dashboard pages
- `app/login/`, `app/signup/`, `app/forgot-password/` - Auth pages
- `app/api/auth/**` - Auth API routes
- `app/auth/google/` - Auth callback
- `content/dashboard/**` - Dashboard content
- `content/docs/dashboard/**` - Any dashboard docs (if exists)

### Move to apps/www:
- `app/(home)/page.tsx` - As placeholder homepage

### Keep in apps/docs:
- `app/docs/**` - Documentation pages
- `app/api/docs-search/` - Docs search
- `content/docs/**` (except dashboard-related)
- Fumadocs config, layout components

## Steps

1. **Move dashboard to apps/dashboard**
   - Copy app/dashboard/** to apps/dashboard/app/**
   - Copy content/dashboard/** to apps/dashboard/content/**
   - Copy dashboard-related components

2. **Move auth to apps/dashboard**
   - Copy auth pages to apps/dashboard/app/auth/**
   - Copy auth API routes to apps/dashboard/app/api/auth/**
   - Copy auth components (already in packages/auth, so update imports)

3. **Clean up apps/docs**
   - Remove app/dashboard/**
   - Remove app/login, app/signup, app/forgot-password
   - Remove app/api/auth/**
   - Update source.config.ts to remove dashboard collection
   - Update homepage to redirect to /docs
   - Update layout to remove dashboard tabs

4. **Move homepage to apps/www**
   - Copy app/(home)/page.tsx to apps/www/app/page.tsx

5. **Update imports**
   - Update all imports to use @recurse/* packages
   - Remove local component references

6. **Update content**
   - Keep only docs content in apps/docs/content/docs
   - Move dashboard content to apps/dashboard/content/dashboard

