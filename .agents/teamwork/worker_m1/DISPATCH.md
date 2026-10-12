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


## 2026-10-12T15:29:38Z
[Message] timestamp=2026-10-12T15:29:38Z sender=23e86b7a-05e5-4478-bbda-1fc7add44f85 priority=MESSAGE_PRIORITY_HIGH content=You are the Worker for RIMA Project Phase 6 Milestone 1 (M1: Core System Guardrails & Compliance Framework).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1
Your project root is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring

Read ORIGINAL_REQUEST.md at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Read PROJECT.md at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md

Read Explorer reports:
- C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m1_1\handoff.md
- C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m1_2\handoff.md
- C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m1_3\handoff.md

Write Ownership:
You EXCLUSIVELY own the file:
C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\rules\agent_skill_guardrails.md
DO NOT modify any other files in src/ or elsewhere.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task:
1. Implement C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\rules\agent_skill_guardrails.md with:
   - Valid YAML frontmatter:
     ---
     trigger: always_on
     description: Mandatory system-wide guardrails for all agent skills, enforcing YAML frontmatter compliance, <30K token context density compression, offline-first data integrity, UU PDP No. 27/2022 privacy, and client-side cryptography.
     ---
   - Section 1: YAML Frontmatter Standards (Antigravity & agentskills.io compatibility, mandatory fields, automated validation scripts)
   - Section 2: Context Density Compression (<30K token budget, <400 lines per file, progressive disclosure, tabular synthesis)
   - Section 3: Offline-First Data Integrity & Zero Runtime Telemetry (100% on-device processing for Yale Mood Meter, JITAI, CBT-I, Web Audio; 0 external network requests; zero analytics/tracking SDKs; Workbox PWA precache invariants)
   - Section 4: Statutory Privacy Compliance (Indonesian UU PDP No. 27/2022 Data Pribadi Spesifik, Pasal 4 & 16, user rights, anonymous guest mode pseudonymization "Calm River", differential privacy epsilon <= 1.0)
   - Section 5: Client-Side Cryptographic Standards (Web Crypto AES-GCM-256, PBKDF2 600,000 iterations, 96-bit IV, non-extractable keys in volatile memory, EncryptedPayload JSON schema)
   - Section 6: Architectural Invariants & Preservation of 4 Quality Gates (pure vanilla CSS design tokens, zero Tailwind CSS, 100% 8-language i18n parity, and clean verification across oxlint, tsc -b, vitest, and vite build).
2. Execute the verification commands to prove zero side effects on RIMA:
   - npm run lint
   - npx tsc -b
   - npm test
   - npm run build
   - Verify frontmatter of .agents/rules/agent_skill_guardrails.md
3. Document your exact implementation and verification results in:
   C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\handoff.md
4. Update your progress.md and send a completion message back to the orchestrator.
