# Original User Request

## 2026-10-10T06:45:35Z

Use a full multi-agent team.
Implement Phase 2 improvements for RIMA (Ruang Interaksi Mental Aman): an on-device Just-In-Time Adaptive Intervention (JITAI) smart engine that provides privacy-first contextual nudges based on local mood and sleep patterns, and a Fast-Action Emergency Safety Card for cognitive constriction crisis de-escalation.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Integrity mode: development

## Requirements

### R1. On-Device JITAI Recommendation Engine
Provide an on-device, zero-network adaptive intervention service that analyzes local mood trajectories (Yale Mood Meter 2D), sleep efficiency patterns (CBT-I diary), and activity engagement to surface timely, empathetic, and dismissible contextual nudge cards on the Home dashboard without external network tracking.

### R2. Fast-Action Emergency Safety Card
Provide an accessible, high-contrast, instant-action crisis interface designed for users experiencing acute emotional overwhelm and cognitive constriction, presenting single-tap de-escalation steps, trusted personal contact dialing, and immediate crisis line access (119 Ext 8).

### R3. Strict Project & Architectural Guardrails
Use the project's existing stack (React 19, TypeScript, vanilla CSS design tokens — strictly zero Tailwind CSS, Vitest, oxlint). All new user-facing copy must have 100% translation parity across all 8 supported languages (id, en, jv, su, ja, zh, es, ar).

## Acceptance Criteria

### Functional & Clinical Criteria
- [ ] JITAI engine deterministically evaluates local history to trigger appropriate micro-interventions (e.g., low sleep efficiency suggestions, mood drop recovery nudges, acute agitation calming paths) and respects daily dismiss state.
- [ ] Fast-Action Safety Card opens rapidly from emergency touchpoints, displaying primary coping action, primary trusted contact with working tel: link, 119 Ext 8 hotline button, and somatic grounding shortcut.

### Quality & Verification Gates
- [ ] Automated lint check passes with 0 errors and 0 warnings (npm run lint).
- [ ] TypeScript compilation check passes with 0 errors (npx tsc -b).
- [ ] Full Vitest suite passes 100% across all test files including newly added tests (npx vitest run).
- [ ] Production build succeeds and generates PWA Service Worker assets (npm run build).

## 2026-10-10T10:37:38Z

Use a full multi-agent team.
Implement Phase 3 improvements for RIMA (Ruang Interaksi Mental Aman): PWA Performance Optimization, intelligent Rollup chunk partitioning, trauma-informed calm suspense loader (PageFallbackLoader), and persist reusable specialized skills (rima-pwa-perf-and-code-splitting and rima-future-feature-architecture) in .agents/skills/.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Integrity mode: development

## Requirements

### R1. PWA Performance & Intelligent Chunk Partitioning
Optimize the production build bundle structure in vite.config.ts by configuring manual Rollup chunks for translation catalogs (i18n-locales) and heavy libraries while preserving 100% offline Workbox service worker precaching, reducing the main app chunk size.

### R2. Trauma-Informed Calm Suspense Fallback
Provide a dedicated PageFallbackLoader component for React Suspense route transitions that replaces high-speed spinning loaders with a calming, accessible, low-stimulation skeleton animation compliant with WCAG AA and psychiatric app design principles.

### R3. Reusable Skill Engineering (Learn Routine)
Create two modular skill packages in .agents/skills/:
1. rima-pwa-perf-and-code-splitting/SKILL.md: Runbook for bundle budgeting, Rollup manual chunk partitioning, Workbox cache tiers, and low-end mobile web performance.
2. rima-future-feature-architecture/SKILL.md: Comprehensive engineering blueprint enforcing RIMA's 6 core pillars (offline-first, zero-network telemetry, pure CSS tokens, 100% 8-language parity, defensive storage resilience, and 4-tier quality gates).

### R4. Strict Quality & Guardrail Compliance
Adhere to pure vanilla CSS tokens (zero Tailwind CSS), 100% 8-language parity, and ensure all existing and new unit/integration tests pass.

## Acceptance Criteria

