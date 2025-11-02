## 2025-10-31T21:16:55Z

### Context
We're experiencing issues with Tailwind CSS v4 bracket notation (e.g., `[backdrop-filter:blur(12px)]`) not being rendered in our monorepo setup. The user requested research on best practices for shadcn/tailwind in monorepos and a test project to validate the ReUI dialog component setup.

### Queries (External Research - Extract/Expand)
- "shadcn ui monorepo setup tailwind config best practices 2024"
- "tailwind css v4 monorepo shared config workspace 2024"
- "shadcn ui components.json monorepo workspace alias configuration"
- "next.js 15 tailwind css v4 setup postcss configuration 2024"

### Sources (External)
1. Tailwind CSS v4 Documentation - https://tailwindcss.com/docs
   - Key findings: Tailwind v4 introduces CSS-first configuration approach
   - Uses `@import "tailwindcss"` instead of `@tailwind` directives
   - Uses `@source` directives to specify content paths instead of `content` array in config
   - Uses `@theme` directive for custom properties instead of `theme.extend` in config

2. Stack Overflow - Tailwind v4 Monorepo Setup
   - Key findings: Tailwind v4 uses CSS-first configuration with `@source` directives
   - Example: `@source "./../../../apps/**/*.{js,ts,jsx,tsx}";`

3. Various blog posts and documentation
   - Key findings: Tailwind v4 has automatic source detection but explicit `@source` directives recommended for monorepos
   - PostCSS config should use `@tailwindcss/postcss` plugin

### Internal Mapping
- **Current Setup:**
  - Using `tailwind.config.ts` with `content` array (Tailwind v3 pattern)
  - Using `@import "tailwindcss"` in CSS (Tailwind v4 pattern)
  - PostCSS config uses `@tailwindcss/postcss` (correct for v4)
  - Has `@theme inline` in `packages/config/styles/global.css` (partial v4 pattern)

- **Gaps Identified:**
  - Mixing v3 (config file) and v4 (CSS imports) patterns
  - No `@source` directives in CSS files
  - Config file may be interfering with CSS-first approach

### Test Project Setup
Created a clean test project at `tmp/reui-test/` to validate the setup:

**Structure:**
```
tmp/reui-test/
├── app/
│   ├── globals.css       # Uses @import, @source, @theme
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── dialog.tsx     # ReUI component with [backdrop-filter:blur(4px)]
│       └── utils.ts
├── components.json        # Shadcn config
├── postcss.config.mjs    # @tailwindcss/postcss plugin
└── package.json          # Tailwind v4.1.16, Next.js 15.5.2
```

**Key Differences from Main Project:**
1. **No `tailwind.config.ts` file** - Pure CSS-first configuration
2. **Uses `@source` directives** in `globals.css`:
   ```css
   @source "../components/**/*.{js,ts,jsx,tsx}";
   @source "../app/**/*.{js,ts,jsx,tsx}";
   ```
3. **Uses `@theme` in CSS** instead of config file:
   ```css
   @theme {
     --color-background: oklch(0.98 0 0);
     /* ... */
   }
   ```

**ReUI Dialog Component:**
- Uses `[backdrop-filter:blur(4px)]` bracket notation in `DialogOverlay`
- Import fixed: `import * as DialogPrimitive from '@radix-ui/react-dialog';`
- Utils import: `@/components/ui/utils`

### Evaluation
- **Confidence level:** 0.9
- **Sufficient context:** Yes - Test project validates the CSS-first approach works with ReUI components

### Synthesis
**Root Cause:**
The main project is mixing Tailwind v3 and v4 patterns:
1. Has `tailwind.config.ts` with `content` array (v3 pattern)
2. Uses `@import "tailwindcss"` in CSS (v4 pattern)
3. Missing `@source` directives in CSS (v4 requirement)

**Solution:**
1. Remove or deprecate `tailwind.config.ts` (keep only for plugins if needed)
2. Add `@source` directives to CSS files in each app's `globals.css`
3. Move theme configuration from config file to `@theme` in CSS
4. Ensure PostCSS config uses `@tailwindcss/postcss` (already correct)

**Best Practices for Monorepo:**
1. **CSS-First Configuration (Tailwind v4):**
   - Use `@import "tailwindcss"` in each app's `globals.css`
   - Use `@source` directives to specify content paths:
     ```css
     @source "../components/**/*.{js,ts,jsx,tsx}";
     @source "../app/**/*.{js,ts,jsx,tsx}";
     @source "../../packages/ui/**/*.{js,ts,jsx,tsx}";
     ```
   - Use `@theme` for custom properties in CSS

2. **Shared Components:**
   - Install components directly into `packages/ui` using shadcn CLI
   - Configure `packages/ui/components.json` for monorepo workspace aliases
   - Each app imports from `@recurse/ui/components/*`

3. **PostCSS Configuration:**
   - Use `@tailwindcss/postcss` plugin (not `tailwindcss` plugin)
   - Can be shared across apps or per-app

### Proposed Actions
1. **Migrate to Pure CSS-First Configuration:**
   - Add `@source` directives to each app's `globals.css`
   - Move theme extensions from `tailwind.config.ts` to `@theme` in CSS
   - Consider removing `tailwind.config.ts` or keeping only for plugins

2. **Update Main Project Structure:**
   - Ensure `packages/config/styles/global.css` uses `@source` if it's the entry point
   - Or add `@source` to each app's `globals.css` that imports the shared styles

3. **Test and Validate:**
   - Verify `[backdrop-filter:blur(12px)]` renders correctly after migration
   - Test other bracket notation utilities (e.g., `w-[600px]`)
   - Ensure all apps continue to work correctly

### Open Questions
- Should we keep `tailwind.config.ts` for typography plugin or migrate to CSS?
- How to handle shared theme variables across multiple CSS files?
- Should `packages/ui` have its own `@source` directives or rely on apps?

### Proposed Changes
- Document the migration from v3 config to v4 CSS-first approach
- Create migration guide for updating existing apps
- Update `.cursor/rules` to reflect Tailwind v4 best practices

