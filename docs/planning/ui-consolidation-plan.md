# UI Component Consolidation Plan

## Objective
Consolidate all UI components from `apps/www`, `apps/docs`, and `apps/dashboard` into `packages/ui` so that all three apps use shared components. When installing components via shadcn/ReUI registry, they should be installed directly to `packages/ui` and used by all apps.

## Current State Analysis

### Component Inventory

#### Components in packages/ui (Already Shared)
- avatar, badge, button, calendar, card, checkbox, collapsible, command
- copy-button, dialog, dropdown-menu, icon-toggle-button, input
- label, popover, progress-circle, radio-group, scroll-area, select
- spinner, switch, table, theme-toggle, tooltip
- kibo-ui components (announcement, kbd, pill, status)
- theme-provider

#### Components Shared by docs & dashboard (Identical)
- avatar, badge, button, calendar, card, checkbox, collapsible, command
- copy-button, dialog, dropdown-menu, icon-toggle-button, input
- label, popover, progress-circle, radio-group, scroll-area, select
- spinner, switch, table, theme-toggle, toc, toc-clerk, toc-thumb, tooltip
- kibo-ui components

#### Components Unique to www
- accordion, animated-counter, breadcrumb, code, discrete-slider
- dropzone-overlay, form, keyboard-shortcut, menubar, navigation-menu
- progress, radial-progress, resizable, separator, sheet, shiny-button
- sidebar, skeleton, slider, sonner, tabs, textarea, toggle, toggle-group
- ThemeToggle, ThemeToggleButton, ToggleArea, IconToggleButton (different casing)

#### Components Missing from packages/ui (Need Migration)
- accordion, animated-counter, breadcrumb, code, discrete-slider
- dropzone-overlay, form, keyboard-shortcut, menubar, navigation-menu
- progress, radial-progress, resizable, separator, sheet, shiny-button
- sidebar, skeleton, slider, sonner, tabs, textarea, toggle, toggle-group
- toc, toc-clerk, toc-thumb (docs/dashboard specific but should be in fumadocs package)

## Conflicts Identified

### 1. Button Component ⚠️ CRITICAL

**www/button.tsx:**
- Simpler implementation
- Has `subtle` variant (unique)
- Different border styling: `border border-border`
- Different SVG sizing: `[&_svg:not([class*="size-"])]:size-4`
- No tooltip support
- No icon support
- Different text color: `text-primary-foreground` vs `text-primary-foreground/90`

**docs/dashboard/button.tsx:**
- More feature-rich
- Has tooltip support (`tooltip`, `tooltipSide`, `tooltipSideOffset`)
- Has icon support (`icon`, `iconSide`, `showIconOnHover`)
- Different SVG sizing: `[&_svg:not([class*='size-'])]:size-3.5`
- Different border styling: no border in base classes
- Has `icon-sm` size variant
- Text color: `text-primary-foreground/90`

**packages/ui/button.tsx:**
- Similar to docs/dashboard
- Already uses `@recurse/ui` imports (correct)

**Resolution Strategy:**
- Merge features: Keep tooltip/icon support from docs/dashboard
- Add `subtle` variant from www
- Support both border styles via variant props
- Create unified button that supports all use cases

### 2. Component Casing Differences
- www: `IconToggleButton.tsx`, `ThemeToggle.tsx`, `ThemeToggleButton.tsx`, `ToggleArea.tsx`
- docs/dashboard: `icon-toggle-button.tsx`, `theme-toggle.tsx`
- Resolution: Standardize to kebab-case (`icon-toggle-button.tsx`)

### 3. Missing Dependencies
Need to check if packages/ui has all required dependencies for www-specific components.

## Migration Strategy

### Phase 1: Button Consolidation (REVIEW STOP 1)
**Goal:** Unify button component with all variants and features

1. Update `packages/ui/src/components/button.tsx`:
   - Add `subtle` variant from www
   - Merge border styling approaches
   - Support both SVG sizing approaches
   - Ensure all features from docs/dashboard are preserved

2. Test button in all three apps:
   - www: Verify subtle variant and border styles work
   - docs: Verify tooltip and icon features work
   - dashboard: Verify tooltip and icon features work

3. **REVIEW STOP 1:** User reviews button appearance in all three apps

### Phase 2: Core Component Migration (REVIEW STOP 2)
**Goal:** Migrate all shared components that exist in packages/ui

**Components to verify/match:**
- avatar, badge, calendar, card, checkbox, collapsible, command
- copy-button, dialog, dropdown-menu, icon-toggle-button, input
- label, popover, progress-circle, radio-group, scroll-area, select
- spinner, switch, table, theme-toggle, tooltip

