# RIMA — Project Context
# Dokumen ini berisi seluruh konteks proyek agar AI atau developer lain
# dapat memahami dan melanjutkan pengerjaan tanpa membaca seluruh folder.
# Terakhir diperbarui: 2026-08-08

## ═══════════════════════════════════════════════════════════════
## 1. IDENTITAS PROYEK
## ═══════════════════════════════════════════════════════════════

Nama        : RIMA (Ruang Interaksi Mental Aman)
Versi       : 1.0.0
Tujuan      : Platform kesehatan mental digital berbasis bukti ilmiah,
              anonim, dan bilingual (ID/EN) untuk masyarakat Indonesia.
Target User : Masyarakat umum (bukan hanya mahasiswa), terutama yang
              menghadapi stigma atau akses terbatas ke layanan profesional.
Status      : Fase 1 selesai (MVP lokal). Belum ada backend.

## ═══════════════════════════════════════════════════════════════
## 2. TECH STACK
## ═══════════════════════════════════════════════════════════════

| Layer        | Teknologi                        | Versi   |
|--------------|----------------------------------|---------|
| Framework    | React + TypeScript               | 19 / 6  |
| Build        | Vite                             | 8.2     |
| Styling      | Vanilla CSS + CSS Custom Props   | —       |
| Routing      | react-router-dom                 | 7       |
| Charts       | Recharts                         | 3       |
| Icons        | lucide-react                     | 1.29    |
| i18n         | i18next + react-i18next          | 26 / 17 |
| Storage      | localStorage (offline-first)     | —       |
| PWA          | vite-plugin-pwa + Workbox        | 1.3     |
| Backend      | Supabase (planned, not wired)    | 2.112   |
| Linter       | oxlint                           | 1.75    |

PENTING — TIDAK ADA TAILWIND CSS.
Semua styling menggunakan vanilla CSS classes dan CSS custom properties.
JANGAN gunakan Tailwind utility classes (flex, items-center, bg-*, dll).

## ═══════════════════════════════════════════════════════════════
## 3. STRUKTUR FOLDER
## ═══════════════════════════════════════════════════════════════

```
mental monitoring/
├── public/
│   ├── favicon.svg              # Logo RIMA (SVG gradient)
│   └── icons/                   # PWA icons (placeholder)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # Root layout: sidebar (desktop) + content + bottom nav (mobile) + SOS
│   │   │   ├── BottomNav.tsx    # Mobile bottom navigation (5 tabs), hidden on desktop
│   │   │   └── Sidebar.tsx      # Desktop sidebar navigation, hidden on mobile, collapsible
│   │   ├── safety/
│   │   │   ├── SOSButton.tsx    # Floating red button (always visible), opens crisis hotline modal
│   │   │   └── SafetyPlan.tsx   # Digital safety plan editor (6 sections)
│   │   └── ui/
│   │       ├── Button.tsx       # Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg
│   │       ├── Card.tsx         # Glassmorphism card. Variants: default, glass. Padding: none/sm/md/lg
│   │       ├── Input.tsx        # Input/textarea with optional icon, label, error message
│   │       ├── Modal.tsx        # Portal-based modal with focus trap, escape-to-close, backdrop blur
│   │       └── MoodSelector.tsx # 5 emoji buttons (😢😟😐🙂😊) with glow effect on selection
│   ├── hooks/
│   │   ├── useLocalStorage.ts   # Generic hook: [value, setValue, removeValue], cross-tab sync
│   │   ├── useMood.ts           # Mood CRUD + stats (streak, trend, average)
│   │   └── useTheme.ts          # Dark/light toggle, persisted, system preference detection
│   ├── i18n/
│   │   ├── config.ts            # i18next init: fallback 'id', detection via localStorage
│   │   ├── id.json              # Bahasa Indonesia — ~100 keys
│   │   └── en.json              # English — same structure as id.json
│   ├── pages/
│   │   ├── Home.tsx             # Dashboard: greeting, mood check-in, affirmation, quick actions, chart
│   │   ├── MoodTracker.tsx      # Full mood input + factor chips + notes + stats + chart + history
│   │   ├── Journal.tsx          # 4 templates (free/CBT/gratitude/reflection) + editor + history
│   │   ├── Forum.tsx            # Anonymous forum: categories, posts, reactions, comments
│   │   └── Profile.tsx          # Avatar, stats, theme toggle, language toggle, about + disclaimer
│   ├── styles/
│   │   ├── design-tokens.css    # CSS custom properties: colors, spacing, radius, shadows, transitions
│   │   ├── components.css       # Pre-built classes: .btn, .card, .input, .modal, .badge, .chip, etc
│   │   └── index.css            # Reset + base + layout + ALL page-specific CSS classes
│   ├── types/
│   │   └── index.ts             # All TypeScript interfaces (MoodEntry, JournalEntry, ForumPost, etc)
│   ├── utils/
│   │   ├── constants.ts         # Static data: CRISIS_HOTLINES, MOOD_EMOJIS, FORUM_CATEGORIES, etc
│   │   └── helpers.ts           # Utility functions: getGreeting, formatDate, getMoodTrend, etc
│   ├── App.tsx                  # BrowserRouter + Routes + AppShell wrapper + theme init
│   └── main.tsx                 # ReactDOM.createRoot entry
├── index.html                   # HTML shell with SEO meta, Google Fonts, PWA manifest
├── vite.config.ts               # Vite + PWA + path alias (@/ → src/)
├── tsconfig.app.json            # Strict TS, verbatimModuleSyntax, no baseUrl
├── package.json                 # Scripts: dev, build, lint, preview
└── README.md                    # Dokumentasi lengkap
```

