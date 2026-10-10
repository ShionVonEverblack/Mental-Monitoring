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
