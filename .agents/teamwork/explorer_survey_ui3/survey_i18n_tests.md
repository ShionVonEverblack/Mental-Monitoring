# RIMA Architectural & Quality Survey: i18n Catalogs, Accessibility & Test Infrastructure

**Survey Date**: 2026-10-10  
**Surveyor**: `teamwork_preview_explorer` (`explorer_survey_ui3`)  
**Scope**: i18n translation catalogs (all 8 languages), WCAG 2.2 AA / Sensory requirements, RTL handling, and Quality Verification Gates.

---

## Executive Summary

RIMA (Ruang Interaksi Mental Aman) features an exceptionally disciplined architecture:
1. **8 Supported Languages**: `id` (Indonesian - default), `en` (English), `jv` (Javanese), `su` (Sundanese), `ja` (Japanese), `zh` (Simplified Chinese), `es` (Spanish), and `ar` (Arabic with RTL support).
2. **Translation Parity Gate**: Enforced by `src/test/i18nParity.test.ts`, which validates 100% key parity against `id.json` with **0 missing keys, 0 extra keys, and 0 empty strings**.
3. **Four-Tier Quality Verification Gates**:
   - `npm run lint` (`oxlint`): Clean (0 errors, 0 warnings across 127 files).
   - `npx tsc -b`: Clean (0 type errors).
   - `npx vitest run`: 41 test files, 411 tests passing 100%.
   - `npm run build`: Production build with Rollup chunk partitioning and Workbox PWA precache (55 entries).
4. **Key UI Overhaul Needs**:
   - The Home screen currently renders 11 colorful, stacked quick-action buttons that create visual fatigue.
   - Several button labels in `Home.tsx` currently rely on fallback strings because their keys do not exist in the i18n catalogs (e.g. `home.grounding`, `home.tippCrisis`, `home.assessment`, `ba.homeAction`).
   - Grouping these into the 4 minimalist cards ("Pilihan Hening") requires new, synchronized translation keys in all 8 languages.
   - Dual sensory mode attributes (`data-sensory="calm"` vs `data-sensory="low-stimulation"`) need harmonization in CSS selectors.

---

## 1. Deep Dive: i18n Catalogs (`src/i18n/*.json`)

### 1.1 Existing Catalog Architecture
- Configuration: `src/i18n/config.ts` using `i18next`, `react-i18next`, and `i18next-browser-languagedetector`.
- Locales catalog files:
  - `src/i18n/id.json` (Indonesian, ~1,263 lines, reference source of truth)
  - `src/i18n/en.json` (English)
  - `src/i18n/jv.json` (Javanese)
  - `src/i18n/su.json` (Sundanese)
  - `src/i18n/ja.json` (Japanese)
  - `src/i18n/zh.json` (Simplified Chinese)
  - `src/i18n/es.json` (Spanish)
  - `src/i18n/ar.json` (Arabic)
- Rollup bundle partitioning: `vite.config.ts` splits locales into a dedicated `i18n-locales` chunk (~567 kB, 211 kB gzip) precached by Workbox for offline PWA operation.

### 1.2 Existing Keys in `home` Namespace
In all 8 locale files, `home` currently contains 20 keys:
```json
{
  "greeting_morning": "...",
  "greeting_afternoon": "...",
  "greeting_evening": "...",
  "greeting_night": "...",
  "howAreYou": "...",
  "quickActions": "...",
  "recentMoods": "...",
  "streak": "...",
  "todayAffirmation": "...",
  "todayMood": "...",
  "feelingGood": "...",
  "education": "...",
  "daysStreak": "...",
  "moodLogged": "...",
  "writeJournal": "...",
  "viewForum": "...",
  "safetyPlan": "...",
  "meditate": "...",
  "sleepTracker": "...",
  "cftSelfCompassion": "..."
}
```

### 1.3 Audit of Current `Home.tsx` Missing Translation Keys
In `src/pages/Home.tsx`, several translation keys are invoked that **do not exist** in any `src/i18n/*.json` file, falling back to default Indonesian strings:
1. `home.grounding` (used in line 219, fallback `'Grounding 5-4-3-2-1'`; also used in `SleepTracker.tsx:185`)
2. `home.tippCrisis` (used in line 223, fallback `'TIPP Krisis'`)
3. `home.assessment` (used in line 227, fallback `'Skrining Mandiri'`)
4. `ba.homeAction` (used in line 231, fallback `'Aktivasi Perilaku (BA)'`)
5. `streak.recovery` (used in line 108, fallback `'Pemulihan'`)
6. `home.noMoodsYet` (used in line 294, fallback `'Belum ada data mood untuk ditampilkan.'`)

