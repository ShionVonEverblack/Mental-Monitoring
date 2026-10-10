## 2026-10-10T06:56:40Z

You are Worker M1 (JITAI Engine Worker).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original request is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md
Explorer 1 handoff report is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_1\handoff.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive file write ownership:
- src/types/jitai.ts
- src/services/jitaiEngine.ts
- src/services/jitaiPersistence.ts
- src/hooks/useJitai.ts
- src/services/__tests__/jitaiEngine.test.ts
- src/services/__tests__/jitaiPersistence.test.ts

Instructions:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_1/handoff.md.
2. Implement:
   - src/types/jitai.ts: define JitaiNudge, JitaiNudgeType, JitaiContext, JitaiPersistedState, etc.
   - src/services/jitaiEngine.ts: deterministic evaluateJitai(context) pure function evaluating Yale Mood Meter 2D (Red quadrant vagal reset, Blue quadrant micro BA spark, steep negative slope recovery), CBT-I sleep efficiency (<85% stimulus control, SOL >30m, WASO >30m), and behavioral inactivity (>48h no BA activity with stagnant mood). Enforce anti-habituation guardrails: quiet hours (22:00-07:00), 4-hour cooldown, 3-nudge daily cap.
   - src/services/jitaiPersistence.ts: local storage manager under key 'rima-jitai-state' with calendar-day rollover, auto-reset on new day, dismissNudgeToday(type), recordNudgeImpression(type).
   - src/hooks/useJitai.ts: React hook binding moodStore, sleepService, BA activities, and storage events ('local-storage').
   - src/services/__tests__/jitaiEngine.test.ts and jitaiPersistence.test.ts: thorough unit tests covering all rules, edge cases, boundaries, and date rollovers.
3. Verify your work:
   - Run `npx vitest run src/services/__tests__/jitaiEngine.test.ts src/services/__tests__/jitaiPersistence.test.ts`
   - Run `npm run lint`
   - Run `npx tsc -b`
4. Document all changes, test outputs, and verification commands in C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1_1\handoff.md.
5. Notify parent via send_message when complete.
