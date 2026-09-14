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

export function exportMoodsAsCSV(): boolean {
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
  return true;
}

/**
 * Export journal entries as CSV — APA App Advisor Tier 1 Data Portability.
 */
export function exportJournalsAsCSV(): boolean {
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

  const headers = ['Tanggal & Waktu', 'Template', 'Judul', 'Konten'];
  const rows = journals.map(j => [
    `"${new Date(j.createdAt).toLocaleString('id-ID')}"`,
    `"${j.template || 'free'}"`,
    `"${(j.title || '').replace(/"/g, '""')}"`,
    `"${(j.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `rima-jurnal-${dateStr}.csv`;
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
export function generateClinicalSummaryHTML(): boolean {
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
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RIMA — Laporan Klinis ${dateStr}</title>
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
  <h1>📊 RIMA — Laporan Pendampingan Kesehatan Mental</h1>
  <p><strong>Tanggal Laporan:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
  <p><strong>Periode Data:</strong> ${sortedMoods.length > 0 ? new Date(sortedMoods[sortedMoods.length - 1].createdAt).toLocaleDateString('id-ID') : '-'} s/d ${sortedMoods.length > 0 ? new Date(sortedMoods[0].createdAt).toLocaleDateString('id-ID') : '-'}</p>
  
  <div class="disclaimer">
    ⚕️ <strong>Catatan Penting:</strong> Dokumen ini dihasilkan oleh RIMA sebagai alat pendampingan mandiri. 
    Data ini bersifat subjektif dan bukan merupakan diagnosis atau evaluasi klinis. 
    Interpretasi harus dilakukan oleh profesional kesehatan mental yang berkualifikasi.
  </div>

  <h2>📈 Ringkasan Statistik</h2>
  <div>
    <span class="metric">📊 Total Entri Mood: <strong>${sortedMoods.length}</strong></span>
    <span class="metric">📝 Total Jurnal: <strong>${backup.journals.length}</strong></span>
    <span class="metric">⭐ Rata-rata Mood: <strong>${avgMood}/5</strong></span>
  </div>

  ${topFactors.length > 0 ? `
  <h2>🏷️ Faktor Pemicu Teratas</h2>
  <table>
    <tr><th>Faktor</th><th>Frekuensi</th></tr>
    ${topFactors.map(([f, c]) => `<tr><td>${f}</td><td>${c}x</td></tr>`).join('\n    ')}
  </table>
  ` : ''}

  <h2>📅 Riwayat Mood (30 Entri Terakhir)</h2>
  <table>
    <tr><th>Tanggal</th><th>Skor</th><th>Emoji</th><th>Faktor</th><th>Catatan</th></tr>
    ${sortedMoods.slice(0, 30).map(m => `<tr>
      <td>${new Date(m.createdAt).toLocaleDateString('id-ID')}</td>
      <td>${m.score}/5</td>
      <td>${m.emoji}</td>
      <td>${(m.factors || []).join(', ') || '-'}</td>
      <td>${(m.note || '-').substring(0, 100)}</td>
    </tr>`).join('\n    ')}
  </table>

  ${escalationLog.length > 0 ? `
  <h2 class="severe">⚠️ Riwayat Eskalasi</h2>
  <table>
    <tr><th>Tanggal</th><th>Level</th><th>Keterangan</th></tr>
    ${escalationLog.map((e: { timestamp: string; level: number; messageKey: string }) => `<tr>
      <td>${new Date(e.timestamp).toLocaleDateString('id-ID')}</td>
      <td class="${e.level >= 3 ? 'severe' : ''}">${e.level}</td>
      <td>${e.messageKey}</td>
    </tr>`).join('\n    ')}
  </table>
  ` : ''}

  ${backup.safetyPlan ? `
  <h2>🛡️ Rencana Keselamatan (Stanley-Brown SPI)</h2>
  <table>
    <tr><th>Komponen</th><th>Isi</th></tr>
    <tr><td>Tanda Peringatan</td><td>${(backup.safetyPlan.warningSigns || []).join(', ') || '-'}</td></tr>
    <tr><td>Strategi Koping</td><td>${(backup.safetyPlan.copingStrategies || []).join(', ') || '-'}</td></tr>
    <tr><td>Kontak Sosial</td><td>${(backup.safetyPlan.socialContacts || []).join(', ') || '-'}</td></tr>
    <tr><td>Tenaga Profesional</td><td>${(backup.safetyPlan.professionals || []).join(', ') || '-'}</td></tr>
    <tr><td>Lingkungan Aman</td><td>${(backup.safetyPlan.safeEnvironment || []).join(', ') || '-'}</td></tr>
    <tr><td>Alasan untuk Tetap Ada</td><td>${(backup.safetyPlan.reasonsToLive || []).join(', ') || '-'}</td></tr>
  </table>
  ` : ''}

  <footer style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 0.75rem; color: #888;">
    <p>Dibuat oleh RIMA (Ruang Interaksi Mental Aman) v1.0 — ${dateStr}</p>
    <p>Semua data diproses secara lokal di perangkat pengguna. Tidak ada data yang dikirim ke server.</p>
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rima-laporan-klinis-${dateStr}.html`;
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
    return { success: true, message: 'Data RIMA berhasil dipulihkan!' };
  } catch (err) {
    return { success: false, message: `Gagal membaca file: ${(err as Error).message}` };
  }
}
