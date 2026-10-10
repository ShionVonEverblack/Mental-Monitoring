# Project: RIMA UI/UX Minimalist Overhaul (Zen Monastic & Apple Health Wellbeing)

## Architecture
- **Framework & Stack**: React 19, TypeScript, Vite, PWA (`vite-plugin-pwa` with Workbox), Vitest (jsdom), oxlint, i18next.
- **Styling Architecture**:
  - Strictly pure vanilla CSS using custom properties defined in `src/styles/design-tokens.css`, `src/styles/components.css`, and `src/styles/index.css`. Strictly ZERO Tailwind CSS.
  - **Dark Mode Zen Palette**: Obsidian void (`#0C1017`) and charcoal (`#111418` / `#161C26`), ultra-thin borders (`rgba(255, 255, 255, 0.06)`), pearl text (`#EEF2F6`), slate text (`#A3ACB9`).
  - **Light Mode Apple Health Palette**: Warm porcelain/linen (`#F7F8FA`), pristine resting cards (`#FFFFFF`), ultra-thin borders (`rgba(0, 0, 0, 0.06)`), warm charcoal text (`#14181F`), graphite text (`#4E5564`).
  - **Elevations**: Multi-stop diffuse ambient elevations replacing harsh 32px/40px drop-shadows and neon glows.
  - **Sensory Architecture**: Harmonized dual selectors `[data-sensory='calm']` and `[data-sensory='low-stimulation']` with zero-motion and desaturated low-glare palettes.
- **Screen Architecture (Home & Navigation)**:
  - **Header Hening**: Gentle greeting, minimal presence streak badge without gamified pressure, clean language switcher.
  - **Fluid Mood Check-In**: Subtle, non-judgmental mood logger with seamless link to Yale Mood Meter 2D.
  - **Whisper Nudge**: JITAI adaptive intervention card with quiet ambient framing, preserving 100% DOM and ARIA contracts.
  - **Zen Quote / Afirmasi**: Editorial typography, spacious breathing whitespace, elimination of garish gradients.
  - **Pilihan Hening (4 Structured Minimalist Card Rows)**:
    1. *Jurnal & Refleksi*: Jurnal (`/journal`), Skrining Mandiri (`/assessment`), Edukasi (`/education`).
    2. *Regulasi Somatik*: Audio Brown Noise (`audioSomaticsService`), Latihan Napas (`/breathe`), Grounding 5-4-3-2-1 (`/grounding`).
    3. *Welas Asih & Koping*: Belas Kasih Diri (`SelfCompassionModal`), TIPP Krisis (`/tipp`), Aktivasi BA (`/activation`).
    4. *Jaring Pengaman & Bantuan*: Rencana Keselamatan (`/safety-plan`), Hotline 119 Ext 8 (`tel:119,8`), Rujukan Puskesmas & BPJS (`/professional-help`).
- **Internationalization (i18n)**:
  - 100% translation key parity across all 8 supported languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
  - Full RTL support for Arabic with logical properties and auto-reversing icons.
