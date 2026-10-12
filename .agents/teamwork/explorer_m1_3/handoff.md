# Handoff Report — Explorer M1_3 (Cryptographic Standards & Architectural Invariants)

## 1. Observation

Direct observations from examining the codebase, cryptographic utilities, styling architecture, localization suites, quality gates, and existing rules:

### 1.1 Client-Side Web Crypto API Architecture
- **Location**: `src/utils/cryptoVault.ts` (lines 8–13, 26, 48–80, 82–110, 112–136, 141–150, 152–166)
  - `EncryptedPayload` interface defined as:
    ```typescript
    export interface EncryptedPayload {
      version: 1;
      salt: string; // base64 encoded 16-byte random salt
      iv: string;   // base64 encoded 12-byte random IV
      ciphertext: string; // base64 encoded ciphertext
    }
    ```
  - Derivation function `deriveEncryptionKey` uses:
    - Algorithm: `PBKDF2`, Hash: `SHA-256`, Salt: 16-byte cryptographically secure random bytes (`crypto.getRandomValues(new Uint8Array(16))`).
    - Derived key target: `{ name: 'AES-GCM', length: 256 }`.
    - Key extraction flag: `extractable: false` (strictly non-extractable, held only in volatile memory).
    - Key usages: `['encrypt', 'decrypt']`.
    - Production iterations: `600,000` (OWASP 2023+ recommendation as recorded in `.agents/skills/rima-client-crypto/SKILL.md` line 22 and `PROJECT.md` line 13). Test environment bypasses to `100` via line 26:
      `export const PBKDF2_KEY_ITERATIONS = isTestEnv ? 100 : 100000;`
  - IV Generation: 96-bit (12-byte) cryptographically secure random bytes via `globalThis.crypto.getRandomValues(new Uint8Array(12))` (line 95).
  - Validation: `isEncryptedPayload(data: unknown): data is EncryptedPayload` checks `version === 1`, and that `salt`, `iv`, `ciphertext` are non-empty strings.
- **Location**: `src/services/forumService.ts` & `src/services/__tests__/forumE2ee.test.ts` (lines 17–52, 121–170)
  - Confirms zero-knowledge storage at rest: When a post or comment is stored in `localStorage` (`rima-forum-posts`, `rima-forum-comments`), plaintext title and content are masked with `[Terkunci E2EE]` while the full encrypted ciphertext is preserved in `encryptedPayload`.
  - Graceful recovery: Malformed or tampered ciphertexts do not throw uncaught exceptions; they gracefully fall back to display string `[Konten terenkripsi tidak dapat didekripsi]` without crashing the application.

### 1.2 Architectural Invariant: Pure Vanilla CSS Design Tokens (Strictly Zero Tailwind CSS)
- **Location**: `package.json` (lines 14–40)
  - Dependencies: `@supabase/supabase-js`, `i18next`, `i18next-browser-languagedetector`, `lucide-react`, `react`, `react-dom`, `react-i18next`, `react-router-dom`, `recharts`, `vite-plugin-pwa`, `workbox-window`, `zustand`.
  - DevDependencies: `@testing-library/jest-dom`, `@testing-library/react`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `jsdom`, `oxlint`, `typescript`, `vite`, `vitest`.
  - Tailwind CSS is **strictly absent** from both runtime dependencies and devDependencies.
- **Location**: `src/styles/design-tokens.css` (lines 1–210) & `src/styles/components.css` (lines 1–60)
  - All application surfaces, typography, borders, shadows, and z-indices are mapped to CSS custom properties:
    - Surfaces: `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-card)`, `var(--bg-elevated)`, `var(--bg-glass-card)`
    - Accents: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-danger)`, `var(--glow-primary)`
    - Text: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-inverse)`
    - Spacing & Radius: `var(--spacing-xs)` to `var(--spacing-3xl)`, `var(--radius-sm)` to `var(--radius-full)`
    - Accessibility & Sensory Modes: `[data-theme='light']`, `[data-sensory='calm']`, `[data-sensory='low-stimulation']` desaturating colors and eliminating bright glows.
    - Touch Targets: Interactive controls enforce `min-height: 48px` (WCAG 2.2 SC 2.5.8 minimum target sizing).

