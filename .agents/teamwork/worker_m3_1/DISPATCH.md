## 2026-10-10T07:13:20Z
You are Worker M3 (Translation Parity, RTL & Home UI Integration Worker).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original request is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive file write ownership:
- src/i18n/id.json
- src/i18n/en.json
- src/i18n/jv.json
- src/i18n/su.json
- src/i18n/ja.json
- src/i18n/zh.json
- src/i18n/es.json
- src/i18n/ar.json
- src/App.tsx
- src/components/common/JitaiNudgeCard.tsx
- src/pages/Home.tsx
- src/styles/components.css
- src/components/__tests__/JitaiNudgeCard.test.tsx
- src/test/i18nParity.test.ts

Instructions:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and survey reports.
2. Translation Parity (8 languages):
   - Inspect existing keys in `src/i18n/id.json` and other locales.
   - Add new `jitai` and `safetyCard` translation keys to ALL 8 files: `id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`.
   - Every single new key added to id.json MUST also exist in the other 7 files with culturally authentic, clinically empathetic translations.
   - Ensure 100% exact key parity (0 missing keys across all 8 files).
3. RTL Direction Support:
   - In `src/App.tsx`, synchronize `document.documentElement.dir = (i18n.language === 'ar' ? 'rtl' : 'ltr')` and `document.documentElement.lang = i18n.language` on language change.
4. JitaiNudgeCard UI Component:
   - Create `src/components/common/JitaiNudgeCard.tsx` using `useJitai()` hook.
   - Render contextual nudge card with icon, title, description, single-tap action button navigating to `targetRoute`, dismiss button calling `dismissNudge()`, and evidence badge.
   - Ensure WCAG 2.2 AA minimum touch target (>= 48px).
   - Ensure vanilla CSS tokens only (no Tailwind).
5. Home Dashboard Integration:
   - In `src/pages/Home.tsx`, render `<JitaiNudgeCard />` below `<EscalationBanner />` and above `.affirmation-card`.
6. CSS Styling:
   - Add `.jitai-nudge-card` styles in `src/styles/components.css` using design tokens (`var(--bg-card)`, `var(--border-subtle)`, `var(--radius-lg)`).
7. Tests:
   - Create `src/components/__tests__/JitaiNudgeCard.test.tsx` testing render, dismiss click, action navigation, and accessibility.
   - Create `src/test/i18nParity.test.ts` verifying that all 8 language JSON files have 100% key parity with 0 missing keys.
8. Verify all gates:
   - Run `npx vitest run src/components/__tests__/JitaiNudgeCard.test.tsx src/test/i18nParity.test.ts`
   - Run full test suite: `npx vitest run`
   - Run `npm run lint` (`oxlint`)
   - Run `npx tsc -b`
   - Run `npm run build`
9. Document your changes, test outputs, and verification commands in C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3_1\handoff.md.
10. Notify parent via send_message when complete.
