# REVIEW STOP 1: Button Component Consolidation

## Status: ✅ Ready for Review

Phase 1 of the UI consolidation is complete. The button component has been unified in `packages/ui/src/components/button.tsx` with all features from all three apps.

## Changes Made

### Unified Button Component (`packages/ui/src/components/button.tsx`)

**Added Features:**
- ✅ `subtle` variant from www app (border-primary/20 bg-primary/10 text-primary)
- ✅ Tooltip support from docs/dashboard (tooltip, tooltipSide, tooltipSideOffset props)
- ✅ Icon support from docs/dashboard (icon, iconSide, showIconOnHover props)
- ✅ `icon-sm` size variant from docs/dashboard
- ✅ All existing variants preserved (default, destructive, outline, secondary, ghost, link)

**Technical Details:**
- Fixed circular import by using relative imports (`./tooltip` instead of `@recurse/ui/components`)
- Maintained SVG sizing from docs/dashboard (`size-3.5` default)
- Preserved all styling from both implementations

## What to Review

### 1. www App Button Usage
Test buttons in www app, especially:
- **Subtle variant**: Used in navigation and chat sections
  - `apps/www/components/sidebars/right/ChatSection.tsx` (line 177)
  - `apps/www/components/navigation/default.tsx` (line 336)
  - `apps/www/app/page.tsx` (line 97)
- **Default variant**: Used in CTAs and forms
- **Outline variant**: Used in navigation and CTAs
- **Ghost variant**: Used in navigation

**Key Pages to Check:**
- Homepage (`apps/www/app/page.tsx`)
- Navigation (`apps/www/components/navigation/default.tsx`)
- Signup Form (`apps/www/components/forms/SignupForm.tsx`)
- CTA Section (`apps/www/components/common/CTASection.tsx`)

### 2. docs App Button Usage
Test buttons with tooltip and icon features:
- Verify tooltip functionality still works
- Verify icon placement and hover animations work
- Check all variants render correctly

### 3. dashboard App Button Usage
Same as docs app - verify tooltip and icon features work.

## Testing Checklist

- [ ] www: Buttons render with correct styling
- [ ] www: Subtle variant appears correctly
- [ ] www: Outline variant has correct borders
- [ ] www: Default variant has correct colors
- [ ] docs: Tooltip appears on hover for buttons with tooltip prop
- [ ] docs: Icons display correctly in buttons
- [ ] docs: Icon hover animations work
- [ ] dashboard: Tooltip appears on hover
- [ ] dashboard: Icons display correctly
- [ ] All apps: Buttons maintain visual consistency
- [ ] All apps: No console errors related to buttons

## Next Steps (After Approval)

Once you approve the button consolidation:

1. **Phase 2**: Update imports in all three apps to use `@recurse/ui/components`
2. **Phase 3**: Migrate remaining shared components
3. **Phase 4**: Migrate www-specific components
4. **Phase 5**: Configure shadcn/ReUI to install to packages/ui

## Files Changed

- `packages/ui/src/components/button.tsx` - Unified button component
- `docs/planning/ui-consolidation-plan.md` - Complete migration plan
- `docs/planning/review-stop-1-button-consolidation.md` - This file

## Rollback Plan

If issues are found:
1. Revert `packages/ui/src/components/button.tsx` to previous version
2. Apps continue using local button components
3. Fix issues and re-test

---

**Please review the button appearance in all three apps and confirm everything looks correct before proceeding to Phase 2.**