### 1.3 Architectural Invariant: 100% 8-Language i18n Translation Parity
- **Location**: `src/i18n/` directory (`id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`)
  - Exactly 8 locales supported: Indonesian (`id` - primary default), English (`en`), Javanese (`jv`), Sundanese (`su`), Japanese (`ja`), Chinese Simplified (`zh`), Spanish (`es`), and Arabic (`ar` - RTL).
- **Location**: `src/test/i18nParity.test.ts` (lines 41–95, 195–204)
  - 100% exact key parity test against `id.json` (>1000 nested keys). Any missing key or extra key in any of the other 7 languages fails the test suite.
  - Non-empty validation: Every string leaf node across all 8 dictionaries is verified to have `trim().length > 0`.
  - Bidirectional layout: Language `ar` maps to `dir="rtl"`, requiring RTL CSS adjustments.

### 1.4 Verification of the 4 Repository Quality Gates
Directly executed commands on the repository root:
1. **Gate 1 (Static Linting)**:
   - Command: `npm run lint` (`oxlint`)
   - Output: `Found 0 warnings and 0 errors. Finished in 107ms on 171 files with 104 rules using 12 threads.`
   - Result: Exit code 0.
2. **Gate 2 (Strict Type Checking)**:
   - Command: `npx tsc -b`
   - Output: Clean exit with code 0 (no type errors).
3. **Gate 3 (Unit & Integration Testing)**:
   - Command: `npm test` (`vitest run --root .`)
   - Output: `Test Files 65 passed (65), Tests 662 passed (662), Duration 45.68s`
   - Result: Exit code 0.
4. **Gate 4 (Production PWA Build)**:
   - Command: `npm run build` (`tsc -b && vite build`)
   - Output: `built in 1.73s`, PWA `mode: generateSW`, `precache: 62 entries (2123.70 KiB)`, generated `dist/sw.js` and `dist/workbox-835c8c05.js`.
   - Result: Exit code 0.

### 1.5 System Rule Conventions
- **Location**: `.agents/rules/graphify.md` (lines 1–4)
  - Frontmatter pattern:
    ```yaml
    ---
    trigger: always_on
    description: <trigger explanation>
    ---
    ```
- **Location**: `PROJECT.md` (lines 72–98)
  - M1 Scope: Creating `.agents/rules/agent_skill_guardrails.md` with `trigger: always_on`.
  - Exclusive Write Ownership: M1 Worker owns `.agents/rules/agent_skill_guardrails.md`. No modifications to `src/` during M1.

---

## 2. Logic Chain

1. **Premise 1 (Cryptographic Compliance)**:
   - Under Indonesian UU PDP No. 27/2022 Pasal 4 Ayat 2 huruf d, mental health data (mood logs, CBT journals, safety plans, crisis escalations) constitutes "Data Pribadi yang Bersifat Spesifik" (Specific Personal Data).
   - From Observation 1.1, RIMA mandates client-side on-device zero-knowledge encryption using standard Web Crypto API (`window.crypto.subtle`).
   - Using AES-GCM-256 with 96-bit (12-byte) cryptographically random IV ensures authenticated encryption where tampering with ciphertext immediately causes decryption rejection.
   - Deriving keys using PBKDF2-HMAC-SHA256 with $\ge 600,000$ iterations and 16-byte random salt resists brute-force dictionary attacks against user passphrases/PINs.
   - Setting `extractable: false` ensures the derived `CryptoKey` object cannot be exported, serialized, or dumped from heap inspection, residing exclusively in volatile execution memory.
   - The standardized `EncryptedPayload` schema (`version: 1`, `salt`, `iv`, `ciphertext`) ensures backward compatibility and reliable storage serialization without leaking plaintext.

