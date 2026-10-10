# Explorer 2 Handoff Report: Crisis Safety UI & Emergency Touchpoints Survey

## 1. Observation

### 1.1 Existing Emergency & Crisis Interfaces
- **Global Floating Action Button (`SOSButton.tsx`)**:
  - File: `src/components/safety/SOSButton.tsx` (lines 16–30, 66–72, 74–105)
  - Location: Included globally in `src/components/layout/AppShell.tsx` (line 33).
  - Floating styling: Fixed bottom-right action button (`width: 56px; height: 56px; border-radius: 50%; z-index: 60; bottom: 2rem; right: 2rem;` on desktop; `bottom: 5rem; right: 1rem;` on mobile `max-width: 768px`).
  - Clicking launches a standard modal (`<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('sos.title', 'Butuh Bantuan?')} size="md">`) iterating over `CRISIS_HOTLINES` from `src/utils/constants.ts`:
    1. `healing119` ("Healing 119 / SEJIWA (Kemenkes)", phone: `'119 ext 8'`)
    2. `emergency112` ("Panggilan Darurat Bebas Pulsa", phone: `'112'`)
    3. `ambulans119` ("Ambulans / Gawat Darurat Medis", phone: `'119'`)
    4. `pulih` ("Yayasan Pulih", phone: `'021-788-42580'`)
- **Crisis Interceptor (`CrisisInterceptor.tsx`)**:
  - File: `src/components/safety/CrisisInterceptor.tsx` (lines 14–23, 32–163)
  - Trauma-informed non-alarmist modal (SAMHSA 6 Principles): Emphasizes calm reassurance (`Heart` icon in `var(--color-secondary)`), title `"Kamu tidak sendirian"`, call links for top 3 hotlines, shortcut to open C-SSRS screener (`CssrsWizardModal`), and clear dismissal button (`t('crisis.interceptorDismiss', 'Saya baik-baik saja, terima kasih')`).
- **Columbia-Suicide Severity Rating Scale Wizard (`CssrsWizardModal.tsx`)**:
  - File: `src/components/safety/CssrsWizardModal.tsx` (lines 442–504)
  - Evaluates suicidal ideation/behavior risk (High, Moderate, Low, None).
  - On High or Moderate risk, renders direct hotline action:
    ```tsx
    href="tel:119,8"
    // {t('cssrs.btnCall119', 'Hubungi Healing 119')} (119 ext 8)
    ```
    and secondary emergency button `href="tel:112"`, plus button to `/safety-plan`.
- **Escalation Banner (`EscalationBanner.tsx`)**:
  - File: `src/components/common/EscalationBanner.tsx` (lines 12–39) & `src/services/escalationService.ts` (lines 29–143)
  - Rendered at top of Home dashboard (`src/pages/Home.tsx` line 162).
  - When escalation level = 3 (crisis/severe), displays:
    - Route `/professional-help` (`escalation.actionSOS`, icon `🚨`)
    - Route `/safety-plan` (`escalation.actionSafetyPlan`, icon `🛡️`)
  - When escalation level = 2 (distress/5-day downward trend), displays:
    - Route `/tipp` (`escalation.actionTipp`, icon `🧊`)
    - Route `/forum` (`escalation.actionForum`, icon `👥`)
    - Route `/safety-plan` (`escalation.actionSafetyPlan`, icon `🛡️`)
- **Personal Safety Plan (`SafetyPlan.tsx`)**:
  - File: `src/components/safety/SafetyPlan.tsx` (lines 25–113, 127–273)
  - Route: `/safety-plan`.
  - Implements 6 Stanley-Brown safety planning sections:
    1. Warning Signs (`warningSigns`)
    2. Internal Coping Strategies (`copingStrategies`)
    3. Social Contacts for Distraction (`socialContacts`)
    4. Professionals & Crisis Helplines (`professionals`)
    5. Making Environment Safe (`safeEnvironment`)
    6. Reasons to Live (`reasonsToLive`)
  - Backed by `useLocalStorage<PlanSection[]>('rima-safety-plan', INITIAL_PLAN)`.
  - Has Print / PDF export button (`window.print()`).

---

### 1.2 Trusted Personal Contacts Storage & Schemas
- **Type Definitions (`src/types/index.ts`)**:
  - Lines 89–104:
    ```typescript
    export interface ContactInfo {
      name: string;
      phone?: string;
      relationship?: string;
    }

    export interface SafetyPlan {
      id: string;
      warningSigns: string[];
      copingStrategies: string[];
      peopleToContact: ContactInfo[];
      professionalContacts: ContactInfo[];
      safeEnvironment: string[];
      reasonsToLive: string[];
      updatedAt: string;
    }
    ```
