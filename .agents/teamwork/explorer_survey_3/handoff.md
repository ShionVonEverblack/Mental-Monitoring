# Phase 3 Exploration & Architectural Blueprint: i18n Catalogs, PWA Performance, Calm Suspense Loader, and Reusable Skills

**Author:** Explorer Survey 3 (i18n, Skills & Test Gates Specialist)  
**Date:** 2026-10-10  
**Status:** Complete  
**Target Audience:** Orchestrator, Worker M1, Worker M2, Worker M3, Test Writer, Challenger, and Reviewers  

---

## 1. Observation

Direct empirical observations from inspecting the codebase, configuration, test suites, and build outputs:

### 1.1 i18n Translation Catalogs & Key Parity
- **Location:** `src/i18n/` contains 8 locale JSON files: `id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`, plus `config.ts`.
- **Key Count:** Exactly **1,161 leaf keys** per language file. Parity across all 8 languages is currently **100%** with **0 missing keys, 0 extra keys, and 0 empty strings**.
- **Static Loading in `config.ts`:** Lines 5–12 statically import all 8 JSON files (`import idTranslations from './id.json'; ...`). Total uncompressed JSON file size across all 8 languages is **635,024 bytes (~620 KiB)**.
- **RTL Support:** `src/App.tsx` (lines 42–57) dynamically sets `document.documentElement.dir = lng.startsWith('ar') ? 'rtl' : 'ltr'` and `document.documentElement.lang = lng` via `i18n.on('languageChanged')`.
- **Existing Loading Keys:**
  - `common.loadingSafeSpace`: present in all 8 languages (`id`: "Memuat Ruang Aman...", `en`: "Loading Safe Space...", `jv`: "Ngamot Papan Aman...", `su`: "Ngamuat Rohangan Aman...", `ja`: "安全なスペースを読み込み中...", `zh`: "正在加载安全空间...", `es`: "Cargando espacio seguro...", `ar`: "جاري تحميل المساحة الآمنة...").
  - `common.loading`: present in all 8 languages (`id`: "Memuat...", `en`: "Loading...").
  - No dedicated `calmLoader` namespace currently exists in any of the 8 files (`calmLoader: false`).

### 1.2 Current Suspense Fallback & Sensory Modes
- **Location in App:** `src/App.tsx` (line 8 and line 65) imports `LoadingSpinner` and passes `<LoadingSpinner message={t('common.loadingSafeSpace', 'Memuat Ruang Aman...')} />` to `<Suspense fallback={...}>`.
- **Visual Mechanics of `LoadingSpinner.tsx`:** Lines 18–36 define a circular spinner with `animation: 'rimaSpin 0.8s linear infinite'` rotating 360 degrees every 800ms. This high-speed rotation is visually jarring and contrary to trauma-informed psychiatric design principles for acute emotional distress.
- **Sensory Calm Design Tokens:**
  - `src/styles/design-tokens.css` (lines 114–160) defines `[data-sensory='calm']` with desaturated color palettes, zero glow effects (`--glow-*: none !important`), and muted card borders.
  - `src/styles/index.css` (lines 31–48) specifies:
    ```css
    [data-sensory='calm'] *, [data-sensory='calm'] *::before, [data-sensory='calm'] *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```
  - `src/hooks/useTheme.ts` (lines 30–35) toggles `document.documentElement.setAttribute('data-sensory', 'calm')` based on `rima-low-stimulation`.

### 1.3 Production Build & Rollup Chunk Partitioning Baseline
- **Vite Configuration:** `vite.config.ts` (lines 90–106) defines `manualChunks(id)`:
  - `react-vendor` (`react`, `react-dom`, `react-router-dom`)
  - `recharts-vendor` (`recharts`)
  - `i18n-vendor` (`i18next`, `react-i18next`)
  - `icons-vendor` (`lucide-react`)
- **Bundle Bloat Observation:**
  - Because `src/i18n/*.json` is statically imported in `src/i18n/config.ts` and NOT intercepted by `manualChunks(id)`, all 620 KiB of raw JSON catalogs are bundled into the main entry bundle: `dist/assets/index-DAiHOxz2.js` (**613.57 kB raw, 224.11 kB gzip**).
  - Also, `i18next-browser-languagedetector` is not included in `i18n-vendor`, leaving it in the entry chunk.