*Architectural Rule*: The existing keys (`home.writeJournal`, `home.viewForum`, `home.safetyPlan`, `home.meditate`, etc.) are also imported and referenced in other files (e.g. `TippCrisisHub.tsx`, `Assessment.tsx`, `Grounding.tsx`, `Sidebar.tsx`). Therefore, **never delete existing keys**; instead, append the new structured keys to ensure backwards compatibility and 100% test passing.

---

## 2. Proposed Translation Keys for the 4 Minimalist Card Groupings & Editorial Elements

To fulfill Requirement R2 ("Pilihan Hening", replacing 11 cluttered buttons with 4 calm, structured card groupings), the following new keys are designed. They must be added across **all 8 locale files simultaneously**:

### 2.1 Proposed Key Structure (`home` namespace)
```json
{
  "editorialTitle": "...",
  "editorialSubtitle": "...",
  "quietChoices": "...",
  "streakRecovery": "...",
  "noMoodsYet": "...",
  "zenAffirmation": "...",
  "openModule": "...",

  "groupJournalTitle": "...",
  "groupJournalDesc": "...",
  "actionJournal": "...",
  "actionAssessment": "...",
  "actionEducation": "...",

  "groupSomaticTitle": "...",
  "groupSomaticDesc": "...",
  "actionSoundscape": "...",
  "actionBreathe": "...",
  "actionGrounding": "...",

  "groupCopingTitle": "...",
  "groupCopingDesc": "...",
  "actionCft": "...",
  "actionTipp": "...",
  "actionActivation": "...",

  "groupSafetyTitle": "...",
  "groupSafetyDesc": "...",
  "actionSafetyPlan": "...",
  "actionHotline": "...",
  "actionReferral": "..."
}
```

### 2.2 Complete 8-Language Translation Parity Dictionary

