# Changelog

## [2025-12-07T05:58:20Z] — Security: Patch React Server Components RCE (CVE-2025-55182)

**Context:** Vercel disclosed a critical React Server Components vulnerability (CVE-2025-55182) affecting React 19 and frameworks using it (including Next.js) that can lead to remote code execution via specially crafted requests when using vulnerable `react-server-dom-*` packages in affected Next.js versions [`https://vercel.com/changelog/cve-2025-55182`](https://vercel.com/changelog/cve-2025-55182).
**Changes:** Bumped all apps (`@recurse/www`, `docs.recurse.cc`, `@recurse/dashboard`) to `next@^15.5.7`, `react@^19.2.1`, and `react-dom@^19.2.1`, and aligned `eslint-config-next` to `^15.5.7` to ensure we are on framework builds that include the hardened RSC handling recommended by the advisory.
**Impact:** All Next.js apps in this monorepo now depend on patched React/Next versions that address CVE-2025-55182, reducing exposure to RSC-based remote code execution while preserving the existing App Router setup.
**Files touched:** `apps/www/package.json`, `apps/docs/package.json`, `apps/dashboard/package.json`, `.cursor/rules/overview.mdc`, `CHANGELOG.md`

## [2025-12-07T00:00:00Z] — Feature: Per-email invite tokens backed by local JSON store

**Context:** The dashboard signup flow used a single environment-based invite code, making it hard to manage per-user invitations and generate human-friendly tokens.
**Changes:** Added a `scripts/generate-invite-tokens.ts` CLI that creates kebab-case natural word invite tokens per email and stores them in `apps/dashboard/invites.json`, and updated the dashboard auth routes to validate invite codes against this store (including email+token matching at signup).
**Impact:** You can now generate and track per-email invite tokens locally while the existing multi-step signup flow continues to enforce invitation checks via the shared JSON store.
**Files touched:** `scripts/generate-invite-tokens.ts`, `apps/dashboard/invites.json`, `apps/dashboard/app/api/auth/check-invite/route.ts`, `apps/dashboard/app/api/auth/signup/route.ts`, `.cursor/rules/overview.mdc`, `CHANGELOG.md`

## [2025-11-27T00:00:00Z] — Perf: Stabilize particles background and remove aurora

**Context:** The www marketing site showed sluggish performance in some browsers due to heavy background animations (continuous WebGL aurora and dense canvas particles with full-speed rAF and O(N²) line drawing).
**Changes:** Removed the unused Aurora WebGL background, throttled the particles canvas to a lower frame rate with reduced particle counts on constrained devices, capped per-particle connections, and added `prefers-reduced-motion` handling that renders a static frame instead of a full animation.
**Impact:** Background visuals remain, but CPU/GPU usage is significantly lower on weaker devices and browsers, and users who request reduced motion see a non-animated but still styled background.
**Files touched:** `apps/www/components/backgrounds/Particles/Particles.tsx`, `apps/www/app/layout.tsx`, `apps/www/components/backgrounds/Aurora/Aurora.tsx` (deleted), `.cursor/rules/overview.mdc`, `CHANGELOG.md`

## [2025-11-25T07:45:10Z] — Fix: Remove duplicate docs root route
**Context:** The docs app failed to start because the optional catch-all route (`/[[...slug]]`) and the `(home)` root redirect both resolved to `/`, and Next.js forbids routes with identical specificity.
**Changes:** Deleted the `(home)` route group (layout + redirect page) and recorded the legacy path in the project overview as deprecated.
**Impact:** `next build` for `docs.recurse.cc` now completes without the specificity error, while `/` still redirects to `/introduction` through the existing optional catch-all logic.
**Files touched:** `apps/docs/app/(home)/page.tsx`, `apps/docs/app/(home)/layout.tsx`, `.cursor/rules/overview.mdc`, `CHANGELOG.md`

## [2025-11-25T07:21:56Z] — Fix: Ignore string-only child references
**Context:** The example GraphView fullscreen sidebar showed an “Untitled” node because JSON imports treated string child IDs as standalone nodes, generating empty placeholders.
**Changes:** Updated every GraphDataManager copy to convert string children into simple links and skip recursive parsing so we only walk actual node objects.
**Impact:** Static JSON examples (including the www marketing demo) no longer produce phantom nodes, and JSON ingestion across apps stays consistent.
**Files touched:** `apps/www/components/graph-view/utils/data/data-manager.ts`, `apps/docs/components/graph-view/utils/data/data-manager.ts`, `apps/dashboard/components/graph-view/utils/data/data-manager.ts`, `components/graph-view/utils/data/data-manager.ts`, `CHANGELOG.md`

## [2025-11-25T07:11:01Z] — Fix: Debounce Theme Sync
**Context:** Theme toggles caused oscillating updates between next-themes and the shared UI store, leading to visible flicker.
**Changes:** Debounced ThemeSync writes, short-circuited identical store updates, captured research + overview updates for the new debounce requirement.
**Impact:** Theme changes now settle once while still propagating across tabs/subdomains without loops.
**Files touched:** `packages/ui/src/components/theme-provider.tsx`, `packages/ui/src/lib/ui-store.ts`, `docs/research/2025-11-25/01-theme-toggle-debounce.md`, `.cursor/rules/overview.mdc`, `CHANGELOG.md`

## [2025-11-23T01:00:31Z] — Fix: Restore navigation styling + server-side blog data

**Context:** Navigation cards were accidentally restyled during blog feature work, and client components were trying to import server-side Fumadocs code causing build errors.

**Changes:**
- Completely restored original navigation styling from main branch
- Deleted new component files (NavigationCard.tsx, NavigationSection.tsx, DropdownGrid.tsx)
- Made minimal changes to ListItem component to support optional blog thumbnails
- Moved blog data fetching to server-side (layout.tsx) to fix "Module not found: fs" error
- Blog items now populated server-side and passed down as props through Header component

**Impact:** Navigation dropdowns match main styling exactly, blog entries show thumbnails on the left, and build succeeds without client/server boundary violations.

**Files touched:** `apps/www/components/navigation/default.tsx`, `apps/www/content/navigation.ts`, `apps/www/app/layout.tsx`, `CHANGELOG.md`

## [2025-11-25T00:00:00Z] — Feature: Mobile navigation sheet for marketing site

**Context:** The desktop navigation mega menu overflowed on small screens and needed a responsive mobile-specific experience without the complex grid layout.

**Changes:**
- Added a `MobileNavigation` component that uses a Sheet + Accordion pattern with a simplified vertical layout for navigation sections
- Updated the header client to render the existing desktop `DefaultNavigation` on md+ screens and the new mobile sheet navigation on smaller viewports
- Recorded the new component in the project structure ledger

**Impact:** The marketing site now shows a full-height, responsive navigation sheet on mobile that preserves existing section structure and anchor scrolling behavior while fitting within the viewport.

**Files touched:** `apps/www/components/navigation/mobile.tsx`, `apps/www/components/common/header-client.tsx`, `.cursor/rules/overview.mdc`, `CHANGELOG.md`

## [2025-11-21T07:08:03Z] — Feature: TextTransitionNew + FAQ hero variations

**Context:** Needed a richer token-aware text transition that measures actual widths, staggers animations per line, and reveals edits with a typed blur-in effect for reuse across marketing pages—starting with the FAQ hero copy.

**Changes:**
- Added `TextTransitionNew` to `packages/ui` with LCS-based diffing, hidden measurement spans, line-aware delays, and per-character typing animations driven by Framer Motion
- Regenerated UI exports so apps can import the new component via `@recurse/ui/components`
- Swapped the FAQ hero paragraph for a cycling set of statements powered by `TextTransitionNew`, rotating through multiple descriptions automatically
- Logged research notes plus updated the project overview ledger to reflect the new component

**Impact:** The FAQ hero now highlights exactly which words change (and how much the spacing shifts), while the UI package gains a reusable, typography-accurate transition that can power future marketing narratives.

**Files touched:** `packages/ui/src/components/text-transition-new.tsx`, `packages/ui/src/components/index.ts`, `apps/www/app/faq/page.tsx`, `docs/research/2025-11-21/01-text-transition-new.md`, `.cursor/rules/overview.mdc`

## [2025-11-21T05:30:17Z] — Feature: Reusable text transition + hero copy

**Context:** Needed to bring the legacy TextTransition animation (with blur + spacing tweaks) into the shared UI kit, document how it works, and power the homepage hero headline cycle from the marketing copy draft.

**Changes:**
- Added a Framer Motion-powered `TextTransition` to `packages/ui` that mirrors the original token-aware animation from `docs/context/TextTransition.jsx`
- Regenerated shared exports so apps can import the component via `@recurse/ui/components`
- Updated the www hero to cycle through the “Reasoning substrate…” lines with slight offsets between segments
- Captured animation behavior notes in `docs/context/text-transition-animation.md` and recorded artifacts in the overview ledger

**Impact:** Any app can now reuse the polished text animation, and the homepage hero reflects the desired cycling messaging without bespoke logic.

**Files touched:** `packages/ui/src/components/text-transition.tsx`, `packages/ui/src/components/index.ts`, `apps/www/components/landingpage/hero/index.tsx`, `.cursor/rules/overview.mdc`, `docs/context/text-transition-animation.md`

## [2025-11-21T04:47:28Z] — Refactor: Centralize navigation glow styles

**Context:** Need shared hero/nav card styling across apps.

**Changes:**
- Moved header spacing + glow utility CSS into `packages/ui/styles/global.css`
- Trimmed `apps/www/app/globals.css` to only import base + third-party styles

**Impact:** Docs and dashboard inherit the same hover effects without duplicating CSS.

**Files touched:** `packages/ui/styles/global.css`, `apps/www/app/globals.css`

## [2025-11-21T05:02:27Z] — Feature: Shared glow cards for docs & dashboard

**Context:** Align docs/dashboard cards with navigation card visuals and centralize implementation.

**Changes:**
- Added `GlowCard` to `packages/ui` and updated navigation cards to consume it
- Swapped docs/dashboard context/auth cards and MDX `<Card>` overrides to use `GlowCard`
- Wired Fumadocs MDX cards through the shared component for consistent hover/glow effects

**Impact:** All apps now share the same glow-interactive card experience via a single UI primitive.

**Files touched:** `packages/ui/src/components/glow-card.tsx`, `packages/ui/src/components/index.ts`, `.cursor/rules/overview.mdc`, `apps/www/components/navigation/NavigationCard.tsx`, `apps/docs/mdx-components.tsx`, `apps/docs/components/context/context-card.tsx`, `apps/dashboard/components/context/context-card.tsx`, `apps/dashboard/components/auth/auth-shell.tsx`

## [2025-10-28T05:00:00Z] — Fix: Environment Variables and Dashboard Setup

**Context:** Fixed dashboard app environment variable issues and updated monorepo documentation

**Changes:**
- Fixed duplicate 'type: json' import attribute in apps/dashboard/source.config.ts
- Copied .env.local to all apps (www, docs, dashboard) for shared env vars
- Updated monorepo rules to clarify dev server execution and env var handling
- Documented that user runs dev servers manually in separate terminals
- Added environment variables section to monorepo rules

**Impact:** Dashboard app now has proper environment configuration, env vars documented

**Files touched:**
- apps/dashboard/source.config.ts
- apps/www/.env.local
- apps/docs/.env.local
- apps/dashboard/.env.local
- .cursor/rules/monorepo.mdc

## [2025-10-28T04:27:55Z] — Add: Dashboard App Setup

**Context:** Setting up apps/dashboard as separate dashboard application

**Changes:**
- Copied components, lib, content, styles from apps/docs to apps/dashboard
- Created root layout and providers for dashboard app
- Updated package.json with all required dependencies
- Dashboard dev server runs on port 3002
- Root redirects to /dashboard

**Impact:** Dashboard app structure ready for testing and development

**Files touched:**
- apps/dashboard/ (entire directory structure)

## [2025-10-28T03:20:00Z] — Add: README and Git Infrastructure

**Context:** Completing bootstrap with README and Git setup

**Changes:**
- Created comprehensive README.md with repo layout
- Initialized Git repository
- Connected to GitHub remote
- Created .gitignore for monorepo
- Committed bootstrap work

**Impact:** Repository ready for development and collaboration

**Files touched:**
- README.md
- .gitignore

## [2025-10-28T03:15:00Z] — Optimize: Cursor Rule Patterns

**Context:** Audit and optimize glob patterns to avoid overloading agent

**Changes:**
- Made globs more specific (apps/**/* instead of **/*)
- Restricted fumadocs.mdc to content directories only
- Updated lastVerified timestamps
- Added research log for pattern audit

**Impact:** More targeted rule application, better performance

**Files touched:**
- .cursor/rules/*.mdc (6 files updated)
- docs/research/2025-10-28/06-rule-patterns-audit.md

## [2025-10-28T03:01:57Z] — Bootstrap: Cursor Rules Setup

**Context:** Establishing Recursive Bootstrapping Protocol for monorepo migration

**Changes:**
- Created .cursor/rules/ with 7 comprehensive rule files (general, typescript, next, routing, fumadocs, ultracite, monorepo)
- Created docs/ structure (research/, context/, tasks/)
- Created overview.yaml project ledger
- Created CHANGELOG.md audit trail
- Researched TypeScript, Next.js, Fumadocs, monorepo best practices

**Impact:** Foundation for systematic monorepo migration with consistent methodology

**Files touched:**
- .cursor/rules/*.mdc (7 files)
- docs/research/2025-10-28/*.md (5 files)
- docs/context/project-understanding.md
- overview.yaml
- CHANGELOG.md