- **Backup & Validation (`src/utils/exportImport.ts`)**:
  - Lines 549–559: `validateContactInfo(item)` extracts `name` (max 128 chars), `phone` (max 32 chars), and `relationship` (max 64 chars).
  - Lines 576–582: `sanitizeContacts()` validates arrays of `ContactInfo`.
  - Lines 584–594: `validateSafetyPlan()` expects `peopleToContact: ContactInfo[]` and `professionalContacts: ContactInfo[]`.
- **Existing `SafetyPlan.tsx` Storage Discrepancy**:
  - In `SafetyPlan.tsx` (lines 14–23, 129), `plan` is stored under localStorage key `'rima-safety-plan'` as an array of `PlanSection`:
    ```typescript
    interface PlanSection {
      id: string; // 'warningSigns' | 'copingStrategies' | 'socialContacts' | 'professionals' | ...
      titleKey: string;
      defaultTitle: string;
      icon: string;
      color: string;
      bg: string;
      suggestions: SuggestionItem[];
      items: string[];
    }
    ```
  - Under `id: 'socialContacts'`, the user's entries are currently stored as plain text strings (`items: string[]`), e.g., `"Ibu (08123456789)"` or `"Telepon/chat teman dekat"`.
  - There is currently **no dedicated standalone key** such as `'rima-trusted-contacts'` or `'rima-emergency-contact'`, nor is there a structured phone input field in `SafetyPlan.tsx` or `Profile.tsx`.
- **IndexedDB / Persistent Storage Adapter (`src/utils/indexedDb.ts`)**:
  - Key `'rima-safety-plan'` is registered in `KNOWN_RIMA_STORAGE_KEYS` (line 266).
  - `rimaAsyncStorage` transparently bridges Zustand to IndexedDB with localStorage fallback.
  - `useLocalStorage` reads and writes synchronously from `window.localStorage`.

---

### 1.3 Indonesian Crisis Hotline 119 Ext 8 Formatting
- **Standardized `tel:` Link Syntax**:
  - In cellular telephony and mobile OS dialers (iOS and Android), an automated delay/pause for entering an extension is represented by a comma (`,`).
  - In `SOSButton.tsx` (line 90) and `CrisisInterceptor.tsx` (line 72):
    ```tsx
    href={`tel:${hotline.phone.includes('ext') 
      ? hotline.phone.replace(/\s*ext\s*/i, ',').replace(/[^0-9+,]/g, '') 
      : hotline.phone.replace(/[^0-9+]/g, '')}`}
    ```
    When `hotline.phone = '119 ext 8'`, this evaluates to `tel:119,8`.
  - In `CssrsWizardModal.tsx` (line 445) and `Forum.tsx` (line 341):
    Directly formatted as:
    ```tsx
    href="tel:119,8"
    ```
  - In test suite (`src/components/__tests__/CssrsWizardModal.test.tsx`, lines 117–120):
    ```typescript
    expect(screen.getByRole('link', { name: /Hubungi Healing 119/i })).toHaveAttribute(
      'href',
      'tel:119,8'
    );
    ```
  - Exact verified formatting standard: **`href="tel:119,8"`**.
  - Localized copy:
    - ID: `Telepon 119 ext 8` or `Hubungi Healing 119 (119 ext 8)`
    - EN: `Call 119 ext 8` or `Call Healing 119`

---

### 1.4 Existing Somatic Grounding Tools, Routes, and Triggers
- **5-4-3-2-1 Sensory Grounding (`src/pages/Grounding.tsx`, Route `/grounding`)**:
  - Steps:
    - Step 5: 5 Hal yang Dapat Kamu Lihat (Eye, `var(--color-primary)`)
    - Step 4: 4 Hal yang Dapat Kamu Sentuh / Rasakan (Hand, `var(--color-secondary)`)
    - Step 3: 3 Suara yang Dapat Kamu Dengar (Ear, `var(--color-accent)`)
    - Step 2: 2 Aroma yang Dapat Kamu Cium (Sparkles, `var(--color-warm)`)
    - Step 1: 1 Hal Positif / Rasa Syukur tentang Dirimu (Heart, `var(--color-secondary)`)
  - Haptic feedback: `navigator.vibrate(70)` on each step change.
  - Soundscape player embedded: `SoundscapePlayer` with Brownian noise.
  - Post-exercise reflection rating (`calmer` | `same` | `anxious`).
