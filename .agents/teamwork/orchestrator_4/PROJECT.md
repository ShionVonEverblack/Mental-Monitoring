# Project: RIMA Public Web Access & Modern Minimalist Landing Page (Phase 4)

## Architecture
- **Framework & Stack**: React 19, TypeScript, Vite, PWA (`vite-plugin-pwa` with Workbox), Vitest (jsdom), oxlint, i18next.
- **Routing & Shell Layout**:
  - React Router 7 (`react-router-dom: "^7.18.2"`).
  - Pathless layout route (`<Route element={<AppShellLayout />}>`) isolating internal app pages (`AppShell`, `AppLockScreen`, `ConsentModal`, `BottomNav`, `Sidebar`, `SOSButton`).
  - Standalone public route `/landing` (`Landing.tsx`) with zero sidebar, zero bottom dock, zero floating SOS, independent minimalist header and footer.
  - Adaptive root route (`<Route path="/" element={<RootRedirector />} />`):
    - Reads `localStorage.getItem('rima-has-entered') === 'true'`.
    - If false/missing: redirects immediately to `/landing`.
    - If true: renders `<Home />`.
    - Guest CTA ("Mulai sebagai Tamu Anonim"): sets `rima-has-entered` = `'true'` and `rima-consent-accepted`, navigates to `/`.
    - Account Login CTA ("Masuk dengan Akun"): opens `AuthModal`, sets flag upon authentication, navigates to `/`.
    - "Tentang RIMA" links in `Profile.tsx` and `Sidebar.tsx` allow returning users to navigate to `/landing` at any time without redirect bounce.
- **Dual-Identity & Incognito Mode Architecture**:
  - `src/hooks/useAuth.ts` decoupled identities: `accountUser` (Supabase session) vs `anonymousProfile` (pseudonym).
  - Reactive state `isAnonymousMode: boolean` persisted in `'rima-anonymous-mode'` via `useLocalStorage` CustomEvent bus.
  - `toggleAnonymousMode()`: 1-click return to anonymous mode; switching to account mode opens `AuthModal` if unauthenticated.
  - Interactive `<IncognitoPillToggle />` placed in `Home.tsx` header (`zen-header-actions`), `Profile.tsx`, and `Sidebar.tsx`.
  - In `Forum.tsx`: when `isAnonymousMode` is active, posts and comments strictly use calming random pseudonyms (`generateAnonymousName()`), completely masking account ID, real name, and email.
- **Modern Minimalist AuthModal (`AuthModal.tsx`)**:
  - 3-state machine (`input` -> `sending` -> `sent`) inside accessible `<Modal size="sm">`.
  - Supabase `signInWithOtp` Magic Link OTP with RFC email validation.
  - Zero-friction cancellation: returns to anonymous mode with no barriers.
- **Hosting SPA Rewrites**:
  - `vercel.json`: rewrites `/(.*)` to `/index.html`.
  - `netlify.toml`: redirects `/*` to `/index.html` status 200.
  - `public/_redirects`: `/* /index.html 200`.
- **Localization & Guardrails**:
  - 100% 8-language key parity across `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`.
  - Arabic RTL layout with logical properties and directional icon flips.
  - Pure vanilla CSS tokens (Strictly ZERO Tailwind CSS).
  - 4-Tier Automated Quality Gates: oxlint, tsc -b, vitest (100%), vite build.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 8-Language Localization Catalogs | 85 keys added across all 8 locales (landing, auth, incognito, nav, profile) | M1 | Survey 3 (DONE) |
