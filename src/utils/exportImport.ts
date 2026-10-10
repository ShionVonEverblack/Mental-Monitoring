import type {
  MoodEntry,
  MoodScore,
  MoodEmoji,
  JournalEntry,
  SafetyPlan,
  UserProfile,
  ContactInfo,
  CbtThoughtRecord,
  CognitiveDistortionId,
  Language,
  Theme,
  JournalTemplate
} from '../types';
import { getLocaleTag } from './helpers';
import { useMoodStore } from '../stores/moodStore';

export interface RimaBackupData {
  version: string;
  exportedAt: string;
  user: UserProfile | null;
  moods: MoodEntry[];
  journals: JournalEntry[];
  safetyPlan: SafetyPlan | null;
}

/**
 * Safely retrieve mood entries from localStorage, supporting both Zustand persist wrapper
 * ({"state":{"moods":[...]},"version":0}) and legacy raw array format ([...]).
 */
export function getStoredMoods(): MoodEntry[] {
  try {
    const raw = localStorage.getItem('rima-moods');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.state?.moods)) {
      return parsed.state.moods;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Persist mood entries into localStorage using the Zustand persist schema format
 * so that useMoodStore rehydrates properly without losing state.
 */
export function setStoredMoods(moods: MoodEntry[]): void {
  const existingRaw = localStorage.getItem('rima-moods');
  let persistWrapper: { state: Record<string, unknown>; version: number } = {
    state: { moods },
    version: 0
  };
  try {
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw);
      if (parsed && typeof parsed === 'object' && parsed.state && typeof parsed.state === 'object') {
        persistWrapper = { ...parsed, state: { ...parsed.state, moods } };
      }
    }
  } catch {
    // fallback to default wrapper
  }
  localStorage.setItem('rima-moods', JSON.stringify(persistWrapper));
}

export function generateBackupData(): RimaBackupData {
  const getItem = <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      if (Array.isArray(fallback)) {
        return (Array.isArray(parsed) ? parsed : fallback) as T;
      }
      return (parsed ?? fallback) as T;
    } catch {
      return fallback;
    }
  };

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user: getItem<UserProfile | null>('rima-user-profile', null),
    moods: getStoredMoods(),
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

/**
 * HTML Entity Encoder — OWASP Cross-Site Scripting (XSS) defense for exported documents.
 * Encodes special characters to prevent stored/exported HTML injection when opening reports in browsers.
 */
