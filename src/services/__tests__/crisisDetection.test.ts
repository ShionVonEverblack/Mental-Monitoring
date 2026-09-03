import { describe, it, expect } from 'vitest';
import { detectCrisis, getCrisisKeywords } from '../crisisDetectionService';

describe('Crisis Detection Service', () => {
  it('returns not detected for regular safe text', () => {
    const result = detectCrisis('Hari ini saya merasa senang dan produktif di tempat kerja.');
    expect(result.isDetected).toBe(false);
    expect(result.severity).toBe('none');
    expect(result.matchedKeywords.length).toBe(0);
  });

  it('detects severe Indonesian keywords correctly', () => {
    const result = detectCrisis('Saya merasa ingin bunuh diri dan tidak tahu harus berbuat apa.');
    expect(result.isDetected).toBe(true);
    expect(result.severity).toBe('severe');
    expect(result.matchedKeywords).toContain('bunuh diri');
  });

  it('detects severe English keywords correctly', () => {
    const result = detectCrisis('I want to end my life, everything is too hard.');
    expect(result.isDetected).toBe(true);
    expect(result.severity).toBe('severe');
    expect(result.matchedKeywords).toContain('end my life');
  });

  it('detects moderate crisis keywords', () => {
    const result = detectCrisis('Rasanya putus asa dan tidak berguna sama sekali.');
    expect(result.isDetected).toBe(true);
    expect(['moderate', 'severe']).toContain(result.severity);
    expect(result.matchedKeywords.some(k => ['putus asa', 'tidak berguna'].includes(k))).toBe(true);
  });

  it('handles case insensitivity and punctuation', () => {
    const result = detectCrisis('SUICIDE thoughts are overwhelming me...');
    expect(result.isDetected).toBe(true);
    expect(result.severity).toBe('severe');
    expect(result.matchedKeywords).toContain('suicide');
  });

  it('handles empty or whitespace-only input safely', () => {
    const emptyResult = detectCrisis('');
    expect(emptyResult.isDetected).toBe(false);
    expect(emptyResult.severity).toBe('none');

    const whitespaceResult = detectCrisis('    \n   ');
    expect(whitespaceResult.isDetected).toBe(false);
    expect(whitespaceResult.severity).toBe('none');
  });

  it('returns all keyword categories from getCrisisKeywords', () => {
    const keywords = getCrisisKeywords();
    expect(keywords.severe.length).toBeGreaterThan(0);
    expect(keywords.moderate.length).toBeGreaterThan(0);
    expect(keywords.mild.length).toBeGreaterThan(0);
  });
});