| Key | Indonesian (`id`) | English (`en`) | Javanese (`jv`) | Sundanese (`su`) |
| :--- | :--- | :--- | :--- | :--- |
| `editorialTitle` | Pilihan Hening | Mindful Spaces | Pilihan Hening | Pilihan Hening |
| `editorialSubtitle` | Ruang pemulihan bertahap sesuai ritme batinmu | Gentle restoration at your own natural pace | Papan pamulihan alon-alon manut laras batin | Rohangan pamulihan laun-laun luyu wirahma batin |
| `quietChoices` | Ruang Pemulihan | Restorative Spaces | Papan Katentreman | Rohangan Katengtreman |
| `streakRecovery` | Pemulihan | Recovery | Pamulihan | Pamulihan |
| `noMoodsYet` | Belum ada data mood untuk ditampilkan. | No mood records to display yet. | Dereng wonten cathetan mood ingkang dipun pintonaken. | Teu acan aya catetan raraosan anu dipintonkeun. |
| `zenAffirmation` | Renungan & Afirmasi | Reflection & Affirmation | Renungan & Afirmasi | Renungan & Afirmasi |
| `openModule` | Buka | Open | Bikak | Buka |
| `groupJournalTitle` | Jurnal & Refleksi | Journal & Reflection | Jurnal & Refleksi | Jurnal & Réfléksi |
| `groupJournalDesc` | Ruang mencatat rasa, skrining mandiri, dan literasi emosi | Express feelings, track self-evaluations, and build emotional literacy | Papan nyerat raos, skrining mandiri, lan kawruh katentreman batin | Rohangan nyatet rasa, pamariksaan mandiri, sareng élmu katengtreman |
| `actionJournal` | Tulis Jurnal | Mindful Journal | Serat Jurnal | Serat Jurnal |
| `actionAssessment` | Skrining Mandiri | Self-Screening | Skrining Mandiri | Pamariksaan Mandiri |
| `actionEducation` | Edukasi Jiwa | Mental Health Education | Edukasi Jiwa | Édukasi Jiwa |
| `groupSomaticTitle` | Regulasi Somatik | Somatic Regulation | Regulasi Somatik | Régulasi Somatik |
| `groupSomaticDesc` | Tenangkan detak jantung dan ketegangan sensorik tubuh | Settle heart rate and sensory tension with body-based techniques | Ngedhemaken deg-deganing manah lan ketegangan sarap raga | Tengtremkeun ratug jajantung sareng ketegangan indra raga |
| `actionSoundscape` | Audio Relaksasi | Soundscape & Brown Noise | Swanten Panenang | Sora Panenang |
| `actionBreathe` | Latihan Napas | Breathwork | Latihan Ambegan | Latihan Ambegan |
| `actionGrounding` | Grounding 5-4-3-2-1 | 5-4-3-2-1 Grounding | Grounding 5-4-3-2-1 | Grounding 5-4-3-2-1 |
| `groupCopingTitle` | Welas Asih & Koping | Compassion & Coping | Welas Asih & Koping | Asih ka Diri & Koping |
| `groupCopingDesc` | Rangkul kerentanan diri, redakan krisis akut, dan ambil tindakan kecil | Embrace personal vulnerability, de-escalate crisis, and take valued actions | Nampi rasa ringkih, ngleremaken krisis, lan nindakaken samukawis migunani | Nampa karéngkohan diri, ngurangan krisis, sareng ngalengkah dina amal saé |
| `actionCft` | Belas Kasih Diri | Self-Compassion (CFT) | Welas Asih Marang Awak | Nyaah ka Diri Salira |
| `actionTipp` | TIPP Krisis | TIPP Crisis Skills | TIPP Krisis | TIPP Krisis |
| `actionActivation` | Aktivasi Perilaku (BA) | Behavioral Activation (BA) | Aktivasi Tumindak (BA) | Aktivasi Paripolah (BA) |
| `groupSafetyTitle` | Jaring Pengaman & Bantuan | Safety Net & Support | Jaring Kaslametan & Bantuan | Jaring Kasalametan & Bantuan |
| `groupSafetyDesc` | Rencana keselamatan, saluran darurat cepat, dan rujukan faskes resmi | Personalized safety plan, rapid crisis hotlines, and healthcare referrals | Rancangan kaslametan, nomer darurat gancang, lan rujukan faskes resmi | Rancangan kasalametan, nomer darurat gancang, sareng rujukan faskes resmi |
| `actionSafetyPlan` | Rencana Keselamatan | Safety Plan | Rancangan Kaslametan | Rancangan Kasalametan |
| `actionHotline` | Hotline 119 Ext 8 | Hotline 119 Ext 8 | Hotline 119 Ext 8 | Hotline 119 Ext 8 |
| `actionReferral` | Rujukan Puskesmas & BPJS | BPJS / Clinic Referral | Rujukan Puskesmas & BPJS | Pituduh Faskes BPJS |

*(Table continued for Japanese, Chinese, Spanish, Arabic)*

