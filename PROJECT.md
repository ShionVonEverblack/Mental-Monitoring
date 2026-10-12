# Project: RIMA Phase 6 — Comprehensive Agent Skills, Playbooks & Architecture Extraction

## Architecture
- **Framework & Repository Pattern**: Google Antigravity / `agentskills.io` standard skill packaging inside `.agents/skills/` and system-wide declarative rules inside `.agents/rules/`.
- **Target Extraction Sources (7 Repositories + System Guardrails)**:
  1. `LibreChat` (`.agents/skills/librechat/SKILL.md`): Conversational UI streaming loop, Sandpack isolated iframe dynamic artifacts rendering, MCP (Model Context Protocol) integration, custom endpoint orchestration, and `parentMessageId` message tree DAG session persistence.
  2. `awesome-agent-skills` (`.agents/skills/awesome-agent-skills/SKILL.md`): Curated catalog of productivity & software engineering playbooks, cross-harness interoperability standards (Google Antigravity, Claude Code, Cursor, Gemini CLI), and legacy config translation workflows.
  3. `anthropic-cybersecurity-skills` (`.agents/skills/anthropic-cybersecurity-skills/SKILL.md`): Security audit playbooks mapped to NIST CSF 2.0, NIST AI RMF, MITRE ATT&CK/ATLAS, client-side Web Crypto AES-GCM-256 + PBKDF2 (600k iterations), input/prompt injection sanitization, and Indonesian UU PDP No. 27/2022 privacy compliance audit.
  4. `aion-ui` (`.agents/skills/aion-ui/SKILL.md`): Multi-agent workspace management, Git worktree isolation, Agent Client Protocol (ACP) subagent lifecycle coordination with supervisory watchdogs, and atomic file replacement patterns with `.bak` rollback snapshots.
  5. `claude-skills` (`.agents/skills/claude-skills/SKILL.md`): Self-contained software engineering skill library with zero external dependencies (Node.js/Python stdlib AST refactor engine, 3-persona adversarial reviewer, bidirectional goal verifier, assumption linter, pure vanilla CSS and i18n parity compliance checker).
  6. `ai-guide` (`.agents/skills/ai-guide/SKILL.md`): Operational guide for Vibe Coding (Vision Holder / Quality Guardian, structured prompt creative briefs), harness engineering (boundary enforcement, task decomposition), TDD-driven prompt development (Red-Green-Refactor loop), and deterministic 4-tier verification gates.
  7. `generic-agent` (`.agents/skills/generic-agent/SKILL.md`): Self-evolving skill tree crystallization mechanism, execution trace recording, 4-tier hierarchical memory (L1-L4), and context density compression protocols (<30K tokens).
  8. `agent_skill_guardrails.md` (`.agents/rules/agent_skill_guardrails.md`): System-wide always-on rule (`trigger: always_on`) enforcing YAML frontmatter compliance, <30K token context limits, offline-first data integrity (zero external telemetry/CDNs), Indonesian UU PDP No. 27/2022 privacy protections for sensitive health data, and OWASP client-side Web Crypto AES-GCM-256 + PBKDF2 (600,000 iterations).
- **Core Quality Standards (4 Quality Gates)**:
  - Gate 1: `npm run lint` (`oxlint`) = 0 errors, 0 warnings across 171+ codebase files.
  - Gate 2: `npx tsc -b` = 0 errors (clean compilation exit code 0).
  - Gate 3: `npm test` (`vitest run --root .`) = 100% pass across all 65 test files (662+ assertions).
  - Gate 4: `npm run build` = clean production PWA build producing valid Service Worker assets.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | always-on-system-rule | System-wide rule contract triggered on every turn across all agent sessions (`trigger: always_on`) | M1 | specminer_survey_3 |
