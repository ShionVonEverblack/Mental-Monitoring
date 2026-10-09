import type { EmotionDescriptor, EmotionQuadrant, MoodScore, MoodEmoji } from '../types';

export interface QuadrantMeta {
  id: EmotionQuadrant;
  nameKey: string;
  nameFallback: string;
  descKey: string;
  descFallback: string;
  color: string;
  bgRgba: string;
  borderRgba: string;
  strategyKey: string;
  strategyFallback: string;
  suggestedRoute: '/breathe' | '/grounding' | '/activation' | '/journal' | '/crisis';
}

export const QUADRANT_META: Record<EmotionQuadrant, QuadrantMeta> = {
  red: {
    id: 'red',
    nameKey: 'moodMeter.quadrant_red_name',
    nameFallback: 'Merah (Energi Tinggi, Tidak Menyenangkan)',
    descKey: 'moodMeter.quadrant_red_desc',
    descFallback: 'Kondisi aktivasi sistem saraf tinggi (waspada, marah, panik). Membutuhkan regulasi fisiologis cepat.',
    color: '#ef4444',
    bgRgba: 'rgba(239, 68, 68, 0.12)',
    borderRgba: 'rgba(239, 68, 68, 0.4)',
    strategyKey: 'moodMeter.quadrant_red_strategy',
    strategyFallback: 'Lakukan pernapasan Cyclic Sighing atau teknik TIPP suhu dingin untuk menurunkan detak jantung.',
    suggestedRoute: '/breathe',
  },
  yellow: {
    id: 'yellow',
    nameKey: 'moodMeter.quadrant_yellow_name',
    nameFallback: 'Kuning (Energi Tinggi, Menyenangkan)',
    descKey: 'moodMeter.quadrant_yellow_desc',
    descFallback: 'Kondisi energi tinggi positif (semangat, gembira). Waktu yang baik untuk berkreasi atau berbagi.',
    color: '#eab308',
    bgRgba: 'rgba(234, 179, 8, 0.12)',
    borderRgba: 'rgba(234, 179, 8, 0.4)',
    strategyKey: 'moodMeter.quadrant_yellow_strategy',
    strategyFallback: 'Resapi momen bahagia ini (savouring) atau catat ke dalam jurnal rasa syukur.',
    suggestedRoute: '/journal',
  },
  blue: {
    id: 'blue',
    nameKey: 'moodMeter.quadrant_blue_name',
    nameFallback: 'Biru (Energi Rendah, Tidak Menyenangkan)',
    descKey: 'moodMeter.quadrant_blue_desc',
    descFallback: 'Kondisi dehidrasi emosional, hampa, atau letih. Hindari isolasi diri dan beri ruang pemulihan lembut.',
    color: '#3b82f6',
    bgRgba: 'rgba(59, 130, 246, 0.12)',
    borderRgba: 'rgba(59, 130, 246, 0.4)',
    strategyKey: 'moodMeter.quadrant_blue_strategy',
    strategyFallback: 'Lakukan aktivitas ringan (Aktivasi Perilaku) atau grounding 5-4-3-2-1 untuk kembali terhubung.',
    suggestedRoute: '/activation',
  },
  green: {
    id: 'green',
    nameKey: 'moodMeter.quadrant_green_name',
    nameFallback: 'Hijau (Energi Rendah, Menyenangkan)',
    descKey: 'moodMeter.quadrant_green_desc',
    descFallback: 'Kondisi sistem saraf parasimpatis optimal (tenang, damai, rileks). Kondisi terbaik untuk refleksi.',
    color: '#10b981',
    bgRgba: 'rgba(16, 185, 129, 0.12)',
    borderRgba: 'rgba(16, 185, 129, 0.4)',
    strategyKey: 'moodMeter.quadrant_green_strategy',
    strategyFallback: 'Pertahankan ketenangan dengan meditasi napas sadar atau afirmasi spiritual.',
    suggestedRoute: '/breathe',
  },
};

