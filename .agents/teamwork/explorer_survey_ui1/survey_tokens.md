# RIMA Styling Architecture & Design Tokens Survey Report (R1)
**Date:** 2026-10-10  
**Investigator:** Teamwork Preview Explorer (`explorer_survey_ui1`)  
**Target:** RIMA (Ruang Interaksi Mental Aman) — Phase UI/UX Overhaul  
**Aesthetic Direction:** Zen Monastic & Apple Health Wellbeing Minimalist Architecture  

---

## Executive Summary
This survey provides a comprehensive architectural audit of RIMA's CSS styling foundation across `src/styles/design-tokens.css`, `src/styles/components.css`, `src/styles/index.css`, and related UI components. 

The current styling system uses pure vanilla CSS custom properties (zero Tailwind CSS), but exhibits several legacy artifacts:
1. High blue saturation in dark mode backgrounds (`hsl(220, 25%, 10%)`) and stark contrast in light mode instead of tranquil charcoal/obsidian and warm porcelain/linen.
2. Thick, heavy drop shadows (`0 8px 32px rgba(0, 0, 0, 0.3)`) and aggressive neon glows (`--glow-primary`, `--glow-danger`).
3. Disconnected sensory attribute naming: `design-tokens.css` defines only `[data-sensory='calm']`, whereas components like `PageFallbackLoader.tsx` and test suites utilize `data-sensory='low-stimulation'` as well as `'calm'`.
4. Hardcoded HSLA and RGB values scattered across `src/styles/index.css` (e.g., hardcoded dark background on `.bottom-nav` breaking light mode; hardcoded mood selector colored drop-shadows).
5. Seven orphan tokens referenced in component code but missing from `design-tokens.css` (`--color-primary-soft`, `--text-muted`, `--border-color`, `--bg-input`, `--color-warning`, `--color-info`, `--color-success`).

All 41 test files (411 tests), `npm run lint`, and `npx tsc -b` currently pass with 0 errors. A non-breaking transition path preserves all existing token keys via in-place color refinement and additive backward-compatible aliases.

---

## 1. Styling Architecture & Hierarchy

### 1.1 File Structure
```
src/styles/
├── design-tokens.css   (5,411 bytes, 172 lines)  - CSS custom properties (color, space, type, radius, shadows)
├── components.css     (18,309 bytes, 767 lines) - Base component primitives (.btn, .card, .input, .modal, .badge, JITAI, PageFallbackLoader)
└── index.css          (68,490 bytes, 1318 lines) - App reset, shell layout, navigation, and page-level styling
```

### 1.2 Import Dependency Chain
`src/styles/index.css` acts as the root stylesheet imported by `src/main.tsx`:
```css
/* src/styles/index.css:1-3 */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@import './design-tokens.css';
@import './components.css';
```
No Tailwind CSS, PostCSS plugins, or CSS preprocessors are active. `package.json` contains zero Tailwind dependencies.

---

## 2. Current Palette Audit vs. Zen Monastic / Apple Health Target

### 2.1 Dark Mode (Default `:root`)