## ═══════════════════════════════════════════════════════════════
## 4. ROUTING
## ═══════════════════════════════════════════════════════════════

| Path           | Component      | Deskripsi                     |
|----------------|----------------|-------------------------------|
| /              | Home           | Dashboard utama               |
| /mood          | MoodTracker    | Input & riwayat mood          |
| /journal       | Journal        | Journaling dengan template    |
| /forum         | Forum          | Forum anonim peer support     |
| /profile       | Profile        | Pengaturan & statistik        |
| /safety-plan   | SafetyPlan     | Editor rencana keselamatan    |

Semua route dibungkus oleh AppShell yang menyediakan:
- Sidebar (desktop ≥768px)
- BottomNav (mobile <768px)
- SOSButton (selalu visible di semua halaman)

## ═══════════════════════════════════════════════════════════════
## 5. DATA & STATE MANAGEMENT
## ═══════════════════════════════════════════════════════════════

Saat ini SEMUA data tersimpan di localStorage (offline-first, no backend).

### localStorage Keys:
| Key               | Tipe            | Deskripsi                        |
|--------------------|-----------------|----------------------------------|
| rima-moods         | MoodEntry[]     | Semua entri mood                 |
| rima-journals      | JournalEntry[]  | Semua entri jurnal               |
| rima-forum-posts   | ForumPost[]     | Semua postingan forum            |
| rima-theme         | 'dark' | 'light'| Preferensi tema                  |
| rima-language      | 'id' | 'en'    | Preferensi bahasa (i18next)      |
| rima-safety-plan   | SafetyPlan      | Rencana keselamatan pengguna     |

### Hook API — useMood():
```typescript
{
  moods: MoodEntry[],                           // semua moods (reactive)
  addMood(entry: Omit<MoodEntry, 'id'|'createdAt'>): void,
  getMoods(): MoodEntry[],
  getMoodsByDateRange(start: Date, end: Date): MoodEntry[],
  getTodayMood(): MoodEntry | null,
  getWeeklyMoods(): MoodEntry[],
  getMonthlyMoods(): MoodEntry[],
  getMoodStats(): { average: number, trend: 'improving'|'declining'|'stable', streak: number, totalEntries: number },
  deleteMood(id: string): void,
}
```

### Hook API — useTheme():
```typescript
{ theme: Theme, setTheme(t: Theme): void, toggleTheme(): void }
```

