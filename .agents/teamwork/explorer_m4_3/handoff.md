# Handoff Report — explorer_m4_3

**Author**: `explorer_m4_3` (i18n Localization, Design Tokens & Quality Gates Specialist)  
**Date**: 2026-10-10T19:35:00Z  
**Target Recipient**: `orchestrator_4` / worker agents  
**Working Directory**: `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_3`  
**Handoff Type**: Hard (Task complete)

---

## 1. Observation

### 1.1 Existing i18n Architecture & Strict Parity Guardrails
- **Config & Dictionaries**: `src/i18n/config.ts` initializes `i18next` with `react-i18next` and `i18next-browser-languagedetector` with local storage cache key `'rima-language'`.
- **Supported Languages**: Exactly 8 languages are loaded:
  - `id` (Indonesian - default fallback)
  - `en` (English)
  - `jv` (Javanese)
  - `su` (Sundanese)
  - `ja` (Japanese)
  - `zh` (Simplified Chinese)
  - `es` (Spanish)
  - `ar` (Arabic)
- **Parity Test Suite (`src/test/i18nParity.test.ts`)**:
  - Line 51: `all 8 languages have 100% exact key parity with id.json (0 missing keys, 0 extra keys)`.
  - Line 74: `contains no empty strings, nulls, or undefined values across all 8 files`. Every leaf node must be a non-empty string.
  - Line 97, 112: Explicit assertions verifying dedicated namespaces (`jitai`, `safetyCard`).
  - Line 127: Verifies directionality mapping where Arabic (`ar`, `ar-SA`, `ar-EG`) maps to `'rtl'` and all others to `'ltr'`.
- **Current Namespace Inventory**:
  - Current top-level nested namespaces: `app`, `nav`, `home`, `mood`, `journal`, `forum`, `profile`, `safety`, `common`, `insights`, `breathe`, `education`, `escalation`, `crisis`, `professional`, `analytics`, `privacy`, `consent`, `dataWipe`, `disclaimer`, `streak`, `cbt`, `tipp`, `cssrs`, `ba`, `referral`, `sleep`, `moodMeter`, `audio`, `cft`, `jitai`, `safetyCard`, `calmLoader`.
  - No keys currently exist for `landing`, `auth`, or `incognito` in any locale file.

### 1.2 RTL Directionality Handling
- In `src/App.tsx:41-57`:
  ```ts
  const updateDirAndLang = (lng: string) => {
    document.documentElement.dir = (lng && lng.startsWith('ar')) ? 'rtl' : 'ltr';
    document.documentElement.lang = lng || 'id';
  };
  updateDirAndLang(i18n.language || 'id');
  i18n.on('languageChanged', handleLanguageChanged);
  ```
  `document.documentElement.dir` is dynamically set to `'rtl'` for Arabic at runtime.
- In `src/styles/components.css:1275`:
  `[dir="rtl"] .zen-rtl-flip { transform: scaleX(-1); }`
- **Observed RTL Gaps in Existing Styles**:
  - In `src/styles/index.css:218`: `.sidebar` has hardcoded `border-right: 1px solid var(--border-subtle)` and `box-shadow: inset -1px 0 0 0 rgba(255, 255, 255, 0.04)`. Because `.app-shell` is flexbox, in RTL the sidebar is placed on the right, meaning the dividing border should be on the left (`border-inline-end`).
  - Landing page sections, hero alignments, dual CTA buttons, and FAQ accordions require CSS logical properties (`margin-inline-start`, `text-align: start`, flexbox auto-ordering) to render symmetrically in RTL.

### 1.3 CSS Architecture & Zero Tailwind Verification
- Verified `package.json`: No `tailwindcss`, `@tailwindcss/*`, or PostCSS Tailwind plugins in `dependencies` or `devDependencies`.
- Grep search for `tailwind` across `src/` yielded 0 code matches (only policy statements in documentation files `PROJECT.md`, `AGENTS.md`, and `PROJECT_CONTEXT.md`).
- Confirmed design token system in `src/styles/design-tokens.css`:
  - Zen Monastic Dark Mode (`#0C1017` / `#121720` / `#161C26` / `#1E2532`)
  - Apple Health Light Mode (`#F7F8FA` / `#EEF0F4` / `#FFFFFF`)
  - Low-stimulation / calm sensory mode (`[data-sensory='low-stimulation']`, `[data-sensory='calm']`)
  - Modern glassmorphic surfaces (`--bg-glass-card`, `--bg-glass-elevated`, `--bg-glass-subtle`, `--border-glass-rim`)
  - Diffuse ambient elevations (`--shadow-subtle`, `--shadow-card`, `--shadow-elevated`)
  - Micro-radii (`--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`, `--radius-xl: 24px`, `--radius-full: 9999px`)
  - WCAG 2.2 touch target standard: `.btn` enforces `min-height: 48px`, `.btn-sm` enforces `min-height: 44px`.

### 1.4 Baseline Quality Gates Verification
Direct command verification executed on the repository:
1. `npm run lint` (oxlint): **Passed cleanly** — 0 warnings, 0 errors across 130 files in 41ms.
2. `npx tsc -b`: **Passed cleanly** — exit code 0, 0 compilation errors.
3. `npx vitest run`: **Passed cleanly** — 44 test files passed (44/44), 456 tests passed (456/456) in 26.76s.
4. `npm run build`: **Passed cleanly** — production build succeeded in 1.27s, generating 56 precached PWA service worker entries (1840.82 KiB), Rollup cleanly partitioned `i18n-locales` (577.51 kB).
5. SPA hosting configs: `vercel.json` and `netlify.toml` are currently absent (will be authored for R5).

---

## 2. Logic Chain

### 2.1 Translation Key Architecture (85 New Keys)
To support Milestone 4 requirements without namespace pollution or collisions, new translations are segmented into:
1. `landing`: 47 keys (Hero, Dual CTA, 3 Value Pillars, 6 Showcase features, 4 FAQ Q&A pairs, Footer)
2. `auth`: 17 keys (Modal title, subtitle, email label/placeholder, send OTP, checking email status, resend, cancel, back-to-guest, errors, local mode fallback)
3. `incognito`: 10 keys (Active badge, connected badge, toggle aria, switch actions, explanatory tooltips/descriptions, forum notices, pseudonym labels)
4. `nav`: 4 additional keys (`landing`, `guestBannerTitle`, `guestBannerDesc`, `guestBannerAction`)
5. `profile`: 7 additional keys (`landingLink`, `landingLinkDesc`, `accountSection`, `guestStatus`, `authenticatedStatus`, `loginWithAccount`, `logoutAccount`)

All 85 keys have been translated across all 8 languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) with cultural nuances, polite registers (Javanese Krama, Sundanese Lemes, Japanese Keigo, literary Arabic Fusha), and zero empty strings.

### 2.2 Complete 8-Language Dictionary Mappings

