# Plan: i18n Localization, Design Tokens & Quality Gates Specialist (explorer_m4_3)

## Objective
Provide an exhaustive architectural and implementation blueprint for Milestone 4:
1. **i18n Localization Parity & RTL**:
   - Inspect existing i18n JSON structures (`src/i18n/`) and `src/test/i18nParity.test.ts`.
   - Identify all existing namespaces/keys and convention (nested vs dot notation, pluralization, interpolation).
   - Enumerate all required translation keys across all 8 languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) for:
     a) Landing Page (Hero, 3 Value Pillars, Dual CTA, Showcase features, FAQ)
     b) Navigation & Profile (Landing link, Guest banner, User info)
     c) Incognito Mode Toggle (status pills, tooltips, pseudonyms, confirmation dialogs)
     d) AuthModal (OTP request, verification, resend, guest return, error messages)
   - Ensure authentic, culturally accurate translations for Javanese (`jv`), Sundanese (`su`), Japanese (`ja`), Chinese (`zh`), Spanish (`es`), and Arabic (`ar`).
   - Check Arabic RTL layout requirements (dir="rtl", CSS logical properties, bidirectional text handling).
2. **Design Tokens & CSS Architecture**:
   - Inspect `src/styles/design-tokens.css`, `components.css`, `index.css`.
   - Confirm ZERO Tailwind CSS across the repository (`package.json`, imports, classes).
   - Verify design token variables: colors (theme colors, dark/light modes), spacing, typography, frosted glass (`backdrop-filter`), shadows, z-index, transitions.
   - Verify responsive container patterns and RTL readiness in styles (using `margin-inline-start`, `text-align: start`, etc.).
3. **Quality Gates & Existing Vitest Suite**:
   - Run / inspect quality scripts: `npm run lint` (oxlint), `npx tsc -b`, `npx vitest run`, `npm run build`.
   - Analyze existing test coverage (44+ files) and identify any fragile tests.
   - Detail required new unit tests for:
     - `Landing.tsx`
     - `AuthModal.tsx`
     - `Incognito Mode` toggle & state
     - Adaptive navigation & guest/incognito banner
     - i18n parity validation for all new keys
4. **Handoff Synthesis**:
   - Compile findings into structured `handoff.md` with complete translation maps, token recommendations, and test specifications.
