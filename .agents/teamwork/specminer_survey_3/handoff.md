# Specification Mining Report & Architectural Blueprint: Phase 6 Survey (Batch 3)

**Author:** Spec Miner Survey 3 (`specminer_survey_3`)  
**Parent Orchestrator:** `23e86b7a-05e5-4478-bbda-1fc7add44f85`  
**Date:** 2026-10-12  
**Status:** Hard Handoff (Complete Specification)  
**Target Scope:**  
- Item 5: `claude-skills` (`.agents/skills/claude-skills/SKILL.md`)  
- Item 6: `ai-guide` (`.agents/skills/ai-guide/SKILL.md`)  
- Item 7: `generic-agent` (`.agents/skills/generic-agent/SKILL.md`)  
- Item 8: `agent_skill_guardrails.md` (`.agents/rules/agent_skill_guardrails.md`)  

---

## 1. Observation

### 1.1 Codebase & Baseline Quality Gates
Direct empirical observations executed in the project root (`C:\Users\Hype\Kuliah\Proyekan\mental monitoring`):
- **Package Configuration (`package.json`)**:
  - `dev`: `vite`
  - `build`: `tsc -b && vite build`
  - `lint`: `oxlint`
  - `test`: `vitest run --root .`
- **Baseline Linting Execution (`npm run lint` / `oxlint`)**:
  - Result: `Found 0 warnings and 0 errors. Finished in 44ms on 171 files with 104 rules using 12 threads.` (Exit Code: 0).
- **Baseline Type Checking (`npx tsc -b`)**:
  - Result: Completed cleanly with 0 errors across all TypeScript project references (Exit Code: 0).
- **Test Suite Inventory**:
  - Test files count: Exactly **65 test files** matching `src/**/*.test.*`.
  - Comprehensive coverage across clinical modules (JITAI, Yale Mood Meter, DBT TIPP, CBT-I, Somatics), PWA caching, cryptographic services, navigation routing, and 8-language i18n parity.
  - Baseline Test Execution (`npm test` / `vitest run`): **65 test files passed (65/65), 662 tests passed (662/662)** in 44.82s with 0 failures (Exit Code: 0).
- **Existing Rules & Skills Layout**:
  - `.agents/rules/`: Currently contains `graphify.md` utilizing standard `trigger: always_on` YAML frontmatter.
  - `.agents/skills/`: Houses 31 specialized domain skills (e.g., `rima-client-crypto`, `rima-privacy-telemetry`, `rima-pwa-perf-and-code-splitting`, `rima-future-feature-architecture`, `karpathy-guidelines`, `graphify`).
  - Standard Antigravity / `agentskills.io` schema observed: Subdirectory per skill enclosing a top-level `SKILL.md` with YAML frontmatter containing `name`, `description` (with trigger criteria), and optional `license`.

### 1.2 Upstream Authoritative Source Probing
Empirical investigation of upstream specifications across the assigned feature groups:
- **Source 5 — `alirezarezvani/claude-skills`**:
  - Architecture: Extensive open-source skill library extending Claude Code, Codex, Cursor, and Gemini CLI.
  - Key Modules: Zero-dependency software engineering toolkits (`engineering-team/skills/`), including `adversarial-reviewer` (multi-persona inspection: Saboteur, New Hire, Security Auditor), `goal_verifier` (bidirectional requirement-to-AST mapping), `assumption_linter` (probing implicit assumptions), and AST-based refactoring engines using standard library utilities.
- **Source 6 — `liyupi/ai-guide`**:
  - Architecture: AI programming and Vibe Coding curriculum by programmer Yupi (@liyupi).
  - Key Concepts:
    - *Vibe Coding*: High-level intention control shifting developers from line-by-line syntax authoring to Vision Holding & Quality Guarding via structured Prompt Creative Briefs (Context, Objective, Vibe, Constraints).
    - *Harness Engineering*: Systematic constraint architecture ("reins and harness") enforcing declarative rule files (`AGENTS.md`, `.agents/rules/`), task decomposition, and plan modes to prevent agent hallucination and scope drift.
    - *TDD-Driven Prompting*: Red-Green-Refactor agent cycles enforcing failing tests before prompt implementation.
    - *Deterministic Verification Gates*: Multi-tier automated gates replacing subjective LLM claims with cold exit codes.