#### A. Indonesian (`id.json`)
```json
{
  "landing": {
    "heroBadge": "100% On-Device & Anonim • Bebas Akses",
    "heroTitle": "Ruang Digital Aman untuk Ketenangan Jiwamu",
    "heroSubtitle": "RIMA hadir mendampingi kesehatan mental Anda dengan intervensi berbasis sains klinis, privasi mutlak tanpa pelacakan data, dan kebebasan berekspresi tanpa stigma.",
    "heroTagline": "Tanpa syarat pendaftaran. Mulai rawat dirimu sekarang.",
    "ctaGuest": "Mulai sebagai Tamu Anonim",
    "ctaGuestSub": "1-klik instan • Tanpa registrasi • Data tersimpan lokal",
    "ctaLogin": "Masuk dengan Akun",
    "ctaLoginSub": "Magic Link OTP • Sinkronisasi antar perangkat",
    "continuePrompt": "Sudah pernah berkunjung? Masuk untuk melanjutkan perjalananmu.",
    "pillarsTitle": "Fondasi Keamanan & Integritas Kami",
    "pillarsSubtitle": "Tiga prinsip utama yang menjamin kenyamanan Anda di setiap langkah.",
    "pillar1Title": "Privasi Mutlak & UU PDP",
    "pillar1Desc": "Sepenuhnya patuh UU PDP No. 27/2022. Seluruh catatan jurnal, mood, dan data pribadi dienkripsi dan diproses lokal di perangkat Anda tanpa pelacakan analitik invasif.",
    "pillar1Badge": "Zero-Telemetry",
    "pillar2Title": "Akses Bebas Stigma",
    "pillar2Desc": "Mulai tanpa nomor HP atau nama asli. Jelajahi forum dukungan sebaya dengan nama samaran pelindung identitas dan kendali penuh atas privasi Anda.",
    "pillar2Badge": "100% Anonim",
    "pillar3Title": "Berbasis Bukti Klinis",
    "pillar3Desc": "Metodologi ilmiah teruji: JITAI On-Device Nudges, Yale Mood Meter 2D, Regulasi DBT TIPP, Grounding Somatik 5-4-3-2-1, dan Welas Asih Diri CFT.",
    "pillar3Badge": "Evidence-Based",
    "showcaseTitle": "Fitur yang Dirancang untuk Kesejahteraanmu",
    "showcaseSubtitle": "Alat terintegrasi untuk mengenali diri, menenangkan emosi, dan bertumbuh.",
    "featMoodTitle": "Yale Mood Meter 2D",
    "featMoodDesc": "Petakan spektrum energi dan kenyamanan emosional secara visual, dilengkapi deteksi pola suasana hati.",
    "featJournalTitle": "Jurnal Terenkripsi & CBT",
    "featJournalDesc": "Tuliskan pikiranmu dalam ruang hening terenkripsi lokal dengan panduan kognitif dan refleksi terarah.",
    "featSomaticsTitle": "Regulasi Somatik & Audio",
    "featSomaticsDesc": "Latihan pernapasan koheren (Coherent Breathing) dan soundscape brownian noise untuk meredakan ketegangan sistem saraf.",
    "featCrisisTitle": "Jaring Pengaman Krisis (119 Ext 8)",
    "featCrisisDesc": "Akses instan de-eskalasi darurat, rencana keselamatan personal, dan panggilan langsung ke SEJIWA Kemenkes.",
    "featForumTitle": "Komunitas Sebaya Suportif",
    "featForumDesc": "Berbagi cerita dan dukungan hangat dalam ruang diskusi aman dengan perlindungan identitas otomatis.",
    "featJitaiTitle": "JITAI On-Device Smart Nudge",
    "featJitaiDesc": "Mesin intervensi cerdas di perangkat yang memberikan panduan pemulihan tepat waktu tanpa mengirim data ke server luar.",
    "faqTitle": "Pertanyaan yang Sering Diajukan",
    "faqSubtitle": "Transparansi penuh mengenai privasi, cara kerja, dan komitmen kami.",
    "faq1Q": "Apakah data dan catatan saya benar-benar aman?",
    "faq1A": "Ya. RIMA menerapkan arsitektur offline-first. Data Anda disimpan di penyimpanan lokal peramban (IndexedDB) menggunakan enkripsi perangkat. Tidak ada pelacak pihak ketiga atau penjualan data ke siapapun, sesuai UU PDP No. 27/2022.",
    "faq2Q": "Apakah layanan RIMA berbayar?",
    "faq2A": "RIMA sepenuhnya gratis untuk digunakan oleh seluruh masyarakat. Anda dapat langsung menggunakannya tanpa biaya langganan apa pun.",
    "faq3Q": "Apa perbedaan Mode Tamu Anonim dan Masuk dengan Akun?",
    "faq3A": "Mode Tamu memungkinkan Anda menggunakan semua fitur langsung di peramban tanpa email. Masuk dengan Akun (Magic Link OTP) memungkinkan Anda menyinkronkan data antar-perangkat secara aman saat diinginkan.",
    "faq4Q": "Bagaimana jika saya sedang mengalami krisis emosional darurat?",
    "faq4A": "RIMA menyediakan tombol SOS darurat sekali sentuh di setiap halaman, kartu keselamatan krisis cepat, dan tautan langsung ke layanan hotline darurat resmi Indonesia (119 ext 8 SEJIWA dan 112).",
    "footerBadge": "Kesehatan Jiwa untuk Semua",
    "footerDesc": "RIMA — Ruang Interaksi Mental Aman. Didedikasikan untuk kesehatan mental masyarakat yang inklusif, aman, dan berbasis sains.",
    "footerEnterApp": "Buka Aplikasi Beranda"
  },
  "auth": {
    "modalTitle": "Masuk ke Akun RIMA",
    "modalSubtitle": "Masukkan alamat email Anda untuk menerima tautan masuk satu kali (Magic Link OTP). Bebas kata sandi dan aman.",
    "emailLabel": "Alamat Email",
    "emailPlaceholder": "nama@contoh.com",
    "sendOtpBtn": "Kirim Tautan Masuk (OTP)",
    "sending": "Mengirim tautan...",
    "checkEmailTitle": "Periksa Kotak Masuk Anda",
    "checkEmailDesc": "Kami telah mengirim tautan masuk ajaib ke {{email}}. Klik tautan tersebut di peramban Anda untuk masuk.",
    "resendBtn": "Kirim Ulang Email",
    "resendSuccess": "Tautan baru berhasil dikirim!",
    "backToGuest": "Lanjutkan sebagai Tamu Anonim",
    "cancel": "Batal",
    "invalidEmail": "Mohon masukkan format email yang valid.",
    "errorTitle": "Gagal Mengirim Tautan",
    "errorGeneric": "Terjadi kesalahan saat mengirim tautan. Silakan coba beberapa saat lagi.",
    "localModeWarning": "Layanan cloud belum terhubung. Aplikasi tetap beroperasi penuh dalam mode lokal privat.",
    "successLoggedIn": "Berhasil masuk ke akun Anda!"
  },
  "incognito": {
    "activeBadge": "Mode Anonim Aktif",
    "connectedBadge": "Akun Terhubung",
    "toggleAria": "Beralih antara Mode Anonim dan Akun Terhubung",
    "turnOn": "Aktifkan Mode Anonim",
    "turnOff": "Gunakan Akun Terhubung",
    "statusActiveDesc": "Identitas akun disembunyikan. Anda tampil sebagai nama samaran di forum, dan data tersimpan privat.",
    "statusInactiveDesc": "Akun terhubung sedang digunakan. Klik untuk mengaktifkan penyamaran identitas instan.",
    "forumNotice": "Mode Anonim aktif: Anda berdiskusi dengan nama samaran pelindung identitas.",
    "pseudonymLabel": "Nama Samaran Anda",
    "switchPrompt": "Ingin menyembunyikan identitas Anda?"
  },
  "nav": {
    "landing": "Tentang RIMA",
    "guestBannerTitle": "Mode Tamu Anonim",
    "guestBannerDesc": "Data tersimpan privat di peramban ini.",
    "guestBannerAction": "Hubungkan Akun"
  },
  "profile": {
    "landingLink": "Tentang RIMA (Landing Page)",
    "landingLinkDesc": "Pelajari kembali nilai privasi, bukti klinis, dan visi RIMA.",
    "accountSection": "Status Akun & Identitas",
    "guestStatus": "Tamu Anonim (Hanya Perangkat Ini)",
    "authenticatedStatus": "Akun Terhubung: {{email}}",
    "loginWithAccount": "Hubungkan Akun (Magic Link)",
    "logoutAccount": "Keluar dari Akun"
  }
}
```

#### B. English (`en.json`)
```json
{
  "landing": {
    "heroBadge": "100% On-Device & Anonymous • Open Access",
    "heroTitle": "A Safe Digital Sanctuary for Your Peace of Mind",
    "heroSubtitle": "RIMA accompanies your mental well-being with clinically proven interventions, zero data tracking for absolute privacy, and stigma-free self-expression.",
    "heroTagline": "No sign-up required. Start caring for yourself right now.",
    "ctaGuest": "Start as Anonymous Guest",
    "ctaGuestSub": "1-click instant • No registration • Local storage only",
    "ctaLogin": "Sign In with Account",
    "ctaLoginSub": "Magic Link OTP • Multi-device sync",
    "continuePrompt": "Visited before? Sign in to continue your journey.",
    "pillarsTitle": "Our Pillars of Safety & Integrity",
    "pillarsSubtitle": "Three core principles ensuring your peace of mind at every step.",
    "pillar1Title": "Absolute Privacy & Data Protection",
    "pillar1Desc": "Fully compliant with Indonesian PDP Law No. 27/2022. All journal entries, moods, and personal data are encrypted and processed locally on your device without invasive tracking.",
    "pillar1Badge": "Zero-Telemetry",
    "pillar2Title": "Stigma-Free Access",
    "pillar2Desc": "Start without phone numbers or real names. Browse peer support forums with privacy-shielding pseudonyms and complete control over your identity.",
    "pillar2Badge": "100% Anonymous",
    "pillar3Title": "Clinically Evidence-Based",
    "pillar3Desc": "Scientifically validated methodologies: JITAI On-Device Nudges, Yale Mood Meter 2D, DBT TIPP Crisis Skills, Somatic 5-4-3-2-1 Grounding, and Compassion Focused Therapy (CFT).",
    "pillar3Badge": "Evidence-Based",
    "showcaseTitle": "Features Crafted for Your Well-Being",
    "showcaseSubtitle": "Integrated tools to understand yourself, soothe emotions, and grow.",
    "featMoodTitle": "Yale Mood Meter 2D",
    "featMoodDesc": "Visually map your energy and pleasantness spectrum with intelligent mood trajectory detection.",
    "featJournalTitle": "Encrypted Journal & CBT",
    "featJournalDesc": "Express your thoughts in a locally encrypted quiet space with cognitive restructuring prompts.",
    "featSomaticsTitle": "Somatic Regulation & Soundscapes",
    "featSomaticsDesc": "Coherent breathing pacing and Brownian noise soundscapes to calm nervous system arousal.",
    "featCrisisTitle": "Crisis Safety Net (119 Ext 8)",
    "featCrisisDesc": "One-tap acute de-escalation, personal safety plan, and direct toll-free emergency helpline access.",
    "featForumTitle": "Supportive Peer Community",
    "featForumDesc": "Share experiences and receive empathetic support in safe moderation with automatic pseudonym protection.",
    "featJitaiTitle": "JITAI On-Device Smart Nudge",
    "featJitaiDesc": "On-device intelligence delivering timely, contextual micro-interventions without transmitting data to external servers.",
    "faqTitle": "Frequently Asked Questions",
    "faqSubtitle": "Full transparency on privacy, architecture, and our clinical commitments.",
    "faq1Q": "Is my personal data and journaling truly private and secure?",
    "faq1A": "Yes. RIMA uses an offline-first architecture. Your data is stored directly in your browser's local IndexedDB with device-level cryptography. There is zero third-party tracking, profiling, or data brokering, strictly complying with UU PDP No. 27/2022.",
    "faq2Q": "Is RIMA free to use?",
    "faq2A": "RIMA is completely free and accessible to everyone. You can start immediately without any subscription fees or paywalls.",
    "faq3Q": "What is the difference between Anonymous Guest and Account Login?",
    "faq3A": "Guest Mode allows you to use all tools immediately in your browser without an email. Signing in with an account (Magic Link OTP) enables optional secure synchronization across multiple devices.",
    "faq4Q": "What if I am experiencing an acute emotional emergency or crisis?",
    "faq4A": "RIMA features a persistent one-touch emergency SOS button, an acute Fast-Action Safety Card, and immediate direct links to official toll-free hotlines (119 ext 8 SEJIWA and 112).",
    "footerBadge": "Mental Well-Being for Everyone",
    "footerDesc": "RIMA — Ruang Interaksi Mental Aman. Dedicated to inclusive, secure, and evidence-based mental health for all.",
    "footerEnterApp": "Open Main Dashboard"
  },
  "auth": {
    "modalTitle": "Sign in to Your RIMA Account",
    "modalSubtitle": "Enter your email address to receive a secure one-time sign-in link (Magic Link OTP). No password required.",
    "emailLabel": "Email Address",
    "emailPlaceholder": "name@example.com",
    "sendOtpBtn": "Send Sign-in Link (OTP)",
    "sending": "Sending sign-in link...",
    "checkEmailTitle": "Check Your Inbox",
    "checkEmailDesc": "We have sent a magic sign-in link to {{email}}. Click the link in your browser to complete sign-in.",
    "resendBtn": "Resend Email",
    "resendSuccess": "New link sent successfully!",
    "backToGuest": "Continue as Anonymous Guest",
    "cancel": "Cancel",
    "invalidEmail": "Please enter a valid email address.",
    "errorTitle": "Failed to Send Sign-in Link",
    "errorGeneric": "An error occurred while sending the link. Please try again shortly.",
    "localModeWarning": "Cloud backend not connected. App continues running fully in local private mode.",
    "successLoggedIn": "Successfully signed in to your account!"
  },
  "incognito": {
    "activeBadge": "Anonymous Mode Active",
    "connectedBadge": "Account Connected",
    "toggleAria": "Toggle between Anonymous Mode and Connected Account",
    "turnOn": "Turn On Anonymous Mode",
    "turnOff": "Use Connected Account",
    "statusActiveDesc": "Account identity hidden. You appear under a protective pseudonym in forums, keeping data private.",
    "statusInactiveDesc": "Connected account is active. Click to switch to instant privacy shielding.",
    "forumNotice": "Anonymous Mode active: You are participating under a privacy-shielding pseudonym.",
    "pseudonymLabel": "Your Pseudonym",
    "switchPrompt": "Want to protect your identity?"
  },
  "nav": {
    "landing": "About RIMA",
    "guestBannerTitle": "Anonymous Guest Mode",
    "guestBannerDesc": "Data stored privately in this browser.",
    "guestBannerAction": "Connect Account"
  },
  "profile": {
    "landingLink": "About RIMA (Landing Page)",
    "landingLinkDesc": "Revisit RIMA's privacy commitments, clinical evidence, and mission.",
    "accountSection": "Account Status & Identity",
    "guestStatus": "Anonymous Guest (This Device Only)",
    "authenticatedStatus": "Connected Account: {{email}}",
    "loginWithAccount": "Connect Account (Magic Link)",
    "logoutAccount": "Sign Out of Account"
  }
}
```

