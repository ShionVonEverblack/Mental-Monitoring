# DISPATCH: Worker M2 (Trauma-Informed PageFallbackLoader & 8-Language Parity)

## Identity
- Type: teamwork_preview_worker
- Role: Implementation Worker (UI & i18n Specialist)
- Working Directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2\
- Project Root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
- Authoritative Request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope Document: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md
- Technical Blueprints:
  - C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_2\handoff.md (UI, CSS, WCAG AA, and component specification)
  - C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_survey_3\handoff.md (i18n translation catalogs across all 8 languages)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusive Write Ownership
You have exclusive write ownership of:
- `src/components/common/PageFallbackLoader.tsx` (new)
- `src/styles/components.css`
- `src/i18n/id.json`
- `src/i18n/en.json`
- `src/i18n/jv.json`
- `src/i18n/su.json`
- `src/i18n/ja.json`
- `src/i18n/zh.json`
- `src/i18n/es.json`
- `src/i18n/ar.json`
- `src/App.tsx`
- `src/components/__tests__/PageFallbackLoader.test.tsx` (new)

Do NOT touch any other source files during this milestone. Preserve `LoadingSpinner.tsx` for backward compatibility.

## Objective & Detailed Requirements
1. **8-Language Translations for Calm Loader**:
   Add the `calmLoader` namespace verbatim to all 8 translation files in `src/i18n/`:
   - `id.json`:
     `"calmLoader": { "accessibleLabel": "Menyiapkan ruang tenang Anda...", "message": "Memuat Ruang Aman...", "hint": "Tarik napas perlahan dan rileks sejenak." }`
   - `en.json`:
     `"calmLoader": { "accessibleLabel": "Preparing your calm space...", "message": "Loading Safe Space...", "hint": "Take a slow breath and relax for a moment." }`
   - `jv.json`:
     `"calmLoader": { "accessibleLabel": "Nyawisake papan ayem panjenengan...", "message": "Ngamot Papan Aman...", "hint": "Tarik napas alon-alon lan sumeleh sedhela." }`
   - `su.json`:
     `"calmLoader": { "accessibleLabel": "Nyiapkeun rohangan tengtrem anjeun...", "message": "Ngamuat Rohangan Aman...", "hint": "Tarik napas lalaunan sareng santai sakedap." }`
   - `ja.json`:
     `"calmLoader": { "accessibleLabel": "穏やかなスペースを準備しています...", "message": "安全なスペースを読み込み中...", "hint": "ゆっくりと深呼吸をして、一息つきましょう。" }`
   - `zh.json`:
     `"calmLoader": { "accessibleLabel": "正在为您准备平静空间...", "message": "正在加载安全空间...", "hint": "缓慢深呼吸，稍作放松。" }`
   - `es.json`:
     `"calmLoader": { "accessibleLabel": "Preparando tu espacio de calma...", "message": "Cargando空间 seguro...", "hint": "Respira hondo y relájate un momento." }` (Note: ensure clean Spanish translation: "Cargando espacio seguro...")
   - `ar.json`:
     `"calmLoader": { "accessibleLabel": "جاري إعداد مساحتك الهادئة...", "message": "جاري تحميل المساحة الآمنة...", "hint": "تنفس ببطء واسترخِ للحظة." }`
   Verify parity: `npx vitest run src/test/i18nParity.test.ts` must pass 100%.

2. **Component Implementation: `src/components/common/PageFallbackLoader.tsx`**:
   - Calming, accessible, low-stimulation skeleton animation compliant with WCAG 2.2 AA and psychiatric app design principles.
   - Root container with `role="status"`, `aria-live="polite"`, `aria-busy="true"`, and accessible label (`aria-label={computedAriaLabel}`).
   - Include `.sr-only` span with accessible announcement text.
   - Calm status pill with icon (`Shield` from `lucide-react`) and message text.
   - Visual skeleton layout: Header skeleton, primary hero card skeleton, and card grid skeleton (all marked `aria-hidden="true"`).
   - Props: `message`, `hint`, `ariaLabel`, `showHero` (default true), `cardsCount` (default 2), `className`, `'data-sensory'`.
   - Sensory mode support: Check prop, observe `document.documentElement.getAttribute('data-sensory')` (`'calm'` or `'low-stimulation'`), and check `prefers-reduced-motion`. In low-stimulation mode, animation is completely stopped (`animation: none !important`), rendering in static calm opacity.
   - Zero high-speed spinning.

3. **Styling in `src/styles/components.css`**:
   - Pure vanilla CSS design tokens (`var(--bg-card)`, `var(--border-subtle)`, `var(--color-primary)`, `var(--text-secondary)`, `var(--spacing-*)`, `var(--radius-*)`). Strictly ZERO Tailwind CSS.
   - Gentle parasympathetic respiration pulse: `@keyframes rimaCalmRespiration { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.85; } }` (3.5s–4.5s cycle).
   - Low-stimulation and reduced-motion overrides:
     `[data-sensory='calm'] .page-fallback-skeleton, [data-sensory='low-stimulation'] .page-fallback-skeleton, @media (prefers-reduced-motion: reduce) { animation: none !important; opacity: 0.65 !important; }`

4. **Integration in `src/App.tsx`**:
   - Import `PageFallbackLoader` from `./components/common/PageFallbackLoader`.
   - Update `<Suspense fallback={<PageFallbackLoader />}>`.

5. **Unit & Accessibility Tests: `src/components/__tests__/PageFallbackLoader.test.tsx`**:
   - Write comprehensive tests asserting:
     * Accessible semantics: `role="status"`, `aria-live="polite"`, `aria-busy="true"`, and label.
     * Accessible sr-only node.
     * Calming status pill with message.
     * Skeleton structure and `aria-hidden="true"`.
     * `showHero` and `cardsCount` props behavior.
     * Sensory mode attributes (`data-sensory="low-stimulation"` and `data-sensory="calm"`).
     * Custom message and hint overrides.

6. **Quality Gate Verification**:
   - `npm run lint` -> 0 errors, 0 warnings.
   - `npx tsc -b` -> 0 errors.
   - `npx vitest run` -> 100% test pass.
   - `npm run build` -> clean PWA build.

## Output Requirements
Write your detailed report to:
`C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2\handoff.md`
Report file changes, test outputs, and quality gate results. Then send a completion message to the orchestrator.


## 2026-10-10T11:07:21Z
You are an Implementation Worker for Milestone 2 of RIMA Phase 3 improvements.
Your working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2\
Project root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Your dispatch instructions: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2\DISPATCH.md
Read ORIGINAL_REQUEST.md and DISPATCH.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership of:
- src/components/common/PageFallbackLoader.tsx
- src/styles/components.css
- src/i18n/*.json (all 8 languages)
- src/App.tsx
- src/components/__tests__/PageFallbackLoader.test.tsx

Implement PageFallbackLoader, add pure vanilla CSS calm styling, add calmLoader translations across all 8 languages, integrate in App.tsx Suspense, add unit tests, run all quality gates, and write your report to C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\worker_m2\handoff.md.
When finished, notify the orchestrator with send_message.