- **PWA Service Worker Baseline:**
  - Workbox version: `v1.3.0` (`vite-plugin-pwa`).
  - Configuration: `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`.
  - Current precache table: **54 entries (1,797.98 KiB)**.
  - Generated files: `dist/sw.js`, `dist/workbox-835c8c05.js`, plus source maps.

### 1.4 Existing Skills Architecture in `.agents/skills/`
- **Location:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\skills\` contains 20 skill folders:
  - `rima-calm-tech`, `rima-client-crypto`, `rima-clinical-evidence`, `rima-component-creator`, `rima-crisis-nlp`, `rima-cross-feature-resilience`, `rima-deep-audit-security`, `rima-emotion-granularity`, `rima-i18n-management`, `rima-indexeddb-storage`, `rima-jitai-micro-interventions`, `rima-offline-security`, `rima-privacy-telemetry`, `rima-project-rules`, `rima-pwa-push-notifications`, `rima-qa-verification`, `rima-referral-protocols`, `rima-trauma-informed-design`, `rima-wcag-accessibility`, `rima-web-audio-somatics`.
- **Standard Skill Schema:**
  - Each skill is housed in a dedicated subfolder with a single `SKILL.md`.
  - YAML frontmatter:
    ```yaml
    ---
    name: <skill-name>
    description: >-
      <multi-line trigger description explaining when to invoke the skill>
    ---
    ```
  - Body structure: Clear markdown headings (`#`, `##`), ASCII architecture diagrams, clinical/empirical citations, code snippets, runbooks, and verification protocols.
- **Missing Phase 3 Skills:**
  - `rima-pwa-perf-and-code-splitting` (does not exist yet).
  - `rima-future-feature-architecture` (does not exist yet).

### 1.5 Quality Gates Baseline Execution
- **Lint Check (`npm run lint` / `oxlint`):**
  - Result: **0 warnings, 0 errors** across 125 files with 104 rules in **92ms**.
- **Type Check (`npx tsc -b`):**
  - Result: **0 errors** (clean exit code 0).
- **Test Suite (`npx vitest run`):**
  - Result: **40 test files passed (40/40), 396 tests passed (396/396)** in **23.93s**.
- **Production Build (`npm run build`):**
  - Result: **Built in 1.41s**, clean exit code 0, PWA service worker successfully generated.

---

## 2. Logic Chain

1. **Premise 1 (Main Bundle Bloat):** Observation 1.3 shows that `dist/assets/index-DAiHOxz2.js` is 613.57 kB because it contains all 8 translation JSON catalogs (620 KiB raw) imported in `src/i18n/config.ts`.
2. **Inference 1 (Targeted Chunk Partitioning):**
   - By matching JSON files in `src/i18n/` using `/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)` in `vite.config.ts -> rollupOptions.output.manualChunks(id)`, Rollup will extract all 8 translation catalogs into a dedicated `i18n-locales` chunk.
   - By adding `node_modules/i18next-browser-languagedetector` to `i18n-vendor`, the entry bundle will be purged of all translation overhead.
   - The main entry bundle (`index-[hash].js`) will shrink from 613.57 kB to ~35–50 kB raw (~10–15 kB gzip), achieving a >90% reduction in entry bundle payload.
3. **Premise 2 (Workbox Offline Precaching Safety):**
   - In `vite.config.ts`, Workbox uses `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`.
   - Any new chunk generated in `dist/assets/` (e.g. `i18n-locales-[hash].js`) is automatically matched by `**/*.js`.
   - Therefore, chunk partitioning does NOT break offline PWA functionality; the service worker precache table will simply register 55 entries instead of 54.
4. **Premise 3 (Trauma-Informed Suspense Fallback):**
   - Observation 1.2 shows that `LoadingSpinner.tsx` employs a high-velocity 0.8s circular CSS spinner.
   - According to SAMHSA Trauma-Informed Care principles and APA psychiatric app guidelines, high-velocity circular animations trigger autonomic arousal and cognitive frustration in overwhelmed users.
   - A dedicated `PageFallbackLoader` component using a soft, low-contrast skeleton card structure with a gentle 3.5s breathing pulse (or completely static rendering under `[data-sensory='calm']` and `prefers-reduced-motion`) satisfies WCAG AA and reduces cognitive load during route transitions.