#### C. Javanese (`jv.json`)
```json
{
  "landing": {
    "heroBadge": "100% Ing-Piranti & Anonim • Bebas Akses",
    "heroTitle": "Papan Digital Aman kagem Katentreman Jiwa Panjenengan",
    "heroSubtitle": "RIMA rawuh ngancani kasarasan mental panjenengan kanthi intervensi dhasar ngelmu klinis, privasi tanpa lacak data, lan kabebasan berekspresi tanpa stigma.",
    "heroTagline": "Tanpa sarat ndhaftar. Mangga rawat dhiri panjenengan sapunika.",
    "ctaGuest": "Miwiti minangka Dhayoh Anonim",
    "ctaGuestSub": "1-klik cepet • Tanpa registrasi • Data kasimpen ing piranti",
    "ctaLogin": "Mlebu nganggo Akun",
    "ctaLoginSub": "Magic Link OTP • Sinkronisasi antar piranti",
    "continuePrompt": "Sampun nate rawuh? Mlebu kagem nglajengaken lelampahan panjenengan.",
    "pillarsTitle": "Pilar Katentreman & Integritas Kita",
    "pillarsSubtitle": "Tiga paugeran baku ingkang njamin katentreman panjenengan ing saben langkah.",
    "pillar1Title": "Privasi Sampurna & UU PDP",
    "pillar1Desc": "Mituhu UU PDP No. 27/2022. Sedaya cathetan jurnal, raos mood, lan data pribadi dipun-enkripsi lan dipun-olah lokal ing piranti panjenengan tanpa pelacakan analitik.",
    "pillar1Badge": "Nol-Telemetri",
    "pillar2Title": "Akses Bebas Stigma",
    "pillar2Desc": "Miwiti tanpa nomer telepon utawi asma asli. Njelajahi forum panyengkuyung kanthi asma samaran panutup identitas lan kontrol wutuh tumrap privasi panjenengan.",
    "pillar2Badge": "100% Anonim",
    "pillar3Title": "Adhedhasar Bukti Klinis",
    "pillar3Desc": "Metodologi ilmiah ingkang kabukten: JITAI Nudges ing piranti, Yale Mood Meter 2D, Regulasi DBT TIPP, Grounding Somatik 5-4-3-2-1, lan Welas Asih Diri CFT.",
    "pillar3Badge": "Bukti Ilmiah",
    "showcaseTitle": "Fitur ingkang Karancang kagem Katentreman Panjenengan",
    "showcaseSubtitle": "Piranti terpadu kagem mangertosi dhiri, ngleremaken emosi, lan ngrembaka.",
    "featMoodTitle": "Yale Mood Meter 2D",
    "featMoodDesc": "Pethakaken spektrum energi lan kenyamanan emosional kanthi visual lan deteksi pola raos.",
    "featJournalTitle": "Jurnal Dienkripsi & CBT",
    "featJournalDesc": "Serat pamikiran panjenengan ing papan ayem mawi enkripsi lokal lan tuntunan kognitif.",
    "featSomaticsTitle": "Regulasi Somatik & Audio",
    "featSomaticsDesc": "Latihan napas koheren lan swara brownian noise kagem ngleremaken tegange sistem saraf.",
    "featCrisisTitle": "Jaring Kaslametan Krisis (119 Ext 8)",
    "featCrisisDesc": "Akses cepet de-eskalasi darurat, rencana kaslametan pribadi, lan telpon langsung menyang SEJIWA Kemenkes.",
    "featForumTitle": "Komunitas Panyengkuyung Sebaya",
    "featForumDesc": "Crita lan tampa panyengkuyung anget ing papan pirembagan kanthi pangreksan asma samaran.",
    "featJitaiTitle": "JITAI Smart Nudge Ing-Piranti",
    "featJitaiDesc": "Mesin intervensi pinter ing piranti ingkang maringi pitedah pas wekdal tanpa ngirim data dhateng server jawi.",
    "faqTitle": "Pitakon ingkang Kerep Dipuntakokaken",
    "faqSubtitle": "Katrangan cetha babagan privasi, cara makarya, lan komitmen kita.",
    "faq1Q": "Punapa data lan cathetan kula saestu aman lan pribadi?",
    "faq1A": "Inggih. RIMA ngginakaken arsitektur offline-first. Sedaya data kasimpen ing memori lokal peramban (IndexedDB) mawi enkripsi piranti. Mboten wonten pelacakan pihak katelu mituhu UU PDP No. 27/2022.",
    "faq2Q": "Punapa layanan RIMA punika mbayar?",
    "faq2A": "RIMA punika gratis kagem sedaya masyarakat. Panjenengan saged langsung migunakaken tanpa wragad langganan punapa kemawon.",
    "faq3Q": "Punapa bentenipun Mode Dhayoh Anonim kaliyan Mlebu nganggo Akun?",
    "faq3A": "Mode Dhayoh saged dipunginakaken langsung tanpa email. Mlebu nganggo Akun (Magic Link OTP) migunani menawi panjenengan kepengin nyinkronaken data ing piranti sanes.",
    "faq4Q": "Kados pundi menawi kula nembe ngalami krisis emosi darurat?",
    "faq4A": "RIMA nyawisaken tombol SOS darurat ing saben kaca, kertu kaslametan krisis cepet, lan sambungan langsung dhateng hotline darurat resmi (119 ext 8 SEJIWA lan 112).",
    "footerBadge": "Kasarasan Jiwa kagem Sedaya",
    "footerDesc": "RIMA — Ruang Interaksi Mental Aman. Katur kagem kasarasan mental masyarakat ingkang inklusif, aman, lan dhasar sains.",
    "footerEnterApp": "Bikak Dasbor Beranda"
  },
  "auth": {
    "modalTitle": "Mlebu dhateng Akun RIMA",
    "modalSubtitle": "Lebokaken alamat email panjenengan kagem nampi tautan mlebu sepisan (Magic Link OTP). Tanpa tembung sandi lan aman.",
    "emailLabel": "Alamat Email",
    "emailPlaceholder": "nama@tuladha.com",
    "sendOtpBtn": "Kirim Tautan Mlebu (OTP)",
    "sending": "Ngintun tautan...",
    "checkEmailTitle": "Priksa Kothak Masuk Panjenengan",
    "checkEmailDesc": "Kita sampun ngirim tautan mlebu dhateng {{email}}. Mangga klik tautan punika kagem mlebu.",
    "resendBtn": "Kirim Wulang Email",
    "resendSuccess": "Tautan enggal kasil kakintun!",
    "backToGuest": "Lajengaken minangka Dhayoh Anonim",
    "cancel": "Batal",
    "invalidEmail": "Mangga lebetaken format email ingkang bener.",
    "errorTitle": "Gagal Ngirim Tautan",
    "errorGeneric": "Wonten kaluputan nalika ngirim tautan. Mangga nyobi malih mangke.",
    "localModeWarning": "Layanan cloud dereng kasambung. Aplikasi tetep mlaku ing mode lokal privat.",
    "successLoggedIn": "Kasil mlebu dhateng akun panjenengan!"
  },
  "incognito": {
    "activeBadge": "Mode Anonim Aktif",
    "connectedBadge": "Akun Kasambung",
    "toggleAria": "Gantos antawis Mode Anonim lan Akun Kasambung",
    "turnOn": "Aktifaken Mode Anonim",
    "turnOff": "Ginani Akun Kasambung",
    "statusActiveDesc": "Identitas akun kasimpen. Panjenengan katingal minangka asma samaran ing forum, lan data privat.",
    "statusInactiveDesc": "Akun kasambung nembe dipunginakaken. Klik kagem ngaktifaken penyamaran cepet.",
    "forumNotice": "Mode Anonim aktif: Panjenengan pirembagan mawi asma samaran pangreksa identitas.",
    "pseudonymLabel": "Asma Samaran Panjenengan",
    "switchPrompt": "Kepingin nyimpen identitas panjenengan?"
  },
  "nav": {
    "landing": "Babagan RIMA",
    "guestBannerTitle": "Mode Dhayoh Anonim",
    "guestBannerDesc": "Data kasimpen privat ing piranti punika.",
    "guestBannerAction": "Sambungaken Akun"
  },
  "profile": {
    "landingLink": "Babagan RIMA (Kaca Utama)",
    "landingLinkDesc": "Sinau malih paugeran privasi, bukti klinis, lan gegayuhan RIMA.",
    "accountSection": "Status Akun & Identitas",
    "guestStatus": "Dhayoh Anonim (Namung Piranti Punika)",
    "authenticatedStatus": "Akun Kasambung: {{email}}",
    "loginWithAccount": "Sambungaken Akun (Magic Link)",
    "logoutAccount": "Medal saking Akun"
  }
}
```

