# Hand-off Report: Phase 3 UI Routing, React Suspense & Calm Design Tokens Exploration

**Agent**: Explorer 2 (UI, React Suspense & Calm Design Tokens Specialist)  
**Working Directory**: `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_2\`  
**Date & Timestamp**: 2026-10-10T10:48:00Z  
**Target Milestone**: Phase 3 Milestone 2 (UI & Component Engineering)  

---

## 1. Observation

### 1.1 Current Route Definitions & React Suspense Hierarchy
- **File**: `src/App.tsx`
  - Lines 1: `import React, { useEffect, lazy, Suspense } from 'react';`
  - Line 8: `import { LoadingSpinner } from './components/common/LoadingSpinner';`
  - Lines 12–27: All 16 top-level application pages are lazy-loaded via dynamic `import(...)`:
    ```typescript
    const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
    const MoodTracker = lazy(() => import('./pages/MoodTracker').then(module => ({ default: module.MoodTracker })));
    const Journal = lazy(() => import('./pages/Journal').then(module => ({ default: module.Journal })));
    const Forum = lazy(() => import('./pages/Forum').then(module => ({ default: module.Forum })));
    const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
    const SafetyPlan = lazy(() => import('./components/safety/SafetyPlan').then(module => ({ default: module.SafetyPlan })));
    const Breathe = lazy(() => import('./pages/Breathe').then(module => ({ default: module.Breathe })));
    const Education = lazy(() => import('./pages/Education').then(module => ({ default: module.Education })));
    const ProfessionalHelp = lazy(() => import('./pages/ProfessionalHelp').then(module => ({ default: module.ProfessionalHelp })));
    const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
    const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
    const Grounding = lazy(() => import('./pages/Grounding').then(module => ({ default: module.Grounding })));
    const Assessment = lazy(() => import('./pages/Assessment').then(module => ({ default: module.Assessment })));
    const TippCrisisHub = lazy(() => import('./pages/TippCrisisHub').then(module => ({ default: module.TippCrisisHub })));
    const BehavioralActivation = lazy(() => import('./pages/BehavioralActivation').then(module => ({ default: module.BehavioralActivation })));
    const SleepTracker = lazy(() => import('./pages/SleepTracker').then(module => ({ default: module.SleepTracker })));
    ```
  - Lines 64–85: Single root Suspense boundary directly nested inside `AppShell`:
    ```tsx
    <AppShell>
      <Suspense fallback={<LoadingSpinner message={t('common.loadingSafeSpace', 'Memuat Ruang Aman...')} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/safety-plan" element={<SafetyPlan />} />
          <Route path="/breathe" element={<Breathe />} />
          <Route path="/education" element={<Education />} />
          <Route path="/professional-help" element={<ProfessionalHelp />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/grounding" element={<Grounding />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/tipp" element={<TippCrisisHub />} />
          <Route path="/activation" element={<BehavioralActivation />} />
          <Route path="/sleep" element={<SleepTracker />} />
        </Routes>
      </Suspense>
    </AppShell>
    ```

### 1.2 Layout Shell Mounting & Container Geometry
- **File**: `src/components/layout/AppShell.tsx` (Lines 12–35):
  - `AppShell` encapsulates the persistent navigation and safety chrome:
    - `<a href="#main-content" className="skip-link">` (WCAG 2.4.1 bypass block)
    - `<a href="https://www.google.com" className="quick-exit-btn">` (SAMHSA crisis quick exit)
    - `<Sidebar />` (Desktop navigation)
    - `<main className="app-main" id="main-content"><div className="app-content">{children}</div></main>`
    - `<BottomNav />` (Mobile bottom navigation)
    - `<SOSButton />` (Floating emergency safety trigger)
    - `<SessionAwareness />` (Humane technology time-in-app monitor)
- **File**: `src/styles/index.css` (Lines 198–201):
  - `.app-content`: `width: 100%; max-width: 800px; margin: 0 auto; padding: var(--spacing-lg) var(--spacing-md);`
  - Responsive desktop padding: `padding: var(--spacing-xl) var(--spacing-lg);`
  - **Observation**: Because the `<Suspense>` boundary is wrapped within `.app-content`, any fallback loader will inherit the max width of 800px, centering naturally within the page viewport without disrupting the fixed Sidebar, BottomNav, or SOS Button.

### 1.3 Analysis of Current `LoadingSpinner.tsx`
- **File**: `src/components/common/LoadingSpinner.tsx` (Complete file lines 1–40):
  ```tsx
  import React from 'react';

  interface LoadingSpinnerProps {
    message?: string;
  }

  export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
      <div role="status" aria-live="polite" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        padding: '40px 20px',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid hsla(215, 65%, 55%, 0.2)',
          borderTopColor: 'var(--color-primary, #4a7cf7)',
          borderRadius: '50%',
          animation: 'rimaSpin 0.8s linear infinite'
        }} />
        {message && (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>
            {message}
          </span>
        )}
        <style>{`
          @keyframes rimaSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  };
  ```
- **Deficiencies Observed**:
  1. **High-Velocity Rotational Motion (`0.8s linear infinite`)**: Rotational spinning at 1.25 Hz triggers visual vertigo, vestibular distress, and heightens autonomic arousal in users experiencing acute panic, sensory overwhelm, ADHD, or PTSD.
  2. **Violates Project Styling Architecture**: Employs hardcoded inline styles and an inline `<style>` block rather than classes in `src/styles/components.css`.
  3. **Bypasses Design Tokens**: Hardcodes `hsla(215, 65%, 55%, 0.2)`, `#4a7cf7`, and `#94a3b8` rather than utilizing `--border-subtle`, `--color-primary`, and `--text-secondary`.
  4. **No Structural Preview / High Layout Shift (CLS)**: Empties the viewport and places a tiny 40px circle, giving no visual cue of the incoming page layout (header, hero card, cards).
  5. **No Sensory Mode Awareness**: Does not react gracefully to `data-sensory="low-stimulation"` or `prefers-reduced-motion`. Although `index.css` sets `animation-duration: 0.001ms !important`, this leaves the spinner abruptly frozen at a random rotational angle.

### 1.4 Sensory Token System & Data-Sensory Attribute Conventions
- **File**: `src/hooks/useTheme.ts` (Lines 7, 29–35):
  - LocalStorage key: `'rima-low-stimulation'`
  - Application logic:
    ```typescript
    useEffect(() => {
      if (lowStimulation) {
        document.documentElement.setAttribute('data-sensory', 'calm');
      } else {
        document.documentElement.removeAttribute('data-sensory');
      }
    }, [lowStimulation]);
    ```
- **File**: `src/hooks/__tests__/useTheme.test.ts` (Lines 50, 57) & `src/components/__tests__/Profile.test.tsx` (Lines 70, 75):
  - Assertions explicitly test: `expect(document.documentElement.getAttribute('data-sensory')).toBe('calm');`.
- **File**: `src/styles/design-tokens.css` (Lines 118–170):
  - Selectors: `[data-sensory='calm']` and `[data-sensory='calm'][data-theme='light']`.
  - Tokens defined: Desaturated `--color-primary: hsl(212, 22%, 48%)`, glare-softened `--bg-primary: hsl(215, 14%, 12%)`, `--glow-primary: none !important`.
- **File**: `src/styles/index.css` (Lines 31–48):
  - Global motion suppression:
    ```css
    [data-sensory='calm'] *,
    [data-sensory='calm'] *::before,
    [data-sensory='calm'] *::after {
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
- **Crucial Requirement Gap Identified**:
  - The Phase 3 requirement explicitly states: *"PageFallbackLoader renders smoothly during route transitions, respects data-sensory='low-stimulation', and provides accessible ARIA live-region labels."*
  - In Phase 2, `useTheme.ts` and tests utilized `data-sensory="calm"`.
  - **Resolution**: To guarantee complete compatibility with both existing unit tests and the Phase 3 requirement specification, CSS rules must select both:
    `[data-sensory='calm'], [data-sensory='low-stimulation']`.
    This guarantees 100% backward test stability while fulfilling the Phase 3 contract.

### 1.5 8-Language Translation Verification for Loading Strings
- Verification performed on `src/i18n/*.json`:
  | Locale Code | Language | Key: `common.loadingSafeSpace` (lines 258 & 570) | Status |
  |---|---|---|---|
  | `id` | Indonesian | `"Memuat Ruang Aman..."` | Verified (Exact Parity) |
  | `en` | English | `"Loading Safe Space..."` | Verified (Exact Parity) |
  | `jv` | Javanese | `"Ngamot Papan Aman..."` | Verified (Exact Parity) |
  | `su` | Sundanese | `"Ngamuat Rohangan Aman..."` | Verified (Exact Parity) |
  | `ja` | Japanese | `"安全なスペースを読み込み中..."` | Verified (Exact Parity) |
  | `zh` | Chinese | `"正在加载安全空间..."` | Verified (Exact Parity) |
  | `es` | Spanish | `"Cargando espacio seguro..."` | Verified (Exact Parity) |
  | `ar` | Arabic | `"جاري تحميل المساحة الآمنة..."` | Verified (Exact Parity) |
- **Observation**: `common.loadingSafeSpace` is already populated with 100% parity across all 8 locales, requiring zero additional keys unless optional extensions are added.

### 1.6 Verification Gate Baseline
- Execution of verification suite yielded:
  - `npx vitest run`: **40 test files passed (40/40), 396 tests passed (396/396), 0 failures**.
  - `npm run lint` (oxlint): **0 errors, 0 warnings across 125 files**.
  - `npx tsc -b`: **Clean exit with code 0 (0 compilation errors)**.
  - `npm run build`: **Success in 1.67s; Workbox Service Worker generated 54 precached assets (1797.98 KiB)**.

---

## 2. Logic Chain

1. **Premise 1 (Trauma-Informed & Psychiatric Design Standards)**:
   - Users accessing RIMA (especially during crisis transitions to `/grounding`, `/tipp`, `/safety-plan`, or `/breathe`) are frequently experiencing sensory overload, panic, or cognitive constriction.
   - Clinical literature (SAMHSA TIC Principle 1 Safety; *Porges, Polyvagal Theory*) demonstrates that high-frequency optical oscillations (>1 Hz) trigger sympathetic nervous system activation and disorientation.
   - Conversely, slow, rhythmic visual cadence oscillating at 0.16–0.25 Hz (~10–15 cycles/minute) mirrors human autonomic coherent breathing, reinforcing parasympathetic down-regulation.

2. **Premise 2 (WCAG 2.2 AA Compliance & Assistive Tech Semantics)**:
   - WCAG SC 4.1.2 (Name, Role, Value) & SC 4.1.3 (Status Messages) mandate that asynchronous state changes must be announced to screen readers politely without interrupting current speech.
   - Adding `role="status"`, `aria-live="polite"`, `aria-busy="true"`, and an explicit `aria-label` satisfies these criteria.
   - Screen readers must not announce every decorative skeleton rectangle; therefore, placeholder skeleton elements must carry `aria-hidden="true"`, and a hidden `.sr-only` span or `aria-label` provides the concise, non-distracting notification.

3. **Premise 3 (Cognitive Predictability & CLS Elimination)**:
   - When lazy chunks load over mobile networks, rendering a layout skeleton that replicates a page header (title bar + subtitle bar), a primary hero card, and secondary card containers visually stabilizes the viewport.
   - This eliminates Cumulative Layout Shift (CLS) and provides mental containment: the user sees that a structured, safe room is actively being prepared.

4. **Premise 4 (Dual Sensory Attribute Architecture)**:
   - Existing unit tests in `src/hooks/__tests__/useTheme.test.ts` and `src/components/__tests__/Profile.test.tsx` assert that `document.documentElement.getAttribute('data-sensory') === 'calm'`.
   - The Phase 3 prompt specifies `data-sensory="low-stimulation"`.
   - By creating unified CSS selector rules supporting both `[data-sensory='calm']` and `[data-sensory='low-stimulation']`, all existing tests remain 100% green while any component or test applying `data-sensory="low-stimulation"` receives the complete motion suppression and calm token overrides.

5. **Premise 5 (Pure Vanilla Design Tokens)**:
   - The project guardrails strictly prohibit Tailwind CSS.
   - All styling must be authored in `src/styles/components.css` and use variables from `src/styles/design-tokens.css` (`--bg-primary`, `--bg-secondary`, `--bg-card`, `--border-subtle`, `--radius-lg`, `--radius-md`, `--radius-full`, `--spacing-md`, `--spacing-lg`, `--color-primary`, `--text-secondary`).

---

## 3. Caveats

1. **Existing Unit Test Invariants**:
   - Do NOT alter `useTheme.ts` to only write `low-stimulation` without `calm`. The existing test suite asserts `toBe('calm')`. Supporting both selectors in CSS and component logic avoids test regression.
2. **Backward Compatibility for `LoadingSpinner.tsx`**:
   - Although `LoadingSpinner.tsx` is only used in `App.tsx`, it is exported in `src/components/common/LoadingSpinner.tsx`. Milestone 2 should retain `LoadingSpinner.tsx` (optionally delegating to `PageFallbackLoader` or leaving it intact) while switching `App.tsx`'s Suspense boundary to `PageFallbackLoader`.
3. **Chunk Splitting Interoperability**:
   - `vite.config.ts` chunk partitioning (being addressed in Phase 3 Milestone 2 by the builder agent) will split i18n locales and heavy libraries into dedicated chunks. `PageFallbackLoader` must not import any heavy third-party libraries (e.g., Recharts) to ensure it can render instantaneously with zero chunk delay.

---

## 4. Conclusion & Complete Technical Specification

### 4.1 Component Specification: `src/components/common/PageFallbackLoader.tsx`

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export interface PageFallbackLoaderProps {
  /** Optional custom message; defaults to t('common.loadingSafeSpace', 'Memuat Ruang Aman...') */
  message?: string;
  /** Optional explicit aria-label for screen readers; defaults to message */
  ariaLabel?: string;
  /** Whether to render the primary hero skeleton card (default: true) */
  showHero?: boolean;
  /** Number of content card skeletons to render in the grid (default: 2) */
  cardsCount?: number;
  /** Additional CSS class name */
  className?: string;
}

