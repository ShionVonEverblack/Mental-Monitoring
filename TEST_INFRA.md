# E2E Test Infra: RIMA Phase 6 Agent Skills & Quality Gates

## Test Philosophy
- Opaque-box, requirement-driven verification of agent skills, system guardrail rules, and RIMA application integrity.
- Methodology: Frontmatter Schema Validation + Category-Partition + Boundary Value Analysis + Integration Non-Interference + 4-Tier Automated Quality Gates.

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 (Frontmatter) | Tier 2 (Content & Bounds) | Tier 3 (Cross-Skill) | Tier 4 (Quality Gates) |
|---|---------|-------------|:--------------------:|:------------------------:|:-------------------:|:----------------------:|
| 1 | always-on-system-rule | ORIGINAL_REQUEST §R2 | ✓ | ✓ | ✓ | ✓ |
| 2 | yaml-frontmatter-enforcer | ORIGINAL_REQUEST §R1 | ✓ | ✓ | ✓ | ✓ |
| 3 | context-budget-governor | ORIGINAL_REQUEST §R2 | ✓ | ✓ | ✓ | ✓ |
| 4 | offline-first-integrity-guard | ORIGINAL_REQUEST §R2 | ✓ | ✓ | ✓ | ✓ |
| 5 | uu-pdp-privacy-shield | ORIGINAL_REQUEST §R2 | ✓ | ✓ | ✓ | ✓ |
| 6 | owasp-client-crypto-vault | ORIGINAL_REQUEST §R2 | ✓ | ✓ | ✓ | ✓ |
| 7 | conversational-ui-streaming | ORIGINAL_REQUEST §R1.1 | ✓ | ✓ | ✓ | ✓ |
| 8 | dynamic-artifacts-rendering | ORIGINAL_REQUEST §R1.1 | ✓ | ✓ | ✓ | ✓ |
| 9 | mcp-client-architecture | ORIGINAL_REQUEST §R1.1 | ✓ | ✓ | ✓ | ✓ |
| 10 | endpoint-orchestration | ORIGINAL_REQUEST §R1.1 | ✓ | ✓ | ✓ | ✓ |
| 11 | multi-turn-session-persistence | ORIGINAL_REQUEST §R1.1 | ✓ | ✓ | ✓ | ✓ |
| 12 | modular-skill-package-layout | ORIGINAL_REQUEST §R1.2 | ✓ | ✓ | ✓ | ✓ |
| 13 | cross-harness-interoperability | ORIGINAL_REQUEST §R1.2 | ✓ | ✓ | ✓ | ✓ |
| 14 | curated-playbook-catalog | ORIGINAL_REQUEST §R1.2 | ✓ | ✓ | ✓ | ✓ |
| 15 | legacy-config-translation | ORIGINAL_REQUEST §R1.2 | ✓ | ✓ | ✓ | ✓ |
| 16 | nist-csf-2-mapping | ORIGINAL_REQUEST §R1.3 | ✓ | ✓ | ✓ | ✓ |
| 17 | ai-rmf-mitre-alignment | ORIGINAL_REQUEST §R1.3 | ✓ | ✓ | ✓ | ✓ |
| 18 | crypto-protection-audit | ORIGINAL_REQUEST §R1.3 | ✓ | ✓ | ✓ | ✓ |
| 19 | input-injection-sanitization | ORIGINAL_REQUEST §R1.3 | ✓ | ✓ | ✓ | ✓ |
| 20 | uu-pdp-audit-playbook | ORIGINAL_REQUEST §R1.3 | ✓ | ✓ | ✓ | ✓ |
| 21 | multi-agent-workspace-mgmt | ORIGINAL_REQUEST §R1.4 | ✓ | ✓ | ✓ | ✓ |
| 22 | local-cli-subagent-coordination | ORIGINAL_REQUEST §R1.4 | ✓ | ✓ | ✓ | ✓ |
| 23 | atomic-file-automation | ORIGINAL_REQUEST §R1.4 | ✓ | ✓ | ✓ | ✓ |
| 24 | zero-dep-ast-refactor-engine | ORIGINAL_REQUEST §R1.5 | ✓ | ✓ | ✓ | ✓ |
| 25 | adversarial-3-persona-reviewer | ORIGINAL_REQUEST §R1.5 | ✓ | ✓ | ✓ | ✓ |
| 26 | bidirectional-goal-verifier | ORIGINAL_REQUEST §R1.5 | ✓ | ✓ | ✓ | ✓ |
| 27 | assumption-linter | ORIGINAL_REQUEST §R1.5 | ✓ | ✓ | ✓ | ✓ |
| 28 | zero-dep-compliance-checker | ORIGINAL_REQUEST §R1.5 | ✓ | ✓ | ✓ | ✓ |
| 29 | vibe-coding-operational-guide | ORIGINAL_REQUEST §R1.6 | ✓ | ✓ | ✓ | ✓ |
| 30 | harness-engineering-boundaries | ORIGINAL_REQUEST §R1.6 | ✓ | ✓ | ✓ | ✓ |
| 31 | tdd-prompt-development-loop | ORIGINAL_REQUEST §R1.6 | ✓ | ✓ | ✓ | ✓ |
| 32 | deterministic-verification-gates | ORIGINAL_REQUEST §R1.6 | ✓ | ✓ | ✓ | ✓ |
| 33 | execution-trace-recorder | ORIGINAL_REQUEST §R1.7 | ✓ | ✓ | ✓ | ✓ |
| 34 | skill-tree-crystallizer | ORIGINAL_REQUEST §R1.7 | ✓ | ✓ | ✓ | ✓ |
| 35 | hierarchical-memory-architecture | ORIGINAL_REQUEST §R1.7 | ✓ | ✓ | ✓ | ✓ |
| 36 | context-density-compression-proto | ORIGINAL_REQUEST §R1.7 | ✓ | ✓ | ✓ | ✓ |
| 37 | e2e-frontmatter-schema-validator | ORIGINAL_REQUEST §R3 | ✓ | ✓ | ✓ | ✓ |
| 38 | context-density-audit | ORIGINAL_REQUEST §R3 | ✓ | ✓ | ✓ | ✓ |
| 39 | rima-4-quality-gates-pass | ORIGINAL_REQUEST §R3 | ✓ | ✓ | ✓ | ✓ |

