---
name: rima-project-rules
description: >-
  Core rules and conventions for the RIMA (Ruang Interaksi Mental Aman) mental health PWA project.
  Always-on rules that apply to ALL coding tasks in this project. Covers tech stack constraints,
  styling rules, crisis safety requirements, i18n obligations, and accessibility standards.
---

# RIMA Project Rules & Conventions

## Critical Constraints — NEVER Violate

### 1. NO TAILWIND CSS
The project uses **vanilla CSS** with CSS custom properties (`var(--token-name)`).
- **NEVER** use Tailwind utility classes (`flex`, `items-center`, `bg-*`, `p-4`, etc.)
- All styles go in `src/styles/design-tokens.css`, `components.css`, or `index.css`
- Component-specific inline styles use `var()` references to design tokens

### 2. Offline-First Architecture
- All personal data stored in `localStorage` under `rima-*` keys
- Core features MUST work without internet
- Supabase is optional (forum only) — always implement localStorage fallback
- NEVER send personal mood/journal/safety data to any server

### 3. Crisis Safety is Non-Negotiable
- Crisis detection runs **100% client-side** — no server dependency
- ALL crisis code paths MUST be tested — a broken crisis path is a P0 bug
- Phone dialer links use `tel:NUMBER,EXTENSION` (comma for extension pause)
- Escalation routes MUST point to existing routes in `App.tsx`
- NEVER display crisis content publicly (emotional contagion prevention)

### 4. i18n: All 8 Languages Required
Languages: `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`
- Every user-visible string MUST use `t('key', 'fallback')`
- New keys MUST be added to ALL 8 files in `src/i18n/*.json`
- Fallback language is Indonesian (`id`)
- Arabic (`ar`) requires RTL consideration

### 5. Accessibility (WCAG 2.2 AA)
- Color contrast ratio ≥ 4.5:1 for text
- All interactive elements: `min-height: 44px`, `min-width: 44px`
- `aria-label` on icon-only buttons
- `aria-live="polite"` on dynamic content
- `role="alert"` on crisis banners
- Respect `prefers-reduced-motion` (already handled globally)

## File Organization

```
src/
├── components/
│   ├── common/       # Reusable: ClinicalDisclaimer, SessionAwareness, etc.
│   ├── layout/       # AppShell, Sidebar, BottomNav
│   ├── safety/       # SOSButton, SafetyPlan, CrisisInterceptor
│   └── ui/           # Button, Card, Input, Modal, MoodSelector
├── hooks/            # Custom React hooks
├── services/         # Business logic (crisis detection, escalation, mood analysis)
├── stores/           # Zustand stores
├── pages/            # Route page components
├── styles/           # CSS files (design-tokens, components, index)
├── i18n/             # Translation JSON files
├── data/             # Static content (education, professional services, spiritual)
├── utils/            # Helpers, constants, export/import
└── types/            # TypeScript type definitions
```

## Design Tokens Reference

| Token | Usage |
|:---|:---|
| `--color-primary` | Trust, calm blue — primary actions |
| `--color-secondary` | Healing, mint green — positive feedback |
| `--color-accent` | Reflection, lavender — insights |
| `--color-warm` | Hope, amber — encouragement |
| `--color-danger` | Emergency, red — crisis only |
| `--bg-primary` | Main background |
| `--bg-card` | Card surfaces (glassmorphic) |
| `--text-primary/secondary/tertiary` | Text hierarchy |

## Testing & Building

```bash
npx vitest run          # Run all tests (must be 30/30+)
npx tsc --noEmit        # TypeScript check (must be zero errors)
npx vite build          # Production build (must succeed)
npx oxlint              # Lint check
```
