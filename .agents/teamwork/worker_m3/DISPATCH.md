# DISPATCH: Worker M3 (Reusable Skill Engineering in .agents/skills/)

## Identity
- Type: teamwork_preview_worker
- Role: Implementation Worker (Knowledge & Skill Engineering Specialist)
- Working Directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3\
- Project Root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
- Authoritative Request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope Document: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md
- Blueprint & Specifications: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_3\handoff.md (Sections 4.4 and 4.5)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusive Write Ownership
You have exclusive write ownership of:
- `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills\rima-pwa-perf-and-code-splitting\SKILL.md`
- `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills\rima-future-feature-architecture\SKILL.md`

Do NOT touch any source code files in `src/` or `vite.config.ts`.

## Objective & Detailed Requirements
1. **Author Skill 1**: `.agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md`:
   - Valid YAML frontmatter:
     ```yaml
     ---
     name: rima-pwa-perf-and-code-splitting
     description: >-
       Architectural runbook and engineering guidelines for PWA performance optimization, Rollup manual
       chunk partitioning (i18n translation catalogs, charting, UI icons), Workbox cache tiers, and
       low-end mobile web performance in RIMA. Use when configuring vite.config.ts, tuning bundle budgets,
       diagnosing chunk bloat, or auditing offline precaching.
     ---
     ```
   - Structure & In-depth content:
     * 1. Clinical Context & The Cognitive Patience Paradox (Baumel et al., 2019; working memory limitations during crisis).
     * 2. Performance Budgets: Main app entry bundle < 50 kB uncompressed (< 15 kB gzip), vendor chunk partitioning, translation catalogs in dedicated `i18n-locales` chunk (~600 kB raw, ~150 kB gzip), FCP < 1.2s, CLS = 0.000.
     * 3. Intelligent Rollup Chunk Partitioning Architecture: Root cause analysis of static JSON imports, cross-platform regex (`/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/`), vendor chunk prefix precedence order (`i18n-vendor` before `react-vendor`).
     * 4. Workbox Cache Tiers & Offline-First Integrity: 3-tier caching model diagram (Tier 1 Precache manifest, Tier 2 Runtime caching for Google Fonts with CacheFirst, Tier 3 Network-isolated zero-telemetry local data). 3 MiB headroom configuration (`maximumFileSizeToCacheInBytes: 3000000`).
     * 5. Low-End Mobile Optimization Runbook: CPU main-thread budget (GPU-accelerated transform/opacity only), memory leak mitigation (AudioContext teardown, MutationObserver cleanup), DOM virtualization.
     * 6. Verification Commands (`npm run build`, `npx vitest run`).

2. **Author Skill 2**: `.agents/skills/rima-future-feature-architecture/SKILL.md`:
   - Valid YAML frontmatter:
     ```yaml
     ---
     name: rima-future-feature-architecture
     description: >-
       Comprehensive engineering blueprint and architectural framework enforcing RIMA's 6 core pillars
       (offline-first, zero-network telemetry, pure CSS tokens, 100% 8-language parity, defensive storage
       resilience, and 4-tier quality gates). Use when designing, building, testing, or auditing any feature.
     ---
     ```
   - Structure & In-depth content:
     * 1. The 6 Non-Negotiable Architectural Pillars:
       - Pillar 1: Offline-First Reliability (100% local operation of Mood, Sleep, Safety Plan, TIPP, Breathing, JITAI).
       - Pillar 2: Zero-Network Telemetry & Strict Privacy (Zero analytics SDKs, Web Crypto AES-GCM-256 / PBKDF2 on-device encryption, standard telephony `tel:119,8` crisis dialing).
       - Pillar 3: Pure Vanilla CSS Design Tokens (Strictly ZERO Tailwind CSS, CSS custom properties from design-tokens.css, WCAG 2.2 AA 44px touch targets).
       - Pillar 4: 100% 8-Language Translation Parity (Supported: id, en, jv, su, ja, zh, es, ar; exact leaf key matching; RTL support for Arabic via document.documentElement.dir).
       - Pillar 5: Defensive Storage Resilience (Corrupted payload recovery, quota handling, try/catch with fallback states, `rima-` namespace).
       - Pillar 6: 4-Tier Automated Quality Gates (npm run lint: 0/0, npx tsc -b: 0, npx vitest run: 100%, npm run build: clean PWA).
     * 2. Future Feature Implementation Runbook: Step 1 Privacy & Threat Model -> Step 2 Trauma-Informed UI -> Step 3 i18n Matrix -> Step 4 Services & Components -> Step 5 Unit & Component Testing -> Step 6 4-Tier Gate Check.
     * 3. Verification & Compliance Checklist.

3. **Verification**:
   - Verify YAML frontmatter syntax is valid and parses cleanly.
   - Run `npm run lint`, `npx tsc -b`, `npx vitest run`, and `npm run build` to ensure project remains 100% green.

## Output Requirements
Write your detailed report to:
`C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3\handoff.md`
Report the created file paths, structure summary, and verification status. Then send a completion message to the orchestrator.


## 2026-10-10T11:25:28Z
You are an Implementation Worker for Milestone 3 of RIMA Phase 3 improvements.
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3\
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Your dispatch instructions: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3\DISPATCH.md
Read ORIGINAL_REQUEST.md and DISPATCH.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership of:
- .agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md
- .agents/skills/rima-future-feature-architecture/SKILL.md

Author both skill packages with valid YAML frontmatter, in-depth architectural runbooks, and comprehensive engineering blueprints as specified in DISPATCH.md.
Verify quality gates and write your handoff report to C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3\handoff.md.
When finished, notify the orchestrator with send_message.
