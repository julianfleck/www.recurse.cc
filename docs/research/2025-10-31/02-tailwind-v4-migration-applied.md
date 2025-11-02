## 2025-10-31T21:30:00Z

### Context
Successfully validated Tailwind v4 CSS-first configuration in test project. Now applying the same pattern to the main monorepo to fix backdrop-filter bracket notation issues.

### Changes Applied

#### 1. Added `@source` Directives to All App CSS Files

**Files Updated:**
- `apps/www/app/globals.css`
- `apps/docs/app/global.css`
- `apps/dashboard/app/global.css`

**Change:**
Added `@source` directives immediately after `@import "tailwindcss"` and before other imports:

```css
@import "tailwindcss";

/* Tailwind v4 content sources - must be before other imports */
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../app/**/*.{js,ts,jsx,tsx,mdx}";
@source "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}";
```

**Rationale:**
- Tailwind v4 uses CSS-first configuration
- `@source` directives tell Tailwind where to scan for class names
- Must be placed before other CSS imports
- Each app scans its own components + shared `packages/ui`

#### 2. Removed `content` Array from `tailwind.config.ts`

**File Updated:**
- `packages/ui/tailwind.config.ts`

**Change:**
Removed the `content` array since we're now using `@source` directives in CSS:

```typescript
const config: Config = {
  // Note: Content paths are now specified via @source directives in CSS files (Tailwind v4 CSS-first approach)
  // Each app's globals.css includes @source directives for its own components and packages/ui
  theme: {
    // ... theme extensions remain
  },
  plugins: [
    // ... plugins remain
  ],
};
```

**Rationale:**
- Tailwind v4 prefers CSS-first configuration
- `content` array in config conflicts with `@source` directives
- Config file now only contains plugins and theme extensions (which can't be moved to CSS)

#### 3. Verified PostCSS Configuration

**Files Verified:**
- `apps/www/postcss.config.mjs`
- `apps/docs/postcss.config.mjs`
- `apps/dashboard/postcss.config.mjs`

**Status:** ✅ All correctly use `@tailwindcss/postcss` plugin

#### 4. Dialog Component Verification

**File Checked:**
- `packages/ui/src/components/dialog.tsx`

**Status:** ✅ Uses `[backdrop-filter:blur(12px)]` which should now render correctly

### Expected Results

1. **Bracket Notation Works:**
   - `[backdrop-filter:blur(12px)]` in dialog overlay should now render correctly
   - Other arbitrary properties (e.g., `w-[600px]`) should work

2. **Content Scanning:**
   - Tailwind scans all components via `@source` directives
   - No conflicts between config `content` array and CSS `@source` directives

3. **Plugin Support:**
   - Typography plugin continues to work (via config)
   - Custom utilities (tracking-switzer-*) continue to work (via config)

### Comparison with Test Project

**Test Project (Working):**
- ✅ No `tailwind.config.ts` (pure CSS-first)
- ✅ `@source` directives in CSS
- ✅ `@theme` for custom properties
- ✅ `@tailwindcss/postcss` plugin

**Main Project (Now Aligned):**
- ✅ Minimal `tailwind.config.ts` (only plugins + theme extensions)
- ✅ `@source` directives in CSS
- ✅ `@theme inline` in shared CSS (packages/config/styles/global.css)
- ✅ `@tailwindcss/postcss` plugin

**Key Difference:**
- Main project keeps config file for typography plugin and custom utilities
- Test project was simpler (no plugins needed)
- Both approaches valid - main project needs plugins so keeps minimal config

### Next Steps

1. **Test the changes:**
   - Run dev servers for each app
   - Open dialog components and verify backdrop blur works
   - Check browser inspector for `backdrop-filter: blur(12px)` CSS property

2. **Verify other arbitrary properties:**
   - Test `w-[600px]`, `max-w-[90vw]` etc. in command dialogs
   - Ensure all bracket notation utilities render correctly

3. **Monitor for issues:**
   - Check if content scanning works correctly
   - Verify no classes are missing
   - Ensure plugins still function

### Files Changed

- `apps/www/app/globals.css` - Added @source directives
- `apps/docs/app/global.css` - Added @source directives
- `apps/dashboard/app/global.css` - Added @source directives
- `packages/ui/tailwind.config.ts` - Removed content array, kept plugins + theme

### Related Research

- `docs/research/2025-10-31/01-tailwind-v4-monorepo-best-practices.md` - Initial research and test project setup

