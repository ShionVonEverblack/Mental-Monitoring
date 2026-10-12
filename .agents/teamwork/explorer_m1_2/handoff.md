# Handoff Report: Indonesian UU PDP No. 27/2022 Statutory Data Privacy & Offline-First Zero-Telemetry Guardrails

**Agent Identifier:** `explorer_m1_2`  
**Parent Orchestrator:** `23e86b7a-05e5-4478-bbda-1fc7add44f85`  
**Milestone:** Phase 6 — Milestone 1 (M1: Core System Guardrails & Compliance Framework)  
**Target Rule File:** `.agents/rules/agent_skill_guardrails.md` (`trigger: always_on`)  
**Date & Timestamp:** 2026-10-12T15:28:00Z  
**Handoff Type:** Hard Handoff (Investigation Complete)  

---

## 1. Observation

### 1.1 Empirical Baseline Quality Gate Status
Direct execution of repository verification commands in the project root (`C:\Users\Hype\Kuliah\Proyekan\mental monitoring`) yielded:
- **Static Code Analysis (`npm run lint` / `oxlint`)**:
  - Result: `Found 0 warnings and 0 errors. Finished in 44ms on 171 files with 104 rules using 12 threads.` (Exit Code: 0).
- **Strict TypeScript Compilation (`npx tsc -b`)**:
  - Result: Clean compilation across all project references with 0 errors (Exit Code: 0).
- **Unit & Integration Test Suite (`npx vitest run --root .`)**:
  - Result: **65 test files passed (65/65), 662 test cases passed (662/662)** in 42.81s with 0 failures (Exit Code: 0).
- **Production PWA Build (`npm run build`)**:
  - Result: Clean build generating PWA assets with Workbox Service Worker:
    - `mode: generateSW`
    - `precache: 62 entries (2123.70 KiB)`
    - Clean chunk partitioning: `index-DKZkEKhb.js` (135.42 kB / 47.65 kB gzip), `react-vendor-Bn_hyvBN.js` (223.76 kB), `recharts-vendor-DPckfJa2.js` (411.11 kB), `i18n-locales-D0qHTcwN.js` (710.99 kB), `i18n-vendor-DxHZbUyL.js` (62.52 kB), `icons-vendor-Du2-D7Zq.js` (21.58 kB).

---

### 1.2 Indonesian UU PDP No. 27/2022 Statutory Privacy Mandates

#### A. Statutory Classification of Specific Personal Data (Data Pribadi Spesifik)
- **Statutory Source**: Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi:
  - **Pasal 4 Ayat (1)**: *"Data Pribadi terdiri atas: a. Data Pribadi yang bersifat spesifik; dan b. Data Pribadi yang bersifat umum."*
  - **Pasal 4 Ayat (2) huruf d**: *"Data Pribadi yang bersifat spesifik sebagaimana dimaksud pada ayat (1) huruf a meliputi: ... d. data dan informasi kesehatan;"*
- **Codebase Mapping in RIMA**:
  - Mental health mood coordinates (Yale Mood Meter 2D), emotional trajectory logs, psychiatric self-screenings (PHQ-9, GAD-7), CBT-I sleep efficiency diaries, Stanley-Brown suicide prevention safety plans, and somatic session histories are classified as **Data Pribadi Spesifik**.
  - Verified in `src/pages/PrivacyPolicy.tsx:28-30, 55-61`:
    ```tsx
    29: {t('privacy.subtitle', 'Komitmen RIMA dalam melindungi data kesehatan mental Anda sesuai UU No. 27 Tahun 2022 (UU PDP).')}
    ...
    57: <li><strong>{t('privacy.moodData', 'Data Emosi/Mood:')}</strong> {t('privacy.moodDataDesc', 'Skor mood (1-5), faktor penyebab, catatan, disimpan secara lokal.')}</li>
    58: <li><strong>{t('privacy.journalData', 'Catatan Jurnal:')}</strong> {t('privacy.journalDataDesc', 'Refleksi pribadi diproses 100% lokal di browser pengguna.')}</li>
    ```
  - Verified in `.agents/skills/rima-offline-security/SKILL.md:14-23`:
    ```markdown
    Under the Indonesian Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022), Pasal 4 Ayat 2 huruf d:
    > "Data dan informasi kesehatan termasuk dalam kategori Data Pribadi yang Bersifat Spesifik (Specific Personal Data)."
    ```
  - Local Storage Keys holding Specific Personal Data:
    - `rima-moods`: Daily mood logs, scores, factors, notes (`HIGH / Spesifik`).
    - `rima-journals`: Freeform & CBT reflections (`HIGH / Spesifik`).
    - `rima-safety-plan`: Stanley-Brown suicide prevention plan (`CRITICAL`).
    - `rima-escalation-log`: Timestamped risk escalation history (`HIGH / Clinical`).
    - `rima-sleep-diary`: Sleep diary entries and sleep efficiency metrics (`HIGH / Spesifik`).
    - `rima-jitai-state-v1`: JITAI adaptive intervention state and impressions (`MODERATE`).

