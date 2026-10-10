import type { StateStorage } from 'zustand/middleware';

const DB_NAME = 'rima-offline-db';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> | null {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn('[IDB] Failed to open IndexedDB:', request.error);
          reject(request.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }
  return dbPromise;
}

export async function idbGet<T = unknown>(key: string): Promise<T | null> {
  const dbP = getIDB();
  if (!dbP) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  try {
    const db = await dbP;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const res = req.result;
        resolve(res !== undefined ? (res as T) : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB] Read failed for "${key}", falling back to localStorage:`, err);
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

export async function idbSet<T = unknown>(key: string, value: T): Promise<void> {
  const dbP = getIDB();
  if (!dbP) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[IDB fallback] Failed to write localStorage key "${key}":`, err);
    }
    return;
  }

  try {
    const db = await dbP;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB] Write failed for "${key}", falling back to localStorage:`, err);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota or storage unavailable
    }
  }
}

export async function idbDelete(key: string): Promise<void> {
  const dbP = getIDB();
  if (!dbP) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }

  try {
    const db = await dbP;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB] Delete failed for "${key}":`, err);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

export async function idbClear(): Promise<void> {
  const dbP = getIDB();
  if (!dbP) return;

  try {
    const db = await dbP;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IDB] Clear failed:', err);
  }
}

/**
 * Zustand-compatible asynchronous StateStorage adapter for IndexedDB.
 */
export const rimaAsyncStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // 1. Check IndexedDB
    const idbVal = await idbGet<string | object>(name);
    if (idbVal !== null && idbVal !== undefined) {
      return typeof idbVal === 'string' ? idbVal : JSON.stringify(idbVal);
    }

    // 2. Fallback to localStorage and trigger transparent migration
    if (typeof window !== 'undefined' && window.localStorage) {
      const legacy = localStorage.getItem(name);
      if (legacy !== null) {
        try {
          const parsed = JSON.parse(legacy);
          await idbSet(name, parsed);
        } catch {
          await idbSet(name, legacy);
        }
        return legacy;
      }
    }

    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const parsed = JSON.parse(value);
      await idbSet(name, parsed);
    } catch {
      await idbSet(name, value);
    }
    // Maintain localStorage mirror for synchronous readers
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(name, value);
      } catch {
        // local storage quota exceeded
      }
    }
  },

  removeItem: async (name: string): Promise<void> => {
    await idbDelete(name);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(name);
    }
  },
};

export interface StorageStatus {
  isIndexedDbSupported: boolean;
  persisted: boolean;
  quotaMB: number;
  usedMB: number;
  availableMB: number;
}

/**
 * Queries storage quota and persistence state from navigator.storage.
 */
export async function getStorageQuotaInfo(): Promise<StorageStatus> {
  const isIndexedDbSupported = typeof window !== 'undefined' && 'indexedDB' in window && !!window.indexedDB;
  let persisted = false;
  let quotaMB = 0;
  let usedMB = 0;

  if (typeof navigator !== 'undefined' && navigator.storage) {
    if (navigator.storage.persisted) {
      try {
        persisted = await navigator.storage.persisted();
      } catch {
        persisted = false;
      }
    }
    if (navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usedMB = Number(((estimate.usage || 0) / (1024 * 1024)).toFixed(2));
        quotaMB = Number(((estimate.quota || 0) / (1024 * 1024)).toFixed(2));
      } catch {
        // fallback values
      }
    }
  }

  const availableMB = Math.max(0, Number((quotaMB - usedMB).toFixed(2)));

  return {
    isIndexedDbSupported,
    persisted,
    quotaMB,
    usedMB,
    availableMB,
  };
}

/**
 * Requests persistent storage from the browser to prevent eviction by Safari/Android.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (err) {
      console.warn('[Storage] Failed to request persistent storage:', err);
      return false;
    }
  }
  return false;
}

export const KNOWN_RIMA_STORAGE_KEYS = [
  'rima-moods',
  'rima-journals',
  'rima-safety-plan',
  'rima-user-profile',
  'rima-assessments',
  'rima-cssrs-results',
  'rima-ba-activities',
  'rima-sleep-diary',
  'rima-tipp-sessions',
  'rima-thought-records',
  'rima_bookmarked_posts',
];

/**
 * One-click migration of all known localStorage records into IndexedDB.
 */
export async function migrateAllLocalStorageToIndexedDB(): Promise<{ migratedCount: number; keys: string[] }> {
  const migrated: string[] = [];
  if (typeof window === 'undefined' || !window.localStorage) {
    return { migratedCount: 0, keys: [] };
  }

  for (const key of KNOWN_RIMA_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        await idbSet(key, parsed);
        migrated.push(key);
      } catch {
        await idbSet(key, raw);
        migrated.push(key);
      }
    }
  }

  return {
    migratedCount: migrated.length,
    keys: migrated,
  };
}
