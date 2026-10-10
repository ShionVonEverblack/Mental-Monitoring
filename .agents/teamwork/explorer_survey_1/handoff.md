# JITAI Architecture & Heuristics Survey Handoff Report

**Agent**: Explorer 1 (JITAI Architecture Explorer)  
**Date**: 2026-10-10T06:53:30Z  
**Target Path**: `.agents/teamwork/explorer_survey_1/handoff.md`  
**Reference Request**: `.agents/teamwork/ORIGINAL_REQUEST.md` (Requirement R1: On-Device JITAI Recommendation Engine)

---

## 1. Observation

Direct observations from examining the codebase, configuration, tests, and clinical skills:

### 1.1 Existing Storage & State Management Architecture
- **Zustand & IndexedDB Store**:
  - `src/stores/moodStore.ts` (lines 27–96): `useMoodStore` uses Zustand with `persist` middleware configured with `storage: createJSONStorage(() => rimaAsyncStorage)` targeting storage key `'rima-moods'`.
  - `src/utils/indexedDb.ts` (lines 3–34, 151–199): Target DB is `'rima-offline-db'`, object store `'keyval'`. `rimaAsyncStorage` is an asynchronous `StateStorage` adapter that writes to IndexedDB and synchronously mirrors to `localStorage` for synchronous consumers. `KNOWN_RIMA_STORAGE_KEYS` (lines 263–275) lists 11 standard storage keys, including `'rima-moods'`, `'rima-sleep-diary'`, and `'rima-ba-activities'`.
- **LocalStorage Services & Event Synchronization**:
  - `src/services/sleepService.ts` (lines 3, 59–68, 73–82): Uses `STORAGE_KEY = 'rima-sleep-diary'` directly with `localStorage.getItem` and `localStorage.setItem`. Dispatches `window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: STORAGE_KEY } }))` on every write/delete.
  - `src/services/behavioralActivationService.ts` (lines 3, 143–163): Uses `BA_STORAGE_KEY = 'rima-ba-activities'` with `localStorage` and emits `CustomEvent('local-storage')`.
  - `src/hooks/useLocalStorage.ts` (lines 3–69): Listens for both native `'storage'` and custom `'local-storage'` events, enabling reactive cross-component state updates when localStorage keys change.

### 1.2 Data Structures & Schemas
- **Yale Mood Meter 2D**:
  - `src/types/index.ts` (lines 17–28): `MoodEntry` contains:
    ```typescript
    export interface MoodEntry {
      id: string;
      score: MoodScore; // 1 | 2 | 3 | 4 | 5
      emoji: MoodEmoji; // '😢' | '😟' | '😐' | '🙂' | '😊'
      note?: string;
      factors: string[];
      createdAt: string; // ISO 8601
      valence?: number; // -1.0 to 1.0 (X-axis)
      arousal?: number; // -1.0 to 1.0 (Y-axis)
      quadrant?: EmotionQuadrant; // 'red' | 'yellow' | 'blue' | 'green'
      selectedEmotions?: string[]; // IDs from EMOTION_TAXONOMY
    }
    ```
  - `src/data/emotionTaxonomy.ts` (lines 17–70, 229–254):
    - Quadrants: `red` (High Energy, Negative Valence), `yellow` (High Energy, Positive Valence), `blue` (Low Energy, Negative Valence), `green` (Low Energy, Positive Valence).
    - `getQuadrantFromCoordinates(valence, arousal)`: divides plane at `valence = 0` and `arousal = 0`.
    - `mapCoordinatesToMoodScore(valence)`: converts continuous valence `[-1.0, 1.0]` into 1–5 discrete Likert score.
- **CBT-I Sleep Diary**:
  - `src/types/index.ts` (lines 225–240) & `src/services/sleepService.ts` (lines 32–54, 125–130):
    - `latencyMinutes`: Sleep Onset Latency (SOL).
    - `awakeningsCount`: Nighttime awakenings frequency.
    - `awakeningsDurationMinutes`: Wake After Sleep Onset (WASO).
    - `timeInBedMinutes`: Time between `bedTime` and `wakeTime` with midnight rollover handled.
    - `totalSleepMinutes`: `timeInBedMinutes - (latencyMinutes + awakeningsDurationMinutes)`.
    - `sleepEfficiency`: `Math.min(100, Math.round((totalSleepMinutes / timeInBedMinutes) * 100))`.
    - Status: Optimal ($\ge 85\%$), Moderate ($75\%\text{--}84\%$), Needs Improvement ($< 75\%$).
