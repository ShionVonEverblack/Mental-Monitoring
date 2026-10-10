# Laporan Survei Arsitektur Beranda (Home Screen) RIMA & Pilihan Hening (R2)

**Tanggal:** 2026-10-10  
**Peneliti:** `teamwork_preview_explorer` (explorer_survey_ui2)  
**Dokumen Referensi:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md` (Header `## 2026-10-10T12:06:32Z`)  
**Target Codebase:** `C:\Users\Hype\Kuliah\Proyekan\mental monitoring`  

---

## 1. Executive Summary

Berdasarkan investigasi menyeluruh terhadap arsitektur Beranda RIMA (`src/pages/Home.tsx`), komponen-komponen pendukungnya (`src/components/`), file gaya (`src/styles/`), serta suite pengujian Vitest (41 file uji, 411 pengujian lolos), ditemukan bahwa:

1. **Polusi Visual & Tumpukan Tombol Kotak:** Beranda saat ini merender sebuah grid `quick-actions` yang memuat **11 tombol kotak** berwarna-warni dengan ikon besar (48x48px) dalam format 2-kolom (`grid-template-columns: 1fr 1fr`). Pada layar ponsel, ini menghasilkan tumpukan vertikal yang padat, penuh stimulasi visual, dan menciptakan beban kognitif (*decision fatigue*) bagi pengguna yang sedang mengalami kecemasan atau kelelahan emosional.
2. **Ketiadaan Pengelompokan Klinis:** Fitur reflektif (Jurnal, Edukasi), regulasi somatik (Napas, Grounding), koping krisis (TIPP, Safety Plan), dan aktivasi perilaku bercampur aduk tanpa alur hierarkis yang menenangkan.
3. **Peluang Integrasi Fitur yang Belum Terhubung Optimal:** RIMA telah memiliki layanan audio somatik prosedural offline canggih (`src/services/audioSomaticsService.ts` dan `SoundscapePlayer.tsx`), direktori rujukan BPJS Kesehatan (`/professional-help`), dan modal welas asih (`SelfCompassionModal.tsx`), namun belum terintegrasi secara harmonis ke dalam pintu masuk beranda.
4. **Kekosongan Pengujian Khusus Beranda:** Saat ini **tidak ada file uji unit/integrasi langsung untuk `Home.tsx`** (seperti `src/pages/__tests__/Home.test.tsx`). Beranda hanya disentuh secara tidak langsung melalui `phase2E2E.test.ts`. Transformasi arsitektur ini memerlukan penyediaan file uji baru yang komprehensif untuk mencegah regresi navigasi dan aksesibilitas.
5. **Solusi "Pilihan Hening" 4 Baris Kartu Minimalis:** Merombak 11 tombol kotak menjadi 4 baris kartu terstruktur berfilosofi **Zen Monastic & Apple Health Wellbeing** yang mengalir lembut:
   - **Baris 1: Jurnal & Refleksi** (Jurnal, Skrining Mandiri, Edukasi)
   - **Baris 2: Regulasi Somatik** (Audio Brown Noise, Latihan Napas, Grounding 5-4-3-2-1)
   - **Baris 3: Welas Asih & Koping** (Self-Compassion CFT, TIPP Krisis, Aktivasi BA)
   - **Baris 4: Jaring Pengaman & Bantuan** (Safety Plan, Hotline 119 Ext 8, Rujukan Puskesmas/BPJS)

---

## 2. Bedah Arsitektur Komponen `src/pages/Home.tsx`

### 2.1 State & Hook Manajemen
`Home.tsx` saat ini mengelola sejumlah state dan hook esensial:
- `useTranslation()`: Melayani pelokalan bahasa aktif (`currentLang`) dan fungsi `t()`.
- `useNavigate()`: Menangani navigasi routing React Router.
- `useMood()`:
  - `getTodayMood()`: Mengecek apakah entri mood hari ini sudah ada.
  - `getWeeklyMoods()`: Mengambil rekaman mood 7 hari terakhir untuk visualisasi grafik.
  - `addMood({ score, emoji, factors, note })`: Menyimpan log mood baru.
  - `getMoodStats()`: Menghitung streak aktif dan status pemulihan (*grace period*).
