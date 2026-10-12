---
trigger: always_on
description: Mandatory system-wide guardrails for all agent skills, enforcing YAML frontmatter compliance, <30K token context density compression, offline-first data integrity, UU PDP No. 27/2022 privacy, and client-side cryptography.
---

# RIMA System-Wide Agent Skill Guardrails & Compliance Framework

This document constitutes an always-on, non-negotiable architectural contract governing all autonomous agents, subagents, and automated workflows interacting with the RIMA (Ruang Interaksi Mental Aman) codebase. These rules override any conflicting instructions and are continuously evaluated on every turn.

---

## 1. YAML Frontmatter Standards (Antigravity & agentskills.io compatibility)

All declarative rules and modular skills MUST conform to the Google Antigravity and open `agentskills.io` YAML frontmatter specifications.

### 1.1 Specification & Trigger Matrix
| Artifact Type | File Location | Mandatory Frontmatter Keys | Prohibited Keys | Trigger Invariant |
|:---|:---|:---|:---|:---|
| **System Rules** | `.agents/rules/*.md` | `trigger: always_on`<br>`description: >-` | `name:` | `always_on` (universal injection) |
| **Modular Skills** | `.agents/skills/<name>/SKILL.md` | `name: <kebab-case>`<br>`description: >-` | `trigger: always_on` | On-demand (lazy evaluation only) |

### 1.2 Syntax & Formatting Invariants
- **Delimiters**: Frontmatter MUST open at Line 1, Column 1 with `---` and terminate with closing `---`.
- **Encoding**: UTF-8 without Byte Order Mark (BOM).
- **Mandatory Fields**: Rules require `trigger` and `description`. Skills require `name` and `description` (optional `license`).
- **Directory Parity**: The `name` field in `SKILL.md` MUST match its parent directory name in lowercase kebab-case (`^[a-z0-9-]+$`).
- **Descriptions**: Multi-line descriptions MUST use YAML folded block scalars (`description: >-`) with 2-space indentation, defining both *capabilities* and *explicit trigger conditions*.
- **Skill Isolation**: Skills MUST NEVER declare `trigger: always_on`. Declaring `trigger: always_on` in skills floods prompt context and violates the lazy-loading architecture.

### 1.3 Automated Validation Scripts
Agents and validation pipelines verify frontmatter integrity using automated validation scripts:
```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/rules/agent_skill_guardrails.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing opening frontmatter delimiter');
const parts = content.split('---');
if (parts.length < 3) throw new Error('Malformed YAML frontmatter delimiters');
const yaml = parts[1];
if (!/trigger:\s*always_on/.test(yaml)) throw new Error('Missing trigger: always_on');
if (!/description:\s*.+/.test(yaml)) throw new Error('Missing description field');
console.log('PASS: Rule frontmatter schema valid');
"
```

---

## 2. Context Density Compression (<30K token budget, <400 lines per file)

To prevent context window bloat, reduce KV-cache thrashing, and eliminate hallucination ("lost-in-the-middle"), all agents and skill authors MUST adhere to strict density compression standards.

### 2.1 Token Economics & Line Limits
| Metric | Upper Limit Threshold | Enforcement Mechanism |
|:---|:---|:---|
| **Active Turn Working Context** | `< 30,000 tokens` (<30K token budget) | Lazy skill loading; aggressive intermediate stdout pruning |
| **Skill File Length (`SKILL.md`)** | `< 400 lines` (<400 lines per file) | Modular decomposition into `references/` and `scripts/` |
| **Agent Briefing Ledger (`BRIEFING.md`)** | `< 100 lines` | Historical log archiving to `BRIEFING_ARCHIVE.md` |
| **Tool Inspection Slice (`view_file`)** | `≤ 150 lines` per slice | Mandatory use of `StartLine` and `EndLine` parameters |

### 2.2 Progressive Disclosure Pattern
- `SKILL.md` MUST serve as a lean, high-level standard operating procedure (SOP), decision tree, and command matrix through progressive disclosure.
- Large documentation, extended threat catalogs, and schema dumps MUST be placed in `references/<topic>.md` and read on-demand.
- Executable automation and validation utilities MUST reside in `scripts/<utility>.(js|py|sh)`.
- Monolithic preloading of multiple skills into prompt memory is strictly prohibited.

### 2.3 Tabular Synthesis & Structured Checklists
- Long narrative explanations MUST be synthesized into dense Markdown comparison matrices via tabular synthesis.
- Operational criteria and verification steps MUST be formatted as deterministic binary checklists (`- [ ]`).

---

## 3. Offline-First Data Integrity & Zero Runtime Telemetry

