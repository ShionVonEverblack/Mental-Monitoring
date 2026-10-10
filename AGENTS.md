# RIMA (Ruang Interaksi Mental Aman) — Agent Operating Guide

Welcome to the **RIMA** codebase. This file instructs any AI agent or developer on how to maintain, improve, and safely interact with this mental health self-care PWA.

---

## 🚨 Critical Non-Negotiables

1. **NO AUTONOMOUS GIT COMMITS OR PUSHES**:
   - NEVER execute `git commit`, `git add`, or `git push` directly.
   - Always provide exact terminal commands for the user to review and run manually.
2. **NO TAILWIND CSS**:
   - The project uses pure **vanilla CSS** and CSS custom properties defined in `src/styles/design-tokens.css` and `src/styles/components.css`.
   - Never use Tailwind utility classes (e.g., `flex`, `p-4`, `bg-blue-500`).
3. **Crisis Safety is P0**:
   - Crisis detection is **100% client-side** (`src/services/crisisDetectionService.ts`).
   - Escalation routes must exist in `src/App.tsx`.
   - Phone dialer links must use `tel:119,8` (comma for extension pause).
   - Crisis content must be intercepted before public forum broadcast (prevent suicide contagion).
4. **Offline-First & Local Privacy (UU PDP No. 27/2022)**:
   - All user data lives in `localStorage` (`rima-*` keys) and `IndexedDB`.
   - Zero telemetry of mental health data to external analytics servers.
5. **8-Language i18n Obligation**:
   - Every user-facing string must support: `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`.
   - Key parity must be maintained across all 8 files in `src/i18n/`.
6. **Calm & Trauma-Informed Design**:
   - Never use alarmist red modals for standard UI; red is strictly reserved for acute emergencies.
   - Respect Quiet Hours (22:00–07:00).
   - Support Quick Exit (`.quick-exit-btn`) for domestic safety.
7. **Defensive Storage & Memory Resilience**:
   - Always guard `JSON.parse` from storage with `Array.isArray(parsed) ? parsed : fallback` to prevent runtime crashes from corrupted records.
   - Modals must use stack tracking so stacked emergency dialogs (SOS, C-SSRS) preserve body scroll-lock and isolate Escape key handlers.
   - All HTML export/print templates must pass user-provided strings through `escapeHTML`.
   - Never spread large `Uint8Array` buffers into `String.fromCharCode(...)`; use 8KB chunking.

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
| **rima-deep-audit-security** | [SKILL.md](./.agents/skills/rima-deep-audit-security/SKILL.md) | Client-side XSS defenses, Web Crypto hygiene, sensitive data leakage, input boundary DoS. |
| **rima-cross-feature-resilience** | [SKILL.md](./.agents/skills/rima-cross-feature-resilience/SKILL.md) | Modal stacking & body scroll-lock collision, storage key desync, teardown leaks, parser guards. |
| **rima-client-crypto** | [SKILL.md](./.agents/skills/rima-client-crypto/SKILL.md) | Zero-knowledge AES-GCM-256 client encryption, PBKDF2/Argon2id, passphrase key wrapping. |
| **rima-indexeddb-storage** | [SKILL.md](./.agents/skills/rima-indexeddb-storage/SKILL.md) | IndexedDB persistent storage adapter, quota management, safe migration from localStorage. |
| **rima-referral-protocols** | [SKILL.md](./.agents/skills/rima-referral-protocols/SKILL.md) | Puskesmas FKTP triage, BPJS P-Care psychiatric referral brief generation, C-SSRS screener. |
| **rima-wcag-accessibility** | [SKILL.md](./.agents/skills/rima-wcag-accessibility/SKILL.md) | WCAG 2.2 AA neuro-inclusive accessibility, Low-Stimulation mode, tactile/sensory accommodations. |
| **rima-emotion-granularity** | [SKILL.md](./.agents/skills/rima-emotion-granularity/SKILL.md) | 2D Yale Mood Meter (valence-arousal), Russell circumplex, 16 clinical emotion taxonomy. |
| **rima-jitai-micro-interventions** | [SKILL.md](./.agents/skills/rima-jitai-micro-interventions/SKILL.md) | Just-In-Time Adaptive Interventions (JITAI), behavioral activation scheduling, micro-nudges. |
| **rima-web-audio-somatics** | [SKILL.md](./.agents/skills/rima-web-audio-somatics/SKILL.md) | Procedural Web Audio API soundscapes (binaural beats, brown noise), haptic breathing cues. |
| **rima-trauma-informed-design** | [SKILL.md](./.agents/skills/rima-trauma-informed-design/SKILL.md) | Trauma-informed UX, non-triggering clinical summaries, somatic grounding, de-escalation pacing. |
| **rima-pwa-push-notifications** | [SKILL.md](./.agents/skills/rima-pwa-push-notifications/SKILL.md) | Offline Notification Triggers, Periodic Sync, VAPID Web Push, battery-friendly reminders. |
| **rima-privacy-telemetry** | [SKILL.md](./.agents/skills/rima-privacy-telemetry/SKILL.md) | Differential privacy, k-anonymity aggregate campus telemetry, zero-PII error auditing. |

---

## ⚡ Quick Verification Gate

Before completing any task, execute:

```bash
npm run lint && npx tsc -b && npx vitest run && npm run build
```
