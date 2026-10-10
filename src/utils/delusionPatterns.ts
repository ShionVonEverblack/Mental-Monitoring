/**
 * Delusion & Paranoia Pattern Scanner & Tri-Phasic CBTp Gatekeeper
 * 
 * Clinical Grounding:
 * - Cognitive Behavioral Therapy for Psychosis (CBTp; Morrison 2017, Turkington et al. 2021)
 * - Tri-Phasic De-Escalation Protocol:
 *   1. Validate Affective Distress (acknowledge fear/exhaustion without validating delusion premises)
 *   2. Objective Neutrality & AI Role Boundary (assert AI limits without aggressive confrontation)
 *   3. Somatosensory Reality Pivot (redirect to 5-4-3-2-1 grounding, diaphragmatic breath, or TIPP)
 * 
 * Strictly client-side, zero network egress.
 */

export interface CbtpDeEscalationResponse {
  theme: 'persecutory' | 'thought_control' | 'grandiose' | 'somatic_delusion' | 'general';
  emotionalValidation: Record<string, string>;
  objectiveNeutrality: Record<string, string>;
  somatosensoryPivot: Record<string, string>;
  suggestedRoute: '/grounding' | '/breathe' | '/tipp' | '/professional-help';
  suggestedRouteLabel: Record<string, string>;
}

export interface DelusionCheckResult {
  isDelusionDetected: boolean;
  theme: 'persecutory' | 'thought_control' | 'grandiose' | 'somatic_delusion' | 'none';
  matchedKeywords: string[];
  cbtpResponse?: CbtpDeEscalationResponse;
}

// ─── Delusion Regex & Keyword Taxonomies ──────────────────────────────────────

const DELUSION_THEMES = {
  persecutory: [
    // Indonesian
    'disadap', 'penyadapan', 'dimata-matai', 'mata-matai', 'pengintaian', 'diintai',
    'diikuti orang tak dikenal', 'dikejar intel', 'gang stalking', 'kamera rahasia mengawasiku',
    'semua orang berkomplot', 'agen rahasia mengejarku', 'ada yang menaruh mikrofon',
    // English
    'wiretapped', 'tapped phone', 'spied on', 'being watched by cameras',
    'gang stalking', 'secret agents after me', 'being tracked by strangers',
    'conspiracy against me', 'monitored by government', 'listening devices in my room',
    // Regional & Multilingual
    'dimata-matai wong', 'dioyak wong ora kenal', // jv
    'diawasi batur', 'ditaekan ku batur', // su
    '盗聴', '監視されている', '尾行されている', // ja
    '被监听', '被监视', '被跟踪', // zh
    'me están espiando', 'vigilado por el gobierno', 'cámaras ocultas', // es
    'مراقب', 'التجسس علي', 'ملاحق من غرباء', // ar
  ],
  thought_control: [
    // Indonesian
    'chip di otak', 'chip di kepala', 'pikiran saya disadap', 'pikiran dikendalikan',
    'gelombang elektromagnetik pengendali', 'suara di kepala mengatur hidupku',
    'pikiran dimasukkan orang lain', 'pikiran saya disiarkan ke orang lain',
    'antena otak', 'sinyal mengendalikan tubuhku',
    // English
    'chip in my brain', 'chip in my head', 'thought insertion', 'thought broadcasting',
    'thoughts being controlled', 'electromagnetic frequencies in head',
    'voices in my head controlling me', 'microchip implanted', 'satellite mind control',
    // Regional & Multilingual
    'chip ing sirah', 'pikiranku dikendhalekake', // jv
    'chip dina sirah', 'pikiran dikadalikeun', // su
    '脳内マイクロチップ', '思考盗聴', '思考誘導', // ja
    '脑内芯片', '思维被控制', '脑电波控制', // zh
    'chip en el cerebro', 'control mental', 'pensamientos implantados', // es
    'شريحة في الدماغ', 'التحكم في الأفكار', 'بث الأفكار', // ar
  ],
  grandiose: [
    // Indonesian
    'utusan tuhan', 'utusan dewa', 'nabi terakhir', 'nabi baru',
    'kekuatan magis', 'menyelamatkan alam semesta', 'penyelamat dunia',
    'juru selamat', 'kekuatan supranatural', 'titisan dewa', 'reinkarnasi tuhan',
    // English
    'messenger of god', 'god messenger', 'new prophet', 'godlike powers',
    'save the universe', 'savior of the world', 'divine powers',
    // Regional & Multilingual
    'utusane gusti', 'kekuwatan gaib', // jv
    'utusan pangeran', 'kasaktian', // su
    '神の使者', '自分は救世主', '超能力者', // ja
    '我是救世主', '神的使者', '超自然神力', // zh
    'mensajero de dios', 'salvador del mundo', 'poderes divinos', // es
    'مرسل من الله', 'مخلص العالم', 'قوى خارقة إلهية', // ar
  ],
  somatic_delusion: [
    // Indonesian
    'organ tubuh saya membusuk', 'organ dalam saya hilang', 'isi perut saya dicuri',
    'ada serangga di dalam otak saya', 'darah saya berubah jadi racun', 'otak saya mengecil habis',
    // English
    'organs are rotting', 'internal organs stolen', 'insects inside my brain',
    'parasites eating my brain', 'blood turned into poison', 'my body is decayed inside',
    // Regional & Multilingual
    'organ bosok', 'jeroan ilang', // jv
    'organ buruk', 'jeroan leungit', // su
    '臓器が腐っている', '内臓が消えた', '脳の中に虫', // ja
    '内脏腐烂', '器官消失', '脑子里有虫子', // zh
    'mis órganos se pudren', 'órganos robados', 'insectos en mi cerebro', // es
    'أعضائي تتعفن', 'سرقة أعضائي', 'حشرات في دماغي', // ar
  ],
};