5. **Premise 4 (100% 8-Language Translation Parity):**
   - Observation 1.1 and test file `src/test/i18nParity.test.ts` strictly enforce that any newly introduced i18n keys must be present in ALL 8 language catalogs (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) with non-empty string values.
   - Introducing `calmLoader` with keys `accessibleLabel`, `message`, and `hint` requires simultaneous updates across all 8 JSON files to avoid breaking `src/test/i18nParity.test.ts`.
6. **Premise 5 (Skill Packaging Standards):**
   - Observation 1.4 confirms that skill packages must adhere to the standard `.agents/skills/<skill-name>/SKILL.md` format with valid YAML frontmatter and deep domain runbooks.

---

## 3. Caveats

1. **Cross-Platform Path Normalization in Rollup `manualChunks`:**
   - On Windows, module IDs use backslashes (`\`), whereas on Linux/macOS they use forward slashes (`/`).
   - Using naive string matching like `id.includes('src/i18n/')` will fail on Windows build environments!
   - **Resolution:** Always use the regular expression `/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)` or normalize paths using `id.replace(/\\/g, '/')`.
2. **Sensory Mode Attribute Selectors:**
   - In `useTheme.ts`, the attribute applied to `document.documentElement` is `data-sensory="calm"`.
   - Requirement R2 mentions `data-sensory="low-stimulation"`.
   - **Resolution:** In `PageFallbackLoader` and CSS, support BOTH `[data-sensory='calm']` and `[data-sensory='low-stimulation']`, as well as checking the prop or the root attribute directly.
3. **Rollup Circular Chunk Dependencies:**
   - Partitioning `i18n-locales` separately from `i18n-vendor` is safe because `src/i18n/*.json` are pure JSON data objects with zero imports, preventing any circular chunk dependency cycles.

---

## 4. Conclusion & Actionable Blueprints

### 4.1 Blueprint for `vite.config.ts` Manual Chunks (Requirement R1)

In `vite.config.ts`, update `build.rollupOptions.output.manualChunks` as follows:

```typescript
        manualChunks(id) {
          // Partition all 8 i18n translation catalogs into a dedicated chunk
          // Cross-platform compatible for Windows (\) and POSIX (/) path separators
          if (/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)) {
            return 'i18n-locales';
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
          if (
            id.includes('node_modules/i18next') ||
            id.includes('node_modules/react-i18next') ||
            id.includes('node_modules/i18next-browser-languagedetector')
          ) {
            return 'i18n-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
        }
```

**Expected Build Output Impact:**
- `dist/assets/i18n-locales-[hash].js`: ~600 kB (gzip ~150 kB).
- `dist/assets/index-[hash].js`: drops from **613.57 kB** down to **< 50 kB**.
- PWA precache entries: 55 entries precached offline. Zero offline regressions.

---

### 4.2 Verbatim 8-Language Translation Keys for Calm Loader (Requirement R2 & R4)

The following `calmLoader` namespace must be added to all 8 translation files in `src/i18n/*.json`:

#### 1. `src/i18n/id.json` (Indonesian)
```json
  "calmLoader": {
    "accessibleLabel": "Menyiapkan ruang tenang Anda...",
    "message": "Memuat Ruang Aman...",
    "hint": "Tarik napas perlahan dan rileks sejenak."
  }
```

#### 2. `src/i18n/en.json` (English)
```json
  "calmLoader": {
    "accessibleLabel": "Preparing your calm space...",
    "message": "Loading Safe Space...",
    "hint": "Take a slow breath and relax for a moment."
  }
```

#### 3. `src/i18n/jv.json` (Javanese)
```json
  "calmLoader": {
    "accessibleLabel": "Nyawisake papan ayem panjenengan...",
    "message": "Ngamot Papan Aman...",
    "hint": "Tarik napas alon-alon lan sumeleh sedhela."
  }
```

#### 4. `src/i18n/su.json` (Sundanese)
```json
  "calmLoader": {
    "accessibleLabel": "Nyiapkeun rohangan tengtrem anjeun...",
    "message": "Ngamuat Rohangan Aman...",
    "hint": "Tarik napas lalaunan sareng santai sakedap."
  }
```

#### 5. `src/i18n/ja.json` (Japanese)
```json
  "calmLoader": {
    "accessibleLabel": "穏やかなスペースを準備しています...",
    "message": "安全なスペースを読み込み中...",
    "hint": "ゆっくりと深呼吸をして、一息つきましょう。"
  }
```

#### 6. `src/i18n/zh.json` (Chinese Simplified)
```json
  "calmLoader": {
    "accessibleLabel": "正在为您准备平静空间...",
    "message": "正在加载安全空间...",
    "hint": "缓慢深呼吸，稍作放松。"
  }
```

#### 7. `src/i18n/es.json` (Spanish)
```json
  "calmLoader": {
    "accessibleLabel": "Preparando tu espacio de calma...",
    "message": "Cargando espacio seguro...",
    "hint": "Respira hondo y relájate un momento."
  }
```

#### 8. `src/i18n/ar.json` (Arabic — RTL)
```json
  "calmLoader": {
    "accessibleLabel": "جاري إعداد مساحتك الهادئة...",
    "message": "جاري تحميل المساحة الآمنة...",
    "hint": "تنفس ببطء واسترخِ للحظة."
  }
```

---

### 4.3 Architecture & Component Specification for `PageFallbackLoader.tsx` (Requirement R2)

- **Target File:** `src/components/common/PageFallbackLoader.tsx`
- **Replaces:** `LoadingSpinner` in `src/App.tsx` `<Suspense fallback={...}>`
- **Clinical & Accessibility Design Principles:**
  - **WCAG 2.2 AA:** `role="status"`, `aria-live="polite"`, `aria-label={t('calmLoader.accessibleLabel')}`.
  - **Sensory Inclusivity:** Reads `document.documentElement.getAttribute('data-sensory')` (both `'calm'` and `'low-stimulation'`) and honors `@media (prefers-reduced-motion: reduce)`.
  - **Low-Stimulation Skeleton Structure:**
    - Soft top pill skeleton (header placeholder).
    - 2 card placeholder skeletons with subtle border radius (`12px`) and gentle translucent background (`var(--bg-card)`).
    - Gentle breathing wave: 3.5s rhythmic opacity pulse (`@keyframes rimaCalmBreath { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.85; } }`).
    - Under low-stimulation mode or reduced motion: animation stops completely (`animation: none !important`), rendering in static 0.6 opacity.
  - **Zero Tailwind:** Strictly vanilla CSS with design tokens (`var(--bg-primary)`, `var(--bg-card)`, `var(--text-secondary)`, `var(--border-subtle)`).

**Recommended Implementation Code:**
```tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PageFallbackLoaderProps {
  message?: string;
  hint?: string;
  'data-sensory'?: 'low-stimulation' | 'calm';
}

export const PageFallbackLoader: React.FC<PageFallbackLoaderProps> = ({
  message,
  hint,
  'data-sensory': propSensory,
}) => {
  const { t } = useTranslation();
  const [isLowStimulation, setIsLowStimulation] = useState(false);

  useEffect(() => {
    const checkSensory = () => {
      const docSensory = document.documentElement.getAttribute('data-sensory');
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsLowStimulation(
        propSensory === 'low-stimulation' ||
        propSensory === 'calm' ||
        docSensory === 'calm' ||
        docSensory === 'low-stimulation' ||
        prefersReduced
      );
    };

    checkSensory();

    const observer = new MutationObserver(checkSensory);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-sensory'],
    });

    return () => observer.disconnect();
  }, [propSensory]);

  const activeSensoryMode = propSensory || (isLowStimulation ? 'low-stimulation' : undefined);
  const displayMessage = message || t('calmLoader.message', t('common.loadingSafeSpace', 'Memuat Ruang Aman...'));
  const displayHint = hint || t('calmLoader.hint', 'Tarik napas perlahan dan rileks sejenak.');
  const accessibleLabel = t('calmLoader.accessibleLabel', 'Menyiapkan ruang tenang Anda...');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
      data-sensory={activeSensoryMode}
      data-testid="page-fallback-loader"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '32px 20px',
        boxSizing: 'border-box',
        gap: '24px',
      }}
    >
      {/* Calm Skeleton Header */}
      <div
        className="rima-calm-skeleton"
        style={{
          width: '60%',
          maxWidth: '300px',
          height: '24px',
          borderRadius: '12px',
          backgroundColor: 'var(--border-subtle, hsla(215, 20%, 65%, 0.18))',
          animation: isLowStimulation ? 'none' : 'rimaCalmBreath 3.5s ease-in-out infinite',
        }}
      />

      {/* Primary Card Skeleton */}
      <div
        className="rima-calm-skeleton-card"
        style={{
          width: '100%',
          minHeight: '140px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card, hsla(215, 12%, 18%, 0.6))',
          border: '1px solid var(--border-subtle, hsla(215, 20%, 65%, 0.15))',
          padding: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: isLowStimulation ? 'none' : 'rimaCalmBreath 3.5s ease-in-out infinite 0.3s',
        }}
      >
        <div
          style={{
            width: '40%',
            height: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--border-subtle, hsla(215, 20%, 65%, 0.2))',
          }}
        />
        <div
          style={{
            width: '90%',
            height: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--border-subtle, hsla(215, 20%, 65%, 0.12))',
          }}
        />
        <div
          style={{
            width: '75%',
            height: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--border-subtle, hsla(215, 20%, 65%, 0.12))',
          }}
        />
      </div>

      {/* Gentle Calming Copy */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-primary, #e2e8f0)',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          {displayMessage}
        </span>
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary, #94a3b8)',
            fontWeight: 400,
          }}
        >
          {displayHint}
        </span>
      </div>

      <style>{`
        @keyframes rimaCalmBreath {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.995);
          }
          50% {
            opacity: 0.85;
            transform: scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rima-calm-skeleton,
          .rima-calm-skeleton-card {
            animation: none !important;
            opacity: 0.65 !important;
          }
        }
        [data-sensory='calm'] .rima-calm-skeleton,
        [data-sensory='calm'] .rima-calm-skeleton-card,
        [data-sensory='low-stimulation'] .rima-calm-skeleton,
        [data-sensory='low-stimulation'] .rima-calm-skeleton-card {
          animation: none !important;
          opacity: 0.65 !important;
        }
      `}</style>
    </div>
  );
};
```

---

### 4.4 Blueprint for Skill 1: `rima-pwa-perf-and-code-splitting/SKILL.md` (Requirement R3)

- **Target Path:** `.agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md`
- **Frontmatter & Specification:**

```markdown
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
In digital mental health therapeutics, application latency and visual instability directly impair therapeutic outcomes. Users accessing RIMA during panic attacks, severe depression, or acute sensory overload have diminished working memory and heightened frustration thresholds (*Baumel et al., 2019*).

