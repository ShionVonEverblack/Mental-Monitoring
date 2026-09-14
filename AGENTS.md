# RIMA (Ruang Interaksi Mental Aman) — Agent Operating Guide

Welcome to the **RIMA** codebase. This file instructs any AI agent or developer on how to maintain, improve, and safely interact with this mental health self-care PWA.

---

## 🚨 Critical Non-Negotiables

1. **NO TAILWIND CSS**:
   - The project uses pure **vanilla CSS** and CSS custom properties defined in `src/styles/design-tokens.css` and `src/styles/components.css`.
   - Never use Tailwind utility classes (e.g., `flex`, `p-4`, `bg-blue-500`).
2. **Crisis Safety is P0**:
   - Crisis detection is **100% client-side** (`src/services/crisisDetectionService.ts`).
   - Escalation routes must exist in `src/App.tsx`.
   - Phone dialer links must use `tel:119,8` (comma for extension pause).
   - Crisis content must be intercepted before public forum broadcast (prevent suicide contagion).
3. **Offline-First & Local Privacy (UU PDP No. 27/2022)**:
   - All user data lives in `localStorage` (`rima-*` keys).
   - Zero telemetry of mental health data to external analytics servers.
4. **8-Language i18n Obligation**:
   - Every user-facing string must support: `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`.
   - Key parity must be maintained across all 8 files in `src/i18n/`.
5. **Calm & Trauma-Informed Design**:
   - Never use alarmist red modals for standard UI; red is strictly reserved for acute emergencies.
   - Respect Quiet Hours (22:00–07:00).
   - Support Quick Exit (`.quick-exit-btn`) for domestic safety.

---

## 🛠️ Specialized Agent Skills

The following modular skills are located in `.agents/skills/` and provide in-depth runbooks for specific tasks:

| Skill | Path | Focus Area |
|:---|:---|:---|
| **rima-project-rules** | [SKILL.md](./.agents/skills/rima-project-rules/SKILL.md) | Core stack rules, file structure, token map, and styling conventions. |
| **rima-crisis-nlp** | [SKILL.md](./.agents/skills/rima-crisis-nlp/SKILL.md) | Crisis detection NLP engine, co-occurrence scoring, negation handling, Gen-Z slang. |
| **rima-clinical-evidence** | [SKILL.md](./.agents/skills/rima-clinical-evidence/SKILL.md) | PHQ-9, GAD-7, Stanley-Brown Safety Plan, APA/NICE guidelines, somatic breathing. |
| **rima-offline-security** | [SKILL.md](./.agents/skills/rima-offline-security/SKILL.md) | UU PDP compliance, Web Crypto AES-GCM, CSV/JSON sanitization, right to erasure. |
| **rima-calm-tech** | [SKILL.md](./.agents/skills/rima-calm-tech/SKILL.md) | Calm tech principles, Time Well Spent, grace streaks, quiet hours, contagion barrier. |
| **rima-component-creator** | [SKILL.md](./.agents/skills/rima-component-creator/SKILL.md) | Step-by-step React component creation, accessibility (WCAG), responsive styling. |
| **rima-i18n-management** | [SKILL.md](./.agents/skills/rima-i18n-management/SKILL.md) | Translation workflow, batch update scripts, Arabic RTL, language switcher sync. |
| **rima-qa-verification** | [SKILL.md](./.agents/skills/rima-qa-verification/SKILL.md) | Vitest testing, TypeScript check, Oxlint, Vite build, PWA & Capacitor checks. |

---

## ⚡ Quick Verification Gate

Before completing any task, execute:

```bash
npx tsc --noEmit && npx vitest run && npx oxlint && npx vite build
```