#### D. Sundanese (`su.json`)
```json
{
  "landing": {
    "heroBadge": "100% Dina-Alat & Anonim • Bebas Akses",
    "heroTitle": "Rohangan Digital Aman pikeun Katengtreman Jiwa Anjeun",
    "heroSubtitle": "RIMA hadir marengan kaséhatan méntal anjeun kalayan interwénsi dumasar élmu klinis, privasi mutlak tanpa ngalacak data, sareng kabébasan éksprési tanpa stigma.",
    "heroTagline": "Tanpa syarat daptar. Mimitian ngarawat diri anjeun ayeuna.",
    "ctaGuest": "Mimitian salaku Sémah Anonim",
    "ctaGuestSub": "1-klik instan • Tanpa régistrasi • Data disimpen sacara lokal",
    "ctaLogin": "Asup nganggo Akun",
    "ctaLoginSub": "Magic Link OTP • Sinkronisasi antar alat",
    "continuePrompt": "Parantos kantos sumping? Asup pikeun neraskeun lalampahan anjeun.",
    "pillarsTitle": "Pilar Kasalametan & Integritas Kami",
    "pillarsSubtitle": "Tilu prinsip utama anu ngajamin katengtreman anjeun dina unggal léngkah.",
    "pillar1Title": "Privasi Mutlak & UU PDP",
    "pillar1Desc": "Sapinuhna patuh kana UU PDP No. 27/2022. Sadaya catetan jurnal, mood, sareng data pribadi diénkripsi sarta diolah sacara lokal dina alat anjeun tanpa palacakan analitik.",
    "pillar1Badge": "Nol-Telemetri",
    "pillar2Title": "Aksés Bebas Stigma",
    "pillar2Desc": "Mimitian tanpa nomer telepon atanapi nami asli. Jelajahi forum rojongan réncang kalayan nami samaran panyalindung idéntitas sareng kontrol pinuh kana privasi anjeun.",
    "pillar2Badge": "100% Anonim",
    "pillar3Title": "Dumasar Bukti Klinis",
    "pillar3Desc": "Métodologi ilmiah anu parantos kabuktosan: JITAI Nudges dina alat, Yale Mood Meter 2D, Regulasi DBT TIPP, Grounding Somatik 5-4-3-2-1, sareng Welas Asih Diri CFT.",
    "pillar3Badge": "Bukti Ilmiah",
    "showcaseTitle": "Fitur anu Dirancang pikeun Kasalametan Anjeun",
    "showcaseSubtitle": "Alat terpadu pikeun mikawanoh diri, ngareureuhkeun émosi, sareng tumuwuh.",
    "featMoodTitle": "Yale Mood Meter 2D",
    "featMoodDesc": "Petakeun spéktrum énérgi sareng kanyamanan émosional sacara visual kalayan deteksi pola rasa.",
    "featJournalTitle": "Jurnal Diénkripsi & CBT",
    "featJournalDesc": "Tulis pikiran anjeun dina rohangan tengtrem anu diénkripsi lokal kalayan panduan kognitif.",
    "featSomaticsTitle": "Regulasi Somatik & Audio",
    "featSomaticsDesc": "Latihan napas kohéren sareng soundscape brownian noise pikeun ngurangan katégangan saraf.",
    "featCrisisTitle": "Jaring Kasalametan Krisis (119 Ext 8)",
    "featCrisisDesc": "Aksés instan de-éscalasi darurat, rencana kasalametan pribadi, sareng telepon langsung ka SEJIWA Kemenkes.",
    "featForumTitle": "Komunitas Rojongan Babaturan",
    "featForumDesc": "Babagi carita sareng nampi pangrojong haneut dina rohangan sawala kalayan panyalindungan nami samaran.",
    "featJitaiTitle": "JITAI Smart Nudge Dina-Alat",
    "featJitaiDesc": "Mesin interwénsi pinter dina alat anu masihan pituduh dina waktos anu merenah tanpa ngirim data ka sérver luar.",
    "faqTitle": "Patarosan anu Sering Ditaroskeun",
    "faqSubtitle": "Katerangan jéntré ngeunaan privasi, cara damel, sareng komitmen kami.",
    "faq1Q": "Naha data sareng catetan abdi leres-leres aman tur pribadi?",
    "faq1A": "Sumuhun. RIMA nerapkeun arsitéktur offline-first. Sadaya data disimpen dina panyimpenan lokal panyungsi (IndexedDB) nganggo énkripsi alat. Henteu aya palacak pihak katilu luyu sareng UU PDP No. 27/2022.",
    "faq2Q": "Naha layanan RIMA ieu kedah mayar?",
    "faq2A": "RIMA sapinuhna gratis dianggo ku sadaya masarakat. Anjeun tiasa langsung ngagunakeunana tanpa biaya langganan naon waé.",
    "faq3Q": "Naon bédana Mode Sémah Anonim sareng Asup nganggo Akun?",
    "faq3A": "Mode Sémah ngidinan anjeun langsung nganggo sadaya fitur dina panyungsi tanpa email. Asup nganggo Akun (Magic Link OTP) ngabantosan sinkronisasi data antar-alat kalayan aman.",
    "faq4Q": "Kumaha upami abdi nuju ngalaman krisis émosional darurat?",
    "faq4A": "RIMA nyayogikeun tombol SOS darurat dina unggal kaca, kartu kasalametan krisis gancang, sareng sambungan langsung ka hotline darurat resmi (119 ext 8 SEJIWA sareng 112).",
    "footerBadge": "Kaséhatan Jiwa pikeun Sadayana",
    "footerDesc": "RIMA — Ruang Interaksi Mental Aman. Didédikasikeun pikeun kaséhatan méntal masarakat anu inklusif, aman, sareng dumasar sains.",
    "footerEnterApp": "Buka Dasbor Utama"
  },
  "auth": {
    "modalTitle": "Asup kana Akun RIMA",
    "modalSubtitle": "Lebetkeun alamat email anjeun pikeun nampi tautan asup sakali (Magic Link OTP). Tanpa kecap konci sareng aman.",
    "emailLabel": "Alamat Email",
    "emailPlaceholder": "nami@conto.com",
    "sendOtpBtn": "Kirim Tautan Asup (OTP)",
    "sending": "Ngangkut tautan...",
    "checkEmailTitle": "Pariksa Kotak Masuk Anjeun",
    "checkEmailDesc": "Kami parantos ngirim tautan asup ka {{email}}. Klik tautan éta dina panyungsi anjeun pikeun asup.",
    "resendBtn": "Kirim Deui Email",
    "resendSuccess": "Tautan énggal parantos dikirim!",
    "backToGuest": "Teraskeun salaku Sémah Anonim",
    "cancel": "Batal",
    "invalidEmail": "Punten lebetkeun format email anu leres.",
    "errorTitle": "Gagal Ngirim Tautan",
    "errorGeneric": "Aya kasalahan nalika ngirim tautan. Punten cobi deui sakedap deui.",
    "localModeWarning": "Layanan cloud teu acan nyambung. Aplikasi tetep jalan dina mode lokal pribadi.",
    "successLoggedIn": "Parantos suksés asup kana akun anjeun!"
  },
  "incognito": {
    "activeBadge": "Mode Anonim Aktif",
    "connectedBadge": "Akun Nyambung",
    "toggleAria": "Pindah antawis Mode Anonim sareng Akun Nyambung",
    "turnOn": "Aktipkeun Mode Anonim",
    "turnOff": "Paké Akun Nyambung",
    "statusActiveDesc": "Idéntitas akun disumputkeun. Anjeun katingal salaku nami samaran dina forum, sareng data privat.",
    "statusInactiveDesc": "Akun nyambung nuju dianggo. Klik pikeun ngaktipkeun panyalindungan idéntitas instan.",
    "forumNotice": "Mode Anonim aktip: Anjeun sawala kalayan nami samaran panyalindung idéntitas.",
    "pseudonymLabel": "Nami Samaran Anjeun",
    "switchPrompt": "Hoyong nyumputkeun idéntitas anjeun?"
  },
  "nav": {
    "landing": "Ngeunaan RIMA",
    "guestBannerTitle": "Mode Sémah Anonim",
    "guestBannerDesc": "Data disimpen pribadi dina panyungsi ieu.",
    "guestBannerAction": "Sambungkeun Akun"
  },
  "profile": {
    "landingLink": "Ngeunaan RIMA (Kaca Utama)",
    "landingLinkDesc": "Diajar deui komitmen privasi, bukti klinis, sareng visi RIMA.",
    "accountSection": "Status Akun & Idéntitas",
    "guestStatus": "Sémah Anonim (Mung Alat Ieu)",
    "authenticatedStatus": "Akun Nyambung: {{email}}",
    "loginWithAccount": "Sambungkeun Akun (Magic Link)",
    "logoutAccount": "Kaluar tina Akun"
  }
}
```

