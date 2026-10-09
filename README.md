<div align="center">

# 🧠 RIMA

### Safe Mental Interaction Space (*Ruang Interaksi Mental Aman*)

A privacy-focused, anonymous, evidence-based digital mental health platform.

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)
[![Tests Passing](https://img.shields.io/badge/Vitest-175%2F175%20passing-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[English](#about) · [Features](#-core-features) · [Tech Stack](#-tech-stack) · [Roadmap](#-roadmap) · [Getting Started](#-getting-started)

</div>

---

## 📖 About

**RIMA** (*Ruang Interaksi Mental Aman* — Safe Mental Interaction Space) is an open-source digital mental wellness platform engineered with an **offline-first, anonymous, and culturally-adaptive** approach. Designed initially for the Indonesian mental health context and expanded globally, RIMA is grounded in academic research from 27+ peer-reviewed papers, WHO guidelines, and evidence-based psychological frameworks.

> **⚠️ Clinical Disclaimer:** RIMA is an aid for self-reflection and self-guided well-being, not a diagnostic medical device or a replacement for clinical psychiatric treatment. If you are experiencing a mental health emergency, please immediately contact your local crisis hotline or visit the nearest emergency room.

### Why RIMA?

- 🇮🇩 **1 in 4 Indonesians** experience mental health challenges during their lifetime.
- 🏥 The psychologist-to-population ratio is **1:400,000** (WHO recommends 1:30,000).
- 🤐 **96.5%** of individuals with severe mental conditions in developing nations do not receive adequate treatment.
- 💬 Social stigma and data privacy concerns remain the greatest barriers to seeking help.

RIMA serves as a **safe, zero-judgment, completely anonymous first step** before an individual feels ready to reach out to professional services.

---

## ✨ Core Features

### 📊 Mood Tracker & Grace Streaks
- **5-Level Scale**: Track daily emotions from *Sangat Buruk* (Very Bad) to *Sangat Baik* (Very Good).
- **Factor Correlations**: Identify key triggers (sleep, exercise, work, relationships, family, weather, and physical health).
- **Grace-Based Streaks**: Includes a compassionate *Recovery Day* mechanism so missing a single check-in day does not induce shame or wipe out progress.

### 📝 Therapeutic Journaling & Interactive CBT Wizard
Four evidence-based therapeutic writing templates:
- **Interactive 5-Step CBT Wizard (*Pembedah Pikiran*)** — Step-by-step cognitive restructuring grounded in Beck & Burns taxonomies:
  1. *Situational Trigger* & Initial Emotional Intensity (1–10 SUDS slider)
  2. *Automatic Negative Thought (NAT)* capture
  3. *Cognitive Distortion Detector* (8 clinical traps: Catastrophizing, All-or-Nothing, Mind Reading, Overgeneralization, Emotional Reasoning, Should Statements, Personalization, Mental Filter)
  4. *Objective Evidence Examination* (Facts For vs. Facts Against)
  5. *Alternative Balanced Reframe* with post-intervention emotional relief calculation.
- **Free Writing** — Unfiltered stream-of-consciousness expression.
- **Gratitude Journal** — Focus on positive anchors and gratitude.
- **Self-Reflection** — Structured prompt for self-discovery and personal growth.

### 🧊 DBT TIPP Crisis Hub (`/tipp`)
Evidence-based somatic distress tolerance protocol from Dialectical Behavior Therapy (*Linehan 2014 & Valentine et al. 2015*) for acute emotional crisis (SUDS $\ge 7/10$):
- **T — Cold Temperature**: 30-second guided timer triggering the *Mammalian Dive Reflex* (sinus bradycardia via trigeminal-vagal stimulation, reducing heart rate by 10–25 bpm).
- **I — Intense Exercise**: 60-second animated timer for brief motor discharge (Jumping Jacks, High Knees, Wall Push-Ups) to burn off panic-induced adrenaline and glucose.
- **P — Paced Breathing**: Prolonged exhalation pacer activating parasympathetic vagal tone and baroreflex.
- **P — Paired Muscle Relaxation (PMR)**: Structured 5-zone body cycle (Hands, Shoulders/Neck, Jaw/Face, Abdomen, Legs) alternating between 5s Tension and 10s Release.
- **SUDS Pre/Post Delta Rating**: Real-time evaluation of distress attenuation with immediate emergency hotline interceptor if distress remains severe.

### 🧘 Somatic 5-4-3-2-1 Sensory Grounding (`/grounding`)
- Structured somatic sensory regulation: 5 things you see, 4 you feel/touch, 3 you hear, 2 you smell, and 1 gratitude anchor.
- Integrated haptic feedback (`navigator.vibrate`) and post-session reflection logging.

### 🎯 Behavioral Activation (BA) — Activity Scheduling (`/activation`)
Evidence-based digital intervention grounded in the Indonesian RCT by *Arjadi et al. (2018), The Lancet Psychiatry* (the only mental health digital intervention with direct RCT evidence in Indonesian youth):
- **4 Culturally Tailored Life Domains**: Pleasure (*Kegembiraan*), Mastery (*Pencapaian/Kecakapan*), Spiritual (*Ketenangan Batin/Spiritual*), and Social (*Relasi & Hubungan Sosial*).
- **16 Micro-Activity Catalog**: Realistic, low-barrier 5–20 minute micro-actions (e.g., *Menikmati minuman favorit tanpa distraksi*, *Merapikan satu sudut meja*, *Zikir / Doa / Meditasi hening*, *Kirim sapaan hangat ke teman baik*).
- **Activity Scheduling & Prediction**: Predict expected mood (1–10) before starting an activity to counteract cognitive depression avoidance.
- **Mood-Activity Link & Live Delta Tracking**: Log actual mood (1–10) and reflection post-activity to compute live $\Delta\text{Mood} = \text{Actual} - \text{Predicted}$.
- **Evidence-Based Psychoeducation**: Demystifies the cycle of inactivity and reinforces how action precedes motivation (*Action $\rightarrow$ Motivation*).

### 📋 Standardized Psychometric Screening (`/assessment`)
- **Indonesian-Validated PHQ-9 (Depression)** & **GAD-7 (Anxiety)** instruments (*Arjadi et al., 2024, Asian J Psychiatry*).
- **WHO-5 Well-Being Index (Non-Stigmatizing)** (*Topp et al., 2015, Psychother Psychosom*): 5 positively phrased wellness questions assessing vitality and psychological flourishing over the past 2 weeks (Score 0–25, converted to 0–100%). Scores $<50\%$ offer gentle, non-stigmatizing invitations to voluntary PHQ-9 reflection.
- Calibrated 4-tier clinical cutoffs: Minimal (0–4), Mild (5–9), Moderate (10–14), Severe (15+).
- **Structured Suicide-Risk Escalation via C-SSRS**: Positive endorsement of PHQ-9 Item 9 ($\ge 1$) automatically escalates to the standardized *Columbia-Suicide Severity Rating Scale (C-SSRS) Screener* (6 items with skip logic). Deterministically classifies risk level (Minimal, Low, Moderate, High) with tiered protective interventions.
- **On-Demand Safety Screener**: C-SSRS screening accessible on demand at any time from the assessment tools.
- Private local screening history with date tracking.

### 🌙 CBT-I Sleep Diary & Efficiency Tracker (`/sleep`)
Evidence-based digital Cognitive Behavioral Therapy for Insomnia (CBT-I) module (*van Straten et al., 2018, Sleep Med Rev*, SMD = -0.76 to -0.94):
- **Clinical Sleep Efficiency Calculator**: Tracks $\text{SE} = (\text{Total Sleep Time} / \text{Time in Bed}) \times 100\%$, with midnight rollover handling, sleep latency, and mid-night awakenings (WASO).
- **20-Minute Stimulus Control Protocol**: Immediate somatic guidance to leave the bed if unable to sleep within 20 minutes, linking directly to cyclic sighing and 5-4-3-2-1 grounding in low light.
- **14-Day Sleep Quality Analytics**: Real-time rolling average of sleep efficiency, sleep duration, and quality with clinical threshold badges ($\ge 85\%$ Optimal, $75\text{--}84\%$ Moderate, $<75\%$ Needs Improvement).
- **Interactive Sleep Hygiene Guide**: 4 evidence-based tips (Stimulus Control, Consistent Wake-up Anchor, 60-min Digital Sunset, 6-hour Caffeine Cutoff).

### ♿ Neuro-Inclusive Low-Stimulation Mode & WCAG 2.2 AA
Accessibility and sensory regulation engineered for sensory overload, ADHD, autism, and neurodivergence:
- **Mode Sensori Tenang (Low-Stimulation UI)**: Desaturated earthy paper palette (warm terracotta, sage green, natural stone), disabling all glowing box shadows, gradients, and non-essential visual stimuli.
- **Strict Reduced Motion**: Automatic synchronization with OS `prefers-reduced-motion` and immediate suppression of all CSS keyframes and transitions.
- **WCAG 2.2 SC 2.5.8 Touch Target Compliance**: All interactive buttons, chips, and icons enforce minimum dimensions $\ge 44\text{--}48\text{px}$ to prevent accidental activation on small touchscreens.
- **WCAG 2.2 SC 2.4.11 Non-Obscured Focus**: Form inputs and active elements maintain clean high-contrast focus rings and `scroll-padding-bottom: 96px` to prevent keyboard obstruction.

### 💬 Anonymous Community Forum
- **Zero-Stigma Peer Support**: Post and reply anonymously using randomized pseudonym avatars (e.g., *"Kupu-kupu Berani"*).
- **Category Filter**: Browse topics such as Anxiety, Depression, Relationships, Work, Family, and Self-Care.
- **Supportive Reactions**: Send heartfelt encouragement (❤️ 💪 🤗) without toxic metrics.
- **Built-in Crisis Prevention**: Pre-posting analysis automatically detects distress keywords and offers crisis hotlines.

### 🆘 Comprehensive Safety & SOS
- **Always-Accessible SOS Button**: Persistent emergency button linking to crisis hotlines in one click.
- **Digital Safety Plan**: Personal crisis blueprint following clinical best practices (Warning Signs, Internal Coping, Social Distractions, Trusted Contacts, Professionals, Safe Environment, Reasons to Live).
- **Verified Active Indonesian Hotlines (2026)**:
  - Healing 119 / SEJIWA (Kemenkes): `119 ext 8` (24 Jam)
  - Panggilan Darurat Bebas Pulsa: `112`
  - Ambulans / Gawat Darurat Medis: `119`
  - Yayasan Pulih: `021-788-42580`

### 🛡️ Privacy, Security & Client-Side Encryption
- **100% Offline-First by Default**: Personal mood logs, CBT records, journal entries, and safety plans reside entirely in local device storage.
- **Zero-Knowledge Client-Side AES-GCM-256 Vault (`cryptoVault`)**: Military-grade client-side encryption using Web Crypto API. Derives cryptographic keys via PBKDF2 (100,000 iterations, SHA-256) with unique 16-byte cryptographically secure random salts and 12-byte initialization vectors (IV).
- **IndexedDB Storage & Persistence API**: High-capacity IndexedDB fallback with automatic `navigator.storage.persist()` registration to prevent browser cache eviction on Android devices.
- **App Security PIN Lock**: 4-digit numeric PIN protection with auto-lock on inactivity to safeguard personal mental records from shared devices.
- **Client-Side Crisis NLP**: Emergency keyword detection runs 100% on the browser with zero external transmission of sensitive thoughts.
- **Statutory Data Rights**: Dedicated Privacy Policy page (`/privacy`), Onboarding Consent Modal, JSON/CSV/HTML data portability, and a one-click **Permanent Data Erasure** (`wipeAllData`) tool.

### 🌐 8 Supported Popular Languages
Full 100% translation parity across **923 UI leaf keys** with zero missing translations:
- 🇮🇩 **Bahasa Indonesia (`id`)** — Default & national language
- 🇬🇧 **English (`en`)** — Global international standard
- 🇮🇩 **Basa Jawa (`jv`)** — Javanese (Krama Madya)
- 🇮🇩 **Basa Sunda (`su`)** — Sundanese (Basa Lemes)
- 🇯🇵 **日本語 (`ja`)** — Japanese (Mindfulness & Teineigo)
- 🇨🇳 **简体中文 (`zh`)** — Simplified Chinese
- 🇪🇸 **Español (`es`)** — Spanish
- 🇸🇦 **العربية (`ar`)** — Modern Standard Arabic
- Includes dynamic time greetings (*getGreeting*) and localized BCP-47 date formats.

### 🌬️ Interactive Breathing Exercises (`/breathe`)
Evidence-based guided respiration techniques with Web Audio Tibetan singing bowl acoustic resonance (432Hz/528Hz/396Hz) and haptic pulsing:
- **Cyclic Sighing (Physiological Sigh)** — Balban, Spiegel, Huberman et al., Stanford 2023 (*Cell Reports Medicine*): Double nasal inhale (3s + 2s) and prolonged oral sigh (6s) for rapid positive affect and anxiety reduction.
- **Coherent Breathing** — 6s Inhale, 6s Exhale (~5.5 breaths/min for optimal Heart Rate Variability resonance).
- **4-7-8 Breathing** — 4s inhale, 7s hold, 8s exhale (parasympathetic nervous system activation).
- **Box Breathing** — Equal 4s phases (used by first responders and athletes).
- **Simple Calm** — 4s inhale, 4s exhale for gentle centering.

### 📚 Psychoeducation Library (`/education`)
10 bilingual evidence-based articles synthesizing guidelines from WHO, Indonesian Ministry of Health (Kemenkes RI), APA, and NIMH covering panic attacks, depression, boundaries, and sleep hygiene.

### 📈 Local Analytics Dashboard (`/analytics`)
Interactive visual analytics using Recharts:
- Mood distribution (PieChart)
- Average mood by day of the week (BarChart)
- Life factor impact rankings
- Monthly mood trajectory trends (LineChart)

### 🏥 Professional Services Directory & BPJS Referral Bridge (`/professional`)
Curated database of 25 Indonesian mental health institutions, psychological clinics, and teleconsultation services, paired with an interactive primary care referral bridge:
- **Puskesmas & BPJS Referral Workflow**: 3-step practical walkthrough for obtaining insurance-covered psychiatric care (FKTP Puskesmas $\rightarrow$ Doctor consultation & P-Care referral letter $\rightarrow$ Hospital psychiatric outpatient clinic Sp.KJ).
- **Doctor Conversation Scripts**: Practical, ready-to-copy consultation scripts tailored for Depression/Fatigue, Anxiety/Panic, and Academic/Student severe stress.
- **Printable Clinical Handover Brief**: Formatted 1-page A4 medical handover brief summarizing PHQ-9 & GAD-7 scores, C-SSRS safety evaluations, and 30-day mood trajectories for rapid physician anamnesis (<2 min) via direct print (`window.print`) or HTML download.


---

## 🏗️ Tech Stack

| Layer | Technology | Description |
|:------|:-----------|:------------|
| **Core Framework** | React 19 + TypeScript 6.0 | Modern declarative UI with strict type safety |
| **Build & Tooling** | Vite 8.2 + Rolldown | High-speed ESM bundler and HMR |
| **State Management** | Zustand | Lightweight store with automated `persist` middleware |
| **Styling** | Vanilla CSS + CSS Design Tokens | Zero Tailwind runtime overhead, dark-mode first |
| **Routing** | React Router DOM 7 | Code-split client-side routing |
| **Data Visualization**| Recharts 3 | Responsive SVG charting |
| **Internationalization** | i18next + react-i18next | Multi-language localization across 8 languages |
| **Icons** | Lucide React | Clean, consistent SVG icon set |
| **PWA & Offline** | vite-plugin-pwa + Workbox | Full offline caching, installable on mobile and desktop |
| **Backend & Sync** | Supabase (PostgreSQL + RLS) | Optional cloud synchronization with strict RLS |
| **Mobile Ready** | Capacitor-ready | Ready for native iOS & Android packaging |

---

## 📁 Project Structure

```
mental monitoring/
├── public/
│   ├── favicon.svg              # RIMA logo icon
│   └── icons/                   # High-res PWA manifest icons
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ClinicalDisclaimer.tsx # Trauma-informed clinical governance disclaimer
│   │   │   ├── ConsentModal.tsx     # UU PDP onboarding consent modal
│   │   │   ├── ErrorBoundary.tsx    # Graceful runtime error boundary
│   │   │   ├── EscalationBanner.tsx # Adaptive mood escalation banner
│   │   │   ├── LoadingSpinner.tsx   # Accessible loading state
│   │   │   └── SessionAwareness.tsx # Gentle session time reminder & quiet hours
│   │   ├── journal/
│   │   │   └── CbtWizard.tsx        # 5-step CBT Thought Restructuring Wizard
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Responsive layout wrapper
│   │   │   ├── BottomNav.tsx        # Mobile tab navigation
│   │   │   └── Sidebar.tsx          # Desktop navigation sidebar
│   │   ├── safety/
│   │   │   ├── CrisisInterceptor.tsx # Immediate crisis interceptor modal
│   │   │   ├── SOSButton.tsx        # Floating SOS button & crisis dialog
│   │   │   └── SafetyPlan.tsx       # Interactive safety plan editor (Stanley-Brown SPI)
│   │   ├── security/
│   │   │   ├── AppLockScreen.tsx    # 4-digit PIN lock screen
│   │   │   └── SetPinModal.tsx      # PIN setup and reset modal
│   │   └── ui/
│   │       ├── Button.tsx           # Accessible button variants
│   │       ├── Card.tsx             # Glassmorphism container
│   │       ├── Input.tsx            # Form inputs with error states
│   │       ├── Modal.tsx            # Portal modal with focus trapping
│   │       └── MoodSelector.tsx     # 5-level emoji mood selector
│   ├── data/
│   │   ├── educationContent.ts      # 10 clinical psychoeducation articles
│   │   ├── professionalServices.ts  # Directory of 25 Indonesian mental clinics
│   │   └── spiritualContent.ts      # Multi-faith reflective quotes
│   ├── hooks/
│   │   ├── useAuth.ts               # Anonymous and Supabase authentication
│   │   ├── useLocalStorage.ts       # Type-safe local storage hook
│   │   ├── useMood.ts               # Backward-compatible hook delegating to Zustand
│   │   └── useTheme.ts              # Dark / light theme toggle
│   ├── i18n/
│   │   ├── config.ts                # i18next configuration & language detector
│   │   ├── id.json                  # Indonesian translation (400+ keys)
│   │   ├── en.json                  # English translation
│   │   ├── jv.json                  # Javanese translation
│   │   ├── su.json                  # Sundanese translation
│   │   ├── ja.json                  # Japanese translation
│   │   ├── zh.json                  # Simplified Chinese translation
│   │   ├── es.json                  # Spanish translation
│   │   └── ar.json                  # Arabic translation
│   ├── pages/
│   │   ├── Home.tsx                 # Dashboard, daily affirmation, & insights
│   │   ├── MoodTracker.tsx          # Mood logging, history, & factor tracking
│   │   ├── Journal.tsx              # Therapeutic journaling & CBT Wizard
│   │   ├── TippCrisisHub.tsx        # DBT TIPP Crisis Hub (Temperature, Exercise, Breath, PMR)
│   │   ├── Grounding.tsx            # Somatic 5-4-3-2-1 Sensory Grounding
│   │   ├── Assessment.tsx           # Standardized PHQ-9 & GAD-7 psychometrics
│   │   ├── Forum.tsx                # Anonymous peer support forum
│   │   ├── Profile.tsx              # Settings, PIN security, language picker, & data controls
│   │   ├── Breathe.tsx              # 5 animated breathing modes (incl. Cyclic Sighing)
│   │   ├── Education.tsx            # Mental wellness knowledge library
│   │   ├── ProfessionalHelp.tsx     # Verified clinic & hospital directory
│   │   ├── Analytics.tsx            # Local data visualization dashboard
│   │   └── PrivacyPolicy.tsx        # Full UU PDP statutory privacy policy
│   ├── services/
│   │   ├── crisisDetectionService.ts # Client-side distress NLP keyword matcher
│   │   ├── escalationService.ts      # 4-tier care escalation logic
│   │   ├── forumService.ts           # Community CRUD, pagination, & moderation
│   │   ├── moodAnalysisService.ts    # Correlation algorithms & weekly summaries
│   │   └── supabase.ts               # Supabase client with offline fallback
│   ├── stores/
│   │   └── moodStore.ts              # Zustand store with automated persistence
│   ├── styles/
│   │   ├── design-tokens.css        # CSS variables (colors, elevations, transitions)
│   │   ├── components.css           # Reusable UI component utility classes
│   │   └── index.css                # Base reset, responsive typography, layout
│   ├── types/
│   │   └── index.ts                 # Central TypeScript interfaces & types
│   ├── utils/
│   │   ├── constants.ts             # Crisis hotlines & app constants
│   │   ├── dataWipe.ts              # Full local & remote data erasure utility
│   │   ├── exportImport.ts          # JSON backup, CSV therapist report, PDF print
│   │   ├── helpers.ts               # Date formatters, grace streak, & greetings
│   │   └── platform.ts              # Capacitor & web platform detection
│   ├── App.tsx                      # Code-split routing & lazy-loaded pages
│   └── main.tsx                     # React 19 concurrent root
├── supabase_schema.sql              # Supabase PostgreSQL schema with RLS
├── vite.config.ts                   # Vite & PWA configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18.0.0 or higher
- [npm](https://www.npmjs.com) v9.0.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rima.git
cd rima

# 2. Install project dependencies
npm install

# 3. Start local development server
npm run dev
```

Open **http://localhost:5173/** in your browser.

### Available Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server with Hot Module Replacement (HMR) |
| `npm run build` | Compile TypeScript and build production bundle with Vite |
| `npm run preview` | Locally preview production build |
| `npm test` | Run Vitest unit test suite (95 test cases across 15 test suites) |
| `npm run lint` | Run code quality checks with oxlint |

---

## 🎨 Design System & Accessibility

RIMA incorporates a trauma-informed design system tailored for mental wellness:

### Color Palette

| CSS Token | HSL / Hex | Psychological Rationale |
|:----------|:----------|:------------------------|
| `--color-primary` | `hsl(215, 65%, 55%)` | Soft Blue — Calming, dependable, non-threatening |
| `--color-secondary` | `hsl(165, 45%, 50%)` | Sage Teal — Harmony, emotional renewal |
| `--color-accent` | `hsl(270, 50%, 65%)` | Lavender — Mindfulness, creative reflection |
| `--color-warm` | `hsl(35, 75%, 60%)` | Amber Gold — Warmth, optimism, gentle encouragement |
| `--color-danger` | `hsl(0, 65%, 55%)` | Crimson — Crisis urgency and SOS differentiation |

### Design Standards
- **Dark Mode by Default**: Minimizes eye strain during evening or nighttime distress.
- **Glassmorphism**: Elegant translucent panels for an airy, calming visual hierarchy.
- **Soft Curvature (16px+ border radius)**: Psychological friendliness; absence of harsh edges.
- **Motion Restraint**: Micro-interactions respect `prefers-reduced-motion` preferences.
- **WCAG 2.2 AA Conformance**: Tested color contrast ratios, focus visible rings, and screen-reader accessibility.

---

## 🗺️ Roadmap & Milestones

### ✅ Phase 1 — Foundation (Completed)
- [x] Project architecture setup (Vite + React 19 + TypeScript + PWA)
- [x] Trauma-informed design tokens and glassmorphism styling
- [x] 5-level mood logging and factor correlation
- [x] 4 therapeutic journaling templates (Free, CBT, Gratitude, Reflection)
- [x] Anonymous peer support community forum
- [x] Safety infrastructure (SOS button, Indonesian hotlines, Safety Plan)
- [x] Bilingual support (ID / EN) and responsive layout

### ✅ Phase 2 — Backend & Synchronization (Completed)
- [x] Supabase integration (PostgreSQL database, Row Level Security)
- [x] Multi-device synchronization with offline-first local fallback
- [x] Realtime community discussions with automated moderation
- [x] Daily mood check-in reminders and web notifications
- [x] Multi-format data export (JSON backup, CSV therapist report, PDF print)

### ✅ Phase 3 — Intelligence & Psychoeducation (Completed)
- [x] Client-side distress keyword detection in journals (bilingual NLP)
- [x] Automated mood pattern analysis and weekly insights
- [x] 10 evidence-based psychoeducation articles (`/education`)
- [x] Guided interactive breathing exercises (`/breathe`)
- [x] 4-tier care escalation ladder and adaptive dashboard banner

### ✅ Phase 4 — Scalability & Cultural Localization (Completed)
- [x] Regional language pilot: Javanese (*Basa Jawa Krama Madya*)
- [x] Multi-tradition spiritual and reflective content (Universal, Islam, Christian, Buddhist, Hindu)
- [x] Directory of 25 verified Indonesian mental healthcare facilities
- [x] Local analytics dashboard with Recharts visual graphs
- [x] Cross-platform Capacitor readiness for iOS & Android builds

### ✅ Phase 5 — Security, UU PDP Compliance & Architecture Hardening (Completed)
- [x] **Supabase RLS Hardening**: Authenticated post restriction and isolation of `is_flagged` status via public views
- [x] **Indonesian UU PDP (Law No. 27/2022) Compliance**: Dedicated Privacy Policy (`/privacy`), Consent Onboarding Modal, and one-click Permanent Data Erasure (`wipeAllData`)
- [x] **Clinical Medical Disclaimers**: Clarified self-reflection status across Home, Analytics, and Crisis banners
- [x] **Zustand State Architecture**: Migrated core mood state to `useMoodStore` with automatic persistence
- [x] **Forum Pagination**: Cursor-based batch loading (10 posts per load) with distress detection
- [x] **Compassionate Grace Streaks**: *Recovery Day* mechanism to prevent streak-break guilt
- [x] **Comprehensive Testing Suite**: Expanded to 30 unit tests across crisis detection, analysis, and state stores

### ✅ Phase 6 — Popular Multi-Language Expansion (Completed)
- [x] **Support for 8 Popular Languages**:
  - 🇮🇩 **Bahasa Indonesia (`id`)**
  - 🇬🇧 **English (`en`)**
  - 🇮🇩 **Basa Jawa (`jv`)** — Krama Madya
  - 🇮🇩 **Basa Sunda (`su`)** — Basa Sunda Lemes
  - 🇯🇵 **日本語 (`ja`)** — Japanese Teineigo
  - 🇨🇳 **简体中文 (`zh`)** — Simplified Chinese
  - 🇪🇸 **Español (`es`)** — Spanish
  - 🇸🇦 **العربية (`ar`)** — Modern Standard Arabic
- [x] **100% Translation Parity**: All 400+ keys translated with zero missing strings across all 8 languages
- [x] **Responsive Language Selector**: Flag-badged autonym selection grid in Profile
- [x] **Localized Dynamic Greetings & Dates**: Time-appropriate greetings and BCP-47 locale dates

### ✅ Phase 7 — Evidence-Based Clinical Interventions & DTx Framework (Completed)
- [x] **Interactive 5-Step CBT Thought Restructuring Wizard (*Pembedah Pikiran*)**:
  - Sequential mobile cognitive reappraisal based on Beck & Burns frameworks
  - 8 cognitive distortion trap cards with clinical explanations and examples
  - Objective evidence testing (Facts Supporting vs. Facts Refuting)
  - Pre/post emotional distress intensity tracking with immediate relief feedback
- [x] **DBT TIPP Crisis Hub (`/tipp`)**:
  - Linehan (2014) distress tolerance protocol for acute emotional arousal (SUDS $\ge 7/10$)
  - **T (Temperature)**: 30-second guided timer triggering the *Mammalian Dive Reflex*
  - **I (Intense Exercise)**: 60-second motor discharge timer for burning stress hormones
  - **P (Paced Breathing)**: Baroreflex prolonged exhalation pacer and breathing launchers
  - **P (Paired Muscle Relaxation - PMR)**: 5-zone body cycle with alternating tension (5s) and release (10s)
  - Real-time SUDS pre/post rating with automated emergency hotline fallback
- [x] **Somatic 5-4-3-2-1 Sensory Grounding (`/grounding`)**:
  - Evidence-based grounding with interactive progress, haptic cues, and post-session reflection
- [x] **Standardized Psychometric Screening (`/assessment`)**:
  - Indonesian-validated PHQ-9 (Depression) and GAD-7 (Anxiety) instruments (*Arjadi et al., 2024*)
  - Tiered clinical recommendations and automated item 9 crisis interceptor
- [x] **Stanford Breathwork Protocol in `/breathe`**:
  - Cyclic Sighing (Physiological Sigh) from Stanford RCT 2023 (*Balban, Spiegel, Huberman et al.*)
  - Web Audio synthesized Tibetan singing bowl frequencies (432Hz/528Hz/396Hz)
- [x] **App PIN Security Lock**:
  - Offline 4-digit PIN authentication with PBKDF2-SHA256 salted hashing and brute-force rate limiting protection
- [x] **Structured Suicide-Risk Escalation via C-SSRS Screener**:
  - Validated 6-item Columbia-Suicide Severity Rating Scale (C-SSRS) Screener with skip logic
  - Automatic escalation from PHQ-9 Item 9 ($\ge 1$) replacing blunt/alarmist popups
  - Deterministic clinical stratification (Minimal, Low, Moderate, High) with tiered de-escalation actions
  - Integrated 2026 verified Indonesian crisis helplines (Healing 119 ext 8, 112, 119, Yayasan Pulih)
  - 100% translation parity across all 8 languages (47 new `cssrs.*` keys)
- [x] **Behavioral Activation (BA) Module (`/activation`)**:
  - Implementation grounded in Arjadi et al. (2018) *The Lancet Psychiatry* RCT for Indonesian youth
  - 4 activity domains (Pleasure, Mastery, Spiritual, Social) with 16 culturally tailored micro-actions
  - Scheduling with pre-activity mood prediction (1–10) and post-completion reflection
  - Mood-Activity link with live $\Delta\text{Mood}$ calculation and celebration modal
  - 100% translation parity across 8 languages (65 new `ba.*` keys)
- [x] **Puskesmas & BPJS Referral Bridge (`/professional`)**:
  - 3-Step FKTP Puskesmas to RSUD Poli Jiwa workflow walkthrough
  - Doctor conversation scripts for depression, panic/anxiety, and student stress with clipboard copy
  - Rapid 1-page A4 clinical handover brief generator with direct print (`window.print`) and HTML download
  - 100% translation parity across 8 languages (44 new `referral.*` keys)
- [x] **IndexedDB Storage Migration & Persistence API (`/profile`)**:
  - Asynchronous `rimaAsyncStorage` conforming to Zustand `StateStorage` with transparent migration from `localStorage`
  - Browser `navigator.storage.persist()` and `estimate()` integration to prevent OS/Safari 7-day cache eviction
  - Interactive storage management card in Profile with quota monitoring and one-click persistence activation
  - 10 new localized keys across all 8 languages for storage controls
- [x] **Expanded Test Suite**:
  - 144 unit test cases across 23 test suites with 100% pass rate

---

## 📚 Academic & Research Foundations

RIMA is constructed on empirical findings from **60+ academic publications, randomized controlled trials (RCTs), institutional clinical guidelines (NICE, APA, SAMHSA, ORCHA), and open-source GitHub projects** across multiple languages (Indonesian, English, Japanese, German, Spanish, and Chinese):

- **Arjadi, R., Nauta, M.H., Scholte, W.F., et al.** *Internet-based behavioural activation with lay counsellor support versus online minimal psychoeducation under supervision for depressed adults in Indonesia: a randomised controlled trial.* **The Lancet Psychiatry**, 5(8), 647–658. (2018)
- **Balban, M.Y., Spiegel, D., Huberman, A.D., et al.** *Brief structured respiration practices enhance mood and reduce physiological arousal.* **Cell Reports Medicine**, 4(1), 100895. (2023)
- **Firth, J., Torous, J., et al.** *The efficacy of smartphone-based mental health interventions for depressive symptoms: a meta-analysis of randomized controlled trials.* **World Psychiatry**, 16(3), 287–298. (2017)
- **Linardon, J., Cuijpers, P., et al.** *The current status of smartphone-delivered interventions for mental health problems: An updated meta-analysis.* **World Psychiatry**, 23(2), 260–273. (2024)
- **Linehan, M.M.** *DBT Skills Training Manual (2nd ed.).* Guilford Press. (2014)
- **Valentine, S.E., et al.** *The use of dialectical behavior therapy skills training as stand-alone treatments: A systematic review.* **Psychiatry Research**, 229(3), 675–685. (2015)
- **Lieberman, M.D., et al.** *Putting feelings into words: Affect labeling disrupts amygdala activity.* **Psychological Science**, 18(5), 421–428. (2007)
- **Arjadi, R., et al.** *Diagnostic accuracy and clinical validity of the Indonesian versions of PHQ-9 and GAD-7 in psychiatric outpatients.* **Asian Journal of Psychiatry**, 92, 103890. (2024)
- **World Health Organization (WHO)**. *Guidelines on Digital Interventions for Health System Strengthening.* (2019)
- **National Institute for Health and Care Excellence (NICE)**. *Evidence Standards Framework for Digital Health Technologies.* (2021)
- **American Psychiatric Association (APA)**. *The App Advisor Evaluation Framework for Mental Health Apps.* (2021)
- **Substance Abuse and Mental Health Services Administration (SAMHSA)**. *Concept of Trauma and Guidance for a Trauma-Informed Approach.* (2014)
- **Torous, J., et al.** *Digital Mental Health and COVID-19.* JAMA Psychiatry, 77(11), 1091–1092. (2020)
- **Ebert, D.D. & Baumeister, H.** *Internetbasierte Interventionen bei psychischen Störungen.* Der Nervenarzt (Germany, 2020)
- **Takahashi, Y. & Kawanishi, H.** *LINE相談によるメンタルヘルス支援と危機介入.* 精神神経学雑誌 (Japan, 2020)
- **Guo, Y., Huang, Y., et al.** *基于移动互联技术的认知行为治疗在高校学生焦虑抑郁干预中的随机对照研究.* 中国心理卫生杂志 (China, 2021)
- **Stanley, B. & Brown, G.K.** *Safety Planning Intervention: A Brief Intervention to Mitigate Suicide Risk.* Cognitive and Behavioral Practice (2012)
- **Pennebaker, J.W. & Beall, S.K.** *Confronting a Traumatic Event: Toward an Understanding of Inhibition and Disease.* Journal of Abnormal Psychology (1986)
- **Indonesian Ministry of Health (Kemenkes RI)**. *Riset Kesehatan Dasar (Riskesdas 2018) & Survei Kesehatan Indonesia (SKI 2023).*

📖 For the full multidisciplinary scientific dossier, see [`RESEARCH_FOUNDATIONS.md`](./RESEARCH_FOUNDATIONS.md) and [`deep_research_scientific_evidence.md`](./deep_research_scientific_evidence.md).


---

## 🤝 Contributing

Contributions are warmly welcomed! To contribute to RIMA:

1. Fork the repository
2. Create a dedicated feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your modifications (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Standards

- Ensure the code passes TypeScript strict checks (`npx tsc -p tsconfig.app.json --noEmit`).
- Ensure all Vitest tests pass (`npm test`).
- Use CSS design tokens and vanilla CSS — **do not introduce Tailwind CSS**.
- UI strings must be localized via `react-i18next` with fallback keys.
- Under no circumstances should safety features (SOS, crisis detection) be weakened.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Crafted with 💙 for accessible, stigma-free mental health care**

*You are not alone. You matter.*

🆘 In crisis? Contact **119 ext 8** (Indonesia) or reach out to your local emergency services.

</div>
