---
name: awesome-agent-skills
description: >-
  Curated catalog and interoperability framework for AI agent skills across
  heterogeneous harnesses (Google Antigravity, Claude Code, Cursor, Gemini CLI).
  Use when discovering, authoring, converting, or validating portable agent skill
  packages compliant with agentskills.io, migrating legacy configurations
  (.cursorrules, CLAUDE.md, .windsurfrules), or applying curated software engineering playbooks.
license: Apache-2.0
metadata:
  category: agent-engineering-standards
  upstream: https://github.com/VoltAgent/awesome-agent-skills
  standard: agentskills.io
---

# Awesome Agent Skills: Modular Interoperability & Playbook Framework

A standardized framework for authoring, discovering, and executing portable AI agent skills across modern agentic harnesses (Google Antigravity, Claude Code, Cursor, and Gemini CLI), based on the open `agentskills.io` standard and the `VoltAgent/awesome-agent-skills` ecosystem.

---

## 1. Modular Package Architecture & Progressive Disclosure

Every skill package adheres to a modular, self-contained directory footprint designed for minimal context consumption (<30K tokens active context, <400 lines per file):

```text
<skill-name>/
├── SKILL.md             # Mandatory: Frontmatter + core SOP & decision tree (<150 lines)
├── references/          # Optional: Deep reference schemas, catalogs, and specifications (<400 lines)
├── scripts/             # Optional: Deterministic helper scripts (Node.js/Python stdlib)
└── assets/              # Optional: Static diagrams, icons, or template files
```

### Progressive Disclosure Lifecycle
1. **Discovery (Scan Phase)**: The agent scanner parses only `name` and `description` from YAML frontmatter (~30–50 tokens per skill), indexing hundreds of skills without context bloat.
2. **Activation (Trigger Phase)**: When user intent semantically matches `description`, the agent dynamically loads `SKILL.md` into active context.
3. **Deep Reference Resolution (Execution Phase)**: Detailed lookup tables, extended rule matrices, or executable scripts in `references/` and `scripts/` are inspected strictly on-demand.

---

## 2. Cross-Harness Interoperability Matrix

Skills authored under this standard execute across four primary agent environments:

| Harness Platform | Project-Level Location | Global User Location | Execution & Activation Mechanism |
| :--- | :--- | :--- | :--- |
| **Google Antigravity** | `.agents/skills/<name>/` | `~/.gemini/antigravity/skills/<name>/` | Evaluates YAML `description` via agent dispatcher; loads SOP into active memory. |
| **Claude Code** | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` | Terminal agent loads matching skill; executes bundled scripts via subshell Bash tools. |
| **Cursor** | `.cursor/rules/<name>.mdc` | `~/.cursor/rules/<name>.mdc` | Agent parses `.mdc` frontmatter (`globs`, `alwaysApply`); injects into editor context. |
| **Gemini CLI** | `.gemini/skills/<name>/` | `~/.gemini/skills/<name>/` | CLI reads skill manifest and binds available command workflows. |

*For complete schema transforms and symlink generation commands, inspect `references/cross_harness_adapters.md`.*

---

## 3. Legacy Configuration Translation Pipeline

Convert monolithic legacy configuration files (`.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.copilot-instructions.md`) into modular skills following this 6-step pipeline:

```text
[Legacy Monolith]
       │
       ▼ Step 1: Audit & Inventory (Domain Tagging)
┌──────────────────────────────────────────────┐
│ Declarative Constraints vs. Procedural Tasks │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼ Step 2: Rules Division        ▼ Step 3: Skills Division
[.agents/rules/<rule>.md]       [.agents/skills/<skill>/SKILL.md]
  (trigger: always_on)            (name, description, lazy loading)
                                       │
                                       ▼ Step 4: Progressive Factoring
                                [SKILL.md (<150 lines)] + [references/]
                                       │
                                       ▼ Step 5: Cross-Harness Adapters
                                [.claude/ | .cursor/rules/ | .gemini/]
                                       │
                                       ▼ Step 6: Automated Validation
                                (YAML Schema & Line Budget Linter)
```

*For step-by-step migration recipes and before/after case studies, inspect `references/legacy_translation_guide.md`.*

---

## 4. Curated Playbooks Catalog Summary

The catalog indexes 30+ production-grade agent playbooks categorized across 6 core engineering domains:
1. **Software Engineering & Architecture**: Clean architecture scaffolding, AST refactoring, design tokens enforcer, API contract design.
2. **Quality Assurance & Testing**: TDD Red-Green-Refactor loop, Vitest suite builder, mutation testing, deterministic 4-gate verification.
3. **Security, Cryptography & Privacy**: Web Crypto AES-GCM-256 vault, OWASP injection defense, Indonesian UU PDP No. 27/2022 privacy audit, dependency scanner.
4. **DevOps & Infrastructure**: Rollup chunk partitioning, Workbox PWA cache tiering, SPA rewrite deployment, Docker container hardening.
5. **Multi-Agent Coordination**: Git worktree workspace isolator, ACP supervisory watchdog, atomic file mutator with snapshot rollback.
6. **Documentation, i18n & Accessibility**: 8-Language translation parity harmonizer, WCAG 2.2 AA accessibility auditor, living ADR documenter.

*For complete triggers, parameters, and deliverables of all 30+ playbooks, inspect `references/curated_playbooks_catalog.md`.*

---

## 5. Automated Frontmatter & Line Budget Validation

Validate that this skill conforms to `agentskills.io` standards and line limits:

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/awesome-agent-skills/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing opening frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*awesome-agent-skills/.test(yaml)) throw new Error('Missing name field');
if (!/license:\s*Apache-2.0/.test(yaml)) throw new Error('Missing license: Apache-2.0');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Prohibited trigger in skill');
const lines = content.split('\n').length;
if (lines >= 150) throw new Error('SKILL.md exceeds 150 lines limit: ' + lines);
console.log('PASS: awesome-agent-skills SKILL.md compliant (' + lines + ' lines, budget < 150).');
"
```
