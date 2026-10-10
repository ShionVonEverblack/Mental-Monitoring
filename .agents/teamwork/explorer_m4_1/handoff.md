# Handoff Report: Routing, Public Landing Page & Hosting Specialist (explorer_m4_1)

**Target Audience**: orchestrator_4, worker_m4_1, reviewer_m4_1
**Author**: explorer_m4_1
**Scope**: R1 (Modern Minimalist Public Landing Page & Standalone Layout Architecture), R2 (Adaptive Navigation for First-Time vs Returning Visitors & Profile/Nav Links), R5 (Public Web Hosting SPA Rewrites), and Pure Vanilla CSS Styling Guardrails.
**Mode**: Hard Handoff (Investigation Complete)

---

## 1. Observation

### 1.1 Existing Layout & Routing Architecture
- In `src/App.tsx` (lines 59–88), all application routes are currently unconditionally wrapped inside `<AppShell>`:
```tsx
59:   return (
60:     <ErrorBoundary>
61:       <BrowserRouter>
62:         <AppLockScreen />
63:         <ConsentModal />
64:         <AppShell>
65:           <Suspense fallback={<PageFallbackLoader />}>
66:             <Routes>
67:               <Route path="/" element={<Home />} />
68:               <Route path="/mood" element={<MoodTracker />} />
69:               <Route path="/journal" element={<Journal />} />
...
84:             </Routes>
85:           </Suspense>
86:         </AppShell>
87:       </BrowserRouter>
88:     </ErrorBoundary>
89:   );
```
- In `src/components/layout/AppShell.tsx` (lines 8–37), the shell injects navigation, safety controls, and styling constraints:
```tsx
12:     <div className="app-shell">
13:       {/* WCAG 2.4.1 — Skip to Main Content bypass link */}
...
28:       <Sidebar />
29:       <main className="app-main" id="main-content">
30:         <div className="app-content">{children}</div>
31:       </main>
32:       <BottomNav />
33:       <SOSButton />
34:       <SessionAwareness />
35:     </div>
```
- In `src/styles/index.css` (lines 199–205), `.app-shell`, `.app-main`, and `.app-content` enforce layout constraints:
```css
199: .app-shell { display: flex; min-height: 100vh; background: var(--bg-primary); }
200: .app-main { flex: 1; position: relative; padding-bottom: 80px; overflow-x: hidden; }
201: .app-content { width: 100%; max-width: 800px; margin: 0 auto; padding: var(--spacing-lg) var(--spacing-md); }
202: @media (min-width: 768px) {
203:   .app-main { padding-bottom: 0; }
204:   .app-content { padding: var(--spacing-xl) var(--spacing-lg); }
205: }
```
- On desktop, `.sidebar` (lines 208–223) occupies `260px` sticky width (`72px` when collapsed). On mobile, `.bottom-nav` (lines 200, padding-bottom 80px) and `<SOSButton />` (floating action button) overlay the bottom.
- `<AppLockScreen />` (line 62) checks `rima-app-lock-pin` and locks the interface if PIN is configured. `<ConsentModal />` (line 63) opens if `localStorage.getItem('rima-consent-accepted')` is missing.

### 1.2 Session State & Adaptive Navigation Flag
- A grep search for `rima-has-entered` across the entire codebase returned 0 matches: the key is brand new in Phase 4.
- In `src/utils/dataWipe.ts` (lines 31–43):
```ts
31:     // 2. Collect all rima-* keys and clear them from localStorage
32:     const keysToWipe: string[] = [];
33:     for (let i = 0; i < localStorage.length; i++) {
34:       const key = localStorage.key(i);
35:       if (key && (key.startsWith('rima-') || key === 'local-storage')) {
36:         keysToWipe.push(key);
37:       }
38:     }
```
Any key starting with `rima-` (specifically `rima-has-entered`) is automatically purged on data wipe, correctly resetting user state to a fresh first-time visitor.