| Key | Japanese (`ja`) | Chinese (`zh`) | Spanish (`es`) | Arabic (`ar`) |
| :--- | :--- | :--- | :--- | :--- |
| `editorialTitle` | 静寂の選択 | 静心精选 | Espacios de Calma | خيارات السكينة |
| `editorialSubtitle` | 心のペースに寄り添う、穏やかな回復の空間 | 顺应内在节奏的温和复原空间 | Espacios de restauración gradual al compás de tu bienestar | مساحات تعافٍ تدريجية تواكب وتيرة نفسك الطبيعية |
| `quietChoices` | 回復のための空間 | 疗愈修养空间 | Espacios de Recuperación | مساحات السكينة والتعافي |
| `streakRecovery` | リカバリー | 复原中 | Recuperación | تعافٍ |
| `noMoodsYet` | 表示する気分の記録がまだありません。 | 暂无心情记录可供展示。 | Aún no hay registros de ánimo para mostrar. | لا توجد سجلات مزاجية لعرضها بعد. |
| `zenAffirmation` | 静寂のアファメーション | 静心肯定语 | Afirmación Silenciosa | توكيد السكينة |
| `openModule` | 開く | 开启 | Abrir | فتح |
| `groupJournalTitle` | ジャーナルと内省 | 日记与心绪反思 | Diario y Reflexión | اليوميات والتأمل الذاتي |
| `groupJournalDesc` | 感情を言葉にし、自己評価を見守り、心の気づきを深める | 书写内心感受、心理状态筛查与情绪健康认知 | Expresa tus emociones, evalúa tu bienestar y comprende tu mente | مساحة لتدوين المشاعر، والتقييم الذاتي، واكتساب الوعي النفسي |
| `actionJournal` | マインドフル日記 | 写日记 | Escribir Diario | كتابة اليوميات |
| `actionAssessment` | セルフスクリーニング | 自测量表 | Autoevaluación | التقييم الذاتي |
| `actionEducation` | こころの学び | 心理科普 | Educación Mental | التثقيف النفسي |
| `groupSomaticTitle` | 身体調律・ソマティック | 身体调节与感官抚慰 | Regulación Somática | التنظيم الجسدي والحسي |
| `groupSomaticDesc` | 身体からのアプローチで心拍と神経の高ぶりを穏やかに整える | 平缓呼吸节律、五感着陆练习与平静白噪音 | Armoniza tu ritmo cardíaco y calma la tensión con técnicas corporales | تناغم وتيرة التنفس، وتمارين التثبيت الحسي، والأصوات المهدئة |
| `actionSoundscape` | 安らぎの音響 | 疗愈声景 | Audio Relajante | الأصوات المهدئة |
| `actionBreathe` | 呼吸法エクササイズ | 呼吸与正念 | Ejercicios de Respiración | تمارين التنفس |
| `actionGrounding` | 5-4-3-2-1 グラウンディング | 5-4-3-2-1 五感着陆 | Anclaje 5-4-3-2-1 | التثبيت الحسي 5-4-3-2-1 |
| `groupCopingTitle` | 慈悲とコーピング | 自我关怀与应对技能 | Compasión y Afrontamiento | الشفقة على الذات والتكيف |
| `groupCopingDesc` | 自分への優しさを育み、急性危機を和らげ、小さな前進を重ねる | 温柔接纳脆弱、缓解急性情绪风暴并实践微小行动 | Abraza la vulnerabilidad, disipa crisis y da pequeños pasos con propósito | ممارسات اللطف بالنفس، ومهارات TIPP، وخطوات التفعيل السلوكي |
| `actionCft` | セルフ・コンパッション | 自我关怀 (CFT) | Autocompasión (CFT) | الشفقة على الذات (CFT) |
| `actionTipp` | TIPP 危機緩和スキル | TIPP 危机急救 | Habilidades TIPP | مهارات TIPP للأزمات |
| `actionActivation` | 行動活性化 (BA) | 行为激活疗法 (BA) | Activación Conductual | التنشيط السلوكي (BA) |
| `groupSafetyTitle` | セーフティネットと支援 | 安全防护与专业援助 | Red de Seguridad y Ayuda | شبكة الأمان والدعم النفسي |
| `groupSafetyDesc` | 危機防止プラン、緊急ダイヤル、公的医療機関への紹介ガイド | 危机安全计划、快捷紧急求助与正规公立就诊转诊指南 | Plan de seguridad, líneas de auxilio y derivación profesional | الاتصال الطارئ الفوري، وخطة الأمان، وإرشادات التحويل الطبي |
| `actionSafetyPlan` | 安全行動計画 | 安全计划 | Plan de Seguridad | خطة الأمان |
| `actionHotline` | 相談ホットライン 119-8 | 求助热线 119-8 | Línea de Crisis 119 Ext 8 | الخط الساخن 119 تحويلة 8 |
| `actionReferral` | 地域診療所・保険適用紹介 | 社区诊所与医保转诊 | Derivación Puskesmas / BPJS | دليل التحويل الطبي (BPJS) |

---

## 3. RTL Handling Analysis for Arabic (`ar`)

### 3.1 Mechanism
- Trigger: In `src/App.tsx`, lines 41–57:
  ```typescript
  const updateDirAndLang = (lng: string) => {
    document.documentElement.dir = (lng && lng.startsWith('ar')) ? 'rtl' : 'ltr';
    document.documentElement.lang = lng || 'id';
  };
  ```
- Validation: Verified by `src/test/phase2E2E.test.ts` (lines 517–530, 818–830) and `src/test/i18nParity.test.ts` (lines 127–136).

