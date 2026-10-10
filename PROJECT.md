# Project: RIMA Phase 3 Improvements

## Architecture
- **Framework & Stack**: React 19, TypeScript, Vite, PWA (`vite-plugin-pwa` with Workbox), Vitest (jsdom), oxlint, i18next.
- **Styling Architecture**: Strictly pure vanilla CSS using custom properties defined in `src/styles/design-tokens.css` and `src/styles/components.css`. Strictly ZERO Tailwind CSS.
- **Rollup Intelligent Chunk Partitioning**:
  - `i18n-locales`: Dedicated chunk isolating all 8 translation JSON catalogs (`src/i18n/*.json`), reducing main entry chunk `index-*.js` by ~85–90% (from 613 kB to < 70 kB).
  - `i18n-vendor`: Dedicated vendor chunk for `i18next`, `react-i18next`, and `i18next-browser-languagedetector` with resolved vendor prefix precedence.
  - `react-vendor`, `recharts-vendor`, `icons-vendor`, `supabase-vendor`: Segmented vendor tiers for optimal HTTP/2 caching.
- **Offline PWA Architecture**:
  - Workbox `globPatterns` caching `**/*.{js,css,html,ico,png,svg,woff2}` with defensive `maximumFileSizeToCacheInBytes: 3000000` (3 MiB) headroom.
  - 100% offline precache guarantee across all app routes, components, and 8 translation catalogs.
- **Trauma-Informed Calm Suspense Component (`PageFallbackLoader`)**:
  - Replaces high-velocity spinning loader (0.8s spin) with a parasympathetically calming, low-stimulation skeleton animation (3.5s–4.5s gentle breathing pulse, ~0.22 Hz).
  - Compliant with WCAG 2.2 AA (`role="status"`, `aria-live="polite"`, `aria-busy="true"`, accessible ARIA live-region labels).
  - Complete zero-motion suppression under `data-sensory="low-stimulation"`, `data-sensory="calm"`, and `@media (prefers-reduced-motion: reduce)`.
  - Elimination of Cumulative Layout Shift (CLS) through stable skeleton geometry.
- **Internationalization (i18n)**:
  - 100% translation key parity across all 8 supported languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
  - Dynamic `document.documentElement.dir = 'rtl'` for Arabic.
- **Skill Engineering**:
  - Two modular, reusable skills in `.agents/skills/`: `rima-pwa-perf-and-code-splitting` and `rima-future-feature-architecture`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Rollup manualChunks for i18n catalogs | Partition `src/i18n/*.json` into `i18n-locales` chunk with cross-platform path regex | M1 | Survey 1, Survey 3 |