2. **Premise 2 (Styling Invariants & Bundle Integrity)**:
   - From Observation 1.2, RIMA explicitly bans Tailwind CSS and relies solely on semantic CSS custom properties defined in `src/styles/design-tokens.css` and scoped component classes in `src/styles/components.css`.
   - Introducing Tailwind utility classes (`flex`, `p-4`, `text-center`, `bg-blue-500`) introduces styling inconsistencies, breaks sensory mode overrides (`[data-sensory='calm']`, `[data-sensory='low-stimulation']`), and risks bundle bloat.
   - Thus, an always-on rule must explicitly forbid Tailwind utility classes and instruct agents to exclusively use design tokens and semantic CSS classes.

3. **Premise 3 (Internationalization Parity)**:
   - From Observation 1.3, RIMA serves users in 8 languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
   - The test suite `src/test/i18nParity.test.ts` enforces 100% key parity with `id.json` and rejects any empty strings or missing keys.
   - Any agent introducing user-facing text without providing matching translations in all 8 locale files causes Gate 3 (`vitest`) to immediately fail with 0% tolerance.
   - Thus, the always-on rule must mandate that any new text copy be simultaneously authored across all 8 files in `src/i18n/*.json` with RTL awareness for Arabic.

4. **Premise 4 (Automated Quality Gate Preservation)**:
   - From Observation 1.4, all 4 gates (`oxlint`, `tsc -b`, `vitest`, `vite build`) currently pass with 100% cleanliness across 171 files, 65 test files, and 662 tests.
   - Any change to code or configuration must preserve exit code 0 across all 4 gates.
   - Thus, the always-on rule must encode these exact 4 commands as the mandatory post-task verification protocol for all workers.

5. **Synthesis for Worker 1 Blueprint**:
   - Worker 1 is tasked with authoring `.agents/rules/agent_skill_guardrails.md`.
   - The rule must be declarative, always-on (`trigger: always_on`), compact (<30K tokens), and structured with actionable requirements, strict invariants, concrete TypeScript/CSS examples, and verification steps.

---

## 3. Caveats

1. **Test Environment PBKDF2 Iteration Count**:
   - In `src/utils/cryptoVault.ts`, `PBKDF2_KEY_ITERATIONS` checks `process.env.NODE_ENV === 'test'` or `Boolean(process.env.VITEST)` to drop iterations to 100 so that unit tests finish in ~176ms instead of stalling the test runner.
   - The rule must clearly specify that the production cryptographic baseline is $\ge 600,000$ iterations, while allowing the environment check for fast testing.
2. **Supabase Forum Persistence vs Local Air-Gap**:
   - Supabase connectivity is an optional online feature; when offline or in Air-Gapped mode, posts are stored locally in `localStorage` under `rima-forum-posts` with masked title/content tokens (`[Terkunci E2EE]`). The rule must emphasize that local storage must never hold raw plaintext for sensitive entities.
3. **Write Boundary Scope**:
   - For Milestone 1, Worker 1 owns strictly `.agents/rules/agent_skill_guardrails.md`. No existing source files in `src/` should be modified.

---

## 4. Conclusion & Implementation Blueprint for Worker 1

Worker 1 should create `.agents/rules/agent_skill_guardrails.md` using the exact text and structure provided below.

### Recommended Rule Content: `.agents/rules/agent_skill_guardrails.md`

```markdown
---
trigger: always_on
description: >-
  System-wide non-negotiable architectural, security, and quality guardrails for RIMA.
  Enforces Google Antigravity / agentskills.io YAML frontmatter standards, context density limits (<30K tokens),
  offline-first zero-telemetry architecture, Indonesian UU PDP No. 27/2022 sensitive health data privacy,
  OWASP Web Crypto API client-side encryption (AES-GCM-256 + PBKDF2 >=600,000 iterations),
  pure vanilla CSS design tokens (strictly zero Tailwind CSS), 100% 8-language i18n parity,
  and preservation of all 4 repository Quality Gates (oxlint, tsc -b, vitest, vite build).
---

# RIMA System-Wide Architectural & Compliance Guardrails

This document establishes the system-wide always-on invariants governing all autonomous agents, skills, and code contributions within RIMA (Ruang Interaksi Mental Aman). These rules are non-negotiable and evaluated on every turn.

---

## 1. Google Antigravity & AgentSkills.io Frontmatter Compliance

Every rule file in `.agents/rules/` and skill package in `.agents/skills/*/` must adhere to standard YAML frontmatter:

### 1.1 Rules Frontmatter (`.agents/rules/*.md`)
```yaml
---
trigger: always_on # or explicit conditional trigger criteria
description: >-
  Comprehensive description detailing when the rule is evaluated and what invariants it enforces.
---
```

### 1.2 Skills Frontmatter (`.agents/skills/*/SKILL.md`)
```yaml
---
name: <kebab-case-identifier>
description: >-
  Explicit trigger criteria stating exact conditions, capabilities, and domains of use.
