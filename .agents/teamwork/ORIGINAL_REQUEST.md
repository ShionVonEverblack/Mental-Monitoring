# Original User Request

## 2026-10-10T06:45:35Z

Use a full multi-agent team.
Implement Phase 2 improvements for RIMA (Ruang Interaksi Mental Aman): an on-device Just-In-Time Adaptive Intervention (JITAI) smart engine that provides privacy-first contextual nudges based on local mood and sleep patterns, and a Fast-Action Emergency Safety Card for cognitive constriction crisis de-escalation.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Integrity mode: development

## Requirements

### R1. On-Device JITAI Recommendation Engine
Provide an on-device, zero-network adaptive intervention service that analyzes local mood trajectories (Yale Mood Meter 2D), sleep efficiency patterns (CBT-I diary), and activity engagement to surface timely, empathetic, and dismissible contextual nudge cards on the Home dashboard without external network tracking.

### R2. Fast-Action Emergency Safety Card
Provide an accessible, high-contrast, instant-action crisis interface designed for users experiencing acute emotional overwhelm and cognitive constriction, presenting single-tap de-escalation steps, trusted personal contact dialing, and immediate crisis line access (119 Ext 8).

### R3. Strict Project & Architectural Guardrails
Use the project's existing stack (React 19, TypeScript, vanilla CSS design tokens — strictly zero Tailwind CSS, Vitest, oxlint). All new user-facing copy must have 100% translation parity across all 8 supported languages (id, en, jv, su, ja, zh, es, ar).

## Acceptance Criteria

### Functional & Clinical Criteria
- [ ] JITAI engine deterministically evaluates local history to trigger appropriate micro-interventions (e.g., low sleep efficiency suggestions, mood drop recovery nudges, acute agitation calming paths) and respects daily dismiss state.
- [ ] Fast-Action Safety Card opens rapidly from emergency touchpoints, displaying primary coping action, primary trusted contact with working tel: link, 119 Ext 8 hotline button, and somatic grounding shortcut.

### Quality & Verification Gates
- [ ] Automated lint check passes with 0 errors and 0 warnings (npm run lint).
- [ ] TypeScript compilation check passes with 0 errors (npx tsc -b).
- [ ] Full Vitest suite passes 100% across all test files including newly added tests (npx vitest run).
- [ ] Production build succeeds and generates PWA Service Worker assets (npm run build).

## 2026-10-10T10:37:38Z

Use a full multi-agent team.
Implement Phase 3 improvements for RIMA (Ruang Interaksi Mental Aman): PWA Performance Optimization, intelligent Rollup chunk partitioning, trauma-informed calm suspense loader (PageFallbackLoader), and persist reusable specialized skills (rima-pwa-perf-and-code-splitting and rima-future-feature-architecture) in .agents/skills/.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Integrity mode: development

## Requirements

### R1. PWA Performance & Intelligent Chunk Partitioning
Optimize the production build bundle structure in vite.config.ts by configuring manual Rollup chunks for translation catalogs (i18n-locales) and heavy libraries while preserving 100% offline Workbox service worker precaching, reducing the main app chunk size.

### R2. Trauma-Informed Calm Suspense Fallback
Provide a dedicated PageFallbackLoader component for React Suspense route transitions that replaces high-speed spinning loaders with a calming, accessible, low-stimulation skeleton animation compliant with WCAG AA and psychiatric app design principles.

### R3. Reusable Skill Engineering (Learn Routine)
Create two modular skill packages in .agents/skills/:
1. rima-pwa-perf-and-code-splitting/SKILL.md: Runbook for bundle budgeting, Rollup manual chunk partitioning, Workbox cache tiers, and low-end mobile web performance.
2. rima-future-feature-architecture/SKILL.md: Comprehensive engineering blueprint enforcing RIMA's 6 core pillars (offline-first, zero-network telemetry, pure CSS tokens, 100% 8-language parity, defensive storage resilience, and 4-tier quality gates).

### R4. Strict Quality & Guardrail Compliance
Adhere to pure vanilla CSS tokens (zero Tailwind CSS), 100% 8-language parity, and ensure all existing and new unit/integration tests pass.

## Acceptance Criteria

### Functional & Architectural Criteria
- [ ] PageFallbackLoader renders smoothly during route transitions, respects data-sensory="low-stimulation", and provides accessible ARIA live-region labels.
- [ ] vite.config.ts partitions chunks cleanly without breaking offline PWA service worker precaching.
- [ ] Both learned skills are authored with valid YAML frontmatter and comprehensive instructions in .agents/skills/.

### Quality & Verification Gates
- [ ] Automated lint check passes with 0 errors and 0 warnings (npm run lint).
- [ ] TypeScript compilation check passes with 0 errors (npx tsc -b).
- [ ] Vitest test suite passes 100% with no regressions (npx vitest run).
- [ ] Production PWA build succeeds cleanly (npm run build).
