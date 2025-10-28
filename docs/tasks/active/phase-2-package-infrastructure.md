# Phase 2: Package Infrastructure

**Started:** 2025-10-28T03:30:00Z  
**Status:** In Progress

## Goal

Create shared packages that all apps will use:
- `packages/ui` - Shared UI components
- `packages/auth` - Auth components and logic
- `packages/api` - API client
- `packages/fumadocs` - Fumadocs shared config
- `packages/config` - Shared configurations

## Current Status

All packages exist as empty shells with minimal package.json files.

## Tasks

### 1. Create packages/config
- [ ] Create tsconfig.base.json
- [ ] Create tailwind.config.ts
- [ ] Create biome.jsonc
- [ ] Set up proper package.json

### 2. Create packages/ui
- [ ] Move UI components from apps/docs/components/ui/
- [ ] Move lib/cn.ts
- [ ] Set up proper exports
- [ ] Add dependencies

### 3. Create packages/auth
- [ ] Move auth components from apps/docs/components/auth/
- [ ] Move auth lib files from apps/docs/lib/auth-*
- [ ] Set up proper exports
- [ ] Add dependencies

### 4. Create packages/api
- [ ] Move lib/api.ts
- [ ] Create proper type definitions
- [ ] Set up exports

### 5. Create packages/fumadocs
- [ ] Move icon resolver from lib/source.ts
- [ ] Move style themes
- [ ] Create shared transformers
- [ ] Set up exports

## Notes

Need to ensure workspace protocol is used correctly in all apps after package creation.