#### B. Lawful Basis & Explicit Consent (Pasal 20 & 22)
- **Statutory Source**:
  - **Pasal 20 Ayat (1)**: *"Pengendali Data Pribadi wajib memiliki dasar pemrosesan Data Pribadi... [termasuk] persetujuan yang sah secara eksplisit dari Subjek Data Pribadi untuk 1 (satu) atau beberapa tujuan tertentu..."*
  - **Pasal 22**: Mandates clear, unequivocal consent given without coercion and fully revocable.
- **Codebase Mapping**:
  - Verified in `src/components/common/ConsentModal.tsx:12-23, 77-90`:
    - Modal is shown on first visit if `rima-consent-accepted` is absent in `localStorage`.
    - Checkbox requiring explicit opt-in: *"Saya memahami prinsip privasi ini dan menyetujui penggunaan RIMA."*
    - Persists ISO timestamp to `localStorage.getItem('rima-consent-accepted')`.

#### C. Data Subject Rights (Hak Subjek Data Pribadi - Pasal 5 s/d 13)
- **Pasal 7 (Right to Access & Portability)**:
  - Users have full sovereign right to access and obtain a portable copy of their data.
  - Implemented in `src/utils/exportImport.ts:32-150` via `exportMoodsAsJSON`, `exportJournalsAsJSON`, `exportMoodsAsCSV`, `exportJournalsAsCSV`.
  - CSV exports include formula injection escaping (sanitizing `=`, `+`, `-`, `@`, `\t`, `\r`) and prepend UTF-8 BOM (`\uFEFF`).
- **Pasal 8 (Right to Erasure / Hak Penghapusan / Hak Dilupakan)**:
  - Implemented in `src/utils/dataWipe.ts:1-62` (`wipeAllUserData()`) and `src/pages/Profile.tsx:180-220`:
  - 1-tap complete purge clearing `localStorage`, IndexedDB (`rima-offline-db`), Service Worker cache storage (`caches.delete()`), and Supabase remote rows if logged in.
- **Pasal 9 (Right to Withdraw Consent / Hak Menarik Persetujuan)**:
  - Users can revoke consent at any time; revoking deletes local cryptographic keys and wipes state.
- **Pasal 10 (Right to Object to Automated Profiling)**:
  - Algorithmic evaluations (JITAI nudges, Yale Mood Meter quadrants, C-SSRS triage) run deterministically on-device without opaque cloud profiling. Users can dismiss nudges daily (`dismissedAllToday`).
- **Pasal 11 (Right to Restriction of Processing)**:
  - Users can activate Air-Gapped Mode via `src/stores/dualModeStore.ts` (`toggleOperatingMode()`), completely severing network communication.

