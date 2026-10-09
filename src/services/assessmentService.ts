import type { AssessmentResult, AssessmentType } from '../types';

export interface AssessmentQuestion {
  id: number;
  textKey: string;
  textFallback: string;
}

export interface AssessmentDefinition {
  type: AssessmentType;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
  questions: AssessmentQuestion[];
  options: { score: number; labelKey: string; labelFallback: string }[];
}

export const PHQ9_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, textKey: 'assessment.phq9.q1', textFallback: 'Kurang minat atau kesenangan dalam melakukan berbagai hal' },
  { id: 2, textKey: 'assessment.phq9.q2', textFallback: 'Merasa sedih, tertekan, atau putus asa' },
  { id: 3, textKey: 'assessment.phq9.q3', textFallback: 'Sulit tidur atau tidur terlalu banyak' },
  { id: 4, textKey: 'assessment.phq9.q4', textFallback: 'Merasa lelah atau kurang berenergi' },
  { id: 5, textKey: 'assessment.phq9.q5', textFallback: 'Kurang nafsu makan atau makan berlebihan' },
  { id: 6, textKey: 'assessment.phq9.q6', textFallback: 'Merasa buruk tentang diri sendiri — atau merasa gagal atau mengecewakan keluarga' },
  { id: 7, textKey: 'assessment.phq9.q7', textFallback: 'Sulit berkonsentrasi pada hal-hal seperti membaca atau menonton TV' },
  { id: 8, textKey: 'assessment.phq9.q8', textFallback: 'Bergerak atau berbicara sangat lambat, atau sebaliknya sangat gelisah sehingga bergerak lebih banyak dari biasanya' },
  { id: 9, textKey: 'assessment.phq9.q9', textFallback: 'Pikiran bahwa Anda lebih baik mati, atau ingin melukai diri sendiri dengan cara apa pun' },
];

export const GAD7_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, textKey: 'assessment.gad7.q1', textFallback: 'Merasa gugup, cemas, atau gelisah' },
  { id: 2, textKey: 'assessment.gad7.q2', textFallback: 'Tidak mampu menghentikan atau mengendalikan rasa cemas' },
  { id: 3, textKey: 'assessment.gad7.q3', textFallback: 'Terlalu mengkhawatirkan berbagai hal yang berbeda' },
  { id: 4, textKey: 'assessment.gad7.q4', textFallback: 'Sulit untuk merasa santai atau rileks' },
  { id: 5, textKey: 'assessment.gad7.q5', textFallback: 'Sangat gelisah sehingga sulit untuk duduk diam' },
  { id: 6, textKey: 'assessment.gad7.q6', textFallback: 'Menjadi mudah jengkel atau lekas marah' },
  { id: 7, textKey: 'assessment.gad7.q7', textFallback: 'Merasa takut seolah-olah sesuatu yang buruk akan terjadi' },
];

export const WHO5_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, textKey: 'assessment.who5.q1', textFallback: 'Saya merasa ceria dan dalam suasana hati yang baik' },
  { id: 2, textKey: 'assessment.who5.q2', textFallback: 'Saya merasa tenang dan rileks' },
  { id: 3, textKey: 'assessment.who5.q3', textFallback: 'Saya merasa aktif dan bertenaga' },
  { id: 4, textKey: 'assessment.who5.q4', textFallback: 'Saya bangun tidur dengan rasa segar dan bugar' },
  { id: 5, textKey: 'assessment.who5.q5', textFallback: 'Kehidupan sehari-hari saya dipenuhi dengan hal-hal yang menarik bagi saya' },
];

export const FREQUENCY_OPTIONS = [
  { score: 0, labelKey: 'assessment.opt0', labelFallback: 'Tidak pernah (0 hari)' },
  { score: 1, labelKey: 'assessment.opt1', labelFallback: 'Beberapa hari (1-7 hari)' },
  { score: 2, labelKey: 'assessment.opt2', labelFallback: 'Lebih dari separuh waktu (>7 hari)' },
  { score: 3, labelKey: 'assessment.opt3', labelFallback: 'Hampir setiap hari' },
];

export const WHO5_OPTIONS = [
  { score: 0, labelKey: 'assessment.who5.opt0', labelFallback: 'Tidak pernah (0)' },
  { score: 1, labelKey: 'assessment.who5.opt1', labelFallback: 'Sesekali / Kadang-kadang (1)' },
  { score: 2, labelKey: 'assessment.who5.opt2', labelFallback: 'Kurang dari separuh waktu (2)' },
  { score: 3, labelKey: 'assessment.who5.opt3', labelFallback: 'Lebih dari separuh waktu (3)' },
  { score: 4, labelKey: 'assessment.who5.opt4', labelFallback: 'Sebagian besar waktu (4)' },
  { score: 5, labelKey: 'assessment.who5.opt5', labelFallback: 'Sepanjang waktu (5)' },
];