export const PageFallbackLoader: React.FC<PageFallbackLoaderProps> = ({
  message,
  ariaLabel,
  showHero = true,
  cardsCount = 2,
  className = '',
}) => {
  const { t } = useTranslation();
  const displayMessage = message ?? t('common.loadingSafeSpace', 'Memuat Ruang Aman...');
  const computedAriaLabel = ariaLabel ?? displayMessage;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={computedAriaLabel}
      className={`page-fallback-loader ${className}`.trim()}
    >
      {/* Screen-reader-only accessible notification */}
      <span className="sr-only">{computedAriaLabel}</span>

      {/* Calming status pill with coherent breathing dot */}
      <div className="page-fallback-status-pill">
        <Shield className="page-fallback-status-icon" size={16} aria-hidden="true" />
        <span className="page-fallback-status-dot" aria-hidden="true" />
        <span className="page-fallback-status-text">{displayMessage}</span>
      </div>

      {/* Page Header Skeleton */}
      <div className="page-fallback-header" aria-hidden="true">
        <div className="page-fallback-skeleton page-fallback-skeleton-title" />
        <div className="page-fallback-skeleton page-fallback-skeleton-subtitle" />
      </div>

      {/* Primary Hero Skeleton Card */}
      {showHero && (
        <div className="page-fallback-card page-fallback-hero-card" aria-hidden="true">
          <div className="page-fallback-card-header">
            <div className="page-fallback-skeleton page-fallback-skeleton-avatar" />
            <div className="page-fallback-card-header-lines">
              <div className="page-fallback-skeleton page-fallback-skeleton-line-lg" />
              <div className="page-fallback-skeleton page-fallback-skeleton-line-sm" />
            </div>
          </div>
          <div className="page-fallback-skeleton page-fallback-skeleton-block" />
        </div>
      )}

      {/* Content Cards Grid Skeleton */}
      {cardsCount > 0 && (
        <div className="page-fallback-grid" aria-hidden="true">
          {Array.from({ length: cardsCount }).map((_, index) => (
            <div key={index} className="page-fallback-card" aria-hidden="true">
              <div className="page-fallback-skeleton page-fallback-skeleton-line-md" />
              <div className="page-fallback-skeleton page-fallback-skeleton-line-full" />
              <div className="page-fallback-skeleton page-fallback-skeleton-line-sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 4.2 CSS Rules for `src/styles/components.css`

```css
/* ==========================================================================
   PageFallbackLoader — Trauma-Informed Calm Suspense Fallback (WCAG 2.2 AA)
   Designed with zero high-speed spinning, coherent breathing pulse (0.22 Hz),
   and zero motion under [data-sensory='calm'] / [data-sensory='low-stimulation'].
   ========================================================================== */

/* Coherent Breathing Keyframes (4.5s cycle: ~13 breaths/min, parasympathetic rhythm) */
@keyframes rimaCalmRespiration {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes rimaDotBreathe {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* Root Loader Container */
.page-fallback-loader {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  padding: var(--spacing-md) 0;
  box-sizing: border-box;
}

/* Calm Status Pill */
.page-fallback-status-pill {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-subtle);
}

.page-fallback-status-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.page-fallback-status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  animation: rimaDotBreathe 4.5s ease-in-out infinite;
  flex-shrink: 0;
}

.page-fallback-status-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

/* Header Skeleton */
.page-fallback-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.page-fallback-skeleton-title {
  height: 32px;
  width: 48%;
  max-width: 280px;
  min-width: 180px;
  border-radius: var(--radius-md);
}

.page-fallback-skeleton-subtitle {
  height: 16px;
  width: 72%;
  max-width: 420px;
  border-radius: var(--radius-sm);
}

/* Base Skeleton Pulse */
.page-fallback-skeleton {
  background-color: var(--bg-secondary);
  animation: rimaCalmRespiration 4.5s ease-in-out infinite;
}

/* Card Skeleton Containers */
.page-fallback-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-subtle);
}

.page-fallback-hero-card {
  min-height: 140px;
}

.page-fallback-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-fallback-skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.page-fallback-card-header-lines {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.page-fallback-skeleton-line-lg {
  height: 20px;
  width: 60%;
  border-radius: var(--radius-sm);
}

.page-fallback-skeleton-line-md {
  height: 18px;
  width: 40%;
  border-radius: var(--radius-sm);
}

.page-fallback-skeleton-line-sm {
  height: 14px;
  width: 30%;
  border-radius: var(--radius-sm);
}

.page-fallback-skeleton-line-full {
  height: 14px;
  width: 100%;
  border-radius: var(--radius-sm);
}

.page-fallback-skeleton-block {
  height: 56px;
  width: 100%;
  border-radius: var(--radius-md);
}

/* Grid Layout for Multiple Cards */
.page-fallback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-md);
  width: 100%;
}

/* ==========================================================================
   Zero-Motion & Low-Stimulation Sensory Overrides (WCAG 2.2 / Sensory Calm)
   ========================================================================== */
[data-sensory='calm'] .page-fallback-skeleton,
[data-sensory='low-stimulation'] .page-fallback-skeleton,
[data-sensory='calm'] .page-fallback-status-dot,
[data-sensory='low-stimulation'] .page-fallback-status-dot {
  animation: none !important;
  opacity: 0.6 !important;
  transform: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .page-fallback-skeleton,
  .page-fallback-status-dot {
    animation: none !important;
    opacity: 0.6 !important;
    transform: none !important;
  }
}
```

### 4.3 Proposed Integration in `src/App.tsx`
Replace `LoadingSpinner` with `PageFallbackLoader`:
```tsx
// Before:
import { LoadingSpinner } from './components/common/LoadingSpinner';
...
<Suspense fallback={<LoadingSpinner message={t('common.loadingSafeSpace', 'Memuat Ruang Aman...')} />}>

// After:
import { PageFallbackLoader } from './components/common/PageFallbackLoader';
...
<Suspense fallback={<PageFallbackLoader />}>
```

### 4.4 Unit Test Specification: `src/components/__tests__/PageFallbackLoader.test.tsx`
Comprehensive test suite asserting:
1. Outer container has `role="status"`, `aria-live="polite"`, `aria-busy="true"`, and accessible label.
2. Contains screen-reader `.sr-only` announcement node with matching text.
3. Renders the calm status pill with `Shield` icon and reassurance message.
4. Renders header skeleton with title and subtitle marked with `aria-hidden="true"`.
5. Toggles hero card based on `showHero` prop (`true` by default, omitted when `false`).
6. Renders configured number of cards according to `cardsCount`.
7. Custom `message` and `ariaLabel` props override default values.
8. Sensory mode compatibility: renders static skeleton classes and verifies absence of hardcoded inline spinner animations.

---

## 5. Verification Method

### 5.1 Independent Verification Commands
Run the 4-tier quality gates:
1. `npm run lint` — Must report 0 errors and 0 warnings.
2. `npx tsc -b` — Must exit with 0 errors.
3. `npx vitest run` — All test files (including new `PageFallbackLoader.test.tsx`) must pass 100%.
4. `npm run build` — Must produce clean production bundles and Workbox service worker.

### 5.2 Visual & Sensory Invalidation Conditions
- If `PageFallbackLoader` contains any high-velocity spinning elements (`rotate(360deg)` faster than 2 seconds), it fails trauma-informed criteria.
- If `PageFallbackLoader` fails to silence animations when `document.documentElement.setAttribute('data-sensory', 'low-stimulation')` or `data-sensory="calm"` is active, it fails sensory calm criteria.
- If any text contrast falls below 4.5:1 on dark, light, or calm themes, it violates WCAG SC 1.4.3.
- If any non-English/non-Indonesian locale throws a missing translation warning or renders undefined for `common.loadingSafeSpace`, it violates 8-language parity.
