---
name: rima-future-feature-architecture
description: >-
  Comprehensive engineering blueprint and architectural framework enforcing RIMA's 6 core pillars
  (offline-first, zero-network telemetry, pure CSS tokens, 100% 8-language parity, defensive storage
  resilience, and 4-tier quality gates). Use when designing, building, testing, or auditing any feature.
---

# RIMA Future Feature Architecture Blueprint

## 1. The 6 Non-Negotiable Architectural Pillars

Every new feature, module, or enhancement introduced to RIMA (Ruang Interaksi Mental Aman) must strictly adhere to the following six foundational architectural pillars. Any code modification violating these pillars will be rejected at the architectural gate.

---

### Pillar 1: Offline-First Reliability
- **100% Local Autonomous Operation:** Every core therapeutic module—including Yale Mood Meter 2D, CBT-I Sleep Diary, Stanley-Brown Safety Plan, TIPP Crisis Hub, Web Audio Somatics, Grounding, and JITAI Nudge Engine—must operate with complete functionality without an active internet connection.
- **Network as Optional Enhancement:** Outbound network connectivity is restricted exclusively to optional community features (e.g., anonymous Supabase peer forum). If network connectivity fails or is absent, the application must operate seamlessly without UI blocking, alerts, or broken states.
- **Immediate Local Persistence:** User inputs and therapeutic logs must commit immediately to local storage before any asynchronous or optional remote synchronization is attempted.

---

### Pillar 2: Zero-Network Telemetry & Strict Privacy
- **Zero Third-Party Telemetry:** Strictly NO Google Analytics, Firebase Analytics, Sentry, Mixpanel, Datadog, Hotjar, or external telemetry beacons.
- **Client-Side Hashing & Encryption:** Sensitive user notes, reflective journals, and emergency contacts are encrypted directly on-device using the Web Crypto API (`AES-GCM-256` derived via `PBKDF2` with salt):
  ```typescript
  // Encrypted locally; raw payload never enters unencrypted storage
  export async function encryptSensitiveData(plainText: string, key: CryptoKey): Promise<EncryptedPayload> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(ciphertext)) };
  }
  ```
- **Direct Telephony for Crisis Intervention:** Emergency dialing shortcuts (e.g., Indonesian National Mental Health Hotline `119 Ext 8`) use native telephony protocols:
  ```html
  <a href="tel:119,8" class="emergency-dial-btn" role="button">
    Hubungi 119 Ekstensi 8
  </a>
  ```
  *(The comma provides a 2-second automated DTMF pause before dialing the extension on mobile cellular modems, bypassing any intermediary telephony servers).*

---

