# BRIEFING — 2026-10-12T15:35:00Z

## Mission
Implement system-wide always-on guardrails (.agents/rules/agent_skill_guardrails.md) enforcing YAML frontmatter compliance, <30K token context density compression, offline-first data integrity, Indonesian UU PDP No. 27/2022 privacy, OWASP Web Crypto AES-GCM-256 + PBKDF2 (600,000 iterations), zero Tailwind CSS, 100% 8-language i18n parity, and clean verification across 4 Quality Gates.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\
- Original parent: 1fc4eab6-678b-43c3-b349-35e9ecfccc3a
- Milestone: Milestone 1 (PWA Performance & Rollup Manual Chunks)
- Current parent: 23e86b7a-05e5-4478-bbda-1fc7add44f85
- Current Milestone: Phase 6 Milestone 1 (M1: Core System Guardrails & Compliance Framework)

## 🔒 Key Constraints
- Exclusive write ownership of `vite.config.ts`. Do NOT touch any other source or test files.
- Partition all 8 translation catalogs (`src/i18n/*.json`) into a dedicated chunk: `'i18n-locales'`.
- Cross-platform path handling for Rollup manualChunks (`/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)`).
- Route `react-i18next`, `i18next`, and `i18next-browser-languagedetector` into `'i18n-vendor'` before `node_modules/react` matches.
- Workbox `maximumFileSizeToCacheInBytes: 3000000` (3 MiB headroom).
- Zero Tailwind CSS (vanilla CSS tokens).
- Maintain 100% offline Workbox service worker precaching.
- Integrity: Do not hardcode test results, expected outputs, or dummy implementations.
- Exclusive write ownership: `.agents/rules/agent_skill_guardrails.md`. Do NOT touch any other files in `src/` or elsewhere.
- Valid YAML frontmatter: `trigger: always_on` and `description`.
- Context density budget: <30K token working context, <400 lines for the rule file.
- Offline-first: 100% on-device processing for Yale Mood Meter, JITAI, CBT-I, Web Audio; 0 network telemetry/tracking SDKs; zero runtime CDNs.
- UU PDP No. 27/2022: Data Pribadi Spesifik, Pasal 4 & 16, user rights, anonymous guest mode pseudonymization "Calm River", differential privacy epsilon <= 1.0.
- Client-side crypto: Web Crypto AES-GCM-256, PBKDF2 600,000 iterations, 96-bit IV, non-extractable keys in volatile memory, EncryptedPayload JSON schema.
- Architectural invariants & 4 Quality Gates: Pure vanilla CSS design tokens, zero Tailwind CSS, 100% 8-language i18n parity, and clean verification across oxlint, tsc -b, vitest, and vite build.

## Current Parent
- Conversation ID: 23e86b7a-05e5-4478-bbda-1fc7add44f85
- Updated: 2026-10-12T15:29:38Z

## Task Summary
- **What to build**: `.agents/rules/agent_skill_guardrails.md`
- **Success criteria**: Valid YAML frontmatter with `trigger: always_on`, 6 comprehensive sections, total line count < 400 lines (actual: 245 lines), 100% pass across all 4 quality gates (`oxlint`, `tsc -b`, `vitest`, `vite build`).
- **Interface contracts**: PROJECT.md, DISPATCH.md
- **Code layout**: `.agents/rules/agent_skill_guardrails.md`

## Key Decisions Made
- Authored `.agents/rules/agent_skill_guardrails.md` with 245 lines, perfectly balancing normative rigor and context density (<30K token budget).
- Verified frontmatter schema and statutory privacy clauses via automated node script.
- Verified all 4 quality gates with 0 errors, 0 warnings, 65/65 test files passed (662/662 tests), and clean PWA build.

## Artifact Index
- `.agents/rules/agent_skill_guardrails.md` — Core System Guardrails & Compliance Framework rule file
- `.agents/teamwork/worker_m1/handoff.md` — Hard handoff report for M1
- `.agents/teamwork/worker_m1/progress.md` — Progress tracker

## Change Tracker
- **Files modified**: `.agents/rules/agent_skill_guardrails.md` (created, 245 lines)
- **Build status**: Passed all 4 quality gates (`npm run lint`, `npx tsc -b`, `npm test`, `npm run build`)
- **Pending issues**: None

## Quality Status
- **Build/test result**: All 65 test files passed (662/662 tests), tsc -b clean, vite build clean (precache: 62 entries)
- **Lint status**: 0 warnings, 0 errors (oxlint on 171 files)
- **Tests added/modified**: None (rules milestone, zero modifications outside `.agents/rules/agent_skill_guardrails.md`)

## Loaded Skills
- None
