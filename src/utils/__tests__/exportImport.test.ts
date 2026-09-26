import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportMoodsAsCSV,
  exportJournalsAsCSV,
  generateClinicalSummaryHTML,
  generateBackupData,
  importDataFromJSON,
  escapeHTML
} from '../exportImport';

describe('exportImport Utilities (Localization & Data Portability)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns false when exporting empty moods or journals', () => {
    expect(exportMoodsAsCSV('id')).toBe(false);
    expect(exportJournalsAsCSV('en')).toBe(false);
    expect(generateClinicalSummaryHTML('id')).toBe(false);
  });

  it('exports moods CSV with language-specific headers and formatting', () => {
    const mockMoods = [
      { id: '1', score: 4, emoji: '🙂', factors: ['sleep', 'exercise'], note: 'Good sleep', createdAt: '2026-09-01T10:00:00.000Z' }
    ];
    localStorage.setItem('rima-moods', JSON.stringify(mockMoods));

    const enSuccess = exportMoodsAsCSV('en');
    expect(enSuccess).toBe(true);

    const idSuccess = exportMoodsAsCSV('id');
    expect(idSuccess).toBe(true);
  });

  it('exports journals CSV with language-specific headers and formatting', () => {
    const mockJournals = [
      { id: '1', title: 'Daily Gratitude', content: 'Peaceful morning', template: 'gratitude', isPrivate: false, createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' }
    ];
    localStorage.setItem('rima-journals', JSON.stringify(mockJournals));

    const enSuccess = exportJournalsAsCSV('en');
    expect(enSuccess).toBe(true);

    const idSuccess = exportJournalsAsCSV('id');
    expect(idSuccess).toBe(true);
  });

  it('generates clinical summary HTML in English and Indonesian', () => {
    const mockMoods = [
      { id: '1', score: 5, emoji: '😊', factors: ['exercise'], note: 'Great workout', createdAt: '2026-09-01T10:00:00.000Z' }
    ];
    localStorage.setItem('rima-moods', JSON.stringify(mockMoods));

    const enSuccess = generateClinicalSummaryHTML('en');
    expect(enSuccess).toBe(true);

    const idSuccess = generateClinicalSummaryHTML('id');
    expect(idSuccess).toBe(true);
  });

  it('sanitizes CSV cells starting with formula triggers (=, +, -, @) to prevent CSV injection', () => {
    const mockMoods = [
      { id: '1', score: 4, emoji: '🙂', factors: ['work'], note: '=CMD("calc")', createdAt: '2026-09-01T10:00:00.000Z' },
      { id: '2', score: 3, emoji: '😐', factors: ['work'], note: '+12345', createdAt: '2026-09-01T11:00:00.000Z' },
      { id: '3', score: 2, emoji: '😟', factors: ['work'], note: '-danger', createdAt: '2026-09-01T12:00:00.000Z' },
      { id: '4', score: 1, emoji: '😢', factors: ['work'], note: '@SUM(A1:A10)', createdAt: '2026-09-01T13:00:00.000Z' },
    ];
    localStorage.setItem('rima-moods', JSON.stringify(mockMoods));

    let exportedBlobContent = '';
    const originalBlob = globalThis.Blob;
    vi.spyOn(globalThis, 'Blob').mockImplementation(function (blobParts: any, options: any) {
      exportedBlobContent = blobParts.join('');
      return new originalBlob(blobParts, options);
    });

    const success = exportMoodsAsCSV('en');
    expect(success).toBe(true);
    expect(exportedBlobContent).toContain("\"'=CMD(\"\"calc\"\")\"");
    expect(exportedBlobContent).toContain("\"'+12345\"");
    expect(exportedBlobContent).toContain("\"'-danger\"");
    expect(exportedBlobContent).toContain("\"'@SUM(A1:A10)\"");
  });

  it('correctly backs up and restores data via JSON', () => {
    const mockMoods = [
      { id: '1', score: 4, emoji: '🙂', factors: ['sleep'], note: 'Rested well', createdAt: '2026-09-01T10:00:00.000Z' }
    ];
    localStorage.setItem('rima-moods', JSON.stringify(mockMoods));

    const backup = generateBackupData();
    expect(backup.moods.length).toBe(1);
    expect(backup.moods[0].score).toBe(4);

    localStorage.clear();
    const result = importDataFromJSON(JSON.stringify(backup));
    expect(result.success).toBe(true);
    expect(localStorage.getItem('rima-moods')).toContain('Rested well');
  });

  it('escapes HTML special characters using escapeHTML to prevent XSS injection', () => {
    expect(escapeHTML('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(escapeHTML("John's & Jane's > 5")).toBe('John&#039;s &amp; Jane&#039;s &gt; 5');
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
  });

  it('escapes malicious HTML payloads in clinical summary HTML export', () => {
    const maliciousMood = [
      {
        id: 'xss-1',
        score: 3,
        emoji: '😐',
        factors: ['<img src=x onerror=alert(1)>'],
        note: '<script>evilScript()</script>',
        createdAt: '2026-09-01T10:00:00.000Z'
      }
    ];
    localStorage.setItem('rima-moods', JSON.stringify(maliciousMood));

    let exportedHTML = '';
    const originalBlob = globalThis.Blob;
    vi.spyOn(globalThis, 'Blob').mockImplementation(function (blobParts: any, options: any) {
      exportedHTML = blobParts.join('');
      return new originalBlob(blobParts, options);
    });

    const success = generateClinicalSummaryHTML('en');
    expect(success).toBe(true);
    // Raw script and onerror tags must NOT be present
    expect(exportedHTML).not.toContain('<script>evilScript()</script>');
    expect(exportedHTML).not.toContain('<img src=x onerror=alert(1)>');
    // Must be sanitized to HTML entities
    expect(exportedHTML).toContain('&lt;script&gt;evilScript()&lt;/script&gt;');
    expect(exportedHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
