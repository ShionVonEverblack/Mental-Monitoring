import type { MoodEntry, JournalEntry, SafetyPlan, UserProfile } from '../types';

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

export function exportMoodsAsCSV() {
  const moods: MoodEntry[] = (() => {
    try {
      const item = localStorage.getItem('rima-moods');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  })();

  if (moods.length === 0) {
    alert('Belum ada data mood yang bisa diekspor.');
    return;
  }

  const headers = ['Tanggal & Waktu', 'Skor Mood (1-5)', 'Emoji', 'Faktor Pemicu', 'Catatan'];
  const rows = moods.map(m => [
    `"${new Date(m.createdAt).toLocaleString('id-ID')}"`,
    m.score,
    `"${m.emoji}"`,
    `"${(m.factors || []).join(', ')}"`,
    `"${(m.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `rima-riwayat-mood-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
    return { success: true, message: 'Data RIMA berhasil dipulihkan!' };
  } catch (err) {
    return { success: false, message: `Gagal membaca file: ${(err as Error).message}` };
  }
}