### 3.2 Visual & Layout Assessment
1. **Flexbox & CSS Grid Flow**: Native CSS Flexbox and Grid automatically flip direction when `dir="rtl"` is applied on `<html>`. The 4-card stack and grid layouts adapt seamlessly.
2. **Identified RTL Defect in Current `Home.tsx`**:
   - In `Home.tsx` line 107: `style={{ marginLeft: '4px' }}` for the streak recovery tag. In RTL, `margin-left` forces space on the physical left, which pushes it outwards rather than inwards next to the streak text.
   - *Fix*: Use CSS logical properties `marginInlineStart: '4px'` or use flexbox `gap: 6px`.
3. **Card Headers & Editorial Typography**:
   - Ensure card headers and text blocks use `text-align: start` rather than `text-align: left` so Arabic text aligns naturally to the right.
   - Arrow/Chevron icons (`lucide-react` `ChevronRight` or `ArrowRight`) should flip (`transform: scaleX(-1)`) under `[dir="rtl"]` if indicating forward progression.

---

## 4. Accessibility & Sensory Compliance Survey (WCAG 2.2 AA)

### 4.1 Contrast Ratio (WCAG 2.2 SC 1.4.3 >= 4.5:1)
An audit of `src/styles/design-tokens.css` reveals:
- **Dark Mode (Default & Proposed Obsidian)**:
  - Background: `#0C1017` / `#111418` (`hsl(220, 25%, 10%)`)
  - Primary Text: `hsl(0, 0%, 95%)` (`#F2F2F2`) -> **Contrast ratio ~17.5:1** (Exceeds 4.5:1, passes AAA).
  - Secondary Text: `hsl(0, 0%, 75%)` (`#BFBFBF`) -> **Contrast ratio ~9.2:1** (Passes AAA).
  - Tertiary Text: `hsl(0, 0%, 68%)` (`#ADADAD`) -> **Contrast ratio ~7.2:1** (Passes AA).
- **Light Mode (Warm Porcelain / Linen)**:
  - Background: `#F7F8FA` (`hsl(220, 30%, 97%)`)
  - Primary Text: `hsl(220, 30%, 15%)` (`#1B2129`) -> **Contrast ratio ~13.8:1** (Passes AAA).
  - Secondary Text: `hsl(220, 15%, 35%)` (`#4C5766`) -> **Contrast ratio ~6.5:1** (Passes AA).
  - Tertiary Text: `hsl(220, 15%, 40%)` (`#576373`) -> **Contrast ratio ~5.2:1** (Passes AA).
- **Sensory Calm Light Mode Warning**:
  - In `design-tokens.css` line 161: `--text-tertiary: hsl(215, 10%, 48%);` against `--bg-card: hsl(40, 25%, 98%)` produces a contrast ratio of **4.35:1**, which is marginally below the 4.5:1 threshold.
  - *Recommendation*: Darken `--text-tertiary` in calm light mode to `hsl(215, 10%, 42%)` (contrast ratio **5.3:1**).

### 4.2 Touch Target Sizing (WCAG 2.2 SC 2.5.8 >= 48px)
- The WCAG 2.2 minimum standard requires 24px, but psychiatric/calm user interface standards (and project criteria) require **>= 48px** to prevent accidental mis-taps during tremor, acute anxiety, or cognitive constriction.
- **Audit Findings**:
  - Primary buttons (`.btn`): `min-height: 48px` (Compliant).
  - Compact buttons (`.btn-sm`): specifies `min-height: 44px` in `components.css:72` (4px shy of 48px).
  - Icon buttons (`.btn-icon`): specifies `min-width: 44px; min-height: 44px` in `components.css:90-101`.
  - Language picker (`.home-lang-btn`): currently has `padding: 6px 12px` without a min-height constraint.
  - Bottom navigation items (`.bottom-nav-item`): takes `height: 64px` (Compliant).
- *Action for Minimalist Cards*:
  Each card row and sub-feature button within the 4 groupings must maintain a minimum bounding box of **>= 48px height and full clickable width**, with at least 8px spacing between touch targets.