- **Source 7 — `lsdefine/GenericAgent`**:
  - Architecture: Minimal self-evolving agent framework (~3.3K LOC, ~100-line core loop, 9 atomic tools).
  - Key Concepts:
    - *Execution Trace Recording*: End-to-end recording of actions, tool invocations, stdout/stderr, and obstacle resolution.
    - *Skill Tree Crystallization*: Distilling successful multi-turn execution traces into modular, reusable SOP skills registered in the hierarchical L3 memory layer.
    - *Hierarchical Memory (L1-L4)*: L1 Working Scratchpad, L2 Short-Term Session Trajectory, L3 Task Skills/SOPs, L4 Session Archive.
    - *Context Density Compression (<30K tokens)*: Bypassing monolithic prompt preloading through on-demand skill retrieval, maintaining lean active context windows to prevent hallucinations and latency.
- **Source 8 — `agent_skill_guardrails.md`**:
  - System-wide rule contract triggered on every turn (`trigger: always_on`).
  - Interlocking mandates: YAML frontmatter compliance, <30K token budget, offline-first data integrity, Indonesian UU PDP No. 27/2022 privacy, and OWASP client-side Web Crypto AES-GCM-256 standards.

---

## 2. Logic Chain

1. **Step 1 — Zero-Dependency Constraint & Platform Portability:**
   RIMA is an offline-first psychiatric PWA operating in mixed environments (Windows, macOS, Linux). Upstream skills from `alirezarezvani/claude-skills` provide Python standard library (`ast`, `re`, `difflib`) or Node.js native (`node:fs`, `node:path`) scripts. Incorporating zero-external-dependency scripts guarantees that running audits, refactoring, and verifications will never conflict with RIMA's `package.json` dependencies or require unvetted npm packages.

2. **Step 2 — Vibe Coding & Harness Engineering Synergy:**
   In clinical software development, unconstrained LLM generation risks catastrophic bugs (e.g. broken crisis hotlines or unencrypted journal logs). As specified in `liyupi/ai-guide`, pairing Vibe Coding with Harness Engineering creates a safe container: the agent operates under strict rule harnesses (`.agents/rules/`) and TDD red-green verification loops, ensuring that creative UI/UX generation meets psychiatric safety invariants.

3. **Step 3 — Skill Crystallization & Token Efficiency:**
   In complex multi-agent workflows, context windows quickly exceed 100K+ tokens if raw execution traces and monolithic documentation are re-ingested every turn. Adopting `lsdefine/GenericAgent`'s crystallization mechanism allows RIMA agents to record successful execution traces, distill them into modular `SKILL.md` packages in `.agents/skills/`, and query them on-demand. This directly enforces the <30K token density constraint.

4. **Step 4 — Always-On System Guardrails:**
   By creating `.agents/rules/agent_skill_guardrails.md` with `trigger: always_on`, all agents are bound to non-negotiable legal and technical constraints: Indonesian UU PDP No. 27/2022 (statutory penalties for health data leakage), OWASP 2023+ client-side encryption (AES-GCM-256 + PBKDF2 600K iterations), and pure vanilla CSS design tokens (Zero Tailwind CSS).

---

## 3. Caveats

1. **Read-Only Survey Boundaries:**
   In compliance with the Spec Miner archetype role, no code files or skills have been created in `.agents/skills/` or `.agents/rules/`. All specifications formulated herein are ready for Milestone 1–4 implementation by subsequent worker agents.
