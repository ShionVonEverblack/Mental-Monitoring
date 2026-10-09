import { describe, it, expect } from 'vitest';
import {
  encryptText,
  decryptText,
  encryptObject,
  decryptObject,
  isEncryptedPayload,
} from '../cryptoVault';

describe('Zero-Knowledge Crypto Vault (AES-GCM-256)', () => {
  const passphrase = 'secret-test-pin-1234';

  it('encrypts and decrypts a plaintext string successfully', async () => {
    const originalText = 'Ini adalah catatan jurnal rahasia pribadi.';
    const payload = await encryptText(passphrase, originalText);

    expect(isEncryptedPayload(payload)).toBe(true);
    expect(payload.version).toBe(1);
    expect(payload.ciphertext).not.toBe(originalText);
    expect(payload.ciphertext.length).toBeGreaterThan(0);

    const decrypted = await decryptText(passphrase, payload);
    expect(decrypted).toBe(originalText);
  });

  it('produces different ciphertexts for the same plaintext due to random IV and salt', async () => {
    const text = 'Sama teks berulang';
    const payload1 = await encryptText(passphrase, text);
    const payload2 = await encryptText(passphrase, text);

    expect(payload1.ciphertext).not.toBe(payload2.ciphertext);
    expect(payload1.iv).not.toBe(payload2.iv);
    expect(payload1.salt).not.toBe(payload2.salt);

    const dec1 = await decryptText(passphrase, payload1);
    const dec2 = await decryptText(passphrase, payload2);
    expect(dec1).toBe(text);
    expect(dec2).toBe(text);
  });

  it('fails decryption with incorrect passphrase', async () => {
    const text = 'Pesan rahasia';
    const payload = await encryptText(passphrase, text);

    await expect(decryptText('wrong-passphrase', payload)).rejects.toThrow();
  });

  it('encrypts and decrypts JSON objects preserving types and properties', async () => {
    const journalData = {
      id: 'journal-123',
      title: 'Hari yang Menantang',
      tags: ['cbt', 'anxiety'],
      thoughtIntensity: 75,
      createdAt: '2026-10-10T01:00:00Z',
    };

    const encrypted = await encryptObject(passphrase, journalData);
    expect(isEncryptedPayload(encrypted)).toBe(true);

    const decrypted = await decryptObject<typeof journalData>(passphrase, encrypted);
    expect(decrypted).toEqual(journalData);
  });

  it('validates payload format via isEncryptedPayload', () => {
    expect(isEncryptedPayload(null)).toBe(false);
    expect(isEncryptedPayload({})).toBe(false);
    expect(isEncryptedPayload({ version: 1, salt: 'abc' })).toBe(false);
    expect(isEncryptedPayload({ version: 1, salt: 's', iv: 'i', ciphertext: 'c' })).toBe(true);
  });
});