### 1.3 Profile & Navigation Touchpoints
- In `src/pages/Profile.tsx` (lines 312–443, 751–784, 831–845):
  - Settings list items use `.settings-item` pattern:
    ```tsx
    <div className="settings-item" role="button" tabIndex={0} onClick={...}>
      <div className="settings-item-left">...</div>
      <div className="settings-item-right">...</div>
    </div>
    ```
  - An `.about-section` exists at the bottom (lines 831–844) displaying the version, description, and disclaimer.
- In `src/components/layout/Sidebar.tsx` (lines 13–19, 52–96):
  - Fixed `tabs` array (`/`, `/mood`, `/journal`, `/forum`, `/profile`).
  - `.sidebar-footer` contains dynamic mood emoji and offline status indicator.
- In `src/components/layout/BottomNav.tsx` (lines 9–15):
  - Exactly 5 mobile tabs. Touch screen guidelines limit bottom docks to 5 items to preserve >= 48px hit targets.

### 1.4 Hosting Configurations
- Neither `vercel.json` nor `netlify.toml` exist anywhere in the repository.
- `package.json` specifies `"build": "tsc -b && vite build"` and uses `react-router-dom: "^7.18.2"` with HTML5 pushState `BrowserRouter`.
- `vite.config.ts` builds to default `dist/`, with PWA precaching enabled for all `**/*.{js,css,html,ico,png,svg,woff2}`.
- Running `npm run build` outputs 56 precached entries, with lazy chunks generated dynamically.

### 1.5 Pure Vanilla CSS Design Tokens
- `src/styles/design-tokens.css` defines:
  - Dark mode backgrounds: `--bg-primary: #0C1017`, `--bg-secondary: #121720`, `--bg-card: #161C26`, `--bg-elevated: #1E2532`.
  - Modern Glassmorphic Surfaces:
    - `--bg-glass-card: rgba(22, 28, 38, 0.72)` (dark), `rgba(255, 255, 255, 0.82)` (light).
    - `--border-glass-rim: inset 0 1px 0 0 rgba(255, 255, 255, 0.06)`.
    - `--border-subtle: rgba(255, 255, 255, 0.06)`, `--border-strong: rgba(255, 255, 255, 0.12)`.
  - Light mode: `--bg-primary: #F7F8FA`, `--text-primary: #14181F`, `--text-secondary: #4E5564`.
  - Low-stimulation mode: `[data-sensory='calm']`, `[data-sensory='low-stimulation']` desaturates colors, turns off glow effects (`--glow-primary: none !important`), and removes animations.
