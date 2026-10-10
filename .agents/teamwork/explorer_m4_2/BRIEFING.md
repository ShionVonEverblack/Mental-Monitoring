# BRIEFING — 2026-10-10T19:32:00Z

## Mission
Investigate codebase architecture for R3 (In-App Incognito Mode Toggle & Forum Identity Protection) and R4 (Modern Minimalist AuthModal with Supabase Magic Link OTP).

## 🔒 My Identity
- Archetype: explorer
- Roles: Auth, Incognito Mode & Forum Identity Specialist
- Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_2
- Original parent: 52aa29b1-dc1b-4ba1-9bb2-f6fca8f4ec93
- Milestone: M4 - Public Web Access & Modern Minimalist Experience

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code
- Maintain BRIEFING.md, plan.md, progress.md, and handoff.md in working directory
- Pure Vanilla CSS design tokens (Zero Tailwind CSS)
- 100% parity across 8 languages (id, en, jv, su, ja, zh, es, ar) with RTL support
- Must satisfy Quality Gates (oxlint, tsc -b, vitest, vite build)

## Current Parent
- Conversation ID: 52aa29b1-dc1b-4ba1-9bb2-f6fca8f4ec93
- Updated: 2026-10-10T19:32:00Z

## Investigation State
- **Explored paths**:
  - `src/hooks/useAuth.ts`: Auth hook currently manages `rima-user-profile` in `useLocalStorage`, checks Supabase session, lacks dual-identity incognito flag.
  - `src/hooks/useLocalStorage.ts`: Dispatches/listens to `local-storage` CustomEvent on `window`, providing cross-component reactivity out of the box!
  - `src/services/supabase.ts`: Simple `isSupabaseConfigured` and `supabase` client initialization.
  - `src/pages/Forum.tsx` & `src/services/forumService.ts`: Currently generates random pseudonym on mount via `generateAnonymousName()` but doesn't read from auth state.
  - `src/utils/constants.ts` & `src/utils/helpers.ts`: Contains calming adjectives and nouns (`ANONYMOUS_ADJECTIVES`, `ANONYMOUS_NOUNS`) yielding soothing combinations like "Calm River" and "Gentle Breeze".
  - `src/pages/Home.tsx` & `src/components/layout/AppShell.tsx`: Home header has `zen-header-actions` pill container with `home-lang-btn` and `streak-badge`. Ideal anchor for `<IncognitoPillToggle />`.
  - `src/pages/Profile.tsx`: Has profile header with display name and `anonBadge`. Prime location for pill toggle.
  - `src/components/ui/Modal.tsx`, `Input.tsx`, `Button.tsx`: Accessible, token-styled UI components ready to host `AuthModal.tsx`.
  - `src/test/i18nParity.test.ts`: Requires 100% exact key parity between `id.json` and other 7 languages (`en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
- **Key findings**:
  1. `isAnonymousMode` state must be persisted in `'rima-anonymous-mode'` via `useLocalStorage` with default based on auth session status.
  2. To avoid leaking real user name in anonymous mode, `useAuth` must maintain dual identities: anonymous pseudonym (stored/generated) vs authenticated account profile.
  3. Interactive pill toggle has 2 distinct states: 🕶️ Mode Anonim Aktif (1-click to account if logged in, or opens AuthModal if guest) vs 👤 Akun Terhubung (1-click instant return to incognito).
  4. Forum identity must cleanly switch between pseudonym (when `isAnonymousMode` is true) and real `displayName` (when false).
  5. `AuthModal.tsx` should follow a 3-state machine (`input` -> `sending` -> `sent`/`verify`) with zero-friction cancel that leaves the user in anonymous mode.
- **Unexplored areas**: None remaining within scope.

## Key Decisions Made
- Use `useLocalStorage` in `useAuth.ts` for `'rima-anonymous-mode'` to leverage existing cross-component event sync.
- Create reusable `<IncognitoPillToggle />` component that can be placed in `Home.tsx` (`zen-header-actions`), `Profile.tsx` (header & settings), and optionally desktop `Sidebar.tsx`.
- Provide full 8-language translations for all new auth and incognito tokens in handoff report.

## Artifact Index
- DISPATCH.md — Parent dispatch instructions
- BRIEFING.md — Persistent context & state
- plan.md — Step-by-step investigation plan
- progress.md — Liveness heartbeat & progress log
- handoff.md — Final structured report