### Hook API — useLocalStorage<T>(key, initialValue):
```typescript
[storedValue: T, setValue: (v: T | (prev => T)) => void, removeValue: () => void]
```

## ═══════════════════════════════════════════════════════════════
## 6. TYPE DEFINITIONS (src/types/index.ts)
## ═══════════════════════════════════════════════════════════════

```typescript
type MoodScore = 1 | 2 | 3 | 4 | 5;
type MoodEmoji = '😢' | '😟' | '😐' | '🙂' | '😊';

interface MoodEntry {
  id: string; score: MoodScore; emoji: MoodEmoji;
  note?: string; factors: string[]; createdAt: string;
}

type JournalTemplate = 'free' | 'cbt' | 'gratitude' | 'reflection';
interface JournalEntry {
  id: string; title: string; content: string; template: JournalTemplate;
  moodId?: string; isPrivate: boolean; createdAt: string; updatedAt: string;
}

type ForumCategory = 'anxiety' | 'depression' | 'relationships' | 'work' | 'family' | 'self-care' | 'other';
interface ForumPost {
  id: string; authorName: string; category: ForumCategory; title: string;
  content: string; reactions: Record<string, number>; commentCount: number;
  isFlagged: boolean; createdAt: string;
}

interface ForumComment { id: string; postId: string; authorName: string; content: string; isSupportive: boolean; createdAt: string; }
interface ContactInfo { name: string; phone?: string; relationship?: string; }

interface SafetyPlan {
  id: string; warningSigns: string[]; copingStrategies: string[];
  peopleToContact: ContactInfo[]; professionalContacts: ContactInfo[];
  safeEnvironment: string[]; reasonsToLive: string[]; updatedAt: string;
}

interface CrisisResource { id: string; name: string; phone: string; descriptionId: string; descriptionEn: string; isActive: boolean; }
interface UserProfile { id: string; displayName: string; avatarSeed: string; language: 'id'|'en'; theme: 'dark'|'light'; createdAt: string; }

type Theme = 'dark' | 'light';
type Language = 'id' | 'en';
```

## ═══════════════════════════════════════════════════════════════
## 7. STYLING RULES (WAJIB DIIKUTI)
## ═══════════════════════════════════════════════════════════════

### ❌ JANGAN:
- Menggunakan Tailwind utility classes (flex, p-4, bg-blue-500, dll)
- Inline style berlebihan (kecuali dynamic values)
- Import CSS framework eksternal

### ✅ GUNAKAN:
- CSS classes dari components.css: .btn, .btn-primary, .card, .input, .modal-overlay, .badge, .chip, dll
- CSS custom properties dari design-tokens.css: var(--color-primary), var(--spacing-md), dll
- Page-specific classes dari index.css: .home-page, .mood-selector, .forum-post-card, dll
- Inline style HANYA untuk dynamic values: style={{ color: getMoodColor(score) }}

### Design Tokens (key values):
```css
/* Colors */
--color-primary: hsl(215, 65%, 55%);      /* Soft blue */
--color-secondary: hsl(165, 45%, 50%);    /* Teal */
--color-accent: hsl(270, 50%, 65%);       /* Lavender */
--color-warm: hsl(35, 75%, 60%);          /* Amber */
--color-danger: hsl(0, 65%, 55%);         /* Red (SOS) */

/* Dark mode (default) */
--bg-primary: hsl(220, 25%, 10%);
--bg-card: hsl(220, 20%, 16%);

/* Spacing: xs=4px, sm=8px, md=16px, lg=24px, xl=32px, 2xl=48px */
/* Radius: sm=6px, md=10px, lg=16px, xl=24px, full=9999px */
```

### Component CSS Classes Quick Reference:
```
Buttons:  .btn .btn-primary .btn-secondary .btn-ghost .btn-danger .btn-sm .btn-lg .btn-icon
Cards:    .card .card-glass .card-header .card-body .card-footer
Inputs:   .input .textarea .select
Modals:   .modal-overlay .modal-content .modal-header .modal-body .modal-footer
Badges:   .badge .badge-primary .badge-secondary .badge-warning .badge-danger
Layout:   .app-shell .app-main .app-content .sidebar .bottom-nav
Pages:    .home-page .mood-tracker-page .journal-page .forum-page .profile-page
```

