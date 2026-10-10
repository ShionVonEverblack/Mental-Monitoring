# Investigation Plan: Routing, Landing Page & Hosting Architecture

## Objectives
1. **R1: Modern Minimalist Public Landing Page (src/pages/Landing.tsx) & Standalone Layout Architecture**
   - Inspect `src/App.tsx`, `src/components/layout/AppShell.tsx`, `Header.tsx`, `Navigation.tsx`, `BottomDock.tsx`.
   - Determine how routes are structured (React Router components, routes definition, lazy loading, suspense).
   - Determine how `Landing.tsx` can be rendered with a standalone layout without header/sidebar/bottom-dock while preserving `AppShell` for internal routes (`/`, `/mood`, `/journal`, etc.).
   - Evaluate options: Route-level layout nesting vs conditional rendering in AppShell vs separate route branch.

2. **R2: Adaptive Navigation for First-Time vs Returning Visitors**
   - Examine `localStorage` handling and convention across the app.
   - Design the adaptive navigation redirect logic:
     - First-time visitors: missing `rima-has-entered` flag in `localStorage` -> redirect to `/landing`.
     - Returning visitors: `rima-has-entered === 'true'` -> render app route (e.g. `/`).
     - Guest entry ("Mulai sebagai Tamu Anonim"): set `localStorage.setItem('rima-has-entered', 'true')` -> navigate to `/`.
     - Login action ("Masuk dengan Akun"): set flag and navigate to `/`.
     - Direct URL access / deep linking: ensure returning users or explicit navigation works cleanly without loops.
   - Inspect `src/pages/Profile.tsx` and navigation menus (`Navigation.tsx` / `BottomDock.tsx` / `Header.tsx`):
     - Identify exact location, UI pattern, and translation keys to add "Tentang RIMA (Landing Page)" link.

3. **R5: Public Web Hosting SPA Rewrites**
   - Inspect root directory, `package.json`, `vite.config.ts`, build outputs in `dist`.
   - Determine exact format and config for:
     - `vercel.json` (SPA rewrites from `/(.*)` to `/index.html`, headers if needed).
     - `netlify.toml` (SPA redirects `/*` to `/index.html` with status 200).
   - Check if any existing deployment files or static routing configs exist.

4. **Styling Guardrails & Design Tokens (Landing Page UI)**
   - Inspect `src/styles/design-tokens.css` and `src/styles/components.css`.
   - Identify existing color palette (obsidian/linen, quiet glass, frosted glass blur, typography, spacing).
   - Determine best practices for styling `Landing.tsx` purely with vanilla CSS classes/tokens without Tailwind.

5. **Synthesis & Handoff Report**
   - Compile detailed findings, exact code references, proposed architectural designs, and verification steps in `handoff.md`.
   - Send completion message to `orchestrator_4`.
