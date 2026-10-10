---
name: rima-pwa-perf-and-code-splitting
description: >-
  Architectural runbook and engineering guidelines for PWA performance optimization, Rollup manual
  chunk partitioning (i18n translation catalogs, charting, UI icons), Workbox cache tiers, and
  low-end mobile web performance in RIMA. Use when configuring vite.config.ts, tuning bundle budgets,
  diagnosing chunk bloat, or auditing offline precaching.
---

# RIMA PWA Performance Optimization & Rollup Code Splitting Runbook

## 1. Clinical Context & The Cognitive Patience Paradox

In digital psychiatric therapeutics, front-end latency and visual instability are not mere user experience metrics—they are clinical safety determinants. Users engaging with RIMA (Ruang Interaksi Mental Aman) frequently access the platform under acute emotional dysregulation, panic episodes, depressive apathy, or severe cognitive constriction (*Baumel et al., 2019*).

### The Cognitive Patience Paradox in Mental Health PWAs
1. **Working Memory Depletion:** Acute distress impairs executive cognitive functioning. A user in psychological crisis has an exceedingly low tolerance for latency, confusing loading delays, or jumping visual elements (Cumulative Layout Shift).
2. **The Helplessness Trigger:** Unresponsive interfaces, spinning wheels, or abrupt content shifts exacerbate perceived lack of control, triggering app abandonment and cutting off immediate access to de-escalation tools.
3. **The Offline Guarantee:** Network connectivity is frequently compromised during emergencies (subway transit, basement apartments, data quota exhaustion in vulnerable socio-economic demographics). Every therapeutic module (Breathing Somatics, TIPP Hub, Safety Plan, Yale Mood Meter, JITAI Nudges) must execute deterministically without waiting on a single network packet.

---

## 2. Rigorous Performance Budgets

To satisfy clinical responsiveness on resource-constrained Android mobile hardware (e.g., octa-core Cortex-A53, 2 GB RAM, 3G mobile data), RIMA enforces hard bundle budgets:

| Asset / Metric | Target Threshold | Baseline Achieved | Clinical Rationale |
|:---|:---|:---|:---|
| **Main App Entry (`index-*.js`)** | `< 50 kB` uncompressed (`< 15 kB` gzip) | `~50.6 kB` raw (`~13.5 kB` gzip) | Near-instant parse and compile times on low-end V8 engines. |
| **Translation Chunk (`i18n-locales-*.js`)** | Isolated chunk (`~600 kB` raw) | `~567 kB` raw (`~211 kB` gzip) | Decouples static translation dictionaries from core runtime execution. |
| **Core Vendor (`react-vendor-*.js`)** | Isolated chunk (`< 250 kB` raw) | `~223 kB` raw (`~71.5 kB` gzip) | Long-term browser caching for core React 19 framework. |
| **Charting Vendor (`recharts-vendor-*.js`)** | Isolated chunk (`< 450 kB` raw) | `~411 kB` raw (`~115.3 kB` gzip) | Kept separate so non-chart routes (Crisis Card, Breathing) never pay charting penalty. |
| **i18n Library Vendor (`i18n-vendor-*.js`)** | Isolated chunk (`< 70 kB` raw) | `~62.5 kB` raw (`~20.5 kB` gzip) | Isolates i18next engine and language detector from app logic. |
| **Icon Vendor (`icons-vendor-*.js`)** | Isolated chunk (`< 25 kB` raw) | `~19.3 kB` raw (`~6.8 kB` gzip) | Isolates Lucide SVG icon paths into dedicated cached bundle. |
| **First Contentful Paint (FCP)** | `< 1.2s` (4x CPU throttling, 3G) | `< 0.9s` | Immediate reassurance that the safe space is active. |
| **Cumulative Layout Shift (CLS)** | `0.000` | `0.000` | Zero visual jarring or mis-taps during cognitive overload. |
| **Offline Precache Footprint** | `< 3.0 MiB` total precached assets | `~1.8 MiB` (55 entries) | Fits comfortably within low-end mobile browser PWA storage quotas. |

---

## 3. Intelligent Rollup Chunk Partitioning Architecture

### Root Cause Analysis: Naive Vite Bundle Bloat
In standard Vite configurations without manual chunking, importing JSON translation catalogs (`src/i18n/*.json`) statically inside `src/i18n/config.ts` causes Rollup to inline all 8 dictionaries (Indonesian, English, Javanese, Sundanese, Japanese, Chinese, Spanish, Arabic) directly into the entry `index.js` bundle. This causes the main entry chunk to balloon to **> 613 kB**, delaying initial execution and triggering Vite chunk size warnings.