### Performance Budgets
- **Main App Entry Bundle (`index-[hash].js`):** Target < 50 kB uncompressed (< 15 kB gzip).
- **Vendor Chunks:** Isolated per dependency domain (`react-vendor`, `recharts-vendor`, `icons-vendor`, `i18n-vendor`).
- **Translation Catalogs (`i18n-locales`):** Partitioned into an independent cacheable chunk (~600 kB raw, ~150 kB gzip).
- **First Contentful Paint (FCP):** < 1.2s on mid-tier mobile (4x CPU throttling, 3G connection).
- **Cumulative Layout Shift (CLS):** 0.000 during route transitions.

---

## 2. Intelligent Rollup Chunk Partitioning Architecture

### Root Cause of Chunk Bloat
Static imports of JSON translation catalogs (`src/i18n/*.json`) inside `config.ts` cause bundlers to concatenate 8 complete dictionaries into the application entry chunk.

### Partitioning Strategy in `vite.config.ts`
```typescript
rollupOptions: {
  output: {
    manualChunks(id) {
      // 1. All 8 translation catalogs (cross-platform path check)
      if (/[\\/]src[\\/]i18n[\\/][^\\/]+\.json$/.test(id)) {
        return 'i18n-locales';
      }
      // 2. React Core
      if (
        id.includes('node_modules/react') ||
        id.includes('node_modules/react-dom') ||
        id.includes('node_modules/react-router-dom')
      ) {
        return 'react-vendor';
      }
      // 3. Heavy Charting (Only loaded on analytics/mood trends)
      if (id.includes('node_modules/recharts')) {
        return 'recharts-vendor';
      }
      // 4. i18n Libraries
      if (
        id.includes('node_modules/i18next') ||
        id.includes('node_modules/react-i18next') ||
        id.includes('node_modules/i18next-browser-languagedetector')
      ) {
        return 'i18n-vendor';
      }
      // 5. Feather / Lucide Icons
      if (id.includes('node_modules/lucide-react')) {
        return 'icons-vendor';
      }
    }
  }
}
```

