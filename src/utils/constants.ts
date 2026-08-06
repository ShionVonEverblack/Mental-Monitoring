import type { CrisisResource, MoodScore, MoodEmoji, ForumCategory, JournalTemplate } from '../types';

export const CRISIS_HOTLINES: CrisisResource[] = [
  {
    id: 'itl',
    name: 'Into The Light Indonesia',
    phone: '119 ext 8',
    descriptionId: 'Layanan pencegahan bunuh diri dan kesehatan mental.',
    descriptionEn: 'Suicide prevention and mental health service.',
    isActive: true,
  },
  {
    id: 'lsm-jbd',
    name: 'LSM Jangan Bunuh Diri',
    phone: '021-9696 9293',
    descriptionId: 'Layanan dukungan darurat untuk individu berisiko.',
    descriptionEn: 'Emergency support service for at-risk individuals.',
    isActive: true,
  },
  {
    id: 'pulih',
    name: 'Yayasan Pulih',
    phone: '021-788-42580',
    descriptionId: 'Layanan konseling psikologis trauma.',
    descriptionEn: 'Trauma psychological counseling service.',
    isActive: true,
  },
  {
    id: 'sejiwa',
    name: 'Sejiwa (Kemenkes)',
    phone: '119 ext 8',
    descriptionId: 'Layanan kesehatan jiwa dari Kementerian Kesehatan RI.',
    descriptionEn: 'Mental health service by the Ministry of Health RI.',
    isActive: true,
  },
  {
    id: 'emergency',
    name: 'Emergency',
    phone: '112',
    descriptionId: 'Nomor darurat nasional.',
    descriptionEn: 'National emergency number.',
    isActive: true,
  },
];

export const MOOD_EMOJIS: Record<MoodScore, { emoji: MoodEmoji; labelId: string; labelEn: string; color: string }> = {
  1: { emoji: '😢', labelId: 'Sangat Buruk', labelEn: 'Very Bad', color: 'var(--color-danger)' },
  2: { emoji: '😟', labelId: 'Buruk', labelEn: 'Bad', color: 'var(--color-warm)' },
  3: { emoji: '😐', labelId: 'Biasa', labelEn: 'Okay', color: 'var(--color-secondary)' },
  4: { emoji: '🙂', labelId: 'Baik', labelEn: 'Good', color: 'var(--color-primary)' },
  5: { emoji: '😊', labelId: 'Sangat Baik', labelEn: 'Great', color: 'var(--color-accent)' },
};

export const MOOD_FACTORS = [
  { id: 'sleep', labelId: 'Tidur', labelEn: 'Sleep', icon: 'Bed' },
  { id: 'exercise', labelId: 'Olahraga', labelEn: 'Exercise', icon: 'Activity' },
  { id: 'work', labelId: 'Pekerjaan', labelEn: 'Work', icon: 'Briefcase' },
  { id: 'social', labelId: 'Sosial', labelEn: 'Social', icon: 'Users' },
  { id: 'food', labelId: 'Makanan', labelEn: 'Food', icon: 'Coffee' },
  { id: 'weather', labelId: 'Cuaca', labelEn: 'Weather', icon: 'Sun' },
  { id: 'health', labelId: 'Kesehatan', labelEn: 'Health', icon: 'Heart' },
  { id: 'family', labelId: 'Keluarga', labelEn: 'Family', icon: 'Home' },
  { id: 'hobby', labelId: 'Hobi', labelEn: 'Hobby', icon: 'Palette' },
  { id: 'meditation', labelId: 'Meditasi', labelEn: 'Meditation', icon: 'Wind' },
];

export const FORUM_CATEGORIES: { id: ForumCategory; labelId: string; labelEn: string; icon: string; color: string }[] = [
  { id: 'anxiety', labelId: 'Kecemasan', labelEn: 'Anxiety', icon: 'Wind', color: 'var(--color-primary)' },
  { id: 'depression', labelId: 'Depresi', labelEn: 'Depression', icon: 'CloudRain', color: 'var(--color-secondary)' },
  { id: 'relationships', labelId: 'Hubungan', labelEn: 'Relationships', icon: 'Heart', color: 'var(--color-warm)' },
  { id: 'work', labelId: 'Pekerjaan', labelEn: 'Work', icon: 'Briefcase', color: 'var(--color-danger)' },
  { id: 'family', labelId: 'Keluarga', labelEn: 'Family', icon: 'Home', color: 'var(--color-accent)' },
  { id: 'self-care', labelId: 'Self-Care', labelEn: 'Self-Care', icon: 'Smile', color: 'var(--color-primary)' },
  { id: 'other', labelId: 'Lainnya', labelEn: 'Other', icon: 'MoreHorizontal', color: 'var(--color-secondary)' },
];

