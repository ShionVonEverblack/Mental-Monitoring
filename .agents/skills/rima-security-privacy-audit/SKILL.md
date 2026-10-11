---
name: rima-security-privacy-audit
description: Security auditing, zero-leakage telemetry enforcement, client-side encryption (Web Crypto AES-GCM-256), defensive parsing, CSV injection defense, XSS mitigation, and compliance with Indonesian UU PDP No. 27/2022.
license: MIT
---

# RIMA Security & Privacy Audit Skill

## 1. Executive Summary & Threat Model

Mental health data is among the most sensitive personal data that an individual can generate. An inadvertent leak of mood records, journal reflections, or crisis history can cause profound social stigma, workplace discrimination, or emotional distress.

**RIMA (Ruang Interaksi Mental Aman)** enforces a **Zero-Trust, Zero-Leakage, Offline-First** architectural posture. Every security mechanism operates under the assumption that:
1. The user's device may be shared with family, partners, or peers.
2. The network environment is untrusted (public Wi-Fi, cellular snooping).
3. Third-party cloud analytics, trackers, and ad-tech SDKs are inherently malicious in a mental health context and **strictly forbidden**.

---

## 2. Regulatory Compliance: UU PDP No. 27/2022

Under **Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27/2022**:
- **Pasal 4 Ayat (2) Huruf f**: Data dan informasi kesehatan merupakan **Data Pribadi yang Bersifat Spesifik** (kategori data sensitif tinggi).
- **Pasal 20 & 28**: Pemrosesan data spesifik memerlukan persetujuan eksplisit (*explicit consent*) dan kewajiban perlindungan teknologi enkripsi tingkat tinggi.
- **Hak Subjek Data (Pasal 5–11)**: Hak menghapus seluruh data secara instan (*right to erasure / local data wipe*), hak menarik persetujuan, dan hak memindahkan data (*data portability*).

### RIMA Technical Mandates:
- **Zero Server Logging of Journals**: Personal journals and mood tracking records are processed strictly within the browser's sandbox (`localStorage` / `IndexedDB` / Web Crypto Vault).
- **Instant Local Wipe (`dataWipe.ts`)**: Single-click purge of all indexed stores, persistent caches, service worker registrations, and cryptographic keys.
- **Incognito / Anonymous Mode**: In-app identity decoupling allowing seamless guest usage and randomized forum pseudonyms.

---

## 3. Client-Side Cryptography Architecture (Web Crypto Vault)

### Cryptographic Standards:
- **Cipher**: AES-GCM (Galois/Counter Mode) with 256-bit keys (`AES-GCM-256`).
- **Key Derivation**: PBKDF2 with SHA-256, strictly configured with **$\ge 600,000$ iterations** (OWASP 2023+ Password Storage recommendation) and a unique 16-byte cryptographically secure salt (`crypto.getRandomValues`).
- **Initialization Vector (IV)**: Fresh, cryptographically random 12-byte IV generated for every individual encryption operation. Reusing IVs with the same AES-GCM key is strictly forbidden.
- **Key Management**: Symmetric keys derived from user PIN/passphrase reside solely in volatile memory (`CryptoKey` object) and are never written to disk unencrypted.

```typescript
// Verification Pattern: Web Crypto AES-GCM Encryption
export async function encryptData(plaintext: string, derivedKey: CryptoKey): Promise<{ cipherText: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    encoded
  );

  return {
    cipherText: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer as ArrayBuffer)
  };
}
```

---

## 4. Output Sanitization & Injection Defense

### A. CSV Formula Injection (Spreadsheet Exploits)
When users export their mood logs or journals to CSV (`src/utils/exportImport.ts`), malicious actors or users paste text that may begin with formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`). If opened in Excel or Google Sheets, this could trigger dynamic command execution or URL exfiltration.

**Mandatory Sanitization Rule:**
```typescript
export function sanitizeCSVCell(cellValue: string | null | undefined): string {
  if (!cellValue) return '';
  const trimmed = cellValue.trim();
  // Escape formulas by prefixing with a backtick/apostrophe
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return '`' + trimmed + '`';
  }
  return trimmed;
}
```

### B. HTML Escaping in Clinical Summary Reports
When generating printable clinical summary HTML (`generateClinicalSummaryHTML`), every interpolated user input or metric must be passed through `escapeHTML()`:

```typescript
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

---

## 5. Defensive Storage Parsing & Fault Resilience

Storage corruption can occur when users clear browser state partially or during browser updates. Unhandled `JSON.parse` failures can crash the application.

### Defensive Storage Patterns:
1. **Always wrap `JSON.parse` in try-catch** or use defensive fallback utilities.
2. **Always assert Array shape** before calling `.map()`, `.filter()`, or `.reduce()`:
```typescript
const raw = localStorage.getItem('rima-forum-posts');
let parsed: unknown = [];
try {
  parsed = raw ? JSON.parse(raw) : [];
} catch {
  parsed = [];
}
const posts: ForumPost[] = Array.isArray(parsed) ? parsed : [];
```

---

## 6. Security Audit Checklist

Before releasing any code change, audit against this checklist:
- [ ] No remote tracking scripts (Google Analytics, Mixpanel, Sentry with PII, Facebook Pixel).
- [ ] No unescaped user inputs in `dangerouslySetInnerHTML` or printable HTML templates.
- [ ] All exported CSV fields pass through `sanitizeCSVCell()`.
- [ ] Passwords/PINs are never stored in plaintext (PBKDF2-SHA256 salted hash only).
- [ ] AES-GCM IVs are generated freshly per encryption operation.
- [ ] Storage reads handle `null`, non-array, and corrupted JSON without throwing uncaught exceptions.
- [ ] Content-Security-Policy (CSP) headers disallow unauthorized `script-src` and `connect-src`.