#### E. Japanese (`ja.json`)
```json
{
  "landing": {
    "heroBadge": "100% オンデバイス＆完全匿名 • アクセス自由",
    "heroTitle": "あなたの心に平穏をもたらす安全なデジタル空間",
    "heroSubtitle": "RIMAは臨床科学に基づく介入、データ追跡ゼロの完全なプライバシー、そして偏見のない自己表現であなたのメンタルヘルスに寄り添います。",
    "heroTagline": "登録不要。今すぐ自分を大切にする一歩を。",
    "ctaGuest": "匿名ゲストとして始める",
    "ctaGuestSub": "1クリック即時利用 • 登録不要 • データは端末内にのみ保存",
    "ctaLogin": "アカウントでログイン",
    "ctaLoginSub": "マジックリンクOTP • 端末間同期",
    "continuePrompt": "ご利用中の方はこちら。ログインして記録を再開します。",
    "pillarsTitle": "安心と誠実さを支える3つの柱",
    "pillarsSubtitle": "あらゆる段階であなたのプライバシーと安心を保護する3つの原則。",
    "pillar1Title": "完全なプライバシーとUU PDP準拠",
    "pillar1Desc": "インドネシア個人情報保護法（UU PDP No. 27/2022）に完全準拠。日記、気分、個人データはすべて端末内で暗号化・処理され、侵襲的な追跡は一切行われません。",
    "pillar1Badge": "テレメトリ完全ゼロ",
    "pillar2Title": "スティグマのない安全な体験",
    "pillar2Desc": "電話番号や本名の登録は一切不要。プライバシーを守る仮名でピアサポートフォーラムに参加し、自分のアイデンティティを完全に管理できます。",
    "pillar2Badge": "100% 完全匿名",
    "pillar3Title": "臨床科学に基づく証拠ベース",
    "pillar3Desc": "科学的に実証された手法を採用：オンデバイスJITAIナッジ、イェール大学ムードメーター2D、DBT TIPP危機管理、5-4-3-2-1身体グラウンディング、コンパッション・フォーカスト・セラピー（CFT）。",
    "pillar3Badge": "エビデンスに基づく",
    "showcaseTitle": "心身の調和のために設計された機能",
    "showcaseSubtitle": "自分を深く知り、感情を穏やかに整え、成長するための総合ツール。",
    "featMoodTitle": "イェール大学ムードメーター2D",
    "featMoodDesc": "エネルギーと心地よさの軸で感情を視覚化し、気分の変化パターンを穏やかに把握します。",
    "featJournalTitle": "暗号化ジャーナルとCBT思考記録",
    "featJournalDesc": "端末内暗号化された静かな空間で、認知の歪みを和らげる内省ガイドと共に想いを綴ります。",
    "featSomaticsTitle": "身体ソマティック調整＆サウンドスケープ",
    "featSomaticsDesc": "自律神経を整えるコヒーレント呼吸法と、安らぎをもたらすブラウンノイズ音源を搭載。",
    "featCrisisTitle": "緊急セーフティネット（119 Ext 8）",
    "featCrisisDesc": "即時アクセス可能な感情鎮静ステップ、個人安全プラン、公的相談窓口へのダイレクト発信。",
    "featForumTitle": "温かなピアサポートコミュニティ",
    "featForumDesc": "自動仮名保護により身元を明かさず、温かく共感に満ちたコミュニティで想いを分かち合えます。",
    "featJitaiTitle": "オンデバイスJITAIスマートナッジ",
    "featJitaiDesc": "外部サーバーへデータを送信することなく、適切なタイミングで寄り添うマイクロ介入を端末内で生成。",
    "faqTitle": "よくあるご質問（FAQ）",
    "faqSubtitle": "プライバシー保護、仕組み、私たちの約束に関する明確な情報。",
    "faq1Q": "私の記録や個人データは本当に安全で非公開ですか？",
    "faq1A": "はい。RIMAはオフラインファースト設計を採用しています。データはすべてブラウザ内のローカルIndexedDBに暗号化保存され、外部トラッカーや広告へのデータ送信・販売は一切ありません（UU PDP準拠）。",
    "faq2Q": "RIMAは無料で利用できますか？",
    "faq2A": "RIMAはすべての機能を完全無料でご利用いただけます。有料サブスクリプションや機能制限は一切ありません。",
    "faq3Q": "「匿名ゲストモード」と「アカウントログイン」の違いは何ですか？",
    "faq3A": "ゲストモードはメール不要で今すぐ全機能をご利用いただけます。アカウントログイン（OTPリンク）を行うと、複数端末間での安全なデータ同期が可能になります。",
    "faq4Q": "緊急の心理的危機や強い苦痛を感じている場合はどうすればよいですか？",
    "faq4A": "RIMAには画面常駐の1タップSOSボタン、迅速行動セーフティカード、および公的緊急ホットライン（119 Ext 8、112）への直接通話リンクが備わっています。",
    "footerBadge": "すべての人に心の健康を",
    "footerDesc": "RIMA — Ruang Interaksi Mental Aman。誰もが安心して利用できる、科学的根拠に基づいたメンタルウェルビーイング空間。",
    "footerEnterApp": "メインダッシュボードを開く"
  },
  "auth": {
    "modalTitle": "RIMAアカウントにログイン",
    "modalSubtitle": "メールアドレスを入力して、ワンタイムログインリンク（マジックリンクOTP）を受信します。パスワード不要で安全です。",
    "emailLabel": "メールアドレス",
    "emailPlaceholder": "name@example.com",
    "sendOtpBtn": "ログインリンク（OTP）を送信",
    "sending": "リンクを送信中...",
    "checkEmailTitle": "メールをご確認ください",
    "checkEmailDesc": "{{email}} 宛てにログインリンクを送信しました。メール内のリンクをクリックしてログインを完了してください。",
    "resendBtn": "メールを再送信",
    "resendSuccess": "新しいログインリンクを送信しました。",
    "backToGuest": "匿名ゲストとして続ける",
    "cancel": "キャンセル",
    "invalidEmail": "有効なメールアドレスを入力してください。",
    "errorTitle": "リンクの送信に失敗しました",
    "errorGeneric": "送信中にエラーが発生しました。しばらくしてからもう一度お試しください。",
    "localModeWarning": "クラウド機能は未設定です。アプリは端末内の完全ローカルモードで動作します。",
    "successLoggedIn": "アカウントに正常にサインインしました！"
  },
  "incognito": {
    "activeBadge": "匿名モード有効",
    "connectedBadge": "アカウント連携中",
    "toggleAria": "匿名モードとアカウント連携の切り替え",
    "turnOn": "匿名モードをオンにする",
    "turnOff": "連携アカウントを使用",
    "statusActiveDesc": "アカウントの個人情報を非公開にしています。フォーラムでは保護用の仮名で表示されます。",
    "statusInactiveDesc": "連携アカウントを使用中です。クリックすると即座に匿名保護に切り替わります。",
    "forumNotice": "匿名モード有効：保護用仮名でディスカッションに参加しています。",
    "pseudonymLabel": "あなたの仮名",
    "switchPrompt": "アイデンティティを保護しますか？"
  },
  "nav": {
    "landing": "RIMAについて",
    "guestBannerTitle": "匿名ゲストモード",
    "guestBannerDesc": "データはこのブラウザ内にのみ非公開で保存されます。",
    "guestBannerAction": "アカウントを連携"
  },
  "profile": {
    "landingLink": "RIMAについて（紹介ページ）",
    "landingLinkDesc": "RIMAのプライバシー理念、臨床的エビデンス、基本方針を確認します。",
    "accountSection": "アカウント状態とアイデンティティ",
    "guestStatus": "匿名ゲスト（この端末のみ）",
    "authenticatedStatus": "連携アカウント：{{email}}",
    "loginWithAccount": "アカウントを連携（マジックリンク）",
    "logoutAccount": "アカウントからログアウト"
  }
}
```

