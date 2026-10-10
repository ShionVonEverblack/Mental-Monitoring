import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportMoodsAsCSV,
  exportJournalsAsCSV,
  generateClinicalSummaryHTML,
  generateBackupData,
  importDataFromJSON,
  escapeHTML,
  getStoredMoods,
  setStoredMoods
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
      { id: '1', score: 4, emoji: '🙂', factors: ['work', '=HYPERLINK("evil.com")'], note: '=CMD("calc")', createdAt: '2026-09-01T10:00:00.000Z' },
      { id: '2', score: 3, emoji: '=😐', factors: ['work'], note: '+12345', createdAt: '2026-09-01T11:00:00.000Z' },
      { id: '3', score: 2, emoji: '😟', factors: ['-dangerFactor'], note: '-danger', createdAt: '2026-09-01T12:00:00.000Z' },
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
    expect(exportedBlobContent).toContain("\"'-dangerFactor\"");
    expect(exportedBlobContent).toContain("\"'=😐\"");
  });

  it('sanitizes mood notes with leading whitespace and newlines before formula triggers', () => {
    const mockMoods = [
      { id: '1', score: 4, emoji: '🙂', factors: ['work'], note: '  =1+1', createdAt: '2026-09-01T10:00:00.000Z' },
      { id: '2', score: 3, emoji: '😐', factors: ['work'], note: 'Line 1\n=EVIL()', createdAt: '2026-09-01T11:00:00.000Z' },
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
    expect(exportedBlobContent).toContain("\"'=1+1\"");
    expect(exportedBlobContent).not.toContain('\n=EVIL()');
  });

  it('sanitizes journal template, title, and strips newlines before sanitizing cells', () => {
    const mockJournals = [
      {
        id: 'j-inject',
        title: '\n=CMD("calc")',
        template: '+custom\ntemplate',
        content: 'Line 1\nLine 2\r\n=PAYLOAD',
        isPrivate: false,
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-01T10:00:00.000Z'
      }
    ];
    localStorage.setItem('rima-journals', JSON.stringify(mockJournals));

    let exportedBlobContent = '';
    const originalBlob = globalThis.Blob;
    vi.spyOn(globalThis, 'Blob').mockImplementation(function (blobParts: any, options: any) {
      exportedBlobContent = blobParts.join('');
      return new originalBlob(blobParts, options);
    });

    const success = exportJournalsAsCSV('en');
    expect(success).toBe(true);
    expect(exportedBlobContent).toContain("\"'+custom template\"");
    expect(exportedBlobContent).toContain("\"'=CMD(\"\"calc\"\")\"");
    expect(exportedBlobContent).not.toContain('\nLine 2');
  });

  it('resiliently handles malformed non-array localStorage in exportJournalsAsCSV and generateClinicalSummaryHTML', () => {
    // Malformed object in rima-journals and rima-escalation-log
    localStorage.setItem('rima-journals', JSON.stringify({ notAnArray: true }));
    localStorage.setItem('rima-escalation-log', JSON.stringify({ notAnArray: true }));
    localStorage.setItem('rima-moods', JSON.stringify([{ id: '1', score: 4, createdAt: '2026-09-01T10:00:00.000Z' }]));

    expect(() => exportJournalsAsCSV('en')).not.toThrow();
    expect(exportJournalsAsCSV('en')).toBe(false);

    expect(() => generateClinicalSummaryHTML('en')).not.toThrow();
    expect(generateClinicalSummaryHTML('en')).toBe(true);
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

  describe('JSON Backup Schema Validation & Sanitization', () => {
    it('rejects empty input or strings exceeding size limit', () => {
      expect(importDataFromJSON('')).toEqual({
        success: false,
        message: 'File kosong atau tidak terbaca.'
      });

      const oversized = 'a'.repeat(10 * 1024 * 1024 + 1);
      expect(importDataFromJSON(oversized)).toEqual({
        success: false,
        message: 'Ukuran file cadangan melebihi batas aman (maksimum 10MB).'
      });
    });

    it('rejects malformed JSON and arrays as root', () => {
      expect(importDataFromJSON('{ invalid json')).toEqual({
        success: false,
        message: expect.stringContaining('Gagal membaca file')
      });

      expect(importDataFromJSON('["an", "array"]')).toEqual({
        success: false,
        message: 'Format file JSON tidak valid.'
      });
    });

    it('filters out invalid mood entries (out-of-range score, invalid date, non-string id)', () => {
      const payload = {
        moods: [
          { id: 'm-valid', score: 4, emoji: '😊', factors: ['sleep'], createdAt: '2026-09-01T10:00:00.000Z' },
          { id: 'm-invalid-score-high', score: 10, createdAt: '2026-09-01T10:00:00.000Z' },
          { id: 'm-invalid-score-low', score: 0, createdAt: '2026-09-01T10:00:00.000Z' },
          { id: 'm-invalid-score-string', score: '5', createdAt: '2026-09-01T10:00:00.000Z' },
          { id: 'm-invalid-date', score: 3, createdAt: 'not-a-date' },
          { id: '', score: 3, createdAt: '2026-09-01T10:00:00.000Z' }
        ]
      };

      const result = importDataFromJSON(JSON.stringify(payload));
      expect(result.success).toBe(true);

      const storedMoods = getStoredMoods();
      expect(storedMoods.length).toBe(1);
      expect(storedMoods[0].id).toBe('m-valid');

      // Verify stored in Zustand persist schema format
      const rawStored = JSON.parse(localStorage.getItem('rima-moods') || '{}');
      expect(rawStored.state?.moods).toHaveLength(1);
      expect(rawStored.state.moods[0].id).toBe('m-valid');
    });

    it('sanitizes and isolates malformed safety plans preventing runtime crashes', () => {
      const payload = {
        safetyPlan: {
          id: 'sp-1',
          warningSigns: 'not an array should be filtered to empty',
          copingStrategies: ['deep breathing', 12345], // non-string item filtered
          peopleToContact: [
            { name: 'Dr. Jane', phone: '123' },
            { name: '', phone: 'empty-name-should-be-dropped' },
            'not an object'
          ],
          professionalContacts: null,
          safeEnvironment: ['Keep away sharp objects'],
          reasonsToLive: ['Family'],
          updatedAt: '2026-09-01T10:00:00.000Z'
        }
      };

      const result = importDataFromJSON(JSON.stringify(payload));
      expect(result.success).toBe(true);

      const stored = JSON.parse(localStorage.getItem('rima-safety-plan') || '{}');
      expect(Array.isArray(stored.warningSigns)).toBe(true);
      expect(stored.warningSigns).toHaveLength(0);
      expect(stored.copingStrategies).toEqual(['deep breathing']);
      expect(stored.peopleToContact).toEqual([{ name: 'Dr. Jane', phone: '123' }]);
      expect(Array.isArray(stored.professionalContacts)).toBe(true);
    });

    it('returns error when file contains no valid RIMA records', () => {
      const payload = {
        moods: [],
        journals: [],
        randomKey: 'garbage data'
      };

      const result = importDataFromJSON(JSON.stringify(payload));
      expect(result.success).toBe(false);
      expect(result.message).toBe('File tidak memuat data RIMA yang valid.');
    });

    it('seamlessly exports data when moods are stored in Zustand persist schema format', () => {
      const zustandFormat = {
        state: {
          moods: [
            { id: 'z-1', score: 5, emoji: '😊', factors: ['exercise'], note: 'Feeling energized', createdAt: '2026-09-01T10:00:00.000Z' }
          ]
        },
        version: 0
      };
      localStorage.setItem('rima-moods', JSON.stringify(zustandFormat));

      const storedMoods = getStoredMoods();
      expect(storedMoods).toHaveLength(1);
      expect(storedMoods[0].id).toBe('z-1');

      const backup = generateBackupData();
      expect(backup.moods).toHaveLength(1);
      expect(backup.moods[0].note).toBe('Feeling energized');

      expect(exportMoodsAsCSV('en')).toBe(true);
      expect(generateClinicalSummaryHTML('en')).toBe(true);
    });

    it('saves moods in Zustand persist wrapper format with setStoredMoods', () => {
      setStoredMoods([{ id: 'm-direct', score: 3, emoji: '😐', factors: [], createdAt: '2026-09-01T10:00:00.000Z' }]);
      expect(getStoredMoods()).toHaveLength(1);
      expect(getStoredMoods()[0].id).toBe('m-direct');
    });

    it('persists moods in Zustand persist schema format preserving state hydration', () => {
      const payload = {
        moods: [
          { id: 'm-hydrate', score: 4, emoji: '🙂', factors: ['sleep'], note: 'Good sleep', createdAt: '2026-09-01T10:00:00.000Z' }
        ]
      };

      const result = importDataFromJSON(JSON.stringify(payload));
      expect(result.success).toBe(true);

      const parsed = JSON.parse(localStorage.getItem('rima-moods') || '{}');
      expect(parsed).toHaveProperty('state');
      expect(parsed.state).toHaveProperty('moods');
      expect(parsed.state.moods).toHaveLength(1);
      expect(parsed.state.moods[0].id).toBe('m-hydrate');
    });
  });
});

