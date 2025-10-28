# Project Understanding: Recurse.cc Monorepo

**Created:** 2025-10-28T03:01:57Z  
**Status:** Initial context map

## Current State

### What Exists Now (apps/docs)

The current codebase lives entirely in `apps/docs` and includes:

- **Routes**: Homepage (`/`), Documentation (`/docs/*`), Dashboard (`/dashboard/*`), Auth pages (`/login`, `/signup`, `/forgot-password`)
- **Components**: UI components, auth components, graph-view components, dashboard-specific components
- **Content**: Documentation MDX files (`content/docs/`), Dashboard content (`content/dashboard/`)
- **Config**: Next.js, TypeScript, Fumadocs all configured
- **Cursor Rules**: Comprehensive rules in `apps/docs/.cursor/rules/` (ultracite, fumadocs guides, writing rules, etc.)

### Technology Stack

- **Frontend**: Next.js 15.5.2 with App Router
- **Documentation**: Fumadocs 15.7.10 (core), 11.9.0 (mdx), 15.7.10 (ui)
- **Styling**: Tailwind CSS 4
- **Linting**: Ultracite 5.3.3 (Biome)
- **Package Manager**: pnpm with workspaces
- **TypeScript**: 5.9.2 with strict mode

## Target State (Monorepo)

### Three Separate Apps

1. **apps/www** → www.recurse.cc
   - Marketing website
   - Landing page, product pages, pricing
   - Blog (using Fumadocs)
   - Auth header showing user state

2. **apps/docs** → docs.recurse.cc
   - Documentation only
   - Just `/docs/*` routes
   - Remove dashboard, auth pages
   - Keep Fumadocs integration

3. **apps/dashboard** → dashboard.recurse.cc
   - Dashboard application
   - Move all dashboard routes from apps/docs
   - Move dashboard components
   - Auth required
   - Optional Fumadocs for in-app help

### Shared Packages

1. **packages/ui** - Shared UI components (radix-ui wrappers, utilities)
2. **packages/auth** - Auth components and logic (next-auth, zustand)
3. **packages/api** - API client and types
4. **packages/fumadocs** - Shared Fumadocs config (icon resolver, themes)
5. **packages/config** - Shared configs (tsconfig.base.json, biome.jsonc, tailwind)

## Key Components

### Apps

- Each app is independently deployable
- Each has own Next.js configuration
- Each uses shared packages via workspace protocol
- Each deployed to separate Vercel project

### Packages

- Use workspace protocol (`workspace:*`)
- TypeScript source files directly
- Clear public API with exports
- Minimal dependencies

### Shared Configuration

- Base tsconfig extended by all apps
- Shared Tailwind config
- Shared Biome/Ultracite config
- Consistent conventions enforced

## Migration Strategy

### Phase-Based Approach

**Phase 1**: Cursor Rules Bootstrap ✅ (Complete)
- Created comprehensive cursor rules
- Established methodology
- Documentation infrastructure

**Phase 2**: Package Infrastructure (Next)
- Create packages/ui, auth, api, fumadocs, config
- Move shared code from apps/docs

**Phase 3**: Build apps/www
- Create marketing website
- Implement landing, product, pricing pages
- Set up blog with Fumadocs

**Phase 4**: Refactor apps/docs
- Remove non-docs content
- Simplify to documentation only
- Update to use shared packages

**Phase 5**: Build apps/dashboard
- Move dashboard routes and components
- Set up dashboard-specific configuration
- Implement auth protection

**Phase 6**: Testing & Deployment
- Test all apps independently
- Configure Vercel projects
- Deploy to preview environments

## Open Questions

1. Testing framework selection?
2. Versioning strategy for internal packages?
3. Turborepo integration needed?
4. Shared API types strategy?

## References

- Research logs: `docs/research/2025-10-28/`
- Cursor rules: `.cursor/rules/`
- Existing rules: `apps/docs/.cursor/rules/`
- Migration plan: See CHANGELOG.md and research logs