#### F. Chinese (`zh.json`)
```json
{
  "landing": {
    "heroBadge": "100% 本地端运行 & 匿名保护 • 开放使用",
    "heroTitle": "守护心灵安宁的安全数字避风港",
    "heroSubtitle": "RIMA 结合临床循证干预、零数据追踪的绝对隐私保护与无偏见的表达自由，全天候守护您的心理健康。",
    "heroTagline": "无需繁琐注册。现在就开始关爱自己的心灵。",
    "ctaGuest": "以匿名访客身份开始",
    "ctaGuestSub": "一键即刻开始 • 无需注册 • 数据仅保存在本地设备",
    "ctaLogin": "使用账户登录",
    "ctaLoginSub": "Magic Link 邮件动态码 • 多端跨设备同步",
    "continuePrompt": "已经是老朋友了？登录以继续您的心灵旅程。",
    "pillarsTitle": "三大安全与信任基石",
    "pillarsSubtitle": "三大核心设计原则，在每一步陪伴中保障您的无忧体验。",
    "pillar1Title": "绝对隐私与个人数据保护法合规",
    "pillar1Desc": "完全符合印尼个人数据保护法（UU PDP 27/2022）。所有日记、心情记录和个人数据均在本地加密与运算，绝无侵入式商业追踪。",
    "pillar1Badge": "零后台遥测",
    "pillar2Title": "远离偏见的包容空间",
    "pillar2Desc": "无需提供真实姓名或手机号。使用隐私化身代号融入同侪倾听社区，随时自主掌握隐私边界。",
    "pillar2Badge": "100% 匿名保护",
    "pillar3Title": "严谨临床循证设计",
    "pillar3Desc": "严格遵循循证心理学方法：本地智能微干预 JITAI、耶鲁二维情绪图表、DBT TIPP 危机调节技能、5-4-3-2-1 躯体着陆法与慈悲聚焦疗法（CFT）。",
    "pillar3Badge": "循证科学",
    "showcaseTitle": "专为您身心疗愈量身打造的功能",
    "showcaseSubtitle": "全方位集成工具，助您觉察自我、舒缓情绪并稳健成长。",
    "featMoodTitle": "耶鲁二维情绪坐标尺",
    "featMoodDesc": "以能量与愉悦度双维度可视化标记情绪光谱，洞悉心情长期流动规律。",
    "featJournalTitle": "端到端加密日记与认知行为指导",
    "featJournalDesc": "在本地加密的静谧空间书写心声，配有思维重塑与温和反思引导。",
    "featSomaticsTitle": "躯体感官调节与沉浸式声景",
    "featSomaticsDesc": "共振相干呼吸节律训练配合低刺激布朗噪音声景，迅速舒缓神经系统过度紧绷。",
    "featCrisisTitle": "危机安全庇护网（119 Ext 8）",
    "featCrisisDesc": "一触即达的急性危机降阶流程、个性化安全应急预案及官方求助热线快速拨打。",
    "featForumTitle": "暖心互助同侪交流社区",
    "featForumDesc": "全自动匿名代号护航，在充满理解与关怀的审核空间内互助交流、卸下重担。",
    "featJitaiTitle": "端侧 JITAI 自适应智能建议",
    "featJitaiDesc": "完全在手机端运行的自适应引擎，在关键时刻提供即时恢复指导，数据绝不出境。",
    "faqTitle": "常见问题解答（FAQ）",
    "faqSubtitle": "公开透明呈现我们的隐私机制、技术架构与公益承诺。",
    "faq1Q": "我的日记和个人健康数据真的绝对安全保密吗？",
    "faq1A": "是的。RIMA 采用端侧优先（Offline-First）架构。数据仅加密保存在您浏览器的本地存储库（IndexedDB）中。没有任何第三方追踪分析或数据交易，严格受印尼个人数据保护法保护。",
    "faq2Q": "使用 RIMA 是否需要付费或订阅？",
    "faq2A": "RIMA 是一款完全开放、免费使用的公益数字工具。无需支付任何订阅或隐形费用，即可使用全部核心功能。",
    "faq3Q": "“匿名访客模式”与“登录账户”有什么区别？",
    "faq3A": "访客模式无需邮箱即可立即使用全部工具，数据存于当期浏览器；通过邮件 Magic Link OTP 登录后，可自选开启跨设备加密云端备份与同步。",
    "faq4Q": "若我此刻正经历急性情绪危机或心理痛苦，该怎么办？",
    "faq4A": "RIMA 在每个页面都常驻一键紧急 SOS 按钮，内置即时危机平复卡，并提供直通官方心理危机援助热线（119 分机 8 SEJIWA 与 112）的直拨链接。",
    "footerBadge": "让人人享有无负担的心灵守护",
    "footerDesc": "RIMA（安全心理互动空间）—— 致力于打造包容、安全且由临床科学驱动的数字心理健康空间。",
    "footerEnterApp": "打开应用主页面"
  },
  "auth": {
    "modalTitle": "登录您的 RIMA 账户",
    "modalSubtitle": "输入您的电子邮箱以接收一次性安全快捷登录链接（Magic Link OTP）。无需记忆密码，安全便捷。",
    "emailLabel": "电子邮箱地址",
    "emailPlaceholder": "name@example.com",
    "sendOtpBtn": "发送快捷登录链接（OTP）",
    "sending": "正在发送登录邮件...",
    "checkEmailTitle": "请查收您的邮件",
    "checkEmailDesc": "我们已向 {{email}} 发送了登录验证链接。请在浏览器中点击该链接以完成登录。",
    "resendBtn": "重新发送邮件",
    "resendSuccess": "新的登录链接已成功发送！",
    "backToGuest": "继续以匿名访客身份使用",
    "cancel": "取消",
    "invalidEmail": "请输入有效的电子邮箱格式。",
    "errorTitle": "登录链接发送失败",
    "errorGeneric": "发送过程中发生错误，请稍后重试。",
    "localModeWarning": "云端服务暂未连接。应用将继续在本地全功能私密运行。",
    "successLoggedIn": "成功登录您的账户！"
  },
  "incognito": {
    "activeBadge": "匿名模式已开启",
    "connectedBadge": "账户已连接",
    "toggleAria": "切换匿名模式与账户连接状态",
    "turnOn": "开启匿名模式",
    "turnOff": "切回已连接账户",
    "statusActiveDesc": "账户真实信息已完全隐藏。您在社区中将使用随机匿名代号发言，数据完全私密。",
    "statusInactiveDesc": "当前正使用关联账户。点击即可一键开启即时隐私隐身保护。",
    "forumNotice": "匿名模式生效中：您正使用隐私保护代号参与交流。",
    "pseudonymLabel": "您的隐私代号",
    "switchPrompt": "想要隐藏您的真实身份吗？"
  },
  "nav": {
    "landing": "关于 RIMA",
    "guestBannerTitle": "匿名访客模式",
    "guestBannerDesc": "数据仅私密保存在当前浏览器中。",
    "guestBannerAction": "连接云端账户"
  },
  "profile": {
    "landingLink": "关于 RIMA（公开主页）",
    "landingLinkDesc": "深入了解 RIMA 的隐私保障、临床循证基础与守护愿景。",
    "accountSection": "账户状态与身份设置",
    "guestStatus": "匿名访客（仅限当前设备）",
    "authenticatedStatus": "已关联账户：{{email}}",
    "loginWithAccount": "连接账户（Magic Link 登录）",
    "logoutAccount": "退出账户"
  }
}
```

#### G. Spanish (`es.json`)
```json
{
  "landing": {
    "heroBadge": "100% En el dispositivo y anónimo • Acceso libre",
    "heroTitle": "Un santuario digital seguro para la paz de tu mente",
    "heroSubtitle": "RIMA acompaña tu bienestar mental con intervenciones clínicas basadas en evidencia, privacidad absoluta sin rastreo de datos y expresión libre de estigmas.",
    "heroTagline": "Sin necesidad de registro. Comienza a cuidarte ahora mismo.",
    "ctaGuest": "Comenzar como invitado anónimo",
    "ctaGuestSub": "1 clic instantáneo • Sin registro • Datos guardados localmente",
    "ctaLogin": "Iniciar sesión con cuenta",
    "ctaLoginSub": "Magic Link OTP • Sincronización entre dispositivos",
    "continuePrompt": "¿Ya nos visitaste antes? Inicia sesión para continuar tu camino.",
    "pillarsTitle": "Nuestros pilares de seguridad e integridad",
    "pillarsSubtitle": "Tres principios esenciales que garantizan tu tranquilidad en cada paso.",
    "pillar1Title": "Privacidad absoluta y protección de datos",
    "pillar1Desc": "Totalmente compatible con la Ley de Protección de Datos Personales (UU PDP). Todos los diarios, estados de ánimo y datos personales se cifran y procesan localmente sin rastreo invasivo.",
    "pillar1Badge": "Cero telemetría",
    "pillar2Title": "Acceso libre de estigmas",
    "pillar2Desc": "Comienza sin número de teléfono ni nombre real. Explora foros de apoyo mutuo con seudónimos que protegen tu identidad y el control total de tu privacidad.",
    "pillar2Badge": "100% Anónimo",
    "pillar3Title": "Basado en evidencia clínica",
    "pillar3Desc": "Metodologías científicamente validadas: micro-intervenciones JITAI locales, medidor Yale 2D, habilidades de crisis DBT TIPP, enraizamiento somático 5-4-3-2-1 y terapia centrada en la compasión (CFT).",
    "pillar3Badge": "Basado en evidencia",
    "showcaseTitle": "Herramientas diseñadas para tu bienestar",
    "showcaseSubtitle": "Herramientas integradas para conocerte, calmar tus emociones y florecer.",
    "featMoodTitle": "Medidor de estado de ánimo Yale 2D",
    "featMoodDesc": "Mapea visualmente el espectro de tu energía y agrado emocional con detección inteligente de patrones.",
    "featJournalTitle": "Diario cifrado y terapia cognitivo-conductual",
    "featJournalDesc": "Expresa tus pensamientos en un espacio tranquilo cifrado localmente con guías de reestructuración cognitiva.",
    "featSomaticsTitle": "Regulación somática y paisajes sonoros",
    "featSomaticsDesc": "Respiración coherente guiada y paisajes de ruido marrón para calmar la tensión del sistema nervioso.",
    "featCrisisTitle": "Red de seguridad de crisis (119 Ext 8)",
    "featCrisisDesc": "Acceso instantáneo para desescalada de crisis, plan de seguridad personal y marcación directa a líneas de ayuda.",
    "featForumTitle": "Comunidad de apoyo entre iguales",
    "featForumDesc": "Comparte tus vivencias y recibe apoyo empático en un entorno seguro con protección automática de identidad.",
    "featJitaiTitle": "Recordatorios inteligentes JITAI locales",
    "featJitaiDesc": "Motor inteligente local que ofrece micro-intervenciones oportunas sin enviar datos a servidores externos.",
    "faqTitle": "Preguntas frecuentes",
    "faqSubtitle": "Transparencia total sobre tu privacidad, funcionamiento y nuestro compromiso.",
    "faq1Q": "¿Mis datos y notas están realmente seguros y protegidos?",
    "faq1A": "Sí. RIMA utiliza una arquitectura sin conexión prioritaria. Tus datos se guardan en el IndexedDB de tu navegador con cifrado de dispositivo. Cero rastreadores de terceros ni venta de información.",
    "faq2Q": "¿El uso de RIMA es gratuito?",
    "faq2A": "RIMA es completamente gratuito para toda la comunidad. Puedes usar todas sus funciones de inmediato sin costo ni suscripción.",
    "faq3Q": "¿Cuál es la diferencia entre el Modo Invitado Anónimo y la Cuenta?",
    "faq3A": "El modo invitado te permite usar todas las herramientas al instante sin correo. Iniciar sesión con cuenta (Magic Link OTP) te permite sincronizar tus datos entre varios dispositivos de forma segura.",
    "faq4Q": "¿Qué debo hacer si estoy atravesando una crisis emocional aguda?",
    "faq4A": "RIMA incluye un botón SOS persistente de un solo toque, una tarjeta de seguridad de acción rápida y llamada directa a líneas de emergencia oficiales (119 ext 8 SEJIWA y 112).",
    "footerBadge": "Bienestar mental al alcance de todos",
    "footerDesc": "RIMA — Ruang Interaksi Mental Aman. Dedicado a la salud mental inclusiva, segura y basada en la ciencia para todos.",
    "footerEnterApp": "Abrir panel principal"
  },
  "auth": {
    "modalTitle": "Iniciar sesión en tu cuenta RIMA",
    "modalSubtitle": "Ingresa tu correo para recibir un enlace de inicio de sesión único (Magic Link OTP). Seguro y sin contraseñas.",
    "emailLabel": "Correo electrónico",
    "emailPlaceholder": "nombre@ejemplo.com",
    "sendOtpBtn": "Enviar enlace de inicio (OTP)",
    "sending": "Enviando enlace...",
    "checkEmailTitle": "Revisa tu bandeja de entrada",
    "checkEmailDesc": "Hemos enviado un enlace de inicio a {{email}}. Haz clic en el enlace para entrar a tu cuenta.",
    "resendBtn": "Reenviar correo",
    "resendSuccess": "¡Nuevo enlace enviado con éxito!",
    "backToGuest": "Continuar como invitado anónimo",
    "cancel": "Cancelar",
    "invalidEmail": "Por favor, ingresa un correo electrónico válido.",
    "errorTitle": "Error al enviar el enlace",
    "errorGeneric": "Ocurrió un error al enviar el enlace. Inténtalo de nuevo en unos momentos.",
    "localModeWarning": "Servicio en la nube no configurado. La aplicación sigue funcionando en modo local privado.",
    "successLoggedIn": "¡Has iniciado sesión con éxito!"
  },
  "incognito": {
    "activeBadge": "Modo anónimo activo",
    "connectedBadge": "Cuenta conectada",
    "toggleAria": "Alternar entre modo anónimo y cuenta conectada",
    "turnOn": "Activar modo anónimo",
    "turnOff": "Usar cuenta conectada",
    "statusActiveDesc": "Identidad de cuenta oculta. Apareces bajo un seudónimo protector en foros y los datos se mantienen privados.",
    "statusInactiveDesc": "La cuenta conectada está activa. Haz clic para activar el escudo de privacidad instantáneo.",
    "forumNotice": "Modo anónimo activo: Estás participando bajo un seudónimo protector.",
    "pseudonymLabel": "Tu seudónimo",
    "switchPrompt": "¿Deseas ocultar tu identidad?"
  },
  "nav": {
    "landing": "Acerca de RIMA",
    "guestBannerTitle": "Modo invitado anónimo",
    "guestBannerDesc": "Datos guardados en privado en este navegador.",
    "guestBannerAction": "Conectar cuenta"
  },
  "profile": {
    "landingLink": "Acerca de RIMA (Página de inicio)",
    "landingLinkDesc": "Conoce más sobre los compromisos de privacidad, evidencia clínica y misión de RIMA.",
    "accountSection": "Estado de la cuenta e identidad",
    "guestStatus": "Invitado anónimo (Solo este dispositivo)",
    "authenticatedStatus": "Cuenta conectada: {{email}}",
    "loginWithAccount": "Conectar cuenta (Magic Link)",
    "logoutAccount": "Cerrar sesión"
  }
}
```

