---
name: rima-cross-feature-resilience
description: >-
  Systematic framework for detecting and eliminating cross-feature conflicts, state collisions, modal stacking issues,
  asynchronous race conditions, and event listener memory leaks across RIMA modules. Use when conducting comprehensive QA,
  stress-testing interconnected workflows (e.g. Crisis Escalation + Mood Meter + Sleep Tracker + Referral Bridge), and cleaning messy code.
---

# RIMA Cross-Feature Resilience & Conflict Prevention Protocol

## 1. Cross-Feature Collision Scenarios
As RIMA expands across CBT, DBT TIPP, C-SSRS, Sleep CBT-I, Behavioral Activation, Referral Bridge, and 2D Mood Meter, features risk colliding in subtle ways:

1. **Modal Stacking & Focus Trapping Collisions**:
   - Multiple modal triggers firing concurrently (e.g. C-SSRS Crisis Modal over an active assessment or thought restructuring wizard).
   - `document.body.style.overflow = 'hidden'` leaks when a secondary modal unmounts while a primary modal remains open.
   - Escape key dismissing both parent and child modals simultaneously.
2. **Storage Key & State Synchronization Conflicts**:
   - Concurrent writes to `localStorage` or `IndexedDB` between independent stores (`useMoodStore`, `useAuthStore`, `rima-sleep-diary`, `rima-activation`).
   - Missing dispatch of `local-storage` custom events leading to desynchronized UI tabs.
3. **Event Listener & Timer Memory Leaks**:
   - `useEffect` hooks attaching `window.addEventListener('keydown' | 'resize' | 'online' | 'local-storage')` without proper teardown in cleanup functions.
   - `setInterval` or `setTimeout` (e.g., TIPP Cold Temperature timer, breathing animations, auto-dismiss toasts) lingering after component unmount.
4. **Data Contract Incompatibilities**:
   - Functions expecting array structures crashing on null/undefined (`history.slice` or `array.map` regressions).
   - Type coercion issues between string IDs and numeric values.

---

## 2. Refactoring & Code Cleanliness Principles
- **Defensive Defaulting**: Every data accessor must handle empty array `[]` or null safely.
- **Unified Portals**: Modals must mount to `document.body` with coordinated z-index stacks (`--z-modal: 1000`, `--z-modal-nested: 1100`, `--z-sos: 9999`).
- **Idempotent Cleanup**: Cleanups must be safe even if component unmounts mid-transition.
- **Clean Architectural Boundaries**: No business logic directly embedded in presentation handlers.
