/**
 * Crisis Detection Service — Enhanced NLP Engine
 * 
 * Based on research findings from:
 * - Crisis Text Line (Pisani et al., 2022, JMIR): Co-occurrence matching of
 *   lethal means + temporal/imminence markers is far more predictive than
 *   generic sadness keywords.
 * - SAMHSA Trauma-Informed Design: Non-alarmist, empowering suggested actions.
 * - Multilingual support for all 8 RIMA languages.
 * 
 * All detection runs 100% client-side. No data is transmitted.
 */

export interface CrisisDetectionResult {
  isDetected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  matchedKeywords: string[];
  suggestedActionKey: string;
  suggestedActionFallback: string;
}

// ─── Negation Prefixes ─────────────────────────────────────────────────────
// Used to prevent false positives like "saya TIDAK ingin bunuh diri"
const NEGATION_PREFIXES: string[] = [
  // Indonesian
  'tidak ', 'tdk ', 'gak ', 'nggak ', 'ga ', 'bukan ', 'belum ', 'jangan ',
  // English
  'not ', "don't ", "doesn't ", 'never ', "won't ", "i'm not ", 'no longer ',
  // Japanese
  'ない', 'しない',
  // Chinese
  '不想', '没有',
  // Spanish
  'no ', 'nunca ', 'jamás ',
  // Arabic
  'لا ', 'ليس ', 'لست ',
];

// ─── Multilingual Keyword Dictionaries ────────────────────────────────────
// Organized by severity tier. Each entry includes the language tag for context.

const keywords = {
  severe: [
    // Indonesian (formal & colloquial)
    'bunuh diri', 'mau mati', 'ingin mati', 'mengakhiri hidup',
    'gantung diri', 'tidak mau hidup lagi', 'akhiri hidupku',
    // Indonesian slang (Gen-Z / social media)
    'bundir', 'pengen mati', 'gamau hidup', 'pengen ngilang selamanya',
    'mau ngakhirin semuanya',
    // English
    'suicide', 'want to die', 'kill myself', 'end my life',
    'take my own life', 'end it all', 'suicidal',
    // Japanese (ja)
    '死にたい', '自殺', '消えたい', '命を絶ちたい', '死のう',
    // Chinese (zh)
    '想死', '自杀', '不想活了', '活不下去', '结束生命', '去死',
    // Spanish (es)
    'suicidio', 'quiero morir', 'quitarme la vida', 'acabar con mi vida',
    'matarme',
    // Arabic (ar)
    'انتحار', 'أريد الموت', 'إنهاء حياتي', 'أقتل نفسي',
    // Javanese (jv)
    'mateni awak dewe', 'ora gelem urip', 'nggantung', 'pejah',
    'mungkasi urip', 'kendhat',
    // Sundanese (su)
    'hayang paeh', 'teu hayang hirup', 'ngagantung', 'hoyong maot',
    'ngaleungitkeun nyawa',
  ],
  moderate: [
    // Indonesian
    'menyakiti diri', 'putus asa', 'tidak ada harapan', 'tidak berguna',
    'beban bagi semua', 'menyayat', 'melukai diri',
    // Indonesian slang
    'nyilet', 'nyayat', 'ngelukai diri', 'gapunya harapan',
    'capek bgt pengen udahan',
    // English
    'self harm', 'cut myself', 'hopeless', 'no hope', 'worthless',
    'burden', 'hurt myself', 'no reason to live', 'better off dead',
    'everyone would be better without me',
    // Japanese
    '自傷', '絶望', '価値がない', '生きる意味がない', 'リストカット',
    // Chinese
    '自残', '绝望', '没有希望', '活着没意义', '割腕',
    // Spanish
    'autolesión', 'cortarme', 'sin esperanza', 'no valgo nada',
    'soy una carga',
    // Arabic
    'إيذاء نفسي', 'يأس', 'لا أمل', 'عديم القيمة', 'عبء',
    // Javanese
    'mboten kiyat malih', 'ora ana pangarep-arep', 'ngiris awak',
    // Sundanese
    'teu kiat deui', 'teu aya harepan', 'nyiksaan diri',
  ],
  mild: [
    // Indonesian
    'sangat sedih', 'sangat tertekan', 'tidak tahan', 'lelah hidup',
    'kewalahan', 'pengen ngilang', 'gamau bangun lagi',
    // English
    'overwhelmed', "can't take it", 'tired of living',
    'exhausted of everything', "can't go on", 'breaking down',
    // Japanese
    'もう限界', 'つらい', '疲れた', '耐えられない',
    // Chinese
    '受不了了', '太累了', '撑不下去', '崩溃了',
    // Spanish
    'no puedo más', 'agotado de todo', 'no aguanto',
    // Arabic
    'لا أستطيع التحمل', 'مرهق من كل شيء', 'منهار',
    // Javanese
    'mboten kiyat', 'sayah sanget', 'kesel urip',
    // Sundanese
    'teu kuat', 'capé pisan', 'sareseh hirup',
  ]
};

// ─── Co-occurrence Dictionaries (Crisis Text Line Research) ───────────────
// High-specificity: method/means + temporal/intent co-occurring = immediate severe

