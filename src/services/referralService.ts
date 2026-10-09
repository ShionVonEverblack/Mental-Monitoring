import { getStoredMoods } from '../utils/exportImport';
import { getAssessmentHistory } from './assessmentService';
import { getCssrsHistory } from './cssrsService';
import { getLocaleTag } from '../utils/helpers';
import type { AssessmentResult, CssrsResult } from '../types';

export interface BpjsStep {
  number: number;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
  checklistKey: string[];
  checklistFallback: string[];
}

export interface DoctorScript {
  id: 'depression' | 'anxiety' | 'stress';
  categoryKey: string;
  categoryFallback: string;
  scriptKey: string;
  scriptFallback: string;
}

export const BPJS_STEPS: BpjsStep[] = [
  {
    number: 1,
    titleKey: 'referral.step1_title',
    titleFallback: '1. Kunjungi Faskes Tingkat Pertama (FKTP / Puskesmas)',
    descKey: 'referral.step1_desc',
    descFallback: 'Datangi Puskesmas atau Klinik Pratama yang tertera di kartu BPJS Kesehatan atau aplikasi Mobile JKN Anda.',
    checklistKey: [
      'referral.step1_item1',
      'referral.step1_item2',
      'referral.step1_item3',
    ],
    checklistFallback: [
      'Bawa KTP asli & Kartu BPJS / tunjukkan status aktif di Mobile JKN',
      'Ambil nomor antrean poli umum di loket pendaftaran',
      '100% Gratis & tanpa biaya pendaftaran tambahan',
    ],
  },
  {
    number: 2,
    titleKey: 'referral.step2_title',
    titleFallback: '2. Konsultasi Dokter Umum & Minta Surat Rujukan',
    descKey: 'referral.step2_desc',
    descFallback: 'Ceritakan keluhan psikologis Anda secara terbuka kepada dokter umum. Anda berhak mendapatkan rujukan jika faskes belum memiliki fasilitas psikiatri.',
    checklistKey: [
      'referral.step2_item1',
      'referral.step2_item2',
      'referral.step2_item3',
    ],
    checklistFallback: [
      'Gunakan Skrip Percakapan RIMA di bawah jika merasa canggung/bingung bercerita',
      'Tunjukkan Ringkasan Klinis RIMA (skor PHQ-9/GAD-7 & grafik suasana hati)',
      'Minta dokter menerbitkan Surat Rujukan Online (P-Care) ke Poli Jiwa / Sp.KJ RSUD',
    ],
  },
  {
    number: 3,
    titleKey: 'referral.step3_title',
    titleFallback: '3. Pemeriksaan di Poli Jiwa RSUD / FKRTL',
    descKey: 'referral.step3_desc',
    descFallback: 'Kunjungi RSUD tujuan sesuai tanggal rujukan untuk bertemu Psikiater (Sp.KJ) atau Psikolog Klinis.',
    checklistKey: [
      'referral.step3_item1',
      'referral.step3_item2',
      'referral.step3_item3',
    ],
    checklistFallback: [
      'Konsultasi medis dan psikoterapi ditanggung penuh oleh BPJS',
      'Obat-obatan psikofarmaka (antidepresan/antiansietas) sesuai resep Fornas BPJS gratis',
      'Surat rujukan umumnya berlaku 3 bulan untuk kontrol berkala',
    ],
  },
];

export const DOCTOR_SCRIPTS: DoctorScript[] = [
  {
    id: 'depression',
    categoryKey: 'referral.script_depression_cat',
    categoryFallback: 'Gejala Depresi & Kelelahan Emosional Berkepanjangan',
    scriptKey: 'referral.script_depression_text',
    scriptFallback:
      'Selamat pagi/siang Dok. Belakangan ini saya merasa terus-menerus sedih, sangat lelah tanpa sebab fisik yang jelas, kehilangan minat, dan sulit tidur selama lebih dari dua minggu. Gejala ini mulai mengganggu aktivitas sehari-hari saya. Saya ingin berkonsultasi mengenai kondisi ini dan memohon bantuan rujukan ke Poli Jiwa atau Psikolog Klinis RSUD untuk evaluasi lebih lanjut.',
  },
  {
    id: 'anxiety',
    categoryKey: 'referral.script_anxiety_cat',
    categoryFallback: 'Gejala Serangan Cemas, Panik, & Dada Berdebar',
    scriptKey: 'referral.script_anxiety_text',
    scriptFallback:
      'Dok, saya sering mengalami serangan cemas mendadak di mana dada terasa sesak, jantung berdebar kencang, dan tangan gemetar, padahal hasil pemeriksaan fisik normal. Saya merasa membutuhkan bantuan spesialis kedokteran jiwa untuk mengelola kecemasan ini. Bisakah Dokter membantu membuatkan rujukan BPJS ke Poli Jiwa?',
  },
  {
    id: 'stress',
    categoryKey: 'referral.script_stress_cat',
    categoryFallback: 'Tekanan Stres Berat & Pikiran Negatif Berulang (Remaja/Mahasiswa)',
    scriptKey: 'referral.script_stress_text',
    scriptFallback:
      'Dok, saya mengalami tekanan beban emosional yang berat sampai membuat saya sulit fokus belajar/bekerja, merasa putus asa, dan memiliki pikiran negatif yang berulang. Saya ingin mendapatkan bantuan konseling atau evaluasi psikiatri profesional melalui BPJS. Mohon bantuannya, Dok.',
  },
];