- `useLocalStorage()`:
  - `'rima-spiritual-enabled'` & `'rima-spiritual-source'`: Mengatur konten penyejuk jiwa/spiritual opsional.
  - `'rima-journals'`: Membaca entri jurnal terakhir untuk deteksi eskalasi krisis.
- State Lokal:
  - `showLangModal`: Boolean pembuka modal pemilihan 8 bahasa.
  - `isCftOpen`: Boolean pembuka `SelfCompassionModal`.

---

### 2.2 Hirarki Komponen Yang Dirender Home Saat Ini

```
<div className="home-page">
  ├── <header className="home-header">
  │     ├── <h1 className="home-greeting">{getGreeting(currentLang)}</h1>
  │     └── <div>
  │           ├── <button className="home-lang-btn"> (Pemilih Bahasa Cepat)
  │           └── <div className="streak-badge"> (Flame Icon + Streak Count + Recovery Grace)
  │
  ├── <Modal isOpen={showLangModal}> (Modal Pemilihan 8 Bahasa)
  │
  ├── <section className="mood-section">
  │     └── {!todayMood ? (
  │           <div className="mood-prompt-card">
  │             <h2>t('home.howAreYou')</h2>
  │             <MoodSelector onChange={...} />
  │           </div>
  │         ) : (
  │           <div className="mood-logged-card">
  │             <h2>t('home.moodLogged')</h2>
  │             <div className="logged-emoji">{todayMood.emoji}</div>
  │           </div>
  │         )}
  │
  ├── <EscalationBanner moods={moods} latestJournalContent={latestJournalContent} />
  │     (Banner peringatan krisis level 1-3 jika skor mood rendah / terdeteksi teks krisis)
  │
  ├── <JitaiNudgeCard />
  │     (Kartu intervensi mikro adaptif berbasis mood trajectory & CBT-I sleep efficiency)
  │
  ├── <div className="affirmation-card">
  │     (Afirmasi harian atau konten spiritual yang menenangkan)
  │
  ├── {weeklyMoods.length >= 3 && <section className="insight-section">}
  │     (Insight psikoedukasi mingguan dari generateInsights())
  │
  ├── <section className="quick-actions">  <-- [SUMBER POLUSI VISUAL: 11 TOMBOL KOTAK]
  │     ├── Button 1: Tulis Jurnal (/journal)
  │     ├── Button 2: Lihat Forum (/forum)
  │     ├── Button 3: Rencana Keselamatan (/safety-plan)
  │     ├── Button 4: Latihan Napas (/breathe)
  │     ├── Button 5: Grounding 5-4-3-2-1 (/grounding)
  │     ├── Button 6: TIPP Krisis (/tipp)
  │     ├── Button 7: Skrining Mandiri (/assessment)
  │     ├── Button 8: Aktivasi Perilaku (BA) (/activation)
  │     ├── Button 9: Buku Harian Tidur (/sleep)
  │     ├── Button 10: Edukasi (/education)
  │     └── Button 11: Belas Kasih Diri (isCftOpen -> true)
  │
  ├── <section className="chart-section">
  │     └── <ResponsiveContainer> <BarChart data={recentMoods}>
  │           (Grafik batang Recharts riwayat mood 7 hari)
  │
  └── <SelfCompassionModal isOpen={isCftOpen} onClose={...} />
```

---

## 3. Investigasi Detail 5 Komponen Inti Sesuai Kebutuhan R2

### 3.1 Header Hening: Sapaan & Streak Badge Minimalis
- **Status Saat Ini:**
  - `home-greeting` menggunakan ukuran teks besar (`1.75rem`, bold 700), memanggil helper `getGreeting(currentLang)` yang menentukan sapaan berbasis waktu (Pagi/Siang/Sore/Malam dalam 8 bahasa).
  - Terdapat tombol `home-lang-btn` dengan gaya *pill* dan inline-styles.
  - `streak-badge` menggunakan latar belakang oranye menyala (`hsla(35, 75%, 60%, 0.12)`) dengan ikon api (`Flame`), menimbulkan kesan *gamification* yang dapat memicu rasa bersalah (*guilt*) jika pengguna kehilangan streak.
