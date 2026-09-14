---
name: rima-component-creator
description: >-
  Guide for creating new React components in the RIMA mental health project.
  Use when the user asks to add a new page, UI component, feature, or widget.
  Covers styling rules, accessibility requirements, i18n integration,
  and trauma-informed design principles specific to mental health UX.
---

# RIMA Component Creator

## Pre-flight Checklist

Before creating any component, verify:
- [ ] Does a similar component already exist? Check `src/components/` tree
- [ ] Will this component display user-facing text? → i18n required
- [ ] Does this component handle crisis/safety content? → special rules apply
- [ ] Is this a page or a reusable component?

## Component Template

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MyComponentProps {
  // Define props with clear types
}

/**
 * Brief description of what this component does.
 * Reference: [Research basis or design rationale]
 */
export const MyComponent: React.FC<MyComponentProps> = ({ ...props }) => {
  const { t } = useTranslation();

  return (
    <div className="my-component">
      {/* Content */}
    </div>
  );
};
```

## Styling Rules

### NEVER use Tailwind classes. Use:

1. **Design tokens** (`var(--token-name)`) for colors, spacing, radius, shadows
2. **CSS classes** from `components.css` for common patterns (`.btn`, `.card`, `.input`)
3. **Page-specific styles** in `index.css` for page layouts
4. **Inline styles** with `var()` references for one-off styles

### Adding CSS for a New Component

Add to the appropriate CSS file:
```css
/* In src/styles/index.css (for page-level) or components.css (for reusable) */
.my-component { 
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
}
```

### Responsive Breakpoints
```css
/* Mobile-first approach */
@media (max-width: 768px) { /* Tablet and below */ }
@media (max-width: 500px) { /* Phone only */ }
```

## Trauma-Informed Design Principles

When creating mental health features, follow SAMHSA 6 Principles:

1. **Safety**: No sudden alarming visuals. Use soft colors, gentle transitions.
2. **Trustworthiness**: Be transparent about what data is collected and stored.
3. **Peer Support**: Forum features should encourage mutual support.
4. **Empowerment & Choice**: Always provide a clear "dismiss" or "skip" option.
5. **Cultural Sensitivity**: Respect diverse cultural perspectives on mental health.
6. **Non-retraumatization**: Avoid triggering language or visuals.

### UI Guidelines
- **NO red/alarming colors** for general UI. `--color-danger` is reserved for crisis ONLY.
- **Animations**: Use `fadeIn`, `fadeInUp`, `scaleIn` (defined in `index.css`). Keep ≤ 0.5s.
- **Touch targets**: Minimum `44px × 44px` for all interactive elements.
- **Crisis components**: Always include `ClinicalDisclaimer` where clinical-adjacent data appears.

## Page Components (Lazy-loaded)

New pages require:
1. Create component in `src/pages/NewPage.tsx`
2. Add lazy import + route in `src/App.tsx`:
   ```tsx
   const NewPage = lazy(() => import('./pages/NewPage').then(m => ({ default: m.NewPage })));
   // In routes:
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Optionally add navigation entry in `src/utils/constants.ts` and Sidebar/BottomNav

## State Management Patterns

| Use Case | Solution |
|:---|:---|
| Component-local state | `useState` |
| Persistent user data | `useLocalStorage('rima-key-name', defaultValue)` |
| Cross-component mood data | `useMood()` hook (Zustand store) |
| Theme (dark/light) | `useTheme()` hook |
| Cross-tab sync | `useLocalStorage` auto-syncs via `CustomEvent('local-storage')` |

## Required Integration Steps

After creating a component:
1. **i18n**: Add ALL text keys to 8 translation files
2. **CSS**: Add styles to appropriate CSS file
3. **Types**: Add TypeScript interfaces to `src/types/index.ts` if needed
4. **Tests**: Consider adding tests in `src/__tests__/` or `src/services/__tests__/`
5. **Verify**: Run `npx tsc --noEmit && npx vitest run && npx vite build`
