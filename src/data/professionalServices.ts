export interface ProfessionalService {
  id: string;
  name: string;
  type: 'psikolog' | 'psikiater' | 'konselor' | 'lembaga';
  province: string;
  city: string;
  phone?: string;
  website?: string;
  online: boolean;
  bpjs: boolean;
  descriptionId: string;
  descriptionEn: string;
}

export const SERVICE_TYPES = [
  { id: 'all', labelId: 'Semua', labelEn: 'All' },
  { id: 'psikolog', labelId: 'Psikolog', labelEn: 'Psychologist' },
  { id: 'psikiater', labelId: 'Psikiater', labelEn: 'Psychiatrist' },
  { id: 'konselor', labelId: 'Konselor', labelEn: 'Counselor' },
  { id: 'lembaga', labelId: 'Lembaga/LSM', labelEn: 'Organization/NGO' },
] as const;

export const PROVINCES = [
  { id: 'all', label: 'Semua Provinsi' },
  { id: 'dki-jakarta', label: 'DKI Jakarta' },
  { id: 'jawa-barat', label: 'Jawa Barat' },
  { id: 'jawa-tengah', label: 'Jawa Tengah' },
  { id: 'jawa-timur', label: 'Jawa Timur' },
  { id: 'bali', label: 'Bali' },
  { id: 'yogyakarta', label: 'DI Yogyakarta' },
  { id: 'online', label: 'Online' },
] as const;