export function escapeHTML(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function exportMoodsAsCSV(lang?: string): boolean {
  const activeLang = getActiveLang(lang);
  const localeTag = getLocaleTag(activeLang);
  const isEn = activeLang === 'en';

  const moods: MoodEntry[] = getStoredMoods();

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
  <h2>${escapeHTML(tDict.topFactorsTitle)}</h2>
  <table>
    <tr><th>${escapeHTML(tDict.factor)}</th><th>${escapeHTML(tDict.frequency)}</th></tr>
    ${topFactors.map(([f, c]) => `<tr><td>${escapeHTML(f)}</td><td>${Number(c)}x</td></tr>`).join('\n    ')}
  </table>
  ` : ''}

  <h2>${escapeHTML(tDict.historyTitle)}</h2>
  <table>
    <tr><th>${escapeHTML(tDict.colDate)}</th><th>${escapeHTML(tDict.colScore)}</th><th>${escapeHTML(tDict.colEmoji)}</th><th>${escapeHTML(tDict.colFactors)}</th><th>${escapeHTML(tDict.colNotes)}</th></tr>
    ${sortedMoods.slice(0, 30).map(m => `<tr>
      <td>${escapeHTML(new Date(m.createdAt).toLocaleDateString(localeTag))}</td>
      <td>${escapeHTML(m.score)}/5</td>
      <td>${escapeHTML(m.emoji)}</td>
      <td>${escapeHTML((m.factors || []).join(', ') || '-')}</td>
      <td>${escapeHTML(m.note || '-')}</td>
    </tr>`).join('\n    ')}
  </table>

  ${escalationLog.length > 0 ? `
  <h2 class="severe">${escapeHTML(tDict.escalationTitle)}</h2>
  <table>
    <tr><th>${escapeHTML(tDict.colDate)}</th><th>${escapeHTML(tDict.level)}</th><th>${escapeHTML(tDict.description)}</th></tr>
    ${escalationLog.map((e: { timestamp: string; level: number; messageKey: string }) => `<tr>
      <td>${escapeHTML(new Date(e.timestamp).toLocaleDateString(localeTag))}</td>
      <td class="${e.level >= 3 ? 'severe' : ''}">${escapeHTML(e.level)}</td>
      <td>${escapeHTML(e.messageKey)}</td>
    </tr>`).join('\n    ')}
  </table>
  ` : ''}

  ${backup.safetyPlan ? `
  <h2>${escapeHTML(tDict.safetyPlanTitle)}</h2>
  <table>
    <tr><th>${escapeHTML(tDict.component)}</th><th>${escapeHTML(tDict.content)}</th></tr>
    <tr><td>${escapeHTML(tDict.warningSigns)}</td><td>${escapeHTML((backup.safetyPlan.warningSigns || []).join(', ') || '-')}</td></tr>
    <tr><td>${escapeHTML(tDict.copingStrategies)}</td><td>${escapeHTML((backup.safetyPlan.copingStrategies || []).join(', ') || '-')}</td></tr>
    <tr><td>${escapeHTML(tDict.socialContacts)}</td><td>${escapeHTML((backup.safetyPlan.peopleToContact || []).map(c => c.name).join(', ') || '-')}</td></tr>
    <tr><td>${escapeHTML(tDict.professionals)}</td><td>${escapeHTML((backup.safetyPlan.professionalContacts || []).map(c => c.name).join(', ') || '-')}</td></tr>
    <tr><td>${escapeHTML(tDict.safeEnvironment)}</td><td>${escapeHTML((backup.safetyPlan.safeEnvironment || []).join(', ') || '-')}</td></tr>
    <tr><td>${escapeHTML(tDict.reasonsToLive)}</td><td>${escapeHTML((backup.safetyPlan.reasonsToLive || []).join(', ') || '-')}</td></tr>
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

const MAX_JSON_STRING_LENGTH = 10 * 1024 * 1024; // 10MB limit against memory exhaustion attacks
const MAX_MOOD_ENTRIES = 5000;
const MAX_JOURNAL_ENTRIES = 2000;

const VALID_LANGUAGES: Language[] = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'];
const VALID_THEMES: Theme[] = ['dark', 'light'];

export function isValidISODate(str: unknown): boolean {
  if (typeof str !== 'string' || !str) return false;
  const time = Date.parse(str);
  return !Number.isNaN(time);
}

export function validateMoodEntry(item: unknown): MoodEntry | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;

  if (typeof obj.id !== 'string' || obj.id.trim() === '' || obj.id.length > 128) return null;
  if (typeof obj.score !== 'number' || !Number.isInteger(obj.score) || obj.score < 1 || obj.score > 5) return null;
  if (!isValidISODate(obj.createdAt)) return null;

  const validEmojis: MoodEmoji[] = ['😢', '😟', '😐', '🙂', '😊'];
  const scoreToEmoji: Record<number, MoodEmoji> = {
    1: '😢',
    2: '😟',
    3: '😐',
    4: '🙂',
    5: '😊'
  };
  const emoji: MoodEmoji = validEmojis.includes(obj.emoji as MoodEmoji)
    ? (obj.emoji as MoodEmoji)
    : (scoreToEmoji[obj.score as number] || '😐');

  const note = typeof obj.note === 'string' ? obj.note.slice(0, 5000) : undefined;

  let factors: string[] = [];
  if (Array.isArray(obj.factors)) {
    factors = obj.factors
      .filter((f): f is string => typeof f === 'string' && f.trim() !== '')
      .map(f => f.slice(0, 100))
      .slice(0, 50);
  }

  return {
    id: obj.id,
    score: obj.score as MoodScore,
    emoji,
    factors,
    note,
    createdAt: obj.createdAt as string
  };
}

export function validateJournalEntry(item: unknown): JournalEntry | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;

  if (typeof obj.id !== 'string' || obj.id.trim() === '' || obj.id.length > 128) return null;
  if (typeof obj.title !== 'string' || obj.title.length > 255) return null;
  if (typeof obj.content !== 'string' || obj.content.length > 50000) return null;
  if (!isValidISODate(obj.createdAt)) return null;

  const template = (typeof obj.template === 'string' && obj.template.length <= 64 ? obj.template : 'free') as JournalTemplate;
  const isPrivate = typeof obj.isPrivate === 'boolean' ? obj.isPrivate : true;
  const moodId = typeof obj.moodId === 'string' && obj.moodId.length <= 128 ? obj.moodId : undefined;
  const updatedAt = isValidISODate(obj.updatedAt) ? (obj.updatedAt as string) : (obj.createdAt as string);

  let cbtRecord: CbtThoughtRecord | undefined = undefined;
  if (typeof obj.cbtRecord === 'object' && obj.cbtRecord !== null && !Array.isArray(obj.cbtRecord)) {
    const cbt = obj.cbtRecord as Record<string, unknown>;
    const situation = typeof cbt.situation === 'string' ? cbt.situation.slice(0, 2000) : '';
    const initialEmotion = typeof cbt.initialEmotion === 'string' ? cbt.initialEmotion.slice(0, 500) : 'Neutral';
    const initialIntensity = typeof cbt.initialIntensity === 'number' && cbt.initialIntensity >= 1 && cbt.initialIntensity <= 10
      ? Math.round(cbt.initialIntensity)
      : 5;
    const automaticThought = typeof cbt.automaticThought === 'string' ? cbt.automaticThought.slice(0, 2000) : '';
    const evidenceFor = typeof cbt.evidenceFor === 'string' ? cbt.evidenceFor.slice(0, 2000) : '';
    const evidenceAgainst = typeof cbt.evidenceAgainst === 'string' ? cbt.evidenceAgainst.slice(0, 2000) : '';
    const balancedThought = typeof cbt.balancedThought === 'string' ? cbt.balancedThought.slice(0, 2000) : '';
    const finalIntensity = typeof cbt.finalIntensity === 'number' && cbt.finalIntensity >= 1 && cbt.finalIntensity <= 10
      ? Math.round(cbt.finalIntensity)
      : 5;
    const distortions = Array.isArray(cbt.distortions)
      ? (cbt.distortions.filter((d): d is CognitiveDistortionId => typeof d === 'string').slice(0, 20))
      : [];

    cbtRecord = {
      situation,
      initialEmotion,
      initialIntensity,
      automaticThought,
      distortions,
      evidenceFor,
      evidenceAgainst,
      balancedThought,
      finalIntensity
    };
  }

  return {
    id: obj.id,
    title: obj.title,
    content: obj.content,
    template,
    moodId,
    isPrivate,
    cbtRecord,
    createdAt: obj.createdAt as string,
    updatedAt
  };
}

