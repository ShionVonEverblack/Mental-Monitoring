import { describe, it, expect } from 'vitest';
import { processChatbotMessage, checkMedicalBoundary } from '../chatbotEngine';

describe('Chatbot Engine & Clinical Safety Pipeline', () => {
  it('triggers Crisis Override for acute suicidal ideation', () => {
    const input = 'Saya ingin bunuh diri malam ini, tidak sanggup lagi.';
    const response = processChatbotMessage(input, 'id');

    expect(response.stage).toBe('CRISIS_OVERRIDE');
    expect(response.isEmergency).toBe(true);
    expect(response.text).toContain('119');
    expect(response.text).toContain('SEJIWA');
    expect(response.actionRoute).toBe('/professional-help');
  });

  it('triggers CBTp De-Escalation for persecutory/surveillance delusion', () => {
    const input = 'Kamar saya dipasangi kamera rahasia dan disadap oleh orang tak dikenal.';
    const response = processChatbotMessage(input, 'id');

    expect(response.stage).toBe('CBTP_DEESCALATION');
    expect(response.isEmergency).toBe(false);
    expect(response.text).toContain('mencemaskan');
    expect(response.text).toContain('Sebagai asisten AI');
    expect(response.actionRoute).toBe('/grounding');
  });

  it('triggers Medical Boundary Refusal for prescription request', () => {
    const input = 'Tolong resepkan obat tidur atau berapa dosis sertraline yang harus saya minum?';
    const response = processChatbotMessage(input, 'id');

    expect(response.stage).toBe('MEDICAL_BOUNDARY_REFUSAL');
    expect(response.text).toContain('Batasan Medis & Farmakologis');
    expect(response.text).toContain('Sp.KJ');
    expect(response.actionRoute).toBe('/professional-help');
  });

  it('triggers Medical Boundary Refusal for diagnostic inquiry', () => {
    const input = 'Apakah saya skizofrenia atau bipolar? Tolong diagnosis saya.';
    const response = processChatbotMessage(input, 'id');

    expect(response.stage).toBe('MEDICAL_BOUNDARY_REFUSAL');
    expect(response.text).toContain('Batasan Non-Diagnosis Klinis');
    expect(response.actionRoute).toBe('/professional-help');
  });

  it('retrieves grounded RAG response for evidence-based psychoeducational questions', () => {
    const input = 'Bagaimana cara menenangkan diri saat serangan panik datang?';
    const response = processChatbotMessage(input, 'id');

    expect(response.stage).toBe('GROUNDED_RAG');
    expect(response.sourceCitation).toBeDefined();
    expect(response.evidenceTier).toMatch(/Tier [AB]/);
    expect(response.actionRoute).toBeDefined();
  });

  it('correctly detects medical boundary violations via checkMedicalBoundary helper', () => {
    expect(checkMedicalBoundary('resep obat penenang').isViolation).toBe(true);
    expect(checkMedicalBoundary('apakah saya bipolar').isViolation).toBe(true);
    expect(checkMedicalBoundary('saya ingin belajar teknik napas').isViolation).toBe(false);
  });

  it('supports English responses cleanly', () => {
    const input = 'What is the 5-4-3-2-1 grounding technique for anxiety?';
    const response = processChatbotMessage(input, 'en');

    expect(response.stage).toBe('GROUNDED_RAG');
    expect(response.text.toLowerCase()).toContain('grounding');
    expect(response.actionLabel).toBeDefined();
  });
});
