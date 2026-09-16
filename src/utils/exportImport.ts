import type { MoodEntry, JournalEntry, SafetyPlan, UserProfile } from '../types';
import { getLocaleTag } from './helpers';

export interface RimaBackupData {
  version: string;
  exportedAt: string;
  user: UserProfile | null;
  moods: MoodEntry[];
  journals: JournalEntry[];
  safetyPlan: SafetyPlan | null;
}

export function generateBackupData(): RimaBackupData {
  const getItem = <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user: getItem<UserProfile | null>('rima-user-profile', null),
    moods: getItem<MoodEntry[]>('rima-moods', []),
    journals: getItem<JournalEntry[]>('rima-journals', []),
    safetyPlan: getItem<SafetyPlan | null>('rima-safety-plan', null),
  };
}

export function downloadJSONFile(data: object, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllDataAsJSON() {
  const backup = generateBackupData();
  const dateStr = new Date().toISOString().split('T')[0];
  downloadJSONFile(backup, `rima-backup-${dateStr}.json`);
}

const getActiveLang = (lang?: string): string => {
  if (lang) return lang.split('-')[0];
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng')?.split('-')[0] || 'id';
  }
  return 'id';
};

export function sanitizeCSVCell(val: string): string {
  const escaped = (val || '').replace(/"/g, '""');
  // OWASP CSV Injection defense: prepend single quote if cell begins with =, +, -, @, tab, or carriage return
  if (/^[=+\-@\t\r]/.test(escaped)) {
    return `'${escaped}`;
  }
  return escaped;
}

export function exportMoodsAsCSV(lang?: string): boolean {
  const activeLang = getActiveLang(lang);
  const localeTag = getLocaleTag(activeLang);
  const isEn = activeLang === 'en';

  const moods: MoodEntry[] = (() => {
    try {
      const item = localStorage.getItem('rima-moods');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  })();

  if (moods.length === 0) {
    // Caller should show gentle toast instead of alert() — Calm Technology
    return false;
  }

  const headers = isEn
    ? ['Date & Time', 'Mood Score (1-5)', 'Emoji', 'Trigger Factors', 'Notes']
    : ['Tanggal & Waktu', 'Skor Mood (1-5)', 'Emoji', 'Faktor Pemicu', 'Catatan'];

  const rows = moods.map(m => [
    `"${new Date(m.createdAt).toLocaleString(localeTag)}"`,
    m.score,
    `"${m.emoji}"`,
    `"${(m.factors || []).join(', ')}"`,
    `"${sanitizeCSVCell(m.note || '')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = isEn ? `rima-mood-history-${dateStr}.csv` : `rima-riwayat-mood-${dateStr}.csv`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Export journal entries as CSV — APA App Advisor Tier 1 Data Portability.
 */
export function exportJournalsAsCSV(lang?: string): boolean {
  const activeLang = getActiveLang(lang);
  const localeTag = getLocaleTag(activeLang);
  const isEn = activeLang === 'en';

  const journals: JournalEntry[] = (() => {
    try {
      const item = localStorage.getItem('rima-journals');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  })();

  if (journals.length === 0) {
    return false;
  }

  const headers = isEn
    ? ['Date & Time', 'Template', 'Title', 'Content']
    : ['Tanggal & Waktu', 'Template', 'Judul', 'Konten'];

  const rows = journals.map(j => [
    `"${new Date(j.createdAt).toLocaleString(localeTag)}"`,
    `"${j.template || 'free'}"`,
    `"${sanitizeCSVCell(j.title || '')}"`,
    `"${sanitizeCSVCell(j.content || '').replace(/\n/g, ' ')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = isEn ? `rima-journals-${dateStr}.csv` : `rima-jurnal-${dateStr}.csv`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Generate clinical summary HTML — APA App Advisor Tier 4 Therapeutic Integration.
 * Produces a formatted HTML file that can be printed or shared with a therapist.
 */
export function generateClinicalSummaryHTML(lang?: string): boolean {
  const activeLang = getActiveLang(lang);
  const localeTag = getLocaleTag(activeLang);
  const isEn = activeLang === 'en';

  const backup = generateBackupData();
  
  if (backup.moods.length === 0 && backup.journals.length === 0) {
    return false;
  }

  const sortedMoods = [...backup.moods].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const avgMood = sortedMoods.length > 0 ? (sortedMoods.reduce((s, m) => s + m.score, 0) / sortedMoods.length).toFixed(1) : 'N/A';
  
  // Factor frequency analysis
  const factorCounts: Record<string, number> = {};
  sortedMoods.forEach(m => (m.factors || []).forEach(f => { factorCounts[f] = (factorCounts[f] || 0) + 1; }));
  const topFactors = Object.entries(factorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Escalation history
  const escalationLog = (() => {
    try {
      return JSON.parse(localStorage.getItem('rima-escalation-log') || '[]');
    } catch { return []; }
  })();

  const dateStr = new Date().toISOString().split('T')[0];

  const tDict = isEn ? {
    title: `RIMA — Clinical Summary ${dateStr}`,
    header: '📊 RIMA — Mental Health Companion Report',
    reportDate: 'Report Date:',
    dataPeriod: 'Data Period:',
    to: 'to',
    disclaimerTitle: 'Important Note:',
    disclaimerText: 'This document is generated by RIMA as a self-monitoring companion tool. The data is subjective and does not constitute a clinical diagnosis or medical evaluation. Professional interpretation should be conducted by a qualified mental health practitioner.',
    statsTitle: '📈 Statistical Summary',
    totalMoods: 'Total Mood Entries:',
    totalJournals: 'Total Journals:',
    avgMood: 'Average Mood:',
    topFactorsTitle: '🏷️ Top Trigger Factors',
    factor: 'Factor',
    frequency: 'Frequency',
    historyTitle: '📅 Mood History (Last 30 Entries)',
    colDate: 'Date',
    colScore: 'Score',
    colEmoji: 'Emoji',
    colFactors: 'Factors',
    colNotes: 'Notes',
    escalationTitle: '⚠️ Escalation History',
    level: 'Level',
    description: 'Description',
    safetyPlanTitle: '🛡️ Safety Plan (Stanley-Brown SPI)',
    component: 'Component',
    content: 'Content',
    warningSigns: 'Warning Signs',
    copingStrategies: 'Coping Strategies',
    socialContacts: 'Social Contacts',
    professionals: 'Mental Health Professionals',
    safeEnvironment: 'Safe Environment',
    reasonsToLive: 'Reasons for Living',
    footerCreated: `Generated by RIMA (Safe Mental Interaction Space) v1.0 — ${dateStr}`,
    footerPrivacy: 'All data is processed locally on the user device. No data is transmitted to external servers.'
  } : {
    title: `RIMA — Laporan Klinis ${dateStr}`,
    header: '📊 RIMA — Laporan Pendampingan Kesehatan Mental',
    reportDate: 'Tanggal Laporan:',
    dataPeriod: 'Periode Data:',
    to: 's/d',
    disclaimerTitle: 'Catatan Penting:',
    disclaimerText: 'Dokumen ini dihasilkan oleh RIMA sebagai alat pendampingan mandiri. Data ini bersifat subjektif dan bukan merupakan diagnosis atau evaluasi klinis. Interpretasi harus dilakukan oleh profesional kesehatan mental yang berkualifikasi.',
    statsTitle: '📈 Ringkasan Statistik',
    totalMoods: 'Total Entri Mood:',
    totalJournals: 'Total Jurnal:',
    avgMood: 'Rata-rata Mood:',
    topFactorsTitle: '🏷️ Faktor Pemicu Teratas',
    factor: 'Faktor',
    frequency: 'Frekuensi',
    historyTitle: '📅 Riwayat Mood (30 Entri Terakhir)',
    colDate: 'Tanggal',
    colScore: 'Skor',
    colEmoji: 'Emoji',
    colFactors: 'Faktor',
    colNotes: 'Catatan',
    escalationTitle: '⚠️ Riwayat Eskalasi',
    level: 'Level',
    description: 'Keterangan',
    safetyPlanTitle: '🛡️ Rencana Keselamatan (Stanley-Brown SPI)',
    component: 'Komponen',
    content: 'Isi',
    warningSigns: 'Tanda Peringatan',
    copingStrategies: 'Strategi Koping',
    socialContacts: 'Kontak Sosial',
    professionals: 'Tenaga Profesional',
    safeEnvironment: 'Lingkungan Aman',
    reasonsToLive: 'Alasan untuk Tetap Ada',
    footerCreated: `Dibuat oleh RIMA (Ruang Interaksi Mental Aman) v1.0 — ${dateStr}`,
    footerPrivacy: 'Semua data diproses secara lokal di perangkat pengguna. Tidak ada data yang dikirim ke server.'
  };

  const html = `<!DOCTYPE html>
<html lang="${activeLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tDict.title}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #333; }
    h1 { color: #4a7cf7; border-bottom: 2px solid #4a7cf7; padding-bottom: 8px; }
    h2 { color: #47b897; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .disclaimer { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 0.875rem; }
    .metric { display: inline-block; padding: 8px 16px; margin: 4px; background: #f0f0f0; border-radius: 8px; }
    .severe { color: #d64242; font-weight: 600; }
    @media print { .disclaimer { background: #ffe; } }
  </style>
</head>
<body>
  <h1>${tDict.header}</h1>
  <p><strong>${tDict.reportDate}</strong> ${new Date().toLocaleDateString(localeTag, { dateStyle: 'full' })}</p>
  <p><strong>${tDict.dataPeriod}</strong> ${sortedMoods.length > 0 ? new Date(sortedMoods[sortedMoods.length - 1].createdAt).toLocaleDateString(localeTag) : '-'} ${tDict.to} ${sortedMoods.length > 0 ? new Date(sortedMoods[0].createdAt).toLocaleDateString(localeTag) : '-'}</p>
  
  <div class="disclaimer">
    ⚕️ <strong>${tDict.disclaimerTitle}</strong> ${tDict.disclaimerText}
  </div>

  <h2>${tDict.statsTitle}</h2>
  <div>
    <span class="metric">📊 ${tDict.totalMoods} <strong>${sortedMoods.length}</strong></span>
    <span class="metric">📝 ${tDict.totalJournals} <strong>${backup.journals.length}</strong></span>
    <span class="metric">⭐ ${tDict.avgMood} <strong>${avgMood}/5</strong></span>
  </div>

  ${topFactors.length > 0 ? `
  <h2>${tDict.topFactorsTitle}</h2>
  <table>
    <tr><th>${tDict.factor}</th><th>${tDict.frequency}</th></tr>
    ${topFactors.map(([f, c]) => `<tr><td>${f}</td><td>${c}x</td></tr>`).join('\n    ')}
  </table>
  ` : ''}

  <h2>${tDict.historyTitle}</h2>
  <table>
    <tr><th>${tDict.colDate}</th><th>${tDict.colScore}</th><th>${tDict.colEmoji}</th><th>${tDict.colFactors}</th><th>${tDict.colNotes}</th></tr>
    ${sortedMoods.slice(0, 30).map(m => `<tr>
      <td>${new Date(m.createdAt).toLocaleDateString(localeTag)}</td>
      <td>${m.score}/5</td>
      <td>${m.emoji}</td>
      <td>${(m.factors || []).join(', ') || '-'}</td>
      <td>${(m.note || '-').substring(0, 100)}</td>
    </tr>`).join('\n    ')}
  </table>

  ${escalationLog.length > 0 ? `
  <h2 class="severe">${tDict.escalationTitle}</h2>
  <table>
    <tr><th>${tDict.colDate}</th><th>${tDict.level}</th><th>${tDict.description}</th></tr>
    ${escalationLog.map((e: { timestamp: string; level: number; messageKey: string }) => `<tr>
      <td>${new Date(e.timestamp).toLocaleDateString(localeTag)}</td>
      <td class="${e.level >= 3 ? 'severe' : ''}">${e.level}</td>
      <td>${e.messageKey}</td>
    </tr>`).join('\n    ')}
  </table>
  ` : ''}

  ${backup.safetyPlan ? `
  <h2>${tDict.safetyPlanTitle}</h2>
  <table>
    <tr><th>${tDict.component}</th><th>${tDict.content}</th></tr>
    <tr><td>${tDict.warningSigns}</td><td>${(backup.safetyPlan.warningSigns || []).join(', ') || '-'}</td></tr>
    <tr><td>${tDict.copingStrategies}</td><td>${(backup.safetyPlan.copingStrategies || []).join(', ') || '-'}</td></tr>
    <tr><td>${tDict.socialContacts}</td><td>${(backup.safetyPlan.peopleToContact || []).map(c => c.name).join(', ') || '-'}</td></tr>
    <tr><td>${tDict.professionals}</td><td>${(backup.safetyPlan.professionalContacts || []).map(c => c.name).join(', ') || '-'}</td></tr>
    <tr><td>${tDict.safeEnvironment}</td><td>${(backup.safetyPlan.safeEnvironment || []).join(', ') || '-'}</td></tr>
    <tr><td>${tDict.reasonsToLive}</td><td>${(backup.safetyPlan.reasonsToLive || []).join(', ') || '-'}</td></tr>
  </table>
  ` : ''}

  <footer style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 0.75rem; color: #888;">
    <p>${tDict.footerCreated}</p>
    <p>${tDict.footerPrivacy}</p>
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = isEn ? `rima-clinical-summary-${dateStr}.html` : `rima-laporan-klinis-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

function isValidMoodEntry(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.id === 'string' && typeof obj.score === 'number' && typeof obj.createdAt === 'string';
}

function isValidJournalEntry(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.id === 'string' && typeof obj.title === 'string' && typeof obj.content === 'string';
}

export function importDataFromJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString) as RimaBackupData;
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Format file JSON tidak valid.' };
    }

    let importedCount = 0;

    if (Array.isArray(parsed.moods)) {
      const validMoods = parsed.moods.filter(isValidMoodEntry);
      localStorage.setItem('rima-moods', JSON.stringify(validMoods));
      importedCount += validMoods.length;
    }
    if (Array.isArray(parsed.journals)) {
      const validJournals = parsed.journals.filter(isValidJournalEntry);
      localStorage.setItem('rima-journals', JSON.stringify(validJournals));
      importedCount += validJournals.length;
    }
    if (parsed.safetyPlan && typeof parsed.safetyPlan === 'object') {
      localStorage.setItem('rima-safety-plan', JSON.stringify(parsed.safetyPlan));
    }
    if (parsed.user && typeof parsed.user === 'object') {
      localStorage.setItem('rima-user-profile', JSON.stringify(parsed.user));
    }

    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-moods' } }));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-journals' } }));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-safety-plan' } }));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-user-profile' } }));
    return { success: true, message: `Data RIMA berhasil dipulihkan! (${importedCount} entri)` };
  } catch (err) {
    return { success: false, message: `Gagal membaca file: ${(err as Error).message}` };
  }
}
