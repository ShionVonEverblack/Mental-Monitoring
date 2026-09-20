import type { CrisisResource, MoodScore, MoodEmoji, ForumCategory, JournalTemplate, Language, CognitiveDistortionId } from '../types';

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

export const COGNITIVE_DISTORTIONS: {
  id: CognitiveDistortionId;
  icon: string;
  nameKey: string;
  nameFallback: string;
  descKey: string;
  descFallback: string;
}[] = [
  {
    id: 'catastrophizing',
    icon: '🌋',
    nameKey: 'cbt.distortion.catastrophizing',
    nameFallback: 'Katastrofisasi',
    descKey: 'cbt.desc.catastrophizing',
    descFallback: 'Membayangkan skenario terburuk seolah pasti terjadi.',
  },
  {
    id: 'all_or_nothing',
    icon: '⚖️',
    nameKey: 'cbt.distortion.all_or_nothing',
    nameFallback: 'Hitam-Putih',
    descKey: 'cbt.desc.all_or_nothing',
    descFallback: 'Melihat situasi hanya sebagai sukses sempurna atau gagal total.',
  },
  {
    id: 'mind_reading',
    icon: '🔮',
    nameKey: 'cbt.distortion.mind_reading',
    nameFallback: 'Membaca Pikiran',
    descKey: 'cbt.desc.mind_reading',
    descFallback: 'Yakin orang lain menilai negatif tanpa bukti yang jelas.',
  },
  {
    id: 'overgeneralization',
    icon: '🔄',
    nameKey: 'cbt.distortion.overgeneralization',
    nameFallback: 'Generalisasi Berlebih',
    descKey: 'cbt.desc.overgeneralization',
    descFallback: 'Menganggap satu peristiwa buruk sebagai pola kegagalan tanpa akhir.',
  },
  {
    id: 'emotional_reasoning',
    icon: '💔',
    nameKey: 'cbt.distortion.emotional_reasoning',
    nameFallback: 'Penalaran Emosional',
    descKey: 'cbt.desc.emotional_reasoning',
    descFallback: 'Merasa cemas/bersalah sehingga mengira situasinya pasti buruk.',
  },
  {
    id: 'should_statements',
    icon: '📌',
    nameKey: 'cbt.distortion.should_statements',
    nameFallback: 'Tuntutan "Harus"',
    descKey: 'cbt.desc.should_statements',
    descFallback: 'Menekan diri atau orang lain dengan aturan kaku "harus/seharusnya".',
  },
  {
    id: 'personalization',
    icon: '🎯',
    nameKey: 'cbt.distortion.personalization',
    nameFallback: 'Personalisasi',
    descKey: 'cbt.desc.personalization',
    descFallback: 'Menyalahkan diri sendiri atas kejadian di luar kendali pribadi.',
  },
  {
    id: 'mental_filter',
    icon: '🔍',
    nameKey: 'cbt.distortion.mental_filter',
    nameFallback: 'Filter Negatif',
    descKey: 'cbt.desc.mental_filter',
    descFallback: 'Hanya berfokus pada satu hal negatif dan melupakan semua hal positif.',
  },
];

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', flag: '🇮🇩' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', flag: '🇮🇩' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export const DAILY_AFFIRMATIONS: Record<Language, string>[] = [
  {
    id: 'Saya berharga dan layak mendapatkan cinta.',
    en: 'I am worthy and deserving of love.',
    jv: 'Kula aji lan pantes nampi katresnan.',
    su: 'Simkuring aya ajina sareng pantes nampi kaasih.',
    ja: '私は尊く、愛される価値があります。',
    zh: '我很珍贵，值得被爱与善待。',
    es: 'Soy valioso y merezco recibir amor.',
    ar: 'أنا ذو قيمة وأستحق المحبة والتقدير.'
  },
  {
    id: 'Setiap hari adalah kesempatan baru.',
    en: 'Every day is a new opportunity.',
    jv: 'Saben dinten mujudaken kalodhangan ingkang enggal.',
    su: 'Unggal dinten mangrupikeun kasempetan énggal.',
    ja: '毎日は新しい始まりとチャンスです。',
    zh: '每一天都是崭新的希望与机会。',
    es: 'Cada día es una nueva oportunidad.',
    ar: 'كل يوم هو فرصة جديدة لبداية طيبة.'
  },
  {
    id: 'Saya mengizinkan diri saya untuk beristirahat.',
    en: 'I allow myself to rest.',
    jv: 'Kula nglilani badan kula piyambak kangge ngaso.',
    su: 'Simkuring ngawidian diri kanggo reureuh.',
    ja: '私は自分に休息をとることを許します。',
    zh: '我允许自己停下来好好休息。',
    es: 'Me permito descansar y recargar energías.',
    ar: 'أسمح لنفسي بأخذ قسط من الراحة والهدوء.'
  },
  {
    id: 'Perasaanku valid.',
    en: 'My feelings are valid.',
    jv: 'Raos ing manah kula punika sah.',
    su: 'Raraosan simkuring téh nyata sareng sah.',
    ja: '私の感じている感情はすべて大切で妥当です。',
    zh: '我所有的情绪和感受都是真实的、被接纳的。',
    es: 'Mis sentimientos son válidos y legítimos.',
    ar: 'مشاعري حقيقية وتستحق الاحترام والقبول.'
  },
  {
    id: 'Saya kuat dan bisa melewati ini.',
    en: 'I am strong and can get through this.',
    jv: 'Kula kiyat lan saged ngliwati sedaya puniki.',
    su: 'Simkuring kiat sareng tiasa ngaliwatan ieu sadaya.',
    ja: '私は強く、これを乗り越えられます。',
    zh: '我很坚强，我一定能度过这个难关。',
    es: 'Soy fuerte y puedo superar esta etapa.',
    ar: 'أنا قوي وقادر على تجاوز هذه المرحلة بسلام.'
  },
  {
    id: 'Saya cukup apa adanya.',
    en: 'I am enough as I am.',
    jv: 'Kula cekap kados kawontenan kula.',
    su: 'Simkuring cekap sakumaha ayana.',
    ja: 'ありのままの私で十分に素晴らしい。',
    zh: '现在的我就已经足够好。',
    es: 'Soy suficiente tal como soy.',
    ar: 'أنا كافٍ كما أنا في هذه اللحظة.'
  },
  {
    id: 'Saya berhak merasa bahagia.',
    en: 'I deserve to feel happy.',
    jv: 'Kula gadhah hak kangge ngraosaken bingah.',
    su: 'Simkuring ngagaduhan hak ngaraos bagja.',
    ja: '私には幸せを感じる権利があります。',
    zh: '我完全有资格享受幸福与快乐。',
    es: 'Merezco sentir alegría y bienestar.',
    ar: 'من حقي أن أشعر بالسعادة والسكينة.'
  },
  {
    id: 'Langkah kecil tetaplah sebuah kemajuan.',
    en: 'Small steps are still progress.',
    jv: 'Jangkah alit tetep mujudaken kemajengan.',
    su: 'Léngkah alit tetep mangrupikeun kamajuan.',
    ja: '小さな一歩でも、確かな前進です。',
    zh: '哪怕只是微小的一步，也是在向前进步。',
    es: 'Los pequeños pasos siguen siendo progreso.',
    ar: 'كل خطوة صغيرة هي تقدم حقيقي يستحق الفخر.'
  },
  {
    id: 'Saya mencintai dan menerima diri saya sepenuhnya.',
    en: 'I love and accept myself completely.',
    jv: 'Kula tresna lan nampi dhiri kula sajangkeping.',
    su: 'Simkuring mikacinta sareng nampi diri sagemblengna.',
    ja: '私は自分を心から愛し、受け入れます。',
    zh: '我全心全意地爱自己、接纳自己。',
    es: 'Me amo y me acepto incondicionalmente.',
    ar: 'أحب نفسي وأتقبلها بكل ما فيها من مشاعر.'
  },
  {
    id: 'Kesalahanku tidak mendefinisikan diriku.',
    en: 'My mistakes do not define me.',
    jv: 'Kaluputan kula mboten dados tandha sinten sejatosipun kula.',
    su: 'Kalepatan simkuring henteu nandakeun saha simkuring saéstuna.',
    ja: '失敗や過ちが私の価値を決めるわけではありません。',
    zh: '过去的过错不能定义现在的我。',
    es: 'Mis errores no definen quién soy.',
    ar: 'أخطائي السابقة لا تحدد قيمتي الحقيقية.'
  },
  {
    id: 'Saya memaafkan diri saya sendiri.',
    en: 'I forgive myself.',
    jv: 'Kula nyuwun pangapunten marang dhiri kula piyambak.',
    su: 'Simkuring ngahapunten ka diri nyalira.',
    ja: '私は自分自身を優しく許します。',
    zh: '我宽恕并善待我自己。',
    es: 'Me perdono a mí mismo con compasión.',
    ar: 'أسامح نفسي وأعاملها برفق ورحمة.'
  },
  {
    id: 'Hari ini saya memilih kedamaian.',
    en: 'Today I choose peace.',
    jv: 'Dinten puniki kula milih katentreman.',
    su: 'Dinten ieu simkuring milih katengtreman.',
    ja: '今日、私は心の平安を選びます。',
    zh: '今天，我选择内心的宁静与祥和。',
    es: 'Hoy elijo la paz interior.',
    ar: 'اليوم أختار السلام والطمأنينة لقلبي.'
  },
  {
    id: 'Napas ini adalah jangkar saya.',
    en: 'This breath is my anchor.',
    jv: 'Ambegan puniki dados cepengan kula.',
    su: 'Ambegan ieu janten jangkar katingtriman simkuring.',
    ja: 'この呼吸が私の心を落ち着かせる錨です。',
    zh: '每一次呼吸都是我内心的锚。',
    es: 'Esta respiración es mi ancla de calma.',
    ar: 'هذا التنفس العميق هو مرساة أماني.'
  },
  {
    id: 'Saya memiliki kendali atas pikiran saya.',
    en: 'I have control over my thoughts.',
    jv: 'Kula gadhah kuwasa tumrap pikiran kula.',
    su: 'Simkuring gaduh kendali kana emutan simkuring.',
    ja: '私には自分の思考を優しく選ぶ力があります。',
    zh: '我拥有引导自己思绪的主动权。',
    es: 'Tengo el poder de guiar mis pensamientos.',
    ar: 'لدي القدرة على توجيه أفكاري نحو النور.'
  },
  {
    id: 'Saya melepaskan apa yang tidak bisa saya kendalikan.',
    en: 'I let go of what I cannot control.',
    jv: 'Kula ngeculaken sedaya ingkang mboten saged kula atur.',
    su: 'Simkuring ngaleupaskeun naon anu teu tiasa dikadalikeun.',
    ja: '自分の力では変えられないことは、手放します。',
    zh: '我释怀并放下那些我无法左右的事物。',
    es: 'Suelto aquello que no puedo controlar.',
    ar: 'أتخلى برضا عما لا أملك السيطرة عليه.'
  },
];

export const ANONYMOUS_ADJECTIVES = ['Brave', 'Gentle', 'Quiet', 'Bright', 'Calm', 'Mighty', 'Soft', 'Warm', 'Cool', 'Clear'];
export const ANONYMOUS_NOUNS = ['Butterfly', 'Wave', 'Breeze', 'Cloud', 'Star', 'Moon', 'Sun', 'Forest', 'River', 'Mountain'];

export const APP_CONFIG = {
  name: 'RIMA',
  fullName: 'Ruang Interaksi Mental Aman',
  version: '1.0.0',
};