- **Rekomendasi Re-desain Zen Monastic:**
  - Pertahankan fungsi sapaan `getGreeting` yang hangat dan tidak terburu-buru.
  - Sederhanakan `streak-badge` menjadi indikator hening (*subtle presence badge*): hilangkan warna oranye menyala; gantikan dengan warna netral charcoal/linen yang tenang, ikon tanaman/biji kecil atau api redup bergaris tipis, dan tipografi santai yang merayakan kehadiran diri (*gentle consistency*) tanpa tekanan kompetitif.
  - Rapikan tata letak tombol pemilih bahasa menjadi minimalis dan menyatu dengan *header*.

---

### 3.2 Fluid Mood Check-In: Pemilih Suasana Hati Halus & Integrasi Yale Mood Meter 2D
- **Status Saat Ini:**
  - `MoodSelector` saat ini hanya berupa 5 tombol emoji horizontal (1-5: Sangat Buruk hingga Sangat Baik) yang jika diklik langsung memanggil `addMood()`.
  - Kartu pembungkusnya (`mood-prompt-card`) berlatar belakang glassmorphism dengan padding tebal (32px) dan teks `h2` ("Bagaimana perasaanmu hari ini?").
  - Jika sudah tercatat, kartu berubah menjadi `mood-logged-card` dengan emoji raksasa (3rem) di tengah.
  - Belum ada integrasi langsung dengan **Yale Mood Meter 2D** (`MoodMeterCanvas.tsx`), padahal `MoodTracker.tsx` sudah memiliki mode kanvas 2D yang memetakan valensi emosi (*pleasantness*) dan energi (*arousal*).
- **Rekomendasi Re-desain Zen Monastic:**
  - Hadirkan **Fluid Mood Check-In**: antarmuka pemilih suasana hati yang tenang, menggunakan transisi lembut, tidak mencolok (*unobtrusive*), dan tidak menghakimi (*non-judgmental*).
  - Berikan opsi langsung bagi pengguna: check-in cepat yang hening (1-tap) atau eksplorasi emosi mendalam via tautan/modal ke kanvas Yale Mood Meter 2D (`/mood`).
  - Bila mood hari ini sudah tercatat: tampilkan status ketercatatan dengan elegan, misalnya chip kuadran hening (Merah/Kuning/Biru/Hijau atau emoji halus) disertai tombol kecil untuk memperbarui catatan tanpa memakan ruang visual berlebih.

---

### 3.3 Whisper Nudge: JITAI Adaptive Nudge Banner
- **Status Saat Ini:**
  - Dirender melalui `<JitaiNudgeCard />` (`src/components/common/JitaiNudgeCard.tsx`).
  - Mengambil data dari hook `useJitai()` yang secara deterministik mengevaluasi riwayat mood (kuadran merah/biru, penurunan drastis), efisiensi tidur CBT-I (<85%), dan inaktivasi perilaku (>48 jam).
  - Menghormati *quiet hours* (22:00 - 07:00), *cooldown* 4 jam, batas maksimal 3 kali sehari, dan mekanisme *dismiss* harian (`dismissNudgeToday`).
  - Saat ini, tampilan visual kartu menggunakan border dan bayangan yang cukup kontras (`.jitai-urgency-high` memiliki border merah terang dan glow `hsla(0, 65%, 55%, 0.15)`).
- **Rekomendasi Re-desain Zen Monastic:**
  - Jadikan kartu ini sebuah **Whisper Nudge** (Bisikan Penyejuk): bingkai yang menyatu dengan latar belakang (border ultra-halus `rgba(255,255,255,0.06)` / `rgba(0,0,0,0.06)`), tipografi menenangkan, dan aksen warna lembut yang tidak mengejutkan retina pengguna.
  - **Kritis:** Struktur elemen DOM, atribut ARIA (`aside`, `aria-label`, tombol aksi, tombol tutup `jitai-dismiss-btn` dan `jitai-secondary-dismiss-btn`) **wajib dipertahankan 100%** agar lulus pengujian ketat pada `JitaiNudgeCard.test.tsx` dan `phase2E2E.test.ts`.

---

### 3.4 Zen Quote / Afirmasi: Tipografi Editorial & Whitespace Lega
- **Status Saat Ini:**
  - Mengambil data dari `DAILY_AFFIRMATIONS` (berotasi per hari) dan dukungan `SPIRITUAL_CONTENT` jika diaktifkan.
  - Dibungkus dalam `.affirmation-card` dengan gradien ungu/biru (`linear-gradient(135deg, hsla(270, 50%, 65%, 0.15), hsla(215, 65%, 55%, 0.1))`).
  - Terdapat konflik styling inline: `style={{ backgroundColor: 'var(--color-primary-soft)' }}`.
