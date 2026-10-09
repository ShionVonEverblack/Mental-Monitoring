import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  idbGet,
  idbSet,
  idbDelete,
  rimaAsyncStorage,
  getStorageQuotaInfo,
  requestPersistentStorage,
  migrateAllLocalStorageToIndexedDB,
  KNOWN_RIMA_STORAGE_KEYS,
} from '../indexedDb';

describe('indexedDb storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sets and gets data correctly with fallback', async () => {
    await idbSet('test-key', { name: 'Rima Test', score: 10 });
    const result = await idbGet<{ name: string; score: number }>('test-key');
    expect(result).toEqual({ name: 'Rima Test', score: 10 });
  });

  it('deletes data correctly with fallback', async () => {
    await idbSet('test-key-del', 'sample-value');
    let val = await idbGet<string>('test-key-del');
    expect(val).toBe('sample-value');

    await idbDelete('test-key-del');
    val = await idbGet<string>('test-key-del');
    expect(val).toBeNull();
  });

  it('implements Zustand StateStorage interface with transparent migration', async () => {
    localStorage.setItem('zustand-legacy', JSON.stringify({ state: { count: 5 } }));

    const loaded = await rimaAsyncStorage.getItem('zustand-legacy');
    expect(loaded).toBe(JSON.stringify({ state: { count: 5 } }));

    await rimaAsyncStorage.setItem('zustand-new', JSON.stringify({ state: { count: 10 } }));
    const reloaded = await rimaAsyncStorage.getItem('zustand-new');
    expect(reloaded).toBe(JSON.stringify({ state: { count: 10 } }));

    await rimaAsyncStorage.removeItem('zustand-new');
    const removed = await rimaAsyncStorage.getItem('zustand-new');
    expect(removed).toBeNull();
  });

  it('migrates all known localStorage keys into storage', async () => {
    localStorage.setItem('rima-moods', JSON.stringify([{ id: '1', score: 4 }]));
    localStorage.setItem('rima-journals', JSON.stringify([{ id: 'j1', title: 'Test' }]));

    const res = await migrateAllLocalStorageToIndexedDB();
    expect(res.migratedCount).toBe(2);
    expect(res.keys).toContain('rima-moods');
    expect(res.keys).toContain('rima-journals');
    expect(KNOWN_RIMA_STORAGE_KEYS).toContain('rima-moods');
  });

  it('retrieves storage quota and status information', async () => {
    const status = await getStorageQuotaInfo();
    expect(status).toHaveProperty('isIndexedDbSupported');
    expect(status).toHaveProperty('persisted');
    expect(status).toHaveProperty('quotaMB');
    expect(status).toHaveProperty('usedMB');
    expect(status).toHaveProperty('availableMB');
  });

  it('requests persistent storage from navigator.storage', async () => {
    const persistMock = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: persistMock,
        persisted: vi.fn().mockResolvedValue(false),
        estimate: vi.fn().mockResolvedValue({ usage: 1024 * 1024, quota: 100 * 1024 * 1024 }),
      },
      configurable: true,
      writable: true,
    });

    const isPersisted = await requestPersistentStorage();
    expect(isPersisted).toBe(true);
    expect(persistMock).toHaveBeenCalled();
  });
});