- **Breathing Exercises (`src/pages/Breathe.tsx`, Route `/breathe`)**:
  - Clinically grounded techniques:
    1. `sighing`: Cyclic Sighing (Physiological Sigh, Stanford RCT 2023, Balban et al.) — Inhale 3s, Inhale2 2s, Exhale 6s, HoldOut 1s.
    2. `4-7-8`: 4s In, 7s Hold, 8s Out.
    3. `box`: Box Breathing 4-4-4-4 pattern.
    4. `calm`: Simple Calm 4s In, 4s Out.
    5. `coherent`: Coherent Breathing 6s In, 6s Out (~5.5 breaths/min for HRV resonance).
  - Audio somatics chimes and session storage in `'rima-breathing-sessions'`.
- **DBT TIPP Crisis Protocol (`src/pages/TippCrisisHub.tsx`, Route `/tipp`)**:
  - Modules:
    1. Temperature (`temperature`): 30s Cold water / Mammalian Dive Reflex.
    2. Intense Exercise (`exercise`): 60s aerobic surge (jumping jacks, high knees).
    3. Paced Breathing (`paced_breathing`): Mini 4-7-8 timer.
    4. Paired Muscle Relaxation (`pmr`): 5 body zones (5s tension, 10s release).
  - Pre- & post-SUDS distress score slider (0–10) with delta calculation.
- **Offline Procedural Audio Somatics (`src/services/audioSomaticsService.ts` & `SoundscapePlayer.tsx`)**:
  - Zero audio asset downloads (100% Web Audio API synthesis).
  - Presets: `brown_noise` (Brownian noise), `pink_noise`, `theta_binaural` (6 Hz), `alpha_binaural` (10 Hz).

---

### 1.5 CSS Styling, Design Tokens & Cognitive Constriction Accessibility
- **Zero-Tailwind Policy**:
  - Verified: No Tailwind CSS installed in `package.json`, no `@tailwind` directives in `src/styles`.
  - All styles use CSS custom properties in `src/styles/design-tokens.css` and utility/component classes in `src/styles/components.css`.
- **WCAG 2.2 AA & Accessible Target Dimensions**:
  - All interactive buttons have minimum touch target height:
    - `.btn`: `min-height: 48px;`
    - `.btn-sm`: `min-height: 44px;`
    - `.btn-icon`: `min-width: 44px; min-height: 44px;`
  - High-contrast focus indicators:
    ```css
    :focus-visible {
      outline: 3px solid var(--color-primary);
      outline-offset: 3px;
    }
    ```
- **Sensory Calm Mode Overrides (`[data-sensory='calm']`)**:
  - Tokens in `design-tokens.css` (lines 118–170) soften glare and suppress animations:
    ```css
    [data-sensory='calm'] * {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
    --glow-primary: none !important;
    --glow-secondary: none !important;
    --glow-danger: none !important;
    ```
- **Modal Component Accessibility (`src/components/ui/Modal.tsx`)**:
  - Features: Portal rendering into `document.body`, focus trapping (`Tab` / `Shift+Tab`), body scroll locking (`document.body.style.overflow = 'hidden'`), restoration of previous focus upon close, `Escape` key dismissal, modal stacking with dynamic z-index calculation `calc(var(--z-modal, 1000) + ${stackIndex * 20})`.

---

### 1.6 Exact Touchpoints on Home Screen and Navigation
- **Home Dashboard (`src/pages/Home.tsx`)**:
  1. Header / Escalation Banner (line 162): `<EscalationBanner moods={moods} latestJournalContent={latestJournalContent} />` — opens crisis routes when escalation level is active.
  2. Quick Actions Section (lines 197–242):
     - `quick-action-btn safety` (`/safety-plan`)
     - `quick-action-btn meditate` (`/breathe`)
     - `quick-action-btn grounding` (`/grounding`)
     - `quick-action-btn tipp` (`/tipp`)
- **Global Layout (`src/components/layout/AppShell.tsx`)**:
  1. `<SOSButton />` (line 33): Floating action button rendered on every view.
  2. Quick Exit button (line 19): `✕` button to `https://www.google.com`.
- **Sidebar (`src/components/layout/Sidebar.tsx`)** & **BottomNav (`src/components/layout/BottomNav.tsx`)**:
  - Fixed persistent routes: `/`, `/mood`, `/journal`, `/forum`, `/profile`.

---

## 2. Logic Chain

1. **Cognitive Constriction in Acute Crisis**:
   - *Observation*: Under acute distress, users experience narrowed attention, working memory deficits, fine motor tremors, and decision paralysis.
   - *Reasoning*: A crisis interface cannot rely on scrolling through long explanatory text, multi-step navigation forms, or ambiguous icons. It requires a high-contrast card that presents immediate single-tap actions:
     a) Primary coping strategy (retrieved from user's safety plan or evidence-based default).
     b) Primary trusted personal contact dialing (single tap to call).
     c) 119 Ext 8 national crisis line (single tap to call).
     d) 1-tap somatic grounding shortcut (jumping straight into 5-4-3-2-1 grounding or Stanford cyclic sighing).
