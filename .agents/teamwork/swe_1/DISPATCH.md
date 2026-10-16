# Dispatch Log

## 2026-10-16T14:10:50Z

You are the SWE Light Orchestrator (`teamwork_preview_swe`).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\swe_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
The authoritative user request is recorded in: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (read the latest entry under ## 2026-10-16T14:09:29Z).

Task:
Implement Langkah 1 Prioritas Tinggi (P1) untuk RIMA (Ruang Interaksi Mental Aman): Ergonomi Sentuh Mobile & Pencegahan Tabrakan Keyboard Virtual (Keyboard Collision Avoidance) pada seluruh halaman form, dialog modal, drawer chatbot, dan wizard interaktif agar tombol aksi primer tidak pernah tertutup oleh keyboard virtual Android maupun iOS.
Keep it small and focused.

Requirements & Acceptance Criteria:
1. Viewport & VisualViewport Keyboard Avoidance:
   - Configure dynamic viewport HTML/CSS so layout adapts to virtual keyboard height on Android and iOS.
   - Provide adaptive mechanism using `window.visualViewport` to detect virtual keyboard opening and adjust scroll padding / safe-area insets automatically.
2. Action Button Visibility on Forms, Modals, Wizards & Chatbot:
   - When inputs/textareas are focused, smooth scroll active element into safe view without occlusion by keyboard or BottomNav.
   - Modals and drawers remain fully scrollable and primary actions (Save, Next, Send, Cancel) remain easily reachable.
   - Respect `prefers-reduced-motion` and `data-sensory="low-stimulation"` (use instant scroll when low-stimulation mode is active).
3. 4 Quality Gates RIMA:
   - Pure Vanilla CSS design tokens (Zero Tailwind CSS).
   - 100% translation parity across 8 languages (id, en, jv, su, ja, zh, es, ar) if any new strings/labels are added.
   - Vitest automated unit/integration tests verifying visualViewport adaptation, input focus behavior, and keyboard collision prevention.
   - `npm run lint` (0 error, 0 warning)
   - `npx tsc -b` (0 error)
   - `npm test` (100% pass on all tests without regression)
   - `npm run build` (clean PWA & SW build)

Follow the SWE Light protocol: run the implementer on the task, then review rounds, establishing correctness by running tests. When completely finished and verified, write handoff.md in your working directory and send a message back.