| 2 | Vendor chunk prefix precedence fix | Ensure `react-i18next` and `i18next-browser-languagedetector` route cleanly to `i18n-vendor` | M1 | Survey 1 |
| 3 | Workbox offline precaching resilience | Maintain 100% offline precache with 3 MiB headroom (`maximumFileSizeToCacheInBytes: 3000000`) | M1 | Survey 1 |
| 4 | Main app entry chunk reduction | Shrink `dist/assets/index-*.js` from 613 kB to < 70 kB | M1 | Survey 1 |
| 5 | Trauma-Informed PageFallbackLoader component | Accessible React Suspense fallback with WCAG AA live regions and accessible label | M2 | Survey 2 |
| 6 | Calm skeleton layout & breathing wave | Low-stimulation skeleton with 3.5s–4.5s parasympathetic breathing pulse (CLS elimination) | M2 | Survey 2 |
| 7 | Low-stimulation & zero-motion overrides | Strict suppression of motion under `data-sensory="low-stimulation"`, `data-sensory="calm"`, reduced-motion | M2 | Survey 2 |
| 8 | Pure vanilla CSS design tokens | Component styling using `--bg-card`, `--border-subtle`, `--color-primary`, strictly ZERO Tailwind | M2 | Survey 2 |
| 9 | 100% 8-language parity for calm loader | Add `calmLoader` namespace across `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar` | M2 | Survey 3 |
| 10 | Suspense boundary integration in App.tsx | Mount `PageFallbackLoader` in root `<Suspense fallback={...}>` | M2 | Survey 2 |
| 11 | Unit & accessibility tests for PageFallbackLoader | Vitest + React Testing Library tests covering ARIA, skeleton, props, and sensory modes | M2 | Survey 2 |
| 12 | Reusable skill: PWA Perf & Code Splitting | Author `.agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md` runbook with YAML frontmatter | M3 | Survey 3 |
| 13 | Reusable skill: Future Feature Architecture | Author `.agents/skills/rima-future-feature-architecture/SKILL.md` blueprint enforcing RIMA's 6 pillars | M3 | Survey 3 |
| 14 | 4-Tier Automated Quality Gates | Validate `npm run lint` (0/0), `npx tsc -b` (0), `npx vitest run` (100%), `npm run build` (clean PWA) | M4 | Survey 1, Survey 3 |
| 15 | Forensic Integrity Audit | Systematic forensic audit verifying authentic implementation and zero cheating | M4 | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: PWA Performance & Rollup Chunk Partitioning | `vite.config.ts`, Workbox offline precaching, bundle budgeting | none | DONE |
| 2 | M2: Trauma-Informed PageFallbackLoader & 8-Language Parity | `src/components/common/PageFallbackLoader.tsx`, `src/styles/components.css`, `src/i18n/*.json`, `src/App.tsx`, unit tests | none | DONE |
| 3 | M3: Reusable Skill Engineering in .agents/skills/ | `.agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md`, `.agents/skills/rima-future-feature-architecture/SKILL.md` | M1, M2 | DONE |
| 4 | M4: 4-Tier Quality Gates, Adversarial Verification & Audit | All 4 quality gates, Reviewer, Challenger, and Forensic Auditor verification | M1, M2, M3 | DONE |

## Interface Contracts
### Rollup Output Chunks ↔ Workbox Service Worker
- `i18n-locales-[hash].js`: Contains all 8 JSON translation catalogs.
- `i18n-vendor-[hash].js`: Contains `i18next`, `react-i18next`, and `i18next-browser-languagedetector`.
- `react-vendor-[hash].js`: Contains `react`, `react-dom`, `react-router`, `react-router-dom`, `scheduler`.
- `recharts-vendor-[hash].js`: Contains `recharts`, `d3-*`, `victory-vendor`.
- `icons-vendor-[hash].js`: Contains `lucide-react`.
- Workbox precaches all `.js` matching `**/*.{js,css,html,ico,png,svg,woff2}` without exceeding `maximumFileSizeToCacheInBytes: 3000000`.

### PageFallbackLoader Props Contract
```typescript
export interface PageFallbackLoaderProps {
  message?: string;
  hint?: string;
  ariaLabel?: string;
  showHero?: boolean;
  cardsCount?: number;
  className?: string;
  'data-sensory'?: 'low-stimulation' | 'calm';
}
```

### i18n Translation Schema Contract (`calmLoader`)
```json
{
  "calmLoader": {
    "accessibleLabel": string,
    "message": string,
    "hint": string
  }
}
```

## Code Layout
- `vite.config.ts` — Vite & Rollup build configuration, Workbox PWA options
- `src/components/common/PageFallbackLoader.tsx` — Trauma-informed accessible React Suspense loader
- `src/components/common/LoadingSpinner.tsx` — Legacy spinner component (preserved for backward compatibility)
- `src/styles/components.css` — Pure vanilla CSS component styles and calm breathing animations
- `src/styles/design-tokens.css` — CSS design tokens & sensory theme properties
- `src/i18n/{id,en,jv,su,ja,zh,es,ar}.json` — 8-language translation dictionaries
- `src/App.tsx` — Root application shell, routing, and Suspense fallback
- `src/components/__tests__/PageFallbackLoader.test.tsx` — Unit and accessibility tests for loader
- `.agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md` — Reusable PWA performance skill
- `.agents/skills/rima-future-feature-architecture/SKILL.md` — Reusable architectural blueprint skill
