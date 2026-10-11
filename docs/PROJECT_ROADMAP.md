# RIMA Project Roadmap: Peta Jalan Strategis & Arsitektur Jangka Panjang (2026–2027)

> **Status Dokumen:** Dokumen Arsitektur & Perencanaan Produk Resmi  
> **Versi Dokumen:** 2.0.0 (Oktober 2026)  
> **Klasifikasi:** Open-Source Digital Therapeutics (DTx) & Mental Health PWA  
> **Kepatuhan Regulasi:** UU Pelindungan Data Pribadi No. 27/2022, UU Kesehatan No. 17/2023, WHO Digital Health Guidelines, APA App Advisor, NICE Evidence Standards Framework Tier B/C.

---

## 1. Visi Produk, Misi Klinis & Prinsip Inti

### A. Visi Produk
Menjadikan **RIMA (Ruang Interaksi Mental Aman)** sebagai standar emas aplikasi kesehatan mental digital di Indonesia yang mandiri, bebas stigma, berakar pada bukti ilmiah medis (anti-pseudosains), dan menjamin hak privasi mutlak pengguna melalui kebebasan memilih mode operasional.

### B. Misi Klinis Berbasis Bukti
Mengatasi kesenjangan layanan kesehatan jiwa di Indonesia—di mana survei **I-NAMHS (2022)** mencatat bahwa meskipun 1 dari 3 remaja mengalami masalah kesehatan mental, hanya **2,6% yang mengakses bantuan profesional** akibat stigma, ketakutan kebocoran identitas, dan keterbatasan biaya. RIMA menyediakan intervensi lini pertama psikoedukasi, regulasi emosi, pencegahan krisis, dan jembatan rujukan resmi ke faskes BPJS.

### C. Enam Prinsip Inti Arsitektur RIMA:
1. **Dual-Mode Freedom**: Pengguna bebas memilih beroperasi dalam **Mode 100% Offline (Air-Gapped Vault)** tanpa koneksi internet sama sekali, atau **Mode Online (Connected Hybrid)** untuk interaksi forum anonim dan sinkronisasi awan terenkripsi.
2. **Zero-Knowledge Privacy (UU PDP No. 27/2022)**: Data kesehatan adalah data pribadi spesifik. Seluruh catatan jurnal, riwayat emosi, dan rencana keselamatan dienkripsi secara lokal menggunakan Web Crypto AES-GCM-256. Bahkan jika disinkronkan ke awan, data berada dalam format ciphertext yang mustahil didekripsi oleh penyedia server.
3. **Zero Pseudoscience (Anti-Fitur Halu)**: Setiap modul intervensi wajib memiliki dasar Randomized Controlled Trial (RCT) atau meta-analisis peer-reviewed (selaras dengan [`docs/CLINICAL_EVIDENCE_DOSSIER.md`](./CLINICAL_EVIDENCE_DOSSIER.md)).
4. **Calm-Tech & Trauma-Informed**: Mengeliminasi polusi visual, suara mengejutkan, dan getaran agresif. Antarmuka mengadopsi prinsip *Zen Monastic* dan *Apple Health Wellbeing* yang menenangkan saraf vagus.
5. **Cognitive Load Minimization**: Mengurangi kebingungan pengguna yang sedang dalam kondisi distres emosional akut dengan memangkas pilihan berjejal, meniadakan gamifikasi yang memicu rasa bersalah (*toxic streaks*), dan menghilangkan metrik sosial kompetitif.
6. **Universal Accessibility & Multilingual Parity**: Kepatuhan penuh WCAG 2.2 AA, dukungan pembaca layar, mode stimulasi rendah (*low-stimulation*), serta 100% paritas 8 bahasa (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) termasuk tata letak RTL Arab.

---

## 2. Arsitektur Dual-Mode: Offline Air-Gapped vs Online Connected Hybrid

