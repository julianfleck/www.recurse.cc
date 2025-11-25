## 2025-11-25T07:07:12Z

### Context
Investigate reports that rapid theme toggling causes feedback loops and UI flicker. Goal: identify debouncing strategies for shared UI store syncing with `next-themes`.

### Queries (External Research - Extract/Expand)
- "zustand debounce theme toggle flicker"
- "next-themes flicker debounce"

### Sources (External)
1. Implementing Dark Mode in React — *Medium* (https://medium.com/%40dlrnjstjs/implementing-dark-mode-in-react-from-system-integration-to-smooth-animations-08b02adbe110) — accessed 2025-11-25T07:07:12Z  
   - Debouncing state updates with `useCallback` + `debounce` prevents rapid re-renders when toggling UI themes.
2. Eliminating Theme Flicker and Hydration Issues in Next.js — *Medium* (https://medium.com/%40ajayrajthakur111/eliminating-theme-flicker-and-hydration-issues-in-next-js-3acbae58faa8) — accessed 2025-11-25T07:07:12Z  
   - Suggests buffering theme updates and ensuring storage sync happens after visual changes to avoid flicker loops.
3. Dark Theme in Next.js Without Flicker using Tailwind — Tarun Gowda (https://www.tarungowda.com/blog/dark-theme-in-nextjs-without-flicker-using-tailwind) — accessed 2025-11-25T07:07:12Z  
   - Highlights importance of delaying persistence and syncing theme state to avoid client/server thrashing.

### Internal Mapping
- Reviewed `packages/ui/src/lib/ui-store.ts` to understand theme persistence, cookie/localStorage sync, and cross-tab listeners.
- Inspected `packages/ui/src/components/theme-provider.tsx` where bidirectional syncing between `next-themes` and UI store occurs (`ThemeSync` component).
- Verified theme toggle components (`apps/www/components/ui/ThemeToggle.tsx`, `apps/docs/components/theme-toggle.tsx`) rely solely on `next-themes` setters, so store updates originate from `ThemeSync`.
- Identified lack of guard against identical updates in `useUIStore.setTheme` and absence of debounce when `ThemeSync` pushes changes into the store.

### Evaluation
- Sufficient context: yes — both external guidance and internal architecture understood.
- Confidence level: 0.74
- Open questions:
  - Optimal debounce duration that avoids perceptible lag?
  - Need to debounce cookie/localStorage persistence or just store writes?

### Synthesis
External guidance emphasizes buffering theme persistence to avoid flicker when multiple subsystems respond to the same toggle. Internally, every `nextTheme` change immediately writes to the store, which in turn persists to cookies/localStorage and fans out to other tabs. Without gating identical updates, minor oscillations or simultaneous sync events can thrash the theme class, producing flicker. Debouncing the `nextTheme -> store` update and short-circuiting redundant assignments should break the loop without compromising cross-subdomain sync guarantees.

### Proposed Actions
- Add equality guard inside `useUIStore.setTheme` so identical values bail before persistence.
- Introduce small (≈75 ms) debounce inside `ThemeSync` when propagating `nextTheme` into the store, clearing on unmount.
- Validate that theme toggles no longer oscillate and document change in changelog.

### Proposed Changes
- Future rule update: add explicit guidance in `.cursor/rules/next.mdc` about debouncing bi-directional theme syncs in multi-store setups.