### Rollup Manual Chunk Partitioning Algorithm
The solution is a deterministic `manualChunks` partitioning function in `vite.config.ts`. The implementation must account for:
1. **Cross-Platform Path Separators:** Windows systems utilize backslashes (`\`), whereas Linux/macOS and CI containers utilize forward slashes (`/`). A strict regex `/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/` ensures identical chunk isolation across all development and build environments.
2. **Vendor Prefix Precedence:** Evaluating `i18n-vendor` before generic node_modules ensures that `i18next` and `react-i18next` do not get swallowed into generic vendor chunks.

```typescript
// vite.config.ts — Rollup Manual Chunks Configuration
export default defineConfig({
  // ...
  build: {
    target: 'es2023',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // 1. All 8 translation catalogs (cross-platform compatible regex)
          if (/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)) {
            return 'i18n-locales';
          }

          // 2. Internationalization runtime libraries (evaluated before react-vendor)
          if (
            id.includes('node_modules/i18next') ||
            id.includes('node_modules/react-i18next') ||
            id.includes('node_modules/i18next-browser-languagedetector')
          ) {
            return 'i18n-vendor';
          }

          // 3. React Core Runtime & Router
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'react-vendor';
          }

          // 4. Heavy Analytics & Data Visualization (Recharts, D3 helpers)
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }

          // 5. Lightweight Icon Suite (Lucide React)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
        }
      }
    }
  }
});
```

---

## 4. Workbox Cache Tiers & Offline-First Integrity

RIMA utilizes a strict 3-tier offline caching hierarchy orchestrated via `vite-plugin-pwa` (Workbox `generateSW` mode):

```
┌────────────────────────────────────────────────────────────────────────┐
│             TIER 1: Precache Manifest (Zero Network Latency)            │
│  - Assets: index.html, index-*.js, i18n-locales-*.js, react-vendor-*.js│
│            icons-vendor-*.js, recharts-vendor-*.js, index-*.css        │
│  - Strategy: Workbox Precache (Pre-fetched during SW install)          │
│  - Scope: 100% of application code, icons, manifest, and dictionaries   │
│  - Headroom: maximumFileSizeToCacheInBytes: 3,000,000 (3 MiB safe zone)│
├────────────────────────────────────────────────────────────────────────┤
│             TIER 2: Runtime Caching (External Typography Assets)       │
│  - Assets: Google Fonts stylesheets & GStatic WOFF2 font binaries      │
│  - Strategy: CacheFirst with cacheableResponse [0, 200]                 │
│  - TTL: 365 days (maxEntries: 10 per cache domain)                     │
│  - Fail-safe: Fallback to system sans-serif fonts if offline on install│
├────────────────────────────────────────────────────────────────────────┤
│             TIER 3: Network-Isolated Local Storage (Zero Telemetry)    │
│  - Assets: Encrypted mood logs, CBT-I diary, C-SSRS assessments, JITAI │
│  - Strategy: Pure Client-Side localStorage / IndexedDB                 │
│  - Rule: 0 bytes dispatched across network. No background sync tags.   │
└────────────────────────────────────────────────────────────────────────┘
```

### Workbox Configuration Parameters in `vite.config.ts`
By default, Workbox enforces a `maximumFileSizeToCacheInBytes` limit of 2 MiB (2,097,152 bytes). If any bundle or source map approaches this ceiling, service worker generation throws a build-halting error. RIMA configures an explicit 3 MiB headroom:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'icons/*.png'],
  manifest: {
    name: 'RIMA — Ruang Interaksi Mental Aman',
    short_name: 'RIMA',
    display: 'standalone',
    theme_color: '#1a1f2e',
    background_color: '#141820',
    // ...
  },
  workbox: {
    // Explicit 3 MiB headroom prevents precache failure on translation bundles
    maximumFileSizeToCacheInBytes: 3000000,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
})
```

---

## 5. Low-End Mobile Optimization Runbook

### 1. Main-Thread CPU & Layout Throttling
- **GPU Compositing Exclusively:** All animations (e.g., calm breathing loader, pulsing badges) MUST animate only `transform` and `opacity`. Never animate `width`, `height`, `margin`, `padding`, or `box-shadow` as these trigger layout and repaint storms.
- **Cadence Regulation:** Crisis breathing animations must follow gentle, physiologically grounding cycles (3.5s to 4.0s) rather than rapid, frantic oscillations.
- **Sensory & Reduced-Motion Respect:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    .rima-calm-skeleton,
    .rima-calm-skeleton-card {
      animation: none !important;
      opacity: 0.65 !important;
    }
  }
  [data-sensory='calm'] .rima-calm-skeleton,
  [data-sensory='low-stimulation'] .rima-calm-skeleton {
    animation: none !important;
    opacity: 0.65 !important;
  }
  ```

### 2. Memory Leak Mitigation
- **Web Audio Teardown:** Somatic audio generators (`AudioContext`, `OscillatorNode`, `GainNode`) must be cleanly unmounted in React `useEffect` cleanups:
  ```typescript
  useEffect(() => {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    // ...
    return () => {
      try {
        osc.stop();
        osc.disconnect();
        audioCtx.close();
      } catch {
        // Safe disposal
      }
    };
  }, []);
  ```
- **MutationObserver & ResizeObserver Lifecycle:** Any DOM observer (such as the sensory attribute observer in `PageFallbackLoader`) must disconnect when the component unmounts (`observer.disconnect()`).

### 3. DOM Virtualization & Route-Level Code Splitting
- Never render unbounded lists in local history (mood entries, sleep diary records, journal archives). Cap unpaged rendered items at 50, using virtual scrolling or chronological pagination.
- Route components must be dynamically imported via `React.lazy()` with `<Suspense fallback={<PageFallbackLoader />}>` to avoid bloating the initial parse payload.

---

## 6. Verification & Audit Commands

Run the following test and verification commands to validate bundle budgets and PWA integrity:

```bash
# 1. Full Production Build & Bundle Verification
npm run build
# Expect:
# - dist/assets/i18n-locales-*.js generated (~567 kB)
# - dist/assets/index-*.js < 55 kB
# - Precache manifests ~55 entries (~1.8 MiB)
# - dist/sw.js and dist/workbox-*.js generated cleanly

# 2. Strict TypeScript Compilation Gate
npx tsc -b
# Expect: Exit code 0, 0 compiler errors

# 3. Fast Static Code Quality Lint (Oxlint)
npm run lint
# Expect: Found 0 warnings and 0 errors across all files

# 4. Full Vitest Test Suite Execution
npx vitest run
# Expect: 100% test pass rate across all test files (41+ suites, 410+ tests)
```