- **Rekomendasi Re-desain Zen Monastic:**
  - Hapus gradien ungu tebal dan kotak yang kaku.
  - Terapkan tipografi editorial elegan: teks kutipan bernapas dengan *line-height* lega (1.7 - 1.8), perataan tengah yang seimbang, didukung ruang kosong (*breathing whitespace*) vertikal yang luas.
  - Jadikan area ini sebagai momen hening bagi pengguna untuk mengambil napas sebelum menjelajahi fitur lainnya.

---

## 4. Evaluasi & Pemetaan 11 Tombol Kotak ke 4 Baris Kartu Minimalis

### 4.1 Inventarisasi 11 Tombol Kotak Saat Ini
Di dalam `Home.tsx` baris 200–245:

| No | Selektor CSS Kelas | Ikon Lucide | Teks Label & Kunci i18n | Aksi / Target Route | Domain Klinis |
|:--:|:------------------|:------------|:------------------------|:--------------------|:--------------|
| 1 | `quick-action-btn journal` | `Book` | `home.writeJournal` ("Tulis Jurnal") | `navigate('/journal')` | Refleksi / Kognitif |
| 2 | `quick-action-btn forum` | `MessageCircle` | `home.viewForum` ("Lihat Forum") | `navigate('/forum')` | Komunitas (Global Nav) |
| 3 | `quick-action-btn safety` | `Heart` | `home.safetyPlan` ("Rencana Keselamatan") | `navigate('/safety-plan')` | Pencegahan Krisis |
| 4 | `quick-action-btn meditate` | `Wind` | `home.meditate` ("Latihan Napas") | `navigate('/breathe')` | Regulasi Somatik |
| 5 | `quick-action-btn grounding` | `Sparkles` | `home.grounding` ("Grounding 5-4-3-2-1") | `navigate('/grounding')` | Regulasi Sensorik |
| 6 | `quick-action-btn tipp` | `Snowflake` | `home.tippCrisis` ("TIPP Krisis") | `navigate('/tipp')` | Toleransi Distres DBT |
| 7 | `quick-action-btn assessment` | `ClipboardCheck` | `home.assessment` ("Skrining Mandiri") | `navigate('/assessment')` | Evaluasi PHQ-9/GAD-7 |
| 8 | `quick-action-btn activation` | `Activity` | `ba.homeAction` ("Aktivasi Perilaku (BA)") | `navigate('/activation')` | Aktivasi Perilaku CBT |
| 9 | `quick-action-btn sleep` | `MoonStar` | `home.sleepTracker` ("Buku Harian Tidur") | `navigate('/sleep')` | Higienitas Tidur CBT-I |
| 10 | `quick-action-btn education` | `BookOpen` | `home.education` ("Edukasi") | `navigate('/education')` | Psikoedukasi |
| 11 | `quick-action-btn cft` | `Heart` | `home.cftSelfCompassion` ("Belas Kasih Diri") | `setIsCftOpen(true)` | Welas Asih CFT |

---

### 4.2 Pemetaan Bersih Menuju 4 Baris Kartu Minimalis (Pilihan Hening)

Alih-alih menyajikan 11 tombol acak, kelompokkan seluruh fungsionalitas tersebut ke dalam **4 baris kartu tematik hierarkis**:

```
================================================================================
                    PILIHAN HENING (4 BARIS KARTU TERSTRUKTUR)
================================================================================

┌──────────────────────────────────────────────────────────────────────────────┐
│ BARIS 1: JURNAL & REFLEKSI                                                   │
│ "Ruang jeda untuk menata pikiran dan memahami diri."                         │
├──────────────────────┬───────────────────────────────┬───────────────────────┤
│ 1. Tulis Jurnal      │ 2. Skrining Mandiri           │ 3. Edukasi Klinis     │
│    Route: /journal   │    Route: /assessment         │    Route: /education  │
│    Ikon: Book        │    Ikon: ClipboardCheck       │    Ikon: BookOpen     │
│    (CBT Refleksi)    │    (PHQ-9 / GAD-7 / C-SSRS)   │    (Psikoedukasi)     │
└──────────────────────┴───────────────────────────────┴───────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ BARIS 2: REGULASI SOMATIK                                                    │
│ "Menstabilkan denyut dan meredakan ketegangan sistem saraf otonom."          │
├──────────────────────┬───────────────────────────────┬───────────────────────┤
│ 1. Audio Brown Noise │ 2. Latihan Napas              │ 3. Grounding 5-4-3-2-1│
│    Aksi: Soundscape  │    Route: /breathe            │    Route: /grounding  │
│    Ikon: Headphones  │    Ikon: Wind                 │    Ikon: Sparkles     │
│    (Sintesis Offline)│    (Cyclic Sighing / 4-7-8)   │    (Disosiasi Indera) │
└──────────────────────┴───────────────────────────────┴───────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ BARIS 3: WELAS ASIH & KOPING                                                 │
│ "Melembutkan kritik batin dan memulihkan energi secara bertahap."            │
├──────────────────────┬───────────────────────────────┬───────────────────────┤
│ 1. Belas Kasih (CFT) │ 2. TIPP Krisis                │ 3. Aktivasi (BA)      │
│    Aksi: Modal CFT   │    Route: /tipp               │    Route: /activation │
│    Ikon: Heart       │    Ikon: Snowflake            │    Ikon: Activity     │
│    (Self-Compassion) │    (Toleransi Distres DBT)    │    (Mikro Langkah)    │
└──────────────────────┴───────────────────────────────┴───────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ BARIS 4: JARING PENGAMAN & BANTUAN                                           │
│ "Dukungan darurat dan jejaring bantuan saat situasi terasa berat."           │
├──────────────────────┬───────────────────────────────┬───────────────────────┤
│ 1. Rencana Selamat   │ 2. Hotline 119 Ext 8          │ 3. Rujukan Faskes/BPJS│
│    Route:/safety-plan│    Aksi: tel:119,8 / SOS Card │    Route: /prof-help  │
│    Ikon: Shield      │    Ikon: PhoneCall            │    Ikon: Building2    │
│    (Stanley-Brown)   │    (Bantuan Krisis Darurat)   │    (Puskesmas / BPJS) │
└──────────────────────┴───────────────────────────────┴───────────────────────┘
```

#### Catatan Penyelarasan Fitur:
- **Audio Brown Noise:** Diintegrasikan langsung pada Baris 2 memanfaatkan `audioSomatics` (`src/services/audioSomaticsService.ts`), memungkinkan pengguna memutar gelombang brownian noise penenang pikiran secara instan dari beranda tanpa membuka halaman terpisah.
- **Hotline 119 Ext 8 & Rujukan BPJS:** Mengisi Baris 4 bersama Safety Plan, memberikan akses cepat menuju kontak darurat resmi Indonesia (`tel:119,8`) serta direktori layanan medis profesional bebas biaya BPJS (`/professional-help`).
- **Forum & Sleep Tracker:** Fitur Forum tetap tersemat pada navigasi global utama (`Sidebar.tsx` dan `BottomNav.tsx`), sedangkan Buku Harian Tidur (`/sleep`) tetap dapat diakses melalui JITAI nudge dan profil/analitik tanpa membebani beranda.

---

## 5. Inspeksi Suite Pengujian & Kebutuhan Test Khusus Home

### 5.1 Temuan Hasil Audit Pengujian
1. **Total Uji Saat Ini:** 41 file uji (411 tests) lulus 100% tanpa kegagalan.
2. **Ketiadaan Test Khusus Home:** Belum ada file `src/pages/__tests__/Home.test.tsx`.
3. **Ketergantungan Test yang Ada:**
   - `src/components/__tests__/JitaiNudgeCard.test.tsx` menguji rendering independen kartu JITAI (10 test).
   - `src/components/__tests__/FastActionSafetyCard.test.tsx` menguji tombol darurat dan modal krisis (17 test).
   - `src/components/__tests__/SelfCompassionModal.test.tsx` menguji alur 3-langkah CFT modal (2 test).
   - `src/components/__tests__/SoundscapePlayer.test.tsx` menguji pemutaran audio brown noise (3 test).
   - `src/test/phase2E2E.test.ts` menguji guardrails JITAI, persistensi, SOS, dan paritas i18n (57 test).
   - `src/test/i18nParity.test.ts` memvalidasi ketat bahwa seluruh 8 file kamus bahasa memiliki kesamaan kunci 100% tanpa nilai kosong.

