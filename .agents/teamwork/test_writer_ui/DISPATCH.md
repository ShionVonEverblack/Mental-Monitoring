## 2026-10-10T12:40:17Z

You are a teamwork_preview_test_writer agent for RIMA (Ruang Interaksi Mental Aman).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\test_writer_ui\
Your parent orchestrator conversation ID is: 5862a47f-00e3-4df8-aff9-4054c18b7e28
The Project directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring

MANDATORY FIRST STEPS:
1. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (especially under header ## 2026-10-10T12:06:32Z).
2. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md.
3. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\src\pages\Home.tsx.
4. Read existing test files for reference, e.g., `src/components/__tests__/JitaiNudgeCard.test.tsx` and `src/components/__tests__/FastActionSafetyCard.test.tsx`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own and may edit the following file ONLY:
- `src/pages/__tests__/Home.test.tsx`
Do NOT modify any implementation source code.

OBJECTIVE — MILESTONE M4: Dedicated Home Test Suite & 4-Tier Automated Quality Gates
Author a comprehensive, high-quality Vitest unit and accessibility test suite for `Home.tsx` in `src/pages/__tests__/Home.test.tsx`:
1. Zen Header & Presence Badge:
   - Verifies greeting text and header presence.
   - Verifies presence streak badge without gamification pressure and recovery state handling.
   - Verifies language switcher opens modal.
2. Fluid Mood Check-In:
   - When no mood logged: verifies mood prompt, mood options, and direct navigation link to Yale Mood Meter 2D (`/mood`).
   - When mood is logged: verifies serene status badge chip displaying logged mood, and update button linking to `/mood`.
3. Whisper Nudge:
   - Verifies adaptive JITAI nudge integration and dismissal.
4. Editorial Zen Quote / Afirmasi:
   - Verifies affirmation card rendering with editorial typography and text content.
5. Pilihan Hening (4 Structured Minimalist Card Rows):
   - Verifies `.zen-feature-matrix` renders 4 structured groups.
   - Row 1 (Jurnal & Refleksi): Tests navigation calls for Jurnal (`/journal`), Skrining Mandiri (`/assessment`), and Edukasi Jiwa (`/education`).
   - Row 2 (Regulasi Somatik): Tests Brownian noise audio toggle (calls `audioSomaticsService.play` / `audioSomaticsService.stop`), and navigation calls for Latihan Napas (`/breathe`) and Grounding 5-4-3-2-1 (`/grounding`).
   - Row 3 (Welas Asih & Koping): Tests opening `SelfCompassionModal` on Belas Kasih Diri click, and navigation calls for TIPP Krisis (`/tipp`) and Aktivasi Perilaku BA (`/activation`).
   - Row 4 (Jaring Pengaman & Bantuan): Tests navigation calls for Rencana Keselamatan (`/safety-plan`), Hotline 119 Ext 8 (`tel:119,8` anchor with proper href), and Rujukan Puskesmas & BPJS (`/professional-help`).
6. Accessibility & Touch Targets:
   - Verifies all action tiles have accessible names, proper button/link roles, and conform to touch target standards.

VERIFICATION REQUIREMENTS:
Run:
1. `npm run lint` (0 errors, 0 warnings across all files)
2. `npx tsc -b` (0 errors)
3. `npx vitest run` (100% pass across ALL test files, now 42 files)
4. `npm run build` (clean PWA production build)

Document your test implementation and command outputs in `handoff.md` in your working directory and notify parent orchestrator via send_message.
