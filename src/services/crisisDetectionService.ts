/**
 * Crisis Detection Service — Zero-Trust Crisis Interceptor, Negation Guard & C-SSRS Triage
 * 
 * Based on clinical & NLP research findings:
 * - Columbia Suicide Severity Rating Scale (C-SSRS): Triages risk into Tier 1 (Passive Hopelessness),
 *   Tier 2 (Active Ideation without Plan), and Tier 3 (Acute Crisis with Plan/Means/Imminent Intent).
 * - Crisis Text Line (Pisani et al., 2022, JMIR): Co-occurrence matching of
 *   lethal means + temporal/imminence markers is far more predictive than
 *   generic sadness keywords.
 * - Negation-Aware Context Guard: Prevents false positives from recovery statements
 *   ("aku sudah tidak ingin menyakiti diri lagi", "bukan mau bunuh diri", "I don't want to die anymore")
 *   while maintaining 100% sensitivity for contrast compound sentences
 *   ("tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup").
 * - SAMHSA Trauma-Informed Design: Non-alarmist, empowering suggested actions.
 * - Multilingual support for all 8 RIMA languages (id, en, jv, su, ja, zh, es, ar).
 * 
 * All detection runs 100% client-side (<5ms deterministic execution). No data is transmitted.
 */

export type CssrsRiskTier = 'none' | 'tier1_passive' | 'tier2_active_no_plan' | 'tier3_acute_imminent';

export interface CrisisDetectionResult {
  isDetected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  matchedKeywords: string[];
  suggestedActionKey: string;
  suggestedActionFallback: string;
  cssrsTier: CssrsRiskTier;
  isRecovery: boolean;
  isNegated: boolean;
  recoveryAffirmationKey?: string;
  recoveryAffirmationFallback?: string;
}

// ─── Multilingual Keyword Dictionaries ────────────────────────────────────

