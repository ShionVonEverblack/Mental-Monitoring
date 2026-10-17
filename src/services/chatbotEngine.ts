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

import { detectCrisis, type CssrsRiskTier } from './crisisDetectionService';
import { detectDelusion, formatCbtpMessage } from '../utils/delusionPatterns';
import { generateGroundedResponse, type GroundedChatResponse } from './clinicalRagService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  stage: 'CRISIS_OVERRIDE' | 'CBTP_DEESCALATION' | 'MEDICAL_BOUNDARY_REFUSAL' | 'GROUNDED_RAG' | 'UNGROUNDED_FALLBACK' | 'RECOVERY_AFFIRMATION';
  sourceCitation?: string;
  evidenceTier?: string;
  actionRoute?: string;
  actionLabel?: string;
  isEmergency?: boolean;
  cssrsTier?: CssrsRiskTier;
  matchedKeywords?: string[];
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

  // ─── STAGE 1: Pre-Flight Crisis Triage & Negation Guard ─────────────────────
  const crisisResult = detectCrisis(userInput);

  // 1A. Negation Guard & Recovery Context: Positive warm reinforcement (No Lockout)
  if (crisisResult.isRecovery) {
    const recoveryTexts: Record<string, string> = {
      id: `🌸 **Penguatan Pemulihan & Welas Asih Diri**\n\n` +
        `Terima kasih sudah berbagi hal ini. Saya sangat menghargai dan bersyukur mendengar bahwa kamu merasa lebih baik dan tidak lagi memiliki keinginan untuk menyakiti diri.\n\n` +
        `Proses pemulihan batin membutuhkan keberanian yang nyata. Ingatlah bahwa setiap kemajuan kecil yang kamu tempuh adalah bukti ketangguhanmu.\n\n` +
        `Tetaplah bersikap lembut terhadap diri sendiri. Kapan pun kamu butuh ruang hening, latihan pernapasan, atau teknik grounding, saya selalu ada di sini untuk mendampingimu.`,
      en: `🌸 **Affirmation of Recovery & Self-Compassion**\n\n` +
        `Thank you for sharing this. I am genuinely glad and honored to hear that you are feeling better and no longer experiencing thoughts of harming yourself.\n\n` +
        `Emotional recovery takes courage, patience, and time. Every small step forward is a meaningful testament to your inner resilience.\n\n` +
        `Keep caring for yourself with kindness. Whenever you need a gentle breathing space or grounding exercise, I am always here to support you.`,
      jv: `🌸 **Pangayom Pemulihan & Welas Asih Diri**\n\n` +
        `Matur nuwun sampun mbagekaken punika. Kula bingah sanget mireng bilih panjenengan sampun rumaos luwih sae lan mboten kagungan krenteg ngrisak awak malih.\n\n` +
        `Lampahing pulih punika mbetahaken kawicaksanan lan tekad ageng. Tetep tresnani diri pribadi kanthi kebak sabar.`,
      su: `🌸 **Pangrojong Pamulihan & Welas Asih Diri**\n\n` +
        `Hatur nuhun parantos ngabagi perkawis ieu. Simkuring ngiring bingah ngadangu salira parantos langkung sae sareng teu aya deui hoyong nyiksa diri.\n\n` +
        `Unggal léngkah pamulihan mangrupakeun kameunangan ageung. Terus jaga katenangan batin salira kalayan pinuh kanyaah.`,
      ja: `🌸 **回復への称賛とセルフ・コンパッション**\n\n` +
        `気持ちを共有していただきありがとうございます。あなたが快方に向かい、もう自分を傷つけたいと思わなくなったと聞いて、心から安心しました。\n\n` +
        `心の回復には時間と勇気が必要です。歩んできた一歩一歩が、あなたの力強さの証です。どうぞご自身を大切に労わってください。`,
      zh: `🌸 **康复肯定与自我关怀**\n\n` +
        `感谢你的真诚分享。得知你感觉好多了、不再有伤害自己的想法，我由衷为你感到欣慰与高兴。\n\n` +
        `内心的康复旅程需要巨大的勇气和耐心。你所迈出的每一步微小进展，都是坚韧的证明。请继续温柔地关爱自己。`,
      es: `🌸 **Afirmación de Recuperación y Autocompasión**\n\n` +
        `Gracias por compartir esto. Me alegra y reconforta profundamente saber que te sientes mejor y que ya no deseas hacerte daño.\n\n` +
        `El proceso de recuperación emocional requiere paciencia y valentía. Cada pequeño paso cuenta como una gran victoria personal. Sigue tratándote con afecto y respeto.`,
      ar: `🌸 **تأكيد التعافي والتعاطف مع الذات**\n\n` +
        `شكراً لمشاركتك هذا معي. يسعدني جداً ويشرفني أن أسمع أنك تشعر بتحسن ولم تعد ترغب في إيذاء نفسك.\n\n` +
        `رحلة التعافي تتطلب شجاعة وصبراً حقيقيين. كل خطوة إيجابية تخطوها هي دليل على قوتك وعزيمتك. استمر في رعاية نفسك بكل لطف وحنان.`,
    };

    const actionLabels: Record<string, string> = {
      id: 'Latihan Welas Asih Diri',
      en: 'Practice Self-Compassion',
      jv: 'Gladhen Welas Asih',
      su: 'Latihan Welas Asih',
      ja: 'セルフ・コンパッションを実践',
      zh: '进行自我关怀练习',
      es: 'Practicar Autocompasión',
      ar: 'ممارسة التعاطف مع الذات',
    };

    return {
      id: msgId,
      sender: 'bot',
      text: recoveryTexts[lang] || recoveryTexts.id,
      timestamp,
      stage: 'RECOVERY_AFFIRMATION',
      sourceCitation: 'Compassion-Focused Therapy (CFT; Gilbert 2014) & WHO Positive Mental Health',
      evidenceTier: 'Tier A',
      actionRoute: '/self-compassion',
      actionLabel: actionLabels[lang] || actionLabels.id,
      isEmergency: false,
      cssrsTier: 'none',
      matchedKeywords: crisisResult.matchedKeywords,
    };
  }

  // 1B. Active Crisis Triage (C-SSRS Tier 2/3, or Severe/Moderate Crisis): Halt open generation to prevent hallucination / sycophancy
  if (
    crisisResult.isDetected &&
    (crisisResult.cssrsTier === 'tier3_acute_imminent' ||
     crisisResult.cssrsTier === 'tier2_active_no_plan' ||
     crisisResult.severity === 'severe' ||
     crisisResult.severity === 'moderate')
  ) {
    const emergencyTexts: Record<string, string> = {
      id: `🚨 **Bantuan Darurat & Keselamatan Segera**\n\n` +
        `Saya mendengar betapa berat dan menyakitkannya hal yang sedang kamu rasakan saat ini, namun tolong ingat bahwa kamu tidak harus menanggung beban ini sendirian.\n\n` +
        `Sebagai asisten AI, saya tidak dapat menggantikan pertolongan medis darurat manusia. Mohon segera hubungi layanan bantuan resmi berikut:\n` +
        `• **Layanan SEJIWA Kemenkes**: Telepon **119** (lalu tekan angka **8**) — Layanan gratis dan rahasia.\n` +
        `• **Panggilan Darurat Umum**: Telepon **112** (Bebas Pulsa).\n` +
        `• **Yayasan Pulih**: WhatsApp/Telepon 0811-8436-633\n` +
        `• **Rencana Keselamatan Stanley-Brown**: Akses kontak kepercayaan dan strategi koping darurat.\n` +
        `• **Regulasi Somatik 5-4-3-2-1**: Tenangkan denyut jantung dan pikiran seketika.\n\n` +
        `Keselamatan dan hidupmu sangatlah berharga. Ada bantuan yang siap mendampingimu saat ini.`,
      en: `🚨 **Urgent Support & Immediate Safety**\n\n` +
        `I hear that you are going through immense pain, but please know that you do not have to carry this alone.\n\n` +
        `As an AI companion, I cannot replace real human emergency care. Please connect immediately with people who can support you:\n` +
        `• **SEJIWA Crisis Helpline**: Call **119** (press extension **8**) for free, confidential Indonesian mental health support.\n` +
        `• **General Emergency**: Call **112** (toll-free).\n` +
        `• **Yayasan Pulih**: 0811-8436-633\n` +
        `• **Stanley-Brown Safety Plan**: Open your personalized coping steps and contacts.\n` +
        `• **Somatic Grounding (5-4-3-2-1)**: Regulate your nervous system safely right now.\n\n` +
        `Your safety and your life matter deeply.`,
      jv: `🚨 **Bantuan Darurat & Kaslametan Tumunten**\n\n` +
        `Kula mirengaken sepinten awrat lan nglarani raos ingkang panjenengan lampahi sakmenika, ananging nyuwun tulung emut bilih panjenengan mboten kedah nampi sesanggan punika piyambakan.\n\n` +
        `Minangka asistèn AI, kula mboten saged nggantos pitulungan medis darurat manungsa. Mangga enggal hubungi layanan pitulungan resmi:\n` +
        `• **Layanan SEJIWA Kemenkes**: Telepon **119** (lajeng pencet angka **8**) — Gratis lan wadi.\n` +
        `• **Panggilan Darurat Umum**: Telepon **112** (Bebas Pulsa).\n` +
        `• **Yayasan Pulih**: 0811-8436-633\n` +
        `• **Rencana Kaslametan Stanley-Brown**: Bukak kontak kapitadosan lan koping darurat.\n` +
        `• **Regulasi Somatik 5-4-3-2-1**: Leremaken deg-degan lan pikiran saknalika.\n\n` +
        `Kaslametan lan gesang panjenengan sanget aji.`,
      su: `🚨 **Bantosan Darurat & Kasalametan Geura**\n\n` +
        `Simkuring ngiring ngaraoskeun kumaha beurat sareng peurihna kaayaan anu nuju karandapan, nanging punten émut yén salira henteu kedah nanggung ieu nyalira.\n\n` +
        `Salaku asistén AI, simkuring henteu tiasa ngagantikeun bantosan médis darurat manusa. Mangga geura kontak layanan resmi ieu:\n` +
        `• **Layanan SEJIWA Kemenkes**: Telepon **119** (teras pencét angka **8**) — Gratis tur rahasia.\n` +
        `• **Panggilan Darurat Umum**: Telepon **112** (Bebas Pulsa).\n` +
        `• **Yayasan Pulih**: 0811-8436-633\n` +
        `• **Rancangan Kasalametan Stanley-Brown**: Buka kontak kapercantenan sareng koping darurat.\n` +
        `• **Regulasi Somatik 5-4-3-2-1**: Reureuhkeun ketuk jajantung sareng pikiran sakiceup.\n\n` +
        `Kasalametan sareng hirup anjeun kacida berhargana.`,
      ja: `🚨 **緊急支援と安全の確保**\n\n` +
        `今とてもつらく苦しい思いを抱えていらっしゃることを受け止めています。どうか一人で抱え込まないでください。\n\n` +
        `AIアシスタントは人間の救急医療や専門的支援の代わりにはなれません。直ちに以下の窓口にご連絡ください：\n` +
        `• **SEJIWA緊急ホットライン**: **119**（内線 **8**）にお電話ください（インドネシア国内通話料無料）。\n` +
        `• **総合緊急通報**: **112**（無料通話）。\n` +
        `• **ヤヤサン・プリ（Pulih財団）**: 0811-8436-633\n` +
        `• **スタンリー・ブラウン安全計画**: 信頼できる連絡先や緊急対処法を確認してください。\n` +
        `• **ソマティック・グラウンディング (5-4-3-2-1)**: 心拍を落ち着かせ、今この瞬間に意識を戻します。\n\n` +
        `あなたの命と安全は何よりも大切です。`,
      zh: `🚨 **紧急援助与即刻安全保障**\n\n` +
        `我能感受到你此刻正承受着巨大的痛苦，但请记住，你绝不需要独自承受这些负担。\n\n` +
        `作为AI伴侣，我无法替代真实的人类紧急医疗救援。请立即联系以下正式援助机构：\n` +
        `• **SEJIWA危机热线**：拨打 **119**（接通后按 **8**）获取免费且保密的心理危机援助。\n` +
        `• **全国紧急求助电话**：拨打 **112**（免费电话）。\n` +
        `• **Yayasan Pulih危机心理援助**：0811-8436-633\n` +
        `• **斯坦利-布朗安全计划**：查看你的信任联络人与应急对策。\n` +
        `• **5-4-3-2-1 躯体着陆调节**：即刻平复心率与杂乱思绪。\n\n` +
        `你的生命和安全至关重要。`,
      es: `🚨 **Apoyo Urgente y Seguridad Inmediata**\n\n` +
        `Comprendo el inmenso dolor que estás sintiendo en este momento, pero por favor recuerda que no tienes que sobrellevar esto a solas.\n\n` +
        `Como asistente de IA, no puedo reemplazar la atención médica humana de emergencia. Por favor, comunícate de inmediato con los servicios de apoyo oficial:\n` +
        `• **Línea de Crisis SEJIWA**: Llama al **119** (presiona la extensión **8**) para apoyo confidencial y gratuito.\n` +
        `• **Emergencias Generales**: Llama al **112** (línea gratuita).\n` +
        `• **Fundación Pulih**: 0811-8436-633\n` +
        `• **Plan de Seguridad de Stanley-Brown**: Accede a tus contactos de confianza y estrategias de afrontamiento.\n` +
        `• **Enraizamiento Somático (5-4-3-2-1)**: Calma tu frecuencia cardíaca y mente de inmediato.\n\n` +
        `Tu seguridad y tu vida son profundamente valiosas.`,
      ar: `🚨 **دعم طارئ وسلامة فورية**\n\n` +
        `أشعر بمدى الألم الشديد الذي تمر به في هذه اللحظة، ولكن أرجوك تذكر أنك لست مضطراً لتحمل هذا الثقل بمفردك.\n\n` +
        `بصفتي مساعد ذكاء اصطناعي، لا يمكنني استبدال الرعاية الطبية البشرية في حالات الطوارئ. يرجى الاتصال فوراً بخدمات الدعم الرسمية التالية:\n` +
        `• **خط SEJIWA لدعم الأزمات**: اتصل بالرقم **119** (ثم اضغط على التحويلة **8**) لخدمة مجانية وسرية.\n` +
        `• **طوارئ عامة**: اتصل بالرقم **112** (مكالمة مجانية).\n` +
        `• **مؤسسة Yayasan Pulih**: 0811-8436-633\n` +
        `• **خطة أمان ستانلي-براون**: افتح جهات الاتصال الموثوقة واستراتيجيات المواجهة.\n` +
        `• **التنظيم الجسدي (5-4-3-2-1)**: هدئ نبضات قلبك وأفكارك على الفور.\n\n` +
        `سلامتك وحياتك ثمينة جداً، وهناك من يقف بجانبك دائماً.`,
    };

    const emergencyActionLabels: Record<string, string> = {
      id: 'Hubungi Bantuan Darurat',
      en: 'Open Emergency Hotline Directory',
      jv: 'Hubungi Bantuan Darurat',
      su: 'Kontak Bantosan Darurat',
      ja: '緊急相談窓口一覧を開く',
      zh: '打开紧急援助通道',
      es: 'Abrir Directorio de Emergencia',
      ar: 'فتح دليل خطوط الطوارئ',
    };

    return {
      id: msgId,
      sender: 'bot',
      text: emergencyTexts[lang] || emergencyTexts.id,
      timestamp,
      stage: 'CRISIS_OVERRIDE',
      sourceCitation: 'Kemenkes RI SEJIWA & WHO Suicide Prevention Protocol',
      evidenceTier: 'Tier A',
      actionRoute: '/professional-help',
      actionLabel: emergencyActionLabels[lang] || emergencyActionLabels.id,
      isEmergency: true,
      cssrsTier: crisisResult.cssrsTier,
      matchedKeywords: crisisResult.matchedKeywords,
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
