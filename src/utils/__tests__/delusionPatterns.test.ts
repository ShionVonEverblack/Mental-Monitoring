import { describe, it, expect } from 'vitest';
import { detectDelusion, formatCbtpMessage } from '../delusionPatterns';

describe('Delusion Pattern Scanner & CBTp Gatekeeper', () => {
  it('returns no delusion for standard emotional distress expressions', () => {
    const normalInput = 'Hari ini aku merasa sedih dan cemas karena ujian besok.';
    const result = detectDelusion(normalInput);
    expect(result.isDelusionDetected).toBe(false);
    expect(result.theme).toBe('none');
    expect(result.matchedKeywords).toEqual([]);
    expect(result.cbtpResponse).toBeUndefined();
  });

  it('detects persecutory / surveillance delusion patterns in Indonesian', () => {
    const persecutoryInput = 'Tolong, saya merasa kamar saya disadap dan ada yang memata-matai saya terus menerus.';
    const result = detectDelusion(persecutoryInput);
    expect(result.isDelusionDetected).toBe(true);
    expect(result.theme).toBe('persecutory');
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
    expect(result.cbtpResponse).toBeDefined();
    expect(result.cbtpResponse?.suggestedRoute).toBe('/grounding');
  });

  it('detects thought control / chip in brain delusion patterns in English', () => {
    const thoughtControlInput = 'They put a chip in my brain and are broadcasting my thoughts to satellites.';
    const result = detectDelusion(thoughtControlInput);
    expect(result.isDelusionDetected).toBe(true);
    expect(result.theme).toBe('thought_control');
    expect(result.cbtpResponse?.suggestedRoute).toBe('/breathe');
  });

  it('detects grandiose delusion patterns', () => {
    const grandioseInput = 'Saya adalah utusan tuhan yang dipilih untuk menyelamatkan seluruh alam semesta.';
    const result = detectDelusion(grandioseInput);
    expect(result.isDelusionDetected).toBe(true);
    expect(result.theme).toBe('grandiose');
    expect(result.cbtpResponse?.suggestedRoute).toBe('/tipp');
  });

  it('detects somatic delusion patterns', () => {
    const somaticInput = 'Organ tubuh saya membusuk dan ada serangga di dalam otak saya.';
    const result = detectDelusion(somaticInput);
    expect(result.isDelusionDetected).toBe(true);
    expect(result.theme).toBe('somatic_delusion');
    expect(result.cbtpResponse?.suggestedRoute).toBe('/grounding');
  });

  it('formats CBTp tri-phasic message with validation, neutrality, and somatosensory pivot', () => {
    const persecutoryInput = 'Semua orang berkomplot dan mengintai saya.';
    const result = detectDelusion(persecutoryInput);
    expect(result.cbtpResponse).toBeDefined();

    const formattedId = formatCbtpMessage(result.cbtpResponse!, 'id');
    expect(formattedId.text).toContain('mencemaskan');
    expect(formattedId.text).toContain('Sebagai asisten AI');
    expect(formattedId.text).toContain('5-4-3-2-1');
    expect(formattedId.actionRoute).toBe('/grounding');
    expect(formattedId.actionLabel).toBe('Latihan Grounding 5-4-3-2-1');

    const formattedEn = formatCbtpMessage(result.cbtpResponse!, 'en');
    expect(formattedEn.text).toContain('distressing');
    expect(formattedEn.text).toContain('AI companion');
    expect(formattedEn.text).toContain('grounding');
    expect(formattedEn.actionRoute).toBe('/grounding');
    expect(formattedEn.actionLabel).toBe('5-4-3-2-1 Grounding Exercise');
  });

  it('handles empty, null, or garbage inputs safely', () => {
    expect(detectDelusion('').isDelusionDetected).toBe(false);
    expect(detectDelusion('   ').isDelusionDetected).toBe(false);
    // @ts-expect-error test invalid type
    expect(detectDelusion(null).isDelusionDetected).toBe(false);
  });
});
