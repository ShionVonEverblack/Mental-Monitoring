---
name: claude-skills
description: >-
  Self-contained software engineering skill library with zero external dependencies for refactoring,
  code audit, compliance checking, adversarial review, and modular verification in RIMA. Use when
  conducting architectural refactoring, running static code audits, performing multi-perspective adversarial
  code reviews, validating requirement-to-code compliance, or eliminating code debt.
license: Apache-2.0
metadata:
  category: software-engineering-toolkits
  upstream: https://github.com/alirezarezvani/claude-skills
---

# Claude Skills: Self-Contained Software Engineering Skill Library

This skill provides zero-external-dependency software engineering toolkits, AST-driven refactoring routines, 3-persona adversarial review protocols, bidirectional requirement verifiers, assumption linters, and automated compliance checkers for RIMA.

---

## 1. Zero-Dependency AST & Structural Refactoring Engine

### 1.1 Architectural Rationale
In high-reliability and air-gapped environments, relying on heavy npm refactoring packages risks dependency conflicts, lockfile corruption, and supply-chain vulnerabilities. All refactoring scripts utilize the native Node.js standard library (`node:fs`, `node:path`, `node:readline`).

### 1.2 Guard Clause Normalization Playbook
Converts deeply nested conditional pyramids into early-return guard clauses:
```javascript
// scripts/refactor_guard_clauses.mjs
import fs from 'node:fs';

export function refactorToGuardClauses(sourceText) {
  // Identify nested if pattern: if (a) { if (b) { ... } }
  return sourceText.replace(
    /if\s*\(([^)]+)\)\s*\{\s*if\s*\(([^)]+)\)\s*\{([\s\S]*?)\}\s*\}/g,
    (match, cond1, cond2, body) => {
      return `if (!(${cond1}) || !(${cond2})) return;\n${body.trim()}`;
    }
  );
}
```

### 1.3 Component Decomposition SOP (The Single Responsibility Pattern)
When a React component exceeds 250 lines or mixes data fetching with visual layout:
1. **Extract Custom Hook**: Move all `useState`, `useEffect`, and storage calls into `src/hooks/use<Feature>.ts`.
2. **Extract Pure Calculators**: Move all pure math, date conversions, and score metrics to `src/utils/<feature>Helpers.ts`.
3. **Preserve Presentational Shell**: Keep only JSX layout, accessibility tags (`aria-*`), and vanilla CSS token class names in the main component.
4. **Compile & Test**: Run `npx tsc -b` and `npm test` to ensure 100% behavioral equivalence.

---

## 2. Three-Persona Adversarial Code Review Protocol

Every major pull request or milestone diff is evaluated through three adversarial personas:

| Review Persona | Analytical Angle | Primary Target Areas | Failure Threshold |
|:---|:---|:---|:---|
| **The Saboteur** | Adversarial stress, resource exhaustion, and edge cases | Rapid re-renders, unhandled promise rejections, missing IndexedDB abort handles, memory leaks in `useEffect`, and race conditions. | Any unhandled exception or state lockup. |
| **The New Hire** | Cognitive clarity, ergonomics, and maintainability | Cryptic variable names, undocumented clinical algorithms, magic numbers, excessive cyclomatic complexity ($>10$), and missing comments on non-obvious code. | Ambiguous logic or absent clinical rationales. |
| **The Security & Privacy Auditor** | Threat modeling, statutory privacy, and cryptography | Insecure storage of plaintext PII, missing CSV formula injection escaping, unauthorized Tailwind utility usage, and lack of UU PDP compliance. | Any privacy leak or non-compliant token. |

---

## 3. Bidirectional Goal-To-Diff Verification Matrix

Eliminates both requirements omission and unauthorized scope creep:

```text
[Specification Requirements] ──────── Forward Pass ────────► [Code Diff & Unit Tests]
(Every req must map to code)                                 (All items implemented)

[Code Diff & Git Changes]    ◄─────── Reverse Pass ──────── [Approved Requirements]
(Every changed line justified)                              (Zero scope creep)
```

1. **Forward Pass**: Every numbered requirement in the task dispatch must link directly to:
   - Modified or added file paths and line ranges.
   - Corresponding Vitest test assertions in `src/` or `.agents/teamwork/`.
2. **Reverse Pass**: Every modified hunk in `git diff` must correspond to an explicit requirement. Orphaned refactorings, speculative helper functions, or stylistic reformatting without requirement backing are strictly reverted.

---

## 4. Environmental Assumption Linter

Probes implicit runtime assumptions before code execution:

| Assumption Domain | Risky Assumption | Defensive Verification Check |
|:---|:---|:---|
| **Network State** | Assuming `fetch()` will resolve or network is present | Enforce `isNetworkAllowed()` gate and wrap network calls in offline fallback handlers. |
| **Storage Quota** | Assuming `localStorage` or `indexedDB` writes never fail | Wrap storage writes in `try/catch` and handle `QuotaExceededError` with user alerts. |
| **Crypto Availability** | Assuming `window.crypto.subtle` is always initialized | Verify subtle presence; provide test fallback polyfill in Node/jsdom test environments. |
| **Text Direction** | Assuming Left-to-Right (LTR) layout across all languages | Test layout with `dir="rtl"` and use CSS logical properties (`margin-inline-start`). |

---

## 5. Zero-Dependency Compliance Gate

Automated static checks ensuring core RIMA invariants:

```bash
node -e "
const fs = require('fs');
const path = require('path');

function scanDir(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      scanDir(full, cb);
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      cb(full);
    }
  }
}

// 1. Verify Zero Tailwind CSS Utility Classes
let tailwindViolations = 0;
const tailwindRegex = /class(Name)?=[\"'\`][^\"'\`]*\b(flex-(row|col)|items-(center|start)|p-[0-9]|m-[0-9]|bg-(red|blue|gray)-[0-9]+)\b/;
scanDir('src', (file) => {
  const content = fs.readFileSync(file, 'utf8');
  if (tailwindRegex.test(content)) {
    console.error('Tailwind violation detected in:', file);
    tailwindViolations++;
  }
});
if (tailwindViolations > 0) throw new Error('Found ' + tailwindViolations + ' Tailwind violations.');

console.log('PASS: Compliance check complete with zero violations.');
"
```

---

## 6. Verification Runbook

```bash
# 1. Frontmatter and line budget check
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/claude-skills/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*claude-skills/.test(yaml)) throw new Error('Missing name');
if (!/license:\s*Apache-2.0/.test(yaml)) throw new Error('Missing license');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Prohibited trigger');
const lines = content.split('\n').length;
if (lines > 400) throw new Error('Exceeds 400 lines: ' + lines);
console.log('PASS: claude-skills valid (' + lines + ' lines).');
"

# 2. Quality Gates check
npm run lint
npx tsc -b
npm test
npm run build
```
