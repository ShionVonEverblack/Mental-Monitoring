# RIMA Phase 2 Test Infrastructure Specification (TEST_INFRA.md)

## 1. Executive Summary & Quality Charter

This document establishes the authoritative test engineering specification for **RIMA (Ruang Interaksi Mental Aman) Phase 2**, encompassing:
1. **On-Device Just-In-Time Adaptive Intervention (JITAI) Engine**: Zero-network deterministic decision rule engine evaluating Yale Mood Meter 2D affective coordinates, CBT-I sleep efficiency metrics, and behavioral activation engagement, governed by strict anti-habituation guardrails and daily dismissal persistence.
2. **Fast-Action Emergency Safety Card**: Accessible, high-contrast crisis de-escalation interface engineered for users experiencing acute emotional overwhelm and cognitive constriction, providing single-tap primary coping strategies, trusted contact dialing, standardized 119 Ext 8 hotline access (`tel:119,8`), and somatic grounding shortcuts.
3. **Multi-Lingual Parity & Directionality**: 100% translation key parity across all 8 supported languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) and dynamic Arabic RTL (`dir="rtl"`) synchronization.

### Test Architecture Principles
- **Opaque-Box Verification**: Tests assert observable behaviors, interface contracts, DOM outputs, and storage states without coupling to internal private methods.
- **Zero-Network Guarantee**: All tests verify that zero telemetry, zero analytics, and zero external network calls occur during evaluation or crisis escalation.
- **Clinical Determinism**: Rule evaluation given identical affective, temporal, and sleep contexts must always produce identical, deterministic recommendations.
- **Fail-Safe Crisis Override**: Crisis touchpoints and emergency hotlines take absolute precedence over micro-interventions.

---

## 2. The 4-Tier Test Architecture

```
+-------------------------------------------------------------------------+
|                  TIER 4: Real-World Application Scenarios               |
|      (End-to-End User Journeys: Panic, Depressive Slump, Multi-Lingual) |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|              TIER 3: Cross-Feature Combinations (Pairwise)              |
|        (JITAI + Quiet Hours, Crisis Precedence, Rollover + Cooldown)    |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                 TIER 2: Boundary & Corner Cases (>=5 per feature)        |
|  (Exact Thresholds, Time Rollovers, Empty/Malformed Data, Extreme Dials) |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                 TIER 1: Feature Coverage (>=5 per feature)               |
|       (Primary Happy Paths: Red/Blue Rules, Sleep, Card UI, 8x i18n)    |
+-------------------------------------------------------------------------+
```

---

### Tier 1: Feature Coverage (Primary Happy Paths, $\ge 5$ per feature)

#### Feature 1: JITAI Deterministic Rule Triggers
- **T1.1.1**: Acute Agitation / Red Quadrant (`valence <= -0.4, arousal >= 0.4` or `quadrant === 'red'`) deterministically triggers `mood_red_vagal_reset` navigating to `/breathe` or `/tipp`.
- **T1.1.2**: Depressive Hypo-Arousal / Blue Quadrant (`valence <= -0.4, arousal <= -0.4` or `quadrant === 'blue'`) triggers `mood_blue_activation_spark` navigating to `/activation` or `/grounding`.
- **T1.1.3**: Mood Drop Velocity (sudden drop $\Delta \text{score} \le -2$ or consecutive low scores $\le 2$) triggers `mood_drop_recovery` navigating to `/journal`.
- **T1.1.4**: Sleep Efficiency Impairment (latest sleep record with `sleepEfficiency < 85%`) triggers `sleep_efficiency_stimulus_control` navigating to `/sleep`.
- **T1.1.5**: Prolonged Behavioral Inactivity (afternoon hours 13:00-17:00, no BA activity in $>48\text{h}$, low mood) triggers `activity_inactivity_spark` navigating to `/activation`.
- **T1.1.6**: Balanced/Green Quadrant (`valence > 0, arousal <= 0`) with optimal sleep yields `null` (no unnecessary nudges).

#### Feature 2: JITAI Anti-Habituation Guardrails
- **T1.2.1**: Quiet Hours Active (22:00 to 06:59) suppresses all active nudges, returning `null`.
- **T1.2.2**: Active Daytime (07:00 to 21:59) permits eligible nudges.
- **T1.2.3**: 4-Hour Cooldown Window suppresses nudges if `now - lastNudgeTime < 4 * 3600 * 1000`.
- **T1.2.4**: Cooldown Expiration (`now - lastNudgeTime >= 4 * 3600 * 1000`) allows subsequent nudge.
- **T1.2.5**: Daily Cap Enforcement (`dailyCount >= 3`) completely suppresses further nudges for the day.