#### H. Arabic (`ar.json`)
```json
{
  "landing": {
    "heroBadge": "100% على الجهاز ومجهول بالكامل • وصول مفتوح",
    "heroTitle": "ملاذ رقمي آمن لطمأنينة وسكينة روحك",
    "heroSubtitle": "يرافقك ريما في رحلة صحتك النفسية بتدخلات مبنية على الأدلة السريرية، وخصوصية مطلقة بدون أي تتبع، وحرية تعبير خالية من أي وصمة.",
    "heroTagline": "لا يلزم أي تسجيل. ابدأ بالعناية بنفسك الآن.",
    "ctaGuest": "البدء كضيف مجهول",
    "ctaGuestSub": "بنقرة واحدة فورية • دون تسجيل • تُحفظ البيانات محلياً فقط",
    "ctaLogin": "تسجيل الدخول بالحساب",
    "ctaLoginSub": "رابط سحري OTP • مزامنة آمنة بين الأجهزة",
    "continuePrompt": "هل زرتنا من قبل؟ سجّل الدخول لمواصلة رحلتك.",
    "pillarsTitle": "ركائز الأمان والنزاهة لدينا",
    "pillarsSubtitle": "ثلاثة مبادئ جوهرية تضمن راحتك وطمأنينتك في كل خطوة.",
    "pillar1Title": "خصوصية مطلقة وحماية البيانات",
    "pillar1Desc": "امتثال كامل لقانون حماية البيانات الشخصية رقم 27/2022. تُشفر جميع اليوميات والحالات المزاجية وتُعالج محلياً على جهازك دون أي تتبع خارجي.",
    "pillar1Badge": "صفر تتبع عن بُعد",
    "pillar2Title": "وصول خالٍ من أي وصمة",
    "pillar2Desc": "ابدأ دون الحاجة لرقم هاتف أو اسم حقيقي. تصفح مجتمع الدعم المتبادل بأسماء مستعارة واقية وتحكم كامل بخصوصيتك.",
    "pillar2Badge": "مجهول الهوية 100%",
    "pillar3Title": "قائم على البراهين السريرية",
    "pillar3Desc": "منهجيات مثبتة علمياً: إرشادات JITAI التكيفية على الجهاز، مقياس ييل للمشاعر 2D، مهارات أزمة DBT TIPP، تقنية التجذير الجسدي 5-4-3-2-1، والعلاج القائم على الشفقة بالذات (CFT).",
    "pillar3Badge": "مبني على الأدلة",
    "showcaseTitle": "ميزات مُصممة لتعزيز سلامتك النفسية",
    "showcaseSubtitle": "أدوات متكاملة لفهم نفسك، وتهدئة مشاعرك، والنمو بسلام.",
    "featMoodTitle": "مقياس ييل للمشاعر ثنائي الأبعاد",
    "featMoodDesc": "رسم بياني مرئي لطيف الطاقة والراحة النفسية مع استكشاف ذكي لتقلبات المزاج.",
    "featJournalTitle": "يوميات مشفرة وإعادة هيكلة معرفية CBT",
    "featJournalDesc": "دوّن أفكارك في مساحة هادئة مشفرة محلياً مع إرشادات التأمل المعرفي.",
    "featSomaticsTitle": "التنظيم الجسدي والمؤثرات الصوتية المهدئة",
    "featSomaticsDesc": "تمارين التنفس المتناسق وأصوات الضوضاء البنية لتهدئة استثارة الجهاز العصبي.",
    "featCrisisTitle": "شبكة أمان وقت الأزمات (119 تحويلة 8)",
    "featCrisisDesc": "تهدئة فورية لحالات الانفعال الحاد، وخطة أمان شخصية، والاتصال المباشر بخط المساعدة مجاناً.",
    "featForumTitle": "مجتمع نظراء داعم ومتفهم",
    "featForumDesc": "شارك تجاربك وتلقَّ دعماً دافئاً في بيئة آمنة مع حماية تلقائية لاسمك وهويتك.",
    "featJitaiTitle": "توجيه ذكي متكيف JITAI على الجهاز",
    "featJitaiDesc": "محرك تدخلات ذكي يعمل محلياً ليقدم لك خطوات تعافٍ مناسبة دون إرسال أي بيانات لخوادم خارجية.",
    "faqTitle": "الأسئلة الأكثر شيوعاً",
    "faqSubtitle": "شفافية كاملة بشأن الخصوصية، وطريقة العمل، والتزاماتنا تجاهك.",
    "faq1Q": "هل بياناتي وملاحظاتي الشخصية آمنة ومحمية حقاً؟",
    "faq1A": "نعم. يعتمد ريما بنية الأولوية للعمل دون اتصال. تُحفظ بياناتك محلياً في متصفحك (IndexedDB) بتشفير قوي، دون أي تتبع من أطراف ثالثة أو بيع للبيانات، امتثالاً تاماً للقانون.",
    "faq2Q": "هل استخدام ريما مجاني؟",
    "faq2A": "ريما مجاني بالكامل ومتاح للجميع. يمكنك استخدامه على الفور دون أي رسوم اشتراك أو حواجز دفع.",
    "faq3Q": "ما الفرق بين وضع الضيف المجهول وتسجيل الدخول بحساب؟",
    "faq3A": "يتيح وضع الضيف استخدام جميع الميزات فوراً في متصفحك دون بريد إلكتروني. بينما يتيح تسجيل الدخول (عبر الرابط السحري OTP) مزامنة بياناتك بأمان عبر أجهزتك المختلفة.",
    "faq4Q": "ماذا لو كنت أمر بأزمة نفسية أو عاطفية طارئة وشديدة؟",
    "faq4A": "يوفر ريما زر استغاثة SOS بلمسة واحدة في كل صفحة، وبطاقة تهدئة سريعة لحالات الطوارئ، مع اتصال مباشر بخطوط الأزمات الرسمية المجانية (119 تحويلة 8 و112).",
    "footerBadge": "الصحة النفسية حق متاح للجميع",
    "footerDesc": "ريما — مساحة التفاعل النفسي الآمن. مُكرس لتعزيز الصحة النفسية الشاملة والآمنة والقائمة على العلم للجميع.",
    "footerEnterApp": "فتح اللوحة الرئيسية"
  },
  "auth": {
    "modalTitle": "تسجيل الدخول إلى حساب ريما",
    "modalSubtitle": "أدخل بريدك الإلكتروني لتلقي رابط تسجيل دخول لمرة واحدة (الرابط السحري OTP). آمن وبدون كلمة مرور.",
    "emailLabel": "البريد الإلكتروني",
    "emailPlaceholder": "name@example.com",
    "sendOtpBtn": "إرسال رابط الدخول (OTP)",
    "sending": "جاري إرسال الرابط...",
    "checkEmailTitle": "تحقق من صندوق الوارد",
    "checkEmailDesc": "لقد أرسلنا رابط تسجيل الدخول إلى {{email}}. انقر فوق الرابط لإكمال تسجيل الدخول.",
    "resendBtn": "إعادة إرسال البريد",
    "resendSuccess": "تم إرسال الرابط الجديد بنجاح!",
    "backToGuest": "المتابعة كضيف مجهول",
    "cancel": "إلغاء",
    "invalidEmail": "يرجى إدخال عنوان بريد إلكتروني صحيح.",
    "errorTitle": "فشل إرسال رابط الدخول",
    "errorGeneric": "حدث خطأ أثناء إرسال الرابط. يرجى المحاولة مرة أخرى لاحقاً.",
    "localModeWarning": "الخدمة السحابية غير متصلة. يواصل التطبيق عمله في الوضع المحلي الخاص بالكامل.",
    "successLoggedIn": "تم تسجيل الدخول بنجاح!"
  },
  "incognito": {
    "activeBadge": "الوضع المجهول مفعّل",
    "connectedBadge": "الحساب متصل",
    "toggleAria": "التبديل بين الوضع المجهول والحساب المتصل",
    "turnOn": "تفعيل الوضع المجهول",
    "turnOff": "استخدام الحساب المتصل",
    "statusActiveDesc": "هوية حسابك مخفية. تظهر باسم مستعار واقٍ في المنتديات وتبقى بياناتك خاصة تماماً.",
    "statusInactiveDesc": "الحساب المتصل نشط حالياً. انقر للتبديل الفوري إلى وضع حماية الهوية.",
    "forumNotice": "الوضع المجهول مفعّل: تشارك في النقاش باسم مستعار لحماية هويتك.",
    "pseudonymLabel": "اسمك المستعار",
    "switchPrompt": "هل ترغب في إخفاء هويتك؟"
  },
  "nav": {
    "landing": "عن ريما",
    "guestBannerTitle": "وضع الضيف المجهول",
    "guestBannerDesc": "تُحفظ البيانات بشكل خاص في هذا المتصفح فقط.",
    "guestBannerAction": "ربط الحساب"
  },
  "profile": {
    "landingLink": "عن ريما (صفحة التعريف)",
    "landingLinkDesc": "اطلع مجدداً على التزامات الخصوصية والأدلة السريرية ورسالة ريما.",
    "accountSection": "حالة الحساب والهوية",
    "guestStatus": "ضيف مجهول (هذا الجهاز فقط)",
    "authenticatedStatus": "الحساب المتصل: {{email}}",
    "loginWithAccount": "ربط الحساب (الرابط السحري)",
    "logoutAccount": "تسجيل الخروج من الحساب"
  }
}
```