| 2 | yaml-frontmatter-enforcer | Automated schema validation requiring valid name and description for all skills | M1 | specminer_survey_3 |
| 3 | context-budget-governor | Token budget governor enforcing lean documentation and <30K token limit | M1 | specminer_survey_3 |
| 4 | offline-first-integrity-guard | Enforces 100% on-device execution, zero external network calls, zero external CDNs | M1 | specminer_survey_3 |
| 5 | uu-pdp-privacy-shield | Enforces UU PDP No. 27/2022 Sensitive Health Data protections and zero-PII telemetry | M1 | specminer_survey_3 |
| 6 | owasp-client-crypto-vault | Mandatory client-side encryption standard (AES-GCM-256 + PBKDF2 600K iterations) | M1 | specminer_survey_3 |
| 7 | conversational-ui-streaming | SSE token streaming loop with abort controller and graceful error recovery | M2 | specminer_survey_2 |
| 8 | dynamic-artifacts-rendering | Sandpack isolated iframe rendering with sanitized state decoupling | M2 | specminer_survey_2 |
| 9 | mcp-client-architecture | MCP integration playbook supporting stdio/sse/streamable-http via librechat.yaml | M2 | specminer_survey_2 |
| 10 | endpoint-orchestration | Custom endpoint routing, model fallback chains, parameter overrides (dropParams) | M2 | specminer_survey_2 |
| 11 | multi-turn-session-persistence | parentMessageId message tree DAG branching and conversation state persistence | M2 | specminer_survey_2 |
| 12 | modular-skill-package-layout | Standard layout (SKILL.md, scripts/, references/) with progressive disclosure | M2 | specminer_survey_2 |
| 13 | cross-harness-interoperability | Unified adapter matrix for Google Antigravity, Claude Code, Cursor, and Gemini CLI | M2 | specminer_survey_2 |
| 14 | curated-playbook-catalog | Curated software development and productivity playbooks | M2 | specminer_survey_2 |
| 15 | legacy-config-translation | Migration runbook for translating legacy agent configurations into standard skills | M2 | specminer_survey_2 |
| 16 | nist-csf-2-mapping | 29 security domains mapped to NIST CSF 2.0 (Govern, Identify, Protect, Detect, Respond, Recover) | M3 | specminer_survey_2 |
| 17 | ai-rmf-mitre-alignment | AI risk management aligned with NIST AI RMF and MITRE ATLAS / ATT&CK | M3 | specminer_survey_2 |
| 18 | crypto-protection-audit | Cryptographic audit playbooks for Web Crypto AES-GCM-256 and ephemeral keys | M3 | specminer_survey_2 |
| 19 | input-injection-sanitization | DOMPurify, regex boundary shields, and prompt injection defense playbooks | M3 | specminer_survey_2 |
| 20 | uu-pdp-audit-playbook | Step-by-step audit playbook for Indonesian UU PDP No. 27/2022 compliance | M3 | specminer_survey_2 |
| 21 | multi-agent-workspace-mgmt | Isolated workspaces and Git worktree management per agent | M3 | specminer_survey_2 |
| 22 | local-cli-subagent-coordination | ACP (Agent Client Protocol) lifecycle coordination with supervisory watchdogs | M3 | specminer_survey_2 |
| 23 | atomic-file-automation | Atomic write patterns with pre-read checks and .bak rollback snapshots | M3 | specminer_survey_2 |
| 24 | zero-dep-ast-refactor-engine | Node.js/Python stdlib AST refactoring for clean component decomposition | M4 | specminer_survey_3 |
| 25 | adversarial-3-persona-reviewer | 3-Persona code review (The Saboteur, The New Hire, The Security Auditor) | M4 | specminer_survey_3 |
| 26 | bidirectional-goal-verifier | Forward and reverse pass requirement-to-code traceability verification | M4 | specminer_survey_3 |
| 27 | assumption-linter | Static scanner identifying unverified environmental and runtime assumptions | M4 | specminer_survey_3 |
| 28 | zero-dep-compliance-checker | Automated verification of zero Tailwind CSS and 8-language i18n parity | M4 | specminer_survey_3 |
| 29 | vibe-coding-operational-guide | Vision Holder & Quality Guardian roles, Prompt Creative Brief structure | M4 | specminer_survey_3 |
| 30 | harness-engineering-boundaries | Declarative rule fences (.agents/rules/), task decomposition, plan-before-act | M4 | specminer_survey_3 |
| 31 | tdd-prompt-development-loop | Red-Green-Refactor cycle for LLM code generation | M4 | specminer_survey_3 |
| 32 | deterministic-verification-gates | 4-Tier zero-tolerance exit-code verification replacing subjective claims | M4 | specminer_survey_3 |
| 33 | execution-trace-recorder | Structured JSON logging of actions, tools, observations, and obstacle resolutions | M4 | specminer_survey_3 |
| 34 | skill-tree-crystallizer | Distillation of execution traces into reusable, standardized SKILL.md SOPs | M4 | specminer_survey_3 |
| 35 | hierarchical-memory-architecture | 4-Tier memory management: L1 Scratchpad, L2 Session, L3 Skills, L4 Archive | M4 | specminer_survey_3 |
| 36 | context-density-compression-proto | Protocol enforcing <30K token limit via on-demand retrieval and high-density tables | M4 | specminer_survey_3 |
| 37 | e2e-frontmatter-schema-validator | Automated verification of YAML frontmatter across all skills and rules | M5 | Strategy |
| 38 | context-density-audit | Audit verifying token limits, absence of code bloat, and zero app regressions | M5 | Strategy |
| 39 | rima-4-quality-gates-pass | 100% clean pass of oxlint, tsc -b, vitest (65 files), and vite build | M5 | Strategy |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Core System Guardrails & Compliance Framework | `.agents/rules/agent_skill_guardrails.md` | none | DONE |
| 2 | M2: Conversational UI & Interoperability Skills | `.agents/skills/librechat/`, `.agents/skills/awesome-agent-skills/` | M1 | DONE |
| 3 | M3: Security, Privacy & Multi-Agent Workspace Skills | `.agents/skills/anthropic-cybersecurity-skills/`, `.agents/skills/aion-ui/` | M1 | DONE |
| 4 | M4: Software Engineering & Self-Evolving Agent Skills | `.agents/skills/claude-skills/`, `.agents/skills/ai-guide/`, `.agents/skills/generic-agent/` | M1 | DONE |
| 5 | M5: E2E Validation, Quality Gates Verification & Forensic Hardening | E2E frontmatter audit, quality gates verification, forensic integrity audit | M1, M2, M3, M4 | DONE |