#### Feature 3: JITAI Daily Dismissal Persistence & Rollover
- **T1.3.1**: Dismissing a nudge of type `X` appends `X` to `dismissedTypes` and persists to `'rima-jitai-state'`.
- **T1.3.2**: Subsequent evaluation on the same calendar day suppresses type `X` while allowing un-dismissed types.
- **T1.3.3**: Date Rollover: When `currentDate !== stored.date`, state auto-resets `dailyCount` to 0 and clears `dismissedTypes`.
- **T1.3.4**: Explicit `dismissAllToday` flag suppresses all nudges until midnight rollover.
- **T1.3.5**: Storage synchronization: Custom event `'local-storage'` or native `'storage'` causes state re-hydration.

#### Feature 4: Fast-Action Safety Card Data Extraction & Fallbacks
- **T1.4.1**: Extracts custom primary coping strategy from `'rima-safety-plan'` if configured.
- **T1.4.2**: Falls back to evidence-based default ("Stanford Cyclic Sighing / 5-4-3-2-1 Grounding") when plan is empty.
- **T1.4.3**: Extracts primary trusted contact and phone number from `'rima-trusted-contacts'` or `'rima-safety-plan'`.
- **T1.4.4**: Provides structured `hotline119` with phone `'119 ext 8'` and exact URL `'tel:119,8'`.
- **T1.4.5**: Provides standardized emergency backup link `'tel:112'`.
- **T1.4.6**: Identifies direct somatic route shortcut (`/grounding` or `/breathe`).

#### Feature 5: Fast-Action Safety Card UI & Accessibility
- **T1.5.1**: Card renders high-contrast de-escalation layout with role `dialog` or `region` and `aria-modal="true"`.
- **T1.5.2**: Single-tap trusted contact button renders accessible `tel:{phone}` anchor.
- **T1.5.3**: Single-tap 119 Ext 8 hotline button renders anchor with exact `href="tel:119,8"`.
- **T1.5.4**: Single-tap somatic grounding button navigates to `/grounding` or `/breathe`.
- **T1.5.5**: Close / dismiss button allows one-tap dismissal with restored focus.
- **T1.5.6**: Touch targets adhere to WCAG 2.2 AA target size requirements ($\ge 48\text{px} \times 48\text{px}$).

#### Feature 6: 8-Language Translation Parity & RTL
- **T1.6.1**: Translation key parity across all 8 locales: `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`.
- **T1.6.2**: 0 missing keys, 0 undefined values, 0 empty strings across all 8 dictionary files.
- **T1.6.3**: JITAI copy keys present in all 8 languages (`jitai.title.*`, `jitai.message.*`, `jitai.action.*`, `jitai.dismiss`).
- **T1.6.4**: Safety Card copy keys present in all 8 languages (`safetyCard.title`, `safetyCard.call119`, `safetyCard.groundingShortcut`, etc.).
- **T1.6.5**: Arabic language (`ar`) triggers `document.documentElement.dir = 'rtl'` and `lang = 'ar'`.

---

### Tier 2: Boundary & Corner Cases ($\ge 5$ per feature)

#### Feature 1 Boundaries: JITAI Affective & Temporal Thresholds
- **T2.1.1**: Exact Coordinate Boundary: Valence `-0.4000` and Arousal `+0.4000` triggers Red Quadrant; `-0.3999` does not.
- **T2.1.2**: Exact Neutral Origin: Valence `0.0`, Arousal `0.0` maps safely without throwing division-by-zero or NaN.
- **T2.1.3**: Sleep Efficiency Boundary: Exactly `84%` triggers stimulus control; `85%` does NOT trigger.
- **T2.1.4**: Sleep Onset Latency Boundary: SOL `30 min` is acceptable; `31 min` triggers sleep latency winddown.
- **T2.1.5**: WASO Boundary: Awakenings duration `30 min` is acceptable; `31 min` triggers WASO relaxation.
- **T2.1.6**: Inactivity Boundary: Exactly `48 hours 0 minutes` triggers inactivity spark; `47 hours 59 minutes` does NOT trigger.
- **T2.1.7**: Empty/Corrupted History: `moods = []`, `sleepHistory = []`, `activities = []` yields `null` without exceptions.