---

## 2.3 RTL Styling Blueprint for Arabic
When `ar` language is active, `document.documentElement.dir === 'rtl'`. The following rules must be respected:
1. **Directional Arrow / Chevron Flipping**:
   All next / forward indicators (e.g. `ChevronRight`, `ArrowRight`) must include the `.zen-rtl-flip` utility class:
   ```css
   [dir="rtl"] .zen-rtl-flip {
     transform: scaleX(-1);
   }
   ```
2. **Sidebar Border & Elevation Orientation**:
   Add to `src/styles/index.css` or `components.css`:
   ```css
   [dir="rtl"] .sidebar {
     border-right: none;
     border-left: 1px solid var(--border-subtle);
     box-shadow: inset 1px 0 0 0 rgba(255, 255, 255, 0.04);
   }
   ```
3. **Text Alignment & Spacing**:
   Use CSS logical properties:
   - `text-align: start;` instead of `text-align: left;`
   - `margin-inline-start`, `margin-inline-end` instead of `margin-left`, `margin-right`
   - `padding-inline-start`, `padding-inline-end` instead of `padding-left`, `padding-right`
4. **Dual CTA Button Flow**:
   In `Landing.tsx`, flex container `display: flex; gap: var(--spacing-md); flex-wrap: wrap;` naturally reverses in RTL: Primary action ("Mulai sebagai Tamu") starts at the right (Arabic start of reading line), secondary action ("Masuk dengan Akun") sits to its left.

---

## 2.4 CSS Tokens & Styling Guide for New Components

### A. Landing Page Container & Glassmorphism
The Landing Page must have its own layout container independent of `.app-shell`:
```css
.landing-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.landing-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

.landing-hero {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-md) var(--spacing-2xl);
  max-width: 820px;
  margin: 0 auto;
}

.landing-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  background-color: var(--color-primary-transparent);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--border-subtle);
}

.landing-hero-title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.landing-hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

.landing-cta-group {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg);
}

.landing-pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.landing-pillar-card {
  background: var(--bg-glass-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card), var(--border-glass-rim);
  transition: transform var(--transition-normal), border-color var(--transition-fast);
}

.landing-pillar-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-elevated);
}
```

### B. Incognito Mode Pill (Header / Profile)
Interactive pill button matching the Zen Monastic & Apple Health design:
```css
.incognito-toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  background: var(--bg-glass-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  min-height: 38px;
}

.incognito-toggle-pill.active {
  background: hsla(165, 45%, 50%, 0.12);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.incognito-toggle-pill.connected {
  background: var(--color-primary-transparent);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.incognito-toggle-pill:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
```

---

## 2.5 Quality Gates & Test Specifications

### New Unit & Integration Tests to be Implemented

#### 1. `src/pages/__tests__/Landing.test.tsx`
- **Mount & Setup**: Render with `MemoryRouter` and import `'../../i18n/config'`.
- **Hero & Value Pillars**: Assert headline (`landing.heroTitle`), subtitle, 3 pillar cards (Privacy/UU PDP, Stigma-free, Clinical Evidence).
- **Dual CTA Interactions**:
  - Clicking "Mulai sebagai Tamu Anonim" sets `localStorage.getItem('rima-has-entered') === 'true'` and calls `navigate('/')`.
  - Clicking "Masuk dengan Akun" opens `AuthModal`.
- **Showcase & FAQ Accordion**:
  - Asserts all 6 feature items render with title and description.
  - Clicking FAQ questions expands/toggles the answer visible state.
- **Standalone Layout Check**: Verifies that Sidebar, BottomNav, and SOSButton from `AppShell` are NOT present on `/landing`.
- **i18n Language Switch**: Verifies that switching language dynamically updates copy across English, Indonesian, and Arabic.

#### 2. `src/components/__tests__/AuthModal.test.tsx`
- **Render Dialog**: Renders dialog with `role="dialog"` or modal wrapper with header, email input, OTP button, and close/cancel action.
- **Email Validation**:
  - Entering invalid email (e.g. `"abc"`) and clicking submit displays error message (`auth.invalidEmail`).
- **OTP Submit & Check Inbox State**:
  - Entering valid email (e.g. `"user@example.com"`) calls `loginWithEmail('user@example.com')`.
  - Displays loading state (`auth.sending`).
  - Upon resolution, swaps form view for "Check Your Inbox" state (`auth.checkEmailTitle`), displaying the user's email address and resend button (`auth.resendBtn`).
- **Resend Email**: Clicking "Kirim Ulang Email" triggers resend flow.
- **Cancel / Continue as Guest**: Clicking "Lanjutkan sebagai Tamu Anonim" or "Batal" closes the modal.
- **Local Mode Fallback**: When Supabase is not configured, shows polite warning (`auth.localModeWarning`) without throwing uncaught exceptions.

#### 3. `src/hooks/__tests__/useAuth.test.ts` & Incognito Mode Logic
- **Initialization**: Default `isAnonymousMode` is `true` if no user session is established.
- **Toggle**: Calling `toggleAnonymousMode()` flips boolean state and syncs to `rima-incognito-mode` in localStorage.
- **Forum Concealment**: When `isAnonymousMode` is `true`, active forum posts and author identities strictly use `generateAnonymousName()`.

#### 4. `src/test/i18nParity.test.ts` Extension
- Add new test blocks:
  ```ts
  it('verifies that Phase 4 "landing", "auth", and "incognito" namespaces exist in all 8 locales with full parity', () => {
    for (const ns of ['landing', 'auth', 'incognito'] as const) {
      const idNs = LOCALES['id'][ns] as Record<string, unknown>;
      expect(idNs, `Locale "id" must have "${ns}" namespace`).toBeDefined();
      const idKeys = new Set(extractAllDottedKeys(idNs));

      for (const lang of SUPPORTED_LANGUAGES) {
        const langNs = LOCALES[lang][ns] as Record<string, unknown>;
        expect(langNs, `Locale "${lang}" must have "${ns}" namespace`).toBeDefined();
        const langKeys = new Set(extractAllDottedKeys(langNs));
        const missing = [...idKeys].filter((k) => !langKeys.has(k));
        const extra = [...langKeys].filter((k) => !idKeys.has(k));
        expect(missing, `Locale "${lang}" is missing ${ns} keys: ${missing.join(', ')}`).toEqual([]);
        expect(extra, `Locale "${lang}" has extra ${ns} keys: ${extra.join(', ')}`).toEqual([]);
      }
    }
  });
  ```

---

## 3. Caveats
1. **Network Authentication**: Supabase authentication in local test environment operates with `isSupabaseConfigured = false` (or mocked). All AuthModal tests must mock `loginWithEmail` or test the local mode fallback cleanly without relying on live Supabase network calls.
2. **Pre-caching Bundle Budget**: Adding 85 keys to 8 JSON files will add ~30–40 KB uncompressed to `i18n-locales` chunk. Since `vite.config.ts` has `maximumFileSizeToCacheInBytes: 3000000` (3 MB) and current chunk size is 577 KB, this is well within the 3 MB budget.
3. **No other caveats.**

---

## 4. Conclusion
1. **i18n Readiness**: All 85 required translation keys across `landing`, `auth`, `incognito`, `nav`, and `profile` are completely enumerated, culturally translated, and verified across all 8 supported languages (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).
2. **RTL Readiness**: `document.documentElement.dir` is already hooked up in `App.tsx`. Implementing CSS logical properties and reversing `.sidebar` border under `[dir="rtl"]` completes Arabic RTL support.
3. **Styling & Design Tokens**: Repository is 100% free of Tailwind CSS. Component styling maps cleanly to existing Zen Monastic / Apple Health tokens.
4. **Quality Gates**: All existing 4 quality gates (`npm run lint`, `npx tsc -b`, `npx vitest run`, `npm run build`) currently pass 100%. The project is healthy, stable, and ready for Milestone 4 feature implementation and testing.

---

## 5. Verification Method

To independently verify these findings:
1. **Run full lint gate**:
   ```pwsh
   npm run lint
   ```
   *Expected result*: 0 warnings, 0 errors.
2. **Run TypeScript check**:
   ```pwsh
   npx tsc -b
   ```
   *Expected result*: Exit code 0, 0 type errors.
3. **Run existing Vitest suite**:
   ```pwsh
   npx vitest run
   ```
   *Expected result*: 44 test files pass, 456 tests pass.
4. **Run production build**:
   ```pwsh
   npm run build
   ```
   *Expected result*: Clean build, Service Worker generated with 56 precached entries.
5. **Inspect Token and Style Files**:
   - `src/styles/design-tokens.css`
   - `src/styles/components.css`
   - `src/styles/index.css`
6. **Invalidation Conditions**:
   - Any missing key or empty string across any of the 8 languages in `src/i18n/{id,en,jv,su,ja,zh,es,ar}.json`.
   - Introducing Tailwind utility classes or dependencies.
   - Any failure in the 4 quality gates.
