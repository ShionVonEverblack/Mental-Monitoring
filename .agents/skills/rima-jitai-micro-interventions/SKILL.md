---
name: rima-jitai-micro-interventions
description: >-
  Rules and architectural patterns for designing Just-In-Time Adaptive Interventions (JITAI)
  and Ecological Momentary Interventions (EMI) in RIMA. Use when creating offline-first decision
  engines that deliver low-burden micro-coping nudges based on distress velocity, circadian rhythm,
  and behavioral inactivity without causing notification fatigue.
---

# RIMA Just-In-Time Adaptive Intervention (JITAI) Engine

## 1. Conceptual Framework & Clinical Rationale

According to *Nahum-Shani et al. (2018, Annals of Behavioral Medicine)*, traditional static digital mental health apps fail because they deliver support either on a rigid arbitrary schedule or passively await user initiation. 

A **JITAI** aims to provide the right type and amount of support, at the right time, by adapting to an individual's changing internal state and context.

### The 6 Core Elements of JITAI in RIMA
1. **Distal Outcome**: Long-term reduction in depressive/anxious distress (improved PHQ-9, GAD-7, and WHO-5 scores).
2. **Proximal Outcome**: Immediate post-intervention affect regulation (decrease in SUDS, improvement in valence within 15–30 minutes).
3. **Decision Points**: Deterministic moments in time when an intervention decision is computed locally.
4. **Tailoring Variables**: Real-time client inputs:
   - *Affective state* (most recent valence/arousal or mood score $\le 2$).
   - *Distress velocity* ($\Delta\text{Mood}$ over 3 consecutive entries showing negative slope).
   - *Circadian phase* (Morning reflection, midday peak, evening wind-down, sleep window).
   - *Time since last session* (Inactivity duration).
5. **Intervention Options**: Micro-actions requiring $<3$ minutes to complete (e.g. 60-second cyclic sighing, single self-compassion reframe, sensory check).
6. **Decision Rules**: Algorithmic rules mapping Tailoring Variables $\rightarrow$ Intervention Options.

---

## 2. JITAI Decision Engine Architecture (Offline-First)

```
┌──────────────────────────────────────────────────────────────┐
│                    Client Context Evaluator                   │
│  - Current Hour (Circadian Window)                           │
│  - Last 3 Mood Scores (Distress Velocity)                    │
│  - Hours Since Last App Check-in                             │
│  - Active Quiet Hours / Low-Stimulation State                │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  Anti-Habituation Guardrails                 │
│  - Cooldown elapsed? (>= 4 hours since last nudge)           │
│  - Daily cap reached? (< 3 nudges/day)                       │
│  - In quiet window? (22:00 - 07:00 -> SILENT)                │
└──────────────────────────────┬───────────────────────────────┘
                               │ PASS
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Deterministic Rule Matrix                  │
│  IF Distress Slope < -1.0      -> Somatic Vagal Pacer        │
│  IF Time In Bed > 20 min       -> CBT-I Stimulus Control     │
│  IF Inactive > 72h & Score < 3 -> Micro Behavioral Spark     │
│  IF High Energy Unpleasant     -> Cold Splash / PMR TIPP     │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. TypeScript Engine Specification

```typescript
export interface JITAIContext {
  currentTime: Date;
  lastCheckInTimestamp?: string;
  recentMoodScores: number[]; // last 1-5 scores (1 to 5)
  activeSensoryMode: boolean; // low-stimulation mode
  lastNudgeTimestamp?: string;
  dailyNudgeCount: number;
}

export type JITAIOption =
  | 'cyclic_sighing_60s'
  | 'grounding_micro_3step'
  | 'cbt_i_stimulus_exit'
  | 'behavioral_spark_sunlight'
  | 'compassion_break'
  | 'none';

export interface JITAIDecision {
  action: JITAIOption;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  suggestedRoute?: string;
}

export class JITAIEngine {
  private static MIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours
  private static MAX_DAILY_NUDGES = 3;

  static evaluate(ctx: JITAIContext): JITAIDecision {
    const hour = ctx.currentTime.getHours();

    // Guardrail 1: Respect Sleep Window / Quiet Hours (22:00 - 07:00)
    if (hour >= 22 || hour < 7) {
      return { action: 'none', reason: 'Quiet hours active', urgency: 'low' };
    }

    // Guardrail 2: Cap daily frequency to prevent notification burnout
    if (ctx.dailyNudgeCount >= this.MAX_DAILY_NUDGES) {
      return { action: 'none', reason: 'Daily cap reached', urgency: 'low' };
    }

    // Guardrail 3: Cooldown between interventions
    if (ctx.lastNudgeTimestamp) {
      const elapsed = ctx.currentTime.getTime() - new Date(ctx.lastNudgeTimestamp).getTime();
      if (elapsed < this.MIN_COOLDOWN_MS) {
        return { action: 'none', reason: 'Cooldown in progress', urgency: 'low' };
      }
    }

    // Rule 1: Rapid Distress Escalation (Last 2 entries <= 2)
    const len = ctx.recentMoodScores.length;
    if (len >= 2 && ctx.recentMoodScores[len - 1] <= 2 && ctx.recentMoodScores[len - 2] <= 2) {
      return {
        action: 'cyclic_sighing_60s',
        reason: 'Consecutive low mood detected; rapid vagal resetting needed',
        urgency: 'high',
        suggestedRoute: '/breathe',
      };
    }

    // Rule 2: Midday Fatigue / Prolonged Inactivity
    if (hour >= 13 && hour <= 16 && len > 0 && ctx.recentMoodScores[len - 1] === 3) {
      return {
        action: 'behavioral_spark_sunlight',
        reason: 'Afternoon energy slump; micro activation suggested',
        urgency: 'medium',
        suggestedRoute: '/activation',
      };
    }

    return { action: 'none', reason: 'No trigger condition met', urgency: 'low' };
  }
}
```

---

## 4. Ethical Guardrails for Mental Health Nudges

- **No Guilt Language**: Never say *"Kamu belum absen hari ini!"* or *"Streak-mu akan hilang!"*. Use compassionate, autonomy-supportive invitations: *"Ruang tenang siap kapan pun kamu butuh napas jeda 🌿"*.
- **Easy Dismissal**: Every JITAI card must have an explicit *"Lewati untuk sekarang"* button that dismisses the prompt without penalty.
- **Strict Privacy**: JITAI calculations run 100% locally in browser memory. No telemetry about user inactivity is broadcast to backend analytics.
