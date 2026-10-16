# Handoff Report: Reviewer Round 1 - Adversarial Review & Bug Fixes for Mobile Touch Ergonomics & Keyboard Collision Avoidance

> [!WARNING] **Skepticism Disclaimer**
> Moderate-to-high confidence in software emulation and math-verified viewport dynamics; zero physical touch verification performed on physical Android/iOS hardware.

---

## 1. What the prior attempt got wrong

### Issue 1: Premature Global Teardown on Component Unmount (Singleton RefCount Absence)
- **Input:** App mounts `initKeyboardAvoidance()`, then a component using `useVirtualKeyboard()` mounts and subsequent unmounts (e.g. ChatbotDrawer closes or page navigates).
- **Expected:** Global avoidance listeners and CSS tokens remain active for the rest of the application.
- **Actual:** The unmounting component calls the returned cleanup function which immediately and unconditionally removed all visualViewport listeners, window resize listeners, document focusin listeners, cleared CSS variables (`--keyboard-height`, etc.), and set `activeCleanup = null`, rendering keyboard avoidance permanently dead for the entire SPA until page reload.
- **Root Cause:** Absence of reference counting in `initKeyboardAvoidance()`.

### Issue 2: Virtual Keyboard Failure on Android Chrome with `interactive-widget=resizes-content`
- **Input:** Virtual keyboard opens on Android Chrome where `interactive-widget=resizes-content` shrinks `window.innerHeight`.
- **Expected:** Virtual keyboard is detected (`isKeyboardOpen = true`, `data-keyboard-open = "true"`, `.bottom-nav` hidden, proper tokens injected).
- **Actual:** Prior attempt computed `heightDifference = window.innerHeight - vv.height`. Because Chrome 108+ resizes the layout viewport (`window.innerHeight`) to match `vv.height` (e.g. both shrink from 800px to 500px), `heightDifference` evaluated to `500 - 500 = 0px <= 150px`. The keyboard was NEVER detected as open on Android Chrome! As a consequence, `.bottom-nav` remained visible and directly obscured the active form inputs and primary buttons.
- **Root Cause:** Measuring only instantaneous difference between `window.innerHeight` and `vv.height` without tracking an un-obscured baseline viewport height (`baselineHeight`).

### Issue 3: Double Offset on Android vs iOS for Modals, Drawers & SOS Button
- **Input:** Virtual keyboard opens on Android Chrome.
- **Expected:** Fixed overlays (`.modal-overlay`, `.chat-drawer-wrapper`) and `.sos-float` stay docked directly above the keyboard.
- **Actual:** Because Android's layout viewport already shrank to 500px, applying `bottom: var(--keyboard-height, 0px)` (300px) pushed `.modal-overlay` and `.chat-drawer-wrapper` up by another 300px inside the 500px viewport, squishing the modal into a 200px box and leaving a 300px empty void above the keyboard. `.sos-float` was pushed 316px above the bottom of the 500px viewport, landing near the top-middle of the screen.
- **Root Cause:** Failure to distinguish `--keyboard-height` (physical keyboard height) from `--keyboard-offset-bottom` (the offset needed specifically by `position: fixed` elements depending on whether the layout viewport itself shrank).

### Issue 4: Double Addition of Keyboard Height in `scroll-padding-bottom`
- **Input:** Virtual keyboard opens (e.g., 344px).
- **Expected:** `html` scroll padding bottom accommodates the keyboard once plus safe margin (~368px).
- **Actual:** `keyboardAvoidance.ts` injected `--scroll-padding-bottom: 360px` (`keyboardHeight + 16px`), but `src/styles/index.css` had `html { scroll-padding-bottom: calc(var(--keyboard-height, 0px) + var(--scroll-padding-bottom, 96px)); }`, resulting in `344px + 360px = 704px` scroll padding on an 844px screen, causing any focused input to jump almost off the top of the screen.
- **Root Cause:** Redundant addition of `--keyboard-height` in CSS when `--scroll-padding-bottom` was already computed with keyboard offset.

### Issue 5: Device Orientation Flip False Positive
- **Input:** User rotates device from portrait (390x844) to landscape (844x390).
- **Expected:** Baseline recalibrates to new orientation; no false keyboard detection.
- **Actual:** Prior attempt had zero orientation change listeners or width tracking. If baseline height was retained, landscape height (390px) compared against portrait baseline (844px) would trigger a permanent false positive "keyboard open" state (454px difference).
- **Root Cause:** Lack of orientation change handling (`orientationchange` / `screen.orientation` / width difference tracking).