export interface ClinicalHandoverData {
  generatedAt: string;
  latestPhq9: AssessmentResult | null;
  latestGad7: AssessmentResult | null;
  latestCssrs: CssrsResult | null;
  avgMoodScore: number | null;
  totalMoodLogs: number;
  topFactors: string[];
}

export function getClinicalHandoverData(): ClinicalHandoverData {
  const assessments = getAssessmentHistory();
  const latestPhq9 = assessments.find(a => a.type === 'phq9') || null;
  const latestGad7 = assessments.find(a => a.type === 'gad7') || null;

  const cssrsList = getCssrsHistory();
  const latestCssrs = cssrsList.length > 0 ? cssrsList[0] : null;

  const moods = getStoredMoods();
  const totalMoodLogs = moods.length;

  let avgMoodScore: number | null = null;
  if (moods.length > 0) {
    const sum = moods.reduce((acc, m) => acc + m.score, 0);
    avgMoodScore = Number((sum / moods.length).toFixed(1));
  }

  const factorMap: Record<string, number> = {};
  moods.forEach(m => {
    (m.factors || []).forEach(f => {
      factorMap[f] = (factorMap[f] || 0) + 1;
    });
  });
  const topFactors = Object.entries(factorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([f]) => f);

  return {
    generatedAt: new Date().toISOString(),
    latestPhq9,
    latestGad7,
    latestCssrs,
    avgMoodScore,
    totalMoodLogs,
    topFactors,
  };
}

export function formatSeverityLabel(severity: string, isEn = false): string {
  const map: Record<string, { id: string; en: string }> = {
    minimal: { id: 'Minimal', en: 'Minimal' },
    mild: { id: 'Ringan', en: 'Mild' },
    moderate: { id: 'Sedang', en: 'Moderate' },
    moderately_severe: { id: 'Cukup Berat', en: 'Moderately Severe' },
    severe: { id: 'Berat', en: 'Severe' },
  };
  const val = map[severity];
  return val ? (isEn ? val.en : val.id) : severity;
}