#### Feature 2 Boundaries: Anti-Habituation Time Edge Cases
- **T2.2.1**: Quiet Hours Transition: `21:59:59` is allowed; `22:00:00` is strictly suppressed.
- **T2.2.2**: Morning Quiet Hours Transition: `06:59:59` is strictly suppressed; `07:00:00` is allowed.
- **T2.2.3**: Cooldown Boundary: Exactly `3 hours 59 minutes 59 seconds` is suppressed; `4 hours 00 minutes 00 seconds` is allowed.
- **T2.2.4**: Daily Cap Boundary: Exactly `2` nudges today allows a 3rd; `3` nudges today rejects the 4th.
- **T2.2.5**: Calendar Midnight Rollover: State saved at `23:59:59` on `2026-10-10` immediately resets counters when read at `00:00:01` on `2026-10-11`.
- **T2.2.6**: Year / Leap Day Rollover: Seamless transition from `2028-02-28` to `2028-02-29` and `2028-12-31` to `2029-01-01`.

#### Feature 3 Boundaries: Fast-Action Safety Card Data & Phone Sanitization
- **T2.3.1**: Malformed Phone Numbers: Cleans string `"0812-3456-7890"` -> `'tel:081234567890'`, `"+62 811 234 567"` -> `'tel:+62811234567'`.
- **T2.3.2**: Missing or Empty Phone Number: Shows clear prompt to configure contact or opens dialer modal instead of broken `tel:` link.
- **T2.3.3**: Alphanumeric Embedded Contacts: `"Ibu (08123456789)"` parses phone `"08123456789"` and contact name `"Ibu"`.
- **T2.3.4**: Very Long Coping Strategy Text: Text $>200$ characters is truncated or cleanly wrapped without overflowing modal boundaries.
- **T2.3.5**: Extreme Null/Corrupt Storage: `localStorage.getItem('rima-safety-plan') = 'INVALID_JSON{[['` does not crash service, returns safe fallback.

#### Feature 4 Boundaries: i18n & Bidirectional Unicode
- **T2.4.1**: Rapid Language Toggling: Rapidly switching `id` -> `ar` -> `en` -> `ar` consistently updates `document.documentElement.dir`.
- **T2.4.2**: Unrecognized Language Code: Falling back to `'id'` when an unsupported locale string is passed.
- **T2.4.3**: Hotline String Integrity in RTL: In Arabic RTL mode, `tel:119,8` is never inverted or mangled by BiDi algorithm (`8,119:let`).
- **T2.4.4**: Missing Interpolation Variables: Fallback copy displays gracefully without raw `{{name}}` markers leaking to user.
- **T2.4.5**: Special Characters & Diacritics: Accents in Spanish (`¿Necesitas ayuda?`), Arabic diacritics, and Japanese characters render without encoding corruption.

---

### Tier 3: Cross-Feature Combinations (Pairwise Interaction Matrix)

| Matrix ID | Subsystem A State | Subsystem B State | Expected Integrated Behavior |
|:---|:---|:---|:---|
| **C3.1** | Acute Red Agitation (`valence: -0.7, arousal: +0.8`) | Quiet Hours Active (`23:30`) | JITAI engine is suppressed (`null`), but Fast-Action Safety Card is fully accessible via global `SOSButton`. |
| **C3.2** | Escalation Level 3 Crisis Active | JITAI Blue Quadrant Trigger | Crisis Banner and Safety Card override JITAI card; JITAI yields to avoid conflicting cognitive load. |
| **C3.3** | Red Quadrant Agitation + Sleep Eff `<85%` + Inactivity | Daytime Active (`14:00`), Cap `0` | Priority hierarchy: Evaluates Red Quadrant first (`mood_red_vagal_reset`). Sleep and activity rules yield to acute affect. |
| **C3.4** | Nudge Type A Dismissed Today | Nudge Type B Triggered 5h later | Type A is suppressed, but Type B (`sleep_efficiency_stimulus_control`) surfaces successfully because cooldown expired and Type B is un-dismissed. |
| **C3.5** | Daily Cap Reached (`dailyCount: 3`) | New Severe Low Mood Entry Logged | JITAI remains strictly suppressed (anti-habituation), but Emergency SOS and Escalation Banner remain active. |
| **C3.6** | Arabic (`ar`) RTL Activated | Fast-Action Safety Card Opened | Modal renders with `dir="rtl"`, hotline `tel:119,8` retains standard telephonic formatting, touch targets $\ge 48\text{px}$. |
| **C3.7** | Custom Safety Plan Saved in LocalStorage | Fast-Action Card Opened via Home Quick Action | Card displays personalized coping strategy and primary trusted contact parsed from storage. |
| **C3.8** | Cooldown Active at `23:50` | Calendar Midnight Passes to `00:05` | Date rollover resets daily counter and dismissals, but quiet hours (`00:05`) maintains overnight calm. |

