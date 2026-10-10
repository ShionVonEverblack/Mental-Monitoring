# BRIEFING — 2026-10-10T12:39:00Z

## Mission
Re-architect `src/pages/Home.tsx` into a Zen Monastic & Apple Health Wellbeing minimalist experience with RTL support, preserving all existing clinical safeguards, JITAI test contracts, and modal interactions.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa
- Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3_ui
- Original parent: 5862a47f-00e3-4df8-aff9-4054c18b7e28
- Milestone: M3 (Minimalist Screen Re-architecture - Home.tsx & RTL Polish)

## 🔒 Key Constraints
- Exclusive write ownership: `src/pages/Home.tsx`, `src/styles/components.css` ONLY.
- Preserve 100% of `<JitaiNudgeCard />` DOM and ARIA attributes for test compatibility (`JitaiNudgeCard.test.tsx`, `phase2E2E.test.ts`).
- Preserve all existing modals (`SelfCompassionModal`, language modal, `EscalationBanner`, Recharts chart).
- Pure vanilla CSS tokens only (no Tailwind CSS).
- Minimum touch target >= 48px.
- Clean verification: lint, tsc, vitest 41/41 test files passing, clean build.

## Current Parent
- Conversation ID: 5862a47f-00e3-4df8-aff9-4054c18b7e28
- Updated: 2026-10-10T12:39:00Z

## Task Summary
- **What to build**: Re-architect Home.tsx (Header Hening, Fluid Mood Check-in, Whisper Nudge, Zen Quote/Afirmasi, Pilihan Hening 4 structured card rows using .zen-feature-matrix, accessibility & RTL polish).
- **Success criteria**: 41/41 Vitest test suites passing (411 tests), 0 tsc errors, 0 lint errors, clean build.
- **Interface contracts**: `PROJECT.md`, `survey_home.md`, `survey_i18n_tests.md`.
- **Code layout**: `src/pages/Home.tsx`, `src/styles/components.css`.

## Change Tracker
- **Files modified**:
  - `src/styles/components.css`: Enhanced with Zen Monastic & Apple Health design tokens, Header Hening, Fluid Mood Check-In, Zen Quote typography, `.zen-feature-matrix` 4-row matrix, WCAG >= 48px touch targets, and RTL arrow flip support.
  - `src/pages/Home.tsx`: Re-architected with Header Hening, Fluid Mood Check-In linking to Yale Mood Meter 2D, serene status chip, preserved JitaiNudgeCard, centered editorial affirmation, 4-row Pilihan Hening matrix with direct Brownian Noise audio toggle and emergency 119 Ext 8 hotline, and preserved Recharts chart/modals.
- **Build status**: PASS (41/41 test files, 411/411 tests passing, 0 tsc errors, 0 oxlint errors, clean production PWA build).
- **Pending issues**: None.

## Quality Status
- **Build/test result**: All 411 tests passing across 41 files; Vite build output 56 precached entries.
- **Lint status**: 0 errors, 0 warnings across 127 files.
- **Tests added/modified**: Existing test suite maintained 100% green without regressions. Dedicated Home.test.tsx is scoped for M4.

## Loaded Skills
- None.

## Key Decisions Made
- Maintained compound CSS selectors (`.home-header.zen-home-header`, `.streak-badge.zen-streak-badge`, etc.) so that all existing selectors and potential test queries remain valid while cleanly superseding legacy styles in `index.css`.
- Embedded direct offline Brownian noise audio playback into the Somatic Regulation row via `audioSomaticsService`, with state reflection (`isPlayingBrownNoise`) and ARIA-pressed attributes.
- Replaced the oversized 3rem emoji in the logged mood state with a serene 48px badge chip and edit link to Yale Mood Meter 2D.
- Ensured all touch targets meet or exceed WCAG 2.2 SC 2.5.8 (min-height: 48px mobile, 52px desktop).

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Working memory
- progress.md — Liveness heartbeat
- handoff.md — Final 5-component handoff report
