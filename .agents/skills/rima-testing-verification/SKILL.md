---
name: rima-testing-verification
description: Behavioral testing, adversarial edge-case testing, regression prevention, mutation testing patterns, and clinical crisis pathway verification for RIMA using Vitest, testing-library, and jsdom.
license: MIT
---

# RIMA Testing & Verification Skill

## 1. Overview & Testing Philosophy

In an offline-first mental health application like **RIMA (Ruang Interaksi Mental Aman)**, software defects can have severe real-world consequences: a broken crisis hotline link, a dropped encrypted backup, or an uncaught storage exception during acute user distress could prevent someone from receiving life-saving support.

This skill outlines the strict testing, verification, and regression-prevention practices required across all RIMA features, derived from top open-source engineering standards and Karpathy's goal-driven verification discipline.

### Core Testing Doctrines
1. **Goal-Driven Testing (Karpathy Principle 4)**: Never write code without a verifiable success criterion. Before fixing a bug, write a test that reproduces it and fails; then make the fix and verify it passes.
2. **Behavioral over Implementation**: Test what the user or system experiences (actions, DOM output, state changes, crisis triggers), not internal private state or ephemeral variables.
3. **Adversarial & Edge-Case First**: Actively test malformed JSON, corrupted localStorage, null states, rapid re-renders, race conditions in audio/crypto, and unexpected input strings (e.g. formula injection in CSV).
4. **Zero-Regression Quality Gate**: Every commit must satisfy the 4-tier quality gates without exceptions.

---

## 2. Test Architecture & Directory Structure

RIMA uses **Vitest + jsdom + @testing-library/react**:

```
src/
├── __tests__/                     # Shared and end-to-end user journey tests
│   ├── app-flow.test.tsx          # Route navigation & initial visit flows
│   └── cryptoVault.test.ts        # Web Crypto AES-GCM-256 vault tests
├── components/
│   └── [domain]/
│       └── __tests__/             # Component integration & accessibility tests
├── services/
│   └── __tests__/                 # Business logic, JITAI, and clinical service tests
├── utils/
│   └── __tests__/                 # Utility, sanitization, and data parsing tests
└── stores/
    └── __tests__/                 # Zustand store & persistent state tests
```

---

## 3. Tiered Testing Strategies

### Tier 1: Pure Function & Service Testing
Services must be deterministic, isolated from network calls, and thoroughly tested across edge cases.

```typescript
// Example: Testing CSV sanitization against formula injection
import { describe, it, expect } from 'vitest';
import { sanitizeCSVCell } from '../exportImport';

describe('CSV Sanitization Security', () => {
  it('escapes dangerous spreadsheet formula trigger characters', () => {
    expect(sanitizeCSVCell('=SUM(A1:A10)')).toBe("`=SUM(A1:A10)`");
    expect(sanitizeCSVCell('+12345')).toBe("`+12345`");
    expect(sanitizeCSVCell('-danger')).toBe("`-danger`");
    expect(sanitizeCSVCell('@calc')).toBe("`@calc`");
    expect(sanitizeCSVCell('\tmalicious')).toBe("`\tmalicious`");
  });

  it('handles null, undefined, and safe text gracefully', () => {
    expect(sanitizeCSVCell('')).toBe('');
    expect(sanitizeCSVCell('Catatan harian aman')).toBe('Catatan harian aman');
  });
});
```

### Tier 2: Storage Resilience & Defensive Parsing
Ensure zero runtime exceptions (`TypeError: cannot read property of null`) when local storage holds unexpected data types or corrupted values.

```typescript
// Example: Defensive JSON storage test pattern
describe('Defensive Storage Resilience', () => {
  it('recovers gracefully from malformed or non-array localStorage data', () => {
    localStorage.setItem('rima-forum-posts', '{"corrupted": true}'); // Object instead of Array
    
    // Service must return fallback array rather than throwing .map() is not a function
    const posts = forumService.getAllPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(0);
  });
});
```

### Tier 3: Crisis Pathway & Edge-Case Interceptor Testing
Crisis detection must be tested against intentional evasion, multilingual variations, and punctuation perturbations.

```typescript
// Example: Crisis trigger verification
describe('Crisis Interceptor Verification', () => {
  it('triggers emergency crisis modal on Indonesian lethal intent keywords', () => {
    const input = 'aku ingin mengakhiri hidupku malam ini';
    const result = crisisDetectionService.evaluateInput(input);
    expect(result.isCrisis).toBe(true);
    expect(result.level).toBe('immediate_intervention');
    expect(result.recommendedAction).toBe('open_hotline_modal');
  });

  it('differentiates cognitive distress from immediate self-harm intent', () => {
    const input = 'aku sangat lelah dan capek bekerja';
    const result = crisisDetectionService.evaluateInput(input);
    expect(result.isCrisis).toBe(false);
    expect(result.suggestedTool).toBe('breathing_or_journal');
  });
});
```

### Tier 4: Component Accessibility & Focus Trap Testing
Modal components (especially crisis safety cards) must trap keyboard focus and support screen readers.

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FastActionSafetyCard } from '../FastActionSafetyCard';

describe('FastActionSafetyCard Accessibility', () => {
  it('renders primary emergency dial link with RFC 3966 format', () => {
    render(<FastActionSafetyCard onDismiss={vi.fn()} />);
    const telLink = screen.getByRole('link', { name: /119/i });
    expect(telLink).toHaveAttribute('href', expect.stringContaining('tel:119'));
  });

  it('traps tab focus within the modal boundaries when open', () => {
    // Assert first and last focusable elements wrap on Tab and Shift+Tab
  });
});
```

---

## 4. Verification Routine (The 4 Quality Gates)

Before submitting or reporting any feature as complete, execute this sequential verification command chain:

```bash
# 1. Static Linting (oxlint)
npm run lint

# 2. TypeScript Compilation Check (zero any leaks, strict null checks)
npx tsc -b

# 3. Complete Vitest Test Suite (all tests must pass 100%)
npm test
# atau: npx vitest run

# 4. Production PWA Build & SW Precache Asset Verification
npm run build
```

---

## 5. Verification Checklist

- [ ] Every new utility/service has an adjacent `__tests__/[name].test.ts` file.
- [ ] Edge cases (empty array, null, undefined, extreme values, malformed inputs) are covered.
- [ ] No flaky asynchronous tests (`vi.useFakeTimers()` used appropriately for timeouts/debounces).
- [ ] Zero snapshot tests that hide regressions behind opaque files; write explicit assertions.
- [ ] All 4 quality gates pass cleanly with zero warnings and zero errors.