```
                                      PILIHAN PENGGUNA DI PENGATURAN / HEADER
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
       [MODE 100% OFFLINE (AIR-GAPPED)]                                    [MODE ONLINE (CONNECTED HYBRID)]
  - Isolasi jaringan total (Network Disabled)                         - Deteksi status jaringan cerdas (navigator.onLine)
  - Data di IndexedDB terenkripsi lokal                               - Forum Anonim Terenkripsi (Quiet Circles E2EE)
  - RAG Semantic Search on-device (Transformers.js)                   - Cadangan awan Supabase Zero-Knowledge
  - Zero outgoing HTTP/WebSocket request                              - Pembaruan konten direktori faskes BPJS
  - Cocok untuk pengguna berisiko tinggi / privasi mutlak             - Sinkronisasi antrean mutasi (Offline Mutation Queue)
```

### Karakteristik Masing-Masing Mode:

| Dimensi Arsitektur | Mode 100% Offline (Air-Gapped) | Mode Online (Connected Hybrid) |
| :--- | :--- | :--- |
| **Konektivitas Jaringan** | Diputus secara programatis (`Service Worker bypass / air-gap guard`). | Terhubung dengan penanganan kondisi *flaky network* / 3G. |
| **Penyimpanan Data** | `IndexedDB` lokal + Web Crypto AES-GCM-256. | `IndexedDB` lokal + E2EE Ciphertext sync ke Supabase. |
| **Interaksi Forum** | Diberi tanda nonaktif dengan penjelasan privasi yang menenangkan. | Terbuka menggunakan nama samaran acak (*pseudonyms*) tanpa identitas asli. |
| **AI Companion & RAG** | In-browser semantic search (ONNX / WebGPU / MiniSearch). | Hybrid: Pencarian lokal + opsi pembaruan korpus dari CDN terverifikasi. |
| **Pemberitahuan / Pengingat** | Local Notification Triggers API / in-app scheduler. | Web Push Notifications terenkripsi VAPID. |
| **Privasi & Keamanan** | Perlindungan fisik lokal (PIN lockout, anti-snooping). | Zero-Knowledge E2EE + perlindungan kebocoran metadata IP. |

---

## 3. Matriks 4 Kuadran Produk: Tambah, Perbaiki, Perkuat, Kurangi

```
                  TAMBAH (ADD)                                     PERBAIKI (FIX)
    ┌───────────────────────────────────────────────┐ ┌───────────────────────────────────────────────┐
    │ 1. Dual-Mode Sync Engine (Local-first + E2EE) │ │ 1. Migrasi Total localStorage -> IndexedDB    │
    │ 2. Modul Terapi ACT (Nilai Hidup & Defusi)    │ │ 2. Offline Mutation Queue & Resolusi Konflik  │
    │ 3. Modul Relapse Prevention Plan              │ │ 3. Optimasi Performa HP Kentang (Lang Chunks) │
    │ 4. On-Device Voice / Small WebLLM Audio       │ │ 4. Ergonomi Input Mobile (Keyboard avoidance) │
    │ 5. Ekspor Laporan Medis BPJS/Puskesmas PDF    │ │ 5. Transisi Layar Hening & Accessible Modals  │
    └───────────────────────────────────────────────┘ └───────────────────────────────────────────────┘
                PERKUAT (STRENGTHEN)                             KURANGI (PRUNE / REMOVE)
    ┌───────────────────────────────────────────────┐ ┌───────────────────────────────────────────────┐
    │ 1. Zero-Knowledge E2EE Default (AES-GCM-256)  │ │ 1. Gamifikasi Menghakimi ("Toxic Streaks")    │
    │ 2. JITAI Engine Cerdas (Ritme Tidur & Emosi)  │ │ 2. Pilihan Chip Faktor Mood Berjejal          │
    │ 3. In-Browser Semantic RAG Search             │ │ 3. Metrik Sosial Toksik di Forum (Like/Count) │
    │ 4. Web Push Notification VAPID Latar Belakang │ │ 4. Polusi Visual Animasi Agresif & Getar Keras│
    │ 5. Red-Teaming Adversarial Krisis C-SSRS      │ │ 5. Ketergantungan Eksternal Pihak Ketiga      │
    └───────────────────────────────────────────────┘ └───────────────────────────────────────────────┘
```

