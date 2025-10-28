# Phase 4: Refactor apps/docs to Documentation Only

**Started:** 2025-10-28T04:00:00Z  
**Status:** In Progress

## Goal

Clean up apps/docs to be documentation-only site. Remove dashboard and auth pages, keep only documentation content.

## Current State

apps/docs currently contains:
- Documentation routes: `/docs/*`
- Dashboard routes: `/dashboard/*` (to be moved to apps/dashboard)
- Auth pages: `/login`, `/signup`, `/forgot-password` (to be moved to apps/dashboard)
- Homepage: `/` (to be moved to apps/www as placeholder)

## Target State

apps/docs should only have:
- Documentation routes: `/docs/*`
- API route: `/api/docs-search/` (documentation search only)
- Homepage that redirects to /docs or shows docs content

## Tasks

### 1. Update dependencies in apps/docs
- [ ] Add workspace dependencies: @recurse/ui, @recurse/auth, @recurse/api, @recurse/fumadocs
- [ ] Update imports to use workspace packages
- [ ] Remove unused dependencies

### 2. Remove non-docs content
- [ ] Delete app/dashboard/** (move to apps/dashboard later)
- [ ] Delete app/login, app/signup, app/forgot-password (move to apps/dashboard)
- [ ] Delete app/api/auth/** (move to apps/dashboard)
- [ ] Keep only app/docs/** and app/api/docs-search/**

### 3. Simplify content
- [ ] Keep content/docs/**
- [ ] Remove content/dashboard/** (move to apps/dashboard)
- [ ] Update source.config.ts to only have docs collection

### 4. Update homepage
- [ ] Make app/(home)/page.tsx docs-focused or redirect to /docs
- [ ] Or create simple landing for docs site

### 5. Update imports
- [ ] Change imports from local components to @recurse/* packages
- [ ] Update UI component imports
- [ ] Update auth imports (if needed for user badge)

## Notes

apps/docs should be a pure documentation site after this refactor.

