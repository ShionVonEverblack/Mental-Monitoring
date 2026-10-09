---
name: rima-client-crypto
description: >-
  Standardized guidelines and implementations for zero-knowledge client-side encryption,
  Web Crypto API, AES-GCM-256, and OWASP-compliant key derivation in RIMA. Use when securing
  sensitive journal entries at rest, managing cryptographic salts/IVs, or building encrypted backups.
---

# RIMA Client-Side Cryptography & Zero-Knowledge Vault

## 1. Zero-Knowledge Architecture Principles
- **No Plaintext Transmission:** Mental health logs, journals, and CBT thought records must never leave the client device in plaintext.
- **Passphrase Sovereignty:** Encryption keys are derived entirely client-side using the user's PIN/passphrase. RIMA servers never possess keys or plaintext.
- **Graceful Failure:** If a user forgets their passphrase, ciphertext cannot be recovered without a valid recovery phrase. Clear UX warnings must be presented before enabling encryption at rest.

## 2. Cryptographic Primitives & OWASP Standards

### Specifications
| Primitive | Standard | Parameters |
|:---|:---|:---|
| **Cipher** | AES-GCM | 256-bit key length, 96-bit (12 bytes) cryptographically random IV |
| **KDF** | PBKDF2-HMAC-SHA256 | **600,000 iterations** (OWASP 2023+ recommendation), 16-byte random salt |
| **Key Extraction** | `extractable: false` | Prevent keys from being read or dumped by memory inspection |

## 3. Implementation Pattern (TypeScript Web Crypto API)

```typescript
const enc = new TextEncoder();
const dec = new TextDecoder();

export interface EncryptedPayload {
  version: 1;
  salt: string; // base64
  iv: string;   // base64
  ciphertext: string; // base64
}

/**
 * Derives a non-extractable AES-GCM CryptoKey using PBKDF2-HMAC-SHA256.
 */
export async function deriveEncryptionKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      iterations: 600000, // OWASP minimum
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a UTF-8 string with AES-GCM-256.
 */
export async function encryptText(
  passphrase: string,
  plaintext: string
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(passphrase, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  return {
    version: 1,
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer))),
  };
}

/**
 * Decrypts a payload back to a UTF-8 string.
 */
export async function decryptText(
  passphrase: string,
  payload: EncryptedPayload
): Promise<string> {
  const salt = Uint8Array.from(atob(payload.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0));

  const key = await deriveEncryptionKey(passphrase, salt);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  return dec.decode(plainBuffer);
}
```

## 4. Key Wrapping & PIN Entropy Considerations
- A 4-digit PIN only contains $\sim 13.3$ bits of entropy ($10^4 = 10,000$ combinations), which is trivially brute-forced offline if ciphertext is extracted.
- **Best Practice Solution:** 
  1. Generate a cryptographically strong 256-bit Master Vault Key.
  2. Encrypt user data using the Master Vault Key.
  3. Wrap the Master Vault Key using the user's PIN + device-bound salt + PBKDF2 600k iterations.
  4. Provide a 12-word recovery mnemonic for account/vault recovery.