---

### Kuadran 1: TAMBAH (Fitur Baru Bernilai Tinggi)

1. **Dual-Mode Sync Engine (Local-First + E2EE Cloud Backup)**:
   - *Tujuan*: Memungkinkan pengguna menyimpan cadangan data saat berganti perangkat tanpa mengorbankan privasi.
   - *Teknologi*: Protokol sinkronisasi CRDT (*Conflict-free Replicated Data Type*) atau *timestamp-based delta sync*. Payload yang dikirim ke Supabase telah dienkripsi menggunakan kunci turunan dari passkey pengguna via PBKDF2 600.000 iterasi.
2. **Intervensi Klinis Baru: Acceptance & Commitment Therapy (ACT)**:
   - *Kompas Nilai Hidup (Values Clarification)*: Membantu pengguna mengidentifikasi apa yang benar-benar bermakna dalam hidup (hubungan, pertumbuhan pribadi, kesehatan, kontribusi) berdasarkan protokol Hayes et al.
   - *Defusi Kognitif (Cognitive Defusion Exercises)*: Latihan memisahkan diri dari pikiran negatif ("Aku menyadari bahwa pikiranku sedang mengatakan bahwa aku gagal", bukan "Aku adalah orang gagal").
3. **Rencana Pencegahan Relaps (Relapse Prevention Plan)**:
   - *Dasar Klinis*: Marlatt & Gordon Cognitive-Behavioral Relapse Model.
   - *Fitur*: Memetakan pemicu dini (*early warning signs*), daftar tindakan penanggulangan darurat saat terjadi kemunduran emosi, dan afirmasi welas asih agar tidak jatuh ke dalam *Abstinence Violation Effect* (merasa usaha berbulan-bulan sia-sia hanya karena 1 hari buruk).
4. **Asisten Suara On-Device & WebLLM Audio Hening**:
   - Panduan meditasi dan pernapasan berbasis audio lokal tanpa koneksi server menggunakan Web Audio API synthesis atau audio buffer terkompresi berkualitas tinggi.
   - Penjajakan model bahasa lokal ringkas (SmolLM / Qwen 0.5B via ONNX Web Runtime / WebGPU) untuk dialog empati 100% offline.
5. **Ekspor Laporan Konsultasi Faskes BPJS/Puskesmas PDF**:
   - Menghasilkan berkas PDF klinis terstruktur yang merangkum tren skor PHQ-9 & GAD-7 bulanan, pola tidur CBT-I, dan rangkuman pemicu utama tanpa membocorkan isi jurnal intim. Berkas ini siap dicetak atau ditunjukkan langsung kepada Dokter Umum Puskesmas atau Sp.KJ.

---

### Kuadran 2: PERBAIKI (Utang Teknis & Penyempurnaan UX)

1. **Migrasi Penuh Penyimpanan (`localStorage` $\rightarrow$ `IndexedDB`)**:
   - *Masalah Saat Ini*: `localStorage` memiliki batasan kuota 5 MB, bersifat synchronous yang dapat memblokir main-thread, dan menyimpan beberapa data riwayat secara plaintext.
   - *Solusi*: Migrasi menyeluruh menggunakan wrapper IndexedDB reaktif terenkripsi. Menyertakan mekanisme migrasi satu kali (*one-time migration*) yang aman dan otomatis saat aplikasi pertama kali dimuat.
2. **Offline Mutation Queue & Resolusi Konflik**:
   - Antrean transaksi luring (*offline action queue*) di mana postingan forum, respons empati, atau backup yang dibuat saat offline akan tersimpan rapi dan disinkronkan secara mulus begitu jaringan kembali pulih.
   - Resolusi penggabungan data saat pengguna anonim memutuskan untuk menautkan akun emailnya tanpa menimpa data yang sudah ada (*non-destructive merge*).