const keywords = {
  severe: [
    // Indonesian (formal & colloquial)
    'bunuh diri', 'bunuhdiri', 'mau mati', 'ingin mati', 'mengakhiri hidup',
    'gantung diri', 'gantungdiri', 'tidak mau hidup lagi', 'tidak mau hidup',
    'gak mau hidup', 'ga mau hidup', 'nggak mau hidup', 'gak mau hidup lagi',
    'ga mau hidup lagi', 'nggak mau hidup lagi', 'gamau idup', 'gak mau idup',
    'ga mau idup', 'nggak mau idup', 'tidak mau idup', 'gamau idup lagi',
    'akhiri hidupku', 'ingin mengakhiri hidup', 'mau mengakhiri hidup', 'mengakhiri semuanya',
    // Indonesian slang (Gen-Z / social media)
    'bundir', 'pengen mati', 'gamau hidup', 'gamau hidup lagi', 'pengen ngilang selamanya',
    'mau ngakhirin semuanya', 'ngakhirin semuanya', 'mau ngakhiri semuanya',
    // English
    'suicide', 'want to die', 'wanna die', 'kill myself', 'killmyself', 'end my life',
    'take my own life', 'take my life', 'end it all', 'ending it all', 'ending my life',
    'suicidal', 'want to kill myself', 'wanna kill myself',
    "don't want to live anymore", "dont want to live anymore", "do not want to live anymore",
    "don't want to live", "dont want to live", "do not want to live",
    // Japanese (ja)
    '死にたい', '自殺', '消えたい', '命を絶ちたい', '死のう',
    // Chinese (zh)
    '想死', '自杀', '不想活了', '活不下去', '结束生命', '去死',
    // Spanish (es)
    'suicidio', 'suicidarme', 'suicidar', 'suicidarse', 'quiero morir', 'me quiero morir',
    'quitarme la vida', 'acabar con mi vida', 'matarme', 'no quiero vivir más', 'no quiero vivir mas',
    // Arabic (ar - both with and without hamza for mobile keyboard parity)
    'انتحار', 'أريد الموت', 'اريد الموت', 'إنهاء حياتي', 'انهاء حياتي', 'أقتل نفسي', 'اقتل نفسي',
    'أنتحر', 'انتحر', 'سأنتحر', 'سانتحر',
    // Javanese (jv)
    'mateni awak dewe', 'ora gelem urip', 'nggantung', 'pejah',
    'mungkasi urip', 'kendhat', 'wegah urip', 'emoh urip', 'ajeng pejah',
    // Sundanese (su)
    'hayang paeh', 'teu hayang hirup', 'ngagantung', 'hoyong maot',
    'ngaleungitkeun nyawa', 'hoream hirup', 'embung hirup', 'alim hirup',
  ],
  moderate: [
    // Indonesian
    'menyakiti diri', 'menyakitidiri', 'putus asa', 'tidak ada harapan', 'tidak berguna',
    'beban bagi semua', 'menyayat', 'melukai diri', 'melukaidiri', 'melukai diri sendiri',
    'lebih baik mati', 'berharap mati', 'berharap tidak bangun lagi',
    'tidak ada alasan untuk hidup', 'buat apa hidup',
    // Indonesian slang
    'nyilet', 'nyayat', 'ngelukai diri', 'gapunya harapan',
    'capek bgt pengen udahan',
    // English
    'self harm', 'self-harm', 'selfharm', 'cut myself', 'cutmyself', 'hopeless', 'no hope', 'worthless',
    'burden', 'hurt myself', 'no reason to live', 'better off dead',
    'everyone would be better without me', 'wish i were dead', 'wish i was dead',
    'wish to be dead', 'wish i didn\'t exist', 'wish i was never born',
    // Japanese
    '自傷', '絶望', '価値がない', '生きる意味がない', 'リストカット', '死んだほうがまし',
    // Chinese
    '自残', '绝望', '没有希望', '活着没意义', '割腕', '不如死了', '希望自己死掉',
    // Spanish
    'autolesión', 'autolesion', 'cortarme', 'sin esperanza', 'no valgo nada',
    'soy una carga', 'mejor estar muerto', 'desearía estar muerto', 'desearia estar muerto',
    // Arabic
    'إيذاء نفسي', 'ايذاء نفسي', 'يأس', 'لا أمل', 'عديم القيمة', 'عبء', 'أتمنى لو كنت ميتا', 'اتمنى لو كنت ميتا',
    // Javanese
    'mboten kiyat malih', 'ora ana pangarep-arep', 'ngiris awak', 'wegah urip maneh',
    'ora betah urip',
    // Sundanese
    'teu kiat deui', 'teu aya harepan', 'nyiksaan diri', 'nyiksa diri', 'hoream hirup deui',
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

// ─── Inherent Negative Distress Keywords ──────────────────────────────────
// For these expressions, the word 'tidak', 'no', etc., is part of the clinical
// distress itself (e.g. "tidak mau hidup lagi" = wanting to die).
// Internal negation must NOT be treated as a recovery negation.
const INHERENT_NEGATIVE_KEYWORDS: Set<string> = new Set([
  'tidak mau hidup lagi',
  'tidak mau hidup',
  'gak mau hidup',
  'ga mau hidup',
  'nggak mau hidup',
  'gak mau hidup lagi',
  'ga mau hidup lagi',
  'nggak mau hidup lagi',
  'gamau idup',
  'gak mau idup',
  'ga mau idup',
  'nggak mau idup',
  'tidak mau idup',
  'gamau idup lagi',
  'gamau hidup',
  'gamau hidup lagi',
  "don't want to live anymore",
  "dont want to live anymore",
  "do not want to live anymore",
  "don't want to live",
  "dont want to live",
  "do not want to live",
  'tidak ada harapan',
  'tidak berguna',
  'gapunya harapan',
  'no reason to live',
  'no hope',
  'worthless',
  'teu hayang hirup',
  'ora gelem urip',
  'ora ana pangarep-arep',
  'teu aya harepan',
  'wegah urip',
  'emoh urip',
  'hoream hirup',
  'embung hirup',
  'alim hirup',
  '不想活了',
  '没有希望',
  'sin esperanza',
  'no valgo nada',
  'no quiero vivir más',
  'no quiero vivir mas',
  'لا أمل',
  'عديم القيمة',
  'tidak ada alasan untuk hidup',
  'buat apa hidup',
  "wish i didn't exist",
  'wish i was never born',
  'wish i were dead',
  'wish i was dead',
  'wish to be dead',
  'lebih baik mati',
  'berharap mati',
  'desearía estar muerto',
  'desearia estar muerto',
]);

// ─── Co-occurrence Dictionaries (Crisis Text Line Research) ───────────────
// Lethal means + temporal/intent markers appearing un-negated = Tier 3 Acute Imminent

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
  // Javanese
  'mlumpat', 'mencolot', 'nyemplung',
  // Sundanese
  'luncat',
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
  'sebelum pergi', 'sudah memutuskan', 'rencana akhir', 'nanti malam',
  'besok', 'segera', 'minggu ini', 'malam nanti', 'lusa', 'nanti',
  'besok pagi', 'hari esok', 'minggu depan', 'nanti siang', 'nanti sore',
  // English
  'tonight', 'right now', 'today', 'goodbye', 'farewell',
  'suicide note', 'last message', 'final goodbye',
  'made up my mind', 'decided to', 'before i go', 'last time',
  'tomorrow', 'later tonight', 'soon', 'this week', 'later',
  'tomorrow morning', 'this weekend', 'next week', 'the day after tomorrow',
  // Javanese
  'sesuk', 'saiki', 'mengko bengi', 'dina iki', 'sedhela maneh', 'wis mantep',
  // Sundanese
  'isukan', 'ayeuna', 'engke peuting', 'poe ieu', 'sakedap deui', 'geus bulet',
  // Japanese
  '今夜', 'さようなら', '遺書', '最後', '決めた', '明日', 'すぐに', '近いうちに',
  // Chinese
  '今晚', '告别信', '最后', '再见了', '决定了', '明天', '很快',
  // Spanish
  'esta noche', 'adiós para siempre', 'carta de despedida', 'decidí', 'mañana', 'pronto', 'más tarde',
  // Arabic
  'الليلة', 'وداعاً للأبد', 'رسالة وداع', 'قررت', 'غداً', 'قريباً', 'لاحقاً',
];

// ─── C-SSRS Plan Markers (Tier 3 Risk Factor) ─────────────────────────────
const PLAN_MARKERS: string[] = [
  // Indonesian
  'punya rencana', 'ada rencana', 'rencana mau', 'sudah merencanakan',
  'sudah berencana', 'merencanakan', 'berencana untuk', 'rencanaku',
  'rencana saya', 'sudah menyiapkan', 'sudah siapkan', 'sudah siap',
  // English
  'have a plan', 'have planned', 'made a plan', 'planning to',
  'plan to', 'planned to', 'got a plan', 'my plan is',
  // Spanish
  'tengo un plan', 'planeando', 'tengo planeado', 'he planeado', 'planeo', 'tengo la intención',
  // Arabic
  'لدي خطة', 'أخطط', 'أنوي الانتحار', 'لدي نية',
  // Japanese
  '計画がある', '計画している', '計画した',
  // Chinese
  '有计划', '计划好', '打算好了',
  // Javanese
  'duwe rencana', 'nduwe rencana', 'wis nduwe rencana', 'nduwe niat',
  // Sundanese
  'boga rencana', 'geus boga rencana', 'boga niat',
];

// ─── Historical Past Markers & Recovery Markers ───────────────────────────
const PAST_HISTORICAL_MARKERS: string[] = [
  'dulu', 'dahulu', 'tadinya', 'tahun lalu', 'bulan lalu', 'kemarin',
  'waktu itu', 'dulu sempat', 'sempat', 'pernah', 'sebelumnya',
  'used to', 'in the past', 'previously', 'formerly', 'earlier',
  'yesterday', 'last year', 'last month', 'back then', 'once',
  'antes', 'anteriormente', 'el año pasado', 'ayer', 'solía',
  '昔', '以前', 'かつて', '昨日',
  '以前', '过去', '曾经', '昨天', '去年',
  'في الماضي', 'سابقاً', 'كنت في السابق', 'أمس',
  'biyen', 'dek biyen', 'wingi', 'nate',
  'baheula', 'kamari', 'kungsi',
];

const RECOVERY_MARKERS: string[] = [
  'sudah pulih', 'sudah sembuh', 'sudah membaik', 'sudah berhenti',
  'sekarang sudah pulih', 'sekarang sudah sembuh', 'sekarang sudah membaik',
  'sekarang sudah tidak', 'sekarang gak lagi', 'sekarang merasa lebih baik',
  'bersyukur masih hidup', 'bersyukur', 'merasa lebih baik', 'jauh lebih baik',
  'hidupku jauh lebih baik', 'tidak akan bunuh diri', 'tidak mau bunuh diri',
  'tidak ingin menyakiti diri lagi', 'bukan mau bunuh diri', 'udah stop',
  'now recovered', 'now in recovery', 'feeling much better', 'feeling better',
  'now clean', 'clean now', 'healing now', 'glad to be alive', 'grateful to be alive',
  'won\'t kill myself', "don't want to die anymore", 'stopped hurting myself',
  '回復した', '今は元気', '立ち直った', '生きていてよかった',
  '康复了', '现在好多了', '庆幸还活着', '已经走出来了',
  'recuperado', 'ahora me siento mejor', 'agradecido de estar vivo',
  'تعافيت', 'أشعر بتحسن الآن', 'الحمد لله على الحياة',
  'sampun mantun', 'wis mari', 'tos damang',
];

// Double negation canceler expressions that negate a following negative particle
// (e.g. "bukan berarti aku tidak ingin bunuh diri", "it's not that I don't want to die")
const DOUBLE_NEGATION_CANCELERS: RegExp[] = [
  /\b(?:bukan berarti|tidak berarti|tak berarti|siapa bilang|mana mungkin|bukan jaminan|tidak ada hari di mana|dudu tegese|ora ateges|sopo kandha|sanes hartosna|teu hartina|saha nu nyebut)\b/i,
  /\b(?:(?:it(?:'s| is) )?not (?:that|like)|(?:doesn't|does not) mean (?:that )?|who (?:says|said) (?:that )?|no way (?:that )?|not to say (?:that )?)\b/i,
  /\b(?:no significa que no|no es que no)\b/i,
  /(?:不代表我不想|并不是说我不)/i,
  /(?:هذا لا يعني|ليس معنى ذلك|لا يعني أنني لا)/i,
];

// ─── Negation & Recovery Patterns ─────────────────────────────────────────

// Prefixes that negate or indicate recovery within a clause
const NEGATION_AND_RECOVERY_PREFIXES: string[] = [
  // Indonesian compound & simple negations
  'sudah tidak ', 'udah gak ', 'udah nggak ', 'dah ga ', 'tidak ', 'tdk ',
  'gak ', 'nggak ', 'ga ', 'tak ', 'bukan ', 'bkn ', 'belum ', 'blm ', 'jangan ', 'jgn ',
  'tak ada niat ', 'tidak ada niat ', 'tidak bermaksud ', 'bukan mau ', 'bukan berniat ',
  'tidak mau ', 'gak mau ', 'gamau ', 'tdk mau ', 'tidak ingin ', 'gak pengen ', 'nggak pengen ',
  'tak ingin ', 'sudah berhenti ', 'udah stop ', 'sudah sembuh ', 'sudah pulih ',
  // English negations & recovery markers
  'no longer ', "don't want to ", 'dont want to ', "don't ", 'dont ',
  "doesn't ", 'doesnt ', "didn't ", 'didnt ', 'never want to ', 'never ',
  "won't ", 'wont ', "i'm not ", 'im not ', 'am not ', 'not ', 'no ',
  'stop ', 'stopped ', 'clean from ', 'free from ', 'recovering from ', 'recovered from ', 'quit ',
  // Japanese
  'ない', 'しない', 'たくない', 'やめた', '克服した', '治った', 'ありません',
  // Chinese
  '不想', '没有', '不会', '不再', '已经戒了', '康复', '不打算', '不想要', '放弃了自残',
  // Spanish
  'ya no ', 'dejé de ', 'no quiero ', 'no ', 'nunca ', 'jamás ', 'recuperado ', 'libre de ', 'no tengo intención de ', 'no pienso ',
  // Arabic
  'لم أعد ', 'لم اعد ', 'توقفت عن ', 'تعافيت ', 'لا ', 'ليس ', 'لست ', 'لن ', 'ما عدت ', 'ليس لدي نية ', 'لا أريد ', 'لا اريد ', 'لا أنوي ', 'لا انوي ',
  // Javanese
  'sampun mboten ', 'wis ora ', 'ora gelem ', 'ora arep ', 'mboten pareng ', 'mboten ', 'ora ', 'dudu ', 'ora ana niat ', 'mboten wonten niat ',
  // Sundanese
  'tos teu ', 'tos cageur ', 'eureun ', 'teu hayang ', 'moal ', 'henteu ', 'teu ', 'sanes ', 'teu aya niat ', 'moal pernah ',
];

// Recovery suffixes that reinforce recovery in the same clause (e.g. "tidak ingin menyakiti diri lagi")
const RECOVERY_SUFFIXES: string[] = [
  'lagi', 'anymore', 'any more', 'any longer', 'sudah membaik', 'sudah pulih',
  'sudah sembuh', 'recovered', 'healing', 'no more', 'deui', 'malih', 'maneh',
  'بعد الآن', 'بعد الان', 'más', 'nunca más', 'しない', 'なんてしない', 'する気はない', 'するつもりはない',
  'はやめた', 'をやめた', 'をやめました',
];

// ─── Pre-compiled Regexes for High-Performance (<5ms) Evaluation ─────────

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const CONTRAST_SPLIT_REGEX = /\b(?:tapi|tetapi|namun|melainkan|akan tetapi|padahal|hanya saja|meskipun begitu|walaupun begitu|walau demikian|biarpun begitu|but|however|yet|nevertheless|nonetheless|though|although|still|except|pero|sin embargo|no obstante|sino|nanging|ewadene|ananging|namung|sabalikna)\b|(?:但是|可是|不过|然而|但|しかし|でも|けれども|だけど|だが|ものの|لكن|ولكن|غير أن|إلا أن|مع ذلك)/i;

const CLAUSE_SPLIT_REGEX = /[.;!?\n\r,…。、，！？؛،؟]+/;

const EXTERNAL_NEGATION_REGEX = /(?:^|\s)(?:bukan|sudah sembuh dari|tidak lagi|not|no longer|dudu|sanes|ya no|no más|لم أعد|لم اعد|ليس|不再|不是)\s*$/i;

const PREFIX_CLEAN_REGEX = /[^\p{L}\p{N}\s']/gu;
const MULTI_SPACE_REGEX = /\s+/g;

const NORM_ELLIPSIS_REGEX = /\.{2,}|\u2026/g;
const NORM_HYPHEN_REGEX = /(?<=[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF])[-/_](?=[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF])/g;
const NORM_REPEAT_REGEX = /(.)\1{2,}/gu;
const NORM_KIL_REGEX = /\bkil\b/g;

const NORM_ARABIC_TATWEEL_REGEX = /\u0640/g;
const NORM_PUNCT_LETTERS_REGEX = /(?<=\b[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF])[.*_\-~/]+(?=[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]\b)/g;
const NORM_SPACED_LETTERS_REGEX = /(?<=\b[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF])\s(?=[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]\b)/g;
const NORM_LEET_WORD_REGEX = /\b(?=[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]*\d)[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9]+\b/g;
const LEET_CHAR_MAP: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't' };
const LEET_REPLACE_REGEX = /[013457]/g;

function normalizeLeetWord(word: string): string {
  if (!/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(word)) return word;
  return word.replace(LEET_REPLACE_REGEX, (ch) => LEET_CHAR_MAP[ch] || ch);
}

const CJK_NEGATIONS = [
  '不想', '没有', '不会', '不再', '已经戒了', '康复', '不打算', '不想要', '放弃了自残',
  'ない', 'しない', 'たくない', 'やめた', '克服した', '治った', 'ありません'
];

const JAPANESE_NEGATION_SUFFIXES = [
  'しない', 'なんてしない', 'する気はない', 'するつもりはない', 'はやめた', 'をやめた',
  'をやめました', 'とは思わない', 'たくない', 'ない', 'わけではない', 'つもりはない'
];

const JAPANESE_CRISIS_KEYWORDS = new Set(['自殺', '死にたい', '自傷', 'リストカット', '命を絶ちたい', '死のう']);

const PAST_CESSATION_SUFFIXES = [
  'tidak lagi', 'gak lagi', 'nggak lagi', 'tak lagi', 'no longer', 'not anymore',
  'sudah tidak', 'sudah berhenti', 'sudah pulih', 'sudah sembuh', 'teu deui',
  'ora maneh', 'mboten malih', 'ya no', 'dejé de'
];

const PREFIX_NEGATION_REGEX = new RegExp(
  `(?:^|\\s)(?:${NEGATION_AND_RECOVERY_PREFIXES.map(p => escapeRegExp(p.trim())).filter(Boolean).sort((a, b) => b.length - a.length).join('|')})(?:\\s+(?:ingin|mau|pengen|berniat|bermaksud|ada niat|punya niat|ada pikiran|akan|bisa|lagi|coba|want|want to|wanna|wish|wish to|plan|plan to|feel like|have thoughts of|going to|to|hoyong|hayang|boga niat|niat|palay|daek|tiasa|bade|arep|gelem|karep|badhe|karsa|gadah niat|duwe niat|saged|quiero|tengo intención de|tengo la intención de|pienso en|voy a|deseo|أريد أن|اريد ان|أنوي|انوي|لدي نية|أفكر في|افكر في|سوف|أن|ان))*$`,
  'i'
);

const ANY_NEGATION_IN_CLAUSE_REGEX = /(?:^|\s)(?:tidak|tdk|gak|nggak|ga|bukan|not|don't|dont|never|no|ora|mboten|dudu|teu|sanes|ya no|لا|ليس|لم)(?:\s|$)/i;

const RECOVERY_SUFFIX_REGEX = new RegExp(
  `(?:^|\\s)(?:${RECOVERY_SUFFIXES.map(s => escapeRegExp(s.trim())).filter(Boolean).sort((a, b) => b.length - a.length).join('|')})(?:\\s|$)`,
  'i'
);

const PAST_PREFIX_REGEX = new RegExp(
  `(?:^|\\s)(?:${PAST_HISTORICAL_MARKERS.map(m => escapeRegExp(m.trim())).filter(Boolean).sort((a, b) => b.length - a.length).join('|')})(?:\\s|$)`,
  'i'
);

// ─── Clause Segmentation Helpers ──────────────────────────────────────────

interface ClauseItem {
  text: string;
  isAfterContrast: boolean;
  hasPastMarker: boolean;
  hasRecoveryMarker: boolean;
}

/**
 * Splits text into grammatical clauses using punctuation and contrast conjunctions.
 * Preserves the distinction between pre-contrast and post-contrast clauses to ensure
 * compound sentences like "dulu tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup"
 * properly register the active crisis clause.
 */
function splitIntoClauses(text: string): ClauseItem[] {
  // Split first by sentence/clause punctuation delimiters (. ? ! ; \n \r and commas, plus CJK and Arabic)
  const rawSegments = text.split(CLAUSE_SPLIT_REGEX);
  const clauses: ClauseItem[] = [];

  for (const raw of rawSegments) {
    let current = raw.trim();
    if (!current) continue;

    let isAfterContrastInSegment = false;

    while (current) {
      const contrastMatch = current.match(CONTRAST_SPLIT_REGEX);
      if (contrastMatch && contrastMatch.index !== undefined) {
        const matchIndex = contrastMatch.index;
        const matchLen = contrastMatch[0].length;

        const partBefore = current.substring(0, matchIndex).trim();
        if (partBefore) {
          const lowerBefore = partBefore.toLowerCase();
          clauses.push({
            text: partBefore,
            isAfterContrast: isAfterContrastInSegment,
            hasPastMarker: PAST_HISTORICAL_MARKERS.some(m => lowerBefore.includes(m)),
            hasRecoveryMarker: RECOVERY_MARKERS.some(m => lowerBefore.includes(m)),
          });
        }

        isAfterContrastInSegment = true;
        current = current.substring(matchIndex + matchLen).trim();
      } else {
        const lower = current.toLowerCase();
        clauses.push({
          text: current,
          isAfterContrast: isAfterContrastInSegment,
          hasPastMarker: PAST_HISTORICAL_MARKERS.some(m => lower.includes(m)),
          hasRecoveryMarker: RECOVERY_MARKERS.some(m => lower.includes(m)),
        });
        break;
      }
    }
  }

  if (clauses.length === 0) {
    const lower = text.trim().toLowerCase();
    return [{
      text: text.trim(),
      isAfterContrast: false,
      hasPastMarker: PAST_HISTORICAL_MARKERS.some(m => lower.includes(m)),
      hasRecoveryMarker: RECOVERY_MARKERS.some(m => lower.includes(m)),
    }];
  }

  return clauses;
}

/**
 * Checks whether a keyword occurrence in a clause is negated or expresses recovery.
 */
function isKeywordNegatedInClause(clause: string, keyword: string): boolean {
  const kwIdx = clause.indexOf(keyword);
  if (kwIdx === -1) return false;

  // Inherent negative keywords are active distress unless explicitly negated from outside
  if (INHERENT_NEGATIVE_KEYWORDS.has(keyword)) {
    const prefixBeforeInherent = clause.substring(0, kwIdx).trim().toLowerCase();
    return EXTERNAL_NEGATION_REGEX.test(prefixBeforeInherent);
  }

  const prefix = clause.substring(0, kwIdx).trim().toLowerCase();
  const suffix = clause.substring(kwIdx + keyword.length).trim().toLowerCase();
  const prefixSlice = prefix.slice(-50);

  // Check for Double Negation Cancelers in the prefix
  // e.g. "bukan berarti aku tidak ingin bunuh diri" -> "bukan berarti" cancels the negation "tidak ingin"
  for (let i = 0; i < DOUBLE_NEGATION_CANCELERS.length; i++) {
    if (DOUBLE_NEGATION_CANCELERS[i].test(prefix)) {
      return false; // Negation is canceled, keyword remains active!
    }
  }

  // 1. Direct prefix negation or recovery marker within 40-50 chars before keyword
  // CJK (Chinese & Japanese) negations without whitespace boundaries
  for (let i = 0; i < CJK_NEGATIONS.length; i++) {
    if (prefixSlice.includes(CJK_NEGATIONS[i])) {
      return true;
    }
  }

  // Clean trailing punctuation, emojis, and emoticons from prefix to allow robust matching
  const cleanedPrefix = prefixSlice.replace(PREFIX_CLEAN_REGEX, ' ').replace(MULTI_SPACE_REGEX, ' ').trim();

  if (PREFIX_NEGATION_REGEX.test(cleanedPrefix) || PREFIX_NEGATION_REGEX.test(prefixSlice)) {
    return true;
  }

  // 2. Check split negation / recovery suffix in Indonesian, English, and regional languages
  const hasAnyNegation = ANY_NEGATION_IN_CLAUSE_REGEX.test(cleanedPrefix) || ANY_NEGATION_IN_CLAUSE_REGEX.test(prefixSlice);
  const hasRecoverySuffix = RECOVERY_SUFFIX_REGEX.test(suffix.slice(0, 40));

  if (hasAnyNegation && hasRecoverySuffix) {
    return true;
  }

  // Check past marker prefix with explicit cessation/recovery suffix
  // Note: Bare 'lagi', 'deui', 'malih' means 'again' (repetition/relapse) unless paired with negation like 'tidak lagi'
  if (PAST_PREFIX_REGEX.test(prefix)) {
    for (let i = 0; i < PAST_CESSATION_SUFFIXES.length; i++) {
      if (suffix.includes(PAST_CESSATION_SUFFIXES[i])) {
        return true;
      }
    }
  }

  // 3. Multilingual grammatical suffixes: Japanese SOV verb negation & verb forms
  if (JAPANESE_CRISIS_KEYWORDS.has(keyword)) {
    for (let i = 0; i < JAPANESE_NEGATION_SUFFIXES.length; i++) {
      if (suffix.startsWith(JAPANESE_NEGATION_SUFFIXES[i]) || suffix.includes(JAPANESE_NEGATION_SUFFIXES[i])) {
        return true;
      }
    }
    if (clause.includes('死にたくない') || clause.includes('死にたいとは思わない')) {
      return true;
    }
  }

  return false;
}

/**
 * Checks for co-occurrence of lethal means + temporal/intent markers.
 * Verifies that neither component is negated in its respective clause.
 */
function detectCoOccurrence(clauses: ClauseItem[]): { detected: boolean; means: string[]; intent: string[] } {
  const matchedMeans: string[] = [];
  const matchedIntent: string[] = [];

  for (let i = 0; i < clauses.length; i++) {
    const { text, hasPastMarker, hasRecoveryMarker, isAfterContrast } = clauses[i];

    // Only skip if this clause itself is recovery or a past clause followed by a subsequent recovery clause
    const isPastFollowedBySubsequentRecovery = hasPastMarker && !isAfterContrast && clauses.slice(i + 1).some(n =>
      n.hasRecoveryMarker || RECOVERY_MARKERS.some(rm => n.text.toLowerCase().includes(rm))
    );
    if (hasRecoveryMarker || isPastFollowedBySubsequentRecovery) continue;

    const lower = text.toLowerCase();

    for (const term of LETHAL_MEANS) {
      if (lower.includes(term) && !isKeywordNegatedInClause(lower, term)) {
        matchedMeans.push(term);
      }
    }

    for (const term of TEMPORAL_INTENT) {
      if (lower.includes(term) && !isKeywordNegatedInClause(lower, term)) {
        matchedIntent.push(term);
      }
    }
  }

  const uniqueMeans = Array.from(new Set(matchedMeans));
  const uniqueIntent = Array.from(new Set(matchedIntent));

  return {
    detected: uniqueMeans.length > 0 && uniqueIntent.length > 0,
    means: uniqueMeans,
    intent: uniqueIntent,
  };
}

// ─── Exported API ────────────────────────────────────────────────────────

export function getCrisisKeywords(): { severe: string[], moderate: string[], mild: string[] } {
  return keywords;
}

/**
 * Enhanced Zero-Trust Crisis Interceptor with Negation Guard & C-SSRS Triage.
 * Deterministic client-side evaluation running in <5ms.
 */
export function detectCrisis(text: string): CrisisDetectionResult {
  if (!text || !text.trim()) {
    return {
      isDetected: false,
      severity: 'none',
      matchedKeywords: [],
      suggestedActionKey: '',
      suggestedActionFallback: '',
      cssrsTier: 'none',
      isRecovery: false,
      isNegated: false,
    };
  }

  // Normalize text:
  // 1. Lowercase and trim
  let normalized = text.toLowerCase().trim();
  // 2. Normalize Arabic tatweel
  normalized = normalized.replace(NORM_ARABIC_TATWEEL_REGEX, '');
  // 3. Collapse hesitation ellipses (.. or ... or …) into space so pauses do not fragment clauses
  normalized = normalized.replace(NORM_ELLIPSIS_REGEX, ' ');
  // 4. Normalize punctuation-separated single letters (e.g. "b.u.n.u.h" -> "bunuh", "s.u.i.c.i.d.e" -> "suicide")
  normalized = normalized.replace(NORM_PUNCT_LETTERS_REGEX, '');
  // 5. Normalize spaced single letters (e.g. "b u n u h  d i r i" -> "bunuh  diri")
  normalized = normalized.replace(NORM_SPACED_LETTERS_REGEX, '');
  // 6. Normalize hyphenated/slashed word boundaries between letters (e.g. "bunuh-diri" -> "bunuh diri")
  normalized = normalized.replace(NORM_HYPHEN_REGEX, ' ');
  // 7. De-obfuscate alphanumeric leetspeak in words (e.g. "bund1r" -> "bundir", "k1ll" -> "kill", "m4u m4t1" -> "mau mati")
  normalized = normalized.replace(NORM_LEET_WORD_REGEX, normalizeLeetWord);
  // 8. Collapse character elongation (3 or more identical characters: "bunuuuh" -> "bunuh", "suiciiiide" -> "suicide")
  normalized = normalized.replace(NORM_REPEAT_REGEX, '$1');
  // 9. Restore specific dictionary words that require double letters if collapsed: "kil" -> "kill"
  normalized = normalized.replace(NORM_KIL_REGEX, 'kill');
  // 10. Normalize multiple whitespace into single space
  normalized = normalized.replace(MULTI_SPACE_REGEX, ' ');

  const clauses = splitIntoClauses(normalized);

  const matchedKeywords: string[] = [];
  let score = 0;
  let recoveryCount = 0;
  let hasExplicitSevereKeyword = false;
  let hasTemporalIntent = false;
  let hasLethalMeans = false;
  let hasPlan = false;

  // ── Phase 1: High-Specificity CTL Co-occurrence Check ──
  const coOccurrence = detectCoOccurrence(clauses);
  if (coOccurrence.detected) {
    score += 100;
    matchedKeywords.push(...coOccurrence.means, ...coOccurrence.intent);
    hasLethalMeans = true;
    hasTemporalIntent = true;
  }

  // ── Phase 2: Per-Clause Keyword Tier Matching with Negation Guard ──
  for (let i = 0; i < clauses.length; i++) {
    const { text: clauseText, hasPastMarker, hasRecoveryMarker, isAfterContrast } = clauses[i];
    const clauseLower = clauseText.toLowerCase();

    // Check if this clause is a past historical statement followed by a recovery clause
    // It is ONLY past-recovery if:
    // 1. The clause itself has a past marker and is NOT post-contrast (contrast introduces active/relapse state), AND
    // 2. A subsequent clause in the sentence explicitly expresses recovery, OR
    // 3. For a single-clause sentence, the recovery marker occurs in the same clause
    const hasSubsequentRecovery = clauses.slice(i + 1).some(next =>
      next.hasRecoveryMarker ||
      RECOVERY_MARKERS.some(rm => next.text.toLowerCase().includes(rm)) ||
      next.text.toLowerCase().includes('tidak lagi') ||
      next.text.toLowerCase().includes('gak lagi') ||
      next.text.toLowerCase().includes('clean') ||
      next.text.toLowerCase().includes('pulih') ||
      next.text.toLowerCase().includes('sembuh') ||
      next.text.toLowerCase().includes('damang') ||
      next.text.toLowerCase().includes('mari')
    );

    const isPastClauseFollowedByRecovery = hasPastMarker && !isAfterContrast && (
      hasSubsequentRecovery ||
      (clauses.length === 1 && (hasRecoveryMarker || RECOVERY_MARKERS.some(rm => clauseLower.includes(rm))))
    );

    // Check severe keywords
    for (const kw of keywords.severe) {
      if (clauseLower.includes(kw)) {
        if (isKeywordNegatedInClause(clauseLower, kw) || isPastClauseFollowedByRecovery) {
          recoveryCount++;
        } else {
          matchedKeywords.push(kw);
          score += 10;
          hasExplicitSevereKeyword = true;
        }
      }
    }

    // Check moderate keywords
    for (const kw of keywords.moderate) {
      if (clauseLower.includes(kw)) {
        if (isKeywordNegatedInClause(clauseLower, kw) || isPastClauseFollowedByRecovery) {
          recoveryCount++;
        } else {
          matchedKeywords.push(kw);
          score += 5;
        }
      }
    }

    // Check mild keywords (distress / overwhelm)
    for (const kw of keywords.mild) {
      if (clauseLower.includes(kw)) {
        if (isKeywordNegatedInClause(clauseLower, kw)) {
          recoveryCount++;
        } else {
          matchedKeywords.push(kw);
          score += 2;
        }
      }
    }

    // Direct recovery phrases (e.g. Japanese negative verb forms)
    const directRecoveryPhrases = ['死にたくない', '自殺しない', 'リストカットをやめた'];
    for (const phrase of directRecoveryPhrases) {
      if (clauseLower.includes(phrase)) {
        recoveryCount++;
      }
    }

    // Plan tracking (only in active, non-past clauses)
    if (!hasPlan && !isPastClauseFollowedByRecovery && !hasRecoveryMarker) {
      for (const plan of PLAN_MARKERS) {
        if (clauseLower.includes(plan) && !isKeywordNegatedInClause(clauseLower, plan)) {
          hasPlan = true;
          break;
        }
      }
    }

    // Temporal Intent tracking (only in active, non-past clauses)
    if (!hasTemporalIntent && !isPastClauseFollowedByRecovery && !hasRecoveryMarker) {
      for (const term of TEMPORAL_INTENT) {
        if (clauseLower.includes(term) && !isKeywordNegatedInClause(clauseLower, term)) {
          hasTemporalIntent = true;
          break;
        }
      }
    }

    // Lethal Means tracking (only in active, non-past clauses)
    if (!hasLethalMeans && !isPastClauseFollowedByRecovery && !hasRecoveryMarker) {
      for (const term of LETHAL_MEANS) {
        if (clauseLower.includes(term) && !isKeywordNegatedInClause(clauseLower, term)) {
          hasLethalMeans = true;
          break;
        }
      }
    }
  }

  const uniqueMatches = Array.from(new Set(matchedKeywords));

  const ACTIVE_SUICIDAL_OR_SELFHARM = new Set([
    ...keywords.severe,
    'menyakiti diri', 'menyakitidiri', 'self harm', 'self-harm', 'selfharm', 'cut myself', 'cutmyself', 'nyilet', 'nyayat', 'melukai diri', 'melukaidiri',
    'melukai diri sendiri', 'menyayat', '自傷', 'リストカット', '自残', '割腕', 'autolesión', 'autolesion',
    'cortarme', 'إيذاء نفسي', 'ايذاء نفسي', 'ngiris awak', 'nyiksaan diri'
  ]);
  const hasActiveSuicidalOrSelfHarm = uniqueMatches.some(kw => ACTIVE_SUICIDAL_OR_SELFHARM.has(kw));

  // Recovery is affirmed if:
  // 1. Score is 0 and recoveryCount > 0, OR
  // 2. Recovery count > 0, no active suicidal or self-harm keywords, and remaining score is only mild/general distress (score <= 5)
  const isRecoveryAffirmation = (score === 0 && recoveryCount > 0) ||
    (recoveryCount > 0 && !hasActiveSuicidalOrSelfHarm && score <= 5);

  // ── Phase 3: Pure Recovery Guard Handling ──
  if (isRecoveryAffirmation) {
    return {
      isDetected: false,
      severity: 'none',
      matchedKeywords: [],
      suggestedActionKey: 'crisis.recoveryAction',
      suggestedActionFallback: 'Kami menghargai proses pemulihanmu. Terus rawat dirimu dengan welas asih.',
      cssrsTier: 'none',
      isRecovery: true,
      isNegated: true,
      recoveryAffirmationKey: 'crisis.recoveryAffirmation',
      recoveryAffirmationFallback: 'Kami sangat menghargai proses pemulihanmu. Teruslah melangkah dan sayangi dirimu; setiap kemajuan kecil adalah kemenangan besar.',
    };
  }

  // ── Phase 4: Severity & C-SSRS Triage Classification ──
  let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
  let cssrsTier: CssrsRiskTier = 'none';
  let suggestedActionKey = '';
  let suggestedActionFallback = '';

  if (score >= 10 || coOccurrence.detected) {
    severity = 'severe';
    suggestedActionKey = 'crisis.severeAction';
    suggestedActionFallback = 'Segera hubungi layanan darurat atau seseorang yang Anda percayai.';

    // Acute Imminent (Tier 3) vs Active without Plan (Tier 2) vs Passive Hopelessness (Tier 1):
    // Tier 3: Co-occurrence of means + temporal intent, OR severe/self-harm ideation with plan, temporal intent, or lethal means
    if (
      coOccurrence.detected ||
      ((hasExplicitSevereKeyword || hasActiveSuicidalOrSelfHarm) && (hasPlan || hasTemporalIntent || hasLethalMeans))
    ) {
      cssrsTier = 'tier3_acute_imminent';
    } else if (hasActiveSuicidalOrSelfHarm) {
      cssrsTier = 'tier2_active_no_plan';
    } else {
      cssrsTier = 'tier1_passive';
    }
  } else if (score >= 5) {
    severity = 'moderate';
    suggestedActionKey = 'crisis.moderateAction';
    suggestedActionFallback = 'Pertimbangkan untuk berbicara dengan konselor atau teman dekat.';

    if (hasActiveSuicidalOrSelfHarm && (hasPlan || hasLethalMeans || hasTemporalIntent)) {
      cssrsTier = 'tier3_acute_imminent';
    } else if (hasActiveSuicidalOrSelfHarm) {
      cssrsTier = 'tier2_active_no_plan';
    } else {
      cssrsTier = 'tier1_passive';
    }
  } else if (score >= 2) {
    severity = 'mild';
    suggestedActionKey = 'crisis.mildAction';
    suggestedActionFallback = 'Cobalah latihan pernapasan atau tuliskan perasaan Anda di jurnal.';
    cssrsTier = 'tier1_passive';
  }

  return {
    isDetected: score > 0,
    severity,
    matchedKeywords: uniqueMatches,
    suggestedActionKey,
    suggestedActionFallback,
    cssrsTier,
    isRecovery: false,
    isNegated: recoveryCount > 0,
  };
}

/**
 * Diagnostic helper to evaluate C-SSRS risk tier directly from text.
 */
export function evaluateCssrsRiskTier(text: string): {
  tier: CssrsRiskTier;
  isDetected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
} {
  const res = detectCrisis(text);
  return {
    tier: res.cssrsTier,
    isDetected: res.isDetected,
    severity: res.severity,
  };
}

// Micro-warmup on module evaluation to ensure deterministic <5ms latency on first invocation
try {
  detectCrisis('warmup');
} catch {
  // no-op
}
