## 2026-10-10T19:50:03Z

You are worker_m4_2 (Auth, Incognito Mode & Forum Identity Specialist).
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m4_2
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-10T19:19:55Z).
Master Project Architecture: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_4\PROJECT.md.
Survey Findings & Exact Blueprints:
- Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_2\handoff.md (contains exact TypeScript code blueprints for useAuth.ts, IncognitoPillToggle.tsx, AuthModal.tsx, Forum.tsx, and styling anchors).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write ownership:
- src/hooks/useAuth.ts
- src/components/auth/IncognitoPillToggle.tsx (create)
- src/components/auth/AuthModal.tsx (create)
- src/pages/Forum.tsx
- src/pages/Home.tsx
- src/pages/Profile.tsx

Tasks:
1. `src/hooks/useAuth.ts`:
   - Implement dual-identity architecture: decouple `accountUser` (Supabase session) from `anonymousProfile` (pseudonym).
   - Reactive state `isAnonymousMode: boolean` persisted in `'rima-anonymous-mode'` via `useLocalStorage`.
   - Implement `toggleAnonymousMode()`: allows 1-click return to anonymous mode; when switching to account mode, checks `isAuthenticated` and returns `{ success: boolean, requiresAuth: boolean }`.
   - Implement `loginWithEmail(email: string)` calling `supabase.auth.signInWithOtp`.
   - Provide `activeDisplayName` that returns anonymous pseudonym when incognito mode is active.
2. `src/components/auth/IncognitoPillToggle.tsx`:
   - Create reusable interactive pill toggle with two visual states:
     a) `🕶️ Mode Anonim Aktif` (calm subtle glass pill)
     b) `👤 Akun Terhubung` (accent pill with 1-click return to anon)
   - On click: if unauthenticated and user tries to switch to account mode, trigger `onRequireAuth()` prop.
   - Enforce WCAG >= 48px hit target and zero Tailwind CSS (use classes from `components.css`).
3. `src/components/auth/AuthModal.tsx`:
   - Create Modern Minimalist modal using `<Modal size="sm">`.
   - 3-state machine (`input` -> `sending` -> `sent`).
   - Email input with RFC validation and clear error feedback.
   - Accessible submit button with `Loader2` spinner.
   - Sent state with clear instructions and reassurance.
   - Zero-friction cancellation: "Tetap sebagai Tamu Anonim" button cleanly closes modal without forced login.
4. `src/pages/Forum.tsx`:
   - Subscribe to `useAuth()`.
   - When `isAnonymousMode` is active: strictly generate and use soothing random pseudonyms (`generateAnonymousName()`, e.g. "Calm River"), hiding account ID, real name, and email for both posts and comments.
   - Display active identity protection status in the post composing card.
5. Integration into `Home.tsx` & `Profile.tsx`:
   - In `Home.tsx`: insert `<IncognitoPillToggle onRequireAuth={() => setIsAuthOpen(true)} />` inside `.zen-header-actions`, and render `<AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />`.
   - In `Profile.tsx`: insert `<IncognitoPillToggle onRequireAuth={() => setIsAuthOpen(true)} />` in the profile header/identity section, and render `<AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />`.
6. Verification:
   - Run `npm run lint` (oxlint) -> 0 errors, 0 warnings.
   - Run `npx tsc -b` -> 0 errors.
   - Run `npx vitest run` -> 100% pass across all test files.
   - Run `npm run build` -> production build succeeds.

Document your implementation, files modified, and verification results in handoff.md, then message orchestrator_4.
