## 2026-10-10T19:22:04Z

You are the Project Orchestrator (orchestrator_4) for RIMA Public Web Access & Modern Minimalist Landing Page implementation.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_4
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative requirements: Read the latest section (## 2026-10-10T19:19:55Z) in C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md.

Task Overview:
- R1. Modern Minimalist Public Landing Page (Landing.tsx) with Hero, 3 Value Pillars, Dual CTA ("Mulai sebagai Tamu Anonim" -> Beranda 1-click & "Masuk dengan Akun" -> Supabase Magic Link OTP modal), Showcase & FAQ, standalone layout without dock/sidebar.
- R2. Adaptive navigation for first-time vs returning visitors in src/App.tsx (localStorage 'rima-has-entered', redirect new to /landing, set flag on guest entry or login, navigation link to Landing from Profile/Nav).
- R3. In-App Incognito Mode Toggle in useAuth.ts (isAnonymousMode, toggleAnonymousMode), pill toggle in Header & Profile, automatic pseudonym in Forum.tsx when active.
- R4. Modern Minimalist AuthModal.tsx dialog for Supabase Magic Link OTP.
- R5. Public web hosting SPA rewrites (vercel.json, netlify.toml).
- R6. Architectural guardrails: pure vanilla CSS tokens (Zero Tailwind), 100% 8-language parity (id, en, jv, su, ja, zh, es, ar) + Arabic RTL layout, passing all 4 Quality Gates (oxlint, tsc -b, vitest run across all 44+ test files, vite build).

Maintain BRIEFING.md and progress.md in your working directory.
Dispatch specialists (e.g. explorer, worker, reviewer/tester) in dedicated folders under .agents/teamwork/.
When finished and all quality gates pass, report completion back with full verification evidence.