### 4.3 Low-Stimulation Sensory Mode & Reduced Motion
- **Discovered Inconsistency**:
  - `useTheme.ts:31` sets `document.documentElement.setAttribute('data-sensory', 'calm')`.
  - `PageFallbackLoader.tsx` and its tests (`PageFallbackLoader.test.tsx`) support both `data-sensory="low-stimulation"` and `data-sensory="calm"`.
  - However, in `design-tokens.css` (lines 118 & 152) and `index.css` (line 32), the rules **only match `[data-sensory='calm']`**.
  - *Required Fix*: Update selectors in `design-tokens.css` and `index.css` to:
    ```css
    [data-sensory='calm'], [data-sensory='low-stimulation'] { ... }
    [data-sensory='calm'][data-theme='light'], [data-sensory='low-stimulation'][data-theme='light'] { ... }
    ```
- **Motion Reduction**:
  - `index.css` already provides:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```
  - Recharts `<BarChart>` on Home: Add `isAnimationActive={false}` when `prefers-reduced-motion` is active or under low-stimulation mode to eliminate sensory bar bounce.

---

## 5. Quality Verification Suite & Test Infrastructure

### 5.1 Verification Commands and Current Health

| Verification Gate | Command | Execution Time | Current Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Lint** | `npm run lint` | ~80 ms | **PASS (0 err, 0 warn)** | `oxlint` across 127 files with 104 rules |
| **Type Check** | `npx tsc -b` | ~8.5 s | **PASS (0 err)** | Strict TypeScript compilation |
| **Unit & Integration Tests** | `npx vitest run` | ~24.1 s | **PASS (41/41 files, 411/411 tests)** | Zero failures across full suite |
| **Production Build** | `npm run build` | ~10.5 s | **PASS** | Vite + Rollup chunking + PWA SW precaching |

### 5.2 Test File Inventory Related to Home, Navigation, and UI Styling

1. **`src/test/i18nParity.test.ts`**:
   - Crucial quality gate. Tests 100% exact parity across all 8 languages, absence of empty strings, and RTL direction assignment.
   - Any modification to `id.json` will be verified here.
2. **`src/test/phase2E2E.test.ts`**:
   - 4-Tier integration suite testing JITAI rules, Fast-Action Emergency Safety Card, RTL Arabic toggling, and emergency dialing.
3. **`src/test/adversarialChallenger1.test.tsx`**:
   - Adversarial stress tests for JITAI nudge cards, anti-habituation boundaries, and phone sanitization.
4. **`src/components/__tests__/JitaiNudgeCard.test.tsx`**:
   - Tests whisper nudge rendering, single-tap navigation, and dismissal persistence.
5. **`src/components/__tests__/FastActionSafetyCard.test.tsx`**:
   - Tests emergency modal opening, single-tap de-escalation steps, and 119 Ext 8 hotline links.
6. **`src/components/__tests__/MoodTracker.test.tsx` & `MoodMeterCanvas.test.tsx`**:
   - Tests mood selection, 2D Yale Mood Meter quadrant rendering, and chart updates.
7. **`src/components/__tests__/PageFallbackLoader.test.tsx`**:
   - Tests trauma-informed skeleton loader and `data-sensory` attribute reactivity.
8. **`src/hooks/__tests__/useTheme.test.ts` & `src/components/__tests__/Profile.test.tsx`**:
   - Tests theme switching (dark/light) and sensory mode toggling.

---

## 6. Synthesis & Recommended Implementation Plan

1. **Phase A: i18n Catalog Expansion (Zero-Regression)**:
   - Add the 20 new minimalist keys into all 8 locale files (`id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`).
   - Run `npx vitest run src/test/i18nParity.test.ts` to guarantee 100% parity before touching any component.
2. **Phase B: Design Tokens & Sensory Dual-Selector Fix**:
   - In `src/styles/design-tokens.css`, introduce minimalist dark obsidian (`#0C1017`) and linen (`#F7F8FA`) palettes, whisper-thin borders (`0.06`), and soft elevations.
   - Add `[data-sensory='low-stimulation']` alongside `[data-sensory='calm']`.
   - Adjust tertiary text contrast in light calm mode to `>= 4.5:1`.
3. **Phase C: Screen Re-architecture (`Home.tsx`)**:
   - Replace the 11 quick-action buttons with 4 clean, editorial card groupings.
   - Replace hardcoded `marginLeft: '4px'` with logical CSS or flex gap for RTL Arabic compatibility.
   - Ensure all touch targets measure `>= 48px`.
4. **Phase D: Quality Gate Validation**:
   - Run all 4 verification commands: `npm run lint`, `npx tsc -b`, `npx vitest run`, `npm run build`.