RIMA is an on-device, privacy-first psychiatric self-care application designed for individuals in vulnerable emotional states.

### 3.1 100% On-Device Processing for Therapeutic Engines
Every therapeutic module MUST execute locally on the user's client device with 100% on-device processing for Yale Mood Meter, JITAI, CBT-I, Web Audio with 0 external network requests:
1. **Yale Mood Meter 2D**: 2D circumplex coordinate taxonomy mapping Valence ($[-5, +5]$) and Arousal ($[-5, +5]$) across 4 quadrants and 16 granular emotions is evaluated 100% in-browser on canvas/SVG with 0 external network requests.
2. **JITAI (Just-In-Time Adaptive Intervention) Engine**: Evaluates local mood trajectories, sleep efficiency, and behavioral engagement deterministically. Enforces anti-habituation invariants: quiet hours (22:00–07:00), 4-hour cooldown (`14,400,000 ms`), and daily cap of 3 nudges.
3. **CBT-I Sleep Diary**: Calculates Sleep Efficiency ($(\text{Total Sleep Time} / \text{Time in Bed}) \times 100\%$), sleep latency, and WASO entirely on-device, persisting to `localStorage` (`rima-sleep-diary`) and IndexedDB (`rima-offline-db`).
4. **Somatics & Soundscapes (Web Audio)**: Synthesizes brown noise, pink noise, and binaural beats (Theta 6 Hz, Alpha 10 Hz) in real time using the browser Web Audio API, guaranteeing **0 KB external audio asset downloads**. Somatic grounding (5-4-3-2-1) and Box Breathing execute entirely via local DOM/CSS animations.

### 3.2 Strictly Zero Runtime External Telemetry & Analytics
- **Zero Analytics/Tracking SDKs**: Strictly FORBIDDEN to introduce zero analytics/tracking SDKs: no Google Analytics (`gtag`), Google Tag Manager, Meta Pixel, Mixpanel, Amplitude, Segment, Sentry, Datadog, or Hotjar.
- **Zero Telemetry Beacons**: Invocation of `navigator.sendBeacon()` is strictly prohibited across the codebase.
- **Zero Unconsented Outbound HTTP**: `fetch(`, `axios`, and `XMLHttpRequest` are prohibited in all core therapeutic features (0 external network requests).

### 3.3 Strict Dual-Mode Network Gatekeeping
- Network access is permitted solely for optional peer forum synchronization (`src/services/forumService.ts`) and Supabase authentication.
- Any network-touching block MUST be guarded by the active mode check:
  ```typescript
  if (!isNetworkAllowed()) {
    // Abort outbound network activity when airgapped or offline
    return;
  }
  ```
- When Air-Gapped Mode is active (`operatingMode === 'airgapped' || isAirgappedMode === true`), all outbound communication is completely blocked.

### 3.4 Workbox PWA Precache Invariants & Zero External CDNs
- **Zero Runtime CDNs**: All scripts, stylesheets, and icons MUST be bundled locally into Rollup chunks. Zero external CDN tags (`unpkg.com`, `cdnjs`, `jsdelivr`, `tailwindcss`).
- **Font Strategy**: Google Fonts are linked with Workbox `CacheFirst` runtime caching (365-day TTL) and fall back smoothly to the system sans-serif font stack when offline.
- **Workbox PWA Precache Invariants**: Production builds MUST generate a valid Service Worker precaching 100% of app shell assets and translation catalogs. `vite.config.ts` MUST configure Workbox `maximumFileSizeToCacheInBytes: 3000000` (3 MiB headroom) to guarantee error-free precaching of the partitioned translation dictionary (`i18n-locales`).
- **Rollup Chunk Partitioning**: Translation catalogs (`src/i18n/*.json`) MUST be isolated into `i18n-locales`, with i18n libraries grouped in `i18n-vendor`.

---

## 4. Statutory Privacy Compliance (Indonesian UU PDP No. 27/2022)

All patient and user interactions within RIMA are subject to the statutory provisions of **Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP No. 27/2022)**.

### 4.1 Sensitive Health Data Classification — Data Pribadi Spesifik (Pasal 4 & 16)
- Mood scores, emotional check-ins, CBT thoughts, psychiatric screeners (PHQ-9, GAD-7), sleep logs, and Stanley-Brown suicide safety plans constitute **Data Pribadi Spesifik** (Data Pribadi yang Bersifat Spesifik / Specific Personal Data) under Pasal 4 Ayat (2) huruf d UU PDP No. 27/2022.
- Under Pasal 4 & 16 UU PDP No. 27/2022, storing Data Pribadi Spesifik in unencrypted plaintext on remote servers or unpartitioned shared storage is strictly illegal.