- **Behavioral Activation (BA)**:
  - `src/types/index.ts` (lines 191–204) & `src/services/behavioralActivationService.ts` (lines 5–141):
    - Domains: `'pleasure'`, `'mastery'`, `'spiritual'`, `'social'`.
    - Catalogs items with `defaultDurationMinutes` (5–15 mins).
    - Activities record `predictedMood` (1–10), `actualMood` (1–10), and `isCompleted: boolean`.

### 1.3 Home Dashboard Component Hierarchy
- `src/pages/Home.tsx` (lines 74–299):
  1. `<header className="home-header">` (lines 75–112): Greeting, language selector modal button, streak badge with Grace recovery indicator.
  2. Language Modal (lines 114–146).
  3. `<section className="mood-section">` (lines 148–160): Prompt card with `<MoodSelector>` if unlogged today; logged card with emoji if already logged.
  4. `<EscalationBanner moods={moods} latestJournalContent={latestJournalContent} />` (line 162).
  5. `<div className="affirmation-card">` (lines 164–175).
  6. `{weeklyMoods.length >= 3 && <section className="insight-section">}` (lines 177–195).
  7. `<section className="quick-actions">` (lines 197–242): 11 feature action buttons (journal, forum, safety-plan, breathe, grounding, tipp, assessment, activation, sleep, education, cft).
  8. `<section className="chart-section">` (lines 244–294): Recharts BarChart of recent moods (7 days).
  9. `<SelfCompassionModal>` (line 296).

### 1.4 Baseline Test & Linter Status
- Running `vitest run --root .` (`npm test`): **32 test files passed, 200 tests passed, 0 failures**.
- Running `oxlint` (`npm run lint`): **0 warnings, 0 errors** on 110 files.
- Running `tsc -b`: **0 errors**.

### 1.5 Repository Skill References
- `.agents/skills/rima-jitai-micro-interventions/SKILL.md` (lines 10–148):
  - Outlines Nahum-Shani et al. (2018) JITAI framework: Distal Outcome, Proximal Outcome, Decision Points, Tailoring Variables, Intervention Options, Decision Rules.
  - Mandates anti-habituation guardrails: Quiet hours (22:00–07:00), Cooldown ($\ge 4$ hours), Daily cap ($<3$ nudges/day).
  - Ethical calm-tech principles: No guilt/shame language, one-tap dismissal without penalty, 100% client-side privacy.

---

## 2. Logic Chain

1. **Local-First Zero-Network Requirement**:
   - *From Observation 1.1 & 1.5*: All mood entries, sleep diary records, and BA activities are stored locally in IndexedDB and localStorage with zero backend telemetry.
   - *Therefore*: The JITAI recommendation engine must execute 100% synchronously/deterministically on-device inside client JavaScript runtime without invoking external APIs or background trackers.

2. **Trigger Evaluation Rules & Clinical Priority**:
   - *From Observation 1.2 (`emotionTaxonomy.ts`, `sleepService.ts`, `behavioralActivationService.ts`)*:
     - **Priority 1: Acute Affective Dysregulation (Yale Mood Meter 2D - Red Quadrant)**:
       - Condition: Latest mood entry has `quadrant === 'red'` OR (`valence <= -0.4 && arousal >= 0.4`).
       - Clinical Rationale: High sympathetic autonomic activation (anxiety, panic, rage) impairs executive functioning; requires immediate somatic parasympathetic activation.
       - Intervention: Cyclic Sighing 60s (`/breathe`) or TIPP Cold Splash (`/tipp`).
     - **Priority 2: Mood Drop Velocity**:
       - Condition: Consecutive low scores ($\text{score} \le 2$ or $\text{valence} \le -0.4$ in last 2 entries) OR steep negative trajectory ($\Delta \text{score} \le -2$ over 48h).
       - Clinical Rationale: Catching depressive sliding early prevents clinical relapse.
       - Intervention: Self-Compassion Break (CFT) or gentle thought record (`/journal`).
     - **Priority 3: Depressive Hypo-Arousal (Yale Mood Meter 2D - Blue Quadrant)**:
       - Condition: Latest mood entry has `quadrant === 'blue'` OR (`valence <= -0.4 && arousal <= -0.4`).
       - Clinical Rationale: Low energy/emotional exhaustion requires low-burden behavioral activation rather than intense exercise or heavy cognitive load.
       - Intervention: Micro Behavioral Activation Spark (e.g. 5-min tea/sunlight, `/activation`) or 5-4-3-2-1 Sensory Grounding (`/grounding`).
     - **Priority 4: Sleep Fragmentation / Low Sleep Efficiency (<85%)**:
       - Condition: Latest sleep diary record has `sleepEfficiency < 85` (or `latencyMinutes > 30` or `awakeningsDurationMinutes > 30`).
       - Clinical Rationale: Insomnia and sleep fragmentation drastically amplify daytime affective vulnerability (CBT-I research).
       - Intervention: CBT-I 20-minute stimulus control & circadian wind-down guidance (`/sleep`).
     - **Priority 5: Behavioral Inactivity / Slump**:
       - Condition: Current hour is afternoon (13:00–17:00), no BA activity completed in last 48 hours, and mood is stagnant ($\text{score} \le 3$).
       - Clinical Rationale: Prolonged inactivity exacerbates depressive lethargy; micro-mastery spark restores dopamine baseline.
       - Intervention: 5-minute micro task (`/activation`).

