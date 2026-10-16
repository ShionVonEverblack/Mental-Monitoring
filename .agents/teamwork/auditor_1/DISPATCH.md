## 2026-10-10T07:30:10Z

You are Auditor 1 (Forensic Integrity Auditor).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\auditor_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original request is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md

Your role is FORENSIC INTEGRITY AUDIT. You have BINARY VETO POWER over the milestone.
Check for any signs of cheating, hardcoded test results, facade implementations, test circumvention, or hidden network telemetry:
1. Inspect `src/services/jitaiEngine.ts`, `src/services/jitaiPersistence.ts`, `src/services/safetyCardService.ts`:
   - Are the heuristic rules and calculations genuinely implemented?
   - Is there any hardcoded output for specific test IDs or mock inputs?
   - Is the JITAI engine strictly zero-network and on-device (no fetch/axios/WebSocket/telemetry)?
2. Inspect `src/components/safety/FastActionSafetyCard.tsx` and `src/components/common/JitaiNudgeCard.tsx`:
   - Are the components genuinely connected to services and hooks, or are they dummy mock facades?
   - Is `tel:119,8` a real `<a>` link?
   - Is vanilla CSS design token styling genuinely applied (zero Tailwind)?
3. Inspect `src/i18n/*.json`:
   - Are translations across all 8 languages genuine and meaningful, or are they fake placeholders?
4. Inspect tests in `src/test/` and `src/**/__tests__/`:
   - Are tests asserting genuine functionality, or are they trivial `expect(true).toBe(true)` stubs?
5. Run verification commands:
   - `npm run lint`
   - `npx tsc -b`
   - `npx vitest run`
   - `npm run build`
6. Issue your final forensic verdict:
   - CLEAN (no cheating detected, authentic implementation)
   - INTEGRITY VIOLATION (with detailed evidence if any violation is found).
7. Write your report to C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\auditor_1\handoff.md.
8. Notify parent via send_message with your verdict.


## 2026-10-16T15:18:25Z

Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\auditor_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Your parent conversation ID is: 48352f5f-9886-427a-8349-7e97d590f76b

<original_task>
This is a single self-contained fix; keep it small and focused.
Implementasikan Langkah 1 Prioritas Tinggi (P1) untuk RIMA (Ruang Interaksi Mental Aman): Ergonomi Sentuh Mobile & Pencegahan Tabrakan Keyboard Virtual (Keyboard Collision Avoidance) pada seluruh halaman form, dialog modal, drawer chatbot, dan wizard interaktif agar tombol aksi primer tidak pernah tertutup oleh keyboard virtual Android maupun iOS.

Working directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Integrity mode: development

## Requirements

### R1. Viewport & VisualViewport Keyboard Avoidance
Pastikan antarmuka aplikasi beradaptasi secara responsif ketika keyboard virtual perangkat seluler (Android/iOS) terbuka:
- Konfigurasikan perilaku viewport HTML dan CSS dinamis sehingga area layar menyesuaikan tinggi ruang kerja aktual saat keyboard muncul.
- Sediakan mekanisme adaptif berbasis `window.visualViewport` yang mendeteksi pembukaan keyboard virtual dan menyesuaikan ruang gulir (*scroll padding* / *safe-area inset*) secara otomatis.

### R2. Visibilitas Tombol Aksi pada Form, Modal, Wizard & Chatbot
Pastikan ketika pengguna memfokuskan input teks atau `textarea` (seperti pada Jurnal, CBT Wizard, Forum, Rencana Keselamatan, Relapse Prevention, ACT, dan Chatbot Drawer):
- Elemen input aktif secara mulus digulirkan ke dalam area pandang yang aman tanpa tertutup keyboard maupun navigasi bawah (*BottomNav*).
- Dialog modal dan laci percakapan (*drawer*) tetap dapat digulirkan penuh dan tombol aksi utamanya (*Simpan*, *Lanjut*, *Kirim*, *Batal*) selalu dapat dijangkau dengan nyaman.
- Menghormati preferensi aksesibilitas `prefers-reduced-motion` dan `data-sensory="low-stimulation"` (menggunakan perilaku gulir instan tanpa animasi mengejutkan saat mode stimulasi rendah aktif).

### R3. Guardrails Arsitektur & 4 Quality Gates RIMA
- Patuhi penggunaan murni Vanilla CSS design tokens (Zero Tailwind CSS).
- Pertahankan 100% paritas terjemahan 8 bahasa (`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`) jika ada atribut atau label aksesibilitas baru.
- Tambahkan unit/integration test otomatis di Vitest yang memverifikasi adaptasi `visualViewport`, perilaku fokus input, dan pencegahan tabrakan keyboard.

## Acceptance Criteria

### Functional & Ergonomic Criteria
- [ ] Konfigurasi viewport mendukung adaptasi ukuran konten terhadap keyboard virtual seluler.
- [ ] Saat elemen input/textarea difokuskan di dalam halaman maupun modal, sistem menyesuaikan posisi gulir dan offset bawah sehingga tombol aksi primer tetap terjangkau.
- [ ] Mode `prefers-reduced-motion` dan `data-sensory="low-stimulation"` tetap dihormati sepenuhnya.
- [ ] Pengujian unit/integrasi baru untuk ergonomi keyboard virtual lulus 100%.

### Quality & Verification Gates
- [ ] `npm run lint` (`oxlint`) lulus dengan 0 error dan 0 warning.
- [ ] `npx tsc -b` lulus dengan 0 error.
- [ ] `npm test` (`vitest run`) lulus 100% pada seluruh berkas pengujian tanpa regresi.
- [ ] `npm run build` berhasil membangun bundel produksi PWA dan Service Worker dengan bersih.
</original_task>

Instructions:
Conduct an independent 3-phase audit (timeline analysis, cheating detection, and independent test execution of npm run lint, npx tsc -b, npm test, and npm run build).
Write your audit report and verdict (CONFIRMED or REJECTED) to C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\auditor_1\handoff.md.
When finished, send a message back to parent (ID: 48352f5f-9886-427a-8349-7e97d590f76b) with your verdict and findings.