### 4.2 Lawful Basis & Explicit Consent (Pasal 20 & 22)
- No user data may be persisted prior to affirmative, explicit consent captured via `<ConsentModal />` and recorded in `localStorage.getItem('rima-consent-accepted')`.
- Consent MUST be granular and revocable at any time without punitive service degradation.

### 4.3 Data Subject Rights / User Rights (Hak Subjek Data Pribadi - Pasal 5 s/d 13)
| Statutory User Rights | UU PDP Article | RIMA Implementation Invariant |
|:---|:---|:---|
| **Right to Access & Portability** | Pasal 7 | Structured JSON and CSV export (`exportImport.ts`) with CSV formula injection escaping (`=`, `+`, `-`, `@`, `\t`, `\r`) and UTF-8 BOM (`\uFEFF`). |
| **Right to Erasure (Hak Penghapusan)** | Pasal 8 | 1-tap complete wipe (`wipeAllUserData()`) clearing `localStorage`, IndexedDB, and CacheStorage. |
| **Right to Withdraw Consent** | Pasal 9 | User revocation immediately clears local encryption keys and triggers data purge. |
| **Right to Object to Automated Profiling** | Pasal 10 | JITAI recommendations and Mood Meter quadrant mappings are transparent, deterministic, and dismissible daily. |
| **Right to Restriction of Processing** | Pasal 11 | 1-tap Air-Gapped Mode toggle completely severs all network communication. |

### 4.4 Data Minimization & Anonymous Guest Mode Pseudonymization "Calm River" (Pasal 16 huruf a)
- Strictly ZERO collection of real names, phone numbers, National Identity Numbers (NIK), GPS coordinates, or persistent hardware identifiers.
- **Anonymous Guest Mode**: Public landing page (`src/pages/Landing.tsx`) provides 1-tap access ("Mulai sebagai Tamu Anonim") setting `rima-has-entered = 'true'` without registration.
- **Anonymous Guest Mode Pseudonymization "Calm River"**: In public community forums, real user identities are masked with random soothing pseudonyms (e.g., "Calm River") generated via `generateAnonymousName()`:
  ```typescript
  // Combines ANONYMOUS_ADJECTIVES (Calm, Brave, Gentle...) with ANONYMOUS_NOUNS (River, Mountain, Forest...)
  export const generateAnonymousName = (): string => {
    const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
    const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
    return `${adj} ${noun}`;
  };
  ```

### 4.5 Differential Privacy (epsilon <= 1.0) & Research Safeguards
- Any aggregated research or population analytics MUST enforce **$k$-Anonymity ($k \ge 10$)** (no cohorts $< 10$ individuals surfaced).
- Differential Privacy MUST enforce an epsilon ceiling of **$\epsilon \le 1.0$** (differential privacy epsilon <= 1.0) using calibrated Laplace perturbation:
  $$\text{Lap}\left(0, \frac{\text{sensitivity}}{\epsilon}\right)$$

### 4.6 72-Hour Breach Notification Standard (Pasal 46)
- Any cloud backend service maintaining sync MUST provide automated logging to support statutory written notification to data subjects and the regulatory authority (*Lembaga PDP*) within **72 hours ($3 \times 24$ jam)** of a confirmed security breach.

---

## 5. Client-Side Cryptographic Standards (Web Crypto AES-GCM-256 & PBKDF2)

All sensitive health data stored at rest (journals, safety plans, psychiatric thought records, forum payloads) MUST adhere to client-side cryptographic standards implemented via Web Crypto AES-GCM-256 and PBKDF2 600,000 iterations.

### 5.1 Cryptographic Primitives Specification
| Component | Standard / Algorithm | Parameters & Security Requirements |
|:---|:---|:---|
| **Cipher** | Web Crypto `AES-GCM-256` | 256-bit key length (`AES-GCM-256`); 128-bit authentication tag |
| **Initialization Vector (IV)** | Cryptographically Secure Random | **96-bit IV** (12 bytes) unique IV generated per encryption operation via `crypto.getRandomValues(new Uint8Array(12))` |
| **Key Derivation Function** | `PBKDF2-HMAC-SHA256` | 16-byte cryptographically secure random salt; PBKDF2 600,000 iterations in production (OWASP 2023+ standard) |
| **Test Environment Iterations** | Environment-gated override | 100 iterations permitted strictly when `isTestEnv` (`process.env.NODE_ENV === 'test'` or `Boolean(process.env.VITEST)`) is true |
| **Key Isolation** | Non-Extractable Volatile Memory | Non-extractable keys in volatile memory: derived `CryptoKey` MUST specify `extractable: false`; held only in volatile memory, never persisted to disk or serialized |

