# Phase 3 Exploration Handoff: Vite & PWA Build Configuration

## 1. Observation

### 1.1 Baseline Build Metrics & Chunk Distribution
Execution of `npm run build` (`tsc -b && vite build`) produced the following production artifacts:
- **Total transformed modules**: 2,523 modules in 1.85s.
- **Entry point bundle**:
  - `dist/assets/index-DAiHOxz2.js`: **613.57 kB** (gzip: **224.11 kB**, sourcemap: 111.58 kB).
- **Vendor chunks**:
  - `dist/assets/recharts-vendor-DK2IuI-s.js`: **411.10 kB** (gzip: 115.28 kB).
  - `dist/assets/react-vendor-B53boYic.js`: **228.73 kB** (gzip: 73.94 kB).
  - `dist/assets/i18n-vendor-CE3uIs8q.js`: **49.28 kB** (gzip: 15.56 kB).
  - `dist/assets/icons-vendor-C-TccVF0.js`: **26.75 kB** (gzip: 9.67 kB).
  - `dist/assets/supabase-BY4f-U1H.js`: **8.70 kB** (gzip: 3.52 kB).
- **PWA Service Worker Generation**:
  - Mode: `generateSW`
  - Precached entries: **54 entries (1,797.98 KiB)**
  - Generated files: `dist/sw.js`, `dist/sw.js.map`, `dist/workbox-835c8c05.js`, `dist/workbox-835c8c05.js.map`.

### 1.2 Root Cause of Bloated Main Bundle (`index-*.js`)
Direct inspection of `src/i18n/` revealed 8 full JSON translation catalogs:
- `ar.json`: 96,226 bytes
- `ja.json`: 86,018 bytes
- `es.json`: 78,978 bytes
- `id.json`: 76,662 bytes
- `jv.json`: 75,125 bytes
- `su.json`: 75,109 bytes
- `en.json`: 74,187 bytes
- `zh.json`: 72,719 bytes
- **Total raw JSON translation weight**: **635,024 bytes (~620.1 KiB)**.

In `src/i18n/config.ts` (lines 5-12), all 8 catalogs are statically imported:
```ts
5: import idTranslations from './id.json';
6: import enTranslations from './en.json';
7: import jvTranslations from './jv.json';
8: import suTranslations from './su.json';
9: import jaTranslations from './ja.json';
10: import zhTranslations from './zh.json';
11: import esTranslations from './es.json';
12: import arTranslations from './ar.json';
```
In `src/main.tsx` (line 5) and `src/App.tsx` (line 3):
```ts
import './i18n/config';
```
In `vite.config.ts` (lines 90-105), the current `manualChunks` function only partitions selected paths inside `node_modules/`:
```ts
90:       output: {
91:         manualChunks(id) {
92:           if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
93:             return 'react-vendor';
94:           }
95:           if (id.includes('node_modules/recharts')) {
96:             return 'recharts-vendor';
97:           }
98:           if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
99:             return 'i18n-vendor';
100:           }
101:           if (id.includes('node_modules/lucide-react')) {
102:             return 'icons-vendor';
103:           }
104:         }
105:       }
```
Because the translation catalogs in `src/i18n/*.json` reside in `src/` (not `node_modules/`), they do not match any `manualChunks` rule and are bundled directly into the main entry chunk (`index-*.js`), accounting for over 85% of its 613.57 kB size.

### 1.3 Vendor Catch-All Precedence Issue in `vite.config.ts`
We observed a subtle path prefix collision in the existing `manualChunks`:
- Line 92: `if (id.includes('node_modules/react') ...)`
- Line 98: `if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next'))`
Because string `node_modules/react-i18next` contains `node_modules/react`, line 92 matches first. Thus, `react-i18next` was placed in `react-vendor` instead of `i18n-vendor`.

### 1.4 Workbox Offline Precaching Configuration
In `vite.config.ts` (lines 40-72):
```ts
40:       workbox: {
41:         globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
42:         runtimeCaching: [
43:           {
44:             urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
45:             handler: 'CacheFirst',
...
```
In `dist/sw.js` (line 1):
Workbox precaches all 54 assets matching `globPatterns` using `s.precacheAndRoute([...])` with `revision: null` for content-hashed assets.
Route navigation is registered via `s.NavigationRoute(s.createHandlerBoundToURL("index.html"))`.

