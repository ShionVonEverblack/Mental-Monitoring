---
name: anthropic-cybersecurity-skills
description: >-
  Comprehensive cybersecurity and privacy audit playbook based on NIST CSF 2.0, NIST AI RMF,
  MITRE ATT&CK, Web Crypto cryptographic protection, input/injection sanitization, and Indonesian
  UU PDP No. 27/2022 compliance. Use when conducting security reviews, vulnerability assessments,
  cryptographic hardening, or regulatory data privacy audits.
license: Apache-2.0
metadata:
  category: cybersecurity-and-privacy
  upstream: https://github.com/mukul975/Anthropic-Cybersecurity-Skills
---

# Anthropic Cybersecurity & Privacy Audit Skill

This skill provides standardized audit runbooks, cryptographic blueprints, injection defense pipelines, and regulatory compliance frameworks derived from Anthropic Cybersecurity Skills, NIST CSF 2.0, NIST AI RMF, MITRE ATT&CK, and Indonesian UU PDP No. 27/2022.

---

## 1. Multi-Framework Security Architecture & NIST CSF 2.0 Mapping

Audits evaluate target software across 29 security domains mapped to NIST CSF 2.0:

| NIST CSF Function | Domain Count | Core Security Controls & Audit Checkpoints |
|:---|:---:|:---|
| **Govern (GV)** | 5 | Cybersecurity supply chain risk management, AI governance policy, privacy risk management, roles & responsibilities. |
| **Identify (ID)** | 6 | Asset inventory, risk assessment, vulnerability scanning, threat modeling (STRIDE), data classification. |
| **Protect (PR)** | 7 | Client-side cryptographic isolation, Identity and Access Management (IAM), input sanitization, least-privilege network policies. |
| **Detect (DE)** | 4 | Anomaly detection, audit logging without PII leakage, continuous monitoring, security event validation. |
| **Respond (RS)** | 4 | Incident management, automated blast-radius containment, 72-hour regulatory breach disclosure notification. |
| **Recover (RC)** | 3 | Zero-knowledge cryptographic backup restoration, disaster recovery plans, post-incident forensic reviews. |

---

## 2. NIST AI RMF & MITRE ATLAS / ATT&CK Alignment

AI interactions and agent runtimes introduce unique threat vectors requiring defensive controls:

| Threat Category | MITRE ATLAS ID | Attack Vector Description | Defensive Architectural Countermeasure |
|:---|:---|:---|:---|
| **Direct Prompt Injection** | `AML.T0051` | Delimiter escaping (e.g. `</response>`, `SYSTEM OVERRIDE`) attempting instruction hijacking. | XML boundary tagging `<user_input>${input}</user_input>` with strict parser taint tracking. |
| **Indirect Prompt Injection** | `AML.T0054` | Malicious payloads embedded in untrusted external text, documents, or synced peer forum posts. | Multi-tier input boundary sanitization; strict prohibition of code execution from external feeds. |
| **Training Data Poisoning** | `AML.T0020` | Manipulated telemetry or malicious user-reported datasets poisoning adaptive models. | Differential privacy ($\epsilon \le 1.0$), Laplace noise injection, and outlier outlier rejection ($k \ge 10$). |
| **Model Inversion / Leakage** | `AML.T0024` | Probing model outputs to reconstruct private user training records or session context. | Zero-PII retention policy, strict output token filtering, and localized inference boundaries. |
| **Insecure Output Handling** | `AML.T0043` | Model output directly injected into DOM or system commands without sanitization. | Strict DOMPurify pipeline; zero `eval()`, zero unescaped `innerHTML`, and zero raw shell command execution. |

---

## 3. Web Crypto API Zero-Knowledge Protection Blueprint

All sensitive records (mental health journals, crisis contacts, reflective logs) must be protected with client-side zero-knowledge encryption:

### 3.1 Cryptographic Specification
- **Algorithm**: `AES-GCM` with a 256-bit key length and an unpadded 128-bit authentication tag.
- **Initialization Vector (IV)**: 96-bit (12 bytes) cryptographically secure random bytes generated per encryption event via `crypto.getRandomValues(new Uint8Array(12))`. **Never reuse an IV with the same key**.
- **Key Derivation (KDF)**: `PBKDF2-HMAC-SHA256` using **600,000 iterations** (OWASP 2023+ standard) and a 16-byte random salt. Test environments may use a reduced iteration count (e.g. 100) guarded by `isTestEnv`.
- **Memory Security**: Derived `CryptoKey` must specify `extractable: false`, preventing key extraction via memory dumps.

### 3.2 Canonical TypeScript Implementation

```typescript
export interface EncryptedPayload {
  version: 1;
  salt: string;       // base64-encoded 16-byte salt
  iv: string;         // base64-encoded 12-byte IV
  ciphertext: string; // base64-encoded ciphertext + 16-byte authentication tag
}

export function isEncryptedPayload(obj: unknown): obj is EncryptedPayload {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return p.version === 1 && typeof p.salt === 'string' && typeof p.iv === 'string' && typeof p.ciphertext === 'string';
}

export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = 600000
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable key
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plaintext: string, passphrase: string, iterations = 600000): Promise<EncryptedPayload> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, iterations);
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    version: 1,
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer))),
  };
}

export async function decryptData(payload: EncryptedPayload, passphrase: string, iterations = 600000): Promise<string> {
  const salt = Uint8Array.from(atob(payload.salt), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0));

  const key = await deriveKey(passphrase, salt, iterations);
  const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decryptedBuffer);
}
```

