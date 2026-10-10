# Project: RIMA Phase 2 Improvements

## Architecture
- **Framework & Stack**: React 19, TypeScript, Vite, PWA (vite-plugin-pwa), Vitest (jsdom), oxlint, i18next.
- **Styling**: Strictly vanilla CSS using custom properties in `src/styles/design-tokens.css` and `src/styles/components.css`. Zero Tailwind CSS.
- **State & Local Persistence**: Zustand (`useMoodStore`), IndexedDB (`rimaAsyncStorage`), and `window.localStorage` with reactive `CustomEvent('local-storage')` synchronization.
- **Zero-Network JITAI Subsystem**: Pure deterministic rule engine evaluating Yale Mood Meter 2D trajectories, CBT-I sleep metrics, and behavioral activation engagement, governed by strict anti-habituation guardrails (quiet hours 22:00-07:00, 4h cooldown, 3-nudge daily cap, daily dismiss state with date rollover).
- **Fast-Action Crisis Subsystem**: Cognitive-constriction-optimized modal/card accessible globally from `SOSButton` and `Home.tsx`. Single-tap de-escalation: primary coping action, primary trusted contact with working `tel:` link, 119 Ext 8 hotline (`tel:119,8`), and somatic grounding shortcuts.
- **Internationalization (i18n)**: 100% translation key parity across all 8 supported languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`), with dynamic `document.documentElement.dir` RTL support for Arabic.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | JITAI Types & Data Models | Type definitions for nudges, context, triggers, and daily persisted state | M1 | Survey 1 |
| 2 | JITAI Deterministic Rule Engine | Evaluates Yale Mood Meter 2D (red vagal reset, blue BA spark, drop velocity), CBT-I sleep efficiency (<85%), and inactivity | M1 | Survey 1 |
| 3 | JITAI Anti-Habituation Guardrails | Quiet hours (22:00-07:00), 4h cooldown, 3-nudge daily cap | M1 | Survey 1 |
| 4 | JITAI Daily Dismissal Persistence | Local storage key `'rima-jitai-state'`, calendar day rollover, dismiss-per-type | M1 | Survey 1 |
| 5 | JITAI React Hook | `useJitai` hook binding moodStore, sleepService, BA activities, and storage events | M1 | Survey 1 |
| 6 | Fast-Action Safety Card Data Service | Service to extract primary coping strategy, trusted personal contact phone, and crisis hotlines | M2 | Survey 2 |
| 7 | Fast-Action Safety Card UI | High-contrast, WCAG 2.2 AA accessible component for acute distress and cognitive constriction | M2 | Survey 2 |
| 8 | 119 Ext 8 & Trusted Contact Dialing | Standardized `tel:119,8` action and structured personal contact single-tap call | M2 | Survey 2 |
| 9 | Somatic Grounding Shortcuts | Single-tap jump to 5-4-3-2-1 grounding (`/grounding`) or Stanford Cyclic Sighing (`/breathe`) | M2 | Survey 2 |
| 10 | Emergency Touchpoints Integration | Fast-Action card integration in global `SOSButton.tsx` and Home dashboard | M2 | Survey 2 |
| 11 | 8-Language Translation Parity | Exact key parity across `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar` for all JITAI and Safety Card copy | M3 | Survey 3 |
| 12 | Arabic RTL Direction Support | Dynamic `document.documentElement.dir = 'rtl'` and `lang` synchronization in `App.tsx` | M3 | Survey 3 |
| 13 | JITAI Nudge Card UI Component | Dismissible, accessible card component using design tokens | M3 | Survey 1 |
| 14 | Home Dashboard JITAI Placement | Mounting `<JitaiNudgeCard />` on `Home.tsx` below mood section and above affirmation card | M3 | Survey 1 |
| 15 | Quality Gates & Forensic Audit | Zero oxlint errors, zero tsc errors, 100% Vitest pass, successful PWA build, forensic integrity verification | M4 | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: JITAI Engine & Persistence Services | `src/types/jitai.ts`, `src/services/jitaiEngine.ts`, `src/services/jitaiPersistence.ts`, `src/hooks/useJitai.ts`, unit tests | none | DONE |
| 2 | M2: Fast-Action Emergency Safety Card | `src/services/safetyCardService.ts`, `src/components/safety/FastActionSafetyCard.tsx`, `SOSButton.tsx` upgrade, unit tests | none | DONE |
| 3 | M3: 8-Language Parity, RTL & Home UI Integration | `src/i18n/*.json` (all 8 locales), `src/App.tsx` (RTL), `src/components/common/JitaiNudgeCard.tsx`, `src/pages/Home.tsx`, unit tests | M1, M2 | DONE |
| 4 | M4: Quality Gates, E2E Verification & Forensic Audit | oxlint, tsc -b, vitest suite, production build, forensic integrity audit | M3 | DONE |

## Interface Contracts
### JITAI Engine ↔ Consumers (`useJitai.ts`, `JitaiNudgeCard.tsx`)
```typescript
export interface JitaiNudge {
  id: string;
  type: JitaiNudgeType;
  category: 'mood' | 'sleep' | 'activity';
  urgency: 'low' | 'medium' | 'high';
  titleKey: string;
  titleFallback: string;
  messageKey: string;
  messageFallback: string;
  actionLabelKey: string;
  actionLabelFallback: string;
  targetRoute: string;
  iconName: string;
}

export function evaluateJitai(context: JitaiContext): JitaiNudge | null;
export function getJitaiState(currentDate?: string): JitaiPersistedState;
export function dismissNudgeToday(type: JitaiNudgeType): void;
```

### Safety Card Service ↔ Fast-Action Safety Card UI
```typescript
export interface EmergencySafetyAction {
  primaryCopingStrategy: string;
  trustedContact: { name: string; phone?: string } | null;
  hotline119: { name: string; phone: string; href: string }; // 'tel:119,8'
  somaticRoute: string; // '/grounding' or '/breathe'
}

export function getEmergencySafetyActions(): EmergencySafetyAction;
```

## Code Layout
- `src/types/jitai.ts` — JITAI type definitions and interfaces
- `src/services/jitaiEngine.ts` — Deterministic recommendation heuristics & guardrails
- `src/services/jitaiPersistence.ts` — LocalStorage state and daily dismissal manager
- `src/hooks/useJitai.ts` — React hook for components
- `src/services/safetyCardService.ts` — Helper extracting coping actions, contacts, and hotlines
- `src/components/safety/FastActionSafetyCard.tsx` — Accessible, high-contrast crisis de-escalation card
- `src/components/common/JitaiNudgeCard.tsx` — Dashboard contextual nudge card
- `src/i18n/{id,en,jv,su,ja,zh,es,ar}.json` — 8-language translation dictionary files
- `src/styles/components.css` — Vanilla CSS styling for JITAI card and Fast-Action card
