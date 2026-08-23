export interface EducationArticle {
  id: string;
  category: 'anxiety' | 'depression' | 'stress' | 'self-care' | 'professional';
  titleId: string;
  titleEn: string;
  summaryId: string;
  summaryEn: string;
  contentId: string;
  contentEn: string;
  icon: string;
  readingTimeMinutes: number;
  source: string;
}

export const EDUCATION_CATEGORIES = [
  { id: 'all', labelId: 'Semua', labelEn: 'All' },
  { id: 'anxiety', labelId: 'Kecemasan', labelEn: 'Anxiety' },
  { id: 'depression', labelId: 'Depresi', labelEn: 'Depression' },
  { id: 'stress', labelId: 'Manajemen Stres', labelEn: 'Stress Management' },
  { id: 'self-care', labelId: 'Perawatan Diri', labelEn: 'Self-Care' },
  { id: 'professional', labelId: 'Bantuan Profesional', labelEn: 'Professional Help' },
];

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: '1',
    category: 'anxiety',
    titleId: 'Apa Itu Kecemasan?',
    titleEn: 'What is Anxiety?',
    summaryId: 'Memahami dasar-dasar kecemasan dan bagaimana mengenalinya.',
    summaryEn: 'Understanding the basics of anxiety and how to recognize it.',
    contentId: 'Kecemasan adalah respons alami tubuh terhadap stres. Ini adalah perasaan takut atau khawatir tentang apa yang akan terjadi.\n\nBeberapa gejala umum termasuk detak jantung yang cepat, pernapasan cepat, gelisah, dan sulit berkonsentrasi. Meskipun kecemasan adalah hal yang normal, jika berlebihan dan mengganggu kehidupan sehari-hari, itu bisa menjadi gangguan kecemasan.\n\nCara terbaik untuk mengelola kecemasan ringan adalah dengan mengenali pemicunya, mempraktikkan pernapasan dalam, dan menjaga gaya hidup sehat. Jika Anda merasa kecemasan Anda tidak terkendali, penting untuk mencari bantuan profesional.',
    contentEn: 'Anxiety is your body\'s natural response to stress. It\'s a feeling of fear or apprehension about what\'s to come.\n\nSome common symptoms include a rapid heart rate, rapid breathing, restlessness, and difficulty concentrating. While anxiety is normal, if it is excessive and interferes with daily life, it could be an anxiety disorder.\n\nThe best way to manage mild anxiety is by recognizing triggers, practicing deep breathing, and maintaining a healthy lifestyle. If you feel your anxiety is out of control, it is important to seek professional help.',
    icon: '😰',
    readingTimeMinutes: 2,
    source: 'WHO & NIMH'
  },
  {
    id: '2',
    category: 'depression',
    titleId: 'Mengenal Depresi: Lebih dari Sekadar Sedih',
    titleEn: 'Understanding Depression: More Than Just Sadness',
    summaryId: 'Depresi bukan hanya kesedihan biasa. Ketahui tanda dan gejalanya.',
    summaryEn: 'Depression is not just ordinary sadness. Know the signs and symptoms.',
    contentId: 'Depresi adalah gangguan suasana hati yang ditandai dengan perasaan sedih yang mendalam dan hilangnya minat pada hal-hal yang biasanya dinikmati.\n\nGejala depresi bisa meliputi kelelahan terus-menerus, perubahan nafsu makan, gangguan tidur, perasaan tidak berharga, dan kesulitan berkonsentrasi. Depresi memengaruhi bagaimana Anda merasa, berpikir, dan bertindak serta dapat menyebabkan berbagai masalah emosional dan fisik.\n\nPenting untuk dipahami bahwa depresi bukanlah tanda kelemahan, dan ini adalah kondisi medis yang dapat diobati dengan dukungan psikologis, terapi, atau obat-obatan jika diperlukan.',
    contentEn: 'Depression is a mood disorder characterized by deep feelings of sadness and a loss of interest in things you usually enjoy.\n\nSymptoms of depression can include persistent fatigue, changes in appetite, sleep disturbances, feelings of worthlessness, and difficulty concentrating. Depression affects how you feel, think, and act and can lead to a variety of emotional and physical problems.\n\nIt is important to understand that depression is not a sign of weakness; it is a medical condition that can be treated with psychological support, therapy, or medication if necessary.',
    icon: '🌧️',
    readingTimeMinutes: 3,
    source: 'APA & Kemenkes RI'
  },
  {
    id: '3',
    category: 'anxiety',
    titleId: '5 Teknik Grounding untuk Serangan Panik',
    titleEn: '5 Grounding Techniques for Panic Attacks',
    summaryId: 'Cara cepat untuk kembali tenang saat mengalami serangan panik atau cemas berlebih.',
    summaryEn: 'Quick ways to calm down during a panic or severe anxiety attack.',
    contentId: 'Teknik grounding membantu Anda kembali ke masa kini dan mengurangi perasaan terlepas dari kenyataan saat cemas atau panik.\n\n1. Aturan 5-4-3-2-1: Sebutkan 5 hal yang Anda lihat, 4 hal yang bisa disentuh, 3 hal yang bisa didengar, 2 hal yang bisa dicium baunya, dan 1 hal yang bisa dikecap.\n\n2. Pernapasan Perut: Tarik napas dalam-dalam melalui hidung sehingga perut mengembang, lalu hembuskan perlahan melalui mulut.\n\n3. Memegang Es Batu: Sensasi dingin yang kuat akan mengalihkan fokus otak Anda dari kepanikan ke suhu fisik.\n\n4. Meraba Tekstur: Sentuh benda di sekitar Anda, perhatikan apakah itu kasar, halus, dingin, atau hangat.\n\n5. Menghitung Mundur: Hitung mundur dari 100 dengan kelipatan 7 (100, 93, 86, dst) untuk mengalihkan pikiran Anda.',
    contentEn: 'Grounding techniques help you return to the present moment and reduce feelings of detachment during anxiety or panic.\n\n1. The 5-4-3-2-1 Rule: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.\n\n2. Belly Breathing: Take deep breaths through your nose so your belly expands, then exhale slowly through your mouth.\n\n3. Holding an Ice Cube: The strong cold sensation shifts your brain\'s focus from panic to physical temperature.\n\n4. Feeling Textures: Touch items around you, notice if they are rough, smooth, cold, or warm.\n\n5. Counting Backwards: Count backwards from 100 by 7s (100, 93, 86, etc.) to distract your mind.',
    icon: '⚓',
    readingTimeMinutes: 3,
    source: 'American Psychological Association'
  },
  {
    id: '4',
    category: 'self-care',
    titleId: 'Tidur Sehat untuk Kesehatan Mental',
    titleEn: 'Healthy Sleep for Mental Health',
    summaryId: 'Mengapa tidur sangat penting dan bagaimana cara memperbaikinya.',
    summaryEn: 'Why sleep is essential and how to improve it.',
    contentId: 'Tidur yang cukup dan berkualitas sangat penting untuk kesehatan mental. Kurang tidur dapat memperburuk gejala kecemasan dan depresi, sementara tidur yang baik dapat meningkatkan suasana hati dan ketahanan emosional.\n\nUntuk mendapatkan tidur yang lebih baik:\n- Pertahankan jadwal tidur yang konsisten, bahkan di akhir pekan.\n- Hindari kafein dan alkohol sebelum tidur.\n- Batasi paparan cahaya biru dari layar setidaknya satu jam sebelum tidur.\n- Buat rutinitas sebelum tidur yang menenangkan, seperti membaca atau meditasi ringan.\n\nOtak kita membutuhkan waktu tidur untuk memproses emosi dan memperbaiki diri, jadikan tidur sebagai prioritas utama Anda.',
    contentEn: 'Getting enough high-quality sleep is crucial for mental health. Sleep deprivation can worsen symptoms of anxiety and depression, while good sleep can boost mood and emotional resilience.\n\nTo get better sleep:\n- Maintain a consistent sleep schedule, even on weekends.\n- Avoid caffeine and alcohol before bedtime.\n- Limit exposure to blue light from screens at least an hour before bed.\n- Create a relaxing bedtime routine, such as reading or light meditation.\n\nOur brains need sleep to process emotions and repair themselves; make sleep your top priority.',
    icon: '🛌',
    readingTimeMinutes: 2,
    source: 'National Sleep Foundation'
  },
  {
    id: '5',
    category: 'professional',
    titleId: 'Kapan Harus ke Psikolog?',
    titleEn: 'When to See a Psychologist?',
    summaryId: 'Tanda-tanda bahwa Anda mungkin membutuhkan bantuan profesional.',
    summaryEn: 'Signs that you might need professional help.',
    contentId: 'Seringkali orang ragu kapan waktu yang tepat untuk mencari bantuan profesional. Anda tidak perlu menunggu sampai mengalami krisis untuk ke psikolog.\n\nPertimbangkan untuk menemui profesional jika:\n- Anda merasa sedih, cemas, atau marah yang intens secara terus-menerus.\n- Emosi Anda mengganggu pekerjaan, sekolah, atau hubungan Anda.\n- Anda mengandalkan zat (seperti alkohol atau obat-obatan) untuk mengatasi perasaan Anda.\n- Anda kehilangan minat pada hal-hal yang dulu Anda sukai.\n- Anda mengalami perubahan drastis pada nafsu makan atau pola tidur.\n\nMencari bantuan adalah tanda keberanian, bukan kelemahan. Psikolog dapat memberikan alat dan perspektif yang aman dan objektif untuk membantu Anda.',
    contentEn: 'People often hesitate about when it is the right time to seek professional help. You do not have to wait until you are in a crisis to see a psychologist.\n\nConsider seeing a professional if:\n- You feel intense sadness, anxiety, or anger constantly.\n- Your emotions are interfering with work, school, or relationships.\n- You rely on substances (like alcohol or drugs) to cope with your feelings.\n- You have lost interest in things you used to enjoy.\n- You experience drastic changes in appetite or sleep patterns.\n\nSeeking help is a sign of courage, not weakness. A psychologist can provide safe, objective tools and perspectives to help you.',
    icon: '⚕️',
    readingTimeMinutes: 3,
    source: 'Kemenkes RI'
  },
  {
    id: '6',
    category: 'stress',
    titleId: 'Mindfulness untuk Pemula',
    titleEn: 'Mindfulness for Beginners',
    summaryId: 'Panduan dasar untuk melatih kesadaran penuh di kehidupan sehari-hari.',
    summaryEn: 'A basic guide to practicing mindfulness in daily life.',
    contentId: 'Mindfulness adalah praktik memusatkan perhatian pada momen saat ini tanpa menghakimi. Ini membantu kita menyadari pikiran dan perasaan kita tanpa terbawa olehnya.\n\nCara mudah untuk mulai mempraktikkan mindfulness:\n1. Makan dengan sadar: Nikmati setiap gigitan makanan Anda, perhatikan tekstur, rasa, dan baunya.\n2. Berjalan dengan sadar: Saat berjalan, fokuslah pada sensasi kaki Anda yang menyentuh tanah dan angin di kulit Anda.\n3. Fokus pada napas: Luangkan waktu 3 menit sehari hanya untuk memperhatikan napas Anda yang masuk dan keluar.\n\nDengan latihan rutin, mindfulness dapat secara signifikan mengurangi stres dan meningkatkan kualitas hidup secara keseluruhan.',
    contentEn: 'Mindfulness is the practice of focusing your attention on the present moment without judgment. It helps us become aware of our thoughts and feelings without getting carried away by them.\n\nEasy ways to start practicing mindfulness:\n1. Mindful eating: Savor every bite of your food, noticing the texture, taste, and smell.\n2. Mindful walking: While walking, focus on the sensation of your feet touching the ground and the wind on your skin.\n3. Focus on your breath: Spend 3 minutes a day just noticing your breath going in and out.\n\nWith regular practice, mindfulness can significantly reduce stress and improve overall quality of life.',
    icon: '🧘',
    readingTimeMinutes: 2,
    source: 'Mayo Clinic'
  },
  {
    id: '7',
    category: 'self-care',
    titleId: 'Memahami dan Mengelola Emosi',
    titleEn: 'Understanding and Managing Emotions',
    summaryId: 'Cara sehat untuk memproses emosi negatif.',
    summaryEn: 'Healthy ways to process negative emotions.',
    contentId: 'Semua emosi, termasuk yang tidak nyaman seperti marah dan sedih, adalah valid dan memiliki tujuan. Mengelola emosi bukan berarti menekannya, melainkan meresponsnya dengan cara yang sehat.\n\nLangkah-langkah mengelola emosi:\n1. Kenali emosi: Beri nama pada apa yang Anda rasakan. "Saya merasa marah karena..." \n2. Terima tanpa menghakimi: Jangan merasa bersalah atas perasaan Anda.\n3. Ekspresikan secara konstruktif: Tulis di jurnal, bicarakan dengan teman, atau lakukan aktivitas fisik.\n4. Ambil jeda: Jika emosi terlalu kuat, menjauhlah sejenak dari situasi tersebut sebelum bereaksi.\n\nKemampuan regulasi emosi adalah kunci menuju kecerdasan emosional yang baik.',
    contentEn: 'All emotions, including uncomfortable ones like anger and sadness, are valid and serve a purpose. Managing emotions doesn\'t mean suppressing them, but rather responding to them in a healthy way.\n\nSteps to manage emotions:\n1. Identify the emotion: Name what you are feeling. "I feel angry because..."\n2. Accept without judgment: Do not feel guilty for your feelings.\n3. Express constructively: Write in a journal, talk to a friend, or engage in physical activity.\n4. Take a pause: If the emotion is too strong, step away from the situation briefly before reacting.\n\nEmotional regulation skills are the key to good emotional intelligence.',
    icon: '❤️',
    readingTimeMinutes: 3,
    source: 'American Psychological Association'
  },
  {
    id: '8',
    category: 'stress',
    titleId: 'Stres di Tempat Kerja: Tips Praktis',
    titleEn: 'Workplace Stress: Practical Tips',
    summaryId: 'Cara mengelola tekanan dan stres di lingkungan profesional.',
    summaryEn: 'How to manage pressure and stress in a professional environment.',
    contentId: 'Stres di tempat kerja adalah masalah umum yang dapat berdampak buruk pada kesehatan mental dan fisik jika tidak ditangani.\n\nBeberapa cara untuk mengelola stres kerja meliputi:\n- Menetapkan batasan: Pisahkan waktu kerja dan waktu pribadi dengan jelas. Hindari memeriksa email kerja di luar jam kerja jika memungkinkan.\n- Prioritaskan tugas: Gunakan matriks prioritas untuk membedakan antara tugas yang mendesak dan yang penting. \n- Ambil istirahat pendek: Beristirahatlah selama 5-10 menit setiap beberapa jam untuk meregangkan tubuh dan mengistirahatkan mata.\n- Komunikasi yang asertif: Bicarakan beban kerja Anda dengan atasan atau rekan kerja jika merasa kewalahan.\n\nIngatlah bahwa produktivitas Anda tidak mendefinisikan nilai Anda sebagai individu.',
    contentEn: 'Workplace stress is a common issue that can take a toll on your mental and physical health if left unaddressed.\n\nSome ways to manage work stress include:\n- Setting boundaries: Clearly separate work time and personal time. Avoid checking work emails outside of work hours if possible.\n- Prioritize tasks: Use a priority matrix to distinguish between urgent and important tasks.\n- Take short breaks: Rest for 5-10 minutes every few hours to stretch and rest your eyes.\n- Assertive communication: Discuss your workload with your manager or colleagues if you feel overwhelmed.\n\nRemember that your productivity does not define your worth as an individual.',
    icon: '💼',
    readingTimeMinutes: 3,
    source: 'WHO'
  },
  {
    id: '9',
    category: 'self-care',
    titleId: 'Self-Compassion: Berdamai dengan Diri Sendiri',
    titleEn: 'Self-Compassion: Making Peace with Yourself',
    summaryId: 'Mengapa bersikap baik pada diri sendiri itu penting.',
    summaryEn: 'Why being kind to yourself matters.',
    contentId: 'Self-compassion berarti memperlakukan diri sendiri dengan kebaikan, kepedulian, dan pengertian yang sama seperti Anda memperlakukan sahabat yang sedang kesulitan.\n\nSeringkali kita menjadi kritikus paling kejam bagi diri kita sendiri. Saat kita gagal, kita cenderung menghukum diri kita. Self-compassion menawarkan alternatif yang lebih sehat.\n\nKomponen utamanya adalah: \n- Kebaikan pada diri sendiri (berhenti menghakimi),\n- Kemanusiaan yang sama (menyadari bahwa semua orang membuat kesalahan dan merasa sakit),\n- Mindfulness (menyadari rasa sakit kita tanpa melebih-lebihkannya).\n\nPenelitian menunjukkan bahwa self-compassion terkait erat dengan kebahagiaan yang lebih besar dan tingkat depresi yang lebih rendah.',
    contentEn: 'Self-compassion means treating yourself with the same kindness, care, and understanding that you would offer a good friend in distress.\n\nOften, we are our own harshest critics. When we fail, we tend to punish ourselves. Self-compassion offers a healthier alternative.\n\nIts main components are:\n- Self-kindness (stopping self-judgment),\n- Common humanity (recognizing that everyone makes mistakes and feels pain),\n- Mindfulness (being aware of our pain without exaggerating it).\n\nResearch shows that self-compassion is strongly linked to greater happiness and lower levels of depression.',
    icon: '🫂',
    readingTimeMinutes: 2,
    source: 'Dr. Kristin Neff'
  },
  {
    id: '10',
    category: 'professional',
    titleId: 'Mitos vs Fakta Kesehatan Mental di Indonesia',
    titleEn: 'Mental Health Myths vs Facts in Indonesia',
    summaryId: 'Meluruskan kesalahpahaman umum tentang kesehatan mental di masyarakat kita.',
    summaryEn: 'Clearing up common misunderstandings about mental health in our society.',
    contentId: 'Masih banyak stigma seputar kesehatan mental di Indonesia. Memahami fakta dapat membantu mengurangi stigma tersebut.\n\nMitos: Masalah kesehatan mental adalah tanda kurang iman.\nFakta: Gangguan mental adalah kondisi medis yang melibatkan faktor biologis, psikologis, dan sosial. Sama seperti diabetes atau asma, ini tidak ada hubungannya dengan tingkat keimanan seseorang.\n\nMitos: Orang dengan masalah mental tidak bisa bekerja.\nFakta: Dengan dukungan dan perawatan yang tepat, sebagian besar orang dengan masalah kesehatan mental adalah anggota masyarakat yang sangat produktif.\n\nMitos: Terapi hanya untuk orang yang "gila".\nFakta: Terapi berguna bagi siapa saja yang ingin memahami diri mereka lebih baik, mengelola stres, atau memperbaiki kualitas hidup. Anda tidak perlu sakit parah untuk mendapatkan manfaat dari terapi.',
    contentEn: 'There is still a lot of stigma surrounding mental health in Indonesia. Understanding the facts can help reduce this stigma.\n\nMyth: Mental health issues are a sign of weak faith.\nFact: Mental disorders are medical conditions involving biological, psychological, and social factors. Just like diabetes or asthma, they have nothing to do with a person\'s level of faith.\n\nMyth: People with mental health issues cannot work.\nFact: With the right support and treatment, most people with mental health issues are highly productive members of society.\n\nMyth: Therapy is only for "crazy" people.\nFact: Therapy is useful for anyone who wants to understand themselves better, manage stress, or improve their quality of life. You don\'t need to be severely ill to benefit from therapy.',
    icon: '⚖️',
    readingTimeMinutes: 3,
    source: 'Kemenkes RI & PDSKJI'
  }
];