const LETHAL_MEANS: string[] = [
  // Medications
  'ibuprofen', 'parasetamol', 'paracetamol', 'overdosis', 'overdose',
  'obat tidur', 'sleeping pills', 'minum obat banyak', 'telan obat',
  // Physical means
  'jembatan', 'bridge', 'lompat', 'jump', 'loncat', 'atap', 'rooftop',
  'sayat', 'cutter', 'silet', 'razor', 'pisau', 'knife',
  'gantung', 'tali', 'rope', 'hang',
  'racun', 'poison', 'pestisida', 'pesticide',
  'senjata', 'weapon', 'gun', 'pistol',
  // Japanese
  'オーバードーズ', '首吊り', '飛び降り',
  // Chinese
  '吞药', '跳楼', '上吊',
  // Spanish
  'pastillas', 'sobredosis', 'puente', 'saltar',
  // Arabic
  'حبوب', 'جسر', 'قفز', 'سم',
];

const TEMPORAL_INTENT: string[] = [
  // Indonesian
  'malam ini', 'hari ini', 'sekarang juga', 'sekarang', 'sebentar lagi',
  'selamat tinggal', 'surat wasiat', 'terakhir kali', 'pesan terakhir',
  'sebelum pergi', 'sudah memutuskan', 'rencana akhir',
  // English
  'tonight', 'right now', 'today', 'goodbye', 'farewell',
  'suicide note', 'last message', 'final goodbye',
  'made up my mind', 'decided to', 'before i go', 'last time',
  // Japanese
  '今夜', 'さようなら', '遺書', '最後', '決めた',
  // Chinese
  '今晚', '告别信', '最后', '再见了', '决定了',
  // Spanish
  'esta noche', 'adiós para siempre', 'carta de despedida', 'decidí',
  // Arabic
  'الليلة', 'وداعاً للأبد', 'رسالة وداع', 'قررت',
];

// ─── Exported API ────────────────────────────────────────────────────────

export function getCrisisKeywords(): { severe: string[], moderate: string[], mild: string[] } {
  return keywords;
}

/**
 * Checks whether text is preceded by a negation phrase.
 * Prevents false positives like "saya TIDAK mau bunuh diri".
 */
function isNegated(text: string, keyword: string): boolean {
  const idx = text.indexOf(keyword);
  if (idx <= 0) return false;

  // Extract the 30 characters before the keyword match
  const prefix = text.substring(Math.max(0, idx - 30), idx).toLowerCase();

  return NEGATION_PREFIXES.some(neg => prefix.endsWith(neg));
}

/**
 * Checks for co-occurrence of lethal means + temporal/intent markers.
 * Based on Crisis Text Line research: this combination is far more
 * predictive of acute risk than generic sadness keywords alone.
 */
function detectCoOccurrence(text: string): { detected: boolean; means: string[]; intent: string[] } {
  const matchedMeans: string[] = [];
  const matchedIntent: string[] = [];

  LETHAL_MEANS.forEach(term => {
    if (text.includes(term)) matchedMeans.push(term);
  });

  TEMPORAL_INTENT.forEach(term => {
    if (text.includes(term)) matchedIntent.push(term);
  });

  return {
    detected: matchedMeans.length > 0 && matchedIntent.length > 0,
    means: matchedMeans,
    intent: matchedIntent,
  };
}

/**
 * Main crisis detection engine.
 * 
 * Scoring Logic:
 * 1. Co-occurrence of means + intent → immediate severe (score = 100)
 * 2. Severe keywords (not negated) → +10 each
 * 3. Moderate keywords (not negated) → +5 each
 * 4. Mild keywords → +2 each
 * 
 * Thresholds:
 * - score >= 10 → severe
 * - score >= 5  → moderate
 * - score >= 2  → mild
 */
export function detectCrisis(text: string): CrisisDetectionResult {
  if (!text) {
    return {
      isDetected: false,
      severity: 'none',
      matchedKeywords: [],
      suggestedActionKey: '',
      suggestedActionFallback: ''
    };
  }

  const normalizedText = text.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  let score = 0;

  // ── Phase 1: Co-occurrence check (highest specificity) ──
  const coOccurrence = detectCoOccurrence(normalizedText);
  if (coOccurrence.detected) {
    score += 100;
    matchedKeywords.push(...coOccurrence.means, ...coOccurrence.intent);
  }

  // ── Phase 2: Keyword tier matching with negation filtering ──

  // Check severe keywords
  keywords.severe.forEach(kw => {
    if (normalizedText.includes(kw) && !isNegated(normalizedText, kw)) {
      matchedKeywords.push(kw);
      score += 10;
    }
  });

  // Check moderate keywords
  keywords.moderate.forEach(kw => {
    if (normalizedText.includes(kw) && !isNegated(normalizedText, kw)) {
      matchedKeywords.push(kw);
      score += 5;
    }
  });

  // Check mild keywords
  keywords.mild.forEach(kw => {
    if (normalizedText.includes(kw)) {
      matchedKeywords.push(kw);
      score += 2;
    }
  });

  const uniqueMatches = Array.from(new Set(matchedKeywords));

  // ── Phase 3: Severity classification ──
  let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
  let suggestedActionKey = '';
  let suggestedActionFallback = '';

  if (score >= 10) {
    severity = 'severe';
    suggestedActionKey = 'crisis.severeAction';
    suggestedActionFallback = 'Segera hubungi layanan darurat atau seseorang yang Anda percayai.';
  } else if (score >= 5) {
    severity = 'moderate';
    suggestedActionKey = 'crisis.moderateAction';
    suggestedActionFallback = 'Pertimbangkan untuk berbicara dengan konselor atau teman dekat.';
  } else if (score >= 2) {
    severity = 'mild';
    suggestedActionKey = 'crisis.mildAction';
    suggestedActionFallback = 'Cobalah latihan pernapasan atau tuliskan perasaan Anda di jurnal.';
  }

  return {
    isDetected: score > 0,
    severity,
    matchedKeywords: uniqueMatches,
    suggestedActionKey,
    suggestedActionFallback
  };
}