export function validateContactInfo(item: unknown): ContactInfo | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;
  if (typeof obj.name !== 'string' || obj.name.trim() === '') return null;

  return {
    name: obj.name.slice(0, 128),
    phone: typeof obj.phone === 'string' ? obj.phone.slice(0, 32) : undefined,
    relationship: typeof obj.relationship === 'string' ? obj.relationship.slice(0, 64) : undefined
  };
}

export function validateSafetyPlan(item: unknown): SafetyPlan | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;

  const id = typeof obj.id === 'string' && obj.id.trim() !== '' ? obj.id.slice(0, 128) : 'safety-plan';
  const updatedAt = isValidISODate(obj.updatedAt) ? (obj.updatedAt as string) : new Date().toISOString();

  const sanitizeStringArray = (arr: unknown, maxItems = 50, maxLen = 300): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
      .map(s => s.slice(0, maxLen))
      .slice(0, maxItems);
  };

  const sanitizeContacts = (arr: unknown, maxItems = 20): ContactInfo[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map(validateContactInfo)
      .filter((c): c is ContactInfo => c !== null)
      .slice(0, maxItems);
  };

  return {
    id,
    warningSigns: sanitizeStringArray(obj.warningSigns),
    copingStrategies: sanitizeStringArray(obj.copingStrategies),
    peopleToContact: sanitizeContacts(obj.peopleToContact),
    professionalContacts: sanitizeContacts(obj.professionalContacts),
    safeEnvironment: sanitizeStringArray(obj.safeEnvironment),
    reasonsToLive: sanitizeStringArray(obj.reasonsToLive),
    updatedAt
  };
}

