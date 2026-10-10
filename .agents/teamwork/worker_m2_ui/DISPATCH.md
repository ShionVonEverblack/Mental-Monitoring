## 2026-10-10T12:24:22Z
You are a teamwork_preview_worker agent for RIMA (Ruang Interaksi Mental Aman).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2_ui\
Your parent orchestrator conversation ID is: 5862a47f-00e3-4df8-aff9-4054c18b7e28
The Project directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring

MANDATORY FIRST STEPS:
1. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (especially under header ## 2026-10-10T12:06:32Z).
2. Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md.
3. Read the survey report at C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_ui3\survey_i18n_tests.md (specifically Section 2: Proposed Translation Keys and complete 8-language dictionary table).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own and may edit the following files ONLY:
- `src/i18n/id.json`
- `src/i18n/en.json`
- `src/i18n/jv.json`
- `src/i18n/su.json`
- `src/i18n/ja.json`
- `src/i18n/zh.json`
- `src/i18n/es.json`
- `src/i18n/ar.json`
Do NOT modify any other files.

OBJECTIVE — MILESTONE M2: 8-Language Translation Parity & Localization
Add the new minimalist keys to the `home` namespace across all 8 language catalogs with 100% exact parity, zero missing keys, zero empty strings.

The 20 keys to add under `"home"` namespace:
1. `editorialTitle`
2. `editorialSubtitle`
3. `quietChoices`
4. `streakRecovery`
5. `noMoodsYet`
6. `zenAffirmation`
7. `openModule`
8. `groupJournalTitle`
9. `groupJournalDesc`
10. `actionJournal`
11. `actionAssessment`
12. `actionEducation`
13. `groupSomaticTitle`
14. `groupSomaticDesc`
15. `actionSoundscape`
16. `actionBreathe`
17. `actionGrounding`
18. `groupCopingTitle`
19. `groupCopingDesc`
20. `actionCft`
21. `actionTipp`
22. `actionActivation`
23. `groupSafetyTitle`
24. `groupSafetyDesc`
25. `actionSafetyPlan`
26. `actionHotline`
27. `actionReferral`

(Use the precise translations from `survey_i18n_tests.md` § 2.2 for all 8 languages: id, en, jv, su, ja, zh, es, ar. Also retain all existing keys without deleting or mutating them).

VERIFICATION REQUIREMENTS:
Run:
1. `npx vitest run src/test/i18nParity.test.ts` (MUST pass 100% with 0 missing keys, 0 extra keys, 0 empty strings)
2. `npm run lint` (0 errors, 0 warnings)
3. `npx tsc -b` (0 errors)
4. `npx vitest run` (all 41 test files passing)
5. `npm run build` (clean PWA production build)

Document commands and results in `handoff.md` in your working directory and notify parent via send_message.