3. **Optimasi Performa Perangkat Rendah (Low-End Android Optimizations)**:
   - *Chunking Terjemahan Dinamis*: Memisahkan katalog terjemahan bahasa (saat ini ~640 KB total) menjadi modul individual per bahasa (`id.json`, `en.json`, dll.) yang diunduh secara *on-demand*.
   - *Tree-shaking Recharts & Ikon*: Memangkas bundle grafik dan memastikan *First Contentful Paint* (FCP) $\le 1.2$ detik pada koneksi 3G di wilayah Indonesia non-metropolitan.
4. **Ergonomi Input Ponsel & Pencegahan Keyboard Collision**:
   - Memperbaiki komponen form dialog modal dan wizard (CBT, TIPP, Refleksi) agar tombol navigasi primer selalu terlihat dan tidak tertutup oleh keyboard virtual Android/iOS (`interactive-widget=resizes-content` dan `scrollIntoView` cerdas).
5. **Ketahanan Kuota Browser & Storage Persistence**:
   - Meminta izin persistensi penyimpanan otomatis (`navigator.storage.persist()`) agar browser Android (Chrome/Samsung Internet) tidak menghapus data IndexedDB pengguna secara sepihak saat memori perangkat menipis.

---

### Kuadran 3: PERKUAT (Keamanan, Resiliensi & Validasi Klinis)

1. **Zero-Knowledge E2EE by Default**:
   - Enkripsi Web Crypto AES-GCM-256 dijadikan fondasi bawaan (*default*) untuk seluruh penyimpanan data lokal dan cadangan awan, bukan lagi sekadar fitur opsional. Kunci enkripsi diturunkan langsung dari passkey/PIN pengguna dan tidak pernah meninggalkan memori volatile peramban.
2. **Kecerdasan JITAI Adaptif (Just-In-Time Adaptive Intervention)**:
   - Memperluas mesin JITAI agar menghubungkan titik data multimodal: korelasi antara efisiensi tidur yang rendah (< 70%) dengan peningkatan kecemasan di kuadran *High Arousal - Negative Valence* pada sore hari.
   - Memberikan rekomendasi mikro yang tepat waktu, lembut, dan menghargai ritme sirkadian pengguna tanpa menyebabkan kelelahan notifikasi.
3. **In-Browser Semantic RAG & Anti-Halusinasi**:
   - Memperkuat mesin RAG klinis dengan embedding semantik lokal di perangkat (misal: Voy WebAssembly atau MiniSearch BM25 terbobot) untuk memahami nuansa bahasa daerah dan bahasa gaul Indonesia (slang/slank).
   - Penguatan gerbang audit pasca-generasi untuk menjamin tidak ada saran medis ilegal atau validasi premis delusi (*anti-sycophancy*).
4. **Ketahanan Notifikasi Latar Belakang PWA (Web Push VAPID)**:
   - Implementasi Web Push API terenkripsi VAPID yang dapat mengirimkan pengingat koping terencana (misal: "Waktunya relaksasi napas 5 menit") bahkan saat aplikasi sedang ditutup di latar belakang, dengan penanganan keterbatasan iOS 16.4+ Web Push.
5. **Simulasi Red-Teaming Krisis C-SSRS**:
   - Audit keamanan berkala terhadap sistem pendeteksi krisis untuk menguji ketahanan terhadap variasi kalimat berniat bahaya diri (termasuk bahasa daerah, ejaan alternatif, kiasan, dan simbol tersembunyi), memastikan tautan darurat 119 Ext 8 dan 112 selalu muncul tanpa cela.

---

### Kuadran 4: KURANGI (Pemangkasan Beban Kognitif & Fitur Berlebih)

1. **Pemangkasan Gamifikasi Menghakimi ("Toxic Streaks")**:
   - *Masalah Klinis*: Aplikasi kesehatan mental yang memaksakan hitungan *streak* harian justru memicu kecemasan, rasa bersalah (*guilt*), dan perasaan gagal saat pengguna melewatkan satu hari karena sedang sangat tertekan.
   - *Tindakan*: Menghapus indikator streak yang kaku dan menggantinya dengan konsep **Welas Asih (Grace Period & Mindful Momentum)**: "Kamu telah hadir untuk dirimu 5 kali minggu ini. Istirahat juga merupakan bentuk pemulihan."