export function validateUserProfile(item: unknown): UserProfile | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;

  const id = typeof obj.id === 'string' && obj.id.trim() !== '' ? obj.id.slice(0, 128) : 'user';
  const displayName = typeof obj.displayName === 'string' ? obj.displayName.slice(0, 64) : 'Sahabat RIMA';
  const avatarSeed = typeof obj.avatarSeed === 'string' ? obj.avatarSeed.slice(0, 64) : 'default';
  const language = VALID_LANGUAGES.includes(obj.language as Language) ? (obj.language as Language) : 'id';
  const theme = VALID_THEMES.includes(obj.theme as Theme) ? (obj.theme as Theme) : 'dark';
  const createdAt = isValidISODate(obj.createdAt) ? (obj.createdAt as string) : new Date().toISOString();

  return {
    id,
    displayName,
    avatarSeed,
    language,
    theme,
    createdAt
  };
}

export function importDataFromJSON(jsonString: string): { success: boolean; message: string } {
  if (!jsonString || typeof jsonString !== 'string') {
    return { success: false, message: 'File kosong atau tidak terbaca.' };
  }

  if (jsonString.length > MAX_JSON_STRING_LENGTH) {
    return { success: false, message: 'Ukuran file cadangan melebihi batas aman (maksimum 10MB).' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { success: false, message: 'Format file JSON tidak valid.' };
    }

    let importedMoodCount = 0;
    let importedJournalCount = 0;
    let hasSafetyPlan = false;
    let hasUserProfile = false;

    if (Array.isArray(parsed.moods)) {
      const validMoods: MoodEntry[] = [];
      for (const item of parsed.moods) {
        const validated = validateMoodEntry(item);
        if (validated) {
          validMoods.push(validated);
          if (validMoods.length >= MAX_MOOD_ENTRIES) break;
        }
      }

      setStoredMoods(validMoods);
      try {
        useMoodStore.setState({ moods: validMoods });
      } catch {
        // Fallback for environments where store is uninitialized
      }
      importedMoodCount = validMoods.length;
    }

    if (Array.isArray(parsed.journals)) {
      const validJournals: JournalEntry[] = [];
      for (const item of parsed.journals) {
        const validated = validateJournalEntry(item);
        if (validated) {
          validJournals.push(validated);
          if (validJournals.length >= MAX_JOURNAL_ENTRIES) break;
        }
      }

      localStorage.setItem('rima-journals', JSON.stringify(validJournals));
      importedJournalCount = validJournals.length;
    }

    if (parsed.safetyPlan) {
      const validSafetyPlan = validateSafetyPlan(parsed.safetyPlan);
      if (validSafetyPlan) {
        localStorage.setItem('rima-safety-plan', JSON.stringify(validSafetyPlan));
        hasSafetyPlan = true;
      }
    }

    if (parsed.user) {
      const validUser = validateUserProfile(parsed.user);
      if (validUser) {
        localStorage.setItem('rima-user-profile', JSON.stringify(validUser));
        hasUserProfile = true;
      }
    }

    const totalItems = importedMoodCount + importedJournalCount;
    if (totalItems === 0 && !hasSafetyPlan && !hasUserProfile) {
      return { success: false, message: 'File tidak memuat data RIMA yang valid.' };
    }

    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-moods' } }));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-journals' } }));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-safety-plan' } }));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: 'rima-user-profile' } }));

    return {
      success: true,
      message: `Data RIMA berhasil dipulihkan! (${totalItems} entri)${hasSafetyPlan ? ', rencana keselamatan' : ''}`
    };
  } catch (err) {
    return { success: false, message: `Gagal membaca file: ${(err as Error).message}` };
  }
}