## ═══════════════════════════════════════════════════════════════
## 8. i18n (INTERNATIONALIZATION)
## ═══════════════════════════════════════════════════════════════

- Default language: Bahasa Indonesia ('id')
- Fallback: 'id'
- Detection order: localStorage → navigator
- localStorage key: 'rima-language'

### Cara penggunaan dalam komponen:
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
// t('nav.home')           → "Beranda" atau "Home"
// t('key', 'fallback')    → fallback jika key tidak ada
// i18n.language           → 'id' atau 'en'
// i18n.changeLanguage('en')
```

### Untuk constants (labelId/labelEn — BUKAN i18n keys):
```typescript
// MOOD_EMOJIS, MOOD_FACTORS, FORUM_CATEGORIES punya .labelId dan .labelEn
// Gunakan i18n.language untuk memilih, BUKAN t():
const label = i18n.language === 'en' ? item.labelEn : item.labelId;
```

### Top-level i18n keys (di id.json/en.json):
```
app.name, app.tagline
nav.home, nav.mood, nav.journal, nav.forum, nav.profile
home.howAreYou, home.recentMoods, home.streak
mood.title, mood.howDoYouFeel, mood.factors, mood.save, mood.history
journal.title, journal.newEntry, journal.templates.*
forum.title, forum.newPost, forum.categories.*
profile.title, profile.settings, profile.theme, profile.language
safety.sos, safety.sosSubtitle, safety.callNow, safety.disclaimer
common.save, common.cancel, common.delete, common.close, common.loading
```

## ═══════════════════════════════════════════════════════════════
## 9. CONSTANTS (src/utils/constants.ts)
## ═══════════════════════════════════════════════════════════════

### CRISIS_HOTLINES: CrisisResource[]
```
Into The Light Indonesia  → 119 ext 8
LSM Jangan Bunuh Diri    → 021-9696 9293
Yayasan Pulih            → 021-788-42580
Sejiwa (Kemenkes)        → 119 ext 8
Emergency                → 112
```

### MOOD_EMOJIS: Record<MoodScore, { emoji, labelId, labelEn, color }>
```
1: 😢 "Sangat Buruk" / "Very Bad"    → var(--color-danger)
2: 😟 "Buruk" / "Bad"               → var(--color-warm)
3: 😐 "Biasa" / "Okay"              → var(--color-secondary)
4: 🙂 "Baik" / "Good"               → var(--color-primary)
5: 😊 "Sangat Baik" / "Great"       → var(--color-accent)
```

### MOOD_FACTORS: { id, labelId, labelEn, icon }[]
sleep, exercise, work, social, food, weather, health, family, hobby, meditation

### FORUM_CATEGORIES: { id: ForumCategory, labelId, labelEn, icon, color }[]
anxiety, depression, relationships, work, family, self-care, other

### JOURNAL_TEMPLATES: { id: JournalTemplate, labelId, labelEn, description, prompts }[]
free (no prompts), cbt (4 prompts), gratitude (2 prompts), reflection (2 prompts)

### DAILY_AFFIRMATIONS: { id: string (Indonesian), en: string (English) }[]
15 affirmations. Akses: affirmation.id atau affirmation.en berdasarkan bahasa.

### ANONYMOUS_ADJECTIVES / ANONYMOUS_NOUNS
Untuk generate nama anonim forum: "Brave Butterfly", "Gentle Wave", dll.

## ═══════════════════════════════════════════════════════════════
## 10. UTILITY FUNCTIONS (src/utils/helpers.ts)
## ═══════════════════════════════════════════════════════════════

| Function                | Signature                                         | Return                  |
|-------------------------|---------------------------------------------------|-------------------------|
| getGreeting             | (language: 'id'|'en') → string                    | "Selamat Pagi" / "Good Morning" |
| generateAnonymousName   | () → string                                       | "Brave Butterfly"       |
| formatDate              | (date, language) → string                         | "Senin, 8 Agustus 2026" |
| formatRelativeTime      | (date, language) → string                         | "5 menit yang lalu"     |
| getMoodColor            | (score: number) → string                          | CSS variable string     |
| getMoodTrend            | (moods: MoodEntry[]) → 'improving'|'declining'|'stable' | —              |
| calculateStreak         | (moods: MoodEntry[]) → number                     | consecutive days count  |
| generateId              | () → string                                       | crypto.randomUUID()     |
| debounce                | (fn, delay) → debounced fn                        | —                       |
| clamp                   | (value, min, max) → number                        | clamped value           |

## ═══════════════════════════════════════════════════════════════
## 11. TYPESCRIPT RULES
## ═══════════════════════════════════════════════════════════════

- Strict mode AKTIF
- verbatimModuleSyntax AKTIF → type-only imports WAJIB pakai `import type {}`
  ```typescript
  // ✅ BENAR
  import type { MoodEntry, MoodScore } from '../types';
  import { MOOD_EMOJIS } from '../utils/constants';

  // ❌ SALAH
  import { MoodEntry, MoodScore } from '../types';  // Error!
  ```
- noUnusedLocals & noUnusedParameters AKTIF → hapus semua unused imports
- Target: ES2023, JSX: react-jsx
- Path alias: @/ → src/ (via vite.config.ts, BUKAN tsconfig)

## ═══════════════════════════════════════════════════════════════
## 12. SAFETY RULES (NON-NEGOTIABLE)
## ═══════════════════════════════════════════════════════════════

1. SOSButton HARUS selalu terlihat di semua halaman (z-index: 50+)
2. Crisis hotline data TIDAK BOLEH diubah tanpa verifikasi sumber resmi
3. Disclaimer "bukan pengganti layanan profesional" WAJIB ada
4. Data pengguna disimpan LOKAL — tidak dikirim ke server manapun (saat ini)
5. Forum bersifat ANONIM — tidak ada data identitas yang tersimpan
6. Tidak boleh ada fitur yang memberikan "diagnosis" kesehatan mental

## ═══════════════════════════════════════════════════════════════
## 13. DEVELOPMENT COMMANDS
## ═══════════════════════════════════════════════════════════════

```bash
cd "mental monitoring"
npm run dev          # Dev server → http://localhost:5173/
npm run build        # Production build (tsc + vite build)
npm run preview      # Preview production build
npm run lint         # Linting dengan oxlint

