# Changelog

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