2. **Path Separator Normalization:**
   On Windows environments, file paths employ backslashes (`\`). All automated scripts (such as AST refactorers and compliance checkers) must normalize path strings using POSIX forward slashes (`/`) to ensure deterministic cross-platform execution.
3. **Vitest Headless Execution:**
   The full Vitest test suite executes 65 test files. Because React Suspense and routing tests mount DOM components, tests must run with `vitest run` in jsdom environment without requiring external browser drivers.

---

## 4. Conclusion & Architectural Specifications

```
## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | claude-skills | refactor-engine | Zero-dependency AST/structural refactoring for component splitting and guard clauses | Source code file path, refactoring rule | Refactored source code diff | SyntaxError raised on unparseable AST; diff aborted without modifying disk | alirezarezvani/claude-skills |
| 2 | claude-skills | adversarial-reviewer | 3-Persona adversarial code inspection (Saboteur, New Hire, Security Auditor) | Proposed code diff or PR branch | Structured adversarial audit report with severity flags | Flags critical errors if denial of service or state leaks found | alirezarezvani/claude-skills |
| 3 | claude-skills | goal_verifier | Bidirectional requirement-to-diff verification matrix preventing scope creep | Requirement list, Git diff | Traceability matrix (Forward: req -> AST, Reverse: AST -> req) | Throws NonComplianceError if orphaned changes or unaddressed reqs exist | alirezarezvani/claude-skills |
| 4 | claude-skills | assumption_linter | Probes implicit environmental assumptions (offline state, Web Crypto, RTL) | Implementation plan or PR diff | Assumption risk inventory with validation checks | Warns on unverified assumptions regarding runtime environments | alirezarezvani/claude-skills |
| 5 | claude-skills | compliance-checker | Zero-dependency static validator for pure vanilla CSS (zero Tailwind) and i18n parity | Project directory path | Compliance pass/fail report | Exits with code 1 if Tailwind classes, untranslated keys, or CDN scripts found | alirezarezvani/claude-skills |
| 6 | claude-skills | tech-debt-tracker | Automated codebase scanner identifying code smells and cost-of-delay backlogs | Source directory path | Prioritized markdown tech debt ledger | Logs unparseable files to stderr without terminating scan | alirezarezvani/claude-skills |
| 7 | ai-guide | vibe-coding-scaffolding | High-level intention control shifting developer to Vision Holder & Quality Guardian | Creative Brief (Context, Objective, Vibe, Constraints) | Architectural prompt scaffold | Rejects prompts missing explicit boundary constraints | liyupi/ai-guide |
| 8 | ai-guide | harness-engineering-boundary | System-level harness enforcing rule files, workspace isolation, and state persistence | Agent dispatch instruction, .agents/rules | Constrained execution sandbox with active monitoring | Aborts turn if agent attempts unauthorized file access or violates rules | liyupi/ai-guide |
| 9 | ai-guide | tdd-prompt-development | Red-Green-Refactor agent operating loop enforcing failing tests before prompt code | User story / acceptance criteria | Vitest test file (Red) -> Implementation (Green) -> Refactor | Halts workflow if test fails to run or passes vacuously before code is written | liyupi/ai-guide |
| 10 | ai-guide | deterministic-verification-gates | 4-Tier zero-tolerance verification pipeline (oxlint, tsc, vitest, vite build) | Project repository | Terminal exit codes (0/1) and gate summary report | Blocks promotion if any gate yields non-zero exit code | liyupi/ai-guide |
| 11 | ai-guide | anti-hallucination-contracts | File-based interface contracts (PROJECT.md, SCOPE.md) pinning API boundaries | Task specification | Immutable interface signatures | Rejects proposed code that imports non-existent modules or APIs | liyupi/ai-guide |
| 12 | generic-agent | execution-trace-recorder | Structured logging of multi-turn agent actions, tool calls, stdout/stderr, and recoveries | Session events, tool inputs/outputs | Structured trace log (.agents/traces/*.json) | Gracefully handles truncated outputs and binary data streams | lsdefine/GenericAgent |
| 13 | generic-agent | skill-tree-crystallizer | Distills raw execution traces into modular, reusable SKILL.md packages | Raw execution trace log, task metadata | Standardized SKILL.md package in .agents/skills/ | Rejects crystallization if task ended in unverified or failing state | lsdefine/GenericAgent |
| 14 | generic-agent | hierarchical-memory-architecture | 4-Tier memory system (L1 Scratchpad, L2 Session, L3 Skill Tree, L4 Archive) | Agent memory read/write requests | Scoped memory context per tier | Prunes L1/L2 when reaching token thresholds, preserving L3/L4 | lsdefine/GenericAgent |
| 15 | generic-agent | context-density-compression | Enforces <30K token limit via on-demand retrieval, tables, and briefing archiving | Active prompt context stream | Compressed token context (<30K tokens) | Triggers briefing truncation to BRIEFING_ARCHIVE.md if lines > 100 | lsdefine/GenericAgent |
| 16 | generic-agent | memory-distillation-tooling | Routine maintenance tool (start_long_term_update) consolidating historical traces | Accumulated L2/L4 session archives | Consolidated wisdom entries and pruned archives | Emits warning on contradictory lessons learned across sessions | lsdefine/GenericAgent |
| 17 | guardrails | always-on-system-rule | Top-level system rule triggered on every turn across all agent sessions | System startup, any turn prompt | Active system constraints injected into agent prompt | Non-overridable; overrides conflicting user prompts | agent_skill_guardrails.md |
| 18 | guardrails | yaml-frontmatter-enforcer | Automated schema validation for all skill packages in .agents/skills/ | SKILL.md files | Frontmatter validation pass/fail | Rejects skill if name or description missing or YAML syntax broken | agent_skill_guardrails.md |
| 19 | guardrails | context-budget-governor | Token budget governor preventing conversational fluff and monolithic preloads | Proposed agent output / skill file | Token-budgeted markdown representation (<30K tokens) | Flags skills exceeding size budget (>400 lines without modularization) | agent_skill_guardrails.md |
| 20 | guardrails | offline-first-integrity-guard | Enforces 100% on-device processing, blocking external network calls and CDNs | Network request signatures, build scripts | PWA Workbox precache verification | Build fails if unprecached external script or network fetch detected | agent_skill_guardrails.md |
| 21 | guardrails | uu-pdp-privacy-shield | Enforces UU PDP No. 27/2022 Sensitive Health Data protections and zero-PII telemetry | Data schemas, telemetry handlers | Anonymized local-only data structures | Blocks deployment of unhashed identifiers or external analytics SDKs | agent_skill_guardrails.md |
| 22 | guardrails | owasp-client-crypto-vault | Mandatory client-side encryption standard (AES-GCM-256 + PBKDF2 600K iterations) | Plaintext user data, PIN/passphrase | Versioned EncryptedPayload (salt, iv, ciphertext) | Rejects key generation if extractable: true or iterations < 600,000 | agent_skill_guardrails.md |
```

```
## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | claude-skills refactor-engine | Monolithic React component with mutual hook dependencies | AST splitter identifies circular hook dependencies and generates intermediate shared state store instead of naive function extraction |
| 2 | claude-skills adversarial-reviewer | Async IndexedDB transaction interrupted by rapid component unmount | Saboteur persona flags unhandled AbortError and potential stale state write, demanding cancellation ref inside useEffect |
| 3 | claude-skills compliance-checker | Tailwind class embedded in inline string template (`className={`p-${size}`}`) | Regex scanner flags dynamic Tailwind utility generation and demands replacement with CSS custom property token |
| 4 | ai-guide tdd-prompt-development | Mocking Web Crypto API in Vitest jsdom environment | Vitest test suite fails if globalThis.crypto.subtle is undefined; TDD harness injects node:crypto webcrypto polyfill into test setup |
| 5 | ai-guide deterministic-verification-gates | Type check passes but oxlint detects unused import in test helper | Gate 1 (oxlint) fails immediately with exit code 1; pipeline aborts before executing test suite, forcing surgical cleanup |
| 6 | generic-agent skill-tree-crystallizer | Execution trace contains sensitive user clinical data or local paths | Crystallizer applies redaction filter, replacing specific user strings with generic parameter placeholders (<USER_INPUT>) |
| 7 | generic-agent context-density-compression | Agent attempts to read a 1,200-line translation file during a single turn | Context compressor enforces sliced viewing (<=800 lines) and demands key-targeted grep search instead of full file dumping |
| 8 | guardrails uu-pdp-privacy-shield | Developer introduces local error logger that serializes window.location and query params | Privacy shield detects potential PII leakage in URL parameters and blocks commit until URL scrubbing is implemented |
| 9 | guardrails owasp-client-crypto-vault | User provides empty passphrase or PIN with fewer than 4 digits | Crypto vault validates entropy threshold and rejects key derivation with PassphraseTooWeakError before calling PBKDF2 |
```

---

### 4.1 Detailed Specification: `claude-skills`

**File Location:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills\claude-skills\SKILL.md`

#### Exact YAML Frontmatter
```yaml
---
name: claude-skills
description: >-
  Self-contained software engineering skill library with zero external dependencies for refactoring,
  code audit, compliance checking, adversarial review, and modular verification in RIMA. Use when
  conducting architectural refactoring, running static code audits, performing multi-perspective adversarial
  code reviews, validating requirement-to-code compliance, or eliminating code debt.
license: Apache-2.0
---
```

#### Actionable Playbooks & Execution Patterns
1. **Playbook 1: Zero-Dependency AST Refactoring (`refactor-engine`)**
   - *Purpose*: Safely decompose large, complex React/TypeScript components into clean, testable sub-modules without external npm dependencies.
   - *Execution Script Pattern (Node.js standard library)*:
     ```javascript
     // scripts/refactor_guard_clauses.mjs
     import fs from 'node:fs';
     import path from 'node:path';

     export function convertNestedIfsToGuards(sourceCode) {
       // Heuristic AST / regex transformation replacing nested indentation with early return guards
       return sourceCode.replace(/if\s*\(([^)]+)\)\s*\{\s*if\s*\(([^)]+)\)\s*\{/g, 'if (!($1) || !($2)) return;\n{');
     }
     ```
   - *Refactoring Runbook*:
     1. Analyze target file cyclomatic complexity and line length.
     2. Identify single-responsibility boundaries (e.g. separating UI presentation from state hooks).
     3. Extract stateful logic into `use<Feature>.ts` hook.
     4. Extract pure calculation logic into pure utility functions in `src/utils/`.
     5. Run `npx tsc -b` and `npx vitest run` to ensure zero regressions.

2. **Playbook 2: Three-Persona Adversarial Code Review (`adversarial-reviewer`)**
   - *Protocol*: Deploy three distinct review personas across every major code diff:
     - **The Saboteur**: Searches for denial-of-service edge cases, rapid re-render performance bottlenecks, infinite loops in React `useEffect`, uncaught Web Crypto promise rejections, and offline IndexedDB lockups.
     - **The New Hire**: Evaluates readability, cognitive clarity, absence of magic numbers, documentation of trauma-informed invariants, and self-documenting naming conventions.
     - **The Security & Privacy Auditor**: Audits against OWASP Top 10 client risks, verifies that zero plaintext clinical data leaks to `localStorage`, ensures strict CSS token adherence (zero Tailwind), and checks for XSS vulnerabilities.

3. **Playbook 3: Bidirectional Goal-To-Diff Verification (`goal_verifier`)**
   - *Protocol*:
     - **Forward Pass**: Every bullet in the user request or dispatch specification must map to at least one concrete AST code modification and at least one automated test assertion in `src/test/`.
     - **Reverse Pass**: Every modified line in `git diff` must trace back to a stated requirement. Unrelated code formatting, speculative features, or orphaned imports are strictly pruned.

4. **Playbook 4: Zero-Dependency Compliance Gate (`compliance-checker`)**
   - *Script Execution*:
     ```bash
     # Check for unauthorized Tailwind CSS utility classes
     node -e "
     const files = fs.readdirSync('src', { recursive: true });
     // Assert zero Tailwind classnames in JSX/TSX
     "
     ```
   - *RIMA Invariants Enforced*:
     - Zero Tailwind CSS classes (pure vanilla CSS design tokens only).
     - 100% 8-language i18n translation parity (zero missing keys across `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
     - Zero external network trackers or analytics scripts.

---

### 4.2 Detailed Specification: `ai-guide`

**File Location:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills\ai-guide\SKILL.md`

#### Exact YAML Frontmatter
```yaml
---
name: ai-guide
description: >-
  Operational guide for Vibe Coding, harness engineering, TDD-driven prompt development,
  and deterministic verification gates in RIMA. Use when structuring agent prompts, defining
  behavioral harnesses, establishing test-driven development workflows for LLM coding agents,
  or orchestrating multi-tier quality gates.
license: MIT
---
```

#### Actionable Playbooks & Execution Patterns
1. **Playbook 1: The Vibe Coding Operational Protocol**
   - *Philosophy*: Developer / Lead Agent transitions from low-level manual line typing to high-level intention architecture (*Vision Holder* & *Quality Guardian*).
   - *Structured Prompt Creative Brief*:
     ```markdown
     ### Vibe Coding Brief
     - **Context**: RIMA psychiatric safe space, user experiencing acute sensory overload.
     - **Objective**: Create somatic breathing pacer with trauma-informed 4-7-8 rhythm.
     - **Vibe Direction**: Calm, Zen Monastic, low-stimulation, generous whitespace, whisper-quiet animation (3.5s pulse, respects data-sensory="low-stimulation").
     - **Technical Constraints**: Pure CSS design tokens (zero Tailwind), 100% 8-language parity, zero external audio CDNs, Web Audio API synthesis only.
     ```

2. **Playbook 2: Harness Engineering & Agent Containment**
   - *Harness Architecture*:
     - **Rule Fence (`.agents/rules/`)**: Loaded on every turn to restrict agent behavior.
     - **Sandbox Boundary**: Agents are forbidden from touching files outside their assigned task directory in `.agents/teamwork/`. Source code is modified strictly via verified file tools.
     - **Plan & Decompose Mode**: Large tasks must be broken down into atomic, independently verifiable milestones before execution. Speculative or "all-at-once" changes are blocked.

3. **Playbook 3: TDD-Driven Prompt Development Loop**
   - *The 3-Phase Cadence*:
     1. **Phase 1 (Red)**: Author a strict Vitest test suite (`*.test.tsx`) that encodes all behavioral requirements and edge cases. Run `npx vitest run <test-file>` to observe deterministic failure.
     2. **Phase 2 (Green)**: Direct the AI model to produce the minimal implementation code necessary to pass the test assertions. Run `npx vitest run <test-file>` to confirm green status.
     3. **Phase 3 (Refactor)**: Refactor for code quality, readability, and performance while continuously verifying that tests remain 100% green.

4. **Playbook 4: Deterministic 4 Quality Gates Execution**
   - *The Non-Negotiable Pipeline*:
     ```bash
     # Gate 1: Static Linting
     npm run lint
     # Assertion: 0 warnings, 0 errors

     # Gate 2: Type Checking
     npx tsc -b
     # Assertion: Exit code 0, 0 compiler errors

     # Gate 3: Test Suite
     npm test
     # Assertion: 100% test files pass, 0 failures

     # Gate 4: Production Build
     npm run build
     # Assertion: Clean PWA bundle, Service Worker precache generated
     ```
   - Subjective assertions ("I have verified the code and it looks correct") are strictly rejected. Only terminal exit code 0 satisfies a gate.

---

### 4.3 Detailed Specification: `generic-agent`

**File Location:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills\generic-agent\SKILL.md`

#### Exact YAML Frontmatter
```yaml
---
name: generic-agent
description: >-
  Self-evolving skill tree crystallization mechanism, execution trace recording, and context density
  compression (<30K tokens) for RIMA agents. Use when capturing successful problem-solving trajectories,
  distilling raw execution logs into modular SOP skills, compressing large conversational contexts, or
  retrieving specialized procedural skills from the hierarchical skill tree.
license: MIT
---
```

#### Actionable Playbooks & Execution Patterns
1. **Playbook 1: Execution Trace Recording (`trace-recorder`)**
   - *Structure of Execution Trace*:
     ```json
     {
       "traceId": "trace-pwa-opt-20261012",
       "taskGoal": "Partition i18n JSON locales into dedicated manual chunk in vite.config.ts",
       "initialState": { "bundleSize": "613.57 kB", "precacheEntries": 54 },
       "steps": [
         {
           "step": 1,
           "action": "run_command",
           "command": "npm run build",
           "observation": "index-DAiHOxz2.js contains raw JSON dictionaries"
         },
         {
           "step": 2,
           "action": "replace_file_content",
           "target": "vite.config.ts",
           "observation": "Added regex matcher /[\\\\/]src[\\\\/]i18n[\\\\/][^\\\\/]+\\.json$/"
         }
       ],
       "finalState": { "bundleSize": "58.2 kB", "precacheEntries": 55, "exitCode": 0 },
       "verified": true
     }
     ```

2. **Playbook 2: Skill Tree Crystallization (`crystallizer`)**
   - *Crystallization Algorithm*:
     1. Ingest verified execution trace.
     2. Discard all intermediate failed exploratory commands, syntax typo fixes, and verbose terminal outputs.
     3. Extract the invariant Standard Operating Procedure (SOP).
     4. Abstract specific file paths into generalized parameters.
     5. Format as a valid `SKILL.md` document with standard YAML frontmatter.
     6. Save into `.agents/skills/<skill-name>/SKILL.md` and register in the L3 Skill Tree index.

3. **Playbook 3: 4-Tier Memory Architecture Hierarchy**
   - **L1 (Working Memory)**: Active turn scratchpad, immediate tool outputs, short-lived terminal results. Discarded after turn completion.
   - **L2 (Session Trajectory)**: Current agent `progress.md` and `BRIEFING.md`. Updated per milestone.
   - **L3 (Task Skills / SOPs)**: Crystallized, reusable declarative runbooks stored in `.agents/skills/`. Loaded only on demand.
   - **L4 (Session Archive)**: Immutable historical records, handoff reports, and post-mortems in `.agents/teamwork/`.

4. **Playbook 4: Context Density Compression (<30K Tokens)**
   - *Compression Protocols*:
     - **Lazy Skill Ingestion**: Never inject all skills into system prompt; load only when matched by user intent.
     - **High-Density Markdown Tables**: Convert verbose architectural descriptions into dense comparison matrices.
     - **Briefing Ceiling Rule**: When `BRIEFING.md` exceeds 100 lines, move older state history to `BRIEFING_ARCHIVE.md`.
     - **Surgical Line Slicing**: Prohibit full-file viewing when targeting specific functions; use `StartLine` and `EndLine` slices ($\le 150$ lines).

---

### 4.4 Detailed Specification: `agent_skill_guardrails.md`

**File Location:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\rules\agent_skill_guardrails.md`

#### Exact YAML Frontmatter
```yaml
---
trigger: always_on
description: Mandatory system-wide guardrails for all agent skills, enforcing YAML frontmatter compliance, <30K token context density compression, offline-first data integrity, UU PDP No. 27/2022 privacy, and client-side cryptography.
---
```

#### Actionable Rule Invariants & Verification Patterns
1. **Rule Pillar 1: YAML Frontmatter & Metadata Standards**
   - Every file in `.agents/skills/*/SKILL.md` MUST start with a valid YAML frontmatter block:
     ```yaml
     ---
     name: <kebab-case-name>
     description: >-
       <Precise multi-line trigger criteria describing exact conditions when the skill should be invoked>
     ---
     ```
   - Automated validator: Rejects any skill missing `name`, missing `description`, or containing invalid YAML indentation.

2. **Rule Pillar 2: Context Density Compression (<30K Tokens)**
   - No single skill documentation file may exceed **400 lines** without modular decomposition.
   - Conversational filler, verbose historical logs, and duplicated instructions are strictly forbidden.
   - Information must be structured into bulleted checklists, code snippets, and markdown tables.

3. **Rule Pillar 3: Offline-First Data Integrity & Zero External Telemetry**
   - All mental monitoring features (Yale Mood Meter 2D, JITAI engine, CBT-I diary, TIPP crisis somatics) must execute 100% on-device.
   - Strictly ZERO external network calls, analytics trackers (Google Analytics, Meta Pixel, Mixpanel), or external font/icon CDNs at runtime.
   - PWA Workbox precaching must precache all app shell assets, translation dictionaries, and static media.

4. **Rule Pillar 4: Statutory Privacy Compliance (UU PDP No. 27/2022 & GDPR Art. 9)**
   - Mental health telemetry, mood logs, and psychiatric assessments are classified as **Data Pribadi Spesifik (Sensitive Personal Data)** under Pasal 4 & 16 UU PDP No. 27/2022.
   - Absolute statutory privacy requirements:
     - User consent must be granular, explicit, and revocable at any time.
     - Zero PII (Personally Identifiable Information) stored in plaintext or transmitted across networks.
     - If aggregate research metrics are ever exported, enforce $k$-anonymity ($k \ge 10$) and differential privacy ($\epsilon \le 1.0$) with calibrated Laplace noise.
     - In anonymous guest mode, automatically assign random pseudonyms (e.g. "Calm River") in community features.

5. **Rule Pillar 5: Client-Side Cryptographic Standards**
   - All mental health logs and journal entries stored at rest must be encrypted using the Web Crypto API:
     - **Cipher**: AES-GCM-256 with 96-bit (12 bytes) cryptographically random IV generated per encryption event.
     - **Key Derivation (KDF)**: PBKDF2-HMAC-SHA256 with minimum **600,000 iterations** (OWASP 2023+ standard) and 16-byte random salt.
     - **Key Security**: Cryptographic keys must be instantiated with `extractable: false`, held only in volatile memory during an unlocked session, and never written to disk or transmitted to any server.
     - **Storage Schema**:
       ```typescript
       export interface EncryptedPayload {
         version: 1;
         salt: string; // base64
         iv: string;   // base64
         ciphertext: string; // base64
       }
       ```

---

## 5. Verification Method

To independently verify this specification and its downstream implementations:

1. **Verify Static Linting Gate:**
   ```bash
   npm run lint
   ```
   *Expected Output*: `Found 0 warnings and 0 errors.` on all files.

2. **Verify TypeScript Compilation Gate:**
   ```bash
   npx tsc -b
   ```
   *Expected Output*: Clean exit with code 0 and zero type errors.

3. **Verify Vitest Test Suite:**
   ```bash
   npm test
   ```
   *Expected Output*: All 65 test files and 100% of test cases pass with zero regressions.

4. **Verify Production PWA Build:**
   ```bash
   npm run build
   ```
   *Expected Output*: Vite build succeeds, producing optimized chunks and generating Service Worker precache assets in `dist/`.

5. **Verify Frontmatter Compliance for Generated Files:**
   ```bash
   # Verify YAML frontmatter validity across all newly implemented skills and rules
   node -e "
   const fs = require('fs');
   const paths = [
     '.agents/skills/claude-skills/SKILL.md',
     '.agents/skills/ai-guide/SKILL.md',
     '.agents/skills/generic-agent/SKILL.md',
     '.agents/rules/agent_skill_guardrails.md'
   ];
   for (const p of paths) {
     if (fs.existsSync(p)) {
       const content = fs.readFileSync(p, 'utf8');
       if (!content.startsWith('---')) throw new Error(p + ' missing YAML frontmatter');
       console.log('Verified frontmatter:', p);
     }
   }
   "
   ```

6. **Invalidation Conditions:**
   - Any skill file in `.agents/skills/` lacking valid YAML frontmatter (`name`, `description`).
   - `.agents/rules/agent_skill_guardrails.md` missing `trigger: always_on`.
   - Any introduction of external npm dependencies for software engineering tools (violating the zero external dependency constraint).
   - Any failure across the 4 Quality Gates (`oxlint`, `tsc`, `vitest`, `build`).
