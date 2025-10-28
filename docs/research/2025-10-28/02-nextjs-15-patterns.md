## 2025-10-28T02:55:29Z

### Context
Researching Next.js 15 App Router patterns to create next.mdc cursor rule. Need to establish conventions for Server Components, Client Components, data fetching, and route organization that work across all three apps (www, docs, dashboard).

### Queries (External Research - Extract/Expand)
- "Next.js 15 app router best practices 2025 server components"
- Next.js official documentation
- Vercel deployment guidelines
- Lee Robinson's recommendations

### Sources (External)
1. Web search results (accessed: 2025-10-28T02:55:29Z)
   - Key findings: Monorepo setup with multiple Next.js apps, Turbo repo configuration
   - App Router patterns and conventions
   - Server vs Client Component guidelines
   - Deployment configuration for multiple apps

### Extracted Practices

**App Router Organization:**
- Use route groups `(group-name)` for organization without affecting URL
- Colocate components with routes when they're route-specific
- Shared components go in top-level `components/` directory
- Route handlers in `app/api/` for API endpoints

**Server vs Client Components:**
- Default to Server Components (no 'use client')
- Add 'use client' only when needed:
  - Event handlers (onClick, onChange)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect)
  - Third-party libraries requiring client
- Keep Server Components at the top of the tree
- Pass data down to Client Components as props

**Data Fetching:**
- Server Components: async/await directly in component
- Use native `fetch()` with automatic deduplication
- Parallel data fetching with Promise.all()
- Client Components: use SWR or React Query
- Avoid fetch in Client Components when possible

**Metadata and SEO:**
- Export `metadata` object from page.tsx
- Use `generateMetadata()` for dynamic metadata
- Leverage OpenGraph and Twitter Card metadata
- Set proper canonical URLs

**Route Handlers (API Routes):**
- Use `route.ts` files for API endpoints
- Support HTTP methods: GET, POST, PUT, DELETE, PATCH
- Return Response objects
- Use NextResponse for cookies/headers manipulation

**Loading and Error States:**
- `loading.tsx` for instant loading states (Suspense boundary)
- `error.tsx` for error boundaries
- `not-found.tsx` for 404 pages
- Nested loading/error states per route segment

**Layouts:**
- Root layout wraps entire app (required)
- Nested layouts for sections
- Shared layouts using route groups
- Layout persistence during navigation

### Internal Mapping

**Current Next.js Setup in apps/docs:**
- Next.js 15.5.2 in use
- App Router structure exists
- Route groups: `(home)` for landing page
- Fumadocs integration in `/docs` routes
- Dashboard routes currently in same app (to be split)

**Existing Patterns:**
- Server Components by default
- Client Components marked with 'use client'
- Fumadocs uses its own layout system
- Middleware for auth (currently minimal)

**Monorepo Considerations:**
- Three separate Next.js apps (www, docs, dashboard)
- Each needs own next.config.mjs
- Shared Next.js configuration via packages/config
- Vercel deployment: separate projects, same repo
- Environment variables per app

### Synthesis

Next.js 15 in monorepo requires:
1. Consistent App Router conventions across all apps
2. Clear Server vs Client Component guidelines
3. Route organization patterns (groups, colocate, etc.)
4. Shared configuration where possible
5. App-specific customization where needed

The cursor rule should:
- Enforce App Router best practices
- Guide Server/Client Component decisions
- Standardize data fetching patterns
- Provide metadata configuration guidance
- Cover route handlers and special files
- Include monorepo-specific considerations

### Open Questions
- Middleware patterns for cross-app concerns?
- Shared API types between apps and packages?

### Proposed Actions
Create next.mdc with:
- App Router conventions
- Server vs Client Component guidelines
- Data fetching strategies
- Metadata and SEO patterns
- Route handlers
- Loading/error/not-found patterns
- Layout organization
- Monorepo-specific configuration