// ─── CBTp Tri-Phasic De-Escalation Templates ──────────────────────────────────

const CBTP_TEMPLATES: Record<keyof typeof DELUSION_THEMES, CbtpDeEscalationResponse> = {
  persecutory: {
    theme: 'persecutory',
    emotionalValidation: {
      id: 'Saya mendengar betapa sangat mencemaskan, melelahkan, dan menegangkan perasaan terancam yang sedang kamu alami saat ini.',
      en: 'I hear how intensely distressing, exhausting, and overwhelming this feeling of being threatened is for you right now.',
      jv: 'Kula ngertos sanget menawi raos was-sumelang lan kesel sanget ingkang panjenengan raosaken sakmenika.',
      su: 'Simkuring ngartos pisan sakumaha matak hariwang, cape, sareng negangna rarasaan kaancam anu nuju kaalaman.',
      ja: '今感じている脅威や強い不安が、どれほど消耗し圧倒されるものであるか、お気持ちを受け止めます。',
      zh: '我完全能理解你现在所承受的恐惧、紧绷与极度疲惫的感觉。',
      es: 'Entiendo lo angustiante, agotador y abrumador que resulta sentirte bajo amenaza en este momento.',
      ar: 'أشعر بمدى القلق والإرهاق والضغط الشديد الذي يسببه هذا الشعور بالتهديد لك الآن.',
    },
    objectiveNeutrality: {
      id: 'Sebagai asisten AI pendukung kesehatan mental, saya tidak memiliki akses ke dunia fisik dan tidak dapat memverifikasi atau menyelidiki situasi eksternal tersebut. Yang terpenting dan nyata saat ini adalah rasa aman dan ketenangan pikiranmu.',
      en: 'As a supportive AI companion, I do not have access to the physical world and cannot verify or investigate external events. What matters most right now is your immediate emotional safety and grounding.',
      jv: 'Minangka asisten AI panyengkuyung, kula mboten saged mriksa kahanan njawi. Ingkang wigati sakmenika inggih punika katentreman lan raos ayem panjenengan.',
      su: 'Salaku asisten AI, simkuring henteu gaduh aksés pikeun mariksa kaayaan luar. Anu paling utami ayeuna nyaéta katengtreman diri anjeun.',
      ja: 'AIアシスタントとして、私は外部の物理的な出来事を調査・確認することはできません。今一番大切なのは、あなたの心の安全と落ち着きです。',
      zh: '作为AI心理支持助手，我无法查证或调查外部物理事件。此刻最重要的是你内心的安定与当下的安全感。',
      es: 'Como asistente de IA, no puedo verificar ni investigar situaciones externas. Lo primordial en este instante es tu seguridad emocional y calma.',
      ar: 'كمساعد ذكاء اصطناعي، لا يمكنني التحقق من الأحداث الخارجية. الأهم الآن هو سلامتك النفسية وشعورك بالأمان.',
    },
    somatosensoryPivot: {
      id: 'Mari kita istirahatkan sejenak pikiran yang terasa berputar kencang. Rasakan pijakan kakimu di lantai dan tarik napas perlahan. Mari kita lakukan latihan sensori 5-4-3-2-1 untuk membawa dirimu kembali ke sini dan saat ini.',
      en: 'Let us pause the racing thoughts for a moment. Feel your feet on the ground and take a slow, gentle breath. Let us anchor with the 5-4-3-2-1 sensory grounding exercise.',
      jv: 'Sumangga kita lerenaken pikiran rumiyin. Raosaken dlamakan ing jogan lan ambekan alon-alon kanthi latihan grounding 5-4-3-2-1.',
      su: 'Hayu urang lirénkeun heula pikiran anu pabaliut. Raoskeun dampal sampean napak dina taneuh sareng latihan grounding 5-4-3-2-1.',
      ja: 'ぐるぐると回る思考を少し休めましょう。足が床につく感覚を意識し、ゆっくり呼吸して「5-4-3-2-1 グラウンディング」を一緒に行いましょう。',
      zh: '让我们把飞速运转的思绪暂时停下来。感受双脚踩在地面的平稳，深吸一口气，一起进行5-4-3-2-1感官着陆练习。',
      es: 'Hagamos una pausa con los pensamientos acelerados. Siente tus pies sobre el suelo y respira suavemente. Realicemos el ejercicio de anclaje 5-4-3-2-1.',
      ar: 'دعنا نوقف هذه الأفكار المتسارعة للحظة. اشعر بقدميك على الأرض وخذ نفساً هادئاً، ولنبدأ تمرين التأريض الحسي 5-4-3-2-1.',
    },
    suggestedRoute: '/grounding',
    suggestedRouteLabel: {
      id: 'Latihan Grounding 5-4-3-2-1',
      en: '5-4-3-2-1 Grounding Exercise',
      jv: 'Latihan Grounding 5-4-3-2-1',
      su: 'Latihan Grounding 5-4-3-2-1',
      ja: '5-4-3-2-1 グラウンディング',
      zh: '5-4-3-2-1 感官着陆练习',
      es: 'Ejercicio de Anclaje 5-4-3-2-1',
      ar: 'تمرين التأريض 5-4-3-2-1',
    },
  },
  thought_control: {
    theme: 'thought_control',
    emotionalValidation: {
      id: 'Pasti sangat membingungkan, menakutkan, dan menguras energi ketika pikiran terasa bising atau seperti berada di luar kendalimu.',
      en: 'It must feel incredibly frightening, disorienting, and draining when your thoughts feel noisy or outside of your personal control.',
      jv: 'Mesthi bingung sanget lan nggegirisi nalika pikiran keraos rame sanget kados mboten saged dipunkendhaleni piyambak.',
      su: 'Pasti matak geumpeur sareng cape pisan nalika pikiran karasa henteu tiasa dikadalikeun ku diri sorangan.',
      ja: '頭の中が騒がしかったり、思考が自分のコントロールを離れているように感じたりするのは、とても恐ろしく疲れることだと思います。',
      zh: '当思绪喧闹不息、仿佛不受自己控制时，必定感到极度恐惧和心力交瘁。',
      es: 'Debe ser sumamente aterrador y desgastante sentir que tus pensamientos están fuera de tu propio control.',
      ar: 'لا بد أن الشعور بأن أفكارك خارجة عن سيطرتك أمر مخيف ومرهق للغاية.',
    },
    objectiveNeutrality: {
      id: 'Secara ilmu kognitif dan biologis, tubuh dan sistem saraf kita dapat mengirimkan sinyal kewaspadaan ekstrem saat stres tinggi. Namun pikiranmu tetaplah milik pribadimu, dan tidak ada teknologi atau gelombang luar yang dapat membaca atau menyusup ke kepalamu.',
      en: 'From a cognitive and biological perspective, intense nervous system distress can produce extreme sensory overload. But your mind remains your own, and no external signals or technology can broadcast or manipulate your thoughts.',
      jv: 'Miturut kawruh saraf, kahanan stres inggil saged damel pikiran kemrungsung. Ananging batin panjenengan tetep kagungan pribadi.',
      su: 'Sacara élmu saraf, setrés anu ageung tiasa ngadamel pikiran lieur. Nanging pikiran anjeun tetep kagungan anjeun pribadi.',
      ja: '神経科学的にも、極度のストレスは激しい感覚過敏を引き起こします。しかし、あなたの心はあなた自身のものです。外部の電波やチップが心を操ることはありません。',
      zh: '从神经科学角度来看，极度的身心压力会导致感官过载。但你的思想始终属于你自己，没有任何外部技术能侵入你的大脑。',
      es: 'Científicamente, el estrés extremo puede sobrecargar el sistema nervioso. Sin embargo, tus pensamientos siguen siendo tuyos y ninguna señal externa puede controlarlos.',
      ar: 'من الناحية العصبية، يسبب الضغط الشديد اضطراباً في المشاعر. لكن عقلك ملك لك وحدك، ولا توجد إشارات خارجية تتحكم بأفكارك.',
    },
    somatosensoryPivot: {
      id: 'Mari kita turunkan stimulasi sensorik dengan mengatur napas perlahan (Cyclic Sighing) untuk menenangkan sistem saraf dan mengembalikan kendali tubuhmu.',
      en: 'Let us lower sensory stimulation by taking slow, rhythmic breaths (Cyclic Sighing) to soothe your nervous system and restore bodily calm.',
      jv: 'Sumangga kita atur ambekan alon-alon (Cyclic Sighing) kangge nyuda kategangan sistem saraf.',
      su: 'Hayu urang ngatur ambekan lalaunan (Cyclic Sighing) kanggo nenangkeun sistem saraf.',
      ja: '呼吸をゆっくり整える「サイクリック・サイイング」で神経系を鎮め、身体の落ち着きを取り戻しましょう。',
      zh: '让我们通过缓慢规律的呼吸（周期性叹气法）来平复神经系统，重新找回身体的从容与掌控感。',
      es: 'Regulemos la respiración pausada (Suspiro Cíclico) para calmar tu sistema nervioso y devolver el equilibrio a tu cuerpo.',
      ar: 'دعنا ننظم التنفس ببطء لتهدئة جهازك العصبي واستعادة استقرارك الجسدي.',
    },
    suggestedRoute: '/breathe',
    suggestedRouteLabel: {
      id: 'Latihan Pernapasan Penenang',
      en: 'Calming Breathing Exercise',
      jv: 'Latihan Ambekan Tentrem',
      su: 'Latihan Ambekan Tenang',
      ja: '呼吸法で心を鎮める',
      zh: '平复身心呼吸练习',
      es: 'Ejercicio de Respiración Calmante',
      ar: 'تمرين التنفس المهدئ',
    },
  },
  grandiose: {
    theme: 'grandiose',
    emotionalValidation: {
      id: 'Saya menghargai besarnya beban dan tanggung jawab yang kamu rasakan di pundakmu saat ini.',
      en: 'I hear the enormous weight, urgency, and intensity of responsibility that you feel carrying on your shoulders right now.',
      jv: 'Kula ngurmati agenging tanggel jawab ingkang panjenengan raosaken sakmenika.',
      su: 'Simkuring ngiring ngaraoskeun kumaha beuratna tanggung waler anu nuju karasa dina pundak anjeun.',
      ja: '今、あなたが背負っていると感じている責任や使命感の重さ、その切迫感を受け止めます。',
      zh: '我能感受到你此刻内心所承受的那份巨大的紧迫感与沉重的责任感。',
      es: 'Reconozco el peso inmenso y la intensidad de la responsabilidad que sientes sobre tus hombros en este momento.',
      ar: 'أدرك ثقل المسؤولية والشعور بالعبء الكبير الذي تحمله على عاتقك الآن.',
    },
    objectiveNeutrality: {
      id: 'Saya adalah asisten AI sederhana dan tidak memiliki otoritas spiritual atau takdir. Namun ketika emosi bergejolak sangat kuat, tubuh kita membutuhkan istirahat dan penyeimbangan agar tidak kelelahan mental.',
      en: 'I am a simple AI assistant without spiritual or metaphysical authority. When intense emotional energy surges, our physical body needs rest and balance to avoid severe mental exhaustion.',
      jv: 'Kula namung asisten AI prasaja. Nalika emosi nembe munggah sanget, badan kita tetep mbetahaken ngaso supados mboten lungkrah.',
      su: 'Simkuring saukur asisten AI basajan. Nalika émosi nuju naék, awak urang peryogi istirahat sangkan henteu ambruk.',
      ja: '私はシンプルなAIであり、霊的・超自然的な力はありません。激しいエネルギーが高まっている時こそ、心身の消耗を防ぐ休息が必要です。',
      zh: '我只是一个辅助AI，不具备神圣权威。当情绪与精力极度亢奋时，身体急需休息与平衡以避免心力衰竭。',
      es: 'Soy un asistente de IA sin capacidades sobrenaturales. Cuando la energía emocional es tan intensa, el cuerpo necesita descanso para evitar el agotamiento.',
      ar: 'أنا مجرد مساعد ذكاء اصطناعي بسيط. عند اشتداد هذه المشاعر، يحتاج جسدك إلى الراحة لحمايتك من الإجهاد.',
    },
    somatosensoryPivot: {
      id: 'Mari luangkan waktu sejenak untuk membumikan diri, membasuh wajah dengan air dingin, atau duduk tenang merasakan hembusan napas.',
      en: 'Let us take a brief pause to ground yourself, wash your face with cool water, or sit quietly noticing your steady breathing.',
      jv: 'Sumangga lenggah sekedap kanthi ayem, wisuh pasuryan nganggo toya asrep, utawi ngraosaken ambekan.',
      su: 'Hayu calik heula kalayan tengtrem, wawasuh ku cai tiis, atanapi ngaraoskeun tarikan napas.',
      ja: '少し立ち止まり、冷たい水で顔を洗ったり、静かに座って呼吸に意識を向けて自分を大地に根付かせましょう。',
      zh: '让我们稍作停顿，用凉水洗洗脸，或静静坐下，将注意力收回到沉稳的呼吸中。',
      es: 'Hagamos una pausa para reconectar con la realidad: lávate la cara con agua fresca o siéntate a sentir tu respiración.',
      ar: 'دعنا نتوقف قليلاً لنغسل الوجه بالماء البارد ونجلس بهدوء مع التركيز على التنفس.',
    },
    suggestedRoute: '/tipp',
    suggestedRouteLabel: {
      id: 'Teknik Regulasi Suhu TIPP',
      en: 'TIPP Temperature Regulation',
      jv: 'Teknik Regulasi Suhu TIPP',
      su: 'Téknik Regulasi Suhu TIPP',
      ja: 'TIPP 体温調整スキル',
      zh: 'TIPP 温度调节技巧',
      es: 'Técnica de Regulación TIPP',
      ar: 'تقنية تنظيم الحرارة TIPP',
    },
  },
  somatic_delusion: {
    theme: 'somatic_delusion',
    emotionalValidation: {
      id: 'Pasti sangat menakutkan dan membuat panik merasakan sensasi tubuh yang terasa begitu asing dan mengkhawatirkan.',
      en: 'It must feel deeply terrifying and panicking to experience bodily sensations that feel so intensely unfamiliar and frightening.',
      jv: 'Pasti nggegirisi sanget nalika ngraosaken sensasi raga ingkang aneh lan damel kuwatir.',
      su: 'Pasti matak sieun pisan ngaraoskeun sensasi awak anu karasa anéh sareng pikahariwangeun.',
      ja: '身体の感覚が普段と異なり、とても恐ろしく不安に感じられていることとお察しします。',
      zh: '体验到身体如此陌生而令人恐慌的躯体感觉，必定令你感到极其害怕与焦虑。',
      es: 'Debe ser profundamente aterrador y angustiante experimentar sensaciones corporales tan extrañas y alarmantes.',
      ar: 'لا بد أن الشعور بأحاسيس جسدية غريبة ومقلقة إلى هذا الحد أمر مرعب للغاية.',
    },
    objectiveNeutrality: {
      id: 'Sensasi fisik yang intens sering kali merupakan manifestasi somatik dari kecemasan berat atau serangan panik. Sebagai AI, saya tidak dapat melakukan pemeriksaan medis. Bila kamu merasakan gejala fisik akut, pemeriksaan dokter medis langsung di Puskesmas atau rumah sakit adalah langkah yang aman.',
      en: 'Intense somatic sensations are often bodily manifestations of acute anxiety or panic. As an AI, I cannot perform medical diagnosis. If you have acute physical distress, an in-person evaluation by a physician at a local clinic is the safest path.',
      jv: 'Sensasi kasebut asring awujud tandha kuatir ingkang awrat. Minangka AI, kula mboten saged mriksa medis. Saenipun priksa dhateng dokter Puskesmas.',
      su: 'Sensasi ieu sering janten tanda kahariwang anu parah. Salaku AI simkuring teu tiasa mariksa sacara médis. Langkung saé konsultasi ka dokter Puskesmas.',
      ja: '激しい身体感覚は、重い不安やパニックの発作に伴う身体症状であることがよくあります。AIとして医学的診断は行えませんので、直接医師の診察を受けることが最も安全です。',
      zh: '强烈的躯体感受通常是极度焦虑或恐慌发作的身体投射。作为AI我无法进行医疗诊断，若有急性身体不适，就医由专业医生面诊是最安全的途径。',
      es: 'Las sensaciones físicas intensas suelen ser manifestaciones somáticas de ansiedad aguda. Como IA no puedo dar diagnósticos médicos; consultar a un médico en persona es lo más seguro.',
      ar: 'غالباً ما تكون الأحاسيس الجسدية الشديدة انعكاساً للقلق الحاد. كمساعد ذكاء اصطناعي، لا يمكنني تقديم تشخيص طبي، واستشارة طبيب هي الخطوة الأسلم.',
    },
    somatosensoryPivot: {
      id: 'Mari tenangkan detak jantung dan pernapasanmu terlebih dahulu dengan latihan grounding untuk meredakan gelombang panik tubuh.',
      en: 'Let us first steady your heart rate and respiration with a grounding exercise to ease the physical panic wave.',
      jv: 'Sumangga leremaken detak jantung lan ambekan rumiyin kanthi latihan grounding.',
      su: 'Hayu urang tengtremkeun ketug jajantung sareng ambekan heula ku latihan grounding.',
      ja: 'まずは身体のパニックの波を落ち着かせるため、グラウンディングで心拍と呼吸を整えましょう。',
      zh: '让我们先通过感官着陆练习平复心跳与呼吸，缓解身体的恐慌波澜。',
      es: 'Tranquilicemos primero tu ritmo cardíaco y respiración con un ejercicio de anclaje para calmar el pánico físico.',
      ar: 'دعنا نهدئ نبضات قلبك وتنفسك أولاً بتمرين التأريض لتخفيف نوبة الهلع الجسدية.',
    },
    suggestedRoute: '/grounding',
    suggestedRouteLabel: {
      id: 'Latihan Grounding Penenang',
      en: 'Calming Grounding Exercise',
      jv: 'Latihan Grounding Tentrem',
      su: 'Latihan Grounding Tenang',
      ja: '心を鎮めるグラウンディング',
      zh: '感官着陆平复练习',
      es: 'Ejercicio de Anclaje Calmante',
      ar: 'تمرين التأريض المهدئ',
    },
  },
};