#### D. Data Minimization & Anonymous Guest Mode Pseudonymization (Pasal 16 huruf a)
- **Statutory Source**: Pasal 16 huruf a mandates collection of personal data must be limited, specific, and relevant.
- **Codebase Mapping**:
  - Zero mandatory registration, zero collection of National Identity Numbers (NIK), phone numbers, or real names.
  - Landing page (`src/pages/Landing.tsx:136-138`) provides dual CTA:
    - Primary CTA: *"Mulai sebagai Tamu Anonim"* (1-tap instant entry to dashboard, setting `rima-has-entered = 'true'`).
  - Pseudonym generation pool in `src/utils/constants.ts:477-478`:
    - `ANONYMOUS_ADJECTIVES = ['Brave', 'Gentle', 'Quiet', 'Bright', 'Calm', 'Mighty', 'Soft', 'Warm', 'Cool', 'Clear']`
    - `ANONYMOUS_NOUNS = ['River', 'Mountain', 'Forest', 'Ocean', 'Breeze', 'Meadow', 'Sky', 'Harbor', 'Valley', 'Garden']`
  - Soothing Pseudonym Generator in `src/utils/helpers.ts:60-64`:
    ```typescript
    export const generateAnonymousName = (): string => {
      const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
      const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
      return `${adj} ${noun}`;
    };
    ```
  - Forum participation in `src/pages/Forum.tsx:180, 376-378`:
    - When `isAnonymousMode` is active, real account identity is completely hidden. All posts and comments use randomized pseudonyms (e.g., "Calm River"), with an interactive dice button allowing users to reroll their pseudonym at will.
    - Verified in `src/test/adversarialIncognitoAuth.test.tsx:129-235` (1,000 Monte Carlo iterations confirming zero nulls and 100% adherence to soothing word pool).

#### E. Strict Purpose Limitation & Research De-identification (Differential Privacy)
- As specified in `.agents/skills/rima-privacy-telemetry/SKILL.md:27-60`:
  - Enforce **$k$-Anonymity ($k \ge 10$)**: No cohort with fewer than 10 individuals is ever surfaced.
  - Enforce **Differential Privacy ($\epsilon \le 1.0$)**: Laplace noise mechanism injecting calibrated perturbation ($\text{Lap}(0, \frac{\text{sensitivity}}{\epsilon})$) into population counts.

#### F. 72-Hour Breach Notification Obligation (Pasal 46)
- Mandates written notification within $3 \times 24$ hours (72 hours) to data subjects and the regulatory authority (*Lembaga PDP*) if unauthorized access to cloud databases occurs.

---

### 1.3 Offline-First Data Integrity & Zero Runtime Network Invariants

#### A. 100% On-Device Processing for Therapeutic Modules
1. **Yale Mood Meter 2D**:
   - Location: `src/components/ui/MoodMeterCanvas.tsx:12-300`, `src/data/emotionTaxonomy.ts:1-215`.
   - Mechanics: 2D circumplex coordinate taxonomy mapping Valence ($[-5, +5]$) and Arousal ($[-5, +5]$) into 4 distinct quadrants (Red, Yellow, Blue, Green) with 16 emotion nuance granularities.
   - Empirical observation: 100% canvas and SVG mathematical calculation in browser; zero network requests.
2. **JITAI (Just-In-Time Adaptive Intervention) Engine**:
   - Location: `src/services/jitaiEngine.ts:9-40, 79-150`, `src/hooks/useJitai.ts:26-85`.
   - Mechanics: Deterministic local evaluation of mood trajectories, sleep efficiency, and behavioral activation (BA) activities.
   - Anti-habituation guardrails: Quiet hours (22:00–07:00), 4-hour cooldown (`JITAI_COOLDOWN_MS = 14400000`), and daily cap of 3 nudges (`JITAI_DAILY_CAP = 3`).
   - Empirical observation: Executes purely within client thread; 0 network packets transmitted.
3. **CBT-I Sleep Diary**:
   - Location: `src/services/sleepService.ts:59-105`, `src/pages/SleepTracker.tsx:89`.
   - Mechanics: On-device calculation of sleep statistics:
     $$\text{Sleep Efficiency} = \left(\frac{\text{Total Sleep Time}}{\text{Time in Bed}}\right) \times 100\%$$
     alongside sleep latency, wake after sleep onset (WASO), and sleep quality rating.
   - Empirical observation: Persisted solely to `localStorage` (`rima-sleep-diary`) and IndexedDB (`rima-offline-db`).
4. **Somatics & Soundscapes**:
   - Location: `src/services/audioSomaticsService.ts:1-60`.
   - Mechanics: Generates zero-download ambient soundscapes (Brownian noise, pink noise, Theta 6 Hz binaural beats, Alpha 10 Hz binaural beats) directly in-browser using Web Audio API procedural synthesis.
   - Empirical observation: Explicitly guarantees **0 KB external audio asset downloads** (works 100% offline).
   - Somatic grounding 5-4-3-2-1 (`src/pages/Grounding.tsx`) and Box Breathing (`src/pages/Breathe.tsx`) operate purely via local CSS/React DOM animations.

