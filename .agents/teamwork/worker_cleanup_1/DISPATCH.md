# DISPATCH

## 2026-10-10T07:42:56Z

**Sender**: 4438b745-bf9d-4846-a9bb-3ab1b88a6140 (parent / orchestrator)
**Priority**: MESSAGE_PRIORITY_HIGH

You are Worker Cleanup 1 (Quality Hardening Worker).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_cleanup_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original request is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Reviewer 2 handoff report: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\reviewer_2\handoff.md
Challenger 2 handoff report: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\challenger_2\handoff.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. RTL Regional Matching in `src/App.tsx`:
   Update line 43:
   `document.documentElement.dir = (lng && lng.startsWith('ar')) ? 'rtl' : 'ltr';`
   This ensures regional Arabic codes like `ar-SA` or `ar-EG` trigger `dir="rtl"`.
2. Clean up temporary scratch scripts:
   Remove `scratch/verify_i18n.js` and `scratch/verify_i18n.cjs` (or delete the `scratch` directory).
3. Contact parsing refinement in `src/services/safetyCardService.ts`:
   In `parseContactString`, if the string matches a pure phone number pattern (digits, spaces, dashes, e.g. `^[\d\s\-+()]+$`) without letters, treat the entire string as the phone number rather than splitting on a dash as a name/phone delimiter.
4. Run all quality checks:
   - `npm run lint` -> MUST be 0 warnings, 0 errors.
   - `npx tsc -b` -> MUST be 0 errors.
   - `npx vitest run` -> 100% of all tests must pass.
   - `npm run build` -> production build must succeed with PWA service worker.
5. Document all actions, command outputs, and results in `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_cleanup_1\handoff.md`.
6. Notify parent via send_message when complete.
