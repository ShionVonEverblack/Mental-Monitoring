# Handoff Report: Survey of RIMA Home Screen Architecture & Component Hierarchy (R2)

**Agent:** `teamwork_preview_explorer` (`explorer_survey_ui2`)  
**Task:** Survey RIMA's Home screen architecture, 11-button grid, 4 minimalist card rows mapping, and test suite.  
**Report Artifact:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_ui2\survey_home.md`  
**Working Directory:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_ui2\`  
**Date:** 2026-10-10  

---

## 1. Observation

### 1.1 Home Screen Structure & 11-Button Grid (`src/pages/Home.tsx`)
In `src/pages/Home.tsx` lines 200–245:
```tsx
<section className="quick-actions">
  <button className="quick-action-btn journal" onClick={() => navigate('/journal')}>
    <Book className="action-icon" />
    <span>{t('home.writeJournal', 'Tulis Jurnal')}</span>
  </button>
  <button className="quick-action-btn forum" onClick={() => navigate('/forum')}>
    <MessageCircle className="action-icon" />
    <span>{t('home.viewForum', 'Lihat Forum')}</span>
  </button>
  <button className="quick-action-btn safety" onClick={() => navigate('/safety-plan')}>
    <Heart className="action-icon" />
    <span>{t('home.safetyPlan', 'Rencana Keselamatan')}</span>
  </button>
  <button className="quick-action-btn meditate" onClick={() => navigate('/breathe')}>
    <Wind className="action-icon" />
    <span>{t('home.meditate', 'Latihan Napas')}</span>
  </button>
  <button className="quick-action-btn grounding" onClick={() => navigate('/grounding')}>
    <Sparkles className="action-icon" />
    <span>{t('home.grounding', 'Grounding 5-4-3-2-1')}</span>
  </button>
  <button className="quick-action-btn tipp" onClick={() => navigate('/tipp')}>
    <Snowflake className="action-icon" />
    <span>{t('home.tippCrisis', 'TIPP Krisis')}</span>
  </button>
  <button className="quick-action-btn assessment" onClick={() => navigate('/assessment')}>
    <ClipboardCheck className="action-icon" />
    <span>{t('home.assessment', 'Skrining Mandiri')}</span>
  </button>
  <button className="quick-action-btn activation" onClick={() => navigate('/activation')}>
    <Activity className="action-icon" />
    <span>{t('ba.homeAction', 'Aktivasi Perilaku (BA)')}</span>
  </button>
  <button className="quick-action-btn sleep" onClick={() => navigate('/sleep')}>
    <MoonStar className="action-icon" />
    <span>{t('home.sleepTracker', 'Buku Harian Tidur')}</span>
  </button>
  <button className="quick-action-btn education" onClick={() => navigate('/education')}>
    <BookOpen className="action-icon" />
    <span>{t('home.education', 'Edukasi')}</span>
  </button>
  <button className="quick-action-btn cft" onClick={() => setIsCftOpen(true)}>
    <Heart className="action-icon" style={{ color: 'var(--color-primary)' }} />
    <span>{t('home.cftSelfCompassion', 'Belas Kasih Diri')}</span>
  </button>
