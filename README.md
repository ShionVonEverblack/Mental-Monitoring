<div align="center">

# 🧠 RIMA

### Ruang Interaksi Mental Aman

Platform kesehatan mental digital yang aman, anonim, dan berbasis bukti ilmiah.

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Bahasa Indonesia](#tentang) · [English](#about)

</div>

---

## Tentang

**RIMA** (Ruang Interaksi Mental Aman) adalah platform digital open-source yang dirancang untuk mendukung kesehatan mental masyarakat Indonesia. Dibangun berdasarkan riset mendalam dari 27+ jurnal akademis, panduan WHO, dan analisis kompetitor global.

> **⚠️ Disclaimer:** RIMA bukan pengganti layanan kesehatan mental profesional. Jika Anda dalam kondisi darurat, segera hubungi layanan krisis atau pergi ke IGD terdekat.

### Mengapa RIMA?

- 🇮🇩 **1 dari 4 orang Indonesia** mengalami gangguan kesehatan mental
- 🏥 Rasio psikolog-populasi: **1:400.000** (WHO merekomendasikan 1:30.000)
- 🤐 **96.5%** penderita gangguan mental berat tidak mendapat pengobatan
- 💬 Stigma sosial masih menjadi penghalang utama untuk mencari bantuan

RIMA hadir sebagai **langkah pertama yang aman dan anonim** sebelum seseorang siap berkonsultasi dengan profesional.

---

## ✨ Fitur Utama

### 📊 Mood Tracker
Lacak emosi harian dengan 5-level emoji selector. Identifikasi faktor pemicu (tidur, olahraga, pekerjaan, dll), lihat tren mingguan/bulanan, dan pantau streak harianmu.

### 📝 Journaling Terstruktur
Empat template berbasis bukti:
- **Tulis Bebas** — ekspresikan perasaanmu tanpa batasan
- **CBT Terstruktur** — analisis pikiran dengan kerangka Cognitive Behavioral Therapy
- **Syukur** — fokus pada hal-hal positif
- **Refleksi** — evaluasi diri dan pertumbuhan pribadi

### 💬 Forum Anonim
Ruang aman untuk berbagi cerita dan mendukung sesama. Identitas anonim otomatis (contoh: "Kupu-kupu Berani"), kategori topik (kecemasan, depresi, hubungan, dll), dan sistem reaksi suportif (❤️ 💪 🤗).

### 🆘 Fitur Keselamatan
- **Tombol SOS** — selalu terlihat di semua halaman, akses instan ke hotline krisis
- **Rencana Keselamatan Digital** — buat dan simpan rencana keselamatan pribadimu
- **Hotline Krisis Indonesia:**
  - Into The Light Indonesia: `119 ext 8`
  - LSM Jangan Bunuh Diri: `021-9696 9293`
  - Yayasan Pulih: `021-788-42580`
  - Sejiwa (Kemenkes): `119 ext 8`
  - Darurat: `112`

### 🌐 Bilingual
Tersedia dalam Bahasa Indonesia (default) dan English, dapat diubah kapan saja.

### 📱 PWA (Progressive Web App)
Install langsung dari browser tanpa app store. Berfungsi offline — mood dan jurnal tersimpan di perangkat.

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|:------|:----------|
| **Framework** | React 19 + TypeScript 6.0 |
| **Build Tool** | Vite 8.2 |
| **Styling** | Vanilla CSS + CSS Custom Properties |
| **Routing** | React Router DOM 7 |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **i18n** | i18next + react-i18next |
| **Storage** | localStorage (offline-first) |
| **PWA** | vite-plugin-pwa + Workbox |
| **Backend** | Supabase *(planned)* |

---

## 📁 Struktur Proyek

```
mental monitoring/
├── public/
│   ├── favicon.svg              # RIMA logo
│   └── icons/                   # PWA icons
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # Responsive layout wrapper
│   │   │   ├── BottomNav.tsx    # Mobile navigation (5 tabs)
│   │   │   └── Sidebar.tsx      # Desktop navigation
│   │   ├── safety/
│   │   │   ├── SOSButton.tsx    # Floating SOS + crisis hotlines
│   │   │   └── SafetyPlan.tsx   # Digital safety plan editor
│   │   └── ui/
│   │       ├── Button.tsx       # Multi-variant button
│   │       ├── Card.tsx         # Glassmorphism card
│   │       ├── Input.tsx        # Input with icon & error states
│   │       ├── Modal.tsx        # Portal modal with focus trap
│   │       └── MoodSelector.tsx # Emoji mood picker
│   ├── hooks/
│   │   ├── useLocalStorage.ts   # Generic persistent storage
│   │   ├── useMood.ts           # Mood CRUD & statistics
│   │   └── useTheme.ts          # Dark/light mode toggle
│   ├── i18n/
│   │   ├── config.ts            # i18next configuration
│   │   ├── id.json              # Bahasa Indonesia translations
│   │   └── en.json              # English translations
│   ├── pages/
│   │   ├── Home.tsx             # Dashboard
│   │   ├── MoodTracker.tsx      # Mood input + charts + history
│   │   ├── Journal.tsx          # Template-based journaling
│   │   ├── Forum.tsx            # Anonymous peer support
│   │   └── Profile.tsx          # Settings & stats
│   ├── styles/
│   │   ├── design-tokens.css    # CSS custom properties (colors, spacing, etc.)
│   │   ├── components.css       # Pre-built component classes
│   │   └── index.css            # Reset, layout, page styles, animations
│   ├── types/
│   │   └── index.ts             # 16+ TypeScript interfaces
│   ├── utils/
│   │   ├── constants.ts         # Crisis hotlines, mood data, categories
│   │   └── helpers.ts           # Date formatting, mood analysis, utilities
│   ├── App.tsx                  # Routing configuration
│   └── main.tsx                 # Entry point
├── index.html                   # HTML entry with SEO meta tags
├── vite.config.ts               # Vite + PWA configuration
├── tsconfig.app.json            # TypeScript strict config
└── package.json
```

---

## 🚀 Memulai

### Prasyarat

- [Node.js](https://nodejs.org) v18+
- npm v9+

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd "mental monitoring"

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka **http://localhost:5173/** di browser.

### Scripts

| Command | Deskripsi |
|:--------|:----------|
| `npm run dev` | Jalankan dev server dengan hot reload |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview production build |
| `npm run lint` | Linting dengan oxlint |

---

## 🎨 Design System

RIMA menggunakan design system yang dirancang khusus untuk konteks kesehatan mental:

### Warna

| Token | Nilai | Kegunaan |
|:------|:------|:---------|
| `--color-primary` | `hsl(215, 65%, 55%)` | Soft blue — ketenangan, kepercayaan |
| `--color-secondary` | `hsl(165, 45%, 50%)` | Teal — pertumbuhan, harmoni |
| `--color-accent` | `hsl(270, 50%, 65%)` | Lavender — kreativitas, ketentraman |
| `--color-warm` | `hsl(35, 75%, 60%)` | Amber — kehangatan, optimisme |
| `--color-danger` | `hsl(0, 65%, 55%)` | Red — darurat, SOS |

### Prinsip Desain

- **Dark mode default** — privasi dan kenyamanan, terutama penggunaan malam hari
- **Glassmorphism** — efek kaca premium pada cards
- **Rounded corners** (16px+) — terasa aman dan ramah
- **Micro-animations** — transisi halus yang menenangkan
- **Mobile-first** — 70%+ pengguna Indonesia mengakses internet via HP
- **WCAG 2.2** — aksesibel untuk semua pengguna

---

## 🗺️ Roadmap

### ✅ Fase 1 — Pondasi (Selesai)
- [x] Project setup (Vite + React + TypeScript + PWA)
- [x] Design system (CSS tokens, glassmorphism, animations)
- [x] Mood tracker dengan chart dan statistik
- [x] Journaling dengan 4 template (free, CBT, gratitude, reflection)
- [x] Forum anonim dengan kategori dan reaksi
- [x] Fitur keselamatan (SOS button, crisis hotlines, safety plan)
- [x] Bilingual (ID/EN)
- [x] Responsive layout (mobile + desktop)

### 🔲 Fase 2 — Backend & Komunitas
- [ ] Integrasi Supabase (database, auth, realtime)
- [ ] Sinkronisasi data antar perangkat
- [ ] Forum realtime dengan moderasi
- [ ] Notifikasi & reminder check-in
- [ ] Export data mood/jurnal (PDF/CSV)

### 🔲 Fase 3 — AI & Edukasi
- [ ] NLP crisis detection pada jurnal
- [ ] AI mood pattern analysis
- [ ] Konten edukasi kesehatan mental
- [ ] Breathing exercises & guided meditation
- [ ] Escalation ladder (mood → peer → profesional)

### 🔲 Fase 4 — Skalabilitas
- [ ] Adaptasi kultural (bahasa daerah, konteks spiritual)
- [ ] Integrasi dengan layanan kesehatan mental profesional
- [ ] Analytics dashboard untuk peneliti (anonymized)
- [ ] Multi-platform (Android/iOS via Capacitor)

---

## 📚 Referensi Riset

Proyek ini dibangun berdasarkan riset dari 27+ sumber akademis, termasuk:

- WHO. *Guidelines on Digital Interventions for Health System Strengthening.* (2019)
- Torous, J., et al. *Digital Mental Health and COVID-19.* JAMA Psychiatry (2020)
- Lattie, E.G., et al. *Digital Mental Health Interventions for Depression, Anxiety, and Enhancement of Psychological Well-Being.* Current Psychiatry Reports (2019)
- Kemenkes RI. *Riset Kesehatan Dasar (Riskesdas).* (2018)
- Demyttenaere, K., et al. *Prevalence, Severity, and Unmet Need for Treatment of Mental Disorders.* JAMA (2004)

Laporan riset lengkap tersedia di [`deep_research_mental_health.md`](./deep_research_mental_health.md).

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur/fitur-baru`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur/fitur-baru`)
5. Buat Pull Request

### Pedoman Kontribusi

- Pastikan kode lulus TypeScript check (`npx tsc --noEmit`)
- Gunakan vanilla CSS, bukan Tailwind
- Semua teks UI harus bilingual (ID + EN) via i18n
- Fitur keselamatan (SOS) tidak boleh diubah tanpa review ketat

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">

**Dibuat dengan 💙 untuk kesehatan mental Indonesia**

*Kamu tidak sendirian. Kamu berharga.*

🆘 Butuh bantuan? Hubungi **119 ext 8** atau **021-9696 9293**

</div>