# Manual checks
npx tsc -p tsconfig.app.json --noEmit   # TypeScript type check
```

## ═══════════════════════════════════════════════════════════════
## 14. KNOWN ISSUES & TECH DEBT
## ═══════════════════════════════════════════════════════════════

1. Bundle size 700KB — perlu code splitting (dynamic import untuk pages)
2. Forum & Journal data hanya lokal — belum ada Supabase
3. PWA icons belum ada gambar sebenarnya (hanya folder kosong)
4. Tidak ada unit tests
5. Tidak ada error boundary
6. SafetyPlan component mungkin memerlukan polishing UX lebih lanjut
7. Recharts menambah ~400KB ke bundle — pertimbangkan alternatif ringan

## ═══════════════════════════════════════════════════════════════
## 15. ROADMAP (APA YANG BELUM DIKERJAKAN)
## ═══════════════════════════════════════════════════════════════

### Fase 2 — Backend & Komunitas
- Integrasi Supabase (auth, database, realtime sync)
- Forum realtime dengan moderasi
- Notifikasi & reminder mood check-in
- Export data (PDF/CSV)

### Fase 3 — AI & Edukasi
- NLP crisis detection pada jurnal
- AI mood pattern analysis
- Breathing exercises & guided meditation
- Konten edukasi kesehatan mental
- Escalation: mood buruk → suggest peer support → suggest profesional

### Fase 4 — Skalabilitas
- Bahasa daerah & konteks spiritual/kultural
- Integrasi layanan profesional
- Multi-platform (Android/iOS via Capacitor)
- Analytics dashboard (anonymized) untuk peneliti
