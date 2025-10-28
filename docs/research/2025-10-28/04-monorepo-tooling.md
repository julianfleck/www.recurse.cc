## 2025-10-28T02:55:29Z

### Context
Researching pnpm workspace and monorepo best practices to create monorepo.mdc cursor rule. Need to establish conventions for package organization, dependency management, and build orchestration across the recurse.cc monorepo.

### Queries (External Research - Extract/Expand)
- "pnpm workspace monorepo best practices 2025"
- pnpm documentation
- Turborepo patterns
- Monorepo architecture

### Sources (External)
1. Web search results (accessed: 2025-10-28T02:55:29Z)
   - Key findings: Monorepo structure with apps/ and packages/
   - pnpm workspace configuration
   - Turborepo for build optimization
   - Shared configuration patterns
   - Deployment strategies for multiple apps

### Extracted Practices

**Workspace Structure:**
- `apps/` for deployable applications
- `packages/` for shared libraries
- Root `pnpm-workspace.yaml` defines workspaces
- Each package has own `package.json`

**Workspace Protocol:**
- Use `workspace:*` for internal dependencies
- Enables local package linking
- Automatic version resolution
- Hot reloading during development

**Dependency Management:**
- Shared dependencies in root when possible
- App-specific deps in app's package.json
- Avoid duplicate dependencies
- Use `pnpm why` to audit dependencies
- Regular dependency updates

**Package Organization:**
- Atomic, single-purpose packages
- Clear public API (exports in package.json)
- Internal vs external packages
- Versioning strategy (can all be 0.0.0 for internal)

**Build Orchestration:**
- Topological builds (dependencies first)
- Parallel builds where possible
- Turborepo for caching and task orchestration
- `turbo.json` for pipeline configuration

**Configuration Sharing:**
- Base configs in packages/config
- TypeScript: tsconfig.base.json
- Tailwind: shared config
- Biome: shared biome.jsonc
- Apps extend base configs

**Development Scripts:**
- Root scripts for common tasks
- `dev:www`, `dev:docs`, `dev:dashboard`
- `dev:all` for parallel dev servers
- `build`, `lint`, `test` across all packages

**Testing Strategy:**
- Unit tests per package
- Integration tests at app level
- Shared test utilities
- CI runs all tests

### Internal Mapping

**Current Monorepo Setup:**
- `pnpm-workspace.yaml` exists
- Defines: `apps/*` and `packages/*`
- Three apps defined (www, docs, dashboard)
- Three packages defined (api, auth, ui)

**Existing Package Structure:**
- packages/api: API client (minimal)
- packages/auth: Auth logic (minimal)
- packages/ui: UI components (minimal)
- All need expansion

**Current Dependencies:**
- apps/docs: Full Next.js + Fumadocs stack
- Packages: Minimal dependencies
- No shared configuration yet

**Build Process:**
- Each app builds independently
- No orchestration tool configured
- No caching strategy

### Synthesis

Monorepo with pnpm requires:
1. Clear workspace protocol usage
2. Organized package structure
3. Shared configuration patterns
4. Build orchestration (optional: Turborepo)
5. Consistent dependency management

The cursor rule should:
- Document workspace protocol usage
- Guide package organization
- Establish shared config patterns
- Provide build orchestration guidance
- Cover dependency management
- Include development workflow
- Address versioning strategy
- Cover cross-package imports

### Open Questions
- Use Turborepo or keep simple pnpm scripts?
- Versioning strategy for internal packages?
- Testing framework setup?

### Proposed Actions
Create monorepo.mdc with:
- Workspace protocol conventions
- Package organization principles
- Shared configuration patterns
- Build orchestration (simple pnpm approach)
- Dependency management guidelines
- Cross-package import patterns
- Development workflow
- Testing strategy
- Versioning approach