export const PROFESSIONAL_SERVICES: ProfessionalService[] = [
  // 1-4 Online Platforms
  {
    id: 's1',
    name: 'Halodoc',
    type: 'psikolog',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://www.halodoc.com',
    online: true,
    bpjs: false,
    descriptionId: 'Platform kesehatan online dengan layanan telekonsultasi psikolog klinis dan psikiater berlisensi.',
    descriptionEn: 'Online health platform with teleconsultation services from licensed clinical psychologists and psychiatrists.'
  },
  {
    id: 's2',
    name: 'Riliv',
    type: 'psikolog',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://riliv.co',
    online: true,
    bpjs: false,
    descriptionId: 'Aplikasi kesehatan mental dengan layanan konseling dan meditasi online dari psikolog profesional.',
    descriptionEn: 'Mental health app with online counseling and meditation services from professional psychologists.'
  },
  {
    id: 's3',
    name: 'Bicarakan.id',
    type: 'konselor',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://bicarakan.id',
    online: true,
    bpjs: false,
    descriptionId: 'Layanan konseling psikologis online dengan tarif terjangkau.',
    descriptionEn: 'Online psychological counseling services with affordable rates.'
  },
  {
    id: 's4',
    name: 'Into The Light Indonesia',
    type: 'lembaga',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://www.intothelightid.org',
    online: true,
    bpjs: false,
    descriptionId: 'Komunitas pendidik sebaya dan advokasi pencegahan bunuh diri berbasis bukti ilmiah di Indonesia.',
    descriptionEn: 'Peer educator community and evidence-based suicide prevention advocacy in Indonesia.'
  },

  // 5-10 RS Jiwa / RS dengan psikiatri
  {
    id: 's5',
    name: 'RS Jiwa Dr. Soeharto Heerdjan',
    type: 'psikiater',
    province: 'dki-jakarta',
    city: 'Jakarta Barat',
    phone: '021-5682841',
    website: 'http://www.rsjsh.co.id',
    online: false,
    bpjs: true,
    descriptionId: 'Rumah Sakit Jiwa milik pemerintah pusat dengan fasilitas lengkap dan melayani pasien BPJS.',
    descriptionEn: 'Central government-owned psychiatric hospital with complete facilities, accepting BPJS patients.'
  },
  {
    id: 's6',
    name: 'RS Jiwa Provinsi Jawa Barat',
    type: 'psikiater',
    province: 'jawa-barat',
    city: 'Bandung Barat',
    phone: '022-2700260',
    website: 'https://rsj.jabarprov.go.id',
    online: false,
    bpjs: true,
    descriptionId: 'Rumah sakit jiwa daerah Jawa Barat yang melayani rujukan psikiatri, psikologi, dan rehabilitasi.',
    descriptionEn: 'West Java regional psychiatric hospital serving psychiatric, psychological, and rehabilitation referrals.'
  },
  {
    id: 's7',
    name: 'RS Jiwa Menur',
    type: 'psikiater',
    province: 'jawa-timur',
    city: 'Surabaya',
    phone: '031-5020129',
    website: 'https://rsjmenur.jatimprov.go.id',
    online: false,
    bpjs: true,
    descriptionId: 'RS Jiwa rujukan utama di Jawa Timur, melayani rawat jalan dan inap, menerima BPJS.',
    descriptionEn: 'Main referral psychiatric hospital in East Java, serving outpatient and inpatient care, accepting BPJS.'
  },
  {
    id: 's8',
    name: 'RS Jiwa Grhasia',
    type: 'psikiater',
    province: 'yogyakarta',
    city: 'Sleman',
    phone: '0274-895143',
    website: 'https://grhasia.jogjaprov.go.id',
    online: true,
    bpjs: true,
    descriptionId: 'Layanan terpadu kesehatan jiwa milik Pemda DIY dengan program rehabilitasi komprehensif.',
    descriptionEn: 'Integrated mental health service owned by DIY local government with comprehensive rehabilitation programs.'
  },
  {
    id: 's9',
    name: 'RSJD Dr. Amino Gondohutomo',
    type: 'psikiater',
    province: 'jawa-tengah',
    city: 'Semarang',
    phone: '024-6722565',
    website: 'https://rs-amino.jatengprov.go.id',
    online: false,
    bpjs: true,
    descriptionId: 'Rumah Sakit Jiwa rujukan tipe A di Provinsi Jawa Tengah.',
    descriptionEn: 'Type A referral Psychiatric Hospital in Central Java Province.'
  },
  {
    id: 's10',
    name: 'RS Jiwa Provinsi Bali',
    type: 'psikiater',
    province: 'bali',
    city: 'Bangli',
    phone: '0366-91008',
    website: 'https://rsj.baliprov.go.id',
    online: false,
    bpjs: true,
    descriptionId: 'Pusat pelayanan rujukan psikiatri utama di Provinsi Bali dengan layanan gawat darurat psikiatrik.',
    descriptionEn: 'Main psychiatric referral service center in Bali Province with psychiatric emergency services.'
  },

  // 11-14 Puskesmas
  {
    id: 's11',
    name: 'Puskesmas Kecamatan Tebet',
    type: 'psikolog',
    province: 'dki-jakarta',
    city: 'Jakarta Selatan',
    phone: '021-8291500',
    online: false,
    bpjs: true,
    descriptionId: 'Puskesmas dengan layanan konseling psikologi dasar, ditanggung penuh oleh BPJS kesehatan.',
    descriptionEn: 'Community health center with basic psychological counseling services, fully covered by BPJS.'
  },
  {
    id: 's12',
    name: 'Puskesmas Duren Sawit',
    type: 'psikolog',
    province: 'dki-jakarta',
    city: 'Jakarta Timur',
    phone: '021-8628282',
    online: false,
    bpjs: true,
    descriptionId: 'Melayani konseling psikolog klinis tingkat pertama (Faskes 1).',
    descriptionEn: 'Serving primary clinical psychologist counseling (Level 1 Health Facility).'
  },
  {
    id: 's13',
    name: 'Puskesmas Mantrijeron',
    type: 'psikolog',
    province: 'yogyakarta',
    city: 'Yogyakarta',
    phone: '0274-386008',
    online: false,
    bpjs: true,
    descriptionId: 'Menyediakan layanan psikologi klinis di tingkat puskesmas daerah Yogyakarta.',
    descriptionEn: 'Provides clinical psychology services at the community health center level in Yogyakarta.'
  },
  {
    id: 's14',
    name: 'Puskesmas Garuda',
    type: 'psikolog',
    province: 'jawa-barat',
    city: 'Bandung',
    phone: '022-6011283',
    online: false,
    bpjs: true,
    descriptionId: 'Memiliki program kesehatan jiwa terpadu dan psikolog klinis untuk warga Bandung.',
    descriptionEn: 'Has integrated mental health programs and clinical psychologists for Bandung residents.'
  },

  // 15-18 Lembaga/LSM
  {
    id: 's15',
    name: 'Yayasan Pulih',
    type: 'lembaga',
    province: 'dki-jakarta',
    city: 'Jakarta Selatan',
    phone: '021-78842580',
    website: 'https://yayasanpulih.org',
    online: true,
    bpjs: false,
    descriptionId: 'Lembaga nirlaba yang berfokus pada layanan psikologis dan pemulihan trauma kekerasan.',
    descriptionEn: 'Non-profit organization focusing on psychological services and recovery from trauma of violence.'
  },
  {
    id: 's16',
    name: 'Yayasan Sejiwa',
    type: 'lembaga',
    province: 'dki-jakarta',
    city: 'Jakarta Selatan',
    phone: '021-7822363',
    website: 'https://sejiwa.org',
    online: true,
    bpjs: false,
    descriptionId: 'LSM yang berfokus pada pendidikan karakter, perlindungan anak, dan konseling keluarga.',
    descriptionEn: 'NGO focusing on character education, child protection, and family counseling.'
  },
  {
    id: 's17',
    name: 'Jangan Bunuh Diri',
    type: 'lembaga',
    province: 'online',
    city: 'Seluruh Indonesia',
    phone: '021-96969293',
    website: 'https://janganbunuhdiri.net',
    online: true,
    bpjs: false,
    descriptionId: 'Layanan email dan hotline darurat untuk bantuan pencegahan bunuh diri.',
    descriptionEn: 'Email and emergency hotline service for suicide prevention assistance.'
  },
  {
    id: 's18',
    name: 'Pijar Psikologi',
    type: 'lembaga',
    province: 'online',
    city: 'Yogyakarta',
    website: 'https://pijarpsikologi.org',
    online: true,
    bpjs: false,
    descriptionId: 'Organisasi advokasi kesehatan mental dan layanan konseling online gratis secara berkala.',
    descriptionEn: 'Mental health advocacy organization offering periodic free online counseling services.'
  },

  // 19-25 Praktik Psikolog / Platform lainnya
  {
    id: 's19',
    name: 'Kalm',
    type: 'psikolog',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://get-kalm.com',
    online: true,
    bpjs: false,
    descriptionId: 'Aplikasi konseling online dengan psikolog dan konselor tersertifikasi.',
    descriptionEn: 'Online counseling application with certified psychologists and counselors.'
  },
  {
    id: 's20',
    name: 'Ibunda.id',
    type: 'psikolog',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://www.ibunda.id',
    online: true,
    bpjs: false,
    descriptionId: 'Layanan curhat dan konseling psikologi online maupun tatap muka.',
    descriptionEn: 'Online and face-to-face psychological counseling and confiding services.'
  },
  {
    id: 's21',
    name: 'Klinik Terpadu Psikologi UI',
    type: 'psikolog',
    province: 'dki-jakarta',
    city: 'Depok',
    phone: '021-78881150',
    website: 'https://klinikterpadu.psikologi.ui.ac.id',
    online: true,
    bpjs: false,
    descriptionId: 'Klinik layanan psikologi di bawah naungan Fakultas Psikologi Universitas Indonesia.',
    descriptionEn: 'Psychological service clinic under the Faculty of Psychology, University of Indonesia.'
  },
  {
    id: 's22',
    name: 'Biro Psikologi Metafora',
    type: 'psikolog',
    province: 'yogyakarta',
    city: 'Sleman',
    phone: '0812-2578-1994',
    online: true,
    bpjs: false,
    descriptionId: 'Layanan asesmen, intervensi, dan konseling psikologi oleh psikolog klinis berlisensi.',
    descriptionEn: 'Assessment, intervention, and psychological counseling services by licensed clinical psychologists.'
  },
  {
    id: 's23',
    name: 'Biro Psikologi Persona',
    type: 'psikolog',
    province: 'jawa-timur',
    city: 'Surabaya',
    phone: '0812-1669-7991',
    online: true,
    bpjs: false,
    descriptionId: 'Menyediakan layanan konsultasi individu, pasangan, hingga anak-anak.',
    descriptionEn: 'Provides consultation services for individuals, couples, and children.'
  },
  {
    id: 's24',
    name: 'Satu Persen',
    type: 'psikolog',
    province: 'online',
    city: 'Seluruh Indonesia',
    website: 'https://satupersen.net',
    online: true,
    bpjs: false,
    descriptionId: 'Startup pendidikan hidup yang menyediakan webinar dan mentoring 1-on-1 dengan psikolog.',
    descriptionEn: 'Life school startup providing webinars and 1-on-1 mentoring with psychologists.'
  },
  {
    id: 's25',
    name: 'Rumah Sakit dr. Cipto Mangunkusumo (RSCM)',
    type: 'psikiater',
    province: 'dki-jakarta',
    city: 'Jakarta Pusat',
    phone: '021-1500135',
    website: 'https://rscm.co.id',
    online: false,
    bpjs: true,
    descriptionId: 'RS rujukan nasional yang memiliki Departemen Psikiatri terpadu, menerima pasien BPJS.',
    descriptionEn: 'National referral hospital with an integrated Psychiatry Department, accepting BPJS patients.'
  }
];