export interface SeverityEvaluation {
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  labelKey: string;
  labelFallback: string;
  color: string;
  recommendationKey: string;
  recommendationFallback: string;
  isCrisisTriggered: boolean;
  suggestPhq9?: boolean;
}

/**
 * Evaluates PHQ-9 depression screening score according to Spitzer, Williams, Kroenke et al.
 * Item 9 specifically assesses suicidal ideation.
 */
export function evaluatePHQ9(answers: Record<number, number>): { score: number; eval: SeverityEvaluation } {
  const scores = Object.values(answers);
  const totalScore = scores.reduce((sum, val) => sum + val, 0);
  const item9Answer = answers[9] || 0;

  // Item 9 safety trigger: Any score >= 1 triggers crisis safety protocol
  const isCrisisTriggered = item9Answer >= 1;

  let severity: SeverityEvaluation['severity'] = 'minimal';
  let labelKey = 'assessment.phq9.minimal';
  let labelFallback = 'Minimal / Tidak Ada Depresi Signifikan';
  let color = 'var(--color-secondary)';
  let recommendationKey = 'assessment.phq9.recMinimal';
  let recommendationFallback = 'Kondisi emosional Anda relatif stabil. Terus rawat diri dengan tidur cukup dan aktivitas menyenangkan.';

  if (totalScore >= 20) {
    severity = 'severe';
    labelKey = 'assessment.phq9.severe';
    labelFallback = 'Gejala Depresi Berat';
    color = 'var(--color-danger)';
    recommendationKey = 'assessment.phq9.recSevere';
    recommendationFallback = 'Skor Anda menunjukkan beban psikologis yang sangat berat. Sangat disarankan untuk segera berkonsultasi dengan psikolog klinis atau psikiater profesional.';
  } else if (totalScore >= 15) {
    severity = 'moderately_severe';
    labelKey = 'assessment.phq9.moderatelySevere';
    labelFallback = 'Gejala Depresi Cukup Berat';
    color = 'var(--color-warm)';
    recommendationKey = 'assessment.phq9.recModeratelySevere';
    recommendationFallback = 'Gejala Anda cukup mengganggu fungsi harian. Pertimbangkan untuk mencari pendampingan profesional.';
  } else if (totalScore >= 10) {
    severity = 'moderate';
    labelKey = 'assessment.phq9.moderate';
    labelFallback = 'Gejala Depresi Sedang';
    color = 'var(--color-warm)';
    recommendationKey = 'assessment.phq9.recModerate';
    recommendationFallback = 'Anda mengalami beban emosional yang cukup nyata. Luangkan waktu untuk istirahat, gunakan rencana keselamatan, dan bicarakan dengan orang terpercaya.';
  } else if (totalScore >= 5) {
    severity = 'mild';
    labelKey = 'assessment.phq9.mild';
    labelFallback = 'Gejala Depresi Ringan';
    color = 'var(--color-primary)';
    recommendationKey = 'assessment.phq9.recMild';
    recommendationFallback = 'Terdapat beberapa gejala kelelahan mental ringan. Latihan pernapasan harian dan jurnal refleksi dapat membantu.';
  }

  return {
    score: totalScore,
    eval: {
      severity,
      labelKey,
      labelFallback,
      color,
      recommendationKey,
      recommendationFallback,
      isCrisisTriggered,
    },
  };
}

/**
 * Evaluates GAD-7 anxiety screening score according to Spitzer, Kroenke et al.
 */
export function evaluateGAD7(answers: Record<number, number>): { score: number; eval: SeverityEvaluation } {
  const scores = Object.values(answers);
  const totalScore = scores.reduce((sum, val) => sum + val, 0);

  let severity: SeverityEvaluation['severity'] = 'minimal';
  let labelKey = 'assessment.gad7.minimal';
  let labelFallback = 'Kecemasan Minimal';
  let color = 'var(--color-secondary)';
  let recommendationKey = 'assessment.gad7.recMinimal';
  let recommendationFallback = 'Tingkat kecemasan Anda berada pada batas normal. Lanjutkan kebiasaan hidup sehat Anda.';

  if (totalScore >= 15) {
    severity = 'severe';
    labelKey = 'assessment.gad7.severe';
    labelFallback = 'Kecemasan Berat';
    color = 'var(--color-danger)';
    recommendationKey = 'assessment.gad7.recSevere';
    recommendationFallback = 'Kecemasan Anda berada pada tingkat tinggi yang mungkin menguras energi harian. Sangat dianjurkan untuk berkonsultasi dengan profesional kesehatan mental.';
  } else if (totalScore >= 10) {
    severity = 'moderate';
    labelKey = 'assessment.gad7.moderate';
    labelFallback = 'Kecemasan Sedang';
    color = 'var(--color-warm)';
    recommendationKey = 'assessment.gad7.recModerate';
    recommendationFallback = 'Kecemasan mulai mengganggu ketenangan Anda. Cobalah teknik grounding 5-4-3-2-1 dan latihan pernapasan untuk menenangkan sistem saraf.';
  } else if (totalScore >= 5) {
    severity = 'mild';
    labelKey = 'assessment.gad7.mild';
    labelFallback = 'Kecemasan Ringan';
    color = 'var(--color-primary)';
    recommendationKey = 'assessment.gad7.recMild';
    recommendationFallback = 'Ada sedikit kegelisahan atau kekhawatiran yang terdeteksi. Luangkan waktu untuk jeda dan relaksasi mandiri.';
  }

  return {
    score: totalScore,
    eval: {
      severity,
      labelKey,
      labelFallback,
      color,
      recommendationKey,
      recommendationFallback,
      isCrisisTriggered: false,
    },
  };
}