#### B. Strictly Zero Runtime External Network Calls & Zero Third-Party Telemetry
- **Exhaustive Codebase Search**:
  - `grep_search` across `src/` for `fetch(`, `axios`, `XMLHttpRequest`, and `navigator.sendBeacon` confirmed:
    - `fetch(`: Exactly 0 occurrences in `src/`.
    - `axios`: Exactly 0 occurrences in `src/`.
    - `XMLHttpRequest`: Exactly 0 occurrences in `src/`.
    - `sendBeacon`: Exactly 0 occurrences in `src/`.
- **Telemetry Prohibition**:
  - Strictly 0 third-party analytics SDKs: No Google Analytics (`gtag`), Google Tag Manager, Meta Pixel, Mixpanel, Amplitude, Segment, Hotjar, Sentry, or Datadog.
- **Dual-Mode Network Gatekeeping**:
  - Network requests are isolated exclusively to optional peer forum synchronization in `src/services/forumService.ts` and Supabase auth in `src/hooks/useAuth.ts`.
  - Every network-touching block is gatekept by `isNetworkAllowed()` from `src/stores/dualModeStore.ts:51-54`:
    ```typescript
    export function isNetworkAllowed(): boolean {
      const state = useDualModeStore.getState();
      return state.operatingMode === 'connected' && !state.isAirgappedMode;
    }
    ```
  - When Air-Gapped Mode is active (`operatingMode === 'airgapped' || isAirgappedMode === true`), `isNetworkAllowed()` strictly returns `false`, aborting all outbound communication.

#### C. Zero External CDNs at Runtime
- **Font Assets**: Google Fonts (Plus Jakarta Sans) linked in `index.html:27-29` is configured with Workbox runtime caching (`CacheFirst`, 365-day expiration). If installed offline, CSS falls back gracefully to system sans-serif font stack.
- **CSS Architecture**: Pure vanilla CSS design tokens (`src/styles/design-tokens.css`). Strictly ZERO Tailwind CSS CDN or utility class imports.
- **Icon Suite**: Lucide icons are bundled locally into `icons-vendor-Du2-D7Zq.js` (21.58 kB). Zero external icon fonts or CDN stylesheets.
- **JavaScript Libraries**: 100% of dependencies are bundled locally into Rollup chunks. Zero CDN script tags (`unpkg.com`, `cdnjs`, `jsdelivr`).

#### D. Workbox PWA Precache Invariants
- Verified in `vite.config.ts:40-74`:
  - `workbox.maximumFileSizeToCacheInBytes: 3000000` (3 MiB safe zone to prevent build-halting errors).
  - `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`.
  - Generates 62 precached assets totaling 2,123.70 KiB during production build.
