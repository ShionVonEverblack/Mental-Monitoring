## 2026-10-10T19:23:26Z
From: 52aa29b1-dc1b-4ba1-9bb2-f6fca8f4ec93 (parent / orchestrator_4)
To: explorer_m4_1 (Routing, Landing Page & Hosting Specialist)

Mission:
Investigate codebase architecture for:
1. R1: Modern Minimalist Public Landing Page (src/pages/Landing.tsx). How routing and layout currently work in src/App.tsx and src/components/layout/ (AppShell, Navigation, BottomDock, Header). How to render Landing with a standalone layout without dock/sidebar, while maintaining the app shell for other pages.
2. R2: Adaptive navigation for first-time vs returning visitors. Inspect localStorage usage, session state, how to detect if localStorage.getItem('rima-has-entered') is missing, how to redirect new visitors to /landing, how guest entry ("Mulai sebagai Tamu Anonim") and login sets 'rima-has-entered' = 'true' and navigates to /, and how to add "Tentang RIMA (Landing Page)" link to Profile (src/pages/Profile.tsx) and navigation bar.
3. R5: Public web hosting SPA rewrites: Inspect root directory and package.json. Determine the exact syntax and configuration for vercel.json (rewrites /* -> /index.html) and netlify.toml (redirects /* -> /index.html 200).
4. Styling guardrail: Inspect src/styles/design-tokens.css and components.css to understand how Landing.tsx should use pure vanilla CSS design tokens (frosted glass, quiet colors, zero Tailwind).

Constraints:
- You are read-only. DO NOT write or edit source code files.
- Maintain BRIEFING.md, plan.md, progress.md, and handoff.md in your working directory.
- Report your findings in detail in handoff.md, then send a message to orchestrator_4 with the handoff path and key conclusions.
