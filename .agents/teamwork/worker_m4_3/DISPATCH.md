## 2026-10-10T20:03:13Z
You are worker_m4_3 (Landing Page & Adaptive Navigation Specialist).
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m4_3
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-10T19:19:55Z).
Master Project Architecture: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_4\PROJECT.md.
Survey Findings & Blueprints:
- Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_1\handoff.md (detailed routing decoupling, RootRedirector, Landing.tsx structure, Profile/Sidebar links).
- Note: M1 (i18n catalogs & CSS tokens) and M3 (AuthModal & Incognito toggle) are ALREADY COMPLETED. All CSS classes in components.css and translation keys in id/en/jv/su/ja/zh/es/ar.json already exist!

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write ownership:
- src/pages/Landing.tsx (create)
- src/App.tsx
- src/pages/Profile.tsx (add landing link)
- src/components/layout/Sidebar.tsx (add landing link)

Tasks:
1. `src/pages/Landing.tsx`:
   - Create Modern Minimalist public Landing Page with standalone layout (NO sidebar, NO bottom dock, NO SOS button).
   - Independent Header: Brand logo, language switcher, theme toggle (dark/light), and "Masuk" button.
   - Hero Section:
     - Badge: t('landing.heroBadge')
     - Title: t('landing.heroTitle')
     - Subtitle: t('landing.heroSubtitle')
     - Tagline: t('landing.heroTagline')
     - Dual CTA:
       - Primary: "Mulai sebagai Tamu Anonim" (t('landing.ctaGuest')): sets `localStorage.setItem('rima-has-entered', 'true')` and `localStorage.setItem('rima-consent-accepted', new Date().toISOString())`, calls `navigate('/')`.
       - Secondary: "Masuk dengan Akun" (t('landing.ctaLogin')): opens `AuthModal` dialog (`<AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />`).
   - 3 Value Pillars:
     - 100% Privasi & Tanpa Pelacakan (UU PDP No. 27/2022, on-device data).
     - Bebas Stigma (Instant 1-click access, zero mandatory registration/phone).
     - Intervensi Berbasis Bukti Klinis (JITAI, Yale Mood Meter, DBT TIPP, Somatics, CFT).
   - Showcase Features (6 feature highlight cards).
   - FAQ Accordion (4 expandable FAQ items).
   - Independent Minimalist Footer (copyright, emergency hotline 119 Ext 8 reminder, medical disclaimer).
   - Responsive, WCAG touch target >= 48px, pure vanilla CSS tokens (zero Tailwind), Arabic RTL support.
2. `src/App.tsx`:
   - Decouple routing using React Router Pathless Layout Route:
     - Create `AppShellLayout` wrapping `<AppLockScreen />`, `<ConsentModal />`, and `<AppShell><Suspense fallback={<PageFallbackLoader />}><Outlet /></Suspense></AppShell>`.
     - Create `RootRedirector` for `/`:
       ```tsx
       const RootRedirector: React.FC = () => {
         const hasEntered = typeof window !== 'undefined' && localStorage.getItem('rima-has-entered') === 'true';
         if (!hasEntered) {
           return <Navigate to="/landing" replace />;
         }
         return <Home />;
       };
       ```
     - Standalone `<Route path="/landing" element={<Suspense fallback={<PageFallbackLoader />}><Landing /></Suspense>} />` OUTSIDE `AppShellLayout`.
     - Internal routes nested inside `<Route element={<AppShellLayout />}>` (`/` -> `<RootRedirector />`, `/mood`, `/journal`, etc.).
3. `src/pages/Profile.tsx`:
   - Add a settings item "Tentang RIMA (Landing Page)" using `t('profile.landingLink')` and `t('profile.landingLinkDesc')` that navigates to `/landing`.
4. `src/components/layout/Sidebar.tsx`:
   - In sidebar footer or bottom action area, add a link / button to `/landing` using `t('nav.landing', 'Tentang RIMA')`.
5. Quality Gates Verification:
   - Run `npm run lint` (oxlint) -> 0 warnings, 0 errors.
   - Run `npx tsc -b` -> 0 errors.
   - Run `npx vitest run` -> 100% pass across all test files.
   - Run `npm run build` -> production build succeeds.
