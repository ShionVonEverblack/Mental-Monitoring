---
name: rima-trauma-informed-design
description: >-
  Design and UX engineering guidelines grounded in SAMHSA's Trauma-Informed Care (TIC)
  principles and cognitive load minimization for RIMA. Use when designing sensitive questionnaires,
  crisis warning systems, non-shaming gamification, or emergency exit mechanisms.
---

# RIMA Trauma-Informed Design (TID) & Cognitive Ease

## 1. The 6 SAMHSA Principles in UI/UX Engineering

According to the *Substance Abuse and Mental Health Services Administration (SAMHSA)*, individuals experiencing trauma, acute anxiety, or depression experience altered cognitive processing: diminished working memory, hypervigilance, and heightened vulnerability to shame.

Interfaces must be constructed around 6 non-negotiable principles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SAMHSA Trauma-Informed Framework                      │
├─────────────────────────┬──────────────────────────────────────────────┤
│ 1. Safety               │ Predictable navigation, zero startling cues, │
│                         │ instant "Quick Exit" to a calm screen.       │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 2. Trustworthiness      │ Zero hidden trackers, explicit data control, │
│                         │ clear expectations before initiating a tool. │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 3. Peer Support         │ Mutual compassion without toxic metrics      │
│                         │ (no follower counts, likes, or downvotes).   │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 4. Collaboration        │ Non-prescriptive wording: "Coba jelajahi"    │
│                         │ instead of "Kamu harus melakukan ini".       │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 5. Empowerment & Choice │ Opt-in content reveals, customizable audio/  │
│                         │ haptics, pauseable streaks, no dark patterns.│
├─────────────────────────┼──────────────────────────────────────────────┤
│ 6. Cultural Sensitivity │ Affirming Indonesian cultural & spiritual    │
│                         │ anchors without dogma or moralizing.         │
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. Anti-Shame Gamification Patterns

Traditional habit trackers weaponize loss aversion by violently resetting a 30-day streak to 0 if a user misses a single day, inducing guilt and app abandonment (*Baumel et al., 2019*).

### RIMA's Compassionate Streak Architecture
1. **The Grace Day Mechanism**:
   - Every 7-day milestone awards a *Hari Pemulihan (Grace Token)* automatically.
   - If a day is missed, a Grace Token is consumed silently.
   - The streak displays: *"Hari ini adalah hari istirahat yang bermakna 🌿"* rather than *"Streak Terputus!"*.
2. **Post-Crisis Welcome Back**:
   - When a user returns after a week or month of absence, never show missed-day red badges.
   - Display: *"Senang melihatmu kembali. Tubuh dan pikiranmu telah berjuang keras."*

---

## 3. Cognitive Load Minimization (The 1-Thing-at-a-Time Rule)

When an individual is experiencing acute emotional dysregulation (SUDS $\ge 7/10$):
- **Avoid Vertical Wall of Forms**: Never render 9 PHQ-9 questions on a single scrolling page during crisis intake.
- **Micro-Chunking**: Render single-focus cards with large tap targets.
- **Progress Visibility**: Clear non-intrusive step indicators (`Langkah 2 dari 5`).
- **Immediate Escape Hatch**: Always provide a prominent `Batal / Simpan Sementara` button without modal lock traps.

---

## 4. Quick Exit Pattern (Safety from Prying Eyes)

In shared living environments (e.g. shared student boarding rooms / *kost*), users may need to immediately hide a sensitive mental health log from roommates or family:

```typescript
/**
 * Immediate emergency screen wipe:
 * Replaces viewport with a neutral, non-descript utility screen (e.g. Weather or Notes).
 */
export function executeQuickExit(navigate: (path: string) => void): void {
  // 1. Wipe any transient uncommitted inputs in session memory
  sessionStorage.removeItem('temp_draft_journal');
  
  // 2. Lock application if PIN is configured
  const lockConfig = localStorage.getItem('rima-pin-config');
  if (lockConfig) {
    sessionStorage.setItem('rima-app-locked', 'true');
  }

  // 3. Immediately redirect to neutral screen or blank window
  window.location.replace('https://www.google.com');
}
```

---

## 5. Tone of Voice & Copywriting Rubric

| Avoid (Pathologizing / Coercive) | Adopt (Validating / Empowering) |
|:---|:---|
| *"Kamu gagal menyelesaikan target hari ini"* | *"Hari yang berat? Mengambil jeda adalah bentuk keberanian."* |
| *"Kamu harus berkonsultasi ke psikiater sekarang"* | *"Bantuan profesional tersedia dan siap mendampingimu kapan pun kamu siap."* |
| *"Pikiranmu salah dan tidak rasional"* | *"Mari kita amati sudut pandang lain bersama-sama secara perlahan."* |
| *"Buka aplikasi setiap hari agar sembuh"* | *"RIMA adalah ruang amanmu, hadir di saat kamu membutuhkan."* |