</section>
```
In `src/styles/index.css` line 276–285:
- `.quick-actions` uses `display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px;`
- `.quick-action-btn` uses `display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);`
- Colors are scattered across diverse hues (journal primary blue, forum green, safety red, meditate purple, activation light blue, sleep indigo).

### 1.2 Header Hening, Mood Selector, Whisper Nudge, and Zen Affirmation
- **Header Hening (`src/pages/Home.tsx:76-113`):**
  - Sapaan: `getGreeting(currentLang)` dynamically produces time-based greetings across all 8 languages.
  - Streak badge: `.streak-badge` with `Flame` icon, styled with bright orange hue `hsla(35, 75%, 60%, 0.12)`.
  - Language button: `home-lang-btn` trigger opening `showLangModal`.
- **Fluid Mood Check-In (`src/pages/Home.tsx:149-161`):**
  - Uses `MoodSelector` (5 discrete emojis, scores 1-5).
  - When logged: shows a large 3rem emoji in `mood-logged-card`.
  - Yale Mood Meter 2D (`MoodMeterCanvas.tsx`) exists in `src/components/ui/MoodMeterCanvas.tsx` and is currently only utilized on the `/mood` page (`MoodTracker.tsx`).
- **Whisper Nudge (`src/pages/Home.tsx:165`):**
  - Rendered by `<JitaiNudgeCard />` (`src/components/common/JitaiNudgeCard.tsx`).
  - Reads from `useJitai()` hook (`evaluateJitai`), with dismiss handling via `dismissNudgeToday()`.
  - Verified tested by `JitaiNudgeCard.test.tsx` (10 tests) and `phase2E2E.test.ts` (57 tests).
- **Zen Quote / Afirmasi (`src/pages/Home.tsx:167-178`):**
  - Wrapped in `.affirmation-card` with gradient background `linear-gradient(135deg, hsla(270, 50%, 65%, 0.15), hsla(215, 65%, 55%, 0.1))` and inline override `backgroundColor: 'var(--color-primary-soft)'`.

### 1.3 Available Sub-services for New Row Integrations
- `src/components/somatics/SoundscapePlayer.tsx` & `src/services/audioSomaticsService.ts`:
  - `audioSomatics` singleton synthesized via Web Audio API. Presets include `brown_noise` ("Brownian Noise").
- `src/components/safety/FastActionSafetyCard.tsx` & `src/services/safetyCardService.ts`:
  - Direct Indonesian emergency crisis line: `tel:119,8` (`HOTLINE_119`).
- `src/pages/ProfessionalHelp.tsx` (`/professional-help`):
  - BPJS and Puskesmas medical referral directory already established in routes.

### 1.4 Test Suite Status
- Command executed: `npx vitest run`
- Output: `Test Files: 41 passed (41)`, `Tests: 411 passed (411)`.
- Verification of test files: There is **no dedicated test file for Home** (e.g. `src/pages/__tests__/Home.test.tsx` is absent).
- Translation validation: `src/test/i18nParity.test.ts` asserts 100% key parity and non-empty values across all 8 locales (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).

---

## 2. Logic Chain

1. **Premise:** The user requested a total UI/UX overhaul of RIMA into world-class minimalist design (Zen Monastic and Apple Health Wellbeing), pruning visual pollution and replacing the 11 cluttered box buttons with 4 structured card rows:
   - Row 1: Jurnal & Refleksi (Jurnal, Skrining Mandiri, Edukasi)
   - Row 2: Regulasi Somatik (Audio Brown Noise, Latihan Napas, Grounding)
   - Row 3: Welas Asih & Koping (Self-Compassion CFT, TIPP Krisis, Aktivasi BA)
   - Row 4: Jaring Pengaman & Bantuan (Safety Plan, 119 Ext 8, Rujukan Puskesmas/BPJS)
2. **Current State:** `Home.tsx` currently renders a 2-column grid of 11 discrete, colorful buttons without therapeutic category boundaries.
3. **Harmonious Mapping:**
   - **Row 1 (Jurnal & Refleksi):** Maps Button 1 (`/journal`), Button 7 (`/assessment`), and Button 10 (`/education`).
   - **Row 2 (Regulasi Somatik):** Integrates procedural offline Audio Brown Noise (`audioSomaticsService`), maps Button 4 (`/breathe`), and Button 5 (`/grounding`).
   - **Row 3 (Welas Asih & Koping):** Maps Button 11 (`setIsCftOpen(true)`), Button 6 (`/tipp`), and Button 8 (`/activation`).
   - **Row 4 (Jaring Pengaman & Bantuan):** Maps Button 3 (`/safety-plan`), integrates direct 119 Ext 8 hotline action (`tel:119,8`), and links BPJS/Puskesmas referral (`/professional-help`).
   - **Navigation Preservation:** Forum (`/forum`) and Sleep Tracker (`/sleep`) remain intact through global bottom/sidebar navigation and JITAI adaptive touchpoints.
4. **Safety & Test Resilience:**
   - Since `Home.tsx` currently lacks a dedicated test file, implementing the new layout without a test suite poses a regression risk. A new unit/integration test suite (`src/pages/__tests__/Home.test.tsx`) must be created to verify all 4 rows, touch targets >= 48px, greeting, mood check-in, and modal triggers.
   - Any new translation keys added to `id.json` must be mirrored across all 8 languages to satisfy `test/i18nParity.test.ts`.

---

## 3. Caveats

- **Audio Playback in Test Environment (jsdom):** `audioSomaticsService.ts` contains built-in fallbacks when Web Audio API is unmocked in jsdom, but unit tests asserting audio triggers on Home should verify toggle state changes cleanly.
- **Tel URI Testing:** Clicking `<a href="tel:119,8">` in Vitest jsdom does not trigger actual phone calls; tests should assert the `href="tel:119,8"` attribute.
- **Recharts Rendering:** Recharts `<ResponsiveContainer>` warns in headless jsdom if dimensions are 0; mocking or wrapping in dimensions is standard practice in RIMA tests.

---

## 4. Conclusion

1. The architecture of `src/pages/Home.tsx` has been surveyed in detail and documented in `survey_home.md`.
2. The 11-button grid can be replaced cleanly with the 4 structured minimalist card rows (Pilihan Hening) with zero loss of feature access.
3. The Whisper Nudge (`JitaiNudgeCard`) and Header Hening can be refined with subtle Zen tokens while maintaining 100% test compatibility.
4. A concrete blueprint for `src/pages/__tests__/Home.test.tsx` is defined to lock down quality gates before and during implementation.

---

## 5. Verification Method

To verify the findings of this survey independently:
1. View the survey report:
   ```pwsh
   Get-Content "C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_ui2\survey_home.md"
   ```
2. Run the existing test suite:
   ```pwsh
   cd "C:\Users\Hype\Kuliah\Proyekan\mental monitoring"
   npx vitest run
   ```
3. Verify lack of `Home.test.tsx`:
   ```pwsh
   Test-Path "C:\Users\Hype\Kuliah\Proyekan\mental monitoring\src\pages\__tests__\Home.test.tsx"
   ```
4. Verify translation parity:
   ```pwsh
   npx vitest run src/test/i18nParity.test.ts
   ```
