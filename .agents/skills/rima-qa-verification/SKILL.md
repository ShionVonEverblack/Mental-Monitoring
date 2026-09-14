---
name: rima-qa-verification
description: >-
  Comprehensive quality assurance, automated testing, regression safeguards, and build verification runbook for RIMA.
  Use when validating any code modifications, running tests with Vitest, checking TypeScript types,
  running Oxlint, verifying PWA service workers, checking i18n key parity, or preparing for production deployment.
---

# RIMA Quality Assurance & Verification Runbook

## 1. Automated Verification Pipeline

Every change made to the RIMA codebase must pass the full 4-stage verification gate before being marked complete:

```
[Stage 1: TypeScript Check] ➔ [Stage 2: Unit/Service Tests] ➔ [Stage 3: Linting] ➔ [Stage 4: Vite Production Build]
```

### Command Sequence:
```bash
# 1. TypeScript Strict Type Check
npx tsc --noEmit

# 2. Vitest Test Suite Execution
npx vitest run

# 3. Fast Code Linting
npx oxlint

# 4. Production Bundle & PWA Service Worker Generation
npx vite build
```

---

## 2. Test Suite Map & Coverage Targets

All tests reside under `src/**/__tests__/`:

| Test File | Target Module | Critical Scenarios |
|:---|:---|:---|
| `crisisDetection.test.ts` | `crisisDetectionService.ts` | Lethal co-occurrences, slang ("bundir"), multilingual keywords, negation bypass ("tidak ingin mati") |
| `escalation.test.ts` | `escalationService.ts` | Level 0-3 thresholds, journal crisis trigger, 5-day declining trend, audit log persistence |
| `mood.test.ts` | `moodStore.ts` / `useMood.ts` | Score averaging, streak calculations, grace period retention |
| `helpers.test.ts` | `helpers.ts` | ID generation, date formatting, grace streak edge cases |
| `exportImport.test.ts` | `exportImport.ts` | CSV injection escaping, JSON schema validation, malicious payload rejection |

---

## 3. P0 Crisis Regression Checklist

The crisis safety path must NEVER fail. Before any release or major merge, verify the following 5 invariants:

- [ ] **No Dead Routes**: Escalation suggestions route to existing routes in `App.tsx` (`/professional-help`, `/safety-plan`, `/breathe`, `/journal`, `/forum`).
- [ ] **Emergency Dialer Format**: All phone links in `SOSButton.tsx`, `CrisisInterceptor.tsx`, and `ProfessionalHelp.tsx` use the pause-extension format `tel:119,8` (NOT `tel:1198`).
- [ ] **100% Client-Side Detection**: Disconnect network in DevTools (`Offline` mode) and type crisis text in Journal and Forum. Both MUST detect and escalate without error.
- [ ] **Negation Invariant**: Sentences containing `"tidak ingin mati"` or `"don't want to hurt myself"` must NEVER trigger a false-positive severe alert.
- [ ] **Severe Forum Post Block**: A user cannot submit a forum post containing acute suicidal intent. The submission must be intercepted by `<CrisisInterceptor />`.

---

## 4. i18n Key Parity Audit

All 8 translation files (`src/i18n/{id,en,jv,su,ja,zh,es,ar}.json`) must maintain 100% key parity.
To verify there are no missing keys across languages, run this quick check:

```bash
node -e "
const fs = require('fs');
const path = './src/i18n/';
const langs = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'];
const keys = {};
langs.forEach(l => {
  const data = JSON.parse(fs.readFileSync(path + l + '.json', 'utf-8'));
  keys[l] = new Set(Object.keys(data));
});
const baseKeys = keys['id'];
let hasDiff = false;
langs.forEach(l => {
  const missing = [...baseKeys].filter(k => !keys[l].has(k));
  if (missing.length > 0) {
    console.error('❌ ' + l + ' missing ' + missing.length + ' keys: ' + missing.slice(0, 3).join(', '));
    hasDiff = true;
  }
});
if (!hasDiff) console.log('✅ All 8 translation files have 100% key parity!');
"
```

---

## 5. PWA & Service Worker Validation

After running `npx vite build`, inspect the generated files in `dist/`:
1. `dist/manifest.webmanifest`: Confirm `name`, `short_name`, `theme_color` (`#1e293b`), and icon paths are present.
2. `dist/sw.js`: Workbox precache manifest must have $\ge 30$ precached entries.
3. **Sensitive Cache Inspection**: Open `dist/sw.js` and verify that no URLs containing personal user data or private APIs are cached. The Service Worker must only precache static application assets (JS, CSS, HTML, SVG, Web Fonts).

---

## 6. Capacitor Mobile Packaging Verification

RIMA is configured with Capacitor (`capacitor.config.ts`) for Android/iOS deployment:
- **App ID**: `com.rima.mentalhealth`
- **Web Dir**: `dist`
- To sync web assets to mobile platforms:
  ```bash
  npx cap sync
  ```
- Verify status bar and screen orientation configurations match trauma-informed guidelines (e.g., portrait lock for breathing exercises).
