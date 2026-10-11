---
name: rima-code-quality-refactor
description: Karpathy-style surgical code editing, clean architecture, dead-code detection, zero bloat, and vanilla CSS token enforcement (zero Tailwind) for RIMA.
license: MIT
---

# RIMA Code Quality & Clean Architecture Skill

## 1. Executive Summary & Philosophy

A clean, resilient codebase is critical for an offline-first healthcare application. Code rot, gratuitous abstractions, bloated dependencies, and haphazard edits create unpredictable failure points.

This skill integrates **Andrej Karpathy's software engineering guidelines** directly into RIMA's development workflow. It provides strict rules for surgical edits, zero-bloat code writing, dead-code elimination, and adherence to RIMA's architectural constraints.

---

## 2. The 4 Karpathy Principles in RIMA

### Principle 1: Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- Before implementing, understand the exact clinical and architectural intent.
- If multiple interpretations exist (e.g. how a mood score maps to a JITAI intervention), state them explicitly.
- If a simpler approach exists that avoids adding a new dependency or store, choose the simpler approach.

### Principle 2: Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- Write the minimum viable code required for the task.
- **No premature abstractions**: Do not create a generic multi-layer factory for a single helper function.
- **No speculative features**: Do not add hooks or configuration flags for future use cases that haven't been requested.
- **Rule of Thumb**: If an implementation takes 200 lines when 50 lines would accomplish the exact goal clearly, simplify it.

### Principle 3: Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Do not reformat adjacent, unrelated code.
- Do not "refactor" functions that are already working and tested unless specifically requested.
- Match existing code style, naming conventions, and file structures.
- If your changes make imports, variables, or functions unused, remove them immediately. Do not remove pre-existing unrelated dead code without explicit alignment.
- **The Surgical Test**: Every changed line in a diff must trace directly to the requirement.

### Principle 4: Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform every task into a verifiable goal with automated tests.
- When fixing a bug: write a failing test first, apply the surgical fix, verify that the test passes.
- When adding a feature: run all 4 quality gates (`lint`, `tsc -b`, `test`, `build`) before declaring completion.

---

## 3. Strict RIMA Architectural Guardrails

### A. Zero Tailwind CSS Mandate
RIMA strictly uses **vanilla CSS design tokens** and modular component stylesheets.
- **Design Tokens**: `src/styles/design-tokens.css` (semantic CSS custom properties: colors, spacing, typography, z-index, radius, shadows).
- **Component Styles**: `src/styles/components.css` and scoped class names.
- **Prohibited**: Utility classes like `flex items-center p-4 bg-blue-500` or Tailwind compiler dependencies.
- **Modern Minimalist Standard**: Subtle borders (`rgba(255,255,255,0.06)`), calming palettes (obsidian/charcoal in dark, linen/porcelain in light), generous whitespace, and zero visual clutter.

### B. 100% i18n Translation Parity
RIMA supports **8 languages**:
1. Indonesian (`id`) - Primary
2. English (`en`)
3. Javanese (`jv`)
4. Sundanese (`su`)
5. Japanese (`ja`)
6. Chinese (`zh`)
7. Spanish (`es`)
8. Arabic (`ar`) - Right-to-Left (RTL) layout support

**Mandate**: Any new user-facing string added to `src/locales/id.json` **must** simultaneously be added across all other 7 translation files with contextual accuracy. No missing translation keys allowed in production.

### C. Zero Runtime Dependency Bloat
- Before considering `npm install`, check if native browser APIs can solve the problem:
  - Web Audio API (for brown noise / somatics instead of heavy audio files)
  - Web Crypto API (for AES-GCM-256 instead of external crypto packages)
  - Native `dialog` / accessible HTML5 semantic tags
  - IndexedDB / `localStorage` native storage interfaces

---

## 4. Refactoring & Dead Code Pruning Protocol

When refactoring:
1. **Identify Unused Code**: Use `oxlint` and TypeScript compiler warnings (`noUnusedLocals`, `noUnusedParameters`).
2. **Preserve Semantic Comments**: Keep existing clinical rationale comments and documentation intact.
3. **Audit Circular Dependencies**: Keep dependency graphs strictly unidirectional:
   `Types -> Utils -> Services -> Stores -> Components -> Pages -> App`.
4. **Clean File Boundaries**: Keep components focused. Extract heavy business logic into dedicated services or custom hooks.

---

## 5. Quality Gate Checklist

Before finishing any task, run and verify:
- [ ] `npm run lint` -> 0 errors, 0 warnings across all files.
- [ ] `npx tsc -b` -> Clean compilation with 0 errors.
- [ ] `npm test` -> 100% of unit & integration tests passing.
- [ ] `npm run build` -> Production build succeeds with optimal bundle splitting.
- [ ] No hardcoded user-facing strings outside `src/locales/*.json`.
- [ ] All CSS rules use `var(--token)` from design-tokens.css.
