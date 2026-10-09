---
name: rima-indexeddb-storage
description: >-
  Architectural patterns and migration guide for IndexedDB, Dexie.js, Zustand custom storage
  adapters, and persistent storage in RIMA. Use when migrating away from localStorage, handling
  storage quotas, managing asynchronous state rehydration, or preventing Safari/iOS ITP eviction.
---

# RIMA IndexedDB Storage Architecture Guide

## 1. Why Migrate from localStorage?
- **5MB Synchronous Limit:** `localStorage` is synchronous and blocks the browser main thread during large JSON parse/serialize operations.
- **Safari ITP 7-Day Purge:** Safari / WebKit automatically purges localStorage partitions for PWAs not opened within 7 days.
- **IndexedDB Advantages:** Asynchronous, support for hundreds of megabytes, structured binary storage, index queries, and eligibility for `navigator.storage.persist()`.

## 2. Zustand Custom Async Storage Adapter Pattern

Zustand's `createJSONStorage` accepts any object conforming to `StateStorage` (which supports Promise-based asynchronous methods):

```typescript
import { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval'; // or custom Dexie wrapper

export const indexedDbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // 1. Attempt reading from IndexedDB
    const value = await get(name);
    if (value !== undefined && value !== null) {
      return typeof value === 'string' ? value : JSON.stringify(value);
    }
    // 2. Seamless fallback: migrate from localStorage if present
    const legacy = localStorage.getItem(name);
    if (legacy !== null) {
      await set(name, legacy);
      localStorage.removeItem(name); // one-way migration cleanup
      return legacy;
    }
    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    await del(name);
    localStorage.removeItem(name);
  },
};
```

## 3. Asynchronous Rehydration Handling
Because IndexedDB is asynchronous, store initial state renders before IndexedDB finishes reading. Handle this safely with `hasHydrated`:

```typescript
interface StoreState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'rima-storage',
      storage: createJSONStorage(() => indexedDbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

## 4. Storage Persistence API (`navigator.storage.persist()`)
Request persistent storage permissions on app initialization to prevent OS eviction under low disk conditions:

```typescript
export async function ensurePersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) return true;
    return await navigator.storage.persist();
  }
  return false;
}
```

## 5. Storage Quota Estimation
Provide transparent storage stats in the Profile/Privacy settings:

```typescript
export async function getStorageQuotaInfo(): Promise<{ usedMB: number; quotaMB: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usedMB = Number(((estimate.usage || 0) / (1024 * 1024)).toFixed(2));
    const quotaMB = Number(((estimate.quota || 0) / (1024 * 1024)).toFixed(2));
    return { usedMB, quotaMB };
  }
  return { usedMB: 0, quotaMB: 0 };
}
```