---

## 4. Input & Injection Sanitization Engine

### 4.1 Prompt Injection Taint Shield
```typescript
export function wrapUserInputBoundary(rawInput: string): string {
  // Neutralize closing tag escapes
  const sanitized = rawInput
    .replace(/<\/user_input>/gi, '&lt;/user_input&gt;')
    .replace(/<\|endoftext\|>/gi, '')
    .replace(/<\|im_start\|>/gi, '')
    .replace(/<\|im_end\|>/gi, '');
  return `<user_input>\n${sanitized}\n</user_input>`;
}
```

### 4.2 DOMPurify HTML Sanitization Policy
```typescript
import DOMPurify from 'dompurify';

export const RESTRICTIVE_PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'svg', 'math'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  ADD_ATTR: ['rel="noopener noreferrer"'],
};

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, RESTRICTIVE_PURIFY_CONFIG);
}
```

### 4.3 Command & Query Injection Prevention
- Zero string interpolation for database queries; use parameterized schemas only.
- Prohibit shell execution using unvalidated user inputs (`child_process.exec` forbidden; use argument arrays with `execFile`).

---

## 5. Indonesian UU PDP No. 27/2022 Statutory Privacy Audit

### 5.1 Legal Classification & Statutory Matrix
Mental health telemetry, mood logs, and clinical self-screening results are legally classified as **Data Pribadi Spesifik (Sensitive Personal Data)** under Pasal 4 Ayat (2) huruf d & Pasal 16 UU PDP No. 27/2022:

| Article | Statutory Mandate | Technical Implementation in RIMA |
|:---|:---|:---|
| **Pasal 4 Ayat (2)** | Specific personal data includes health records, biometric, genetics, sexual orientation, and criminal records. | Heightened encryption (AES-GCM-256 + 600K PBKDF2 iterations) applied to all assessment and journal entries. |
| **Pasal 16 Huruf a** | Obligation to record processing activities and enforce data pseudonymization/anonymization. | Anonymous Guest Mode automatically assigns random pseudonym ("Calm River") via `generateAnonymousName()`. |
| **Pasal 20 & 22** | Explicit, documented, and informed consent must be recorded prior to data processing. | Granular consent modal presented at first launch; consent status recorded locally in `rima-consent-v1`. |
| **Pasal 7** | Right of data subjects to access, obtain, and port personal data in structured machine-readable format. | Client-side JSON & CSV export with UTF-8 BOM (`\uFEFF`) and CSV formula injection escaping (`'=`, `'+`, `'-`, `'@`). |
| **Pasal 8** | Right to erasure (Right to be Forgotten) requiring complete destruction of personal records. | Single-tap `wipeAllUserData()` purging IndexedDB, LocalStorage, and volatile session keys completely. |
| **Pasal 9** | Right to withdraw consent (*Penarikan Persetujuan*) at any time with immediate cessation. | Instant revocation toggle in Settings resetting all local storage and returning app to unconfigured state. |
| **Pasal 35** | Technical and operational security measures to prevent data breaches. | 100% offline-first execution with zero network analytics, zero third-party CDNs, and non-extractable keys. |
| **Pasal 46** | Statutory obligation to report data breaches within a maximum of **72 hours** (3 x 24 jam). | Incident response protocol notifying regulatory authority (*Lembaga Pelindungan Data Pribadi*) and users. |

### 5.2 CSV Formula Injection Escaping Standard
```typescript
export function sanitizeCsvField(field: string): string {
  if (typeof field !== 'string') return String(field);
  // Neutralize DDE / Excel formula injection triggers
  if (/^[=+\-@\t\r]/.test(field)) {
    return `'${field}`;
  }
  return field;
}
```

---

## 6. Verification Runbook

```bash
# 1. Frontmatter and line count check
node -e "
const fs = require('fs');
const content = fs.readFileSync('.agents/skills/anthropic-cybersecurity-skills/SKILL.md', 'utf8');
if (!content.startsWith('---\n')) throw new Error('Missing frontmatter delimiter');
const endIdx = content.indexOf('\n---\n', 4);
if (endIdx === -1) throw new Error('Malformed frontmatter delimiter');
const yaml = content.substring(4, endIdx);
if (!/name:\s*anthropic-cybersecurity-skills/.test(yaml)) throw new Error('Missing name');
if (!/license:\s*Apache-2.0/.test(yaml)) throw new Error('Missing license: Apache-2.0');
if (/trigger:\s*always_on/.test(yaml)) throw new Error('Prohibited trigger: always_on');
const lines = content.split('\n').length;
if (lines > 400) throw new Error('Exceeds 400 lines: ' + lines);
console.log('PASS: anthropic-cybersecurity-skills valid (' + lines + ' lines).');
"

# 2. Quality Gates check
npm run lint
npx tsc -b
npm test
npm run build
```