### Issue 6: Readonly and Disabled Inputs Triggering Virtual Keyboard Avoidance
- **Input:** A `readonly` or `disabled` text input or textarea receives focus.
- **Expected:** No virtual keyboard avoidance is triggered since software keyboards never open on readonly/disabled inputs.
- **Actual:** `isTextInputElement` returned `true` for all `<input type="text">` and `<textarea>` regardless of `readOnly` or `disabled` attributes.
- **Root Cause:** Missing check for `readOnly` and `disabled` DOM properties.

---

## 2. What I changed

1. **`src/utils/keyboardAvoidance.ts`**:
   - Implemented reference counting (`refCount`) in `initKeyboardAvoidance()` so multiple subscribers (e.g. `App.tsx` and components using `useVirtualKeyboard`) do not prematurely tear down global listeners when one subscriber unmounts.
   - Added `resetKeyboardAvoidanceForTesting()` test helper for clean isolated test runs.
   - Implemented dual-mode keyboard detection:
     - Calculates both `diffFromVisual = window.innerHeight - vv.height` (iOS Safari overlay style) and `diffFromBaseline = baselineHeight - currentEffectiveHeight` (Android Chrome layout viewport shrink style).
     - Computes `layoutViewportResized = (baselineHeight - window.innerHeight) > 150px`.
     - Injects `--keyboard-offset-bottom: (isKeyboardOpen && !layoutViewportResized) ? keyboardHeight : 0px` to prevent double offsets on Android while maintaining proper offset on iOS.
     - Injects `--scroll-padding-bottom` (32px on Android with resized viewport, `keyboardHeight + 24px` on iOS).
   - Added orientation change listeners (`orientationchange` and `screen.orientation.change`) and width change detection to recalibrate `baselineHeight`.
   - Updated `isTextInputElement` to check `readOnly` and `disabled` attributes on `input` and `textarea`.

2. **`src/styles/index.css`**:
   - Corrected `html { scroll-padding-bottom: var(--scroll-padding-bottom, 96px); }`, removing the double addition of `--keyboard-height`.
   - Updated `[data-keyboard-open="true"] .app-main` to use `var(--keyboard-offset-bottom, 0px)`.
   - Updated `[data-keyboard-open="true"] .sos-float` to use `var(--keyboard-offset-bottom, 0px)`.

3. **`src/styles/components.css`**:
   - Updated `.modal-overlay` to use `bottom: var(--keyboard-offset-bottom, 0px)`.
   - Updated `.chat-drawer-wrapper` to use `bottom: var(--keyboard-offset-bottom, 0px)`.

4. **`src/test/keyboardCollisionAvoidance.test.tsx`**:
   - Added 5 new adversarial unit & integration tests (total 21 tests, up from 16):
     - Multiple subscribers reference counting and unmount preservation.
     - Android Chrome `interactive-widget=resizes-content` layout viewport shrink detection.
     - Device orientation change handling and baseline recalibration.
     - Rejection of readonly and disabled inputs.
     - Hook consumer unmount not tearing down global avoidance.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - `npm run lint` (`oxlint`): PASSED (0 errors, 0 warnings across 178 files in 33ms).
  - `npx tsc -b`: PASSED (0 TypeScript compile errors).
  - `npx vitest run src/test/keyboardCollisionAvoidance.test.tsx`: PASSED (21/21 tests passed in 261ms).
  - `npx vitest run src/test/i18nParity.test.ts`: PASSED (16/16 tests passed in 236ms, 100% parity across 8 locales).
  - `npm test` (`vitest run`): PASSED (683/683 tests passed across 66 test suites in 43.63s).
  - `npm run build`: PASSED (Built production bundle with PWA Service Worker 62 entries in 1.86s).

- **Shallow Verification (manual only):**
  - Inspected DOM attribute mutations and CSS token property values.
  - Verified CSS specificity and Zero Tailwind compliance.

- **Unverified aspects:**
  - Real hardware touch testing on physical Samsung OneUI / Gboard and physical Apple iPhone iOS Safari.

---

## 4. Known Issues

- `Minor Robustness Risk`: Ancient mobile browsers lacking both `window.visualViewport` and `interactive-widget` support will fall back to `window.innerHeight` resize events; layout viewport animations on those legacy devices may show minor latency.
- `Shallow Verification`: Physical keyboard pop-in animations vary across Android OEM keyboards (e.g., Samsung Keyboard, SwiftKey, Gboard); soft delays (`100ms`) are used for deferred scroll into safe view.

---

## 5. Remaining risk & next step

- **Remaining risk**: Extreme edge cases where virtual keyboards open in split-screen / multi-window mode on tablet devices.
- **Next step**: P1 Step 1 is complete, verified, and rock-solid. Proceed to QA verification on physical devices or proceed to P1 Step 2.
