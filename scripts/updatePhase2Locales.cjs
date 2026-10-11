const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

const translations = {
  id: {
    home: {
      actionAct: "Terapi ACT",
      actionRelapse: "Antisipasi Kambuh"
    },
    common: {
      saved: "Tersimpan otomatis"
    },
    jitai: {
      multimodal_title: "Korelasi Kurang Tidur & Ketegangan Pikiran",
      multimodal_desc: "Efisiensi tidurmu di bawah 70% berpadu dengan ketegangan emosi tinggi. Saat tubuh lelah, pikiran cenderung berputar cepat. Coba latihan defusi kognitif ACT untuk melepaskan jeratan pikiran.",
      action_act: "Buka Terapi ACT",
      badge_multimodal: "ACT & Sirkadian JITAI"
    },
    act: {
      title: "Terapi Keberterimaan & Komitmen (ACT)",
      subtitle: "Menemukan kompas nilai hidup bermakna dan membebaskan diri dari jeratan pikiran (Hayes et al.)",
      clinicalBadge: "Steven C. Hayes • Model Heksafleks Klinis",
      defusionBadge: "Defusi Kognitif & Aksi Berkomitmen",
      tabsAria: "Pilihan Modul Terapi ACT",
      tabs: {
        compass: "🧭 Kompas Nilai Hidup",
        leaves: "🍃 Daun di Aliran Sungai",
        noticing: "💬 Aku Menyadari Pikiran"
      },
      domains: {
        relationships: {
          title: "Hubungan & Koneksi",
          subtitle: "Keluarga, sahabat, pasangan, dan empati sosial"
        },
        growth: {
          title: "Pertumbuhan Diri",
          subtitle: "Pembelajaran, kebijaksanaan, dan keberanian batin"
        },
        health: {
          title: "Kesehatan & Vitalitas",
          subtitle: "Kebugaran fisik, ritme tidur, dan ketenangan jiwa"
        },
        work: {
          title: "Karya & Kontribusi",
          subtitle: "Pekerjaan, pelayanan, dan dampak bermakna bagi sesama"
        }
      },
      compass: {
        sectionLabel: "Eksplorasi Nilai Hidup & Tindakan Berkomitmen",
        introTitle: "Arah Kompas, Bukan Garis Akhir",
        introDesc: "Nilai hidup bukanlah tujuan (goals) yang bisa dicoret setelah selesai, melainkan arah mata angin kompas: cara Anda memilih bersikap dan menjalani hidup di setiap detik.",
        importanceSuffix: "Penting",
        importanceSliderLabel: "Tingkat Kepentingan Batin:",
        statementLabel: "Pernyataan Sikap Bermakna:"
      },
      actions: {
        sectionTitle: "Tindakan Berkomitmen (Committed Action)",
        sectionDesc: "Langkah nyata berukuran kecil yang Anda ambil hari ini selaras dengan nilai hidup yang Anda pilih.",
        selectDomain: "Pilih Domain",
        inputPlaceholder: "Tuliskan satu tindakan kecil hari ini...",
        btnAdd: "Tambah Aksi",
        emptyList: "Belum ada tindakan berkomitmen. Mulai dari satu hal kecil.",
        markDone: "Tandai selesai",
        markUndone: "Tandai belum selesai"
      },
      leaves: {
        sectionLabel: "Latihan Defusi: Daun di Aliran Sungai",
        title: "Daun di Aliran Sungai (Leaves on a Stream)",
        guideText: "Bayangkan Anda duduk di tepi sungai yang tenang dengan dedaunan yang hanyut mengalir. Ketika ada pikiran yang melelahkan atau mencemaskan, letakkan pikiran itu di atas daun, dan biarkan ia hanyut mengalir tanpa perlu Anda tahan atau usir.",
        inputPlaceholder: "Ketik pikiran yang sedang membebanimu... (misal: \"Aku takut gagal\")",
        btnRelease: "Letakkan di Daun & Hanyutkan",
        step1: "Pikiranmu telah diletakkan di atas daun... Bernapaslah perlahan.",
        step2: "Daun hanyut terbawa aliran arus air... Anda adalah sungainya, bukan daun itu.",
        step3: "Daun perlahan menjauh... Pikiran hanyalah peristiwa mental yang lewat.",
        reframedLabel: "Dibiarkan mengalir lewat di atas daun"
      },
      noticing: {
        sectionLabel: "Latihan Pelabelan Pikiran & Pengamat Berkesadaran",
        title: "Aku Menyadari Bahwa... (Defusi Bertingkat)",
        desc: "Mengurai fusi kognitif dengan 3 langkah pengamat berkesadaran (Self-as-Context) untuk meredakan cengkeraman emosional pikiran.",
        inputLabel: "Tuliskan Pikiran Otomatis yang Terasa Melekat:",
        inputPlaceholder: "Misal: \"Aku orang yang gagal\" atau \"Semuanya akan hancur\"",
        tier1Title: "Tahap 1: Fusi Kognitif (Pikiran = Fakta Nyata)",
        tier2Title: "Tahap 2: Menyadari Proses Berpikir",
        tier2Prefix: "Aku sedang memiliki pikiran bahwa",
        tier3Title: "Tahap 3: Pengamat Diri (Self-as-Context)",
        tier3Prefix: "Aku menyadari bahwa pikiranku sedang berkata bahwa",
        btnSave: "Simpan Perspektif Pengamat",
        savedToast: "Tersimpan ke Riwayat Defusi"
      },
      history: {
        title: "Riwayat Latihan Defusi Terakhir"
      }
    },
    relapse: {
      title: "Rencana Antisipasi Kambuh (Relapse Prevention)",
      subtitle: "Peta perlindungan diri dini berbasis Marlatt & Gordon: kenali tanda awal, de-eskalasi sebelum krisis, dan rangkul kemunduran dengan welas asih.",
      badgeMarlatt: "Model Kognitif-Perilaku Marlatt & Gordon",
      badgeAve: "Penawar Abstinence Violation Effect (AVE)",
      tabsAria: "Pilihan Bagian Rencana Antisipasi Kambuh",
      tabs: {
        warning: "⚠️ Tanda Peringatan Dini",
        deescalation: "🛡️ Strategi De-Eskalasi",
        compassion: "🌿 Welas Asih & Penawar AVE"
      },
      warning: {
        sectionLabel: "Pemetaan Tanda Peringatan Dini",
        introTitle: "Kenali Riak Sebelum Menjadi Gelombang",
        introDesc: "Kemunduran emosi jarang terjadi secara tiba-tiba. Biasanya diawali oleh riak-riak kecil pada perilaku, pikiran, emosi, atau sensasi fisik. Mengenalinya sejak awal memberi Anda waktu untuk jeda.",
        categoryLabel: "Kategori Tanda",
        cat_behavioral: "Perilaku (Kebiasaan)",
        cat_emotional: "Emosi & Suasana Hati",
        cat_cognitive: "Pola Pikir",
        cat_physical: "Sensasi Fisik & Tubuh",
        inputPlaceholder: "Tuliskan tanda peringatan dini baru...",
        btnAdd: "Tambah Tanda",
        emptyCat: "Belum ada catatan tanda di kategori ini."
      },
      deescalation: {
        introTitle: "Protokol De-Eskalasi 3 Lapis",
        introDesc: "Mulai dari tindakan mandiri paling cepat dan mudah (Level 1), jeda ruang dan sensorik (Level 2), hingga menghubungi jangkar kontak sosial dan layanan resmi (Level 3).",
        addTitle: "Tambah Strategi De-Eskalasi Pribadi",
        levelSelect: "Pilih Level",
        lvl1_title: "Level 1: Aksi Mandiri Cepat (Regulasi Somatik)",
        lvl1_desc: "Teknik regulasi mandiri instan seperti Cyclic Sighing, kompres air dingin/es, atau grounding 5-4-3-2-1.",
        lvl2_title: "Level 2: Jeda Ruang & Sensorik",
        lvl2_desc: "Menjauhkan diri dari pemicu eksternal, meredupkan lampu, mode senyap ponsel, dan berjalan hening.",
        lvl3_title: "Level 3: Dukungan Sosial & Darurat",
        lvl3_desc: "Menghubungi sahabat jangkar terpercaya atau layanan bantuan krisis kesehatan mental.",
        titlePlaceholder: "Nama aksi de-eskalasi (misal: Kompres air dingin)",
        descPlaceholder: "Detail panduan singkat cara melakukannya (opsional)...",
        btnAdd: "Simpan Strategi",
        actionsCount: "aksi"
      },
      contacts: {
        title: "Daftar Kontak Jangkar Terpercaya",
        namePlaceholder: "Nama orang/layanan",
        relPlaceholder: "Peran/Hubungan",
        phonePlaceholder: "Nomor telepon",
        btnAdd: "Tambah Kontak"
      },
      ave: {
        sectionLabel: "Welas Asih & Penawar Abstinence Violation Effect",
        title: "Mengatasi Abstinence Violation Effect (AVE)",
        body1: "Dalam riset Dr. Alan Marlatt, musuh terbesar pemulihan bukanlah kemunduran itu sendiri, melainkan \"Abstinence Violation Effect\" (AVE): rasa bersalah berlebih dan keyakinan hitam-putih bahwa satu hari buruk berarti semua usaha selama ini hancur.",
        formulaTitle: "Rumus Klinis Pemulihan:",
        formulaBody: "Kemunduran sesaat (Lapse) hanyalah sebuah slip kecil di jalan. Ia tidak otomatis menjadi kejatuhan total (Relapse), kecuali jika Anda menghakimi diri sendiri dan menyerah.",
        affirmationsTitle: "Jangkar Afirmasi Welas Asih Saat Terjadi Kemunduran:",
        notesLabel: "Pesan Welas Asih Pribadi untuk Diriku Saat Hari Terasa Berat:"
      },
      confirmReset: "Kembalikan rencana ke setelan awal bukti ilmiah?",
      btnReset: "Reset Rencana ke Default"
    }
  },

  en: {
    home: {
      actionAct: "ACT Therapy",
      actionRelapse: "Relapse Plan"
    },
    common: {
      saved: "Auto-saved"
    },
    jitai: {
      multimodal_title: "Sleep Debt & Mental Strain Correlation",
      multimodal_desc: "Sleep efficiency below 70% is coinciding with heightened emotional arousal. When tired, thoughts entangle easily. Try ACT cognitive defusion to untangle mind burdens.",
      action_act: "Open ACT Therapy",
      badge_multimodal: "ACT & Circadian JITAI"
    },
    act: {
      title: "Acceptance & Commitment Therapy (ACT)",
      subtitle: "Discover meaningful core values and unhook from sticky thoughts (Hayes et al.)",
      clinicalBadge: "Steven C. Hayes • Clinical Hexaflex Model",
      defusionBadge: "Cognitive Defusion & Committed Action",
      tabsAria: "ACT Therapy Module Selection",
      tabs: {
        compass: "🧭 Life Values Compass",
        leaves: "🍃 Leaves on a Stream",
        noticing: "💬 I Am Noticing Thoughts"
      },
      domains: {
        relationships: {
          title: "Relationships & Connection",
          subtitle: "Family, friendships, partners, and social empathy"
        },
        growth: {
          title: "Personal Growth",
          subtitle: "Lifelong learning, wisdom, and inner courage"
        },
        health: {
          title: "Health & Vitality",
          subtitle: "Physical fitness, sleep rhythm, and soul peace"
        },
        work: {
          title: "Work & Contribution",
          subtitle: "Craft, vocation, service, and meaningful contribution"
        }
      },
      compass: {
        sectionLabel: "Values Clarification & Committed Actions",
        introTitle: "A Compass Direction, Not a Finish Line",
        introDesc: "Values are not goals to check off and finish, but directional compass headings: how you choose to stand and live every waking moment.",
        importanceSuffix: "Important",
        importanceSliderLabel: "Inner Importance Level:",
        statementLabel: "Meaningful Value Statement:"
      },
      actions: {
        sectionTitle: "Committed Action",
        sectionDesc: "Small tangible steps you take today aligned with your chosen values.",
        selectDomain: "Select Domain",
        inputPlaceholder: "Write one small committed action today...",
        btnAdd: "Add Action",
        emptyList: "No committed actions yet. Start with one small step.",
        markDone: "Mark as completed",
        markUndone: "Mark as incomplete"
      },
      leaves: {
        sectionLabel: "Defusion Exercise: Leaves on a Stream",
        title: "Leaves on a Stream",
        guideText: "Picture sitting beside a gentle stream with leaves floating past. When a heavy or distressing thought arises, place it gently on a leaf and let it drift downstream without holding or chasing it.",
        inputPlaceholder: "Type the thought that is weighing on you... (e.g., \"I am afraid of failing\")",
        btnRelease: "Place on Leaf & Let Float",
        step1: "Your thought is placed on the leaf... Breathe gently.",
        step2: "The leaf drifts along the flowing water... You are the river, not the leaf.",
        step3: "The leaf drifts out of sight... Thoughts are transient mental events.",
        reframedLabel: "Allowed to float gently on a leaf"
      },
      noticing: {
        sectionLabel: "Thought Labeling & Self-as-Context Exercise",
        title: "I Am Noticing That... (Tiered Defusion)",
        desc: "Uncouple cognitive fusion in 3 progressive steps to dissolve the emotional grip of sticky thoughts.",
        inputLabel: "Type the Automatic Sticky Thought:",
        inputPlaceholder: "e.g., \"I am a failure\" or \"Everything will collapse\"",
        tier1Title: "Stage 1: Cognitive Fusion (Thought = Absolute Fact)",
        tier2Title: "Stage 2: Noticing the Thought Process",
        tier2Prefix: "I am having the thought that",
        tier3Title: "Stage 3: Self-as-Context Observer",
        tier3Prefix: "I notice that my mind is telling me that",
        btnSave: "Save Observer Perspective",
        savedToast: "Saved to Defusion History"
      },
      history: {
        title: "Recent Defusion Sessions"
      }
    },
    relapse: {
      title: "Relapse Prevention Plan",
      subtitle: "Marlatt & Gordon cognitive-behavioral roadmap: detect early signs, de-escalate early, and embrace setbacks with self-compassion.",
      badgeMarlatt: "Marlatt & Gordon Cognitive-Behavioral Model",
      badgeAve: "Abstinence Violation Effect (AVE) Antidote",
      tabsAria: "Relapse Prevention Plan Sections",
      tabs: {
        warning: "⚠️ Early Warning Signs",
        deescalation: "🛡️ De-Escalation Plan",
        compassion: "🌿 Self-Compassion & AVE"
      },
      warning: {
        sectionLabel: "Early Warning Signs Mapping",
        introTitle: "Spot the Ripples Before the Wave",
        introDesc: "Emotional setbacks rarely occur out of nowhere. They begin as subtle ripples in behavior, thoughts, emotions, or bodily sensations. Catching them early gives you space to pause.",
        categoryLabel: "Sign Category",
        cat_behavioral: "Behavioral (Habits)",
        cat_emotional: "Emotions & Mood",
        cat_cognitive: "Cognitive Patterns",
        cat_physical: "Physical Sensations",
        inputPlaceholder: "Write a new early warning sign...",
        btnAdd: "Add Sign",
        emptyCat: "No warning signs in this category yet."
      },
      deescalation: {
        introTitle: "3-Tier De-Escalation Protocol",
        introDesc: "Start with fastest self-regulation (Level 1), sensory & space reset (Level 2), and reach out to anchor contacts or hotlines (Level 3).",
        addTitle: "Add Custom De-Escalation Strategy",
        levelSelect: "Choose Level",
        lvl1_title: "Level 1: Fast Self-Action (Somatic Reset)",
        lvl1_desc: "Instant solo somatic resets such as Cyclic Sighing, ice/cold water splash, or 5-4-3-2-1 grounding.",
        lvl2_title: "Level 2: Space & Sensory Pause",
        lvl2_desc: "Stepping away from triggers, dimming lights, phone quiet mode, and silent mindful walking.",
        lvl3_title: "Level 3: Social & Crisis Anchors",
        lvl3_desc: "Reaching out to trusted friends or certified crisis mental health hotlines.",
        titlePlaceholder: "Strategy name (e.g., Cold water splash)",
        descPlaceholder: "Brief guidance on how to perform it (optional)...",
        btnAdd: "Save Strategy",
        actionsCount: "actions"
      },
      contacts: {
        title: "Trusted Anchor Contacts",
        namePlaceholder: "Person or hotline name",
        relPlaceholder: "Role or relationship",
        phonePlaceholder: "Phone number",
        btnAdd: "Add Contact"
      },
      ave: {
        sectionLabel: "Self-Compassion & AVE Antidote",
        title: "Overcoming the Abstinence Violation Effect (AVE)",
        body1: "In Dr. Alan Marlatt's clinical research, the biggest threat to recovery is not the slip itself, but the Abstinence Violation Effect (AVE): toxic guilt and all-or-nothing thinking assuming that one bad day undoes all past progress.",
        formulaTitle: "Clinical Recovery Formula:",
        formulaBody: "A momentary lapse is simply a minor detour on the road. It does not become a full relapse unless you judge yourself harshly and give up.",
        affirmationsTitle: "Compassionate Anchor Affirmations During Setbacks:",
        notesLabel: "Personal Compassion Message to Myself for Tough Days:"
      },
      confirmReset: "Reset relapse prevention plan back to evidence-based defaults?",
      btnReset: "Reset Plan to Default"
    }
  },

  jv: {
    home: {
      actionAct: "Terapi ACT",
      actionRelapse: "Nulak Kambuh"
    },
    common: {
      saved: "Kasinpen otomatis"
    },
    jitai: {
      multimodal_title: "Gandhengan Kurang Turu & Beban Pikiran",
      multimodal_desc: "Efisiensi turu ing sangisore 70% bebarengan karo ketegangan emosi dhuwur. Nalika awak sayah, pikiran gampang mbulet. Coba latihan defusi kognitif ACT kanggo ngudhari beban batin.",
      action_act: "Bukak Terapi ACT",
      badge_multimodal: "ACT & Sirkadian JITAI"
    },
    act: {
      title: "Terapi Keberterimaan & Komitmen (ACT)",
      subtitle: "Nemokake kompas nilai urip bermakna lan ngudhari talining pikiran (Hayes et al.)",
      clinicalBadge: "Steven C. Hayes • Model Heksafleks Klinis",
      defusionBadge: "Defusi Kognitif & Tumindak Nyata",
      tabsAria: "Pilihan Modul Terapi ACT",
      tabs: {
        compass: "🧭 Kompas Nilai Urip",
        leaves: "🍃 Godhong ing Ilining Kali",
        noticing: "💬 Aku Niteni Pikiran"
      },
      domains: {
        relationships: {
          title: "Paseduluran & Sesambungan",
          subtitle: "Kulawarga, kanca, pasangan, lan tepa slira"
        },
        growth: {
          title: "Ngrembakane Dhiri",
          subtitle: "Sinau, kawicaksanan, lan kekendelan batin"
        },
        health: {
          title: "Kasarasan & Daya Urip",
          subtitle: "Kasarasan raga, tata turu, lan katentreman jiwa"
        },
        work: {
          title: "Karya & Labuh Labet",
          subtitle: "Pakaryan, leladi, lan mupangat tumrap liyan"
        }
      },
      compass: {
        sectionLabel: "Nliti Nilai Urip & Tumindak Berkomitmen",
        introTitle: "Kiblat Kompas, Dudu Garis Pungkasan",
        introDesc: "Nilai urip dudu gegayuhan sing dicoret yen wis rampung, nanging kiblat pituduh dalan: kepriye anggonmu milih tumindak lan ngugemi urip ing saben wektu.",
        importanceSuffix: "Wigati",
        importanceSliderLabel: "Tataran Wigatine Batin:",
        statementLabel: "Pratelan Nilai Bermakna:"
      },
      actions: {
        sectionTitle: "Tumindak Berkomitmen (Committed Action)",
        sectionDesc: "Langkah nyata cilik sing kok tindakake dina iki jumbuh karo nilai urip pilihanmu.",
        selectDomain: "Pilih Domain",
        inputPlaceholder: "Tulisna sak tindakan cilik dina iki...",
        btnAdd: "Tambah Tindakan",
        emptyList: "Durung ana tindakan berkomitmen. Wiwiti saka bab cilik.",
        markDone: "Tandhani rampung",
        markUndone: "Tandhani durung rampung"
      },
      leaves: {
        sectionLabel: "Gladhen Defusi: Godhong ing Ilining Kali",
        title: "Godhong ing Ilining Kali (Leaves on a Stream)",
        guideText: "Bayangna sliramu lungguh ing pinggir kali sing ayem karo godhong-godhong sing keli. Nalika ana pikiran abot utawa sumelang, tumpangna ing godhong mau, lan jarne keli mili tanpa kok gandholi utawa kok tundhung.",
        inputPlaceholder: "Tulis pikiran sing lagi ngeboti sliramu... (tuladha: \"Aku wedi gagal\")",
        btnRelease: "Tumpangna ing Godhong & Jarne Mili",
        step1: "Pikiranmu wis ditumpangake ing godhong... Ambegan alon-alon.",
        step2: "Godhong keli katut banyu mili... Sliramu kuwi kaline, dudu godhonge.",
        step3: "Godhong sansaya adoh... Pikiran mung lelakon batin sawatara.",
        reframedLabel: "Dilarung mili ing sadhuwure godhong"
      },
      noticing: {
        sectionLabel: "Gladhen Niteni Pikiran & Pandeleng Batin",
        title: "Aku Niteni Yen... (Defusi Bertingkat)",
        desc: "Ngudhari belitan pikiran nganggo 3 tataran pengamat berkesadaran kanggo ngendhokke cekelan emosi.",
        inputLabel: "Tulis Pikiran Otomatis sing Nemplek:",
        inputPlaceholder: "Tuladha: \"Aku iki wong gagal\" utawa \"Kabeh bakal bubrah\"",
        tier1Title: "Tataran 1: Belitan Pikiran (Pikiran = Kasunyatan)",
        tier2Title: "Tataran 2: Niteni Lakuning Pikiran",
        tier2Prefix: "Aku lagi duwe pikiran yen",
        tier3Title: "Tataran 3: Pandeleng Batin (Self-as-Context)",
        tier3Prefix: "Aku niteni yen pikiranku lagi kandha yen",
        btnSave: "Simpen Pamawas Pengamat",
        savedToast: "Kasinpen ing Riwayat Defusi"
      },
      history: {
        title: "Riwayat Gladhen Defusi Pungkasan"
      }
    },
    relapse: {
      title: "Rencana Nulak Kambuh (Relapse Prevention)",
      subtitle: "Pituduh pangayoman dhiri adhedhasar Marlatt & Gordon: titenana tandha wiwitan, leremna sadurunge krisis, lan rangkul kemunduran kanthi asih.",
      badgeMarlatt: "Model Kognitif-Prilaku Marlatt & Gordon",
      badgeAve: "Tombo Abstinence Violation Effect (AVE)",
      tabsAria: "Pilihan Bagian Rencana Nulak Kambuh",
      tabs: {
        warning: "⚠️ Tandha Pèngetan Dini",
        deescalation: "🛡️ Rencana Nglerepake",
        compassion: "🌿 Welas Asih & Tombo AVE"
      },
      warning: {
        sectionLabel: "Peta Tandha Pèngetan Dini",
        introTitle: "Titenana Ombak Cilik Sadurunge dadi Prahara",
        introDesc: "Kemunduran emosi arang kedadeyan ujug-ujug. Biasane diwiwiti saka riak cilik ing solah bawa, pikiran, emosi, utawa raga. Niteni luwih dhisik menehi wektu kanggo lerem.",
        categoryLabel: "Kategori Tandha",
        cat_behavioral: "Solah Bawa (Pakulinan)",
        cat_emotional: "Rasa & Emosi",
        cat_cognitive: "Pola Pikir",
        cat_physical: "Kahanan Raga",
        inputPlaceholder: "Tulis tandha pèngetan anyar...",
        btnAdd: "Tambah Tandha",
        emptyCat: "Durung ana cathetan tandha ing kategori iki."
      },
      deescalation: {
        introTitle: "Tata Cara Nglerepake 3 Tataran",
        introDesc: "Wiwiti saka tumindak mandiri sing cepet (Tataran 1), leren sensorik & papan (Tataran 2), nganti kontak paseduluran lan layanan resmi (Tataran 3).",
        addTitle: "Tambah Strategi Nglerepake Dhiri",
        levelSelect: "Pilih Tataran",
        lvl1_title: "Tataran 1: Tindakan Cepet Mandiri (Somatik)",
        lvl1_desc: "Cara ngleremake dhiri cepet kayata Cyclic Sighing, kompres banyu anyep, utawa grounding 5-4-3-2-1.",
        lvl2_title: "Tataran 2: Leren Sensorik & Ruang Ayem",
        lvl2_desc: "Nyingkrih saka pamicu, ngedhunake lampu, mode meneng ponsel, lan mlaku hening.",
        lvl3_title: "Tataran 3: Panjurung Paseduluran & Darurat",
        lvl3_desc: "Hubungi kanca cedhak utawa layanan darurat kasarasan mental resmi.",
        titlePlaceholder: "Jeneng tindakan (tuladha: Kompres banyu anyep)",
        descPlaceholder: "Katrangan cekak carane nindakake (ora wajib)...",
        btnAdd: "Simpen Tindakan",
        actionsCount: "tindakan"
      },
      contacts: {
        title: "Daftar Kontak Sambungan Batin",
        namePlaceholder: "Jeneng wong utawa layanan",
        relPlaceholder: "Sesambungan / Peran",
        phonePlaceholder: "Nomer telpon",
        btnAdd: "Tambah Kontak"
      },
      ave: {
        sectionLabel: "Welas Asih & Tombo AVE",
        title: "Ngadhepi Abstinence Violation Effect (AVE)",
        body1: "Miturut riset Dr. Alan Marlatt, mungsuh paling gedhe ing pamulihan dudu mlesete emosi, nanging rasa salah keluwih-luwih (AVE) sing nganggep sedina ala ngrusak kabeh perjuangan sing wis lumaku.",
        formulaTitle: "Paugeran Pamulihan:",
        formulaBody: "Klesete emosi sawatara (Lapse) mung belokan cilik ing dalan. Ora ateges ambruk babar pisan (Relapse), kajaba yen sliramu ngadili awakmu dhewe lan nyerah.",
        affirmationsTitle: "Piweling Welas Asih Nalika Nglakoni Kemunduran:",
        notesLabel: "Pesen Welas Asih Kanggo Awakku Nalika Dina Krasa Abot:"
      },
      confirmReset: "Balekake rencana marang setelan baku ilmiah?",
      btnReset: "Reset Rencana marang Baku"
    }
  },

  su: {
    home: {
      actionAct: "Terapi ACT",
      actionRelapse: "Nolak Kambuh"
    },
    common: {
      saved: "Kasimpen otomatis"
    },
    jitai: {
      multimodal_title: "Korelasina Kurang Sare & Beungbeurat Pikiran",
      multimodal_desc: "Efisiensi sare di handapeun 70% marengan tegangan emosi anu luhur. Sabot awak cape, pikiran gampang meulit. Cobi latihan defusi kognitif ACT pikeun ngaleupaskeun beungbeurat pikiran.",
      action_act: "Buka Terapi ACT",
      badge_multimodal: "ACT & Sirkadian JITAI"
    },
    act: {
      title: "Terapi Katampi & Komitmen (ACT)",
      subtitle: "Mendakan kompas ajén hirup anu ngandung harti sarta ngudar beungkeutan pikiran (Hayes et al.)",
      clinicalBadge: "Steven C. Hayes • Modél Heksafleks Klinis",
      defusionBadge: "Defusi Kognitif & Lampah Berkomitmen",
      tabsAria: "Pilihan Modul Terapi ACT",
      tabs: {
        compass: "🧭 Kompas Ajén Hirup",
        leaves: "🍃 Daun dina Palidna Walungan",
        noticing: "💬 Kuring Sadar kana Pikiran"
      },
      domains: {
        relationships: {
          title: "Silaturahmi & Hubungan",
          subtitle: "Kulawarga, réréncangan, pasangan, sareng empati sosial"
        },
        growth: {
          title: "Kamekaran Diri",
          subtitle: "Diajar, kawicaksanan, sareng katikahan batin"
        },
        health: {
          title: "Kaséhatan & Vitalitas",
          subtitle: "Kasegaran raga, pola sare, sareng katengtreman jiwa"
        },
        work: {
          title: "Karya & Kontribusi",
          subtitle: "Padamelan, pangabdian, sareng mangpaat pikeun sasama"
        }
      },
      compass: {
        sectionLabel: "Mendakan Ajén Hirup & Lampah Berkomitmen",
        introTitle: "Kiblat Kompas, Sanés Garis Pungkasan",
        introDesc: "Ajén hirup sanés tujuan anu tiasa dicorét saatos réngsé, nanging kiblat pituduh: kumaha anjeun milih lampah sareng ngajalankeun hirup dina unggal detik.",
        importanceSuffix: "Penting",
        importanceSliderLabel: "Tingkat Kapentingan Batin:",
        statementLabel: "Pernyataan Ajén anu Ngandung Harti:"
      },
      actions: {
        sectionTitle: "Lampah Berkomitmen (Committed Action)",
        sectionDesc: "Léngkah nyata leutik anu anjeun laksanakeun dinten ieu saluyu sareng ajén hirup anjeun.",
        selectDomain: "Pilih Widang",
        inputPlaceholder: "Tulis hiji lampah leutik dinten ieu...",
        btnAdd: "Tambah Lampah",
        emptyList: "Teu acan aya lampah berkomitmen. Mimitian tina hal leutik.",
        markDone: "Tandaan réngsé",
        markUndone: "Tandaan teu acan réngsé"
      },
      leaves: {
        sectionLabel: "Latihan Defusi: Daun dina Palidna Walungan",
        title: "Daun dina Palidna Walungan (Leaves on a Stream)",
        guideText: "Bayangkeun anjeun calik di sisi walungan anu tenang kalayan dangdaunan anu palid ngalir. Nalika aya pikiran anu beurat atanapi salempang, témpélkeun kana daun, sareng antepkeun palid tanpa dicekel atanapi diusir.",
        inputPlaceholder: "Ketik pikiran anu nuju ngabeungbeuratan... (contona: \"Kuring sieun gagal\")",
        btnRelease: "Témpélkeun kana Daun & Palidkeun",
        step1: "Pikiran anjeun parantos ditindihkeun dina daun... Tarik napas lalaunan.",
        step2: "Daun palid kabawa ku cai... Anjeun walunganna, sanés daunna.",
        step3: "Daun beuki tebih... Pikiran mung saukur kajadian batin samentawis.",
        reframedLabel: "Dipalidkeun lalaunan dina daun"
      },
      noticing: {
        sectionLabel: "Latihan Nyirian Pikiran & Panitén Batin",
        title: "Kuring Sadar Yén... (Defusi Bertingkat)",
        desc: "Ngudar beungkeutan pikiran ku 3 léngkah panitén berkesadaran pikeun ngaleupaskeun cekelan émosi.",
        inputLabel: "Tulis Pikiran Otomatis anu Nempel:",
        inputPlaceholder: "Contona: \"Kuring jalma gagal\" atanapi \"Sadayana bakal ancur\"",
        tier1Title: "Tahap 1: Fusi Kognitif (Pikiran = Bukti Nyata)",
        tier2Title: "Tahap 2: Nyadar kana Prosés Mikir",
        tier2Prefix: "Kuring nuju gaduh pikiran yén",
        tier3Title: "Tahap 3: Panitén Diri (Self-as-Context)",
        tier3Prefix: "Kuring sadar yén pikiran kuring nuju nyarios yén",
        btnSave: "Simpen Pamadegan Panitén",
        savedToast: "Kasimpen kana Sajarah Defusi"
      },
      history: {
        title: "Sajarah Latihan Defusi Pamungkas"
      }
    },
    relapse: {
      title: "Rencana Nolak Kambuh (Relapse Prevention)",
      subtitle: "Pituduh pangraksa diri dumasar Marlatt & Gordon: kenal tanda mimiti, de-eskalasi sateuacan krisis, sareng rangkul kalepasan ku welas asih.",
      badgeMarlatt: "Modél Kognitif-Paripolah Marlatt & Gordon",
      badgeAve: "Ubar Abstinence Violation Effect (AVE)",
      tabsAria: "Pilihan Bagian Rencana Nolak Kambuh",
      tabs: {
        warning: "⚠️ Tanda Pépéling Awal",
        deescalation: "🛡️ Rencana De-Eskalasi",
        compassion: "🌿 Welas Asih & Ubar AVE"
      },
      warning: {
        sectionLabel: "Pametaan Tanda Pépéling Awal",
        introTitle: "Kenal Riak Sateuacan Janten Ombak",
        introDesc: "Kemunduran émosi jarang kajantenan ngadadak. Biasana dikawitan ku riak alit dina paripolah, pikiran, émosi, atanapi rasa raga. Mikawanoh langkung awal masihan waktos pikeun ngareureuh.",
        categoryLabel: "Kategori Tanda",
        cat_behavioral: "Paripolah (Kabiasaan)",
        cat_emotional: "Rasa & Émosi",
        cat_cognitive: "Pola Pikir",
        cat_physical: "Kayaan Raga",
        inputPlaceholder: "Tulis tanda pépéling anyar...",
        btnAdd: "Tambah Tanda",
        emptyCat: "Teu acan aya catetan tanda dina kategori ieu."
      },
      deescalation: {
        introTitle: "Protokol De-Eskalasi 3 Lapis",
        introDesc: "Kawitan tina lampah mandiri anu gancang (Lapis 1), istirahat rohangan & sénsorik (Lapis 2), dugi ka kontak sobat sareng bantosan resmi (Lapis 3).",
        addTitle: "Tambah Stratégi De-Eskalasi Pribadi",
        levelSelect: "Pilih Lapis",
        lvl1_title: "Lapis 1: Lampah Gancang Mandiri (Somatik)",
        lvl1_desc: "Téhnik rélaxasi mandiri instan sapertos Cyclic Sighing, kompres cai tiis, atanapi grounding 5-4-3-2-1.",
        lvl2_title: "Lapis 2: Istirahat Rohangan & Sénsorik",
        lvl2_desc: "Ngajauhan pemicu, ngaredupkeun lampu, mode jempé ponsel, sareng leumpang hening.",
        lvl3_title: "Lapis 3: Pangrojong Sobat & Darurat",
        lvl3_desc: "Ngahubungan réréncangan caket atanapi saluran darurat kaséhatan méntal resmi.",
        titlePlaceholder: "Nami lampah (contona: Kompres cai tiis)",
        descPlaceholder: "Pituduh singget cara ngalaksanakeunana (opsional)...",
        btnAdd: "Simpen Stratégi",
        actionsCount: "lampah"
      },
      contacts: {
        title: "Daptar Kontak Sobat Satia",
        namePlaceholder: "Nami jalmi atanapi layanan",
        relPlaceholder: "Peran / Hubungan",
        phonePlaceholder: "Nomer telepon",
        btnAdd: "Tambah Kontak"
      },
      ave: {
        sectionLabel: "Welas Asih & Ubar AVE",
        title: "Nyanghareupan Abstinence Violation Effect (AVE)",
        body1: "Dina panalungtikan Dr. Alan Marlatt, musuh pangbadagna sanés mlesétna émosi, tapi rasa lepat anu kaleuleuwihan (AVE) anu nganggap sadinten awon ngancurkeun sadaya usaha anu parantos lumangsung.",
        formulaTitle: "Rumus Pulih:",
        formulaBody: "Kemunduran samentawis (Lapse) mung méngkol sakedik dina jalan. Henteu otomatis janten ragrag total (Relapse), iwal lamun anjeun ngahukum diri sorangan sarta serah bongkokan.",
        affirmationsTitle: "Pépéling Welas Asih Sabot Ngalaman Kemunduran:",
        notesLabel: "Pesen Welas Asih Pribadi Pikeun Diri Sabot Poé Karasa Beurat:"
      },
      confirmReset: "Mulangkeun rencana kana setélan dasar ilmiah?",
      btnReset: "Reset Rencana kana Standar"
    }
  },

  ja: {
    home: {
      actionAct: "ACT療法",
      actionRelapse: "再発予防"
    },
    common: {
      saved: "自動保存済み"
    },
    jitai: {
      multimodal_title: "睡眠不足と精神的負担の相関",
      multimodal_desc: "睡眠効率が70％を下回り、感情的な高まりと重なっています。疲弊していると、思考にとらわれやすくなります。ACT脱フュージョンを試して心の重荷をほどきましょう。",
      action_act: "ACT療法を開く",
      badge_multimodal: "ACT & 概日JITAI"
    },
    act: {
      title: "アクセプタンス＆コミットメント・セラピー (ACT)",
      subtitle: "意味ある人生の価値という羅針盤を見出し、絡みつく思考から自由になる (Hayes et al.)",
      clinicalBadge: "スティーブン・C・ヘイズ博士 • ヘキサフレックス臨床モデル",
      defusionBadge: "認知的脱フュージョン＆コミットされた行動",
      tabsAria: "ACT療法モジュール選択",
      tabs: {
        compass: "🧭 人生の価値の羅針盤",
        leaves: "🍃 小川のせせらぎと木の葉",
        noticing: "💬 思考に気づく自己"
      },
      domains: {
        relationships: {
          title: "人間関係とつながり",
          subtitle: "家族、友人、パートナー、他者への共感"
        },
        growth: {
          title: "自己成長と探求",
          subtitle: "生涯学習、心の知恵、内なる勇気"
        },
        health: {
          title: "健康と活力",
          subtitle: "身体の健康、睡眠リズム、心の平穏"
        },
        work: {
          title: "仕事と社会貢献",
          subtitle: "職業、奉仕、他者への意義ある貢献"
        }
      },
      compass: {
        sectionLabel: "価値の明確化とコミットされた行動",
        introTitle: "終着点ではなく、羅針盤が指す方角",
        introDesc: "価値とは達成して消し去る目標ではなく、どの瞬間も自分がどうあり、どう生きるかを選ぶ羅針盤の方角です。",
        importanceSuffix: "重要",
        importanceSliderLabel: "内なる重要度レベル:",
        statementLabel: "心に響く価値の言明:"
      },
      actions: {
        sectionTitle: "コミットされた行動 (Committed Action)",
        sectionDesc: "選択した価値観に沿って、今日踏み出す小さな具体的な一歩。",
        selectDomain: "領域を選択",
        inputPlaceholder: "今日取り組む小さな行動を1つ書く...",
        btnAdd: "行動を追加",
        emptyList: "まだ行動がありません。小さな一歩から始めましょう。",
        markDone: "完了とする",
        markUndone: "未完了に戻す"
      },
      leaves: {
        sectionLabel: "脱フュージョン演習: 小川のせせらぎの木の葉",
        title: "小川のせせらぎの木の葉 (Leaves on a Stream)",
        guideText: "穏やかな小川の岸辺に座り、葉が流れていく光景を思い浮かべてください。重苦しい思考や不安が浮かんだら、葉の上に静かに乗せ、握りしめたり追い払ったりせずそのまま流しましょう。",
        inputPlaceholder: "心に重くのしかかっている思考を入力... (例：「失敗するのが怖い」)",
        btnRelease: "木の葉に乗せて流す",
        step1: "思考が木の葉に乗せられました... ゆっくり呼吸してください。",
        step2: "木の葉は川の流れに乗って進みます... あなたは川であり、木の葉そのものではありません。",
        step3: "木の葉が遠ざかっていきます... 思考はただ通り過ぎる心のできごとです。",
        reframedLabel: "木の葉に乗せて静かに流した思考"
      },
      noticing: {
        sectionLabel: "思考のラベリングと文脈としての自己演習",
        title: "私は〜という思考に気づいている (段階的脱フュージョン)",
        desc: "3段階の気づきのステップで認知的フュージョンを解き、感情的な囚われを和らげます。",
        inputLabel: "頭にこびりつく自動思考を入力:",
        inputPlaceholder: "例：「私は無力だ」「すべてが台無しになる」",
        tier1Title: "第1段階: 認知的フュージョン (思考＝絶対的事実)",
        tier2Title: "第2段階: 思考のプロセスに気づく",
        tier2Prefix: "私は〜という思考を抱いている",
        tier3Title: "第3段階: 観察する自己 (Self-as-Context)",
        tier3Prefix: "私は、自分の心が〜と言っていることに気づいている",
        btnSave: "観察者の視点を保存",
        savedToast: "脱フュージョン履歴に保存されました"
      },
      history: {
        title: "最近の脱フュージョン演習履歴"
      }
    },
    relapse: {
      title: "再発予防計画 (Relapse Prevention)",
      subtitle: "マーラット＆ゴードンの認知行動モデル: 初期の兆候を察知し、危機を事前に鎮め、自己への慈悲で後退を受け止める。",
      badgeMarlatt: "マーラット＆ゴードン認知行動再発予防モデル",
      badgeAve: "禁断違反効果 (AVE) 特効薬",
      tabsAria: "再発予防計画セクションの選択",
      tabs: {
        warning: "⚠️ 早期警戒サイン",
        deescalation: "🛡️ 段階的沈静化戦略",
        compassion: "🌿 セルフ・コンパッション & AVE"
      },
      warning: {
        sectionLabel: "早期警戒サインのマッピング",
        introTitle: "大波になる前のさざ波に気づく",
        introDesc: "感情的な後退が突然起こることは稀です。行動、思考、感情、身体感覚の小さなさざ波から始まります。早期に気づくことで、立ち止まる余裕が生まれます。",
        categoryLabel: "サインの区分",
        cat_behavioral: "行動 (日々の習慣)",
        cat_emotional: "感情・気分",
        cat_cognitive: "思考パターン",
        cat_physical: "身体感覚",
        inputPlaceholder: "新しい早期サインを入力...",
        btnAdd: "サインを追加",
        emptyCat: "この区分のサインはまだありません。"
      },
      deescalation: {
        introTitle: "3層の沈静化プロトコル",
        introDesc: "迅速なセルフケア (レベル1) から感覚と環境のリセット (レベル2)、支えとなる相談先への連絡 (レベル3) へと進めます。",
        addTitle: "独自の沈静化戦略を追加",
        levelSelect: "レベルを選択",
        lvl1_title: "レベル1: 迅速な単独行動 (身体的リセット)",
        lvl1_desc: "サイクリック・サイイング、冷水洗顔、5-4-3-2-1グラウンディングなどの即座のリセット法。",
        lvl2_title: "レベル2: 空間と感覚の休息",
        lvl2_desc: "刺激から距離を置き、照明を落とし、通知を消し、静かに歩いて感覚を取り戻す。",
        lvl3_title: "レベル3: 人とのつながりと相談",
        lvl3_desc: "信頼できる友人に話しかけるか、公式のメンタルヘルス支援窓口へ相談する。",
        titlePlaceholder: "対策名 (例: 冷水で顔を洗う)",
        descPlaceholder: "実施方法の簡単なメモ (任意)...",
        btnAdd: "戦略を保存",
        actionsCount: "個の対策"
      },
      contacts: {
        title: "信頼できる心の支え・相談先",
        namePlaceholder: "氏名または機関名",
        relPlaceholder: "役割・関係",
        phonePlaceholder: "電話番号",
        btnAdd: "連絡先を追加"
      },
      ave: {
        sectionLabel: "セルフ・コンパッションとAVE特効薬",
        title: "禁断違反効果 (AVE) を乗り越える",
        body1: "アラン・マーラット博士の臨床研究によると、回復への最大の脅威は後退そのものではなく、「禁断違反効果 (AVE)」です。つまり、1回のつまずきで過去の努力が全否定されたと思い込む極端な自責の念です。",
        formulaTitle: "回復の臨床公式:",
        formulaBody: "一時的なスリップ (Lapse) は道中の小さな曲がり角にすぎません。自己批判に囚われて諦めない限り、完全な崩壊 (Relapse) には至りません。",
        affirmationsTitle: "後退したときに自分を支える慈悲のアファメーション:",
        notesLabel: "辛い日に自分へ贈る温かい慈悲のメッセージ:"
      },
      confirmReset: "再発予防計画をエビデンスに基づく初期設定に戻しますか？",
      btnReset: "計画を初期状態にリセット"
    }
  },

  zh: {
    home: {
      actionAct: "接纳承诺疗法",
      actionRelapse: "预防复发"
    },
    common: {
      saved: "已自动保存"
    },
    jitai: {
      multimodal_title: "睡眠不足与精神负荷关联",
      multimodal_desc: "睡眠效率低于70%并伴有较高的情绪唤醒。当身体疲惫时，思绪容易缠绕。尝试ACT认知解离练习来松开思维的枷锁。",
      action_act: "打开ACT疗法",
      badge_multimodal: "ACT与昼夜节律JITAI"
    },
    act: {
      title: "接纳承诺疗法 (ACT)",
      subtitle: "寻找有意义的人生价值罗盘，从纠缠的思绪中解脱 (Hayes et al.)",
      clinicalBadge: "Steven C. Hayes博士 • 临床六边形模型",
      defusionBadge: "认知解离与承诺行动",
      tabsAria: "ACT疗法模块选择",
      tabs: {
        compass: "🧭 人生价值罗盘",
        leaves: "🍃 溪流上的落叶",
        noticing: "💬 觉察内在念头"
      },
      domains: {
        relationships: {
          title: "人际与连接",
          subtitle: "家庭、朋友、伴侣与社会共情"
        },
        growth: {
          title: "个人成长",
          subtitle: "终身学习、智慧与内在勇气"
        },
        health: {
          title: "健康与活力",
          subtitle: "身体机能、睡眠节律与内心宁静"
        },
        work: {
          title: "工作与奉献",
          subtitle: "事业、服务与对社会的有益贡献"
        }
      },
      compass: {
        sectionLabel: "价值澄清与承诺行动",
        introTitle: "罗盘的方向，而非终点线",
        introDesc: "人生价值不是完成后勾选掉的目标，而是罗盘的指向：你在每一个当下选择以何种姿态立足与生活。",
        importanceSuffix: "重要",
        importanceSliderLabel: "内在重要性等级:",
        statementLabel: "有意义的价值观表述:"
      },
      actions: {
        sectionTitle: "承诺行动 (Committed Action)",
        sectionDesc: "今天依据你所选的价值取向，迈出切实微小的具体一步。",
        selectDomain: "选择领域",
        inputPlaceholder: "写下一项今天践行的小行动...",
        btnAdd: "添加行动",
        emptyList: "尚无承诺行动。从一件微小的事开始。",
        markDone: "标记为已完成",
        markUndone: "标记为未完成"
      },
      leaves: {
        sectionLabel: "认知解离练习: 溪流上的落叶",
        title: "溪流上的落叶 (Leaves on a Stream)",
        guideText: "想象你正坐在静谧的溪流旁，树叶顺流而下。当沉重或焦虑的念头浮现时，轻轻将它放在一片落叶上，任其随水流远去，无需紧抓，也无需驱赶。",
        inputPlaceholder: "输入此刻困扰着你的思绪... (例如: \"我害怕失败\")",
        btnRelease: "放上落叶任其飘流",
        step1: "你的念头已安放于落叶之上... 请缓慢呼吸。",
        step2: "落叶随着清澈的流水缓缓前行... 你是溪流，而非那片落叶。",
        step3: "落叶渐行渐远... 念头只是暂时掠过的心理事件。",
        reframedLabel: "已置于落叶上随溪水飘走"
      },
      noticing: {
        sectionLabel: "念头标注与情境自我觉察练习",
        title: "我觉察到... (分级认知解离)",
        desc: "通过3个觉察步骤瓦解认知融合，缓解沉重思绪的情感紧缚。",
        inputLabel: "写下缠绕在脑海的自动念头:",
        inputPlaceholder: "例如: \"我是个失败者\" 或 \"一切都完蛋了\"",
        tier1Title: "阶段1: 认知融合 (念头 = 绝对事实)",
        tier2Title: "阶段2: 觉察思考的过程",
        tier2Prefix: "我正产生一个念头，认为",
        tier3Title: "阶段3: 观察者自我 (Self-as-Context)",
        tier3Prefix: "我觉察到我的大脑正在告诉我",
        btnSave: "保存观察者视角",
        savedToast: "已保存至解离记录"
      },
      history: {
        title: "近期认知解离记录"
      }
    },
    relapse: {
      title: "预防复发计划 (Relapse Prevention)",
      subtitle: "基于Marlatt & Gordon认知行为模型: 早期识别征兆，危机前降温降级，并以自我关怀接纳挫折。",
      badgeMarlatt: "Marlatt & Gordon认知行为复发预防模型",
      badgeAve: "破戒效应 (AVE) 解药",
      tabsAria: "预防复发计划板块选择",
      tabs: {
        warning: "⚠️ 早期预警征兆",
        deescalation: "🛡️ 分级降级策略",
        compassion: "🌿 自我关怀与破戒解药"
      },
      warning: {
        sectionLabel: "早期预警征兆梳理",
        introTitle: "在浪涛成型前觉察涟漪",
        introDesc: "情绪低谷极少突然降临，往往始于行为、思维、情绪或身体感觉上的细微涟漪。尽早觉察能为你赢得驻足喘息的空间。",
        categoryLabel: "征兆类别",
        cat_behavioral: "行为习惯",
        cat_emotional: "情绪与心境",
        cat_cognitive: "思维模式",
        cat_physical: "身体感受",
        inputPlaceholder: "写下一项新的早期预警征兆...",
        btnAdd: "添加征兆",
        emptyCat: "该类别下暂无征兆记录。"
      },
      deescalation: {
        introTitle: "3级分层降温降级方案",
        introDesc: "从快捷的自主调节 (第1级)，到空间与感官休整 (第2级)，再到联络安全支持者与专业热线 (第3级)。",
        addTitle: "添加个性化降温策略",
        levelSelect: "选择层级",
        lvl1_title: "第1级: 快速自主行动 (躯体调节)",
        lvl1_desc: "循环叹息呼吸法、冷水洗脸或5-4-3-2-1感官着陆等即时调节法。",
        lvl2_title: "第2级: 空间与感官休息",
        lvl2_desc: "远离诱因环境、调暗灯光、手机静音及静心散步。",
        lvl3_title: "第3级: 社交支持与紧急联络",
        lvl3_desc: "联系值得信赖的亲友或拨打官方心理危机援助专线。",
        titlePlaceholder: "策略名称 (如: 冷水轻敷面部)",
        descPlaceholder: "简短的操作指引 (选填)...",
        btnAdd: "保存策略",
        actionsCount: "项策略"
      },
      contacts: {
        title: "值得信赖的安全支持联络人",
        namePlaceholder: "姓名或求助机构名称",
        relPlaceholder: "身份与关系",
        phonePlaceholder: "电话号码",
        btnAdd: "添加联络人"
      },
      ave: {
        sectionLabel: "自我关怀与破戒效应解药",
        title: "破除破戒效应 (Abstinence Violation Effect)",
        body1: "在Alan Marlatt博士的研究中，康复的最大阻碍并非滑步本身，而是\"破戒效应\"(AVE): 极度的自责与非黑即白的思维，认定一天的糟糕状态抹杀了过去所有的努力。",
        formulaTitle: "临床康复法则:",
        formulaBody: "暂时的失足滑步 (Lapse) 只是道路上的小小拐角，绝非彻底崩溃 (Relapse)，除非你苛刻批判自己并彻底放弃。",
        affirmationsTitle: "遭遇挫折时的自我关怀锚定肯定语:",
        notesLabel: "写给艰难时刻中自己的温暖关怀寄语:"
      },
      confirmReset: "是否将预防复发计划重置为实证标准设置？",
      btnReset: "重置计划至初始默认"
    }
  },

  es: {
    home: {
      actionAct: "Terapia ACT",
      actionRelapse: "Prevenir Recaídas"
    },
    common: {
      saved: "Guardado automáticamente"
    },
    jitai: {
      multimodal_title: "Correlación entre Sueño Escaso y Tensión Mental",
      multimodal_desc: "Tu eficiencia de sueño está por debajo del 70% combinada con alta activación emocional. Con cansancio, los pensamientos se enredan más. Prueba la defusión cognitiva ACT.",
      action_act: "Abrir Terapia ACT",
      badge_multimodal: "ACT y Circadiano JITAI"
    },
    act: {
      title: "Terapia de Aceptación y Compromiso (ACT)",
      subtitle: "Descubre la brújula de tus valores y libérate de pensamientos enredados (Hayes et al.)",
      clinicalBadge: "Steven C. Hayes • Modelo Clínico Hexaflex",
      defusionBadge: "Defusión Cognitiva y Acción Comprometida",
      tabsAria: "Selección de Módulos de Terapia ACT",
      tabs: {
        compass: "🧭 Brújula de Valores",
        leaves: "🍃 Hojas en el Arroyo",
        noticing: "💬 Notando Mis Pensamientos"
      },
      domains: {
        relationships: {
          title: "Relaciones y Conexión",
          subtitle: "Familia, amistades, pareja y empatía social"
        },
        growth: {
          title: "Crecimiento Personal",
          subtitle: "Aprendizaje, sabiduría y valentía interior"
        },
        health: {
          title: "Salud y Vitalidad",
          subtitle: "Bienestar físico, ritmo del sueño y serenidad"
        },
        work: {
          title: "Trabajo y Contribución",
          subtitle: "Oficio, vocación, servicio e impacto positivo"
        }
      },
      compass: {
        sectionLabel: "Clarificación de Valores y Acción Comprometida",
        introTitle: "Un Rumbo de Brújula, No una Meta Final",
        introDesc: "Los valores no son metas que tachas al terminar, sino rumbos en la brújula: cómo decides vivir y actuar en cada instante.",
        importanceSuffix: "Importante",
        importanceSliderLabel: "Nivel de Importancia Interior:",
        statementLabel: "Declaración de Valor Significativo:"
      },
      actions: {
        sectionTitle: "Acción Comprometida (Committed Action)",
        sectionDesc: "Pasos tangibles y pequeños que das hoy en armonía con tus valores.",
        selectDomain: "Seleccionar Dominio",
        inputPlaceholder: "Escribe una pequeña acción comprometida hoy...",
        btnAdd: "Añadir Acción",
        emptyList: "Aún no hay acciones comprometidas. Comienza por algo pequeño.",
        markDone: "Marcar como completado",
        markUndone: "Marcar como incompleto"
      },
      leaves: {
        sectionLabel: "Ejercicio de Defusión: Hojas en el Arroyo",
        title: "Hojas en el Arroyo (Leaves on a Stream)",
        guideText: "Imagínate sentado junto a un arroyo tranquilo donde flotan hojas. Cuando surja un pensamiento difícil o ansioso, colócalo sobre una hoja y déjalo correr sin retenerlo ni alejarlo.",
        inputPlaceholder: "Escribe el pensamiento que te pesa... (ej., \"Tengo miedo de fallar\")",
        btnRelease: "Colocar en la Hoja y Dejar Flotar",
        step1: "Tu pensamiento reposa en la hoja... Respira despacio.",
        step2: "La hoja avanza con la corriente... Tú eres el arroyo, no la hoja.",
        step3: "La hoja se aleja gradualmente... Los pensamientos son solo eventos mentales pasajeros.",
        reframedLabel: "Dejado fluir con calma sobre la hoja"
      },
      noticing: {
        sectionLabel: "Ejercicio de Etiquetado y Yo-como-Contexto",
        title: "Me Doy Cuenta de Que... (Defusión Escalonada)",
        desc: "Desactiva la fusión cognitiva en 3 pasos de observación para calmar la presión emocional.",
        inputLabel: "Escribe el Pensamiento Automático Difícil:",
        inputPlaceholder: "Ejemplo: \"Soy un fracaso\" o \"Todo va a salir mal\"",
        tier1Title: "Etapa 1: Fusión Cognitiva (Pensamiento = Verdad Absoluta)",
        tier2Title: "Etapa 2: Notar el Proceso de Pensar",
        tier2Prefix: "Estoy teniendo el pensamiento de que",
        tier3Title: "Etapa 3: Yo Observador (Self-as-Context)",
        tier3Prefix: "Me doy cuenta de que mi mente me está diciendo que",
        btnSave: "Guardar Perspectiva de Observador",
        savedToast: "Guardado en el historial de defusión"
      },
      history: {
        title: "Historial Reciente de Defusión"
      }
    },
    relapse: {
      title: "Plan de Prevención de Recaídas",
      subtitle: "Modelo cognitivo-conductual de Marlatt & Gordon: detecta señales tempranas, desescala a tiempo y abraza los retrocesos con compasión.",
      badgeMarlatt: "Modelo Cognitivo-Conductual de Marlatt & Gordon",
      badgeAve: "Antídoto contra el Efecto de Violación de la Abstinencia (AVE)",
      tabsAria: "Secciones del Plan de Prevención de Recaídas",
      tabs: {
        warning: "⚠️ Señales de Alerta Temprana",
        deescalation: "🛡️ Plan de Desescalada",
        compassion: "🌿 Autocompasión y AVE"
      },
      warning: {
        sectionLabel: "Mapeo de Señales de Alerta Temprana",
        introTitle: "Detecta las Olas Pequeñas Antes de la Tormenta",
        introDesc: "Las recaídas emocionales casi nunca surgen de la nada. Comienzan con pequeños cambios en conductas, pensamientos, emociones o el cuerpo. Notarlos pronto te brinda espacio para pausar.",
        categoryLabel: "Categoría de Señal",
        cat_behavioral: "Conductual (Hábitos)",
        cat_emotional: "Emociones y Estado de Ánimo",
        cat_cognitive: "Patrones de Pensamiento",
        cat_physical: "Sensaciones Físicas",
        inputPlaceholder: "Escribe una nueva señal de alerta...",
        btnAdd: "Añadir Señal",
        emptyCat: "No hay señales en esta categoría todavía."
      },
      deescalation: {
        introTitle: "Protocolo de Desescalada en 3 Niveles",
        introDesc: "Comienza con autorregulación rápida (Nivel 1), pausa ambiental y sensorial (Nivel 2) y apoyo social o líneas de crisis (Nivel 3).",
        addTitle: "Añadir Estrategia de Desescalada Personal",
        levelSelect: "Elegir Nivel",
        lvl1_title: "Nivel 1: Acción Rápida Individual (Somática)",
        lvl1_desc: "Reseteos somáticos rápidos como suspiro cíclico, agua fría en el rostro o anclaje 5-4-3-2-1.",
        lvl2_title: "Nivel 2: Pausa Espacial y Sensorial",
        lvl2_desc: "Alejarse de detonantes, atenuar luces, modo silencio en el móvil y caminar con atención plena.",
        lvl3_title: "Nivel 3: Anclas Sociales y de Emergencia",
        lvl3_desc: "Contactar a un amigo de confianza o a líneas oficiales de ayuda psicológica.",
        titlePlaceholder: "Nombre de la estrategia (ej., Agua fría en la cara)",
        descPlaceholder: "Breve orientación sobre cómo realizarla (opcional)...",
        btnAdd: "Guardar Estrategia",
        actionsCount: "estrategias"
      },
      contacts: {
        title: "Contactos de Apoyo y Seguridad",
        namePlaceholder: "Nombre de persona o servicio",
        relPlaceholder: "Rol o relación",
        phonePlaceholder: "Teléfono",
        btnAdd: "Añadir Contacto"
      },
      ave: {
        sectionLabel: "Autocompasión y Antídoto contra AVE",
        title: "Superar el Efecto de Violación de la Abstinencia (AVE)",
        body1: "En la investigación clínica del Dr. Alan Marlatt, la mayor amenaza en la recuperación no es el desliz en sí, sino el AVE: la culpa tóxica y el pensamiento de todo o nada que asume que un mal día arruina todo el progreso previo.",
        formulaTitle: "Fórmula Clínica de Recuperación:",
        formulaBody: "Un tropiezo momentáneo (Lapse) es solo un desvío menor en el camino. No se convierte en recaída total (Relapse) a menos que te juzgues con dureza y te rindas.",
        affirmationsTitle: "Afirmaciones de Autocompasión Ante un Tropiezo:",
        notesLabel: "Mensaje de Autocompasión para Mí Mismo en Días Difíciles:"
      },
      confirmReset: "¿Restablecer el plan a la configuración estándar basada en evidencia?",
      btnReset: "Restablecer Plan a Valores Iniciales"
    }
  },

  ar: {
    home: {
      actionAct: "علاج القبول والالتزام",
      actionRelapse: "خطة منع الانتكاس"
    },
    common: {
      saved: "تم الحفظ تلقائيًا"
    },
    jitai: {
      multimodal_title: "ارتباط قلة النوم بالضغط النفسي",
      multimodal_desc: "كفاءة نومك أقل من 70% وتتزامن مع استثارة انفعالية عالية. عندما يكون الجسد متعبًا، تتشابك الأفكار بسهولة. جرب تمارين فك الارتباط المعرفي في علاج القبول والالتزام.",
      action_act: "فتح علاج القبول والالتزام",
      badge_multimodal: "القبول والالتزام واليقظة التكيفية"
    },
    act: {
      title: "علاج القبول والالتزام (ACT)",
      subtitle: "اكتشف بوصلة قيم حياتك ذات المعنى وتحرر من شباك الأفكار المربكة (Hayes et al.)",
      clinicalBadge: "د. ستيفن سي هايز • النموذج السداسي الإكلينيكي",
      defusionBadge: "فك الارتباط المعرفي والعمل الملتزم",
      tabsAria: "خيارات وحدات علاج القبول والالتزام",
      tabs: {
        compass: "🧭 بوصلة قيم الحياة",
        leaves: "🍃 أوراق على مجرى النهر",
        noticing: "💬 إدراك وملاحظة الأفكار"
      },
      domains: {
        relationships: {
          title: "العلاقات والتواصل",
          subtitle: "العائلة، الأصدقاء، الشريك والتعاطف الاجتماعي"
        },
        growth: {
          title: "النمو الشخصي",
          subtitle: "التعلم المستمر، الحكمة والشجاعة الباطنية"
        },
        health: {
          title: "الصحة والحيوية",
          subtitle: "اللياقة البدنية، إيقاع النوم والسكينة النفسية"
        },
        work: {
          title: "العمل والعطاء",
          subtitle: "المهنة، الخدمة والأثر الإيجابي في المجتمع"
        }
      },
      compass: {
        sectionLabel: "استكشاف القيم والعمل الملتزم",
        introTitle: "اتجاه بوصلة، وليس خط نهاية",
        introDesc: "قيم الحياة ليست أهدافًا تشطبها عند الانتهاء، بل هي اتجاه بوصلة يحدد كيف تختار أن تقف وتحيا في كل لحظة.",
        importanceSuffix: "مهم",
        importanceSliderLabel: "مستوى الأهمية الداخلية:",
        statementLabel: "عبارة القيمة المعنوية:"
      },
      actions: {
        sectionTitle: "العمل الملتزم (Committed Action)",
        sectionDesc: "خطوة ملموسة وصغيرة تتخذها اليوم متوافقة مع قيمك المختارة.",
        selectDomain: "اختر المجال",
        inputPlaceholder: "اكتب خطوة ملتزمة صغيرة اليوم...",
        btnAdd: "إضافة خطوة",
        emptyList: "لا توجد خطوات ملتزمة بعد. ابدأ بخطوة صغيرة.",
        markDone: "تحديد كمكتمل",
        markUndone: "تحديد كغير مكتمل"
      },
      leaves: {
        sectionLabel: "تمرين فك الارتباط: أوراق على مجرى النهر",
        title: "أوراق على مجرى النهر (Leaves on a Stream)",
        guideText: "تخيل أنك تجلس بجانب نهر هادئ تطفو فوقه أوراق الشجر. كلما راودتك فكرة مرهقة أو مقلقة، ضعها برفق فوق ورقة شجر ودعها تطفو وتبتعد دون التمسك بها أو محاربتها.",
        inputPlaceholder: "اكتب الفكرة التي تثقل كاهلك... (مثال: \"أخشى الفشل\")",
        btnRelease: "وضعها على الورقة ودعها تطفو",
        step1: "تم وضع فكرتك على ورقة الشجر... تنفس ببطء.",
        step2: "الورقة تنجرف مع تيار الماء... أنت النهر ولست الورقة.",
        step3: "الورقة تبتعد رويدًا رويدًا... الأفكار مجرد أحداث عقلية عابرة.",
        reframedLabel: "تُركت تطفو بهدوء فوق الورقة"
      },
      noticing: {
        sectionLabel: "تمرين تسمية الأفكار والذات كسياق",
        title: "أنا أدرك أن... (فك الارتباط المتدرج)",
        desc: "تفكيك الاندماج المعرفي عبر 3 خطوات واعية لتخفيف القبضة العاطفية للأفكار.",
        inputLabel: "اكتب الفكرة التلقائية العالقة:",
        inputPlaceholder: "مثال: \"أنا شخص فاشل\" أو \"كل شيء سينهار\"",
        tier1Title: "المرحلة 1: الاندماج المعرفي (الفكرة = حقيقة مطلقة)",
        tier2Title: "المرحلة 2: إدراك عملية التفكير",
        tier2Prefix: "تراودني الآن فكرة مفادها أن",
        tier3Title: "المرحلة 3: الذات الملاحظة (Self-as-Context)",
        tier3Prefix: "أنا أدرك أن عقلي يخبرني بأنني",
        btnSave: "حفظ منظور المراقب الواعي",
        savedToast: "تم الحفظ في سجل فك الارتباط"
      },
      history: {
        title: "سجل تمارين فك الارتباط الأخيرة"
      }
    },
    relapse: {
      title: "خطة منع الانتكاس (Relapse Prevention)",
      subtitle: "خارطة طريق مارلات وغوردون السلوكية المعرفية: رصد العلامات المبكرة، التهدئة قبل الأزمة، واحتضان العثرات بالتعاطف الذاتي.",
      badgeMarlatt: "نموذج مارلات وغوردون لمنع الانتكاس",
      badgeAve: "ترياق تأثير انتهاك الامتناع (AVE)",
      tabsAria: "أقسام خطة منع الانتكاس",
      tabs: {
        warning: "⚠️ علامات الإنذار المبكر",
        deescalation: "🛡️ استراتيجية التهدئة",
        compassion: "🌿 التعاطف الذاتي وترياق الانتكاس"
      },
      warning: {
        sectionLabel: "تحديد علامات الإنذار المبكر",
        introTitle: "انتبه للموجات الصغيرة قبل اشتداد العاصفة",
        introDesc: "الانتكاس العاطفي نادرًا ما يحدث فجأة. بل يبدأ بتموجات خفية في السلوك أو الأفكار أو العواطف أو أحاسيس الجسد. ملاحظتها باكرًا تمنحك وقتًا للتريث.",
        categoryLabel: "فئة العلامة",
        cat_behavioral: "السلوك والعادات",
        cat_emotional: "المشاعر والحالة المزاجية",
        cat_cognitive: "أنماط التفكير",
        cat_physical: "أحاسيس الجسد",
        inputPlaceholder: "اكتب علامة إنذار مبكر جديدة...",
        btnAdd: "إضافة علامة",
        emptyCat: "لا توجد علامات مسجلة في هذه الفئة بعد."
      },
      deescalation: {
        introTitle: "بروتوكول التهدئة متدرج المستويات",
        introDesc: "ابدأ بالتنظيم الذاتي الفوري (المستوى 1)، ثم الاستراحة المكانية والحسية (المستوى 2)، وصولاً إلى جهات الدعم والطوارئ (المستوى 3).",
        addTitle: "إضافة استراتيجية تهدئة مخصصة",
        levelSelect: "اختر المستوى",
        lvl1_title: "المستوى 1: التدخل الذاتي السريع (الجسدي)",
        lvl1_desc: "تقنيات التهدئة الفورية مثل التنهد الدوري، كمادات الماء البارد، أو تمرين التأريض 5-4-3-2-1.",
        lvl2_title: "المستوى 2: الاستراحة المكانية والحسية",
        lvl2_desc: "الابتعاد عن المثيرات، خفت الإضاءة، كتم صوت الهاتف، والمشي الهادئ بوعي.",
        lvl3_title: "المستوى 3: شبكة الأمان والتواصل الطارئ",
        lvl3_desc: "التواصل مع صديق موثوق أو الاتصال بالخطوط الرسمية المعتمدة للمساعدة النفسية.",
        titlePlaceholder: "اسم الاستراتيجية (مثال: غسل الوجه بالماء البارد)",
        descPlaceholder: "إرشادات موجزة لطريقة التطبيق (اختياري)...",
        btnAdd: "حفظ الاستراتيجية",
        actionsCount: "إجراءات"
      },
      contacts: {
        title: "جهات الاتصال الموثوقة للدعم",
        namePlaceholder: "اسم الشخص أو الجهة الداعمة",
        relPlaceholder: "الصفة أو صلة القرابة",
        phonePlaceholder: "رقم الهاتف",
        btnAdd: "إضافة جهة اتصال"
      },
      ave: {
        sectionLabel: "التعاطف الذاتي وترياق الانتكاس",
        title: "تجاوز تأثير انتهاك الامتناع (AVE)",
        body1: "في أبحاث د. آلان مارلات، الخطر الأكبر على التعافي ليس العثرة ذاتها، بل تأثير انتهاك الامتناع (AVE): اللوم القاسي والتفكير الحدي الذي يعتبر يومًا سيئًا واحدًا بمثابة ضياع لكل الجهود السابقة.",
        formulaTitle: "قاعدة التعافي الإكلينيكية:",
        formulaBody: "العثرة المؤقتة (Lapse) مجرد منعطف صغير في الطريق، ولا تتحول إلى انتكاس كامل (Relapse) إلا إذا حكمت على نفسك بقسوة واستسلمت.",
        affirmationsTitle: "عبارات تعاطف ذاتي داعمة عند حدوث عثرة:",
        notesLabel: "رسالة تعاطف شخصية لنفسي في الأيام العصيبة:"
      },
      confirmReset: "هل ترغب في استعادة خطة منع الانتكاس إلى إعداداتها العلمية الافتراضية؟",
      btnReset: "إعادة ضبط الخطة للافتراضي"
    }
  }
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

const languages = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'];

for (const lang of languages) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  const langTranslations = translations[lang];
  if (!langTranslations) {
    console.error(`Missing translations for ${lang}`);
    process.exit(1);
  }

  deepMerge(json, langTranslations);

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated ${lang}.json`);
}

console.log('All 8 locales updated successfully.');
