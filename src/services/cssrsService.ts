import type { CssrsAnswers, CssrsEvaluation, CssrsResult } from '../types';

export const CSSRS_STORAGE_KEY = 'rima-cssrs-results';

export interface CssrsQuestionDef {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q6Recent';
  titleKey: string;
  titleFallback: string;
  textKey: string;
  textFallback: string;
  isConditional?: boolean;
}

export const CSSRS_QUESTIONS: CssrsQuestionDef[] = [
  {
    id: 'q1',
    titleKey: 'cssrs.q1_title',
    titleFallback: 'Keinginan Mengakhiri Hidup',
    textKey: 'cssrs.q1_text',
    textFallback:
      'Apakah dalam beberapa waktu terakhir kamu pernah berharap untuk tidur dan tidak bangun lagi, atau berharap kamu sudah tidak ada lagi di dunia ini?',
  },
  {
    id: 'q2',
    titleKey: 'cssrs.q2_title',
    titleFallback: 'Pikiran Bunuh Diri Umum',
    textKey: 'cssrs.q2_text',
    textFallback:
      'Apakah kamu pernah benar-benar memiliki pikiran untuk mengakhiri hidupmu?',
  },
  {
    id: 'q3',
    titleKey: 'cssrs.q3_title',
    titleFallback: 'Pikiran dengan Metode',
    textKey: 'cssrs.q3_text',
    textFallback:
      'Apakah kamu pernah memikirkan bagaimana cara atau metode yang mungkin digunakan untuk melakukannya?',
    isConditional: true,
  },
  {
    id: 'q4',
    titleKey: 'cssrs.q4_title',
    titleFallback: 'Niat Tanpa Rencana Pasti',
    textKey: 'cssrs.q4_text',
    textFallback:
      'Apakah kamu memiliki niat atau keinginan untuk bertindak berdasarkan pikiran tersebut, meskipun belum merencanakan detailnya?',
    isConditional: true,
  },
  {
    id: 'q5',
    titleKey: 'cssrs.q5_title',
    titleFallback: 'Niat dengan Rencana Spesifik',
    textKey: 'cssrs.q5_text',
    textFallback:
      'Apakah kamu telah menyusun rencana tertentu dan berniat untuk melakukannya?',
    isConditional: true,
  },
  {
    id: 'q6',
    titleKey: 'cssrs.q6_title',
    titleFallback: 'Riwayat Perilaku',
    textKey: 'cssrs.q6_text',
    textFallback:
      'Sepanjang hidupmu, apakah kamu pernah melakukan tindakan, mencoba, atau bersiap untuk mengakhiri hidupmu?',
  },
  {
    id: 'q6Recent',
    titleKey: 'cssrs.q6_recent_title',
    titleFallback: 'Perilaku 3 Bulan Terakhir',
    textKey: 'cssrs.q6_recent_text',
    textFallback:
      'Apakah tindakan, percobaan, atau persiapan tersebut terjadi dalam 3 bulan terakhir?',
    isConditional: true,
  },
];

/**
 * Evaluates C-SSRS responses according to standard clinical triage rules.
 *
 * Triage logic:
 * - High Risk:
 *     Q4 = true (Intent without plan) OR
 *     Q5 = true (Intent with specific plan) OR
 *     (Q6 = true AND Q6Recent = true) (Suicidal behavior in past 3 months)
 * - Moderate Risk:
 *     Q3 = true (Methods without intent/plan) OR
 *     Q2 = true (Active suicidal thoughts) OR
 *     (Q6 = true AND Q6Recent = false) (Lifetime behavior > 3 months ago)
 * - Low Risk:
 *     Q1 = true (Wish to be dead / passive ideation only; Q2 = false, Q6 = false)
 * - None / Minimal Risk:
 *     All questions answered false.
 */
export function evaluateCssrs(answers: CssrsAnswers): CssrsEvaluation {
  const isHighRisk =
    answers.q4 === true ||
    answers.q5 === true ||
    (answers.q6 === true && answers.q6Recent === true);

  if (isHighRisk) {
    return {
      riskLevel: 'high',
      titleKey: 'cssrs.high_risk_title',
      titleFallback: 'Tindakan Keselamatan Mendesak Diperlukan',
      descKey: 'cssrs.high_risk_desc',
      descFallback:
        'Keselamatanmu adalah prioritas utama. Tolong segera hubungi layanan darurat 119 ext 8, 112, atau datangi fasilitas kesehatan / IGD terdekat.',
      color: 'var(--color-danger, #ef4444)',
      actionRecommendation: 'imminent_emergency_intervention',
    };
  }

  const isModerateRisk =
    answers.q3 === true ||
    answers.q2 === true ||
    (answers.q6 === true && answers.q6Recent === false);

  if (isModerateRisk) {
    return {
      riskLevel: 'moderate',
      titleKey: 'cssrs.moderate_risk_title',
      titleFallback: 'Dukungan Aktif & Komunikasi Sangat Dianjurkan',
      descKey: 'cssrs.moderate_risk_desc',
      descFallback:
        'Pikiran yang kamu rasakan membutuhkan perhatian serius. Segera hubungi hotline konseling krisis atau dampingi dirimu dengan orang terpercaya.',
      color: 'var(--color-warning, #f59e0b)',
      actionRecommendation: 'urgent_hotline_support',
    };
  }

  if (answers.q1 === true) {
    return {
      riskLevel: 'low',
      titleKey: 'cssrs.low_risk_title',
      titleFallback: 'Dukungan Keselamatan Diri Disarankan',
      descKey: 'cssrs.low_risk_desc',
      descFallback:
        'Kamu mungkin sedang merasakan beban mental yang berat. Kami menyarankan untuk meninjau Rencana Keselamatanmu dan berbicara dengan orang terdekat.',
      color: 'var(--color-info, #3b82f6)',
      actionRecommendation: 'coping_and_safety_plan',
    };
  }

  return {
    riskLevel: 'none',
    titleKey: 'cssrs.none_risk_title',
    titleFallback: 'Kondisimu Relatif Stabil',
    descKey: 'cssrs.none_risk_desc',
    descFallback:
      'Tidak terdeteksi indikasi krisis langsung. Tetap luangkan waktu untuk merawat diri dan pantau suasana hatimu secara berkala.',
    color: 'var(--color-success, #10b981)',
    actionRecommendation: 'stable',
  };
}

export function getCssrsHistory(): CssrsResult[] {
  try {
    const raw = localStorage.getItem(CSSRS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCssrsResult(
  data: Omit<CssrsResult, 'id' | 'createdAt'>
): CssrsResult {
  const newEntry: CssrsResult = {
    ...data,
    id: 'cssrs-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  try {
    const current = getCssrsHistory();
    const updated = [newEntry, ...current].slice(0, 50);
    localStorage.setItem(CSSRS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail for storage error / quota
  }

  return newEntry;
}

export function getLatestCssrsResult(): CssrsResult | null {
  const history = getCssrsHistory();
  return history.length > 0 ? history[0] : null;
}