- **Accessibility & Sensory**:
  - WCAG 2.2 AA compliant contrast ratios (>= 4.5:1 for all normal text).
  - Minimum touch target >= 48px across all interactive items.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Zen Monastic Dark Mode Palette | Pure charcoal/obsidian (#0C1017, #111418, #161C26) with pearl/slate text | M1 | Survey 1 |
| 2 | Apple Health Light Mode Palette | Warm porcelain/linen (#F7F8FA) with pure card surfaces and charcoal text | M1 | Survey 1 |
| 3 | Ultra-Thin Delicate Borders | 0.06 alpha borders (`rgba(255,255,255,0.06)` / `rgba(0,0,0,0.06)`) | M1 | Survey 1 |
| 4 | Diffuse Ambient Elevations | Eliminate harsh 32px/40px dark shadows and neon glows; replace with multi-stop diffuse shadows | M1 | Survey 1 |
| 5 | Sensory Dual-Selector Harmonization | Support `[data-sensory='low-stimulation']` alongside `[data-sensory='calm']` across all CSS files | M1 | Survey 1, Survey 3 |
| 6 | Backward-Compatible Token Aliases | Define 7 missing aliases (`--color-primary-soft`, `--text-muted`, `--border-color`, etc.) | M1 | Survey 1 |
| 7 | Pure Vanilla CSS Guardrail | Strictly ZERO Tailwind CSS classes or dependencies; 100% tokenized CSS | M1 | Survey 1 |
| 8 | 8-Language Translation Parity | Add 20 new keys for 4 card groups and calm elements across `id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar` | M2 | Survey 3 |
| 9 | Zero Missing Keys & Parity Gate Pass | 100% match with `id.json` verified by `src/test/i18nParity.test.ts` | M2 | Survey 3 |
| 10 | Header Hening & Presence Badge | Gentle greeting, subtle presence badge, clean language picker | M3 | Survey 2 |
| 11 | Fluid Mood Check-In & 2D Yale Link | Non-judgmental check-in with link to Yale Mood Meter 2D canvas | M3 | Survey 2 |
| 12 | Whisper Nudge JITAI Styling | Quiet ambient frame preserving 100% DOM, dismissal, and ARIA contracts | M3 | Survey 2 |
| 13 | Zen Quote Editorial Typography | Editorial typography with generous breathing whitespace | M3 | Survey 2 |
| 14 | Pilihan Hening 4 Structured Card Rows | Replace 11 buttons with 4 clean rows (Reflection, Somatics, Coping, Safety Net) | M3 | Survey 2 |
| 15 | Audio Brown Noise Direct Integration | Integrate procedural offline brown noise player directly into Somatics row | M3 | Survey 2 |
| 16 | Hotline 119 Ext 8 & BPJS Referral | Direct emergency dialing `tel:119,8` and `/professional-help` clinic referral in Safety row | M3 | Survey 2 |
| 17 | RTL Arabic Direction Polish | Replace physical margins with logical spacing/flex gap for Arabic RTL | M3 | Survey 3 |
| 18 | WCAG 2.2 AA Touch Target Standard | Ensure all button tiles and interactive cards measure >= 48px height | M3 | Survey 3 |
| 19 | Comprehensive Home Test Suite | Dedicated Vitest test suite (`src/pages/__tests__/Home.test.tsx`) covering all 4 rows and interactions | M4 | Survey 2, Survey 3 |
| 20 | 4-Tier Automated Quality Gates | Pass `npm run lint` (0/0), `npx tsc -b` (0), `npx vitest run` (100%), `npm run build` (clean PWA) | M4 | Survey 3 |
| 21 | Reviewer & Challenger Verification | Independent review and empirical test validation | M5 | Strategy |
| 22 | Forensic Integrity Audit | Systematic forensic audit verifying authentic implementation and zero cheating | M5 | Strategy |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Minimalist Design Tokens & Styling Architecture | `src/styles/design-tokens.css`, `src/styles/components.css`, `src/styles/index.css` | none | DONE |
| 2 | M2: 8-Language Translation Parity & Localization | `src/i18n/{id,en,jv,su,ja,zh,es,ar}.json` | none | DONE |
| 3 | M3: Minimalist Screen Re-architecture (Home.tsx) & RTL | `src/pages/Home.tsx`, `src/styles/components.css` | M1, M2 | DONE |
| 4 | M4: Dedicated Home Test Suite & 4-Tier Quality Gates | `src/pages/__tests__/Home.test.tsx`, full test suite execution | M3 | DONE |
| 5 | M5: Review, Challenger Verification & Forensic Integrity Audit | Reviewers, Challengers, and Forensic Auditor verification | M4 | DONE |

## Interface Contracts
### Minimalist Design Tokens Contract (`design-tokens.css`)
```css
:root {
  --bg-primary: #0C1017;
  --bg-secondary: #121720;
  --bg-card: #161C26;
  --bg-elevated: #1E2532;
  --text-primary: #EEF2F6;
  --text-secondary: #A3ACB9;
  --text-tertiary: #747E8D;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.16), 0 1px 2px rgba(0, 0, 0, 0.10);
  --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.24), 0 2px 6px -1px rgba(0, 0, 0, 0.16);
  --shadow-elevated: 0 12px 32px -4px rgba(0, 0, 0, 0.36), 0 4px 12px -2px rgba(0, 0, 0, 0.20);
}
[data-theme='light'] {
  --bg-primary: #F7F8FA;
  --bg-secondary: #EEF0F4;
  --bg-card: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --text-primary: #14181F;
  --text-secondary: #4E5564;
  --text-tertiary: #707886;
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-strong: rgba(0, 0, 0, 0.10);
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
  --shadow-elevated: 0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
}
```

### i18n Translation Schema Contract (`home` additions)
All 8 locale files must contain identical keys:
- `editorialTitle`, `editorialSubtitle`, `quietChoices`, `streakRecovery`, `noMoodsYet`, `zenAffirmation`, `openModule`
- `groupJournalTitle`, `groupJournalDesc`, `actionJournal`, `actionAssessment`, `actionEducation`
- `groupSomaticTitle`, `groupSomaticDesc`, `actionSoundscape`, `actionBreathe`, `actionGrounding`
- `groupCopingTitle`, `groupCopingDesc`, `actionCft`, `actionTipp`, `actionActivation`
- `groupSafetyTitle`, `groupSafetyDesc`, `actionSafetyPlan`, `actionHotline`, `actionReferral`

### Home Screen 4-Row Contract (`zen-feature-matrix`)
- Row 1 (Journal & Reflection): `/journal`, `/assessment`, `/education`
- Row 2 (Somatic Regulation): Brown noise audio toggle, `/breathe`, `/grounding`
- Row 3 (Compassion & Coping): `SelfCompassionModal` open, `/tipp`, `/activation`
- Row 4 (Safety Net & Support): `/safety-plan`, `tel:119,8`, `/professional-help`
- Touch targets: `min-height: 48px`
- Zero Tailwind CSS: Styled via `src/styles/components.css`

## Code Layout
- `src/styles/design-tokens.css` — Zen Monastic & Apple Health design tokens
- `src/styles/components.css` — Pure vanilla CSS component styles (including `.zen-feature-matrix`)
- `src/styles/index.css` — Shell layout, navigation bar, and reset styling
- `src/i18n/{id,en,jv,su,ja,zh,es,ar}.json` — 8-language localization catalogs
- `src/pages/Home.tsx` — Re-architected Home page with Zen header, fluid mood check-in, whisper nudge, editorial quote, and 4 structured card rows
- `src/pages/__tests__/Home.test.tsx` — Dedicated Vitest unit & accessibility tests for Home page