// ─── Main Pattern Scanner ─────────────────────────────────────────────────────

/**
 * Scans an incoming message for paranoid, persecutory, grandiose, or somatic delusion themes.
 * If matched, generates a tri-phasic CBTp de-escalation protocol structure.
 */
export function detectDelusion(text: string): DelusionCheckResult {
  if (!text || typeof text !== 'string') {
    return { isDelusionDetected: false, theme: 'none', matchedKeywords: [] };
  }

  const normalized = text.toLowerCase().trim();
  const matchedKeywords: string[] = [];

  for (const [themeKey, patterns] of Object.entries(DELUSION_THEMES) as [keyof typeof DELUSION_THEMES, string[]][]) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern.toLowerCase())) {
        matchedKeywords.push(pattern);
      }
    }

    if (matchedKeywords.length > 0) {
      return {
        isDelusionDetected: true,
        theme: themeKey,
        matchedKeywords,
        cbtpResponse: CBTP_TEMPLATES[themeKey],
      };
    }
  }

  return {
    isDelusionDetected: false,
    theme: 'none',
    matchedKeywords: [],
  };
}

/**
 * Returns formatted localized CBTp response strings for a given language code.
 */
export function formatCbtpMessage(
  response: CbtpDeEscalationResponse,
  lang: string = 'id'
): { text: string; actionRoute: string; actionLabel: string } {
  const getLoc = (dict: Record<string, string>): string => dict[lang] || dict['id'] || Object.values(dict)[0];

  const validation = getLoc(response.emotionalValidation);
  const neutrality = getLoc(response.objectiveNeutrality);
  const pivot = getLoc(response.somatosensoryPivot);
  const label = getLoc(response.suggestedRouteLabel);

  const text = `${validation}\n\n${neutrality}\n\n${pivot}`;

  return {
    text,
    actionRoute: response.suggestedRoute,
    actionLabel: label,
  };
}