2. **Penyederhanaan Pilihan Faktor Mood Tracker**:
   - *Masalah Klinis*: Menyajikan puluhan tombol chip pemicu mood (pekerjaan, keluarga, cuaca, cinta, kesehatan, uang, tidur, dll.) menimbulkan kelelahan memilih (*choice overload*) bagi pengguna yang sedang kelelahan kognitif.
   - *Tindakan*: Memangkas daftar panjang tersebut menjadi **4 domain inti terstruktur** yang dinamis sesuai kuadran Yale Mood Meter (Diri Sendiri, Hubungan Sosial, Beban Aktivitas, Kondisi Fisik).
3. **Eliminasi Metrik Sosial Kompetitif di Forum**:
   - *Masalah Klinis*: Fitur seperti penghitung jumlah *like*, jumlah pengikut (*followers*), atau profil publik di komunitas kesehatan mental terbukti secara empiris memicu fenomena perbandingan sosial negatif (*negative social comparison*) dan pencarian validasi semu.
   - *Tindakan*: Menghilangkan like-count dan profil pengguna. Menggantikannya dengan **Resonansi Empati Hening (Quiet Support)**: tanggapan berupa pelukan virtual hangat (*warm support reactions*) tanpa ranking popularitas.
4. **Pembersihan Polusi Visual & Sensorik**:
   - *Tindakan*: Menghilangkan animasi berkecepatan tinggi, efek transisi visual mencolok, dan getaran haptik kasar yang dapat memicu *sensory overstimulation* pada pengguna neurodivergen (ADHD/Autisme) atau individu yang sedang mengalami serangan panik.
5. **Penghapusan Ketergantungan Eksternal Pihak Ketiga**:
   - Memastikan tidak ada script pihak ketiga (Google Fonts runtime, CDNs tak dikenal, analytic trackers) yang dapat membocorkan alamat IP atau jejak perambanan pengguna ke pihak luar.

---

## 4. Jadwal Rilis & Pentahapan Eksekusi (Roadmap Milestones)

```
       FASE 1: Q4 2026                      FASE 2: Q1 2027                   FASE 3: Q2 2027+
  [Fondasi & Dual-Mode System]       [Terapi Lanjutan & Komunitas]       [Multi-Platform & Faskes]
  • Saklar Dual-Mode (Off/On)         • Modul ACT & Relapse Prevention   • Capacitor Android & iOS App
  • Migrasi Total ke IndexedDB        • Forum E2EE (Quiet Circles)       • Ekspor PDF Klinis BPJS
  • Zero-Knowledge E2EE Default       • Semantic In-Browser RAG          • Web Push VAPID Background
  • Pemangkasan Beban Kognitif        • On-Device Audio Synthesis        • Kemitraan Uji Klinis Kampus
```

### Fase 1: Penguatan Fondasi & Arsitektur Dual-Mode (Target: Q4 2026)
- [ ] Implementasi arsitektur **Dual-Mode** di pengaturan dan status bar (Mode 100% Offline Air-Gapped vs Mode Online Hybrid).
- [ ] Migrasi penuh penyimpanan dari `localStorage` ke `IndexedDB` dengan enkripsi transparan Web Crypto AES-GCM-256.
- [ ] Pemangkasan beban kognitif: Menghapus hitungan toxic streak, mengelompokkan faktor mood tracker ke 4 domain, dan membersihkan metrik sosial di Forum.
- [ ] Dynamic chunking berkas translasi bahasa untuk memangkas waktu muat awal pada ponsel berspesifikasi rendah.
- [ ] Penguatan isolasi data tamu anonim dengan fitur *One-Click Local Data Wipe*.

