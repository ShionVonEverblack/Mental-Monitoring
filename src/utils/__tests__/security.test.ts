import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin } from '../security';

describe('security utils', () => {
  it('hashes a 4-digit PIN deterministically with SHA-256', async () => {
    const hash1 = await hashPin('1234');
    const hash2 = await hashPin('1234');
    const hashDiff = await hashPin('4321');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string length
    expect(hash1).not.toBe(hashDiff);
  });

  it('correctly verifies valid PIN against hash', async () => {
    const hash = await hashPin('7890');
    const isValid = await verifyPin('7890', hash);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect PIN against hash', async () => {
    const hash = await hashPin('7890');
    const isValid = await verifyPin('1111', hash);
    expect(isValid).toBe(false);
  });

  it('handles empty inputs safely without throwing', async () => {
    expect(await verifyPin('', 'somehash')).toBe(false);
    expect(await verifyPin('1234', '')).toBe(false);
  });
});