---

### Tier 4: Real-World Application Scenarios (End-to-End User Journeys)

#### Scenario 1: "Midnight Panic Attack" (Acute Crisis Under Cognitive Constriction)
- **User Story**: At 02:30 AM, a user experiences sudden panic and heart palpitations. Cognitive constriction prevents complex navigation.
- **Execution Flow**:
  1. Home dashboard loads. JITAI engine detects current hour is 02:30 $\rightarrow$ Quiet hours active $\rightarrow$ returns `null` (no intrusive card).
  2. User taps high-contrast global floating `SOSButton`.
  3. `FastActionSafetyCard` modal opens in $<100\text{ms}$.
  4. Card immediately presents:
     - Prominent primary coping action: *"Ambil napas dalam: Stanford Cyclic Sighing"*
     - 1-tap call button to trusted contact (e.g. *"Telepon Ibu: 08123456789"*)
     - 1-tap call button to national crisis line: `tel:119,8`
     - 1-tap shortcut to `/grounding` (5-4-3-2-1 Sensory Grounding).
  5. User taps somatic grounding shortcut $\rightarrow$ router transitions directly to `/grounding`.

#### Scenario 2: "Depressive Low-Arousal Morning" (Low Mood + Sleep Fragmentation)
- **User Story**: At 08:30 AM, a user logs a mood entry with sadness and fatigue (`valence: -0.6, arousal: -0.5`, Blue Quadrant). Their CBT-I sleep diary shows fragmented sleep (`sleepEfficiency: 74%`).
- **Execution Flow**:
  1. JITAI engine runs on-device. Time is 08:30 (outside quiet hours), daily count is 0.
  2. Rule hierarchy evaluates Blue Quadrant hypo-arousal $\rightarrow$ surfaces `mood_blue_activation_spark` (Micro Behavioral Activation Spark).
  3. Dashboard renders `<JitaiNudgeCard />` with warm, non-judgmental prompt: *"Energi sedang rendah? Coba satu langkah kecil 5 menit"*.
  4. User taps "Lewati untuk sekarang" (Dismiss) $\rightarrow$ `dismissNudgeToday('mood_blue_activation_spark')` is persisted.
  5. Subsequent check-ins that morning do not re-surface the dismissed Blue Quadrant nudge.

#### Scenario 3: "Downhill Spiral & Sudden Mood Drop"
- **User Story**: User logged mood score 4 yesterday, but logs mood score 2 today ($\Delta = -2$).
- **Execution Flow**:
  1. JITAI detects mood drop velocity $\Delta \text{score} \le -2$.
  2. Cooldown check passes $\rightarrow$ surfaces `mood_drop_recovery`.
  3. User taps action button $\rightarrow$ navigates to `/journal` with self-compassion prompt.

#### Scenario 4: "Multi-Lingual Crisis Transition" (Arabic & Regional Languages)
- **User Story**: An Arabic-speaking user switches the app language to Arabic (`ar`) and encounters crisis resources.
- **Execution Flow**:
  1. Language switcher updates `i18n.language` to `'ar'`.
  2. Document synchronizes `document.documentElement.dir = 'rtl'` and `lang = 'ar'`.
  3. Safety Card displays Arabic copy with 100% key parity.
  4. Dialing link `tel:119,8` retains valid telephonic URI syntax without character inversion.

---

## 3. Test Runner & Execution Specification

### Environment & Tooling
- **Test Runner**: Vitest v3 (`npx vitest`)
- **DOM Simulation**: jsdom
- **Setup Script**: `src/test/setup.ts` (`import '@testing-library/jest-dom';`)
- **Lint Check**: oxlint (`npm run lint`)
- **Typecheck**: TypeScript 5.8 (`npx tsc -b`)
- **PWA Build**: Vite 6 + `vite-plugin-pwa` (`npm run build`)

### Primary Test Commands
```bash
# Run Phase 2 E2E comprehensive suite
npx vitest run src/test/phase2E2E.test.ts

# Run all test suites across the repository
npm test

# Run code style and forensic linting
npm run lint

# Run strict TypeScript compilation
npx tsc -b
```

### Quality Gate Pass Criteria
1. `src/test/phase2E2E.test.ts` passes 100% with 0 skipped or failing tests.
2. Complete test suite passes 100% across all test suites ($\ge 33$ test files, $\ge 220$ tests).
3. `oxlint` reports 0 warnings and 0 errors.
4. `tsc -b` completes with exit code 0.
5. All 8 language JSON files have 100% matching key trees.