2. **Contact Dialing Integration Architecture**:
   - *Observation*: `types/index.ts` defines `ContactInfo { name: string; phone?: string; relationship?: string }`, but `SafetyPlan.tsx` stores strings in `PlanSection['socialContacts'].items`, and neither `Profile.tsx` nor `SafetyPlan.tsx` currently provides structured phone entry.
   - *Reasoning*: The Fast-Action Safety Card needs a reliable source for the trusted contact:
     - Check structured storage `'rima-trusted-contacts'` (or `'rima-safety-plan'`).
     - If user entered a contact with a phone number (e.g. parsed phone digits or structured contact), display single-tap dial button (`tel:{phone}`).
     - If no phone number is configured, provide an actionable prompt to set up trusted contact or fallback to dialing 112/119.
3. **Hotline Link Harmonization**:
   - *Observation*: In `CssrsWizardModal.tsx`, `Forum.tsx`, and `CssrsWizardModal.test.tsx`, 119 Ext 8 is formatted specifically as `tel:119,8`.
   - *Reasoning*: Using `tel:119,8` directly aligns with automated PBX pause dialing standards across Android and iOS and satisfies existing unit test assertions.
4. **Touchpoint Placement**:
   - *Observation*: `SOSButton` is universally present across all screens via `AppShell.tsx`, while `Home.tsx` contains `EscalationBanner` and `quick-actions`.
   - *Reasoning*: Upgrading or connecting `SOSButton` and adding a direct trigger on `Home.tsx` (e.g., in `quick-actions` or as a top-level action card) provides zero-latency access under panic without requiring menu navigation.

---

## 3. Caveats

- **Web Browser vs. Native Dialing**: When running on desktop browsers, `tel:` links prompt the OS telephony handler (FaceTime, Skype, or Phone Link). On mobile devices (Android/iOS via PWA or Capacitor), `tel:119,8` immediately opens the system phone dialer with `119,8` pre-filled.
- **Audio Autoplay Restrictions**: Web Audio synthesis in `audioSomaticsService.ts` and `TippCrisisHub.tsx` requires a user gesture to resume suspended `AudioContext`. Single-tap button interactions count as a user gesture, so launching audio on tap is compliant.
- **No Source Code Modified**: As an explorer survey, this investigation was strictly read-only. No source files were edited.

---

## 4. Conclusion

The codebase is well-prepared for the implementation of the Fast-Action Emergency Safety Card:
1. **Design Tokens**: Fully equipped with high-contrast, zero-Tailwind vanilla CSS variables (`--color-danger`, `--bg-elevated`, `--radius-lg`, `--shadow-elevated`, `--text-primary`), and WCAG 2.2 touch targets (>= 48px).
2. **Hotline**: Standardized and unit-tested to `tel:119,8`.
3. **Grounding Modules**: Robust, validated grounding tools already exist at `/grounding` (5-4-3-2-1) and `/breathe` (Stanford Cyclic Sighing), ready for direct shortcut linkage.
4. **Touchpoint**: The global floating `SOSButton` in `AppShell` and the Home quick actions grid represent the ideal trigger points for launching the card modal rapidly.
5. **Quality Gates**: The project is currently 100% healthy: 200/200 tests passing in Vitest, 0 oxlint warnings/errors, clean TypeScript compilation (`tsc -b`), and successful PWA production build.

---

## 5. Verification Method

To independently verify the facts and findings in this report, execute the following commands in `C:\Users\Hype\Kuliah\Proyekan\mental monitoring`:

```bash
# 1. Verify test suite and crisis test assertions
npx vitest run

# 2. Verify zero-warning linter
npm run lint

# 3. Verify TypeScript compilation
npx tsc -b

# 4. Verify PWA production build
npm run build
```

### Files to Inspect:
- `src/components/safety/SOSButton.tsx` (Lines 66–105 for current SOS modal & `tel:` format)
- `src/components/safety/CssrsWizardModal.tsx` (Lines 442–465 for `tel:119,8` and emergency styling)
- `src/components/safety/SafetyPlan.tsx` (Lines 57–69, 127–145 for storage structure)
- `src/types/index.ts` (Lines 89–104 for `ContactInfo` & `SafetyPlan` interfaces)
- `src/pages/Grounding.tsx` & `src/pages/Breathe.tsx` (For somatic grounding steps & physiological sigh)
- `src/styles/design-tokens.css` (For CSS variables, sensory calm mode, and zero Tailwind policy)
- `src/components/layout/AppShell.tsx` (Line 33 for global floating SOSButton touchpoint)