### Functional & Architectural Criteria
- [ ] PageFallbackLoader renders smoothly during route transitions, respects data-sensory="low-stimulation", and provides accessible ARIA live-region labels.
- [ ] vite.config.ts partitions chunks cleanly without breaking offline PWA service worker precaching.
- [ ] Both learned skills are authored with valid YAML frontmatter and comprehensive instructions in .agents/skills/.

### Quality & Verification Gates
- [ ] Automated lint check passes with 0 errors and 0 warnings (npm run lint).
- [ ] TypeScript compilation check passes with 0 errors (npx tsc -b).
- [ ] Vitest test suite passes 100% with no regressions (npx vitest run).
- [ ] Production PWA build succeeds cleanly (npm run build).


## 2026-10-10T12:06:32Z

Use a full multi-agent team.
Rombak total antarmuka UI/UX pada RIMA (Ruang Interaksi Mental Aman) menjadi desain minimalis kelas dunia (kombinasi Zen Monastic dan Apple Health Wellbeing): memangkas polusi visual, menghilangkan tumpukan 11 kotak tombol yang berantakan, menghadirkan whitespace bernapas yang menenangkan, palet warna sunyi, tipografi elegan, dan pengelompokan fitur hierarkis yang intuitif.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Integrity mode: development

## Requirements

### R1. Minimalist Design Tokens & Architecture
Bersihkan dan sederhanakan src/styles/design-tokens.css dan src/styles/components.css:
- Gunakan palet minimalis yang tenang: charcoal/obsidian halus (#111418 / #0C1017) untuk dark mode, dan warm porcelain/linen (#F7F8FA) untuk light mode.
- Border sangat tipis dan halus (rgba(255, 255, 255, 0.06) / rgba(0, 0, 0, 0.06)).
- Hilangkan efek bayangan tebal/kasar; gantikan dengan elevasi halus dan difus.
- Tetap patuhi aturan Zero Tailwind CSS pada codebase aplikasi (hanya menggunakan pure vanilla CSS tokens).

### R2. Minimalist Screen Re-architecture (Home & Navigation)
Rombak src/pages/Home.tsx dan komponen terkait:
- Header Hening: Sapaan pengguna yang tenang dengan streak badge minimalis.
- Fluid Mood Check-In: Pemilih suasana hati yang halus, tidak mencolok, dan tidak menghakimi.
- Whisper Nudge: Banner JITAI adaptif berdesain ringkas dan tidak membebani mata.
- Kutipan Zen / Afirmasi: Tipografi editorial elegan dengan ruang kosong lega.
- Pilihan Hening (Pengganti 11 Tombol Kotak): Kelompokkan seluruh fitur ke dalam 4 baris kartu minimalis terstruktur:
  1. Jurnal & Refleksi (Jurnal, Skrining Mandiri, Edukasi).
  2. Regulasi Somatik (Audio Brown Noise, Latihan Napas, Grounding).
  3. Welas Asih & Koping (Self-Compassion CFT, TIPP Krisis, Aktivasi BA).
  4. Jaring Pengaman & Bantuan (Safety Plan, 119 Ext 8, Rujukan Puskesmas/BPJS).

### R3. Accessibility & Multi-Language Parity
- Pertahankan 100% paritas 8 bahasa (id, en, jv, su, ja, zh, es, ar) dan dukungan RTL Arab.
- Penuhi standar WCAG 2.2 AA (kontras rasio minimal 4.5:1, target sentuh >= 48px, dan dukungan data-sensory="low-stimulation").

## Acceptance Criteria

### Functional & Visual Criteria
- [ ] Tampilan Beranda bersih dari tombol kotak berwarna-warni yang berjejal, berganti menjadi tata letak minimalis yang rapi dan elegan.
- [ ] Kontras warna dan ukuran teks nyaman dibaca oleh mata yang sedang lelah atau cemas.
- [ ] Navigasi responsif pada perangkat seluler dan desktop.

### Quality & Verification Gates
- [ ] npm run lint lulus dengan 0 error dan 0 warning.
- [ ] npx tsc -b lulus dengan 0 error.
- [ ] Seluruh unit & integration test Vitest (41+ file) lulus 100% tanpa regresi.
- [ ] Build produksi PWA (npm run build) sukses bersih.
