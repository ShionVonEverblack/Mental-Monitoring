---
name: ai-guide
description: >-
  Operational guide for Vibe Coding, harness engineering, TDD-driven prompt development,
  and deterministic verification gates in RIMA. Use when structuring agent prompts, defining
  behavioral harnesses, establishing test-driven development workflows for LLM coding agents,
  or orchestrating multi-tier quality gates.
license: MIT
metadata:
  category: ai-engineering-guidelines
  upstream: https://github.com/liyupi/ai-guide
---

# AI-Guide: Operational Blueprint for Vibe Coding & Harness Engineering

This skill provides operational methodologies, prompt engineering frameworks, behavioral harness architectures, and test-driven prompt development workflows based on Yupi's AI Guide (`liyupi/ai-guide`).

---

## 1. The Vibe Coding Operational Protocol

### 1.1 Philosophy & Role Transitions
Vibe Coding elevates developers and lead orchestrators from low-level line-by-line syntax authoring to high-level intention architecture:
- **The Vision Holder**: Defines architectural intent, user empathy, emotional tone, and domain boundaries.
- **The Quality Guardian**: Establishes non-negotiable verification gates, security invariants, and automated compliance fences.

### 1.2 Structured Prompt Creative Brief
When directing AI agents to implement features or components, structure every prompt as a 4-part Creative Brief:

```markdown
### Prompt Creative Brief
1. **Context**: RIMA (Ruang Interaksi Mental Aman) psychiatric PWA; user in acute emotional distress.
2. **Objective**: Build a high-contrast, one-tap crisis safety card with instant crisis line dialing (119 Ext 8).
3. **Vibe & Aesthetics**: Calm, Zen Monastic, generous breathing room, low-stimulation color palette (#111418 obsidian dark mode, #F7F8FA linen light mode), quiet typography, zero aggressive animations.
4. **Hard Constraints**:
   - Pure vanilla CSS design tokens (strictly zero Tailwind CSS).
   - 100% 8-language i18n translation parity (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
   - 100% offline-first execution with zero external network tracking or CDNs.
   - Client-side Web Crypto AES-GCM-256 with PBKDF2 (600,000 iterations).
   - All 4 Quality Gates must pass cleanly (`oxlint`, `tsc -b`, `vitest`, `vite build`).
```

---

## 2. Harness Engineering & Agent Containment

Without rigorous harnesses, generative models suffer from scope creep, hallucinated dependencies, and architectural drift. Harness engineering builds an immutable container around the agent:

```text
┌─────────────────────────────────────────────────────────────┐
│                 BEHAVIORAL HARNESS CONTAINER                │
│                                                             │
│  ┌────────────────────────┐      ┌────────────────────────┐ │
│  │   Rule Fences          │      │   Workspace Fences     │ │
│  │   (.agents/rules/)     │      │   (.agents/teamwork/)  │ │
│  │   - trigger: always_on │      │   - exclusive writes   │ │
│  │   - token compression  │      │   - atomic backups     │ │
│  └────────────────────────┘      └────────────────────────┘ │
│                 │                                │          │
│                 ▼                                ▼          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Plan-Before-Act Protocol                  │ │
│  │  1. Decompose into atomic, verifiable subtasks          │ │
│  │  2. Pin interface contracts (PROJECT.md)               │ │
│  │  3. Execute minimal code changes only                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 The 3 Invariant Harness Rules
1. **Never edit without re-reading**: Re-read target files immediately before patching to prevent stale assumptions.
2. **Never hallucinate dependencies**: Never install unvetted npm packages or third-party CDNs. Use existing packages and standard libraries.
3. **Never bypass gates**: Every change must be independently proven via terminal exit codes.

---

## 3. TDD-Driven Prompt Development Loop

In clinical applications, writing code before tests creates latent vulnerabilities. The TDD loop enforces test-driven agent generation:

### 3.1 The 3-Phase Cadence
1. **Red Phase (Test First)**:
   - Direct the agent to write a complete Vitest suite in `src/**/*.test.tsx`.
   - Run `npx vitest run <file>` and verify that tests fail cleanly for the right reasons.
2. **Green Phase (Minimal Implementation)**:
   - Direct the agent to author only the minimal production code necessary to pass the tests.
   - Run `npx vitest run <file>` and confirm all assertions turn green.
3. **Refactor Phase (Hardening & Polish)**:
   - Decompose functions, optimize CSS tokens, and ensure i18n translation parity.
   - Continuously verify that test suite remains green throughout refactoring.

---

## 4. Deterministic 4-Tier Verification Gates

Replace subjective claims (*"I have verified the code and it looks great"*) with cold, unyielding terminal exit codes:

| Gate Tier | Command | Target Tool | Strict Pass Criteria | Failure Remediation |
|:---:|:---|:---|:---|:---|
| **Tier 1** | `npm run lint` | Oxlint (104 rules) | 0 warnings, 0 errors | Run automated lint fixes; remove unused imports. |
| **Tier 2** | `npx tsc -b` | TypeScript compiler | Clean exit code 0 | Fix interface mismatches; resolve type discrepancies. |
| **Tier 3** | `npm test` | Vitest test runner | 100% test files pass | Fix regressions or update tests to match new contracts. |
| **Tier 4** | `npm run build` | Vite + Workbox PWA | Clean build + service worker | Resolve bundle size bloat or invalid asset references. |

---

## 5. Verification Runbook

```bash
# 1. Frontmatter and line budget check
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/ai-guide/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*ai-guide/.test(yaml)) throw new Error('Missing name');
if (!/license:\s*MIT/.test(yaml)) throw new Error('Missing license');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Prohibited trigger');
const lines = content.split('\n').length;
if (lines > 400) throw new Error('Exceeds 400 lines: ' + lines);
console.log('PASS: ai-guide valid (' + lines + ' lines).');
"

# 2. Quality Gates check
npm run lint
npx tsc -b
npm test
npm run build
```