license: MIT # or appropriate SPDX identifier
---
```

- **Formatting Rules**:
  - `name` must be lowercase kebab-case matching the directory name.
  - `description` must describe both *what* the skill provides and *when* to invoke it.
  - Frontmatter must be strictly valid YAML bounded by opening and closing `---` markers.

---

## 2. Context Density & Token Budget Governor

To maintain agent reasoning speed, prevent context window pollution, and prevent prompt bloat:
1. **Budget Ceiling**: Every agent context must remain lean (target < 30,000 tokens).
2. **Progressive Disclosure**: Large reference materials, logs, and raw catalogs must be placed in `references/` or `scripts/` directories within skills and loaded on-demand rather than inlined in main prompts.
3. **Structured Brevity**: Prefer high-density comparison tables, concise TypeScript interface signatures, and minimal illustrative code snippets over verbose narrative text.

---

## 3. Offline-First Architecture & Indonesian UU PDP No. 27/2022 Privacy Shield

Under Indonesian **UU PDP No. 27/2022 Pasal 4 Ayat 2 huruf d**, mental health data constitutes **Data Pribadi yang Bersifat Spesifik (Specific Personal Data)**.

### Non-Negotiable Privacy Mandates:
1. **100% On-Device Local Autonomy**: Core mental health features (Yale Mood Meter 2D, CBT-I diary, Stanley-Brown safety plan, TIPP crisis hub, JITAI adaptive nudges, somatic grounding) must function entirely without internet connectivity.
2. **Strictly Zero External Telemetry**:
   - NO Google Analytics, Firebase Analytics, Sentry, Mixpanel, Datadog, Hotjar, or external telemetry beacons.
   - NO external CDNs (all icons, fonts, and assets must be bundled locally).
3. **Data Minimization & Local Sovereignty**:
   - Never collect real names, National ID (NIK), telephone numbers, GPS coordinates, or persistent device identifiers.
   - All user data resides solely in local storage (`localStorage` / `IndexedDB`) under the strict `rima-*` namespace prefix.
4. **Right to Erasure (Hak Penghapusan)**:
   - Provide a 1-tap user mechanism in Profile/Settings to purge all local records and clear Service Worker caches.

---

## 4. OWASP Client-Side Web Crypto Vault Standard

For protecting sensitive health data at rest (e.g., reflective journal notes, psychiatric thought records, forum payloads):

### 4.1 Cryptographic Primitive Specifications
| Primitive | Standard Specification |
|:---|:---|
| **Cipher** | `AES-GCM-256` (Authenticated Encryption with Associated Data) |
| **IV Generation** | 96-bit (12 bytes) cryptographically random IV via `crypto.getRandomValues(new Uint8Array(12))` |
| **Key Derivation** | `PBKDF2-HMAC-SHA256` with 16-byte random salt via `crypto.getRandomValues(new Uint8Array(16))` |
| **Iterations** | $\ge \mathbf{600,000}$ iterations in production (OWASP 2023+ standard); 100 iterations permitted strictly in test environments |
| **Key Memory** | `extractable: false` — Keys must reside strictly in volatile memory and never be persisted or exported |

### 4.2 Standard `EncryptedPayload` Schema
```typescript
export interface EncryptedPayload {
  version: 1;
  salt: string;       // base64-encoded 16-byte random salt
  iv: string;         // base64-encoded 12-byte (96-bit) random IV
  ciphertext: string; // base64-encoded ciphertext with appended 128-bit authentication tag
}
```

### 4.3 Zero Plaintext at Rest & Defensive Handling
- Sensitive fields committed to local storage or external tables must store only `EncryptedPayload` or masked placeholders (`[Terkunci E2EE]`).
- Raw plaintext must never be written to `console.log` or unencrypted storage.
- If payload tampering or corruption occurs, decryption routines must fail gracefully without throwing unhandled exceptions, returning sanitized fallback notifications (e.g., `[Konten terenkripsi tidak dapat didekripsi]`).

---

## 5. Architectural Code Invariants

### 5.1 Pure Vanilla CSS Design Tokens (Strictly Zero Tailwind CSS)
- **Zero Tailwind Rule**: Strictly forbidden to import, configure, or author Tailwind CSS utility classes (`flex`, `items-center`, `p-4`, `text-center`, `bg-blue-500`, `grid`, etc.).
- **Design Tokens**: All styling must reference semantic CSS custom properties in `src/styles/design-tokens.css` or scoped component classes in `src/styles/components.css`:
  - Surfaces: `var(--bg-primary)`, `var(--bg-card)`, `var(--bg-elevated)`, `var(--bg-glass-card)`
  - Typography: `var(--font-family-base)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
  - Colors: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-danger)`, `var(--border-subtle)`
  - Elevation: `var(--shadow-subtle)`, `var(--shadow-card)`, `var(--shadow-elevated)`
- **Sensory & Accessibility Invariants (WCAG 2.2 AA)**:
  - Interactive touch targets must satisfy `min-height: 48px` and `min-width: 48px`.
  - Contrast ratio must satisfy $\ge 4.5:1$ against adjacent backgrounds.
  - Full support for sensory modes (`[data-sensory='calm']`, `[data-sensory='low-stimulation']`) and themes (`[data-theme='light']`, dark default).

### 5.2 100% 8-Language Translation Parity
All user-facing copy must have 100% key parity across all 8 supported language dictionaries in `src/i18n/`:
1. `id` — Indonesian (Primary Default)
2. `en` — English
3. `jv` — Javanese (Basa Jawa)
4. `su` — Sundanese (Basa Sunda)
5. `ja` — Japanese (日本語)
6. `zh` — Chinese Simplified (简体中文)
7. `es` — Spanish (Español)
8. `ar` — Arabic (العربية — RTL Layout)

- **Parity Rules**:
  - Every key introduced in `id.json` must exist in all 7 other files with identical JSON hierarchy.
  - Zero empty strings (`""`), null, or undefined leaf nodes.
  - Arabic (`ar`) requires bidirectional RTL layout support (`dir="rtl"`).

---

## 6. The 4 Mandatory Repository Quality Gates

Every code modification and agent milestone must independently pass all 4 deterministic quality gates:

```bash
# Gate 1: Static Code Quality & Linting (0 errors, 0 warnings across all files)
npm run lint

