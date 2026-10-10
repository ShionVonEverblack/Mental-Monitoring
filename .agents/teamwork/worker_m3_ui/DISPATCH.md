## 2026-10-10T12:29:45Z
You are a teamwork_preview_worker agent for RIMA (Ruang Interaksi Mental Aman).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m3_ui\
Your parent orchestrator conversation ID is: 5862a47f-00e3-4df8-aff9-4054c18b7e28
The Project directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring

MANDATORY FIRST STEPS:
1. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (especially under header ## 2026-10-10T12:06:32Z).
2. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md.
3. Read the survey report at C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_ui2\survey_home.md.
4. Read the survey report at C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_ui3\survey_i18n_tests.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own and may edit the following files ONLY:
- `src/pages/Home.tsx`
- `src/styles/components.css` (if needed for styling Home elements or fine-tuning .zen-feature-matrix)
Do NOT modify any other files.

OBJECTIVE — MILESTONE M3: Minimalist Screen Re-architecture (Home.tsx) & RTL Polish
Re-architect `src/pages/Home.tsx` to transform RIMA into a world-class Zen Monastic & Apple Health Wellbeing minimalist experience:
1. Header Hening:
   - Sapaan pengguna yang tenang menggunakan `getGreeting(currentLang)`.
   - Minimalist presence streak badge: clean typography, gentle presence indicator (remove loud gamified fire/orange; use subtle presence styling and logical spacing `marginInlineStart` or flex gap for RTL Arabic compatibility).
   - Minimalist language switcher.
2. Fluid Mood Check-In:
   - Subtle, non-judgmental mood check-in prompt (`t('home.howAreYou')`).
   - Integration link/shortcut to Yale Mood Meter 2D (`/mood`).
   - If mood is logged, show a serene, elegant status chip with an option to update, removing oversized distracting emojis.
3. Whisper Nudge:
   - Preserve 100% of `<JitaiNudgeCard />` DOM and ARIA attributes (crucial for `JitaiNudgeCard.test.tsx` and `phase2E2E.test.ts` passing).
4. Zen Quote / Afirmasi:
   - Editorial typography with generous breathing whitespace, centered layout, and elimination of garish purple/blue gradients or inline hardcoded colors.
5. Pilihan Hening (4 Structured Minimalist Card Rows replacing the 11 cluttered buttons):
   - Replace `<section className="quick-actions">` with 4 structured card rows using `.zen-feature-matrix` from `components.css`:
     * Row 1: Jurnal & Refleksi (`t('home.groupJournalTitle')`, `t('home.groupJournalDesc')`)
       - Jurnal (`/journal`) - `Book` icon - `t('home.actionJournal')`
       - Skrining Mandiri (`/assessment`) - `ClipboardCheck` icon - `t('home.actionAssessment')`
       - Edukasi (`/education`) - `BookOpen` icon - `t('home.actionEducation')`
     * Row 2: Regulasi Somatik (`t('home.groupSomaticTitle')`, `t('home.groupSomaticDesc')`)
       - Audio Brown Noise (`audioSomaticsService`) - `Headphones` icon - interactive toggle or audio somatics playback - `t('home.actionSoundscape')`
       - Latihan Napas (`/breathe`) - `Wind` icon - `t('home.actionBreathe')`
       - Grounding 5-4-3-2-1 (`/grounding`) - `Sparkles` icon - `t('home.actionGrounding')`
     * Row 3: Welas Asih & Koping (`t('home.groupCopingTitle')`, `t('home.groupCopingDesc')`)
       - Belas Kasih Diri (`setIsCftOpen(true)`) - `Heart` icon - `t('home.actionCft')`
       - TIPP Krisis (`/tipp`) - `Snowflake` icon - `t('home.actionTipp')`
       - Aktivasi Perilaku BA (`/activation`) - `Activity` icon - `t('home.actionActivation')`
     * Row 4: Jaring Pengaman & Bantuan (`t('home.groupSafetyTitle')`, `t('home.groupSafetyDesc')`)
       - Rencana Keselamatan (`/safety-plan`) - `Shield` icon - `t('home.actionSafetyPlan')`
       - Hotline 119 Ext 8 (`href="tel:119,8"`) - `PhoneCall` icon - `t('home.actionHotline')`
       - Rujukan Puskesmas/BPJS (`/professional-help`) - `Building2` icon - `t('home.actionReferral')`
6. Accessibility & Polish:
   - Ensure all touch targets measure >= 48px.
   - Zero Tailwind CSS — strictly pure vanilla CSS tokens.
   - Preserve all existing modals (`SelfCompassionModal`, language modal, `EscalationBanner`, Recharts chart).

VERIFICATION REQUIREMENTS:
Run:
1. `npm run lint` (0 errors, 0 warnings)
2. `npx tsc -b` (0 errors)
3. `npx vitest run` (41/41 test files, 411/411 tests passing)
4. `npm run build` (clean PWA production build)

Document your work in `handoff.md` in your working directory and notify parent orchestrator via send_message.