export const JOURNAL_TEMPLATES: { id: JournalTemplate; labelId: string; labelEn: string; description: string; prompts: { id: string; en: string }[] }[] = [
  {
    id: 'free',
    labelId: 'Tulis Bebas',
    labelEn: 'Free Writing',
    description: 'Tulis apapun yang ada di pikiranmu',
    prompts: [],
  },
  {
    id: 'cbt',
    labelId: 'CBT Terstruktur',
    labelEn: 'Structured CBT',
    description: 'Analisis pikiran berdasarkan kerangka Cognitive Behavioral Therapy',
    prompts: [
      { id: 'Situasi: Apa yang terjadi?', en: 'Situation: What happened?' },
      { id: 'Pikiran Otomatis: Apa yang melintas di pikiran?', en: 'Automatic Thought: What crossed your mind?' },
      { id: 'Emosi: Apa yang kamu rasakan?', en: 'Emotion: What did you feel?' },
      { id: 'Respon Alternatif: Bagaimana cara melihat ini dengan lebih objektif?', en: 'Alternative Response: How can you look at this more objectively?' },
    ],
  },
  {
    id: 'gratitude',
    labelId: 'Syukur',
    labelEn: 'Gratitude',
    description: 'Fokus pada hal positif hari ini',
    prompts: [
      { id: '3 hal yang saya syukuri hari ini adalah...', en: '3 things I am grateful for today are...' },
      { id: 'Hal terbaik yang terjadi hari ini...', en: 'The best thing that happened today...' },
    ],
  },
  {
    id: 'reflection',
    labelId: 'Refleksi',
    labelEn: 'Reflection',
    description: 'Evaluasi diri dan pertumbuhan pribadi',
    prompts: [
      { id: 'Apa yang saya pelajari tentang diri saya hari ini?', en: 'What did I learn about myself today?' },
      { id: 'Apa yang ingin saya perbaiki besok?', en: 'What do I want to improve tomorrow?' },
    ],
  },
];

export const DAILY_AFFIRMATIONS = [
  { id: 'Saya berharga dan layak mendapatkan cinta.', en: 'I am worthy and deserving of love.' },
  { id: 'Setiap hari adalah kesempatan baru.', en: 'Every day is a new opportunity.' },
  { id: 'Saya mengizinkan diri saya untuk beristirahat.', en: 'I allow myself to rest.' },
  { id: 'Perasaanku valid.', en: 'My feelings are valid.' },
  { id: 'Saya kuat dan bisa melewati ini.', en: 'I am strong and can get through this.' },
  { id: 'Saya cukup apa adanya.', en: 'I am enough as I am.' },
  { id: 'Saya berhak merasa bahagia.', en: 'I deserve to feel happy.' },
  { id: 'Langkah kecil tetaplah sebuah kemajuan.', en: 'Small steps are still progress.' },
  { id: 'Saya mencintai dan menerima diri saya sepenuhnya.', en: 'I love and accept myself completely.' },
  { id: 'Kesalahanku tidak mendefinisikan diriku.', en: 'My mistakes do not define me.' },
  { id: 'Saya memaafkan diri saya sendiri.', en: 'I forgive myself.' },
  { id: 'Hari ini saya memilih kedamaian.', en: 'Today I choose peace.' },
  { id: 'Napas ini adalah jangkar saya.', en: 'This breath is my anchor.' },
  { id: 'Saya memiliki kendali atas pikiran saya.', en: 'I have control over my thoughts.' },
  { id: 'Saya melepaskan apa yang tidak bisa saya kendalikan.', en: 'I let go of what I cannot control.' },
];

export const ANONYMOUS_ADJECTIVES = ['Brave', 'Gentle', 'Quiet', 'Bright', 'Calm', 'Mighty', 'Soft', 'Warm', 'Cool', 'Clear'];
export const ANONYMOUS_NOUNS = ['Butterfly', 'Wave', 'Breeze', 'Cloud', 'Star', 'Moon', 'Sun', 'Forest', 'River', 'Mountain'];

export const APP_CONFIG = {
  name: 'RIMA',
  fullName: 'Ruang Interaksi Mental Aman',
  version: '1.0.0',
};