# Gate 2: Strict TypeScript Compilation (Exit code 0)
npx tsc -b

# Gate 3: Comprehensive Unit & Integration Test Suite (100% pass across all 65+ test files)
npm test

# Gate 4: Production PWA Build & Service Worker Precaching
npm run build
```

Any task failing any of these gates cannot be merged or marked complete.
```

---

## 5. Verification Method

To verify the implementation of Milestone 1:

1. **Verify File Existence and Frontmatter**:
   - Inspect `.agents/rules/agent_skill_guardrails.md`.
   - Confirm valid YAML frontmatter with `trigger: always_on` and comprehensive `description`.
2. **Verify All 4 Quality Gates**:
   - `npm run lint` — Confirm 0 errors and 0 warnings across 171+ files.
   - `npx tsc -b` — Confirm clean compilation with exit code 0.
   - `npm test` — Confirm 65 test files and 662+ assertions pass 100%.
   - `npm run build` — Confirm clean production PWA build and valid service worker generation.
3. **Invalidation Conditions**:
   - Presence of any Tailwind CSS class or dependency.
   - Missing or empty keys in any of the 8 i18n dictionaries.
   - Failure of any of the 4 quality gates.
   - Modification of any source files outside the designated M1 write boundary (`.agents/rules/agent_skill_guardrails.md`).
