## 2026-10-10T06:56:40Z
You are Worker M2 (Emergency Safety Card Worker).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original request is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md
Explorer 2 handoff report is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_2\handoff.md

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive file write ownership:
- src/services/safetyCardService.ts
- src/components/safety/FastActionSafetyCard.tsx
- src/components/safety/SOSButton.tsx
- src/services/__tests__/safetyCardService.test.ts
- src/components/__tests__/FastActionSafetyCard.test.tsx

Instructions:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_2/handoff.md.
2. Implement:
   - src/services/safetyCardService.ts: helper extracting primary coping strategy (from 'rima-safety-plan' or grounding default), trusted personal contact with phone number (from 'rima-trusted-contacts' or 'rima-safety-plan'), crisis line 119 Ext 8 (strictly formatted as href="tel:119,8"), and 112 emergency line.
   - src/components/safety/FastActionSafetyCard.tsx: accessible, high-contrast crisis de-escalation interface designed for acute emotional overwhelm and cognitive constriction. Includes:
     * Prominent primary coping action.
     * Single-tap call button for trusted contact (with working tel: link).
     * Single-tap call button for 119 Ext 8 (href="tel:119,8").
     * Direct somatic grounding shortcut (jumping to /grounding or /breathe).
     * Accessible dismiss/close button.
     * WCAG 2.2 AA touch targets (>= 48px).
     * Strictly vanilla CSS using existing design tokens (zero Tailwind).
   - src/components/safety/SOSButton.tsx: update to render/open the FastActionSafetyCard on click.
   - src/services/__tests__/safetyCardService.test.ts and src/components/__tests__/FastActionSafetyCard.test.tsx: thorough unit tests verifying all links, phone parsing, fallback behavior, accessibility roles, and button click handlers.
3. Verify your work:
   - Run `npx vitest run src/components/__tests__/FastActionSafetyCard.test.tsx src/services/__tests__/safetyCardService.test.ts`
   - Run `npm run lint`
   - Run `npx tsc -b`
4. Document all changes, test outputs, and verification commands in C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2_1\handoff.md.
5. Notify parent via send_message when complete.