3. **Anti-Habituation & Dismissal Persistence Logic**:
   - *From Observation 1.5 & Requirement R1*: Without strict guardrails, proactive nudges produce notification fatigue and user habituation.
   - *Design*:
     - **Quiet Hours Check**: If `hour >= 22 || hour < 7`, suppress active nudges.
     - **Daily Frequency Cap**: If `dailyCount >= 3`, suppress active nudges.
     - **Cooldown Window**: If `currentTime - lastNudgeTimestamp < 4 * 3600 * 1000` (4 hours), suppress active nudges.
     - **Daily Dismissal State**:
       - Stored in `localStorage` under key `'rima-jitai-dismissed'` (or `'rima-jitai-state'`).
       - Structure: `{ date: 'YYYY-MM-DD', dismissedTypes: string[], dismissedAll: boolean }`.
       - If `stored.date !== todayStr`, automatically reset dismissed types and daily count.
       - If user taps "Lewati untuk sekarang" (Dismiss) on a nudge of type `X`, append `X` to `dismissedTypes`. For the remainder of that calendar day, type `X` is ineligible for surfacing.

4. **Dashboard Placement & Interaction Pattern**:
   - *From Observation 1.3*: In `src/pages/Home.tsx`, placing the JITAI card between the Mood Section (`.mood-section` / `EscalationBanner`) and Affirmation Card (`.affirmation-card`) guarantees prime visual focus right after the user completes or views their mood check-in.
   - If `calculateEscalation` triggers Level 3 (active crisis / suicide keywords), the crisis banner / safety card takes absolute precedence; JITAI yields to avoid conflicting cognitive demands.

---

## 3. Caveats

1. **No Backend Synchronization**: All JITAI states are isolated to the specific device and browser profile. If a user logs moods on one device, another device cannot infer that trajectory until cloud sync (Supabase) is wired.
2. **First-Time Users with Empty History**: When a user has zero mood entries, zero sleep entries, and zero BA activities, JITAI returns `null` (no card rendered), allowing the default onboarding/prompt UI to remain clean.
3. **Escalation Priority**: If severe crisis signals exist (Escalation level 3 or C-SSRS high risk), the Fast-Action Emergency Safety Card / SOS protocols override any JITAI micro-intervention.

---

## 4. Conclusion & Implementation Blueprint

The JITAI engine can be cleanly implemented as a modular, decoupled subsystem following existing project conventions (vanilla CSS tokens, React 19, zero Tailwind, 8-language i18n parity).

