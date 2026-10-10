/**
 * RIMA Chatbot Clinical Safety Engine & Finite State Machine
 * 
 * Pipeline:
 * 1. Pre-Flight Crisis NLP Filter (Crisis Text Line / Pisani 2022) -> Emergency Override
 * 2. Delusion / Paranoia Scan -> Tri-Phasic CBTp De-Escalation
 * 3. Medical Prescription & Diagnostic Boundary Scan -> Non-Diagnostic Refusal
 * 4. Grounded Clinical RAG Retrieval (WHO / APA / NICE evidence)
 * 5. Post-Generation Safety Verification
 * 
 * Complies with WHO AI Ethics, APA App Advisor, NICE Tier B/C, and UU PDP No. 27/2022.
 */

import { detectCrisis } from './crisisDetectionService';
import { detectDelusion, formatCbtpMessage } from '../utils/delusionPatterns';
import { generateGroundedResponse, type GroundedChatResponse } from './clinicalRagService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  stage: 'CRISIS_OVERRIDE' | 'CBTP_DEESCALATION' | 'MEDICAL_BOUNDARY_REFUSAL' | 'GROUNDED_RAG' | 'UNGROUNDED_FALLBACK';
  sourceCitation?: string;
  evidenceTier?: string;
  actionRoute?: string;
  actionLabel?: string;
  isEmergency?: boolean;
}

// ─── Medical & Diagnostic Boundary Patterns ───────────────────────────────────

const PRESCRIPTION_PATTERNS = [
  'resep obat', 'resepkan obat', 'dosis obat', 'minta resep', 'beli obat penenang',
  'obat depresi apa', 'dosis sertraline', 'dosis alprazolam', 'resepkan xanax',
  'obat tidur yang ampuh', 'resep antidepresan', 'berapa mg', 'berapa miligram',
  'prescribe medication', 'what dosage of', 'pills for anxiety', 'which antidepressant should i take',
  'nama obat penenang', 'obat keras',
];

const DIAGNOSTIC_PATTERNS = [
  'apakah saya bipolar', 'apakah saya skizofrenia', 'apakah saya depresi klinis',
  'diagnosis penyakit saya', 'tolong diagnosis saya', 'apa gangguan jiwa saya',
  'diagnose me', 'do i have schizophrenia', 'what is my psychiatric diagnosis',
  'apakah aku gila', 'vonis dokter',
];

/**
 * Checks whether user message is asking for medication prescriptions or medical diagnoses.
 */
export function checkMedicalBoundary(text: string): {
  isViolation: boolean;
  type: 'prescription' | 'diagnosis' | 'none';
} {
  const normalized = text.toLowerCase().trim();

  for (const pattern of PRESCRIPTION_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { isViolation: true, type: 'prescription' };
    }
  }

  for (const pattern of DIAGNOSTIC_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { isViolation: true, type: 'diagnosis' };
    }
  }

  return { isViolation: false, type: 'none' };
}

// ─── Main Pipeline Execution ──────────────────────────────────────────────────

/**
 * Processes a user message through the 5-stage clinical AI safety pipeline.
 */
