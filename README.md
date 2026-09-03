<div align="center">

# 🧠 RIMA

### Safe Mental Interaction Space (*Ruang Interaksi Mental Aman*)

A privacy-focused, anonymous, evidence-based digital mental health platform.

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)
[![Tests Passing](https://img.shields.io/badge/Vitest-30%2F30%20passing-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
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

### 📝 Structured Journaling
Four evidence-based therapeutic writing templates:
- **Free Writing** — Unfiltered stream-of-consciousness expression.
- **Structured CBT** — Thought record analysis based on Cognitive Behavioral Therapy (Situation → Automatic Thoughts → Evidence → Balanced Perspective).
- **Gratitude Journal** — Focus on positive anchors and gratitude.
- **Self-Reflection** — Structured prompt for self-discovery and growth.

### 💬 Anonymous Community Forum
- **Zero-Stigma Peer Support**: Post and reply anonymously using randomized pseudonym avatars (e.g., *"Kupu-kupu Berani"*).
- **Category Filter**: Browse topics such as Anxiety, Depression, Relationships, Work, Family, and Self-Care.
- **Supportive Reactions**: Send heartfelt encouragement (❤️ 💪 🤗) without toxic metrics.
- **Built-in Crisis Prevention**: Pre-posting analysis automatically detects distress keywords and offers crisis hotlines.

### 🆘 Comprehensive Safety & SOS
- **Always-Accessible SOS Button**: Persistent emergency button linking to crisis hotlines in one click.
- **Digital Safety Plan**: Personal crisis blueprint following clinical best practices (Warning Signs, Internal Coping, Social Distractions, Trusted Contacts, Professionals, Safe Environment, Reasons to Live).
- **Indonesian Hotlines Integrated**:
  - Into The Light Indonesia: `119 ext 8`
  - LSM Jangan Bunuh Diri: `021-9696 9293`
  - Yayasan Pulih: `021-788-42580`
  - Emergency Services: `112`

### 🛡️ Privacy & Indonesian UU PDP Compliance
- **100% Offline-First by Default**: Personal mood logs, journal entries, and safety plans reside in local device storage.
- **Client-Side Crisis NLP**: Emergency keyword detection runs 100% on the browser with zero external transmission of sensitive thoughts.
- **Statutory Data Rights**: Dedicated Privacy Policy page (`/privacy`), Onboarding Consent Modal, JSON/CSV data portability, and a one-click **Permanent Data Erasure** (`wipeAllData`) tool.

### 🌐 8 Supported Popular Languages
Full 100% translation parity across ~180 UI keys:
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
Three guided breathing techniques with harmonic animations:
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

### 🏥 Professional Services Directory (`/professional`)
Curated database of 25 Indonesian mental health institutions, psychological clinics, and teleconsultation services, filterable by Province, Facility Type, Online Availability, and BPJS Health Insurance acceptance.

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
│   │   │   ├── ConsentModal.tsx     # UU PDP onboarding consent modal
│   │   │   ├── ErrorBoundary.tsx    # Graceful runtime error boundary
│   │   │   ├── EscalationBanner.tsx # Adaptive mood escalation banner
│   │   │   └── LoadingSpinner.tsx   # Accessible loading state
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Responsive layout wrapper
│   │   │   ├── BottomNav.tsx        # Mobile tab navigation
│   │   │   └── Sidebar.tsx          # Desktop navigation sidebar
│   │   ├── safety/
│   │   │   ├── SOSButton.tsx        # Floating SOS button & crisis dialog
│   │   │   └── SafetyPlan.tsx       # Interactive safety plan editor
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
│   │   ├── id.json                  # Indonesian translation
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
│   │   ├── Journal.tsx              # Therapeutic journaling & crisis alert
│   │   ├── Forum.tsx                # Anonymous peer support forum
│   │   ├── Profile.tsx              # Settings, language picker, & data controls
│   │   ├── Breathe.tsx              # 3 animated breathing exercise modes
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
| `npm test` | Run Vitest unit test suite (30 test cases) |
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
- [x] **100% Translation Parity**: All ~180 keys translated across all 8 languages
- [x] **Responsive Language Selector**: Flag-badged autonym selection grid in Profile
- [x] **Localized Dynamic Greetings & Dates**: Time-appropriate greetings and BCP-47 locale dates

---

## 📚 Academic & Research Foundations

RIMA is constructed on empirical findings from **60+ academic publications, randomized controlled trials (RCTs), institutional clinical guidelines (NICE, APA, SAMHSA, ORCHA), and open-source GitHub projects** across multiple languages (Indonesian, English, Japanese, German, Spanish, and Chinese):

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

📖 For the full multidisciplinary scientific dossier, see [`RESEARCH_FOUNDATIONS.md`](./RESEARCH_FOUNDATIONS.md).

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