### 4.1 Required Interfaces & Types (`src/types/jitai.ts`)
```typescript
export type JitaiNudgeType =
  | 'mood_red_vagal_reset'
  | 'mood_blue_activation_spark'
  | 'mood_drop_recovery'
  | 'sleep_efficiency_stimulus_control'
  | 'sleep_latency_winddown'
  | 'sleep_waso_relaxation'
  | 'activity_inactivity_spark'
  | 'activity_scheduled_reminder';

export type JitaiCategory = 'mood' | 'sleep' | 'activity';
export type JitaiUrgency = 'low' | 'medium' | 'high';

export interface JitaiNudge {
  id: string;
  type: JitaiNudgeType;
  category: JitaiCategory;
  urgency: JitaiUrgency;
  titleKey: string;
  titleFallback: string;
  messageKey: string;
  messageFallback: string;
  actionLabelKey: string;
  actionLabelFallback: string;
  targetRoute: string; // e.g., '/breathe', '/activation', '/sleep', '/journal', '/tipp'
  iconName: string; // Lucide icon identifier (e.g. 'Wind', 'MoonStar', 'Activity', 'Sparkles')
  evidenceBadgeKey?: string;
  evidenceBadgeFallback?: string;
}

export interface JitaiPersistedState {
  date: string; // YYYY-MM-DD
  dailyCount: number;
  lastNudgeTimestamp: string | null;
  dismissedTypes: JitaiNudgeType[];
  dismissedAllToday: boolean;
}

export interface JitaiContext {
  currentTime: Date;
  moods: MoodEntry[];
  sleepHistory: SleepDiaryEntry[];
  activities: BaActivity[];
  persistedState: JitaiPersistedState;
}
```

### 4.2 JITAI Service Files
1. **`src/services/jitaiEngine.ts`**:
   - `evaluateJitai(context: JitaiContext): JitaiNudge | null`
   - Pure, deterministic function that evaluates guardrails first, then sequentially tests:
     1. Acute agitation (Red Quadrant)
     2. Distress velocity / Mood drop
     3. Low mood hypo-arousal (Blue Quadrant)
     4. Sleep efficiency (<85%) / Sleep latency (>30 min) / WASO
     5. Behavioral inactivity
2. **`src/services/jitaiPersistence.ts`**:
   - Storage key: `'rima-jitai-state'`
   - `getJitaiState(currentDate?: string): JitaiPersistedState` (with auto-rollover when `stored.date !== todayStr`)
   - `saveJitaiState(state: JitaiPersistedState): void`
   - `dismissNudgeToday(type: JitaiNudgeType): void`
   - `recordNudgeImpression(type: JitaiNudgeType): void`
   - `resetJitaiState(): void`

### 4.3 Custom Hook (`src/hooks/useJitai.ts`)
- Consumes `useMood()` store, `getSleepHistory()`, and `getBaActivities()`.
- Reads `getJitaiState()` and subscribes to window `'local-storage'` events.
- Evaluates `evaluateJitai(context)` and returns `{ nudge: JitaiNudge | null, dismissNudge: () => void, acceptNudge: () => void }`.

### 4.4 UI Component (`src/components/common/JitaiNudgeCard.tsx`)
- Renders an accessible, high-contrast, dismissible card utilizing design tokens (`var(--bg-card)`, `var(--border-subtle)`, `var(--radius-lg)`).
- Action button with single-tap navigation to `targetRoute`.
- "Lewati untuk sekarang" (Dismiss) button invoking `dismissNudge()`.
- Subtle clinical evidence tag (e.g. *"JITAI Evidence-Based"*).

### 4.5 Integration in `src/pages/Home.tsx`
- Insert `<JitaiNudgeCard />` below `<EscalationBanner />` and above `.affirmation-card`.

### 4.6 Translation Parity (`src/i18n/*.json`)
- Add `"jitai"` namespace across all 8 language files (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) with exact parity.

---

## 5. Verification Method

To independently verify the architecture and any future implementation:

1. **Unit & Integration Test Verification**:
   - Run: `npx vitest run src/services/__tests__/jitaiEngine.test.ts`
   - Run: `npx vitest run src/components/__tests__/JitaiNudgeCard.test.tsx`
   - Expected: 100% pass covering:
     - Quiet hours suppression (22:00–07:00).
     - Daily cap suppression ($\ge 3$ nudges).
     - Cooldown enforcement ($< 4$ hours).
     - Daily dismiss persistence and date rollover.
     - Red quadrant triggering Cyclic Sighing / TIPP.
     - Blue quadrant triggering Micro BA spark.
     - Low sleep efficiency (<85%) triggering CBT-I stimulus control.
     - Inactivity triggering BA spark.
2. **Quality Gates Verification**:
   - `npm run lint` (`oxlint`): 0 warnings, 0 errors.
   - `npx tsc -b`: 0 errors.
   - `npm run test`: Full test suite passes 100%.
   - `npm run build`: Production build succeeds and generates PWA Service Worker assets.
3. **Invalidation Conditions**:
   - Any external network call during JITAI evaluation.
   - Re-appearance of a dismissed nudge type on the same calendar day.
   - Use of Tailwind CSS classes or non-token styling.
   - Missing translation keys in any of the 8 supported languages.
