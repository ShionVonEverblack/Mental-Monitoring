---
name: rima-calm-tech
description: >-
  Principles and design patterns for Calm Technology, Humane Design, and Trauma-Informed UI/UX in RIMA.
  Use when designing or reviewing user interfaces, notification strategies, animations, micro-interactions,
  forum engagement mechanisms, anti-addiction friction, or sensitive emotional interactions.
---

# RIMA Calm Technology & Trauma-Informed UX

## 1. Philosophical Foundations

RIMA is built upon three ethical design pillars:
1. **Calm Technology** (Mark Weiser, Amber Case):
   - Technology should inform without demanding full attention.
   - It smoothly moves between the **center** and the **periphery** of user attention.
2. **Time Well Spent & Humane Tech** (Center for Humane Technology, Tristan Harris):
   - A mental health app should measure success by **life lived outside the app**, not daily active minutes or screen time extracted.
3. **Trauma-Informed Care (TIC)** (SAMHSA):
   - Design with awareness that users may be actively experiencing emotional distress, panic, sensory overload, or domestic trauma.

---

## 2. Core Interaction Patterns & Constraints

### A. The "Grace Streak" Philosophy (Zero Guilt)
Located in `src/utils/helpers.ts` (`calculateGraceStreak`):
- **Problem**: Traditional streak gamification (e.g., Duolingo, Snapchat) produces anxiety, shame, and feelings of failure when a user misses a day due to severe depression or burnout.
- **RIMA Rule**: A 1–2 day lapse in logging does NOT reset the user's streak to zero. It gracefully pauses, reassuring the user: *"Istirahat itu bagian dari proses penyembuhan 🌱"*.
- **Implementation**: Never show red broken streak icons or shaming copy.

### B. Ambient & Peripheral Awareness
- **Status indicators** (e.g., `🟢 Offline-Ready`, battery/storage hints) reside in the periphery (sidebar footer, subtle opacity), not demanding active attention.
- **Session Awareness Banner** (`<SessionAwareness />`):
  - Triggers after 10 minutes of continuous browsing.
  - Stays fixed gently at the bottom in muted tones (`hsla(165, 45%, 50%, 0.15)`).
  - Dismissible with 1 tap.
  - Message: *"Kamu sudah di sini cukup lama 🍃 Ingat untuk kembali ke dunia nyata juga ya."*

### C. Quick Exit (Safety in Unsafe Domestic Environments)
Located in `src/components/layout/AppShell.tsx`:
- Vulnerable users (e.g., domestic violence victims, closeted individuals, adolescents under surveillance) need an instant way to conceal mental health activity.
- The top-right discreet button (`.quick-exit-btn`) instantly redirects to `https://www.google.com` and cleans session state.

### D. Quiet Hours & Notification Hygiene
Located in `src/hooks/useNotifications.ts`:
- **Default Quiet Hours**: `22:00` to `07:00`.
- During quiet hours, all web push reminders and check-in nudges are strictly suppressed to protect circadian sleep cycles.
- Never use OS-level alert sounds or vibration alarms that might startle someone in a heightened state of nervous system arousal.
- Use soft haptic vibrations (Web Vibration API, $\le 70\text{ms}$) exclusively for somatic pacing (e.g., breathing transitions).

---

## 3. Emotional Contagion Containment in Community Forum

Peer support can easily degenerate into a spiral of shared despair ("trauma dumping" or suicide contagion / Werther effect) if unmoderated.

### Design Safeguards in `src/pages/Forum.tsx`:
1. **Crisis Interception at Source**:
   - Typing or posting text scoring $\ge 10$ on the crisis detection engine intercepts submission.
   - The user is transitioned immediately into the private `<CrisisInterceptor />` support screen.
   - The content is **prevented from being published publicly**, protecting both the author and the community.
2. **Supportive Reaction Palette**:
   - Only constructive empathetic reactions are permitted:
     - ❤️ *Peduli (Care)*
     - 💪 *Semangat (Strength)*
     - 🤗 *Peluk Hangat (Warm Hug)*
   - No negative, downvoting, or sarcastic reactions allowed.
3. **Report Mechanism**:
   - 1-tap reporting on any post for community self-regulation.

---

## 4. Visual & Sensory Reduction Checklist

When crafting components for RIMA:
- [ ] **No Loud Red Banners**: Red (`--color-danger`) is restricted exclusively to acute emergency triggers (e.g., active crisis hotline buttons). Normal errors use warm amber (`--color-warm`).
- [ ] **Animation Duration**: Kept subtle and brief ($\le 0.4\text{s}$) with easing (`ease-out`). Respect `prefers-reduced-motion`.
- [ ] **Typography**: Legible sans-serif with comfortable line-height ($\ge 1.5$) to prevent visual strain for fatigued minds.
- [ ] **Dark Mode Contrast**: Text tertiary must maintain $\ge 4.5:1$ contrast against card backgrounds (WCAG 2.2 AA).
- [ ] **Touch Target Safety**: Minimum $44 \times 44\text{px}$ touch targets to accommodate tremulous or hurried finger taps during panic.
