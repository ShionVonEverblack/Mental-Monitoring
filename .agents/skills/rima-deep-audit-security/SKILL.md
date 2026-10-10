---
name: rima-deep-audit-security
description: >-
  Comprehensive protocol for client-side security auditing, vulnerability detection, and threat remediation in RIMA.
  Use when conducting security reviews, finding XSS/injection vectors, hardening cryptographic storage, sanitizing user inputs,
  preventing data leaks, and validating OWASP Web Security standards for offline-first PWAs.
---

# RIMA Deep Audit & Security Hardening Protocol

## 1. Threat Model & Audit Vectors (Client-Side Mental Health App)
In an anonymous, offline-first mental health application storing highly sensitive psychological data (C-SSRS suicidality evaluations, PHQ-9/GAD-7 clinical scores, CBT automatic thoughts, diary entries), security is synonymous with patient safety and ethical non-maleficence.

### Critical Audit Checkpoints:
1. **XSS & Template Injection (DOM-based & Stored)**:
   - Check every instance of `innerHTML`, `document.write`, `dangerouslySetInnerHTML`, and HTML string interpolation in report generators (`referralService.ts`, `exportImport.ts`).
   - Validate that all user-supplied content (patient notes, thought records, journal content, forum posts) is strictly escaped via HTML entity encoding (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`).
2. **Cryptographic Integrity & Vault Hygiene**:
   - Verify PBKDF2 iterations meet OWASP 2023+ standard ($\ge 600,000$ iterations for SHA-256).
   - Ensure initialization vectors (IVs) for AES-GCM are freshly generated with `crypto.getRandomValues(new Uint8Array(12))` and never reused.
   - Verify zero plaintext leakage into unencrypted localStorage when vault is enabled.
3. **Sensitive Data Leakage & Telemetry Sanitization**:
   - Ensure zero PII or clinical responses are logged via `console.log` or sent over unauthenticated network requests.
   - Clean up sensitive temporary variables from memory upon user lock/logout.
4. **Input Boundary & Denial-of-Service (DoS) Attacks**:
   - Ensure string inputs (textarea, text inputs) have bounded lengths to prevent memory exhaustion and UI freezing.
   - Guard against invalid JSON parsing with try/catch blocks that gracefully handle malformed storage.
5. **Secure Storage Quota & Downgrade Prevention**:
   - Ensure IndexedDB fallbacks do not silently fail or corrupt application state.

---

## 2. Security Audit Checklist
- [ ] Scan for unescaped user input in HTML generation (`generateDoctorHandoverBriefHTML`, export functions).
- [ ] Audit all `window.addEventListener` for missing cleanup in `useEffect` return functions.
- [ ] Audit all regex patterns for ReDoS (Regular Expression Denial of Service).
- [ ] Audit Supabase client calls: ensure anon key cannot perform administrative writes or bypass RLS.
- [ ] Audit cryptographic key generation, salt uniqueness, and constant-time comparisons.
