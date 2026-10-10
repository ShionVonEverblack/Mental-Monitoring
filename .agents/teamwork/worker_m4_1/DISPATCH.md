## 2026-10-10T19:38:12Z
You are worker_m4_1 (i18n Localization, CSS Design Tokens & SPA Hosting Specialist).
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m4_1
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (specifically ## 2026-10-10T19:19:55Z).
Master Project Architecture: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_4\PROJECT.md.
Survey Findings & Exact Blueprints:
- Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_3\handoff.md (contains exact translations for all 8 languages and CSS tokens).
- Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_1\handoff.md (contains exact SPA hosting rewrite syntax).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write ownership:
- src/i18n/id.json
- src/i18n/en.json
- src/i18n/jv.json
- src/i18n/su.json
- src/i18n/ja.json
- src/i18n/zh.json
- src/i18n/es.json
- src/i18n/ar.json
- src/styles/components.css (append new classes, do not destroy existing styles)
- vercel.json
- netlify.toml
- public/_redirects

Tasks:
1. 8-Language Localization Parity (R6):
   - In all 8 files (id, en, jv, su, ja, zh, es, ar), add the complete translation dictionaries for `landing`, `auth`, `incognito`, and the new keys for `nav` and `profile` exactly as documented in explorer_m4_3/handoff.md.
   - Ensure 100% exact key parity with id.json, non-empty leaf strings, and valid JSON syntax.
2. CSS Tokens & Components (R1, R3, R4, R6):
   - In src/styles/components.css, append the CSS classes for:
     a) Landing Page: `.landing-page`, `.landing-header`, `.landing-hero`, `.landing-hero-badge`, `.landing-hero-title`, `.landing-hero-subtitle`, `.landing-cta-group`, `.landing-pillars`, `.landing-pillar-card`, `.landing-showcase`, `.landing-faq`, `.landing-footer`. Use design tokens from design-tokens.css, frosted glass blur, quiet obsidian/linen palette, touch targets >= 48px, and Arabic RTL rules.
     b) In-App Incognito Pill: `.incognito-pill-btn`, `.incognito-pill-active`, `.incognito-pill-account`, `.incognito-pill-hint`.
     c) AuthModal: `.auth-modal-form`, `.auth-modal-desc`, `.auth-warning-box`, `.auth-modal-actions`, `.auth-btn-full`, `.auth-sent-icon-wrapper`, `.auth-sent-icon`, `.auth-sent-heading`, `.auth-sent-desc`, `.auth-sent-note`.
   - Adhere strictly to ZERO Tailwind CSS.
3. SPA Web Hosting Rewrites (R5):
   - Create `vercel.json` at project root:
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   - Create `netlify.toml` at project root:
     [build]
       publish = "dist"
       command = "npm run build"

     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
   - Create `public/_redirects`:
     /* /index.html 200
4. Verification:
   - Run `npx vitest run src/test/i18nParity.test.ts`
   - Run `npm run lint`
   - Run `npx tsc -b`
   - Run `npm run build`
   - Verify all tests pass, zero lint warnings/errors, and build succeeds.

Document your implementation, files modified, and verification results in handoff.md, then message orchestrator_4.
