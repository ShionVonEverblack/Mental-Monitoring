export interface SpiritualContent {
  id: string;
  type: 'doa' | 'affirmasi' | 'refleksi';
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  source: 'universal' | 'islam' | 'kristen' | 'buddha' | 'hindu';
  icon: string;
}

export const SPIRITUAL_SOURCES = [
  { id: 'universal', labelId: 'Universal', labelEn: 'Universal', icon: '🌍' },
  { id: 'islam', labelId: 'Islam', labelEn: 'Islam', icon: '☪️' },
  { id: 'kristen', labelId: 'Kristen', labelEn: 'Christian', icon: '✝️' },
  { id: 'buddha', labelId: 'Buddha', labelEn: 'Buddhist', icon: '☸️' },
  { id: 'hindu', labelId: 'Hindu', labelEn: 'Hindu', icon: '🕉️' },
] as const;

export const SPIRITUAL_CONTENT: SpiritualContent[] = [
  // Universal (5)
  {
    id: 'u1',
    type: 'affirmasi',
    titleId: 'Kesadaran Penuh (Mindfulness)',
    titleEn: 'Mindfulness',
    contentId: 'Saya sadar akan saat ini. Saya bernapas dan membiarkan pikiran datang dan pergi tanpa menghakimi.',
    contentEn: 'I am aware of the present moment. I breathe and let thoughts come and go without judgment.',
    source: 'universal',
    icon: '🧘'
  },
  {
    id: 'u2',
    type: 'refleksi',
    titleId: 'Syukur Sederhana',
    titleEn: 'Simple Gratitude',
    contentId: 'Hari ini saya bersyukur untuk hal-hal kecil. Napas yang saya hela, tempat bernaung, dan setiap detik yang saya miliki.',
    contentEn: 'Today I am grateful for the small things. The breath I take, the shelter I have, and every second I own.',
    source: 'universal',
    icon: '✨'
  },
  {
    id: 'u3',
    type: 'affirmasi',
    titleId: 'Menerima Diri',
    titleEn: 'Self-Compassion',
    contentId: 'Saya menerima diri saya apa adanya. Saya layak mendapatkan cinta dan kebaikan, terutama dari diri saya sendiri.',
    contentEn: 'I accept myself as I am. I deserve love and kindness, especially from myself.',
    source: 'universal',
    icon: '💛'
  },
  {
    id: 'u4',
    type: 'refleksi',
    titleId: 'Ketenangan Batin',
    titleEn: 'Inner Peace',
    contentId: 'Di tengah kekacauan, saya memiliki ruang tenang di dalam diri. Saya bisa kembali ke sana kapan pun saya butuhkan.',
    contentEn: 'Amidst chaos, I have a quiet space within me. I can return to it whenever I need.',
    source: 'universal',
    icon: '🕊️'
  },
  {
    id: 'u5',
    type: 'affirmasi',
    titleId: 'Kekuatan Melangkah',
    titleEn: 'Strength to Move Forward',
    contentId: 'Langkah kecil tetaplah langkah maju. Saya berani menghadapi hari ini dengan kemampuan terbaik saya.',
    contentEn: 'A small step is still a step forward. I bravely face today with my best ability.',
    source: 'universal',
    icon: '🌱'
  },
  // Islam (4)
  {
    id: 'i1',
    type: 'doa',
    titleId: 'Doa Ketenangan Hati',
    titleEn: 'Prayer for Peace of Heart',
    contentId: 'Ya Allah, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku. Berikan aku kedamaian.',
    contentEn: 'O Allah, expand my breast, ease my task for me, and remove the impediment from my speech. Grant me peace.',
    source: 'islam',
    icon: '🤲'
  },
  {
    id: 'i2',
    type: 'refleksi',
    titleId: 'Istighfar (Memohon Ampun)',
    titleEn: 'Istighfar (Seeking Forgiveness)',
    contentId: 'Aku memohon ampun kepada Allah Yang Maha Agung. Semoga pengampunan ini membersihkan hatiku dari beban dan kecemasan.',
    contentEn: 'I seek forgiveness from Allah the Almighty. May this forgiveness cleanse my heart from burdens and anxiety.',
    source: 'islam',
    icon: '📿'
  },
  {
    id: 'i3',
    type: 'affirmasi',
    titleId: 'Mengingat Tuhan (Dzikir)',
    titleEn: 'Remembrance of God (Dhikr)',
    contentId: 'Ketahuilah, hanya dengan mengingat Allah hati menjadi tenang. Aku menyerahkan segala kekhawatiranku kepada-Nya.',
    contentEn: 'Verily, in the remembrance of Allah do hearts find rest. I surrender all my worries to Him.',
    source: 'islam',
    icon: '🤍'
  },
  {
    id: 'i4',
    type: 'refleksi',
    titleId: 'Syukur atas Nikmat',
    titleEn: 'Gratitude for Blessings',
    contentId: 'Alhamdulillah atas segala nikmat-Mu. Jika aku menghitung nikmat-Mu, niscaya aku takkan mampu menghitungnya.',
    contentEn: 'Praise be to God for all Your blessings. If I were to count Your favors, I would never be able to number them.',
    source: 'islam',
    icon: '🌟'
  },
  // Kristen (3)
  {
    id: 'k1',
    type: 'doa',
    titleId: 'Doa Ketenangan (Serenity Prayer)',
    titleEn: 'Serenity Prayer',
    contentId: 'Tuhan, berilah aku ketenangan untuk menerima hal-hal yang tidak dapat aku ubah, keberanian untuk mengubah hal-hal yang dapat aku ubah, dan kebijaksanaan untuk mengetahui perbedaannya.',
    contentEn: 'God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference.',
    source: 'kristen',
    icon: '🙏'
  },
  {
    id: 'k2',
    type: 'refleksi',
    titleId: 'Mazmur Penghiburan',
    titleEn: 'Psalm of Comfort',
    contentId: 'Tuhan adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang.',
    contentEn: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters.',
    source: 'kristen',
    icon: '📖'
  },
  {
    id: 'k3',
    type: 'affirmasi',
    titleId: 'Berserah Diri',
    titleEn: 'Surrender',
    contentId: 'Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu. Aku percaya pada rencana-Nya yang indah.',
    contentEn: 'Cast all your anxiety on Him because He cares for you. I trust in His beautiful plan.',
    source: 'kristen',
    icon: '🕊️'
  },
  // Buddha (3)
  {
    id: 'b1',
    type: 'doa',
    titleId: 'Meditasi Metta (Cinta Kasih)',
    titleEn: 'Metta Meditation (Loving-Kindness)',
    contentId: 'Semoga aku berbahagia. Semoga aku bebas dari penderitaan. Semoga semua makhluk hidup berbahagia dan damai.',
    contentEn: 'May I be happy. May I be free from suffering. May all living beings be happy and peaceful.',
    source: 'buddha',
    icon: '🌸'
  },
  {
    id: 'b2',
    type: 'refleksi',
    titleId: 'Menerima Ketidakkekalan',
    titleEn: 'Accepting Impermanence',
    contentId: 'Segala sesuatu yang muncul akan berlalu. Dengan menyadari ketidakkekalan, aku melepaskan kemelekatan dan menemukan kedamaian.',
    contentEn: 'Everything that arises will pass away. By realizing impermanence, I let go of attachment and find peace.',
    source: 'buddha',
    icon: '🍃'
  },
  {
    id: 'b3',
    type: 'affirmasi',
    titleId: 'Jalan Tengah',
    titleEn: 'The Middle Way',
    contentId: 'Aku berjalan di jalan tengah, menghindari ekstremitas. Keseimbangan adalah kunci menuju kedamaian pikiran dan kebebasan.',
    contentEn: 'I walk the middle way, avoiding extremes. Balance is the key to peace of mind and liberation.',
    source: 'buddha',
    icon: '⚖️'
  },
  // Hindu (3)
  {
    id: 'h1',
    type: 'doa',
    titleId: 'Mantra Om Shanti',
    titleEn: 'Om Shanti Mantra',
    contentId: 'Om Shanti, Shanti, Shanti. Semoga ada kedamaian di sekitarku, kedamaian di pikiranku, dan kedamaian di jiwaku.',
    contentEn: 'Om Shanti, Shanti, Shanti. May there be peace around me, peace in my mind, and peace in my soul.',
    source: 'hindu',
    icon: '🕉️'
  },
  {
    id: 'h2',
    type: 'doa',
    titleId: 'Doa Gayatri (Penerangan Batin)',
    titleEn: 'Gayatri Mantra',
    contentId: 'Kami bermeditasi pada kemuliaan pencipta alam semesta. Semoga Dia menerangi pikiran kita dan menuntun kita pada kebenaran.',
    contentEn: 'We meditate on the glory of the creator of the universe. May He illuminate our minds and guide us to truth.',
    source: 'hindu',
    icon: '☀️'
  },
  {
    id: 'h3',
    type: 'refleksi',
    titleId: 'Refleksi Dharma',
    titleEn: 'Dharma Reflection',
    contentId: 'Aku melakukan tugasku tanpa pamrih pada hasilnya. Ketenangan sejati datang ketika aku bertindak dengan kesadaran dan ketulusan.',
    contentEn: 'I perform my duty without attachment to the results. True peace comes when I act with awareness and sincerity.',
    source: 'hindu',
    icon: '🌿'
  }
];