### Pillar 3: Pure Vanilla CSS Design Tokens (Zero Tailwind CSS)
- **STRICTLY ZERO TAILWIND CSS:** Never import or author Tailwind utility classes (`flex`, `items-center`, `bg-blue-500`, `p-4`, `text-center`).
- **Semantic CSS Custom Properties:** All styling must reference tokens defined in `src/styles/design-tokens.css` or scoped component classes in `src/styles/components.css`:
  - Surfaces: `var(--bg-primary)`, `var(--bg-card)`, `var(--bg-surface)`
  - Typography: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`
  - Accents: `var(--color-primary)`, `var(--color-secondary)`, `var(--border-subtle)`
- **Accessibility Standards (WCAG 2.2 AA):**
  - Minimum touch target dimension: `44px × 44px` for all clickable interactive controls.
  - Text contrast ratio: `≥ 4.5:1` against adjacent background colors (`≥ 7:1` preferred).
  - Explicit ARIA attributes on icon-only actions: `aria-label`, `aria-live="polite"`, `role="status"`.

---

### Pillar 4: 100% 8-Language Translation Parity
- **Supported Locales Matrix:**
  1. `id` — Indonesian (Primary Default)
  2. `en` — English
  3. `jv` — Javanese (Basa Jawa)
  4. `su` — Sundanese (Basa Sunda)
  5. `ja` — Japanese (日本語)
  6. `zh` — Chinese Simplified (简体中文)
  7. `es` — Spanish (Español)
  8. `ar` — Arabic (العربية — RTL)
- **Zero Missing Leaf Keys:** Every localized string must exist across all 8 files in `src/i18n/*.json` with identical JSON object structures.
- **No Empty Strings:** Values must not be empty strings (`""`), null, or undefined.
- **Bidirectional Layout (RTL):** When the active language is Arabic (`ar`), RIMA sets `document.documentElement.dir = 'rtl'`, reversing directional alignments, margins, and flex orders.

---

### Pillar 5: Defensive Storage Resilience
- **Namespace Isolation:** All local storage keys must use the `rima-` namespace prefix (e.g., `rima-mood-entries`, `rima-jitai-state-v1`, `rima-safety-card`).
- **Graceful Corruption Recovery:** All read operations from persistent storage (`localStorage` / `IndexedDB`) must employ defensive try/catch blocks with validated fallbacks:
  ```typescript
  export function loadSafeStorage<T>(key: string, fallbackDefault: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallbackDefault;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return fallbackDefault;
      return parsed as T;
    } catch (err) {
      console.warn(`[DefensiveStorage] Corrupted state at ${key}, reverting to fallback:`, err);
      return fallbackDefault;
    }
  }
  ```
- **Quota Management:** Check storage availability before persisting large payloads. Fail silently or prune older non-critical records without crashing UI components.

---

### Pillar 6: 4-Tier Automated Quality Gates
Every contribution must pass all four automated gates in CI and local verification:

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 1: Static Code Quality (Oxlint)                         │
│ Command: npm run lint                                        │
│ Criteria: 0 errors, 0 warnings across all files             │
├─────────────────────────────────────────────────────────────┤
│ Tier 2: Strict TypeScript Compiler                           │
│ Command: npx tsc -b                                          │
│ Criteria: 0 compiler errors (strict null checks enabled)    │
├─────────────────────────────────────────────────────────────┤
│ Tier 3: Unit, Component & Adversarial Testing (Vitest)       │
│ Command: npx vitest run                                      │
│ Criteria: 100% test pass rate across all suites (41+ files)  │
├─────────────────────────────────────────────────────────────┤
│ Tier 4: Production PWA Build & Bundle Budgeting              │
│ Command: npm run build                                       │
│ Criteria: Clean bundle, sw.js precaches 55 entries, index<55k│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Future Feature Implementation Runbook

Follow this 6-step workflow when implementing any future therapeutic feature in RIMA:

### Step 1: Privacy Assessment & Threat Modeling
1. Identify all data points captured by the feature.
2. Confirm zero external network requirements.
3. Designate the storage key with the `rima-` prefix.
4. If personal narratives or identifying contacts are stored, design on-device AES-GCM encryption.

### Step 2: Trauma-Informed UI & Accessibility Design
1. Utilize calm, non-judgmental color schemes from `design-tokens.css`.
2. Avoid abrupt popups, flashing animations, or aggressive red warning banners unless indicating immediate acute physical danger (C-SSRS Level 4+).
3. Implement sensory attribute adaptation:
   ```tsx
   // Support for calm and low-stimulation modes
   const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const isSensoryCalm = document.documentElement.getAttribute('data-sensory') === 'calm' || prefersReduced;
   ```
4. Verify interactive touch targets satisfy `min-height: 44px` and `min-width: 44px`.

### Step 3: Internationalization (i18n) Matrix
1. Define a semantic namespace in `src/i18n/id.json` (e.g., `newFeature: { ... }`).
2. Add exact matching translations across all 7 other language files: `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`.
3. Validate parity immediately:
   ```bash
   npx vitest run src/test/i18nParity.test.ts
   ```

### Step 4: Component & Service Implementation
1. **Business Logic Separation:** Pure logic belongs in `src/services/` (e.g., scoring algorithms, persistence handlers, trajectory analysis).
2. **Component Structure:** Presentation components belong in `src/components/`.
3. **Suspense & Code Splitting:** Heavy route-level components must use `React.lazy()` with `<Suspense fallback={<PageFallbackLoader />}>`.

### Step 5: Comprehensive Unit & Integration Testing
1. Create service unit tests in `src/services/__tests__/` covering:
   - Happy paths with deterministic mock inputs.
   - Corrupted or invalid localStorage state recovery.
   - Boundary conditions (empty logs, null dates, maximum scores).
2. Create component tests in `src/components/__tests__/` utilizing `@testing-library/react`:
   - ARIA role and label verification (`getByRole`, `findByLabelText`).
   - Interaction testing (click, keyboard navigation, focus management).
   - Reduced-motion / `data-sensory` attribute tests.

### Step 6: 4-Tier Automated Gate Verification
Run the complete suite of project verification commands:
```bash
npm run lint
npx tsc -b
npx vitest run
npm run build
```

---

## 3. Verification & Compliance Checklist

Use this checklist during PR reviews, architectural audits, and self-checks:

- [ ] **Zero Tailwind:** Scanned source code for Tailwind utility classes (`grep -rn "className=\"flex" src/` returns 0).
- [ ] **Pure Vanilla Tokens:** All colors and spacing reference `var(--token)` custom properties.
- [ ] **Offline Operation:** Feature operates seamlessly when browser DevTools is set to "Offline".
- [ ] **Zero Telemetry:** Zero outbound fetch/XHR calls to external analytics endpoints in Network tab.
- [ ] **i18n Parity:** 8/8 languages populated; `i18nParity.test.ts` passes with 0 missing or empty keys.
- [ ] **Defensive Persistence:** Tested with malformed JSON in localStorage; component falls back gracefully without crashing.
- [ ] **Accessible Touch Targets:** All buttons and interactive inputs meet minimum 44px dimension.
- [ ] **Screen Reader Support:** Accessible labels on all icons, proper `aria-live` announcements on dynamic states.
- [ ] **Bundle Budget Preserved:** `npm run build` completes within chunk size limits (`index.js < 55 kB`).