- `src/styles/components.css` defines:
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` with strict WCAG 2.2 touch target `min-height: 48px`.
  - `.card` with frosted glass backdrop filter `backdrop-filter: blur(16px)`.
- Zero Tailwind CSS is used across all stylesheets.

### 1.6 Quality Baseline Verification
- `npm run lint` (`oxlint`): 0 warnings, 0 errors across 130 files.
- `npx vitest run`: 44 test files passed, 456 tests passed (100%).
- `npm run build`: `tsc -b && vite build` succeeded in 1.41s without errors.
- `src/test/i18nParity.test.ts` strictly validates that all 8 languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) have exact 1:1 key parity and zero empty string leaves.

---

## 2. Logic Chain

### 2.1 Standalone Layout for Landing.tsx without AppShell (R1)
1. *From Obs 1.1*: `AppShell` unconditionally mounts `Sidebar`, `BottomNav`, `SOSButton`, `SessionAwareness`, plus locks user view inside `.app-main` (max-width: 800px) and bottom padding (80px).
2. *From R1 requirements*: `Landing.tsx` requires a standalone layout without sidebar or bottom dock, allowing broad responsive widths (e.g. max-width: 1080px or 1200px) for editorial typography, hero showcase, and feature grids.
3. *Furthermore*: Public prospective visitors on `/landing` must not encounter `<AppLockScreen />` (PIN lock) or `<ConsentModal />` popups before they even know what RIMA is.
4. *Therefore*: We must decouple the application layout into a React Router Pathless Layout Route (`<Route element={<AppShellLayout />}>`):
   - Standalone `/landing` route is declared as an independent top-level route with its own lightweight header/footer.
   - All internal app routes (`/`, `/mood`, `/journal`, `/forum`, `/profile`, `/safety-plan`, etc.) remain nested inside `<AppShellLayout>`, which wraps them in `<AppLockScreen />`, `<ConsentModal />`, and `<AppShell><Suspense><Outlet /></Suspense></AppShell>`.
   - Result: 100% preservation of all existing app shell features for internal pages with zero visual bleed onto the Landing Page.

### 2.2 Deterministic Adaptive Redirection Logic (R2)
1. *From Obs 1.1 & 1.2*: When a user visits the root URL `/`, we must check whether `localStorage.getItem('rima-has-entered')` exists.
2. *Trap Identified*: If we evaluate `element={!localStorage.getItem('rima-has-entered') ? <Navigate to="/landing" replace /> : <Home />}` inside `App.tsx`'s JSX, the ternary executes only when `App` renders. If `App` does not re-render when navigating between routes, the route element remains stale.
3. *Architectural Solution*: Create a dedicated mounted route component `RootRedirector`:
   ```tsx
   const RootRedirector: React.FC = () => {
     const hasEntered = typeof window !== 'undefined' && localStorage.getItem('rima-has-entered') === 'true';
     if (!hasEntered) {
       return <Navigate to="/landing" replace />;
     }
     return <Home />;
   };
   ```
4. *Call Flow Analysis*:
   - **First-time visitor**: Opens `/` -> `RootRedirector` executes -> `hasEntered` is `false` -> redirects to `/landing` via `<Navigate to="/landing" replace />`. URL becomes `/landing`.
   - **Guest CTA ("Mulai sebagai Tamu Anonim")**: Click handler executes:
     ```ts
     localStorage.setItem('rima-has-entered', 'true');
     navigate('/');
     ```
     React Router navigates to `/`. `RootRedirector` mounts and runs. It reads `localStorage.getItem('rima-has-entered') === 'true'`, returns `<Home />`. The user seamlessly enters the Home dashboard.
   - **Account Login CTA ("Masuk dengan Akun")**: Opens `AuthModal`. Upon successful magic link / session confirmation:
     ```ts
     localStorage.setItem('rima-has-entered', 'true');
     navigate('/');
     ```
   - **Returning visitor next day**: Opens `/` -> `RootRedirector` runs -> `hasEntered` is `true` -> `<Home />` renders immediately with zero redirects.
   - **User in App clicks "Tentang RIMA (Landing Page)"**: Explicitly navigates to `/landing`. Route `/landing` renders `<Landing />`. Because `RootRedirector` only guards `/`, the user can explore `/landing` at any time without getting bounced back to `/`!
   - **Data Wipe in Profile**: User clicks "Hapus Seluruh Data Permanen" (`wipeAllData()`). *From Obs 1.2*, `rima-has-entered` is cleared. Window reloads to `/`, and user is greeted by `/landing` as a fresh visitor.

### 2.3 Profile & Navigation Integration (R2)
1. *From Obs 1.3*: In `src/pages/Profile.tsx`, we have two natural insertion points for "Tentang RIMA (Landing Page)":
   - In the settings list (e.g. above or below "Kebijakan Privasi & Hak Pengguna"):
     ```tsx
     <div 
       className="settings-item" 
       role="button" 
       tabIndex={0} 
       onClick={() => navigate('/landing')}
       onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/landing'); }}
     >
       <div className="settings-item-left">
         <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
         <span>{t('profile.aboutLanding', 'Tentang RIMA (Landing Page)')}</span>
       </div>
       <div className="settings-item-right">
         <Button variant="ghost" size="sm" tabIndex={-1}>
           {t('common.view', 'Lihat')}
         </Button>
       </div>
     </div>
     ```
   - In `.about-section` at the bottom of Profile: a secondary button opening the Landing Page.
2. In `src/components/layout/Sidebar.tsx`:
   - In `.sidebar-footer`, add a clean, quiet text link or icon button for "Tentang RIMA" pointing to `/landing`.
   - In `BottomNav.tsx`: Keep 5 core mobile tabs (Home, Mood, Journal, Forum, Profile) intact so mobile touch targets remain comfortably >= 48px without crowding. The landing page is always 1 tap away inside Profile.

### 2.4 SPA Hosting Rewrites Configuration (R5)
1. *From Obs 1.4*: Without server-side rewrite rules, refreshing `/landing`, `/mood`, or `/journal` causes hosting providers (Vercel, Netlify) to return 404 because physical files do not exist at those paths.
2. *Vercel Configuration (`vercel.json`)*:
   Vercel requires the `rewrites` property in `vercel.json` at project root:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *Behavior*: All non-static asset routes fallback to `/index.html`, where React Router resolves the path on the client side.
3. *Netlify Configuration (`netlify.toml`)*:
   Netlify requires `[[redirects]]` in `netlify.toml` at project root:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
   *Secondary Defense*: Also provide `public/_redirects` with `/* /index.html 200`, which Vite automatically copies to `dist/_redirects` during `vite build`.

### 2.5 Styling Guardrails & 8-Language Parity (R1, R6)
1. *From Obs 1.5*: Landing Page UI must use pure vanilla CSS tokens:
   - Frosted glass cards: `.card` with `background: var(--bg-glass-card)`, `backdrop-filter: blur(20px)`, `border: 1px solid var(--border-subtle)`, `border-radius: var(--radius-xl)`.
   - Dual CTA:
     - Primary ("Mulai sebagai Tamu Anonim"): `.btn.btn-primary.btn-lg` (`min-height: 52px`).
     - Secondary ("Masuk dengan Akun"): `.btn.btn-secondary.btn-lg` or `.btn.btn-ghost.btn-lg` (`min-height: 52px`).
   - Editorial Typography: Headings in Plus Jakarta Sans (`--font-family-base`), spacious letter spacing (`-0.015em`), warm linen (`#F7F8FA`) in light mode and zen obsidian (`#0C1017`) in dark mode.
   - Low-stimulation mode: Respects `[data-sensory='calm']` and `[data-sensory='low-stimulation']` by disabling glass blur and animation transitions.
2. *From Obs 1.6*: Any new translation keys added in `id.json` MUST be mirrored identically in all 7 other language files (`en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`) with non-empty string values. `i18nParity.test.ts` enforces 100% key parity with zero missing or extra keys.

---

## 3. Caveats

1. **Direct Deep Links by First-Time Visitors**: If a completely new visitor (no `rima-has-entered`) opens a specific deep link like `https://rima.app/privacy` directly from an external reference, `RootRedirector` only redirects `/`. The visitor can view `/privacy` without being blocked. This is beneficial for compliance and privacy transparency. If the team prefers forcing ALL unentered routes to `/landing`, a global navigation guard can be used, but allowing `/privacy` is standard practice.
2. **ConsentModal Timing**: In the current codebase, `ConsentModal` opens if `rima-consent-accepted` is missing. When `ConsentModal` is inside `AppShellLayout`, clicking "Mulai sebagai Tamu Anonim" from Landing brings the user to `/`, where `ConsentModal` would prompt them. Alternatively, clicking "Mulai sebagai Tamu Anonim" can set both `localStorage.setItem('rima-has-entered', 'true')` and `localStorage.setItem('rima-consent-accepted', new Date().toISOString())` since the Landing Page itself prominently states the privacy terms. We recommend setting both for a true 1-click zero-friction guest entry.
3. **PWA start_url**: In `vite.config.ts`, `manifest.start_url` is currently set to `'/'`. For returning PWA users, `'/'` opens Home immediately. For new PWA installs, `'/'` redirects smoothly to `/landing`. No change to `start_url` is required.

---

## 4. Conclusion

The architectural plan for R1, R2, R5, and styling guardrails is fully mapped, verified against all existing systems, and ready for immediate implementation by `worker_m4_1`:

1. **`src/App.tsx` Restructuring**:
   - Extract `AppShellLayout` utilizing React Router's `<Outlet />` inside `<AppShell>`.
   - Add top-level lazy import for `Landing` (`./pages/Landing`).
   - Define standalone `<Route path="/landing" element={<Suspense fallback={<PageFallbackLoader />}><Landing /></Suspense>} />`.
   - Implement `<RootRedirector />` for `<Route path="/" element={<RootRedirector />} />` to deterministically redirect unentered users to `/landing` while rendering `<Home />` for returning users.
2. **`src/pages/Landing.tsx` Implementation**:
   - Modern Minimalist public layout with independent header (Brand logo, Language switcher modal, Theme toggle) and footer.
   - Hero section with dual CTA:
     - Primary button: "Mulai sebagai Tamu Anonim" -> sets `rima-has-entered` = `'true'` and `navigate('/')`.
     - Secondary button: "Masuk dengan Akun" -> opens `AuthModal`.
   - 3 Core Value Pillars (100% Privasi & Tanpa Pelacakan UU PDP, Bebas Stigma, Intervensi Klinis Berbasis Bukti).
   - Feature Showcase & FAQ Accordion.
   - Standalone CSS in `components.css` or dedicated CSS module using pure design tokens (zero Tailwind).
3. **Navigation & Profile Links**:
   - Add "Tentang RIMA (Landing Page)" item to `Profile.tsx` (settings list + about section).
   - Add "Tentang RIMA" footer link in `Sidebar.tsx`.
4. **Hosting SPA Rewrites**:
   - Create `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
   - Create `netlify.toml` with `publish = "dist"`, `command = "npm run build"`, and `[[redirects]] from = "/*" to = "/index.html" status = 200`.
   - Create `public/_redirects` with `/* /index.html 200`.
5. **100% 8-Language Parity**:
   - Populate `landing` namespace, `profile.aboutLanding`, and `nav.aboutLanding` across all 8 locale files (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).

---

## 5. Verification Method

To independently verify the implementation and ensure zero regressions against all 4 quality gates:

1. **Routing & Redirection Verification**:
   - Clear browser storage / test with fresh incognito session: Navigate to `/` -> Verify URL redirects to `/landing`.
   - On `/landing`: Verify standalone layout (no sidebar, no bottom dock, no SOS button, no consent modal, no PIN lock).
   - Click "Mulai sebagai Tamu Anonim" -> Verify `localStorage.getItem('rima-has-entered') === 'true'` and navigation immediately reaches `/` (Home) with full `AppShell` active.
   - Refresh page at `/` -> Verify user remains on `/` without redirecting back to `/landing`.
   - Navigate to `/profile` -> Click "Tentang RIMA (Landing Page)" -> Verify Landing Page opens smoothly at `/landing`.
   - Trigger "Hapus Seluruh Data Permanen" in Profile -> Verify `rima-has-entered` is wiped and user is routed back to `/landing`.
2. **Hosting Rewrite Configuration Verification**:
   - Inspect syntax validity of `vercel.json` (valid JSON): `node -e "JSON.parse(fs.readFileSync('vercel.json'))"`.
   - Inspect syntax of `netlify.toml` and `public/_redirects`.
   - Verify `dist/_redirects` is generated after build: `npm run build && ls dist/_redirects`.
3. **Automated Quality Gates**:
   - **Linter**: `npm run lint` (oxlint) -> Must pass with 0 errors and 0 warnings.
   - **TypeScript**: `npx tsc -b` -> Must compile with 0 type errors.
   - **Vitest Suite**: `npx vitest run` -> 100% of test files (including `i18nParity.test.ts` and new routing/landing tests) must pass.
   - **Production Build**: `npm run build` -> Must succeed cleanly and generate PWA service worker precache assets.
