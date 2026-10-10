/**
 * RIMA Compassion-Focused Therapy (CFT) & Self-Compassion Break Taxonomy
 * Grounded in Dr. Kristin Neff & Dr. Christopher Germer's 3-step evidence-based protocol:
 * 1. Mindfulness (Acknowledging the present suffering)
 * 2. Common Humanity (Remembering you are not alone; suffering is part of shared human life)
 * 3. Self-Kindness & Soothing Touch (Offering kindness instead of harsh self-criticism)
 */

export interface CftPhrase {
  id: string;
  key: string;
  fallback: string;
}

export interface SoothingTouchGuide {
  id: 'hand_on_heart' | 'self_hug' | 'hand_on_cheek' | 'hand_on_belly';
  icon: string;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
}

export const CFT_MINDFULNESS_PHRASES: CftPhrase[] = [
  {
    id: 'm1',
    key: 'cft.mindfulness_phrase_1',
    fallback: 'Ini adalah momen yang sungguh berat dan melelahkan bagiku.',
  },
  {
    id: 'm2',
    key: 'cft.mindfulness_phrase_2',
    fallback: 'Rasa sakit, cemas, atau kecewa ini nyata dan wajar aku rasakan.',
  },
  {
    id: 'm3',
    key: 'cft.mindfulness_phrase_3',
    fallback: 'Aku sedang terluka saat ini, dan aku tidak perlu berpura-pura baik-baik saja.',
  },
];

export const CFT_HUMANITY_PHRASES: CftPhrase[] = [
  {
    id: 'h1',
    key: 'cft.humanity_phrase_1',
    fallback: 'Kesulitan dan kegagalan adalah bagian dari pengalaman hidup manusia, bukan bukti bahwa aku cacat.',
  },
  {
    id: 'h2',
    key: 'cft.humanity_phrase_2',
    fallback: 'Banyak orang lain di luar sana yang juga sedang berjuang dengan perasaan serupa saat ini. Aku tidak sendirian.',
  },
  {
    id: 'h3',
    key: 'cft.humanity_phrase_3',
    fallback: 'Tidak ada manusia yang sempurna. Kesalahanku tidak mendefinisikan seluruh harga diriku.',
  },
];

export const CFT_KINDNESS_PHRASES: CftPhrase[] = [
  {
    id: 'k1',
    key: 'cft.kindness_phrase_1',
    fallback: 'Semoga aku bisa bersikap selembut dan sepengertian mungkin pada diriku sendiri hari ini.',
  },
  {
    id: 'k2',
    key: 'cft.kindness_phrase_2',
    fallback: 'Semoga aku bisa memaafkan keterbatasanku dan menerima diriku apa adanya.',
  },
  {
    id: 'k3',
    key: 'cft.kindness_phrase_3',
    fallback: 'Semoga aku memberi diriku waktu, ruang, dan kesabaran untuk beristirahat dan pulih.',
  },
];

export const SOOTHING_TOUCH_TECHNIQUES: SoothingTouchGuide[] = [
  {
    id: 'hand_on_heart',
    icon: '🫀',
    titleKey: 'cft.touch_heart_title',
    titleFallback: 'Satu / Dua Tangan di Dada (Hand on Heart)',
    descKey: 'cft.touch_heart_desc',
    descFallback: 'Letakkan satu atau kedua telapak tangan di atas dadamu. Rasakan kehangatan telapak tangan dan degup jantungmu yang setia menemanimu.',
  },
  {
    id: 'self_hug',
    icon: '🫂',
    titleKey: 'cft.touch_hug_title',
    titleFallback: 'Pelukan Hangat untuk Diri Sendiri (Self-Hug)',
    descKey: 'cft.touch_hug_desc',
    descFallback: 'Silangkan kedua lengan dan dekap bahu atau lengan atasmu secara lembut, seolah memeluk sahabat tersayang yang sedang bersedih.',
  },
  {
    id: 'hand_on_cheek',
    icon: '🤲',
    titleKey: 'cft.touch_cheek_title',
    titleFallback: 'Sentuhan Lembut di Pipi (Cradling Face)',
    descKey: 'cft.touch_cheek_desc',
    descFallback: 'Tangkupkan telapak tanganmu di kedua pipi dengan sentuhan sejuk dan penuh penerimaan tanpa celaan.',
  },
  {
    id: 'hand_on_belly',
    icon: '🫁',
    titleKey: 'cft.touch_belly_title',
    titleFallback: 'Tangan di Perut (Grounding Belly)',
    descKey: 'cft.touch_belly_desc',
    descFallback: 'Letakkan tangan di perut dan rasakan napasmu yang naik dan turun perlahan, menenangkan sistem saraf otonommu.',
  },
];