| Token | Current Value | Hex Equiv | Target Zen Monastic Value | Target Hex | Rationale & Clinical Impact |
|---|---|---|---|---|---|
| `--bg-primary` | `hsl(220, 25%, 10%)` | `#13171F` | `hsl(216, 30%, 7%)` | `#0C1017` | Deep obsidian void; cuts out cold high-chroma blue glare |
| `--bg-secondary` | `hsl(220, 20%, 14%)` | `#1C222B` | `hsl(216, 26%, 10%)` | `#121720` | Subtle charcoal tier for secondary containers |
| `--bg-card` | `hsl(220, 20%, 16%)` | `#212833` | `hsl(216, 24%, 12%)` | `#161C26` | Serene quiet card surface |
| `--bg-elevated` | `hsl(220, 18%, 20%)` | `#2A333D` | `hsl(216, 22%, 15%)` | `#1E2532` | Soft floating elevation |
| `--text-primary` | `hsl(0, 0%, 95%)` | `#F2F2F2` | `hsl(216, 20%, 94%)` | `#EEF2F6` | Soft pearl off-white; eliminates stark text glare |
| `--text-secondary` | `hsl(0, 0%, 75%)` | `#BFBFBF` | `hsl(216, 12%, 68%)` | `#A3ACB9` | Readable slate (WCAG AAA contrast 7.4:1 on #0C1017) |
| `--text-tertiary` | `hsl(0, 0%, 68%)` | `#ADADAD` | `hsl(216, 10%, 50%)` | `#747E8D` | Quiet metadata (WCAG AA compliant >= 4.5:1) |
| `--border-subtle` | `hsla(0, 0%, 100%, 0.08)` | 8% white | `rgba(255, 255, 255, 0.06)` | 6% white | Ultra-thin delicate boundary matching specification |
| `--border-strong` | `hsla(0, 0%, 100%, 0.15)` | 15% white | `rgba(255, 255, 255, 0.12)` | 12% white | Clean delineation without visual harshness |

### 2.2 Light Mode (`[data-theme='light']`)

| Token | Current Value | Hex Equiv | Target Apple Health Value | Target Hex | Rationale & Clinical Impact |
|---|---|---|---|---|---|
| `--bg-primary` | `hsl(220, 30%, 97%)` | `#F5F7FA` | `#F7F8FA` | `#F7F8FA` | Warm porcelain / unbleached linen; eliminates eye fatigue |
| `--bg-secondary` | `hsl(220, 20%, 94%)` | `#ECEFF4` | `#EEF0F4` | `#EEF0F4` | Soft linen contrast surface |
| `--bg-card` | `hsl(0, 0%, 100%)` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | Pristine resting card canvas |
| `--bg-elevated` | `hsl(0, 0%, 100%)` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | Floating card canvas |
| `--text-primary` | `hsl(220, 30%, 15%)` | `#1B2232` | `hsl(220, 22%, 10%)` | `#14181F` | Warm charcoal (14.5:1 contrast on #F7F8FA) |
| `--text-secondary` | `hsl(220, 15%, 35%)` | `#4C5567` | `hsl(220, 12%, 35%)` | `#4E5564` | Muted graphite (6.5:1 contrast on #FFFFFF) |
| `--text-tertiary` | `hsl(220, 15%, 40%)` | `#576175` | `hsl(220, 10%, 48%)` | `#707886` | Subtle metadata (4.6:1 contrast on #FFFFFF, passes AA) |
| `--border-subtle` | `hsla(220, 30%, 15%, 0.08)` | 8% dark | `rgba(0, 0, 0, 0.06)` | 6% black | Ultra-thin delicate border matching specification |
| `--border-strong` | `hsla(220, 30%, 15%, 0.15)` | 15% dark | `rgba(0, 0, 0, 0.10)` | 10% black | Balanced container outline |

### 2.3 Brand & Emotional Tones Transition
In place of high-chroma tech saturated hues, the Zen Monastic / Apple Health palette shifts to grounded, restorative mineral tones:

| Tone Key | Current `:root` | Target Restorative Tone | Rationale |
|---|---|---|---|
| `--color-primary` | `hsl(215, 65%, 55%)` | `hsl(212, 50%, 54%)` (Dark) / `hsl(212, 58%, 42%)` (Light) | Serene Zen Sky / Sage; calming, trustworthy |
| `--color-primary-hover` | `hsl(215, 65%, 45%)` | `hsl(212, 50%, 46%)` (Dark) / `hsl(212, 58%, 35%)` (Light) | Smooth transition on hover |
| `--color-primary-transparent` | `hsla(215, 65%, 55%, 0.1)` | `hsla(212, 50%, 54%, 0.12)` | Delicate tint for badges and selected states |
| `--color-secondary` | `hsl(165, 45%, 50%)` | `hsl(156, 38%, 48%)` | Restorative Moss / Jade |
| `--color-accent` | `hsl(270, 50%, 65%)` | `hsl(255, 36%, 64%)` | Quiet Iris / Heather; non-intrusive mindfulness tone |
| `--color-warm` | `hsl(35, 75%, 60%)` | `hsl(38, 62%, 54%)` | Gentle Ochre / Soft Sunlight; non-alarmist warmth |
| `--color-danger` | `hsl(0, 65%, 55%)` | `hsl(356, 62%, 56%)` (Dark) / `hsl(356, 65%, 44%)` (Light) | Terracotta / Soft Crimson; crisis-clear without panic induction |

---

## 3. Shadows & Elevations Re-engineering

### 3.1 Deficiencies in Current Shadows
Currently in `src/styles/design-tokens.css:64-70`:
```css
--shadow-subtle: 0 4px 20px rgba(0, 0, 0, 0.2);
--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
--shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.4);
--glow-primary: 0 0 15px hsla(215, 65%, 55%, 0.3);
--glow-secondary: 0 0 15px hsla(165, 45%, 50%, 0.3);
--glow-danger: 0 0 20px hsla(0, 65%, 55%, 0.4);
```
- Shadows use large blur radii (`32px`, `40px`) and heavy alpha (`0.3`, `0.4`), causing heavy, muddy dark halos around cards.
- Neon glow tokens (`--glow-primary`, `--glow-danger`) create aggressive visual stimulation counterproductive to psychiatric de-escalation.

### 3.2 Target Ambient Diffuse Elevations
Zen Monastic & Apple Health design avoids heavy dark drops, replacing them with multi-stop diffuse ambient occlusion:

```css
/* Dark Mode Ambient Elevations */
--shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.16), 0 1px 2px rgba(0, 0, 0, 0.10);
--shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.24), 0 2px 6px -1px rgba(0, 0, 0, 0.16);
--shadow-elevated: 0 12px 32px -4px rgba(0, 0, 0, 0.36), 0 4px 12px -2px rgba(0, 0, 0, 0.20);
--glow-primary: 0 0 16px hsla(212, 50%, 54%, 0.15);
--glow-secondary: 0 0 16px hsla(156, 38%, 48%, 0.15);
--glow-danger: 0 0 16px hsla(356, 62%, 56%, 0.20);

/* Light Mode Ambient Elevations */
--shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
--shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
--shadow-elevated: 0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
```

---

## 4. Sensory Modes Analysis (`data-sensory`)

### 4.1 Selector Inconsistency
`src/hooks/useTheme.ts:31` sets:
```ts
document.documentElement.setAttribute('data-sensory', 'calm');
```
However:
1. `src/components/common/PageFallbackLoader.tsx:19` accepts `'data-sensory'?: 'low-stimulation' | 'calm'`.
2. `src/components/__tests__/PageFallbackLoader.test.tsx:122-149` specifically tests `data-sensory="low-stimulation"` and `data-sensory="calm"`.
3. `src/styles/components.css:745-752` binds both:
   `[data-sensory='calm'] ...`, `[data-sensory='low-stimulation'] ...`.
4. In `src/styles/design-tokens.css:118, 152`, ONLY `[data-sensory='calm']` is selected!

**Action Required:** `design-tokens.css` must include both attribute values:
```css
[data-sensory='calm'],
[data-sensory='low-stimulation'] { ... }

[data-sensory='calm'][data-theme='light'],
[data-sensory='low-stimulation'][data-theme='light'] { ... }
```

### 4.2 Sensory Palettes
- **Dark Sensory Mode:** Desaturated charcoal background (`#0D1117`), softened text contrast, delicate borders (`rgba(255, 255, 255, 0.05)`), all `--glow-*` explicitly set to `none !important`.
- **Light Sensory Mode:** Warm unbleached paper / organic linen (`hsl(40, 20%, 95%)` / `#FAF7F2`), zero high-glare white, softened text glare (`hsl(215, 20%, 18%)`).

---

## 5. Token Inventory & Orphan Token Resolution

An exhaustive regex scan of `src/` revealed 64 CSS variable names referenced across TS, TSX, and CSS files. Seven of these tokens are currently orphan (referenced in code but missing from `design-tokens.css`):

| Orphan Token | Where Referenced | Current Fallback in Code | Resolution in `design-tokens.css` |
|---|---|---|---|
| `--color-primary-soft` | `src/pages/Home.tsx:167` | None (falls back to transparent) | Alias: `--color-primary-soft: var(--color-primary-transparent);` |
| `--text-muted` | `src/components/ui/Input.tsx:21` | None | Alias: `--text-muted: var(--text-tertiary);` |
| `--border-color` | `src/components/safety/CssrsWizardModal.tsx:209, 478` | None | Alias: `--border-color: var(--border-subtle);` |
| `--bg-input` | `src/pages/BehavioralActivation.tsx:793` | `var(--bg-secondary)` | Alias: `--bg-input: var(--bg-secondary);` |
| `--color-warning` | `src/services/cssrsService.ts:126`, `CssrsWizardModal.tsx:324, 390` | `#f59e0b` | Alias: `--color-warning: var(--color-warm);` |
| `--color-info` | `src/services/cssrsService.ts:139`, `CssrsWizardModal.tsx:340, 392` | `#3b82f6` | Alias: `--color-info: var(--color-primary);` |
| `--color-success` | `src/services/cssrsService.ts:151`, `CssrsWizardModal.tsx:356, 393` | `#10b981` | Alias: `--color-success: var(--color-secondary);` |

By declaring these 7 aliases in `design-tokens.css`, all legacy components and modals continue functioning seamlessly with zero code breakages.

---

## 6. Hardcoded Styles & Component Audit

### 6.1 Critical CSS Hardcoding in `src/styles/index.css`
1. **Line 229 (`.bottom-nav`):**
   ```css
   /* BROKEN IN LIGHT MODE: hardcoded dark background */
   background: hsla(220, 25%, 10%, 0.85);
   ```
   *Fix:* Replace with dynamic token:
   `background: hsla(216, 26%, 12%, 0.85);` in dark mode, and
   `background: rgba(247, 248, 250, 0.88);` in light mode (`[data-theme='light'] .bottom-nav`).
2. **Lines 280-285 (`.quick-action-btn.* .action-icon`):**
   Hardcoded `hsla(215, 65%, 55%, 0.12)`, `hsla(165, 45%, 50%, 0.12)`, `#0284c7`, `#6366f1`.
   *Fix:* When transitioning to the 4 structured rows in R2, replace with tokenized variables (`var(--color-primary-transparent)`, etc.).
3. **Lines 297-301 (`.mood-option.selected[data-mood="*"]`):**
   Hardcoded `box-shadow: 0 0 20px hsla(..., 0.25)` and thick borders.
   *Fix:* Refine to subtle, non-judgmental ring (`box-shadow: 0 0 0 2px var(--color-primary)` or ambient pill highlight).

### 6.2 Component-Level Style Duplications & Tailwinds
1. **`src/components/ui/MoodSelector.tsx:17-59`:** Contains an embedded `<style>` block redefining `.mood-selector` and `.mood-option` which duplicates and conflicts with `index.css:293-306`. Unifying these styles into `components.css` or `index.css` removes style dissonance.
2. **`src/components/ui/Button.tsx:25`:** Lingering Tailwind utility `animate-spin` on `<Loader2 className="animate-spin" />`. Replace or ensure keyframe `.rima-spin` / `animation: rimaSpin 0.8s linear infinite` is defined in `components.css`.
3. **`src/components/somatics/SoundscapePlayer.tsx:74`:** Hardcoded `rgba(2, 132, 199, 0.15)`. Replace with `var(--color-primary-transparent)`.
4. **`src/pages/Home.tsx:167`:** Inline style `style={{ backgroundColor: 'var(--color-primary-soft)' }}`. Fixed once `--color-primary-soft` alias is declared.

---

## 7. Minimal Breaking Surface & Safe Implementation Roadmap

### 7.1 What Will NOT Break
- **Vitest Suite (41 test files, 411 tests):** Tests do not assert on hardcoded pixel colors, but rather role attributes, DOM structure, and CSS variable string tokens (e.g. `expect(getMoodColor(1)).toBe('var(--color-danger)')`). Retaining token keys guarantees zero test regression.
- **TypeScript Compilation:** All token modifications occur in `.css` files, preserving 100% type safety.
- **Oxlint:** Zero JS/TS syntax modifications are required for the token overhaul.

### 7.2 Proposed Architecture for the 4 Hierarchical Rows (R2 Preview)
The user request mandates replacing the 11 cluttered action buttons on Home with 4 structured quiet rows:
1. **Jurnal & Refleksi:** Jurnal, Skrining Mandiri, Edukasi
2. **Regulasi Somatik:** Audio Brown Noise / Somatik, Latihan Napas, Grounding
3. **Welas Asih & Koping:** Belas Kasih Diri (CFT), TIPP Krisis, Aktivasi Perilaku (BA)
4. **Jaring Pengaman & Bantuan:** Rencana Keselamatan, 119 Ext 8 Hotline, Rujukan Puskesmas/BPJS

To support this cleanly without Tailwind, `components.css` should introduce:
```css
/* Zen Hierarchical Rows */
.zen-feature-matrix {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.zen-feature-group {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-subtle);
  transition: border-color var(--transition-fast);
}

.zen-group-header {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.zen-group-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.zen-item-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  min-height: 52px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.zen-item-tile:hover {
  background: var(--bg-elevated);
  border-color: var(--border-strong);
}
@media (max-width: 640px) {
  .zen-group-items {
    grid-template-columns: 1fr;
  }
  .zen-item-tile {
    flex-direction: row;
    justify-content: flex-start;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
```

---

## 8. Conclusion
The styling foundation of RIMA is clean and strictly vanilla CSS, but requires precise token realignment to achieve the requested Zen Monastic and Apple Health aesthetic. By adjusting `:root`, `[data-theme='light']`, and `[data-sensory]` tokens in `design-tokens.css`, adding missing backward-compatible aliases, and updating hardcoded styles in `index.css` and `components.css`, the overhaul can proceed safely with zero test breakage and maximum visual elegance.