/**
 * Evaluates WHO-5 Well-Being Index score according to World Health Organization / Topp et al. (2015).
 * Raw score range: 0-25. Percentage score range: 0-100 (rawScore * 4).
 * Cutoffs:
 * - >= 70: Optimal / High well-being
 * - 50-69: Moderate well-being
 * - 29-49: Low well-being (standard clinical cutoff < 50 for screening depression)
 * - <= 28: Very low well-being (indicates significant depressive symptomatology)
 */
export function evaluateWHO5(answers: Record<number, number>): {
  score: number;
  percentageScore: number;
  eval: SeverityEvaluation;
} {
  const scores = Object.values(answers);
  const rawScore = scores.reduce((sum, val) => sum + val, 0);
  const percentageScore = rawScore * 4;

  let severity: SeverityEvaluation['severity'] = 'minimal';
  let labelKey = 'assessment.who5.high';
  let labelFallback = 'Tingkat Kesejahteraan Baik & Optimal';
  let color = 'var(--color-secondary)';
  let recommendationKey = 'assessment.who5.recHigh';
  let recommendationFallback = 'Kondisi psikologis Anda sangat positif dan berdaya. Terus pertahankan pola hidup sehat dan rawat aktivitas bermakna.';
  let suggestPhq9 = false;

  if (percentageScore <= 28) {
    severity = 'severe';
    labelKey = 'assessment.who5.veryLow';
    labelFallback = 'Tingkat Kesejahteraan Sangat Rendah';
    color = 'var(--color-danger)';
    recommendationKey = 'assessment.who5.recVeryLow';
    recommendationFallback = 'Skor Anda menunjukkan penurunan energi emosional yang signifikan. Sangat disarankan untuk melengkapi evaluasi dengan Skrining PHQ-9 atau berdiskusi dengan tenaga profesional.';
    suggestPhq9 = true;
  } else if (percentageScore < 50) {
    severity = 'moderate';
    labelKey = 'assessment.who5.low';
    labelFallback = 'Tingkat Kesejahteraan Rendah';
    color = 'var(--color-warm)';
    recommendationKey = 'assessment.who5.recLow';
    recommendationFallback = 'Kesejahteraan emosional Anda berada di bawah batas optimal (<50). Kami menyarankan untuk melakukan skrining depresi (PHQ-9) atau mencoba latihan Aktivasi Perilaku.';
    suggestPhq9 = true;
  } else if (percentageScore < 70) {
    severity = 'mild';
    labelKey = 'assessment.who5.moderate';
    labelFallback = 'Tingkat Kesejahteraan Cukup / Sedang';
    color = 'var(--color-primary)';
    recommendationKey = 'assessment.who5.recModerate';
    recommendationFallback = 'Kesejahteraan Anda dalam batas memadai, namun masih ada ruang untuk memulihkan energi dan ketenangan batin. Luangkan waktu untuk istirahat dan jeda mindful.';
    suggestPhq9 = false;
  }

  return {
    score: rawScore,
    percentageScore,
    eval: {
      severity,
      labelKey,
      labelFallback,
      color,
      recommendationKey,
      recommendationFallback,
      isCrisisTriggered: false,
      suggestPhq9,
    },
  };
}

const STORAGE_KEY = 'rima-assessments';

export function saveAssessmentResult(result: AssessmentResult): void {
  try {
    const existing: AssessmentResult[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.unshift(result);
    // Keep last 30 assessments locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 30)));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: STORAGE_KEY } }));
  } catch (err) {
    console.error('Failed to save assessment result locally:', err);
  }
}

export function getAssessmentHistory(): AssessmentResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