**Steps:**
1. Compare each component across apps to ensure packages/ui version is most complete
2. Update any differences in packages/ui
3. Update imports in all three apps to use `@recurse/ui/components`
4. Test in each app

5. **REVIEW STOP 2:** User reviews core components in all three apps

### Phase 3: www-Specific Components Migration (REVIEW STOP 3)
**Goal:** Add www-specific components to packages/ui

**Components to migrate:**
- accordion, animated-counter, breadcrumb, code, discrete-slider
- dropzone-overlay, form, keyboard-shortcut, menubar, navigation-menu
- progress, radial-progress, resizable, separator, sheet, shiny-button
- sidebar, skeleton, slider, sonner, tabs, textarea, toggle, toggle-group

**Steps:**
1. Copy components from www to packages/ui
2. Update imports to use `@recurse/ui/lib` for utilities
3. Add dependencies to packages/ui/package.json
4. Export from packages/ui/src/components/index.ts
5. Update www imports to use `@recurse/ui/components`
6. Test www app

7. **REVIEW STOP 3:** User reviews www app for visual consistency

### Phase 4: Update shadcn/ReUI Configuration (REVIEW STOP 4)
**Goal:** Configure components.json to install to packages/ui

**Steps:**
1. Create/update `packages/ui/components.json`:
   - Set aliases to point to packages/ui
   - Configure for shared package usage
   
2. Update app-level components.json files:
   - Remove or update to point to packages/ui
   - Or remove entirely if using only shared components

3. Test installing a component:
   ```bash
   cd packages/ui
   pnpm dlx shadcn@latest add @reui/alert
   ```

4. **REVIEW STOP 4:** Verify component installation works and appears in all apps

### Phase 5: Final Import Updates (REVIEW STOP 5)
**Goal:** Complete migration of all imports

**Steps:**
1. Update remaining imports in apps/docs
2. Update remaining imports in apps/dashboard  
3. Verify no local component files remain (except app-specific non-UI components)
4. Run build and tests for all apps

5. **REVIEW STOP 5:** Final visual review of all three apps

### Phase 6: Cleanup
**Goal:** Remove duplicate files and verify

**Steps:**
1. Remove duplicate component files from apps
2. Update documentation
3. Update CHANGELOG.md
4. Update .cursor/rules/overview.mdc

## Review Stops Summary

1. **REVIEW STOP 1** - Button component consolidation
   - Review button appearance in www, docs, dashboard
   - Verify all variants work correctly

2. **REVIEW STOP 2** - Core components migration
   - Review shared components in all apps
   - Verify no visual regressions

3. **REVIEW STOP 3** - www-specific components
   - Review www app for visual consistency
   - Verify all www-specific features work

4. **REVIEW STOP 4** - shadcn/ReUI configuration
   - Test component installation
   - Verify components appear correctly

5. **REVIEW STOP 5** - Final review
   - Complete visual review of all three apps
   - Verify build and functionality

## Technical Considerations

### Import Patterns

**Before:**
```tsx
import { Button } from "@/components/ui/button";
```

**After:**
```tsx
import { Button } from "@recurse/ui/components";
```

### Dependencies
- All component dependencies must be in `packages/ui/package.json`
- Apps should only depend on `@recurse/ui`, not component dependencies directly

### TypeScript Paths
- Apps should have `@recurse/ui` in their tsconfig.json paths
- Verify path resolution works correctly

### Build Order
- packages/ui must build before apps
- Consider adding build scripts to ensure correct order

## Risks & Mitigation

### Risk 1: Visual regressions
- **Mitigation:** Review stops at each phase
- **Mitigation:** Compare component files before migration

### Risk 2: Missing dependencies
- **Mitigation:** Check each component's imports before migration
- **Mitigation:** Add dependencies to packages/ui/package.json

### Risk 3: Breaking changes
- **Mitigation:** Maintain backward compatibility in button component
- **Mitigation:** Test each app after import updates

### Risk 4: Build issues
- **Mitigation:** Test builds incrementally
- **Mitigation:** Verify TypeScript path resolution

## Success Criteria

- ✅ All three apps use components from `@recurse/ui/components`
- ✅ shadcn/ReUI components install to `packages/ui`
- ✅ No duplicate component files in apps
- ✅ All apps build successfully
- ✅ Visual consistency maintained across all apps
- ✅ Button component supports all variants and features

## Timeline Estimate

- Phase 1: Button consolidation - 1-2 hours
- Phase 2: Core components - 2-3 hours
- Phase 3: www-specific components - 2-3 hours
- Phase 4: shadcn configuration - 1 hour
- Phase 5: Final imports - 2-3 hours
- Phase 6: Cleanup - 1 hour

**Total:** ~10-13 hours (with review stops)


