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

export const FREQUENCY_OPTIONS = [
  { score: 0, labelKey: 'assessment.opt0', labelFallback: 'Tidak pernah (0 hari)' },
  { score: 1, labelKey: 'assessment.opt1', labelFallback: 'Beberapa hari (1-7 hari)' },
  { score: 2, labelKey: 'assessment.opt2', labelFallback: 'Lebih dari separuh waktu (>7 hari)' },
  { score: 3, labelKey: 'assessment.opt3', labelFallback: 'Hampir setiap hari' },
];

export interface SeverityEvaluation {
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  labelKey: string;
  labelFallback: string;
  color: string;
  recommendationKey: string;
  recommendationFallback: string;
  isCrisisTriggered: boolean;
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