### 1.5 Quality Gate Baseline Verification
- `npm run lint` (`oxlint`): 0 warnings, 0 errors (125 files, 104 rules, 68ms).
- `npx tsc -b`: Exited with code 0.
- `npx vitest run`: 40 test files passed (100%), 396 tests passed (100%), 0 failures.

---

## 2. Logic Chain

1. **Step 1 — Module Allocation to Chunks**:
   When Rollup evaluates `src/main.tsx`, it traverses imports to `src/i18n/config.ts`, which imports the 8 JSON locale files (635 kB). In the absence of a `manualChunks` match for `src/i18n/*.json`, Rollup bundles those 8 JSON objects into `index-*.js`. This results in `index-*.js` weighing 613.57 kB.

2. **Step 2 — Impact on Mobile Performance (TTI / FCP)**:
   On budget mobile hardware, parsing and compiling a single 613 kB JavaScript file blocks the main thread. Splitting the translation dictionaries into a separate `i18n-locales` chunk reduces `index-*.js` to ~50–70 kB. The browser can parse the app shell script in a fraction of the time, dramatically reducing Time to Interactive (TTI).

3. **Step 3 — HTTP/2 Module Preloading & Cache Invalidation**:
   In `dist/index.html`, Vite automatically emits `<link rel="modulepreload">` for all chunks required by `index.js`. Thus, `i18n-locales-*.js` will be downloaded concurrently via HTTP/2 multiplexing. Furthermore, future UI/component modifications will invalidate only `index-*.js` (~60 kB) while preserving `i18n-locales-*.js` (~550 kB) in browser and service worker caches.

4. **Step 4 — Workbox Precaching Compatibility**:
   Workbox's `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` matches every `.js` file output to `dist/assets/`. When `i18n-locales-[hash].js` is emitted, Workbox automatically includes it in `precacheAndRoute([...])`. When offline, the service worker intercepts requests for `i18n-locales-[hash].js` and serves it from CacheStorage. Zero network calls are required, perfectly maintaining RIMA's 100% offline-first architecture.

5. **Step 5 — Defensive Workbox File Size Budgeting**:
   Workbox has a default `maximumFileSizeToCacheInBytes` limit of 2,097,152 bytes (2 MiB). While `i18n-locales` (~550 kB) is well within this threshold, explicitly setting `maximumFileSizeToCacheInBytes: 3000000` (3 MiB) protects against future build failures as translation dictionaries grow.