---

## 3. Workbox Cache Tiers & Offline-First Integrity

RIMA operates on a 3-tier caching model:

```
┌────────────────────────────────────────────────────────┐
│  Tier 1: Precache Manifest (Zero Network Latency)       │
│  - All manual chunks (react-vendor, i18n-locales, app) │
│  - CSS tokens, icons, web manifest                     │
│  - Strategy: Workbox Precache (Cache-First Offline)    │
├────────────────────────────────────────────────────────┤
│  Tier 2: Runtime Caching (External Static Assets)      │
│  - Google Fonts & GStatic CDN (1-year TTL, max 10 ent) │
│  - Strategy: CacheFirst with cacheableResponse [0, 200]│
├────────────────────────────────────────────────────────┤
│  Tier 3: Network-Isolated Data (Zero Telemetry)        │
│  - Personal data NEVER leaves device                   │
│  - Zero background sync for mood/journal logs          │
└────────────────────────────────────────────────────────┘
```

---

## 4. Low-End Mobile Optimization Runbook

1. **CPU Main-Thread Budget:** Never run CSS animations with unbounded repaints. Use `transform` and `opacity` exclusively.
2. **Memory Leak Mitigation:**
   - Tear down `AudioContext` and oscillators on unmount.
   - Clean up `MutationObserver` instances in lifecycle hooks.