## Interface Contracts
### Rule Frontmatter Contract (`.agents/rules/*.md`)
```yaml
---
trigger: always_on
description: >-
  <Comprehensive trigger specification explaining when the rule applies and what it enforces>
---
```

### Skill Frontmatter Contract (`.agents/skills/*/SKILL.md`)
```yaml
---
name: <kebab-case-name>
description: >-
  <Explicit trigger criteria stating exact conditions, capabilities, and domains of use>
license: <SPDX-License-Identifier>
---
```

### Code Layout Boundaries (Exclusive Write Ownership)
- **M1 Worker**: Owns exclusively `.agents/rules/agent_skill_guardrails.md`.
- **M2 Worker**: Owns exclusively `.agents/skills/librechat/*` and `.agents/skills/awesome-agent-skills/*`.
- **M3 Worker**: Owns exclusively `.agents/skills/anthropic-cybersecurity-skills/*` and `.agents/skills/aion-ui/*`.
- **M4 Worker**: Owns exclusively `.agents/skills/claude-skills/*`, `.agents/skills/ai-guide/*`, and `.agents/skills/generic-agent/*`.
- **M5 Worker / Reviewers / Challengers / Auditor**: Owns exclusively test and verification scripts inside `.agents/teamwork/` and runs repository-wide verification commands. No modifications to `src/` or existing project code files.