export function generateDoctorHandoverBriefHTML(lang = 'id', customPatientNote = ''): string {
  const activeLang = lang.split('-')[0] || 'id';
  const localeTag = getLocaleTag(activeLang);
  const data = getClinicalHandoverData();
  const dateStr = new Date().toLocaleDateString(localeTag, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isEn = activeLang === 'en';

  const phq9Text = data.latestPhq9
    ? `${data.latestPhq9.score}/27 (${formatSeverityLabel(data.latestPhq9.severity, isEn)}) — ${new Date(data.latestPhq9.createdAt).toLocaleDateString(localeTag)}`
    : isEn ? 'No PHQ-9 screening recorded' : 'Belum ada data skrining PHQ-9';

  const gad7Text = data.latestGad7
    ? `${data.latestGad7.score}/21 (${formatSeverityLabel(data.latestGad7.severity, isEn)}) — ${new Date(data.latestGad7.createdAt).toLocaleDateString(localeTag)}`
    : isEn ? 'No GAD-7 screening recorded' : 'Belum ada data skrining GAD-7';

  const cssrsText = data.latestCssrs
    ? `Tingkat Risiko: ${data.latestCssrs.evaluation.riskLevel.toUpperCase()} — ${new Date(data.latestCssrs.createdAt).toLocaleDateString(localeTag)}`
    : isEn ? 'Not assessed / None' : 'Tidak ada evaluasi risiko aktif';

  const avgMoodText = data.avgMoodScore !== null
    ? `${data.avgMoodScore} / 5 (${data.totalMoodLogs} catatan)`
    : isEn ? 'No mood data' : 'Belum ada data suasana hati';

  const factorsText = data.topFactors.length > 0
    ? data.topFactors.join(', ')
    : isEn ? 'None recorded' : 'Tidak terdata';

  const noteBlock = customPatientNote.trim()
    ? `
      <div class="section">
        <h3>${isEn ? 'Patient Subjective Statement / Chief Complaint' : 'Keluhan Utama & Catatan Subjektif Pasien'}</h3>
        <p class="patient-note">${customPatientNote.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</p>
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="${activeLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Clinical Handover Brief — RIMA' : 'Ringkasan Rujukan Klinis — RIMA'}</title>
  <style>
    @page { margin: 15mm; size: A4 portrait; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header h1 {
      margin: 0 0 4px 0;
      font-size: 18pt;
      color: #0f172a;
    }
    .header p {
      margin: 0;
      font-size: 10pt;
      color: #64748b;
    }
    .date-badge {
      font-size: 9pt;
      color: #475569;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 500;
    }
    .purpose-box {
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 10px 14px;
      font-size: 9.5pt;
      margin-bottom: 20px;
      color: #0369a1;
      border-radius: 0 6px 6px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #fafafa;
    }
    .card h3 {
      margin: 0 0 6px 0;
      font-size: 10.5pt;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .card .value {
      font-size: 12pt;
      font-weight: 600;
      color: #0f172a;
    }
    .section {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
      background: #ffffff;
    }
    .section h3 {
      margin: 0 0 8px 0;
      font-size: 11pt;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
    }
    .patient-note {
      font-size: 10pt;
      color: #334155;
      background: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      margin: 0;
      font-style: italic;
    }
    .soap-row {
      margin-bottom: 8px;
      font-size: 9.5pt;
    }
    .soap-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      width: 140px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${isEn ? 'Clinical Handover Brief' : 'Lembar Ringkasan Klinis & Rujukan Pasien'}</h1>
      <p>${isEn ? 'Standardized Self-Monitoring Summary for General Practitioner / Puskesmas Doctor' : 'Ringkasan Pemantauan Mandiri Terstandar untuk Dokter Pemeriksa di FKTP (Puskesmas / Klinik)'}</p>
    </div>
    <div class="date-badge">${dateStr}</div>
  </div>

  <div class="purpose-box">
    <strong>${isEn ? 'Clinical Purpose:' : 'Tujuan Klinis:'}</strong>
    ${isEn
      ? 'This brief compiles standardized patient-reported outcomes to assist primary care physicians with rapid triage, anamnesis, and BPJS psychiatric referral processing.'
      : 'Lembar ini merangkum data penilaian mandiri terstandar pasien dari aplikasi RIMA untuk mempercepat proses anamnesis dokter umum di Puskesmas dan mempermudah penerbitan Surat Rujukan BPJS ke Poli Jiwa RSUD.'}
  </div>

  <div class="grid">
    <div class="card">
      <h3>${isEn ? 'PHQ-9 Depression Screener' : 'Skrining Depresi PHQ-9'}</h3>
      <div class="value">${phq9Text}</div>
    </div>
    <div class="card">
      <h3>${isEn ? 'GAD-7 Anxiety Screener' : 'Skrining Kecemasan GAD-7'}</h3>
      <div class="value">${gad7Text}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>${isEn ? 'C-SSRS Safety Assessment' : 'Evaluasi Keselamatan C-SSRS'}</h3>
      <div class="value">${cssrsText}</div>
    </div>
    <div class="card">
      <h3>${isEn ? '30-Day Mood Baseline' : 'Rata-rata Suasana Hati 30 Hari'}</h3>
      <div class="value">${avgMoodText}</div>
    </div>
  </div>

  <div class="section">
    <h3>${isEn ? 'Primary Distress Triggers & Factors' : 'Faktor Pemicu & Konteks Distres'}</h3>
    <div class="soap-row">
      <span class="soap-label">${isEn ? 'Top Life Factors:' : 'Faktor Utama:'}</span>
      <span>${factorsText}</span>
    </div>
    <div class="soap-row">
      <span class="soap-label">${isEn ? 'Self-Monitoring Logs:' : 'Frekuensi Check-in:'}</span>
      <span>${data.totalMoodLogs} ${isEn ? 'total entries recorded' : 'total catatan tersimpan di perangkat'}</span>
    </div>
  </div>

  ${noteBlock}

  <div class="section">
    <h3>${isEn ? 'Recommended Primary Care Action' : 'Rekomendasi Tindak Lanjut Faskes 1 (FKTP)'}</h3>
    <p style="margin: 0; font-size: 9.5pt; color: #334155;">
      ${isEn
        ? 'Based on validated psychometric indicators, comprehensive clinical evaluation and/or secondary referral (P-Care) to RSUD Psychiatric Outpatient Clinic (Poli Jiwa / Sp.KJ) is respectfully requested.'
        : 'Berdasarkan indikator psikometrik terstandar di atas, pasien memohon evaluasi klinis komprehensif dari dokter pemeriksa dan pertimbangan penerbitan Surat Rujukan BPJS Online ke Poli Jiwa / Dokter Spesialis Kedokteran Jiwa (Sp.KJ) RSUD rujukan.'}
    </p>
  </div>

  <div class="footer">
    ${isEn
      ? 'Generated by RIMA (Ruang Interaksi Mental Aman) — Confidential Patient Health Data — Processed 100% locally on device.'
      : 'Diterbitkan secara mandiri melalui RIMA (Ruang Interaksi Mental Aman) — Data Rahasia Pasien — 100% diproses secara lokal pada perangkat.'}
  </div>
</body>
</html>`;
}

export function downloadDoctorHandoverBrief(lang = 'id', customPatientNote = ''): void {
  const html = generateDoctorHandoverBriefHTML(lang, customPatientNote);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `rima-ringkasan-rujukan-dokter-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printDoctorHandoverBrief(lang = 'id', customPatientNote = ''): void {
  const html = generateDoctorHandoverBriefHTML(lang, customPatientNote);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  } else {
    // Fallback to download if pop-up blocked
    downloadDoctorHandoverBrief(lang, customPatientNote);
  }
}