3. **DOM Virtualization:** Avoid rendering >50 unpaged DOM elements in mood and journal history lists.

---

## 5. Verification Commands
- `npm run build`: Verify `dist/assets/i18n-locales-*.js` exists and `index-*.js` is < 60 kB.
- `npx vitest run`: Verify all unit and integration tests pass with 0 regressions.
```

---

### 4.5 Blueprint for Skill 2: `rima-future-feature-architecture/SKILL.md` (Requirement R3)

- **Target Path:** `.agents/skills/rima-future-feature-architecture/SKILL.md`
- **Frontmatter & Specification:**

```markdown
---
name: rima-future-feature-architecture
description: >-
  Comprehensive engineering blueprint and architectural framework enforcing RIMA's 6 core pillars
  (offline-first, zero-network telemetry, pure CSS tokens, 100% 8-language parity, defensive storage
  resilience, and 4-tier quality gates). Use when designing, building, testing, or auditing any feature.
---

# RIMA Future Feature Architecture Blueprint

## 1. The 6 Non-Negotiable Architectural Pillars

### Pillar 1: Offline-First Reliability
- Every core therapeutic feature (Mood Tracker, CBT-I Sleep Diary, Safety Plan, TIPP Crisis Hub, Breathing Somatics, JITAI Nudges) MUST function with 100% feature completeness without an internet connection.
- Network is treated as an optional enhancement (anonymous peer forum only).

### Pillar 2: Zero-Network Telemetry & Strict Privacy
- **Zero Third-Party SDKs:** Strictly no Google Analytics, Firebase Analytics, Sentry, Mixpanel, or telemetry beacons.
- **Client-Side Hashing & Encryption:** Journals and sensitive notes are secured on-device using Web Crypto API (`AES-GCM-256` and `PBKDF2`).
- **Emergency Telephony:** Emergency crisis dials use explicit user-initiated standard telephony protocols (`tel:119,8`), avoiding any server intermediary.

### Pillar 3: Pure Vanilla CSS Design Tokens (Zero Tailwind)
- **STRICTLY ZERO TAILWIND CSS.** Never import or write utility classes (`flex`, `p-4`, `text-center`).
- All styles must use CSS custom properties (`var(--color-primary)`, `var(--bg-card)`, etc.) from `src/styles/design-tokens.css`.
- Interactive elements must satisfy WCAG 2.2 AA touch targets (`min-height: 44px`, `min-width: 44px`).

### Pillar 4: 100% 8-Language Translation Parity
- Supported languages: `id` (Indonesian - base), `en` (English), `jv` (Javanese), `su` (Sundanese), `ja` (Japanese), `zh` (Chinese), `es` (Spanish), `ar` (Arabic - RTL).
- Every visible string must use `t('namespace.key', 'fallback')`.
- All 8 files in `src/i18n/*.json` must have identical leaf keys. 0 missing keys, 0 empty strings.
- Arabic (`ar`) must automatically render in RTL via `document.documentElement.dir = 'rtl'`.

### Pillar 5: Defensive Storage Resilience
- All local storage operations must handle corrupted payloads, quota exhaustion, and schema migrations gracefully.
- State accessors must use `try / catch` with default fallback states:
  ```typescript
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT_STATE;
  } catch (err) {
    console.warn(`[Storage] Corrupted state at ${KEY}, resetting to default:`, err);
    return DEFAULT_STATE;
  }
  ```