6. **Step 6 — Cross-Platform Path Normalization**:
   On Windows operating systems, Rollup module IDs may contain backslashes (`\`). Using `const normalizedId = id.replace(/\\/g, '/');` ensures matching rules work identically across Windows, macOS, and Linux CI environments.

---

## 3. Caveats

1. **Static vs. Dynamic Translation Loading**:
   Currently, all 8 languages are bundled into a single `i18n-locales` chunk rather than 8 separate per-language chunks. This is intentional and necessary for RIMA's clinical offline guarantee: if a user changes languages (e.g. from Indonesian to Javanese or Arabic) while offline in an emergency crisis or flight mode, all translation data is already precached and available in CacheStorage.
2. **Third-Party CDN Fonts**:
   Google Fonts (`Plus Jakarta Sans`) are cached via `runtimeCaching` (CacheFirst), requiring an initial online request to populate `google-fonts-cache` and `gstatic-fonts-cache`. All core application assets, SVGs, icons, and locale catalogs are 100% precached on install.
3. **No Code Modification Constraint**:
   As an Explorer, this survey is strictly read-only. No modifications have been made to `vite.config.ts`. The implementation is ready for Milestone 1.

---

## 4. Conclusion & Proposed Architecture

### 4.1 Recommended `manualChunks` in `vite.config.ts`
The implementer should update `rollupOptions.output.manualChunks` in `vite.config.ts` as follows:

```ts
manualChunks(id) {
  const normalizedId = id.replace(/\\/g, '/');

  // 1. Translation Catalogs: Isolate 8-language JSON dictionaries (~635 kB raw)
  if (normalizedId.includes('/src/i18n/') && normalizedId.endsWith('.json')) {
    return 'i18n-locales';
  }

  // 2. i18n Libraries: Evaluate before React to prevent react-i18next prefix match
  if (
    normalizedId.includes('/node_modules/i18next/') ||
    normalizedId.includes('/node_modules/react-i18next/') ||
    normalizedId.includes('/node_modules/i18next-browser-languagedetector/')
  ) {
    return 'i18n-vendor';
  }

  // 3. React Framework & Routing Core
  if (
    normalizedId.includes('/node_modules/react/') ||
    normalizedId.includes('/node_modules/react-dom/') ||
    normalizedId.includes('/node_modules/react-router/') ||
    normalizedId.includes('/node_modules/react-router-dom/') ||
    normalizedId.includes('/node_modules/scheduler/')
  ) {
    return 'react-vendor';
  }

  // 4. Data Visualization Engine (Charts)
  if (
    normalizedId.includes('/node_modules/recharts/') ||
    normalizedId.includes('/node_modules/d3-') ||
    normalizedId.includes('/node_modules/victory-vendor/')
  ) {
    return 'recharts-vendor';
  }

  // 5. UI Icons
  if (normalizedId.includes('/node_modules/lucide-react/')) {
    return 'icons-vendor';
  }

  // 6. Supabase Client SDK (Cloud tier)
  if (normalizedId.includes('/node_modules/@supabase/')) {
    return 'supabase-vendor';
  }
}
```

### 4.2 Recommended Workbox Configuration in `vite.config.ts`
Under `VitePWA({ workbox: { ... } })`:
```ts
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  maximumFileSizeToCacheInBytes: 3000000, // 3 MiB defensive headroom for translation bundles
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
}
```

### 4.3 Expected Post-Implementation Results
| Chunk | Baseline Size | Optimized Target Size | Purpose |
|---|---|---|---|
| `index-*.js` (main entry) | **613.57 kB** | **~50–70 kB** | Application shell, router setup, providers |
| `i18n-locales-*.js` | *N/A (in index)* | **~540–560 kB** | Precached 8-language translation catalogs |
| `recharts-vendor-*.js` | 411.10 kB | ~411 kB | Charting engine (lazy-loaded on analytics/dashboard) |
| `react-vendor-*.js` | 228.73 kB | ~220–225 kB | React, ReactDOM, React Router |
| `i18n-vendor-*.js` | 49.28 kB | ~55 kB | i18next runtime + react-i18next bindings |
| `icons-vendor-*.js` | 26.75 kB | ~27 kB | Lucide icons |
| `supabase-vendor-*.js` | 8.70 kB | ~9 kB | Supabase client SDK |

---

## 5. Verification Method

To independently verify the implementation:

1. **Verify TypeScript Compilation**:
   ```bash
   npx tsc -b
   ```
   *Expected output*: Exits with code 0 and zero errors.

2. **Verify Linter**:
   ```bash
   npm run lint
   ```
   *Expected output*: `Found 0 warnings and 0 errors.`

3. **Verify Vitest Suite**:
   ```bash
   npx vitest run
   ```
   *Expected output*: All 40 test files and 396+ tests pass with 0 failures.

4. **Verify Production Build & Chunk Splitting**:
   ```bash
   npm run build
   ```
   *Verification criteria*:
   - Check that `dist/assets/i18n-locales-*.js` is generated.
   - Check that `dist/assets/index-*.js` is reduced to `< 100 kB`.
   - Check that Workbox reports `precache 55 entries` (or similar) with 0 errors.
   - Inspect `dist/sw.js` and verify that `{url:"assets/i18n-locales-...js",revision:null}` is present in `precacheAndRoute`.

5. **Invalidation Conditions**:
   - If `index-*.js` exceeds 150 kB, check if `src/i18n/*.json` was matched by `manualChunks`.
   - If `i18n-locales-*.js` is missing from `dist/sw.js`, check Workbox `globPatterns` and `maximumFileSizeToCacheInBytes`.