### Fase 2: Terapi Klinis Lanjutan & Komunitas Terenkripsi (Target: Q1 2027)
- [ ] Peluncuran modul **Acceptance & Commitment Therapy (ACT)**: Kompas Nilai Hidup dan Latihan Defusi Kognitif.
- [ ] Peluncuran modul **Relapse Prevention Plan**: Antisipasi pemicu kambuh dan penanganan *Abstinence Violation Effect*.
- [ ] Pembangunan **Quiet Circles**: Forum anonim terenkripsi *end-to-end* dengan dukungan empati terstruktur tanpa metrik popularitas.
- [ ] Integrasi mesin pencari semantik lokal di peramban (In-Browser RAG) untuk eksplorasi psikoedukasi yang lebih cerdas dan kontekstual.
- [ ] Penguatan algoritma rekomendasi adaptif JITAI berbasis analisis multi-hari ritme tidur CBT-I dan suasana hati.

### Fase 3: Ekspansi Multi-Platform & Integrasi Ekosistem Layanan Kesehatan (Target: Q2 2027+)
- [ ] Pembangunan pembungkus mobile native (**Capacitor / Tauri**) untuk distribusi resmi di Google Play Store dan Apple App Store dengan biometrik lokal (Fingerprint/FaceID).
- [ ] Implementasi **Web Push Notifications VAPID** terenkripsi untuk pengingat koping mandiri terjadwal di latar belakang.
- [ ] Peluncuran **Generator Laporan Konsultasi Faskes BPJS/Puskesmas PDF** terstandarisasi.
- [ ] Validasi empiris dan kolaborasi riset klinis dengan universitas atau lembaga psikologi di Indonesia untuk mengukur efikasi penurunan skor depresi/kecemasan pada pengguna muda.

---

## 5. Matriks Risiko & Mitigasi Arsitektur

| Risiko Teknis / Klinis | Tingkat Keparahan | Probabilitas | Strategi Mitigasi Proaktif |
| :--- | :--- | :--- | :--- |
| **Pembersihan IndexedDB oleh OS Mobile** | Tinggi | Sedang | Meminta izin `navigator.storage.persist()` sejak dini dan memberikan edukasi ekspor berkas cadangan berkala kepada pengguna. |
| **Konflik Sinkronisasi Data Saat Beralih Akun** | Sedang | Rendah | Menggunakan protokol penggabungan non-destruktif (*non-destructive union*) berdasarkan stempel waktu kriptografis unik (UUIDv4 + timestamp). |
| **Keterbatasan Memori untuk Model AI Lokal** | Sedang | Sedang | Menjadikan pencarian semantik BM25/vektor ringan sebagai fondasi utama; model WebLLM hanya diaktifkan pada perangkat dengan dukungan WebGPU memadai secara opt-in. |
| **Potensi Penyalahgunaan Forum Anonim** | Tinggi | Rendah | Menggunakan pemindai toksisitas dan krisis on-device sebelum pesan dikirim; mekanisme pelaporan otomatis satu ketukan oleh sesama pengguna. |
| **Bypass Deteksi Krisis Bahasa Gaul/Kiasan** | Sangat Tinggi | Rendah | Pengujian red-teaming berkala dan pemutakhiran kamus tesaurus krisis bahasa Indonesia, Jawa, dan Sunda secara berkelanjutan. |

---

## 6. Standar Kepatuhan Regulasi & Kebijakan Etika

1. **UU Pelindungan Data Pribadi No. 27/2022**:
   - Seluruh data kesehatan mental diklasifikasikan sebagai *Data Pribadi yang Bersifat Spesifik*.
   - Tidak ada pengumpulan data telemetri, analitik eksternal, atau pelacak pihak ketiga tanpa persetujuan eksplisit.
   - Tersedia hak penghapusan data mutlak (*right to erasure*) melalui fitur pembersihan satu kali sentuh.
2. **UU Kesehatan No. 17/2023 & Permenkes Terkait**:
   - RIMA secara tegas mematuhi batasan non-diagnostik: aplikasi berfungsi sebagai alat bantu pertolongan pertama psikologis, psikoedukasi, dan skrining awal, bukan sebagai pengganti dokter spesialis kedokteran jiwa (Sp.KJ) atau psikolog klinis.
3. **WHO Guidelines on Digital Health Interventions**:
   - Menjunjung tinggi keadilan akses (*equity of access*) dengan mempertahankan fungsionalitas utama 100% gratis, bebas iklan, dan dapat diakses tanpa koneksi internet.