### Pillar 6: 4-Tier Automated Quality Gates
Every code change must satisfy all 4 gates before merging:
1. `npm run lint` (`oxlint`): 0 warnings, 0 errors.
2. `npx tsc -b`: 0 TypeScript compiler errors.
3. `npx vitest run`: 100% test pass rate across all suites.
4. `npm run build`: Production bundle builds cleanly, generating PWA service worker.

---

## 2. Feature Implementation Runbook

### Step 1: Privacy & Threat Assessment
- Define localStorage key with `rima-` namespace prefix.
- Verify zero external network calls.

### Step 2: Trauma-Informed UI Design
- Map colors to semantic tokens (`--color-primary`, `--color-secondary`, `--bg-card`).
- Support `[data-sensory='calm']` and `[data-sensory='low-stimulation']`.

### Step 3: Internationalization Matrix
- Draft translations across all 8 languages simultaneously.
- Run `npx vitest run src/test/i18nParity.test.ts` to verify parity.

### Step 4: Component & Service Implementation
- Keep business logic in `src/services/` and UI in `src/components/`.
- Use TypeScript strict mode.

### Step 5: Test Coverage
- Unit test services in `src/services/__tests__/`.
- Component test with React Testing Library and accessible ARIA queries in `src/components/__tests__/`.

### Step 6: 4-Tier Gate Check
- Run all 4 validation commands.
```

---

### 4.6 Recommended Implementation Steps for Milestones 3 & 4

| Step | Milestone | Target File(s) | Action |
|:---|:---|:---|:---|
| **1** | M3 | `src/i18n/*.json` (all 8 files) | Add `calmLoader` namespace (`accessibleLabel`, `message`, `hint`) verbatim. |
| **2** | M3 | `src/components/common/PageFallbackLoader.tsx` | Create component with WCAG AA live region, calm skeleton, and sensory mode support. |
| **3** | M3 | `src/App.tsx` | Replace `LoadingSpinner` with `PageFallbackLoader` in `<Suspense fallback={...}>`. |
| **4** | M3 | `vite.config.ts` | Update `manualChunks` to partition `i18n-locales` and full `i18n-vendor`. |
| **5** | M3 | `src/components/__tests__/PageFallbackLoader.test.tsx` | Add unit & accessibility tests for `PageFallbackLoader`. |
| **6** | M4 | `.agents/skills/rima-pwa-perf-and-code-splitting/SKILL.md` | Create skill runbook using Blueprint 4.4. |
| **7** | M4 | `.agents/skills/rima-future-feature-architecture/SKILL.md` | Create skill blueprint using Blueprint 4.5. |
| **8** | M4 | Quality Gates | Run `npm run lint`, `npx tsc -b`, `npx vitest run`, `npm run build`. |

---

## 5. Verification Method

To independently verify the baseline and subsequent implementations, run the following exact commands in project root:

1. **Verify i18n Translation Parity across 8 Languages:**
   ```bash
   npx vitest run src/test/i18nParity.test.ts
   ```
   *Expected:* All 6 tests pass, 0 missing keys, 0 extra keys, 0 empty strings.

2. **Verify Static Code Quality (Oxlint):**
   ```bash
   npm run lint
   ```
   *Expected:* 0 warnings, 0 errors.

3. **Verify TypeScript Strict Compilation:**
   ```bash
   npx tsc -b
   ```
   *Expected:* Exits with code 0.

4. **Verify Full Vitest Suite (Unit, Component, Adversarial, E2E):**
   ```bash
   npx vitest run
   ```
   *Expected:* 40/40 test files pass, 396/396 tests pass.

5. **Verify PWA Build and Chunk Partitioning:**
   ```bash
   npm run build
   ```
   *Expected:*
   - `dist/assets/i18n-locales-*.js` generated (~600 kB).
   - `dist/assets/index-*.js` drops to < 60 kB.
   - PWA service worker precaches 55 assets cleanly (`dist/sw.js` generated).

**Invalidation Conditions:**
- Any newly added key is missing from any of the 8 language JSON files.
- `PageFallbackLoader` uses Tailwind CSS classes.
- Rollup `manualChunks` uses unescaped backslash or fails to match on Windows.
- Service worker precaching fails to include partitioned chunks.
