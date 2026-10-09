---
name: rima-wcag-accessibility
description: >-
  Guide and audit protocols for WCAG 2.2 AA compliance, neurodivergent accessibility,
  and low-stimulation sensory design in RIMA. Use when creating or refactoring UI components,
  touch targets, color themes, focus management, animations, and screen-reader semantics.
---

# RIMA WCAG 2.2 AA & Neuro-Inclusion Accessibility Guide

## 1. Core Principles
RIMA serves individuals in states of heightened emotional distress, panic, anxiety, and neurodivergent conditions (ADHD, Autism Spectrum). Accessibility is not an afterthought; it is a clinical safety requirement.

## 2. WCAG 2.2 Key Success Criteria

### A. SC 2.5.8: Target Size (Minimum) — Level AA
- **Standard requirement:** Touch/click targets must be at least 24×24 CSS pixels.
- **RIMA Clinical Standard:** Interactive elements (buttons, factor chips, mood emojis, inputs, emergency hotlines) must have a touch target of at least **48×48 CSS pixels** (`min-height: 48px; min-width: 48px;` or touch-target padding).
- **Rationale:** Users experiencing acute anxiety or panic often have psychomotor tremors (gemetar), making small tap targets frustrating and error-prone.

```css
/* Touch target design token rule */
.touch-target-safe {
  min-height: 48px;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### B. SC 2.4.11: Focus Not Obscured (Minimum) — Level AA
- **Requirement:** When any interactive element receives keyboard focus, it must not be completely hidden by fixed UI elements (such as bottom navigation bars or sticky headers).
- **RIMA Implementation:** Ensure all scrollable containers have bottom padding (`padding-bottom: calc(var(--bottom-nav-height) + 1.5rem)`) and scroll margin (`scroll-margin-bottom: 5rem;`).

### C. SC 1.4.3: Contrast (Minimum) — Level AA
- Normal text requires at least **4.5:1** contrast ratio against its background.
- Large text ($\ge 18\text{pt}$ or $14\text{pt}$ bold) requires at least **3:1**.
- Interactive UI components and graphical objects require at least **3:1** (SC 1.4.11).

## 3. Neuro-Inclusion & Low-Stimulation Sensory Mode

### A. Prefers Reduced Motion
Respect system settings and provide an in-app toggle in the user profile:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### B. Low-Stimulation Palette (Desaturated)
When low-stimulation mode is active:
- Red emergency tones are softened to warm terracotta (`#C86D51`).
- High-contrast alert greens are shifted to muted sage (`#789280`).
- Backgrounds use deep matte low-glare tones rather than pitch blacks or vibrant neons.

### C. Single-Focus Paragraph Masking
- For questionnaires and reading materials, dim unselected items so users can concentrate on one question at a time without cognitive sensory overload.

## 4. Screen Reader Semantics & ARIA Standards
- All iconography (`lucide-react`) must have either `aria-hidden="true"` or an accompanying `aria-label`.
- Custom modals must implement:
  - `role="dialog"` and `aria-modal="true"`.
  - `aria-labelledby` referencing the modal title ID.
  - Keyboard Escape listener to dismiss.
  - Focus trap keeping keyboard navigation inside the modal while open.
- Charts (`recharts`) must always be accompanied by an accessible summary table or descriptive text for screen readers.

## 5. Right-to-Left (RTL) Layout for Arabic
- Arabic (`ar`) layout must support proper bidirectional flow:
  - Use logical CSS properties: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`.
  - Flip directional arrows (chevrons) for backwards/forwards navigation.
  - Keep numbers, time codes, and phone numbers in LTR direction (`direction: ltr; unicode-bidi: embed;`).