| 2 | Pure Vanilla CSS Design Tokens | Token rules for landing page, frosted glass, pill toggles, auth modal | M1 | Survey 1, Survey 3 (DONE) |
| 3 | SPA Hosting Rewrites | vercel.json, netlify.toml, public/_redirects for client-side deep linking | M1 | Survey 1 (DONE) |
| 4 | In-App Incognito Mode in useAuth.ts | isAnonymousMode, toggleAnonymousMode, decoupled accountUser & anonymousProfile | M3 | Survey 2 (DONE) |
| 5 | IncognitoPillToggle Component | Interactive pill toggle (🕶️ Mode Anonim Aktif vs 👤 Akun Terhubung) | M3 | Survey 2 (DONE) |
| 6 | Forum Pseudonym Protection | Automatic random pseudonym ("Calm River") masking account in Forum.tsx | M3 | Survey 2 (DONE) |
| 7 | AuthModal Supabase Magic Link OTP | Modern minimalist dialog with email validation, sending status, cancel to anon | M3 | Survey 2 (DONE) |
| 8 | Standalone Landing Page (Landing.tsx) | Hero, 3 Pillars (Privacy, Stigma-free, Clinical Evidence), Dual CTA, Showcase, FAQ | M2 | Survey 1 (DONE) |
| 9 | App.tsx Standalone Layout Decoupling | AppShellLayout pathless route isolating internal shell from Landing | M2 | Survey 1 (DONE) |
| 10 | RootRedirector Adaptive Navigation | localStorage 'rima-has-entered' redirecting new to /landing, returning to / | M2 | Survey 1 (DONE) |
| 11 | Profile & Sidebar Landing Links | "Tentang RIMA (Landing Page)" navigation links in Profile & Sidebar | M2 | Survey 1 (DONE) |
| 12 | Comprehensive Test Suite & Gates | Unit tests for Landing, AuthModal, Incognito, Nav; 100% pass on 4 quality gates | M4 | Survey 3 (DONE) |
| 13 | Independent Reviewer & Challenger Verification | 2 Reviewers + 2 Challengers empirical verification | M5 | Strategy (IN_PROGRESS) |
| 14 | Forensic Integrity Audit | Systematic forensic audit verifying authentic implementation and zero cheating | M5 | Strategy (IN_PROGRESS) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: 8-Language Catalogs, CSS Tokens & Hosting Rewrites | `src/i18n/*.json`, `src/styles/components.css`, `vercel.json`, `netlify.toml`, `public/_redirects` | none | DONE |
| 2 | M3: In-App Incognito Mode & AuthModal Magic Link OTP | `src/hooks/useAuth.ts`, `src/components/auth/IncognitoPillToggle.tsx`, `src/components/auth/AuthModal.tsx`, `src/pages/Forum.tsx`, `src/pages/Home.tsx`, `src/pages/Profile.tsx` | M1 | DONE |
| 3 | M2: Modern Minimalist Landing Page & Adaptive Navigation | `src/pages/Landing.tsx`, `src/App.tsx`, `src/pages/Profile.tsx`, `src/components/layout/Sidebar.tsx` | M1, M3 | DONE |
| 4 | M4: Comprehensive Test Suite & 4 Quality Gates | `src/pages/__tests__/Landing.test.tsx`, `src/components/auth/__tests__/AuthModal.test.tsx`, `src/components/auth/__tests__/IncognitoPillToggle.test.tsx`, `src/test/i18nParity.test.ts`, quality gates | M2, M3 | DONE |
| 5 | M5: Review, Challenger Verification & Forensic Integrity Audit | Reviewers, Challengers, Forensic Auditor | M4 | IN_PROGRESS |

## Interface Contracts
### Adaptive Navigation Contract (`localStorage`)
- Storage key: `'rima-has-entered'`
- Values: `'true'` (visitor has entered via Guest CTA or Login), absent/null (first-time visitor).
- Guest CTA action:
  ```ts
  localStorage.setItem('rima-has-entered', 'true');
  localStorage.setItem('rima-consent-accepted', new Date().toISOString());
  navigate('/');
  ```
- Reset on wipe: `dataWipe.ts` collects all `rima-*` keys; resets state on user wipe.

### In-App Incognito Mode Contract (`useAuth.ts`)
```ts
export interface UseAuthReturn {
  user: UserProfile;
  accountUser: { id: string; email?: string; displayName?: string } | null;
  isAuthenticated: boolean;
  isAnonymousMode: boolean;
  activeDisplayName: string;
  isAuthenticating: boolean;
  isSupabaseConfigured: boolean;
  toggleAnonymousMode: () => { success: boolean; requiresAuth: boolean };
  setAnonymousMode: (enabled: boolean) => void;
  updateDisplayName: (name: string) => void;
  regenerateAnonymousName: () => void;
  loginWithEmail: (email: string) => Promise<void>;
  verifyOtp?: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

### AuthModal Contract (`AuthModal.tsx`)
```tsx
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### IncognitoPillToggle Contract (`IncognitoPillToggle.tsx`)
```tsx
interface IncognitoPillToggleProps {
  onRequireAuth?: () => void;
  className?: string;
}
```

## Code Layout
- `src/i18n/{id,en,jv,su,ja,zh,es,ar}.json` — 8-language localization catalogs
- `src/styles/components.css` — Component styling tokens (landing, pill, auth modal)
- `vercel.json` & `netlify.toml` & `public/_redirects` — Hosting SPA rewrites
- `src/pages/Landing.tsx` — Standalone modern minimalist public landing page
- `src/App.tsx` — App routing, AppShellLayout pathless route, RootRedirector
- `src/hooks/useAuth.ts` — Dual identity authentication and incognito state
- `src/components/auth/IncognitoPillToggle.tsx` — Pill toggle component
- `src/components/auth/AuthModal.tsx` — Supabase Magic Link OTP modal
- `src/pages/Forum.tsx` — Forum pseudonym integration
- `src/pages/Profile.tsx` — Profile landing link & incognito controls
- `src/components/layout/Sidebar.tsx` — Sidebar landing link
- `src/pages/__tests__/Landing.test.tsx` — Landing page tests
- `src/components/auth/__tests__/AuthModal.test.tsx` — Auth modal tests
- `src/components/auth/__tests__/IncognitoPillToggle.test.tsx` — Incognito pill tests