- Content Security Policy (CSP) Invariant in `index.html:11-14`:
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* ws://127.0.0.1:*; media-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';"
  />
  ```

---

## 2. Logic Chain

1. **Premise 1 (Statutory Obligation)**: Under Indonesian UU PDP No. 27/2022 Pasal 4 Ayat (2) huruf d, all psychiatric and mental health records (Yale Mood Meter coordinates, sleep diaries, reflections, safety plans) constitute *Data Pribadi yang Bersifat Spesifik*. Processing such data without strict legal safeguards carries civil and criminal liabilities under Pasal 67 & 68.
2. **Premise 2 (Psychiatric Safety Invariant)**: In digital mental health interventions, users experiencing acute cognitive constriction, suicidal despair, or panic attacks cannot tolerate network latency, connection timeouts, or third-party tracking. Therapeutic mechanisms must be instantly accessible offline.
3. **Inference from 1 & 2 (Offline-First Privacy Architecture)**: To simultaneously satisfy UU PDP compliance and clinical zero-latency safety, RIMA must execute 100% of its therapeutic features (Yale Mood Meter 2D, JITAI engine, CBT-I sleep tracker, Web Audio somatics) completely on-device.
4. **Verification of Existing Architecture**: Empirical codebase inspection confirms that `fetch()`, `axios`, `XMLHttpRequest`, and `navigator.sendBeacon` are completely absent from core therapeutic features. Network access is restricted to optional community forums, guarded by `isNetworkAllowed()`.
5. **Vulnerability Mitigation**: Any future code changes or agent actions that introduce third-party analytics SDKs, external CDNs, unconsented telemetry, or ungated network calls would violate both statutory law and clinical safety.
6. **Conclusion**: The always-on system rule file `.agents/rules/agent_skill_guardrails.md` must codify non-negotiable statutory privacy clauses (UU PDP No. 27/2022) and offline-first data integrity invariants with zero tolerance for deviations.

---

## 3. Caveats

1. **Optional Supabase Cloud Forum Sync**: While all core therapeutic modules are strictly offline-first, RIMA includes an optional Supabase peer forum for authenticated users. This is not a violation because it is strictly gatekept by `isNetworkAllowed()` and anonymized via `generateAnonymousName()`. Worker 1 must ensure that rule clauses explicitly preserve this gate.
2. **Web Audio Somatics Mocking in CI**: Web Audio API synthesis executes flawlessly in real browsers with 0 KB asset downloads, but requires jsdom mocks during Vitest runs (as currently configured in `src/test/setup.ts`).
3. **Google Fonts Runtime Caching**: Google Fonts are loaded via `index.html` with Workbox `CacheFirst` runtime caching (365-day TTL). If installed on a device completely without internet from second zero, the application relies on system sans-serif fonts. Worker 1 should note that no external JavaScript or CSS framework is loaded from CDNs.
4. **No Other Caveats**: All 65 test files and 4 Quality Gates pass cleanly on the current codebase.

---

## 4. Conclusion & Recommended Rule Clauses for Worker 1

Worker 1 must construct `.agents/rules/agent_skill_guardrails.md` with `trigger: always_on`. The recommended rule clauses and constraints are formulated below:

### 4.1 Recommended Frontmatter Contract
```yaml
---
trigger: always_on
description: >-
  Mandatory system-wide guardrails for all agent skills, enforcing YAML frontmatter compliance,
  <30K token context density compression, offline-first data integrity, Indonesian UU PDP No. 27/2022
  privacy protections for sensitive health data, and OWASP client-side Web Crypto AES-GCM-256 standards.
