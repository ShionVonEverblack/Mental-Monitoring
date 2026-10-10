# Handoff Report: i18n Catalogs, Accessibility & Test Infrastructure Survey

**Agent**: `explorer_survey_ui3`  
**Date**: 2026-10-10  
**Handoff Type**: Hard (Investigation & Analysis Complete)  
**Target File Analyzed**: `survey_i18n_tests.md`  

---

## 1. Observation

1. **i18n Catalogs (`src/i18n/*.json`)**:
   - 8 language catalog files exist in `src/i18n/`: `id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json` (`src/i18n/config.ts:5-12`).
   - All 8 files currently have ~1,263 lines and exact key parity enforced by `src/test/i18nParity.test.ts:51-71` (`extractAllDottedKeys` checks that `idKeys.size > 1000` with 0 missing and 0 extra keys across all languages).
   - The `home` namespace in `src/i18n/*.json` currently contains exactly 20 keys:
     - `greeting_morning`, `greeting_afternoon`, `greeting_evening`, `greeting_night`, `howAreYou`, `quickActions`, `recentMoods`, `streak`, `todayAffirmation`, `todayMood`, `feelingGood`, `education`, `daysStreak`, `moodLogged`, `writeJournal`, `viewForum`, `safetyPlan`, `meditate`, `sleepTracker`, `cftSelfCompassion`.
   - In `src/pages/Home.tsx`, several keys are invoked that do NOT exist in `src/i18n/*.json`, falling back to inline default parameters:
     - `t('home.grounding', 'Grounding 5-4-3-2-1')` (line 219)
     - `t('home.tippCrisis', 'TIPP Krisis')` (line 223)
     - `t('home.assessment', 'Skrining Mandiri')` (line 227)
     - `t('ba.homeAction', 'Aktivasi Perilaku (BA)')` (line 231)
     - `t('streak.recovery', 'Pemulihan')` (line 108)
     - `t('home.noMoodsYet', { defaultValue: 'Belum ada data mood untuk ditampilkan.' })` (line 294)

2. **RTL Direction Handling (`ar`)**:
   - `src/App.tsx:43`:
     ```typescript
     document.documentElement.dir = (lng && lng.startsWith('ar')) ? 'rtl' : 'ltr';
     document.documentElement.lang = lng || 'id';
     ```
   - In `src/test/phase2E2E.test.ts:521-529` and `src/test/i18nParity.test.ts:127-136`, tests verify `expect(document.documentElement.dir).toBe('rtl')`.
   - In `src/styles/`, there are currently 0 explicit `[dir="rtl"]` rules (`grep_search` returned 0 results).
   - In `Home.tsx:107`, streak recovery badge uses hardcoded `marginLeft: '4px'`, which physically expands leftward instead of toward the text in RTL layouts.

3. **Accessibility & Sensory Design Tokens**:
   - In `src/styles/design-tokens.css:118` and `index.css:32`, low-stimulation mode is selected exclusively via `[data-sensory='calm']`.
   - In `src/components/common/PageFallbackLoader.tsx:19` and its test `PageFallbackLoader.test.tsx:121-149`, `data-sensory="low-stimulation"` is also expected and tested.
   - In `src/styles/design-tokens.css:161`, calm light mode `--text-tertiary: hsl(215, 10%, 48%)` against `--bg-card: hsl(40, 25%, 98%)` yields a contrast ratio of 4.35:1, falling below WCAG 2.2 AA (4.5:1).
   - In `src/styles/components.css:72, 90-101`, `.btn-sm` and `.btn-icon` define `min-height: 44px` rather than `>= 48px`.

4. **Quality Verification Gates**:
   - `npm run lint` (`oxlint`): Clean, 0 warnings, 0 errors on 127 files (completed in 80ms).
   - `npx tsc -b`: Clean, 0 errors (completed in ~8.5s).
   - `npx vitest run`: Clean, 41 test files passed (41/41), 411 tests passed (411/411) (completed in 24.09s).
   - `npm run build`: Clean, generated 55 precache entries in `dist/` and PWA service worker `sw.js` (completed in ~10.5s).

---

## 2. Logic Chain

1. **Premise 1**: `src/test/i18nParity.test.ts` asserts that `extractAllDottedKeys(LOCALES[lang])` matches `idKeys` with 0 missing and 0 extra keys, and rejects any empty strings.
2. **Inference 1**: To add the 4 minimalist card groupings ("Pilihan Hening") to the Home screen without breaking tests, all newly introduced translation keys must be added to all 8 JSON files simultaneously with non-empty values.
3. **Premise 2**: Existing keys like `home.writeJournal`, `home.safetyPlan`, `home.meditate`, and `home.cftSelfCompassion` are referenced across other views (`TippCrisisHub.tsx`, `Assessment.tsx`, `Sidebar.tsx`).
4. **Inference 2**: Existing keys must not be renamed or deleted. New keys for group headings, group descriptions, and sub-actions must be added alongside existing keys.
5. **Premise 3**: In `design-tokens.css` and `index.css`, sensory rules only match `[data-sensory='calm']`, while components and test suites also specify `[data-sensory='low-stimulation']`.
6. **Inference 3**: To ensure full compliance with Requirement R3 and `PageFallbackLoader.tsx`, CSS selectors must be expanded to `[data-sensory='calm'], [data-sensory='low-stimulation']`.
7. **Premise 4**: In `Home.tsx:107`, inline style `marginLeft: '4px'` breaks symmetrical padding in Arabic RTL mode.
8. **Inference 4**: Adopting CSS logical properties (`margin-inline-start`) or Flexbox `gap` resolves RTL layout misalignment automatically.

---

## 3. Caveats

1. **Browser Native RTL Reversal**: Recharts `<BarChart>` does not automatically invert X-axis timestamps in RTL; however, clinical chronologies (past -> present) are standardly presented left-to-right even in RTL interfaces.
2. **Translation Nuance**: All 8-language translations were formulated according to psychiatric and calm-computing design principles, matching the tone and register of existing translations.

---

## 4. Conclusion

1. The current codebase is healthy and passing all 4 quality verification gates (0 lint errors, 0 type errors, 41/41 vitest test files passing, and clean PWA build).
2. The Home screen overhaul requires:
   - Adding 20 new translation keys across all 8 language JSON files (`survey_i18n_tests.md` Section 2.2).
   - Updating `src/styles/design-tokens.css` with minimalist palettes (#0C1017 dark, #F7F8FA light), subtle borders (0.06 alpha), dual `data-sensory` selectors (`calm` and `low-stimulation`), and fixing tertiary text contrast to >= 4.5:1.
   - Refactoring `src/pages/Home.tsx` to group the 11 buttons into the 4 structured minimalist cards with touch targets >= 48px and RTL-friendly logical styling.
   - Creating a dedicated unit test suite for Home screen minimalist cards and accessibility.

---

## 5. Verification Method

1. **Verify 8-Language Translation Parity**:
   ```bash
   npx vitest run src/test/i18nParity.test.ts
   ```
2. **Verify Full Quality Suite**:
   ```bash
   npm run lint
   npx tsc -b
   npx vitest run
   npm run build
   ```
3. **Invalidation Conditions**:
   - If `i18nParity.test.ts` fails, a key is missing or extra in one of the 8 languages, or contains an empty string.
   - If `npm run lint` fails, an oxlint rule violation was introduced.
   - If `npm run build` fails, a chunk size budget or syntax error occurred in Rollup.