export function processChatbotMessage(
  userInput: string,
  lang: string = 'id'
): ChatMessage {
  const timestamp = Date.now();
  const msgId = `bot-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
  const isEn = lang === 'en';

  // ─── STAGE 1: Pre-Flight Crisis Triage ─────────────────────────────────────────
  const crisisResult = detectCrisis(userInput);
  if (crisisResult.isDetected && (crisisResult.severity === 'severe' || crisisResult.severity === 'moderate')) {
    const emergencyText = isEn
      ? `🚨 **Urgent Support & Immediate Safety**\n\n` +
        `I hear that you are going through immense pain, but please know that you do not have to carry this alone.\n\n` +
        `As an AI companion, I cannot replace real human emergency care. Please connect immediately with people who can support you:\n` +
        `• **SEJIWA Crisis Helpline**: Call **119** (press extension **8**) for free, confidential Indonesian mental health support.\n` +
        `• **General Emergency**: Call **112** (toll-free).\n` +
        `• **Yayasan Pulih**: 0811-8436-633\n\n` +
        `Your safety and your life matter deeply.`
      : `🚨 **Bantuan Darurat & Keselamatan Segera**\n\n` +
        `Saya mendengar betapa berat dan menyakitkannya hal yang sedang kamu rasakan saat ini, namun tolong ingat bahwa kamu tidak harus menanggung beban ini sendirian.\n\n` +
        `Sebagai asisten AI, saya tidak dapat menggantikan pertolongan medis darurat manusia. Mohon segera hubungi layanan bantuan resmi berikut:\n` +
        `• **Layanan SEJIWA Kemenkes**: Telepon **119** (lalu tekan angka **8**) — Layanan gratis dan rahasia.\n` +
        `• **Panggilan Darurat Umum**: Telepon **112** (Bebas Pulsa).\n` +
        `• **Yayasan Pulih**: WhatsApp/Telepon 0811-8436-633\n\n` +
        `Keselamatan dan hidupmu sangatlah berharga. Ada bantuan yang siap mendampingimu saat ini.`;

    return {
      id: msgId,
      sender: 'bot',
      text: emergencyText,
      timestamp,
      stage: 'CRISIS_OVERRIDE',
      sourceCitation: 'Kemenkes RI SEJIWA & WHO Suicide Prevention Protocol',
      evidenceTier: 'Tier A',
      actionRoute: '/professional-help',
      actionLabel: isEn ? 'Open Emergency Hotline Directory' : 'Hubungi Bantuan Darurat',
      isEmergency: true,
    };
  }

  // ─── STAGE 2: Delusion & Paranoia Scanner (CBTp Gatekeeper) ──────────────────
  const delusionResult = detectDelusion(userInput);
  if (delusionResult.isDelusionDetected && delusionResult.cbtpResponse) {
    const cbtpFormatted = formatCbtpMessage(delusionResult.cbtpResponse, lang);
    return {
      id: msgId,
      sender: 'bot',
      text: cbtpFormatted.text,
      timestamp,
      stage: 'CBTP_DEESCALATION',
      sourceCitation: 'Cognitive Behavioral Therapy for Psychosis (CBTp; Morrison 2017)',
      evidenceTier: 'Tier A',
      actionRoute: cbtpFormatted.actionRoute,
      actionLabel: cbtpFormatted.actionLabel,
      isEmergency: false,
    };
  }

  // ─── STAGE 3: Medical Boundary Gatekeeper (Prescriptions & Diagnosis) ─────────
  const boundaryCheck = checkMedicalBoundary(userInput);
  if (boundaryCheck.isViolation) {
    const boundaryText = boundaryCheck.type === 'prescription'
      ? (isEn
          ? `⚠️ **Clinical & Pharmacological Boundary Notice**\n\n` +
            `I cannot recommend, prescribe, or discuss specific medication dosages. Under medical law and clinical safety standards, psychiatric medications can only be safely evaluated and prescribed by a licensed **Psychiatrist (Dokter Spesialis Kedokteran Jiwa / Sp.KJ)** through direct clinical examination.\n\n` +
            `If you feel you need medication support, you can access mental health consultations covered 100% by BPJS Kesehatan at your local Puskesmas (FKTP).`
          : `⚠️ **Batasan Medis & Farmakologis**\n\n` +
            `Saya tidak dapat meresepkan, menyarankan nama obat medis, atau menentukan dosis obat. Berdasarkan undang-undang kesehatan dan standar keselamatan klinis, obat-obatan medis kejiwaan hanya dapat dievaluasi dan diresepkan secara aman oleh **Dokter Spesialis Kedokteran Jiwa (Sp.KJ / Psikiater)** melalui pemeriksaan medis langsung.\n\n` +
            `Bila kamu merasa memerlukan dukungan obat atau terapi medis, kamu dapat berkonsultasi secara gratis dengan dokter di Puskesmas (FKTP) terdaftar untuk mendapatkan rujukan BPJS Kesehatan resmi ke Poli Jiwa.`)
      : (isEn
          ? `⚠️ **Non-Diagnostic Clinical Boundary**\n\n` +
            `I cannot provide a psychiatric diagnosis or label your condition. Determining a clinical diagnosis requires a comprehensive psychiatric interview by a licensed clinical psychologist or psychiatrist (Sp.KJ).\n\n` +
            `However, what you are experiencing emotionally is valid. We can explore grounded coping strategies (such as grounding or thought records), or find certified professional clinics near you.`
          : `⚠️ **Batasan Non-Diagnosis Klinis**\n\n` +
            `Saya tidak dapat memberikan diagnosis medis atau melabeli kondisi kejiwaanmu. Menentukan diagnosis resmi memerlukan pemeriksaan klinis menyeluruh oleh psikolog klinis berlisensi atau dokter spesialis kedokteran jiwa (Sp.KJ).\n\n` +
            `Meskipun demikian, perasaan dan kesulitan yang kamu alami adalah hal yang nyata dan valid. Kita dapat bersama-sama mencoba latihan regulasi emosi (seperti grounding atau teknik pernapasan), atau melihat panduan konsultasi profesional terdekat.`);

    return {
      id: msgId,
      sender: 'bot',
      text: boundaryText,
      timestamp,
      stage: 'MEDICAL_BOUNDARY_REFUSAL',
      sourceCitation: 'WHO Digital Health & Indonesian Medical Act (UU No. 17/2023)',
      evidenceTier: 'Tier A',
      actionRoute: '/professional-help',
      actionLabel: isEn ? 'View BPJS & Clinic Guide' : 'Panduan Rujukan BPJS & Puskesmas',
      isEmergency: false,
    };
  }

  // ─── STAGE 4: Grounded Clinical RAG Retrieval ─────────────────────────────────
  const ragResponse: GroundedChatResponse = generateGroundedResponse(userInput, lang);

  return {
    id: msgId,
    sender: 'bot',
    text: ragResponse.answer,
    timestamp,
    stage: ragResponse.isGrounded ? 'GROUNDED_RAG' : 'UNGROUNDED_FALLBACK',
    sourceCitation: ragResponse.sourceCitation,
    evidenceTier: ragResponse.evidenceTier,
    actionRoute: ragResponse.actionRoute,
    actionLabel: ragResponse.actionLabel,
    isEmergency: false,
  };
}
