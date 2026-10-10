import { describe, it, expect } from 'vitest';
import {
  buildClinicalCorpus,
  retrieveClinicalContext,
  generateGroundedResponse,
  CLINICAL_THESAURUS,
} from '../clinicalRagService';

describe('Clinical RAG Service', () => {
  it('successfully ingests all clinical datasets into normalized chunks', () => {
    const corpus = buildClinicalCorpus();
    expect(corpus.length).toBeGreaterThan(10);

    const corpora = new Set(corpus.map(c => c.corpus));
    expect(corpora.has('education')).toBe(true);
    expect(corpora.has('cft')).toBe(true);
    expect(corpora.has('emotion')).toBe(true);
    expect(corpora.has('ba')).toBe(true);
    expect(corpora.has('professional')).toBe(true);
    expect(corpora.has('spiritual')).toBe(true);
  });

  it('retrieves evidence-grounded chunk for anxiety / panic query using Indonesian synonyms', () => {
    const query = 'Jantungku deg-degan kencang dan rasanya panik sesak napas';
    const result = retrieveClinicalContext(query);

    expect(result.isGrounded).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.45);
    expect(result.bestChunk).toBeDefined();
    expect(result.bestChunk?.category === 'anxiety' || result.bestChunk?.actionRoute === '/grounding').toBe(true);
  });

  it('retrieves behavioral activation chunk for lethargy / mager / depression query', () => {
    const query = 'Saya mager banget seharian rebahan di kasur dan merasa hampa';
    const result = retrieveClinicalContext(query);

    expect(result.isGrounded).toBe(true);
    expect(result.bestChunk).toBeDefined();
    expect(
      result.bestChunk?.id === 'ba-core-protocol' ||
      result.bestChunk?.category === 'depression' ||
      result.bestChunk?.actionRoute === '/activation'
    ).toBe(true);
  });

  it('retrieves official BPJS healthcare referral pathway for puskesmas query', () => {
    const query = 'Bagaimana cara berobat ke psikolog atau psikiater pakai BPJS di Puskesmas?';
    const result = retrieveClinicalContext(query);

    expect(result.isGrounded).toBe(true);
    expect(result.bestChunk?.id).toBe('bpjs-referral-pathway');
    expect(result.bestChunk?.source).toContain('BPJS');
  });

  it('retrieves CFT self-compassion for guilt / feeling foolish query', () => {
    const query = 'Saya merasa gagal dan selalu menyalahkan diri sendiri';
    const result = retrieveClinicalContext(query);

    expect(result.isGrounded).toBe(true);
    expect(result.bestChunk?.category).toBe('self-compassion');
    expect(result.bestChunk?.source).toContain('Neff');
  });

  it('generates grounded response with citations and non-medical disclaimer', () => {
    const response = generateGroundedResponse('Apa itu teknik grounding 5-4-3-2-1?', 'id');
    expect(response.isGrounded).toBe(true);
    expect(response.answer).toContain('Grounding');
    expect(response.answer).toContain('Catatan: Informasi ini bersifat psikoedukatif');
    expect(response.sourceCitation).toBeDefined();
    expect(response.evidenceTier).toMatch(/Tier [AB]/);
  });

  it('provides safe ungrounded fallback without fabricating for completely unrelated query', () => {
    const irrelevantQuery = 'Bagaimana cara memperbaiki karburator motor bebek tua?';
    const response = generateGroundedResponse(irrelevantQuery, 'id');

    expect(response.isGrounded).toBe(false);
    expect(response.answer).toContain('belum memiliki informasi klinis terverifikasi');
    expect(response.actionRoute).toBe('/education');
  });

  it('thesaurus maps common terms to key clinical concepts', () => {
    expect(CLINICAL_THESAURUS.anxiety).toContain('deg-degan');
    expect(CLINICAL_THESAURUS.depression).toContain('mager');
    expect(CLINICAL_THESAURUS.professional).toContain('bpjs');
    expect(CLINICAL_THESAURUS.self_compassion).toContain('welas asih');
  });
});
