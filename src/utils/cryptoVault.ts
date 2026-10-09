/**
 * RIMA Zero-Knowledge Client-Side Cryptographic Vault
 * Implements Web Crypto API AES-GCM-256 with OWASP-compliant PBKDF2-HMAC-SHA256 key derivation.
 *
 * Guarantees zero plaintext exposure on local storage and zero-knowledge privacy.
 */

export interface EncryptedPayload {
  version: 1;
  salt: string; // base64 encoded 16-byte random salt
  iv: string;   // base64 encoded 12-byte random IV
  ciphertext: string; // base64 encoded ciphertext
}

const enc = new TextEncoder();
const dec = new TextDecoder();

// Standard OWASP recommended iteration count
export const PBKDF2_KEY_ITERATIONS = 100000;

/**
 * Derives an AES-GCM-256 CryptoKey from a passphrase and random salt.
 */
export async function deriveEncryptionKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not supported in this environment');
  }

  const baseKey = await subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      iterations: PBKDF2_KEY_ITERATIONS,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext UTF-8 string with AES-GCM-256.
 */
export async function encryptText(
  passphrase: string,
  plaintext: string
): Promise<EncryptedPayload> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not supported');
  }

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(passphrase, salt);

  const cipherBuffer = await subtle.encrypt(
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
 * Decrypts an EncryptedPayload back into plaintext UTF-8 string.
 */
export async function decryptText(
  passphrase: string,
  payload: EncryptedPayload
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not supported');
  }

  const salt = Uint8Array.from(atob(payload.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0));

  const key = await deriveEncryptionKey(passphrase, salt);
  const plainBuffer = await subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  return dec.decode(plainBuffer);
}

/**
 * Type guard for EncryptedPayload.
 */
export function isEncryptedPayload(data: unknown): data is EncryptedPayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;
  return (
    p.version === 1 &&
    typeof p.salt === 'string' &&
    typeof p.iv === 'string' &&
    typeof p.ciphertext === 'string'
  );
}

/**
 * Encrypts an arbitrary JSON-serializable object into an EncryptedPayload.
 */
export async function encryptObject<T>(passphrase: string, data: T): Promise<EncryptedPayload> {
  const serialized = JSON.stringify(data);
  return await encryptText(passphrase, serialized);
}

/**
 * Decrypts an EncryptedPayload and parses it back into an object of type T.
 */
export async function decryptObject<T>(passphrase: string, payload: EncryptedPayload): Promise<T> {
  const decrypted = await decryptText(passphrase, payload);
  return JSON.parse(decrypted) as T;
}
