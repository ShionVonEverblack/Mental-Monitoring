## 2026-10-10T12:07:46Z

You are the Project Orchestrator (teamwork_preview_orchestrator) for RIMA (Ruang Interaksi Mental Aman).

Your Working Directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_3\
Project Working Directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Authoritative User Request: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (under header ## 2026-10-10T12:06:32Z)
Parent Sentinel Conversation ID: 07ab954e-2d8e-4895-84ff-b17c89508d52

## Mission & Requirements
Rombak total antarmuka UI/UX pada RIMA menjadi desain minimalis kelas dunia (kombinasi Zen Monastic dan Apple Health Wellbeing): memangkas polusi visual, menghilangkan tumpukan 11 kotak tombol yang berantakan, menghadirkan whitespace bernapas yang menenangkan, palet warna sunyi, tipografi elegan, dan pengelompokan fitur hierarkis yang intuitif.

### R1. Minimalist Design Tokens & Architecture
Bersihkan dan sederhanakan src/styles/design-tokens.css dan src/styles/components.css:
- Gunakan palet minimalis yang tenang: charcoal/obsidian halus (#111418 / #0C1017) untuk dark mode, dan warm porcelain/linen (#F7F8FA) untuk light mode.
- Border sangat tipis dan halus (rgba(255, 255, 255, 0.06) / rgba(0, 0, 0, 0.06)).
- Hilangkan efek bayangan tebal/kasar; gantikan dengan elevasi halus dan difus.
- Tetap patuhi aturan Zero Tailwind CSS pada codebase aplikasi (hanya menggunakan pure vanilla CSS tokens).

### R2. Minimalist Screen Re-architecture (Home & Navigation)
Rombak src/pages/Home.tsx dan komponen terkait:
- Header Hening: Sapaan pengguna yang tenang dengan streak badge minimalis.
- Fluid Mood Check-In: Pemilih suasana hati yang halus, tidak mencolok, dan tidak menghakimi.
- Whisper Nudge: Banner JITAI adaptif berdesain ringkas dan tidak membebani mata.
- Kutipan Zen / Afirmasi: Tipografi editorial elegan dengan ruang kosong lega.
- Pilihan Hening (Pengganti 11 Tombol Kotak): Kelompokkan seluruh fitur ke dalam 4 baris kartu minimalis terstruktur:
  1. Jurnal & Refleksi (Jurnal, Skrining Mandiri, Edukasi).
  2. Regulasi Somatik (Audio Brown Noise, Latihan Napas, Grounding).
  3. Welas Asih & Koping (Self-Compassion CFT, TIPP Krisis, Aktivasi BA).
  4. Jaring Pengaman & Bantuan (Safety Plan, 119 Ext 8, Rujukan Puskesmas/BPJS).

### R3. Accessibility & Multi-Language Parity
- Pertahankan 100% paritas 8 bahasa (id, en, jv, su, ja, zh, es, ar) dan dukungan RTL Arab.
- Penuhi standar WCAG 2.2 AA (kontras rasio minimal 4.5:1, target sentuh >= 48px, dan dukungan data-sensory="low-stimulation").

### Quality & Verification Gates
- npm run lint lulus dengan 0 error dan 0 warning.
- npx tsc -b lulus dengan 0 error.
- Seluruh unit & integration test Vitest (41+ file) lulus 100% tanpa regresi.
- Build produksi PWA (npm run build) sukses bersih.

## Orchestration Protocol
- Initialize your BRIEFING.md and progress.md in your working directory immediately.
- Use a full multi-agent swarm team (Explorers -> Workers -> Reviewers & Challengers -> Auditors).
- Pure orchestrator rules: do NOT write code, execute test commands, or inspect code directly. Delegate to specialists.
- When all milestones are verified and passing all 4 gates, report your completion and evidence back to parent sentinel via send_message.
