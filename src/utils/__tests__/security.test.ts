import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hashPin,
  verifyPin,
  hashPinLegacy,
  getLockoutStatus,
  recordFailedAttempt,
  resetLockout,
  MAX_FAILED_ATTEMPTS
} from '../security';

describe('security utils', () => {
  beforeEach(() => {
    localStorage.clear();
    resetLockout();
  });

  describe('PIN Hashing & Verification', () => {
    it('hashes a 4-digit PIN with a random cryptographic salt (salt:hash format)', async () => {
      const hash1 = await hashPin('1234');
      const hash2 = await hashPin('1234');

      expect(hash1).toContain(':');
      expect(hash2).toContain(':');

      const [salt1, derived1] = hash1.split(':');
      const [salt2, derived2] = hash2.split(':');

      expect(salt1).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(derived1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(salt2).toHaveLength(32);
      expect(derived2).toHaveLength(64);
      expect(salt1).not.toBe(salt2);
      // Because salt is cryptographically random per call, hashes should differ
      expect(hash1).not.toBe(hash2);
    });

    it('hashes deterministically when identical custom salt is provided', async () => {
      const fixedSalt = '0123456789abcdef0123456789abcdef';
      const hash1 = await hashPin('5678', fixedSalt);
      const hash2 = await hashPin('5678', fixedSalt);

      expect(hash1).toBe(hash2);
    });

    it('correctly verifies valid PIN against salted PBKDF2 hash', async () => {
      const hash = await hashPin('7890');
      const isValid = await verifyPin('7890', hash);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect PIN against salted PBKDF2 hash', async () => {
      const hash = await hashPin('7890');
      const isValid = await verifyPin('1111', hash);
      expect(isValid).toBe(false);
    });

    it('supports backward compatibility with legacy unsalted SHA-256 hashes', async () => {
      const legacyHash = await hashPinLegacy('4321');
      expect(legacyHash).toHaveLength(64);
      expect(legacyHash).not.toContain(':');

      const isLegacyValid = await verifyPin('4321', legacyHash);
      expect(isLegacyValid).toBe(true);

      const isLegacyWrong = await verifyPin('9999', legacyHash);
      expect(isLegacyWrong).toBe(false);
    });

    it('handles empty or malformed inputs safely without throwing', async () => {
      expect(await verifyPin('', 'somehash')).toBe(false);
      expect(await verifyPin('1234', '')).toBe(false);
      expect(await verifyPin('1234', 'malformed:hash:extra')).toBe(false);
      expect(await verifyPin('1234', 'short')).toBe(false);
    });
  });

  describe('Brute-force Rate Limiting & Lockout', () => {
    it('initial status is not locked out with 0 failed attempts', () => {
      const status = getLockoutStatus();
      expect(status.isLockedOut).toBe(false);
      expect(status.failedAttempts).toBe(0);
      expect(status.remainingSeconds).toBe(0);
      expect(status.maxAttempts).toBe(MAX_FAILED_ATTEMPTS);
    });

    it('increments failed attempts up to threshold', () => {
      for (let i = 1; i < MAX_FAILED_ATTEMPTS; i++) {
        const status = recordFailedAttempt();
        expect(status.isLockedOut).toBe(false);
        expect(status.failedAttempts).toBe(i);
        expect(status.remainingSeconds).toBe(0);
      }
    });

    it('locks out when failed attempts reach threshold (5 attempts)', () => {
      for (let i = 1; i <= MAX_FAILED_ATTEMPTS; i++) {
        recordFailedAttempt();
      }

      const status = getLockoutStatus();
      expect(status.isLockedOut).toBe(true);
      expect(status.failedAttempts).toBe(MAX_FAILED_ATTEMPTS);
      expect(status.remainingSeconds).toBeGreaterThan(0);
      expect(status.remainingSeconds).toBeLessThanOrEqual(30);
    });

    it('resets lockout completely when resetLockout is called', () => {
      for (let i = 1; i <= MAX_FAILED_ATTEMPTS; i++) {
        recordFailedAttempt();
      }

      expect(getLockoutStatus().isLockedOut).toBe(true);

      resetLockout();

      const status = getLockoutStatus();
      expect(status.isLockedOut).toBe(false);
      expect(status.failedAttempts).toBe(0);
      expect(status.remainingSeconds).toBe(0);
    });

    it('expires lockout after duration has passed', () => {
      vi.useFakeTimers();
      for (let i = 1; i <= MAX_FAILED_ATTEMPTS; i++) {
        recordFailedAttempt();
      }
      expect(getLockoutStatus().isLockedOut).toBe(true);

      // Advance time by 31 seconds
      vi.advanceTimersByTime(31000);

      const status = getLockoutStatus();
      expect(status.isLockedOut).toBe(false);
      expect(status.remainingSeconds).toBe(0);
      vi.useRealTimers();
    });
  });
});