## Test Architecture & Invocation
1. **Frontmatter Validation Script**:
   - Checks every target `.agents/skills/*/SKILL.md` for valid YAML frontmatter containing `name` and `description`.
   - Checks `.agents/rules/agent_skill_guardrails.md` for valid YAML frontmatter containing `trigger: always_on` and `description`.
2. **Context Density & Line Budget Audit**:
   - Asserts no file exceeds the 400-line budget without modular sub-documents.
   - Asserts token density remains strictly under 30K tokens.
3. **Quality Gates Verification Runner**:
   - `npm run lint` -> Oxlint exit code 0 (0 warnings, 0 errors).
   - `npx tsc -b` -> TypeScript exit code 0.
   - `npm test` -> Vitest exit code 0 (100% pass across 65+ test files).
   - `npm run build` -> Vite production PWA build exit code 0.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Pass Criteria |
|---|----------|--------------------|---------------|
| 1 | Agent System Startup & Guardrails Load | F1, F2, F3, F4, F5, F6 | All agent sessions load always-on guardrails rule cleanly |
| 2 | Offline PWA Build & Service Worker Preservation | F4, F38, F39 | Build succeeds with identical or improved precache assets without interference |
| 3 | Zero-Regressions Vitest Test Run | F37, F38, F39 | 65/65 test files, 662+ tests pass cleanly with 0 failures |
| 4 | Lint & Typecheck Zero Tolerance | F38, F39 | oxlint and tsc pass with 0 errors and 0 warnings |
| 5 | Cross-Harness Interoperability Verification | F12, F13, F14, F15 | Skill definitions loadable across Antigravity, Claude, Cursor, Gemini |

## Coverage Thresholds
- All 7 skills authored with complete `SKILL.md` packages.
- Rule `agent_skill_guardrails.md` authored with `trigger: always_on`.
- 100% pass across all 4 Quality Gates.
