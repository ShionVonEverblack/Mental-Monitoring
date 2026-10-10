# Milestone 1 Handoff Report: Rollup Manual Chunks & Workbox Configuration

**Author:** Worker M1 (PWA Performance & Rollup Manual Chunks Specialist)  
**Date:** 2026-10-10  
**Status:** Complete  
**Working Directory:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m1\`  
**Target File Modified:** `vite.config.ts`  

---

## 1. Observation

### 1.1 Baseline Build & Chunk Distribution (Before Changes)
Executing `npm run build` (`tsc -b && vite build`) prior to modification produced the following chunk layout:
- **Main Entry Bundle**: `dist/assets/index-DAiHOxz2.js`: **613.57 kB** (gzip: **224.11 kB**, map: 111.58 kB).
- **Vendor Chunks**:
  - `dist/assets/recharts-vendor-DK2IuI-s.js`: **411.10 kB** (gzip: 115.28 kB, map: 2,017.01 kB).
  - `dist/assets/react-vendor-B53boYic.js`: **228.73 kB** (gzip: 73.94 kB, map: 1,313.27 kB).
  - `dist/assets/i18n-vendor-CE3uIs8q.js`: **49.28 kB** (gzip: 15.56 kB, map: 153.95 kB).
  - `dist/assets/icons-vendor-C-TccVF0.js`: **26.75 kB** (gzip: 9.67 kB, map: 112.75 kB).
  - `dist/assets/supabase-BY4f-U1H.js`: **8.70 kB** (gzip: 3.52 kB, map: 938.04 kB).
- **PWA Service Worker**:
  - Mode: `generateSW`
  - Precache: **54 entries (1,797.98 KiB)**
- **Root Cause of Bloat**:
  - `src/i18n/config.ts` statically imports all 8 JSON translation catalogs (`id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`), totaling **635,024 bytes (~620.1 KiB)** of raw JSON data.
  - In `vite.config.ts`, `manualChunks(id)` only matched paths inside `node_modules/`, allowing all 8 translation catalogs to fall through into the main app entry bundle `index-*.js`.
  - Furthermore, `id.includes('node_modules/react')` preceded `node_modules/react-i18next`, improperly directing `react-i18next` into `react-vendor` instead of `i18n-vendor`.

### 1.2 Modifications Applied to `vite.config.ts`
Two targeted updates were made to `vite.config.ts`:
1. **Workbox 3 MiB Precache Budget Headroom**:
   In `plugins -> VitePWA -> workbox` (lines 40–43):
   ```typescript
   workbox: {
     maximumFileSizeToCacheInBytes: 3000000,
     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
     runtimeCaching: [ ... ]
   }
   ```
2. **Cross-Platform Manual Chunks Partitioning & Vendor Precedence**:
   In `build -> rollupOptions -> output -> manualChunks(id)` (lines 92–116):
   ```typescript
   manualChunks(id) {
     if (/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)) {
       return 'i18n-locales';
     }
     if (
       id.includes('node_modules/i18next') ||
       id.includes('node_modules/react-i18next') ||
       id.includes('node_modules/i18next-browser-languagedetector')
     ) {
       return 'i18n-vendor';
     }
     if (
       id.includes('node_modules/react') ||
       id.includes('node_modules/react-dom') ||
       id.includes('node_modules/react-router-dom')
     ) {
       return 'react-vendor';
     }
     if (id.includes('node_modules/recharts')) {
       return 'recharts-vendor';
     }
     if (id.includes('node_modules/lucide-react')) {
       return 'icons-vendor';
     }
   }
   ```

### 1.3 Post-Optimization Build Metrics (After Changes)
Execution of `npm run build` (`tsc -b && vite build`) produced the following production artifacts:
- **Main Entry Bundle**:
  - `dist/assets/index-By7SMZOr.js`: **48.10 kB** (gzip: **13.07 kB**, map: 111.55 kB)
  - Drop from 613.57 kB to 48.10 kB represents a **565.47 kB reduction (92.16% reduction)**! Main entry is well below the 70 kB target.
- **Dedicated Translation Catalog Chunk**:
  - `dist/assets/i18n-locales-nZTdihVg.js`: **565.79 kB** (gzip: **210.99 kB**, map: 683.37 kB)
- **Vendor Chunks**:
  - `dist/assets/i18n-vendor-DxHZbUyL.js`: **62.52 kB** (gzip: **20.48 kB**, map: 203.09 kB) — successfully increased from 49.28 kB because `react-i18next` and `i18next-browser-languagedetector` are now routed here.
  - `dist/assets/react-vendor-CBvOqB0L.js`: **223.01 kB** (gzip: **71.49 kB**, map: 1,291.59 kB) — successfully decreased from 228.73 kB.
  - `dist/assets/recharts-vendor-7N2z7m5z.js`: **411.11 kB** (gzip: **115.29 kB**, map: 2,017.01 kB).
  - `dist/assets/icons-vendor-BbSf-i3S.js`: **19.32 kB** (gzip: **6.81 kB**, map: 85.67 kB).
  - `dist/assets/supabase-BY4f-U1H.js`: **8.70 kB** (gzip: **3.52 kB**, map: 938.04 kB).
- **PWA Service Worker Generation**:
  - Mode: `generateSW`
  - Precached entries: **55 entries (1,799.05 KiB)** (cleanly incremented by 1 for `i18n-locales`).
  - `dist/sw.js` content directly confirmed: `{url:"assets/i18n-locales-nZTdihVg.js",revision:null}` is precached.

### 1.4 Quality Gate Verification Results
- **Oxlint**:
  - Command: `npm run lint`
  - Output: `Found 0 warnings and 0 errors. Finished in 93ms on 125 files with 104 rules using 12 threads.`
  - Exit code: `0`
- **TypeScript**:
  - Command: `npx tsc -b`
  - Output: Clean exit code `0`, 0 errors.
- **Vitest**:
  - Command: `npx vitest run`
  - Output: `40 test files passed (40/40), 396 tests passed (396/396)`
  - Exit code: `0`

---

## 2. Logic Chain

1. **Step 1 — Extraction of Translation Catalogs**:
   - *Observation Reference*: 1.1 and 1.2.
   - The regular expression `/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)` matches any JSON file under `src/i18n/`, regardless of whether path separators are Windows backslashes (`\`) or POSIX slashes (`/`).
   - When Rollup resolves imports from `src/i18n/config.ts`, all 8 locale files (`id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`) match this rule and are bundled exclusively into `'i18n-locales'`.
   - *Result*: 565.79 kB of localized data is removed from `dist/assets/index-*.js`, dropping the entry bundle from 613.57 kB to 48.10 kB.

2. **Step 2 — Correcting Vendor Chunk Precedence**:
   - *Observation Reference*: 1.1, 1.2, and 1.3.
   - Previously, `node_modules/react` was evaluated before `node_modules/i18next`. Because `node_modules/react-i18next` starts with `node_modules/react`, it matched `react-vendor`.
   - By placing the `i18n-vendor` check first (matching `node_modules/i18next`, `node_modules/react-i18next`, and `node_modules/i18next-browser-languagedetector`), all i18n runtime libraries are consolidated into `i18n-vendor` (62.52 kB), slimming `react-vendor` down from 228.73 kB to 223.01 kB.

3. **Step 3 — Offline-First PWA Precaching Continuity**:
   - *Observation Reference*: 1.2 and 1.3.
   - Workbox `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` matches all files generated in `dist/assets/`.
   - When `i18n-locales-*.js` is emitted, Workbox adds it to the precache manifest (`s.precacheAndRoute`).
   - `maximumFileSizeToCacheInBytes: 3000000` guarantees that even if additional language catalogs are added in the future, Workbox will not exceed its caching ceiling.
   - Total precached entries increased from 54 to 55, maintaining 100% offline access to all 8 languages.

---

## 3. Caveats

- **Single Locales Chunk vs. Dynamic Per-Locale Chunking**:
  All 8 languages are bundled together into `i18n-locales` (~565 kB raw / ~210 kB gzip) rather than 8 individual dynamic imports. This is an intentional architectural trade-off to satisfy RIMA's offline-first clinical guarantee: users in acute emotional crisis can change languages offline without network dependencies.
- **Font Caching**:
  Google Fonts rely on runtime caching (`CacheFirst`) after initial online retrieval, while all application code and translation catalogs are 100% precached.
- **Exclusive Write Scope**:
  Only `vite.config.ts` was modified, honoring exclusive write ownership.

---

## 4. Conclusion

Milestone 1 is complete and fully verified:
- `vite.config.ts` has been configured with cross-platform Rollup manual chunk partitioning and Workbox 3 MiB headroom.
- Main entry bundle size decreased from **613.57 kB** to **48.10 kB** (a 92.16% reduction, exceeding the < 70 kB requirement).
- `dist/assets/i18n-locales-*.js` is generated (565.79 kB) and precached in `dist/sw.js`.
- All quality gates pass: Oxlint (0 errors, 0 warnings), TypeScript compiler (0 errors), Vitest (396/396 tests passing across 40 test files), and production build succeeds cleanly.

---

## 5. Verification Method

To independently verify the implementation, execute the following commands in the project root:

1. **Verify TypeScript Compilation**:
   ```bash
   npx tsc -b
   ```
   *Expected result*: Exit code 0, 0 diagnostic errors.

2. **Verify Linter**:
   ```bash
   npm run lint
   ```
   *Expected result*: `Found 0 warnings and 0 errors.`

3. **Verify Vitest Test Suite**:
   ```bash
   npx vitest run
   ```
   *Expected result*: 40/40 test files pass, 396/396 tests pass.

4. **Verify Production Build & Chunk Splitting**:
   ```bash
   npm run build
   ```
   *Verification checklist*:
   - `dist/assets/i18n-locales-*.js` exists and is ~565 kB.
   - `dist/assets/index-*.js` is < 70 kB (measured: 48.10 kB).
   - `dist/sw.js` contains `i18n-locales` in `precacheAndRoute`.
   - Workbox reports 55 precached entries.

**Invalidation Conditions**:
- If `dist/assets/index-*.js` exceeds 70 kB, the regular expression did not match the JSON locale files.
- If `dist/sw.js` does not contain `i18n-locales`, Workbox glob pattern or file size threshold failed.