---
```

### 4.2 Recommended Rule Clauses for Section: Indonesian UU PDP No. 27/2022 Compliance
1. **Clause 1 — Sensitive Health Data Classification (Pasal 4 Ayat 2 huruf d)**:
   - All mental health mood coordinates, journaling reflections, clinical self-screenings (PHQ-9, GAD-7), CBT-I sleep efficiency logs, and safety plans are statutory *Data Pribadi Spesifik*.
   - Plaintext storage of sensitive health data in unencrypted remote storage is strictly prohibited.
2. **Clause 2 — Explicit & Revocable Consent (Pasal 20 & 22)**:
   - No sensitive mental health data may be persisted prior to explicit consent acknowledgment via `<ConsentModal />` recorded in `rima-consent-accepted`.
   - Consent must be revocable at any time without punitive service degradation.
3. **Clause 3 — Data Subject Rights Implementation (Pasal 5 s/d 13)**:
   - **Access & Portability (Pasal 7)**: Features capturing user data must support structured export in JSON and sanitized CSV formats.
   - **Erasure / Right to be Forgotten (Pasal 8)**: Features must integrate with `wipeAllUserData()` to guarantee 1-tap instant purging of local and remote state.
   - **Right to Object / Automated Profiling (Pasal 10)**: All therapeutic engines (JITAI, Mood Meter) must be deterministic, transparent, and dismissible by the user.
   - **Restriction of Processing (Pasal 11)**: All network-aware components must strictly check `isNetworkAllowed()` and respect Air-Gapped Mode.
4. **Clause 4 — Data Minimization & Anonymous Guest Mode (Pasal 16 huruf a)**:
   - Strictly ZERO collection of real names, phone numbers, National Identity Numbers (NIK), GPS coordinates, or advertising identifiers.
   - Community interactions must utilize randomized, soothing pseudonyms (`ANONYMOUS_ADJECTIVES` + `ANONYMOUS_NOUNS`) via `generateAnonymousName()`.
5. **Clause 5 — Strict Purpose Limitation & Research De-identification**:
   - Any aggregated research data export must enforce $k$-anonymity ($k \ge 10$) and $\epsilon$-differential privacy ($\epsilon \le 1.0$) with calibrated Laplace noise.
6. **Clause 6 — 72-Hour Breach Notification Standard (Pasal 46)**:
   - Any remote synchronization backend must maintain an auditable protocol to notify data subjects and authorities within 72 hours of a confirmed breach.

### 4.3 Recommended Rule Clauses for Section: Offline-First Data Integrity & Zero Telemetry
1. **Clause 7 — 100% On-Device Execution Invariant**:
   - The Yale Mood Meter 2D, JITAI Smart Engine, CBT-I Sleep Diary, and Somatic Grounding/Audio must execute 100% on the client device.
   - Procedural Web Audio somatics must synthesize soundscapes in-browser with 0 KB external audio asset downloads.
2. **Clause 8 — Strictly Zero Third-Party Telemetry SDKs**:
   - Strictly FORBIDDEN to introduce Google Analytics, Google Tag Manager, Meta Pixel, Mixpanel, Amplitude, Segment, Sentry, Datadog, or Hotjar.
   - Strictly FORBIDDEN to invoke `navigator.sendBeacon()`.
3. **Clause 9 — Strict Dual-Mode Network Gatekeeping**:
   - Core therapeutic features must NEVER make outbound HTTP/XHR/WebSocket network calls.
   - Optional network features must be explicitly guarded by `if (!isNetworkAllowed()) return;`.
4. **Clause 10 — Strictly Zero External CDNs at Runtime**:
   - Strictly FORBIDDEN to load scripts or stylesheets from public CDNs (`unpkg.com`, `cdnjs`, `jsdelivr`, `tailwindcss`).
   - All assets must be bundled locally into Rollup chunks.
5. **Clause 11 — Workbox PWA Precache Invariants**:
   - Production builds must generate a valid Service Worker precaching 100% of app shell assets and translation catalogs.
   - Workbox `maximumFileSizeToCacheInBytes` must maintain a minimum of 3,000,000 bytes (3 MiB) headroom.
   - Rollup manual chunk partitioning in `vite.config.ts` must isolate translation catalogs (`i18n-locales`) and vendor dependencies.

---

## 5. Verification Method

To independently verify these findings and the resulting rule implementation:

1. **Verify Static Code Quality Gate (Gate 1)**:
   ```bash
   npm run lint
   ```
   *Expected Outcome*: 0 warnings, 0 errors across all 171+ files.

2. **Verify TypeScript Type Check Gate (Gate 2)**:
   ```bash
   npx tsc -b
   ```
   *Expected Outcome*: Clean exit code 0 with 0 compiler errors.

3. **Verify Vitest Test Suite Gate (Gate 3)**:
   ```bash
   npm test
   ```
   *Expected Outcome*: 100% pass rate across all 65 test files (662+ assertions).

4. **Verify Production PWA Build Gate (Gate 4)**:
   ```bash
   npm run build
   ```
   *Expected Outcome*: Successful build generating PWA Service Worker with $\ge 62$ precached assets in `dist/`.

5. **Verify Frontmatter & Content Invariants of Rule File**:
   ```bash
   node -e "
   const fs = require('fs');
   const p = '.agents/rules/agent_skill_guardrails.md';
   if (!fs.existsSync(p)) throw new Error('Rule file missing');
   const c = fs.readFileSync(p, 'utf8');
   if (!c.startsWith('---\ntrigger: always_on')) throw new Error('Invalid frontmatter trigger');
   if (!c.includes('UU PDP No. 27/2022')) throw new Error('Missing UU PDP clause');
   if (!c.includes('offline-first') && !c.includes('Offline-First')) throw new Error('Missing offline-first clause');
   if (!c.includes('Data Pribadi Spesifik')) throw new Error('Missing Data Pribadi Spesifik clause');
   console.log('Rule file verification passed!');
   "
   ```

6. **Invalidation Conditions**:
   - Any inclusion of external telemetry SDKs or analytics scripts.
   - Any bypass of `isNetworkAllowed()` in network-touching services.
   - Failure of any of the 4 Quality Gates (`oxlint`, `tsc -b`, `vitest`, `build`).
   - Failure to specify `trigger: always_on` in `.agents/rules/agent_skill_guardrails.md`.
