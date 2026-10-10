# Investigation Plan — explorer_m4_2 (Auth, Incognito Mode & Forum Identity)

## Objective
Analyze the existing codebase to provide a precise, airtight architectural design for:
1. R3: In-App Incognito Mode Toggle (useAuth.ts / Auth context, state persistence, dual-identity switch).
2. UI Integration: Interactive Pill Toggle in App Header (AppShell / Home header) and Profile page.
3. Forum Identity Protection: Forum.tsx, pseudonym generation, author masking, anonymous posting flow.
4. R4: Modern Minimalist AuthModal.tsx: Supabase Magic Link OTP integration, validation, UX state machine, cancellation without friction.
5. i18n & Pure CSS styling: 8-language translations and CSS design tokens.

## Investigation Steps
- [ ] Step 1: Inspect `src/hooks/useAuth.ts`, `src/lib/supabase.ts`, and any existing auth contexts or stores.
- [ ] Step 2: Inspect `AppShell.tsx`, `App.tsx`, `Home.tsx`, and `Profile.tsx` for header structure, user state display, and pill toggle placement.
- [ ] Step 3: Inspect `Forum.tsx`, `src/types/forum.ts`, and forum services/storage for author identity, posting logic, and pseudonym handling.
- [ ] Step 4: Examine Supabase authentication setup (`signInWithOtp`, config, redirect URLs, errors, mock/fallback support).
- [ ] Step 5: Check i18n structure (`src/i18n/` or locales) for keys required in R3 and R4 across 8 languages.
- [ ] Step 6: Formulate concrete technical design with exact file paths, line references, types, signatures, and mock snippets.
- [ ] Step 7: Synthesize findings into `handoff.md` and notify orchestrator_4.