### 5.2 EncryptedPayload JSON Schema
All encrypted entities stored at rest or transmitted over the wire MUST conform to the versioned EncryptedPayload JSON schema and interface:
```typescript
export interface EncryptedPayload {
  version: 1;
  salt: string;       // Base64-encoded 16-byte random salt
  iv: string;         // Base64-encoded 12-byte (96-bit IV) random IV
  ciphertext: string; // Base64-encoded ciphertext with appended 128-bit authentication tag
}
```

Validation schema guard:
```typescript
export function isEncryptedPayload(data: unknown): data is EncryptedPayload {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  return (
    p.version === 1 &&
    typeof p.salt === 'string' && p.salt.length > 0 &&
    typeof p.iv === 'string' && p.iv.length > 0 &&
    typeof p.ciphertext === 'string' && p.ciphertext.length > 0
  );
}
```

### 5.3 Zero Plaintext at Rest & Defensive Failure Handling
- Sensitive entries committed to `localStorage` or remote tables MUST store only the `EncryptedPayload` or masked placeholders (`[Terkunci E2EE]`).
- Plaintext data MUST NEVER appear in `console.log` or error telemetry.
- If ciphertext decryption fails due to payload corruption or invalid keys, decryption routines MUST fail gracefully without throwing unhandled exceptions, returning sanitized fallback notifications:
  `"[Konten terenkripsi tidak dapat didekripsi]"`

---

## 6. Architectural Invariants & Preservation of 4 Quality Gates

### 6.1 Pure Vanilla CSS Design Tokens (Strictly Zero Tailwind CSS)
- **Zero Tailwind CSS**: Strictly FORBIDDEN to import, install, or use Tailwind CSS utility classes (`flex`, `items-center`, `p-4`, `text-center`, `bg-blue-500`, `grid`, etc.).
- **Pure Vanilla CSS Design Tokens**: All styling MUST reference semantic pure vanilla CSS design tokens defined in `src/styles/design-tokens.css` or scoped component classes in `src/styles/components.css`:
  - Surfaces: `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-card)`, `var(--bg-elevated)`, `var(--bg-glass-card)`
  - Typography: `var(--font-family-base)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
  - Accents: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-danger)`, `var(--border-subtle)`
  - Spacing & Elevation: `var(--spacing-xs)` to `var(--spacing-3xl)`, `var(--radius-sm)` to `var(--radius-full)`, `var(--shadow-card)`
- **Sensory & Accessibility Invariants (WCAG 2.2 AA)**:
  - Minimum touch target sizing of $\ge 48\text{px} \times 48\text{px}$ (`min-height: 48px`).
  - Text contrast ratio $\ge 4.5:1$ against adjacent backgrounds.
  - Full sensory support for `[data-sensory='calm']` and `[data-sensory='low-stimulation']` desaturating high-stimulus elements.

### 6.2 100% 8-Language i18n Parity
All user-facing text MUST maintain 100% 8-language i18n parity across all 8 supported language dictionaries in `src/i18n/`:
1. `id` — Indonesian (Bahasa Indonesia — Primary Default)
2. `en` — English
3. `jv` — Javanese (Basa Jawa)
4. `su` — Sundanese (Basa Sunda)
5. `ja` — Japanese (日本語)
6. `zh` — Chinese Simplified (简体中文)
7. `es` — Spanish (Español)
8. `ar` — Arabic (العربية — RTL Layout)

- **Parity Invariants**:
  - Every key in `id.json` MUST exist in the remaining 7 language files with identical hierarchical nesting (100% 8-language i18n parity).
  - Zero empty strings (`""`), null, or undefined leaf nodes allowed.
  - Arabic (`ar`) MUST provide proper bidirectional layout support (`dir="rtl"`).

### 6.3 The 4 Mandatory Repository Quality Gates
Every contribution, refactoring, or agent action MUST independently pass all 4 deterministic verification gates with exit code `0` (clean verification across oxlint, tsc -b, vitest, and vite build):

```bash
# Gate 1: Static Linter (oxlint) — 0 warnings and 0 errors across 171+ files
npm run lint

# Gate 2: Strict TypeScript Compiler — clean compilation across composite projects
npx tsc -b

# Gate 3: Unit & Integration Test Suite (Vitest) — 100% pass across all 65+ test files
npm test

# Gate 4: Production PWA Build — clean bundle & Workbox service worker precache
npm run build
```

Subjective assertions or untested claims are strictly rejected. Only clean verification across oxlint, tsc -b, vitest, and vite build with terminal exit code `0` across all 4 gates qualifies as completed work.
