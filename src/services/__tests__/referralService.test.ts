import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BPJS_STEPS,
  DOCTOR_SCRIPTS,
  getClinicalHandoverData,
  generateDoctorHandoverBriefHTML,
  downloadDoctorHandoverBrief,
  printDoctorHandoverBrief,
} from '../referralService';

describe('referralService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('provides 3 structured BPJS Puskesmas referral steps with items', () => {
    expect(BPJS_STEPS).toHaveLength(3);
    expect(BPJS_STEPS[0].number).toBe(1);
    expect(BPJS_STEPS[0].checklistKey.length).toBeGreaterThanOrEqual(2);
    expect(BPJS_STEPS[1].number).toBe(2);
    expect(BPJS_STEPS[2].number).toBe(3);
  });

  it('provides doctor conversation scripts for depression, anxiety, and stress', () => {
    expect(DOCTOR_SCRIPTS).toHaveLength(3);
    const ids = DOCTOR_SCRIPTS.map(s => s.id);
    expect(ids).toContain('depression');
    expect(ids).toContain('anxiety');
    expect(ids).toContain('stress');
  });

  it('returns empty handover data when local storage is empty', () => {
    const data = getClinicalHandoverData();
    expect(data.latestPhq9).toBeNull();
    expect(data.latestGad7).toBeNull();
    expect(data.latestCssrs).toBeNull();
    expect(data.avgMoodScore).toBeNull();
    expect(data.totalMoodLogs).toBe(0);
    expect(data.topFactors).toEqual([]);
  });

  it('aggregates mood history and factors in clinical handover data', () => {
    const moods = [
      { id: '1', score: 2, createdAt: '2026-10-01T10:00:00Z', factors: ['sleep', 'work'] },
      { id: '2', score: 4, createdAt: '2026-10-02T10:00:00Z', factors: ['work', 'family'] },
    ];
    localStorage.setItem('rima-moods', JSON.stringify(moods));

    const assessments = [
      {
        id: 'a1',
        type: 'phq9',
        score: 16,
        maxScore: 27,
        answers: {},
        createdAt: '2026-10-02T10:00:00Z',
      },
    ];
    localStorage.setItem('rima-assessments', JSON.stringify(assessments));

    const data = getClinicalHandoverData();
    expect(data.totalMoodLogs).toBe(2);
    expect(data.avgMoodScore).toBe(3);
    expect(data.topFactors).toContain('work');
    expect(data.latestPhq9?.score).toBe(16);
  });

  it('generates HTML handover brief in Indonesian with custom patient notes', () => {
    const html = generateDoctorHandoverBriefHTML('id', 'Dok, saya sering terbangun tengah malam karena cemas.');
    expect(html).toContain('Lembar Ringkasan Klinis & Rujukan Pasien');
    expect(html).toContain('Dok, saya sering terbangun tengah malam karena cemas.');
    expect(html).toContain('Tujuan Klinis:');
    expect(html).toContain('Skrining Depresi PHQ-9');
  });

  it('generates HTML handover brief in English', () => {
    const html = generateDoctorHandoverBriefHTML('en', 'Doctor, I am struggling with insomnia.');
    expect(html).toContain('Clinical Handover Brief');
    expect(html).toContain('Doctor, I am struggling with insomnia.');
    expect(html).toContain('PHQ-9 Depression Screener');
  });

  it('downloads handover brief document via Blob link', () => {
    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    // Mock HTMLAnchorElement click
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    downloadDoctorHandoverBrief('id', 'Catatan pasien');
    expect(appendSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('calls print window or falls back safely', () => {
    const printMock = vi.fn();
    const writeMock = vi.fn();
    const closeMock = vi.fn();
    const focusMock = vi.fn();

    vi.spyOn(window, 'open').mockReturnValue({
      document: {
        write: writeMock,
        close: closeMock,
      },
      focus: focusMock,
      print: printMock,
    } as unknown as Window);

    printDoctorHandoverBrief('id', 'Catatan tes');
    expect(window.open).toHaveBeenCalledWith('', '_blank');
    expect(writeMock).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });
});