### 5.2 Rencana Pengujian Komprehensif: `src/pages/__tests__/Home.test.tsx`
Untuk memastikan transformasi UI R2 aman dari regresi, wajib disusun suite pengujian baru yang menguji:
1. **Rendering Header Hening & Pelokalan:** Memverifikasi sapaan ramah (`Selamat Pagi`/`Good Morning`) dan badge streak minimalis.
2. **Fluid Mood Check-In:**
   - Keadaan belum mencatat: Menampilkan pemilih suasana hati yang ramah tanpa elemen visual agresif.
   - Keadaan sudah mencatat: Menampilkan indikator mood tercatat dan tautan ke kanvas detail.
3. **Whisper Nudge:** Menampilkan kartu rekomendasi adaptif saat kondisi terpenuhi dan menangani aksi dismiss.
4. **Kutipan Zen / Afirmasi:** Menampilkan teks afirmasi harian dengan tipografi editorial bersih.
5. **Navigasi 4 Baris Kartu Pilihan Hening:**
   - Baris 1: Klik pada Jurnal (`/journal`), Skrining (`/assessment`), dan Edukasi (`/education`) memanggil `navigate()` dengan rute yang tepat.
   - Baris 2: Interaksi Audio Brown Noise, klik Latihan Napas (`/breathe`), dan Grounding (`/grounding`).
   - Baris 3: Pembukaan modal CFT (`SelfCompassionModal`), klik TIPP (`/tipp`), dan Aktivasi BA (`/activation`).
   - Baris 4: Klik Safety Plan (`/safety-plan`), Hotline 119 Ext 8 (`tel:119,8`), dan Rujukan BPJS (`/professional-help`).
6. **Aksesibilitas WCAG 2.2 AA:** Memastikan seluruh tombol dan kartu interaktif memiliki ukuran target sentuh minimal 48px (`min-height: 48px` atau `min-width: 48px`).

---

## 6. Rekomendasi Desain & Rencana Implementasi

### 6.1 Desain Token & CSS (Zen Monastic)
- **Warna Latar:**
  - Dark mode: Charcoal halus `#111418` (dasar) dan `#181C22` (kartu hening).
  - Light mode: Warm porcelain `#F7F8FA` (dasar) dan `#FFFFFF` (kartu hening).
- **Border:** `1px solid rgba(255, 255, 255, 0.06)` (dark) / `1px solid rgba(0, 0, 0, 0.06)` (light).
- **Elevasi:** Hilangkan bayangan kasar (`box-shadow: 0 8px 32px rgba(0,0,0,0.3)`); gantikan dengan elevasi difus lembut (`box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04)`).
- **Zero Tailwind:** Seluruh aturan styling ditulis dalam CSS murni (`src/styles/components.css` dan `src/styles/index.css`) menggunakan variabel token yang telah didefinisikan.

### 6.2 Struktur Komponen Baris Kartu Minimalis (`Home.tsx`)
Struktur DOM yang direkomendasikan untuk menggantikan `<section className="quick-actions">`:

```tsx
<section className="zen-rows-container" aria-label={t('home.calmChoices', 'Pilihan Hening')}>
  {/* Baris 1: Jurnal & Refleksi */}
  <div className="zen-card-row">
    <div className="zen-row-header">
      <h3 className="zen-row-title">{t('home.row_reflection_title', 'Jurnal & Refleksi')}</h3>
      <span className="zen-row-subtitle">{t('home.row_reflection_desc', 'Menata pikiran dan memahami diri')}</span>
    </div>
    <div className="zen-row-items">
      <button type="button" className="zen-item-btn" onClick={() => navigate('/journal')}>
        <Book className="zen-item-icon" />
        <span>{t('home.writeJournal', 'Tulis Jurnal')}</span>
      </button>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/assessment')}>
        <ClipboardCheck className="zen-item-icon" />
        <span>{t('home.assessment', 'Skrining Mandiri')}</span>
      </button>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/education')}>
        <BookOpen className="zen-item-icon" />
        <span>{t('home.education', 'Edukasi')}</span>
      </button>
    </div>
  </div>

  {/* Baris 2: Regulasi Somatik */}
  <div className="zen-card-row">
    <div className="zen-row-header">
      <h3 className="zen-row-title">{t('home.row_somatics_title', 'Regulasi Somatik')}</h3>
      <span className="zen-row-subtitle">{t('home.row_somatics_desc', 'Menenangkan sistem saraf dan tubuh')}</span>
    </div>
    <div className="zen-row-items">
      <button type="button" className="zen-item-btn" onClick={handleToggleBrownNoise}>
        <Headphones className="zen-item-icon" />
        <span>{isPlayingBrownNoise ? t('audio.stop_btn', 'Hentikan Audio') : t('home.brownNoise', 'Audio Brown Noise')}</span>
      </button>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/breathe')}>
        <Wind className="zen-item-icon" />
        <span>{t('home.meditate', 'Latihan Napas')}</span>
      </button>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/grounding')}>
        <Sparkles className="zen-item-icon" />
        <span>{t('home.grounding', 'Grounding 5-4-3-2-1')}</span>
      </button>
    </div>
  </div>

  {/* Baris 3: Welas Asih & Koping */}
  <div className="zen-card-row">
    <div className="zen-row-header">
      <h3 className="zen-row-title">{t('home.row_coping_title', 'Welas Asih & Koping')}</h3>
      <span className="zen-row-subtitle">{t('home.row_coping_desc', 'Melembutkan batin dan membangkitkan energi')}</span>
    </div>
    <div className="zen-row-items">
      <button type="button" className="zen-item-btn" onClick={() => setIsCftOpen(true)}>
        <Heart className="zen-item-icon" />
        <span>{t('home.cftSelfCompassion', 'Belas Kasih Diri')}</span>
      </button>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/tipp')}>
        <Snowflake className="zen-item-icon" />
        <span>{t('home.tippCrisis', 'TIPP Krisis')}</span>
      </button>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/activation')}>
        <Activity className="zen-item-icon" />
        <span>{t('ba.homeAction', 'Aktivasi Perilaku')}</span>
      </button>
    </div>
  </div>

  {/* Baris 4: Jaring Pengaman & Bantuan */}
  <div className="zen-card-row">
    <div className="zen-row-header">
      <h3 className="zen-row-title">{t('home.row_safety_title', 'Jaring Pengaman & Bantuan')}</h3>
      <span className="zen-row-subtitle">{t('home.row_safety_desc', 'Dukungan darurat dan rujukan profesional')}</span>
    </div>
    <div className="zen-row-items">
      <button type="button" className="zen-item-btn" onClick={() => navigate('/safety-plan')}>
        <Shield className="zen-item-icon" />
        <span>{t('home.safetyPlan', 'Rencana Keselamatan')}</span>
      </button>
      <a href="tel:119,8" className="zen-item-btn zen-item-emergency">
        <PhoneCall className="zen-item-icon" />
        <span>{t('home.hotline119', '119 Ext 8')}</span>
      </a>
      <button type="button" className="zen-item-btn" onClick={() => navigate('/professional-help')}>
        <Building2 className="zen-item-icon" />
        <span>{t('home.bpjsReferral', 'Rujukan Puskesmas / BPJS')}</span>
      </button>
    </div>
  </div>
</section>
```

### 6.3 Paritas Kamus Terjemahan (8 Bahasa)
Setiap penambahan kunci baru pada `id.json` (seperti `home.calmChoices`, `home.row_reflection_title`, `home.row_reflection_desc`, `home.brownNoise`, `home.hotline119`, `home.bpjsReferral`) **wajib langsung ditambahkan** ke seluruh 7 file bahasa lainnya (`en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`) untuk memenuhi standar `test/i18nParity.test.ts`.

---

## 7. Kesimpulan
Transformasi arsitektur Beranda RIMA dari grid 11 tombol kotak menuju 4 Baris Kartu Pilihan Hening akan:
1. Mengeliminasi polusi visual secara radikal, menghadirkan antarmuka tenang kelas dunia setara Zen Monastic dan Apple Health Wellbeing.
2. Meningkatkan kejelasan kognitif pengguna melalui pengelompokan klinis yang runtut (Refleksi -> Somatik -> Koping -> Bantuan).
3. Mengintegrasikan generator Audio Brown Noise dan Rujukan BPJS secara langsung pada Beranda.
4. Menjaga 100% kompatibilitas dan kelulusan seluruh suite tes (41 file) dengan zero regresi.
