# DISPATCH: Worker M1 (PWA Performance & Rollup Manual Chunks)

## Identity
- Type: teamwork_preview_worker
- Role: Implementation Worker (Vite & PWA Specialist)
- Working Directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\
- Project Root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
- Authoritative Request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope Document: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md
- Survey Findings & Blueprint: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_1\handoff.md and C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_3\handoff.md

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusive Write Ownership
You have exclusive write ownership of:
- `vite.config.ts`

Do NOT touch any other source or test files during this milestone.

## Objective & Requirements
Implement Milestone 1 (R1 from user request):
1. **Cross-Platform Rollup Manual Chunks in `vite.config.ts`**:
   - Partition all 8 translation catalogs (`src/i18n/*.json`) into a dedicated chunk: `'i18n-locales'`.
   - Use cross-platform path handling (supporting both Windows `\` and Linux `/`):
     ```typescript
     if (/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)) {
       return 'i18n-locales';
     }
     ```
   - Resolve vendor chunk prefix precedence: Ensure `react-i18next` and `i18next-browser-languagedetector` match `'i18n-vendor'` BEFORE `node_modules/react` matches:
     ```typescript
     if (
       id.includes('node_modules/i18next') ||
       id.includes('node_modules/react-i18next') ||
       id.includes('node_modules/i18next-browser-languagedetector')
     ) {
       return 'i18n-vendor';
     }
     if (
       id.includes('node_modules/react') ||
       id.includes('node_modules/react-dom') ||
       id.includes('node_modules/react-router-dom')
     ) {
       return 'react-vendor';
     }
     if (id.includes('node_modules/recharts')) {
       return 'recharts-vendor';
     }
     if (id.includes('node_modules/lucide-react')) {
       return 'icons-vendor';
     }
     ```
2. **Workbox Configuration in `vite.config.ts`**:
   - Under `VitePWA({ workbox: { ... } })`, set `maximumFileSizeToCacheInBytes: 3000000` (3 MiB) to give defensive headroom for the partitioned locale dictionary.
   - Preserve existing `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` and runtime caching for Google Fonts.
3. **Verification**:
   - Run `npx tsc -b` -> must exit 0.
   - Run `npm run lint` -> must find 0 errors and 0 warnings.
   - Run `npx vitest run` -> 100% test pass.
   - Run `npm run build` -> production build succeeds cleanly. Verify that `dist/assets/i18n-locales-*.js` is generated, `dist/assets/index-*.js` is reduced to < 70 kB, and `dist/sw.js` precaches all assets including `i18n-locales`.

## Output Requirements
Write your detailed report to:
`C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\handoff.md`
Report the exact bundle sizes before and after, build logs, and test verification output.
Then send a completion message to the orchestrator.


## 2026-10-10T10:50:03Z
[Message] timestamp=2026-10-10T10:50:03Z sender=1fc4eab6-678b-43c3-b349-35e9ecfccc3a priority=MESSAGE_PRIORITY_HIGH content=You are an Implementation Worker for Milestone 1 of RIMA Phase 3 improvements.
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Your dispatch instructions: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\DISPATCH.md
Read ORIGINAL_REQUEST.md and DISPATCH.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership of `vite.config.ts`.
Configure Rollup manualChunks to isolate all 8 translation catalogs into `i18n-locales`, route i18next packages into `i18n-vendor`, configure Workbox 3 MiB headroom, run build/lint/tests, verify the main entry bundle reduction, and write a complete handoff report to C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\handoff.md.
When finished, notify the orchestrator with send_message.
