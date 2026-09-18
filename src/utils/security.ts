/**
 * Security utilities for RIMA
 * Native Web Crypto API SHA-256 hashing for 4-digit PIN authentication
 */

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  
  // Use globalThis.crypto for cross-environment support (browser & Node/jsdom)
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  if (!pin || !hashedPin) return false;
  try {
    const inputHash = await hashPin(pin);
    return inputHash === hashedPin;
  } catch (err) {
    console.error('PIN verification error:', err);
    return false;
  }
}
