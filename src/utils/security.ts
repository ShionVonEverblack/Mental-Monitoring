/**
 * Security utilities for RIMA
 * Native Web Crypto API PBKDF2 hashing with cryptographic salt for 4-digit PIN authentication
 * and brute-force rate limiting protection.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds cooldown

const STORAGE_KEY_ATTEMPTS = 'rima-lock-failed-attempts';
const STORAGE_KEY_LOCKED_UNTIL = 'rima-lock-locked-until';

// Helper: Convert ArrayBuffer to Hex string
function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Derives a PBKDF2-SHA256 key from a PIN and salt
 */
async function derivePbkdf2(pin: string, saltBytes: Uint8Array): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return bufToHex(derivedBits);
}

/**
 * Legacy unsalted SHA-256 hash for backward compatibility
 */
export async function hashPinLegacy(pin: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not available');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await subtle.digest('SHA-256', data);
  return bufToHex(hashBuffer);
}

/**
 * Hashes a 4-digit PIN with a cryptographically secure random salt using PBKDF2.
 * Output format: "<saltHex>:<hashHex>"
 */
export async function hashPin(pin: string, customSaltHex?: string): Promise<string> {
  const saltBytes = customSaltHex
    ? hexToBuf(customSaltHex)
    : globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));

  const saltHex = bufToHex(saltBytes);
  const hashHex = await derivePbkdf2(pin, saltBytes);

  return `${saltHex}:${hashHex}`;
}

/**
 * Verifies a PIN against a stored hash string.
 * Supports both modern salted PBKDF2 ("salt:hash") and legacy unsalted SHA-256 (64 hex chars).
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  if (!pin || !storedHash) return false;
  try {
    if (storedHash.includes(':')) {
      const [saltHex, expectedHash] = storedHash.split(':');
      if (!saltHex || !expectedHash) return false;
      const computedHash = await derivePbkdf2(pin, hexToBuf(saltHex));
      return computedHash === expectedHash;
    }

    // Fallback for legacy unsalted SHA-256 hashes (64-character hex)
    if (storedHash.length === 64) {
      const legacyHash = await hashPinLegacy(pin);
      return legacyHash === storedHash;
    }

    return false;
  } catch (err) {
    console.error('PIN verification error:', err);
    return false;
  }
}

/**
 * Brute-force rate limiting status
 */
export interface LockoutStatus {
  isLockedOut: boolean;
  remainingSeconds: number;
  failedAttempts: number;
  maxAttempts: number;
}

export function getLockoutStatus(): LockoutStatus {
  try {
    const rawAttempts = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    const rawLockedUntil = localStorage.getItem(STORAGE_KEY_LOCKED_UNTIL);

    const failedAttempts = rawAttempts ? parseInt(rawAttempts, 10) || 0 : 0;
    const lockedUntil = rawLockedUntil ? parseInt(rawLockedUntil, 10) || 0 : 0;
    const now = Date.now();

    if (lockedUntil > now) {
      return {
        isLockedOut: true,
        remainingSeconds: Math.ceil((lockedUntil - now) / 1000),
        failedAttempts,
        maxAttempts: MAX_FAILED_ATTEMPTS
      };
    }

    return {
      isLockedOut: false,
      remainingSeconds: 0,
      failedAttempts,
      maxAttempts: MAX_FAILED_ATTEMPTS
    };
  } catch {
    return {
      isLockedOut: false,
      remainingSeconds: 0,
      failedAttempts: 0,
      maxAttempts: MAX_FAILED_ATTEMPTS
    };
  }
}

export function recordFailedAttempt(): LockoutStatus {
  try {
    const current = getLockoutStatus();
    const newAttempts = current.failedAttempts + 1;
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, newAttempts.toString());

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(STORAGE_KEY_LOCKED_UNTIL, lockedUntil.toString());
      return {
        isLockedOut: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        failedAttempts: newAttempts,
        maxAttempts: MAX_FAILED_ATTEMPTS
      };
    }

    return {
      isLockedOut: false,
      remainingSeconds: 0,
      failedAttempts: newAttempts,
      maxAttempts: MAX_FAILED_ATTEMPTS
    };
  } catch {
    return getLockoutStatus();
  }
}

export function resetLockout(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEY_LOCKED_UNTIL);
  } catch {
    // ignore
  }
}