export const EMOTION_TAXONOMY: EmotionDescriptor[] = [
  // RED (High Energy, Negative Valence)
  {
    id: 'anxious',
    quadrant: 'red',
    valence: -0.6,
    arousal: 0.7,
    labelKey: 'moodMeter.emotion_anxious',
    labelFallback: 'Cemas',
    recommendedIntervention: 'breathe',
  },
  {
    id: 'panicked',
    quadrant: 'red',
    valence: -0.8,
    arousal: 0.9,
    labelKey: 'moodMeter.emotion_panicked',
    labelFallback: 'Panik',
    recommendedIntervention: 'tipp',
  },
  {
    id: 'frustrated',
    quadrant: 'red',
    valence: -0.5,
    arousal: 0.5,
    labelKey: 'moodMeter.emotion_frustrated',
    labelFallback: 'Frustrasi',
    recommendedIntervention: 'journal',
  },
  {
    id: 'overwhelmed',
    quadrant: 'red',
    valence: -0.7,
    arousal: 0.6,
    labelKey: 'moodMeter.emotion_overwhelmed',
    labelFallback: 'Kewalahan',
    recommendedIntervention: 'grounding',
  },

  // YELLOW (High Energy, Positive Valence)
  {
    id: 'joyful',
    quadrant: 'yellow',
    valence: 0.8,
    arousal: 0.7,
    labelKey: 'moodMeter.emotion_joyful',
    labelFallback: 'Gembira',
    recommendedIntervention: 'journal',
  },
  {
    id: 'inspired',
    quadrant: 'yellow',
    valence: 0.7,
    arousal: 0.8,
    labelKey: 'moodMeter.emotion_inspired',
    labelFallback: 'Terinspirasi',
    recommendedIntervention: 'journal',
  },
  {
    id: 'proud',
    quadrant: 'yellow',
    valence: 0.6,
    arousal: 0.5,
    labelKey: 'moodMeter.emotion_proud',
    labelFallback: 'Bangga',
    recommendedIntervention: 'journal',
  },
  {
    id: 'hopeful',
    quadrant: 'yellow',
    valence: 0.7,
    arousal: 0.4,
    labelKey: 'moodMeter.emotion_hopeful',
    labelFallback: 'Penuh Harapan',
    recommendedIntervention: 'activation',
  },

  // BLUE (Low Energy, Negative Valence)
  {
    id: 'sad',
    quadrant: 'blue',
    valence: -0.7,
    arousal: -0.4,
    labelKey: 'moodMeter.emotion_sad',
    labelFallback: 'Sedih',
    recommendedIntervention: 'journal',
  },
  {
    id: 'exhausted',
    quadrant: 'blue',
    valence: -0.6,
    arousal: -0.8,
    labelKey: 'moodMeter.emotion_exhausted',
    labelFallback: 'Lelah Habis',
    recommendedIntervention: 'grounding',
  },
  {
    id: 'numb',
    quadrant: 'blue',
    valence: -0.8,
    arousal: -0.7,
    labelKey: 'moodMeter.emotion_numb',
    labelFallback: 'Hampa / Mati Rasa',
    recommendedIntervention: 'grounding',
  },
  {
    id: 'lonely',
    quadrant: 'blue',
    valence: -0.6,
    arousal: -0.5,
    labelKey: 'moodMeter.emotion_lonely',
    labelFallback: 'Kesepian',
    recommendedIntervention: 'activation',
  },

  // GREEN (Low Energy, Positive Valence)
  {
    id: 'calm',
    quadrant: 'green',
    valence: 0.7,
    arousal: -0.5,
    labelKey: 'moodMeter.emotion_calm',
    labelFallback: 'Tenang',
    recommendedIntervention: 'breathe',
  },
  {
    id: 'grateful',
    quadrant: 'green',
    valence: 0.8,
    arousal: -0.3,
    labelKey: 'moodMeter.emotion_grateful',
    labelFallback: 'Penuh Syukur',
    recommendedIntervention: 'journal',
  },
  {
    id: 'serene',
    quadrant: 'green',
    valence: 0.8,
    arousal: -0.6,
    labelKey: 'moodMeter.emotion_serene',
    labelFallback: 'Damai',
    recommendedIntervention: 'breathe',
  },
  {
    id: 'content',
    quadrant: 'green',
    valence: 0.6,
    arousal: -0.4,
    labelKey: 'moodMeter.emotion_content',
    labelFallback: 'Cukup Puas',
    recommendedIntervention: 'journal',
  },
];

/**
 * Determines which quadrant a valence-arousal coordinate pair belongs to.
 */
export function getQuadrantFromCoordinates(valence: number, arousal: number): EmotionQuadrant {
  if (valence < 0) {
    return arousal >= 0 ? 'red' : 'blue';
  } else {
    return arousal >= 0 ? 'yellow' : 'green';
  }
}

/**
 * Maps 2D valence coordinate to 1-5 discrete scale and compatible emoji.
 */
export function mapCoordinatesToMoodScore(valence: number): { score: MoodScore; emoji: MoodEmoji } {
  if (valence <= -0.6) {
    return { score: 1, emoji: '😢' };
  }
  if (valence <= -0.2) {
    return { score: 2, emoji: '😟' };
  }
  if (valence <= 0.2) {
    return { score: 3, emoji: '😐' };
  }
  if (valence <= 0.6) {
    return { score: 4, emoji: '🙂' };
  }
  return { score: 5, emoji: '😊' };
}
