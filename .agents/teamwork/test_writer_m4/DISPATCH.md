## 2026-10-10T20:10:44Z
You are test_writer_m4 (Comprehensive Quality Gates & Testing Specialist).
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\test_writer_m4
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-10T19:19:55Z).
Master Project Architecture: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_4\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write ownership:
- src/pages/__tests__/Landing.test.tsx (create)
- src/components/auth/__tests__/AuthModal.test.tsx (create)
- src/components/auth/__tests__/IncognitoPillToggle.test.tsx (create)
- src/test/i18nParity.test.ts (extend namespace assertions)

Tasks:
1. `src/pages/__tests__/Landing.test.tsx`:
   - Comprehensive test suite for `src/pages/Landing.tsx`:
     a) Renders brand title, Hero, 3 Value Pillars (Privacy/UU PDP, Stigma-free, Clinical Evidence), Showcase cards, FAQ accordion, Footer.
     b) Dual CTA testing:
        - Clicking "Mulai sebagai Tamu Anonim" sets localStorage 'rima-has-entered' = 'true' and 'rima-consent-accepted', and navigates to '/'.
        - Clicking "Masuk dengan Akun" opens AuthModal dialog.
     c) FAQ accordion expands and collapses on click, toggling aria-expanded.
     d) Language switcher trigger and Theme toggle operate correctly.
     e) WCAG touch targets and accessible roles/aria attributes.
2. `src/components/auth/__tests__/AuthModal.test.tsx`:
   - Comprehensive test suite for `src/components/auth/AuthModal.tsx`:
     a) Renders modal title, email input, and action buttons when isOpen=true; does not render when isOpen=false.
     b) Email validation: shows error on empty submission, shows error on invalid email format.
     c) Happy path submission: calls loginWithEmail and transitions to 'sent' state showing confirmation instructions.
     d) Cancellation: clicking "Tetap sebagai Tamu Anonim" calls onClose without forced login.
     e) Offline fallback: displays unconfigured warning when isSupabaseConfigured is false.
3. `src/components/auth/__tests__/IncognitoPillToggle.test.tsx`:
   - Test suite for `src/components/auth/IncognitoPillToggle.tsx`:
     a) Renders '🕶️ Mode Anonim Aktif' when isAnonymousMode is true.
     b) Renders '👤 Akun Terhubung' when account connected.
     c) Clicking when unauthenticated and anonymous triggers onRequireAuth.
     d) 1-click return to anonymous mode when account is connected.
4. `src/test/i18nParity.test.ts`:
   - Add explicit assertions ensuring `landing`, `auth`, and `incognito` namespaces exist and match 100% key parity across all 8 languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
5. Quality Gates Execution:
   - Run `npm run lint` (oxlint) -> 0 warnings, 0 errors.
   - Run `npx tsc -b` -> 0 compilation errors.
   - Run `npx vitest run` -> 100% pass across all test files (now 47+ test files).
   - Run `npm run build` -> production build succeeds cleanly.

Document your test suites, test cases, and verification results in handoff.md, then message orchestrator_4.
