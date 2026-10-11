import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WarningSignCategory,
  WarningSignItem,
  DeEscalationLevel,
  DeEscalationStrategyItem,
  SupportiveContactItem,
  RelapsePreventionPlan,
} from '../types/relapse';
import { generateId } from '../utils/helpers';
import { rimaAsyncStorage } from '../utils/indexedDb';

export interface RelapseStoreState {
  plan: RelapsePreventionPlan;

  addWarningSign: (category: WarningSignCategory, text: string) => void;
  removeWarningSign: (id: string) => void;

  addStrategy: (level: DeEscalationLevel, title: string, description?: string) => void;
  removeStrategy: (id: string) => void;

  addSupportContact: (name: string, relationship: string, phone?: string) => void;
  removeSupportContact: (id: string) => void;

  updateSelfCompassionNotes: (notes: string) => void;
  resetPlanToDefault: () => void;
}

export const DEFAULT_WARNING_SIGNS: WarningSignItem[] = [
  {
    id: 'ws-1',
    category: 'behavioral',
    text: 'Menarik diri dan membalas pesan orang terdekat semakin lambat / enggan berinteraksi',
  },
  {
    id: 'ws-2',
    category: 'behavioral',
    text: 'Jadwal tidur mulai berantakan dan menatap layar larut malam tanpa tujuan',
  },
  {
    id: 'ws-3',
    category: 'emotional',
    text: 'Sensasi iritabel, mudah tersinggung oleh hal-hal sepele, atau rasa hampa',
  },
  {
    id: 'ws-4',
    category: 'cognitive',
    text: 'Muncul pikiran bahwa usaha pemulihan selama ini sia-sia (All-or-Nothing thinking)',
  },
  {
    id: 'ws-5',
    category: 'physical',
    text: 'Otot bahu tegang konstan, rahang mengatup kencang, atau nafas terasa pendek',
  },
];

export const DEFAULT_STRATEGIES: DeEscalationStrategyItem[] = [
  {
    id: 'strat-1',
    level: 1,
    title: 'Pernapasan Hembusan Panjang (Cyclic Sighing 3 Menit)',
    description: 'Tarik napas ganda lewat hidung dan buang napas panjang lewat mulut untuk meredakan saraf simpatis.',
  },
  {
    id: 'strat-2',
    level: 1,
    title: 'Stimulasi Sensorik Dingin (TIPP Ice/Water Reset)',
    description: 'Basuh wajah dengan air dingin atau genggam es batu selama 30 detik untuk mengaktifkan refleks selam mamalia.',
  },
  {
    id: 'strat-3',
    level: 2,
    title: 'Jeda Digital & Sensorik Minimalis 60 Menit',
    description: 'Nyalakan mode hening/pesawat pada ponsel, redupkan lampu kamar, dan dengarkan white/brown noise.',
  },
  {
    id: 'strat-4',
    level: 2,
    title: 'Langkah Kaki Penuh Kesadaran (Mindful Walk)',
    description: 'Jalan santai keluar rumah 15 menit tanpa mendengarkan audio, fokus pada sentuhan telapak kaki ke tanah.',
  },
  {
    id: 'strat-5',
    level: 3,
    title: 'Hubungi Kontak Jangkar Pendukung',
    description: 'Kirim pesan atau telepon sahabat terpercaya dengan kalimat singkat: "Aku sedang butuh teman mengobrol sejenak."',
  },
];

export const DEFAULT_SUPPORT_CONTACTS: SupportiveContactItem[] = [
  {
    id: 'contact-1',
    name: 'Sahabat Dekat / Keluarga Terpercaya',
    relationship: 'Teman Bicara Tanpa Penghakiman',
    phone: '',
  },
  {
    id: 'contact-2',
    name: 'Layanan Darurat Krisis Kemenkes',
    relationship: 'Saluran Bantuan Resmi 24 Jam',
    phone: '119 ext 8',
  },
];

export const DEFAULT_AVE_AFFIRMATIONS: string[] = [
  'Kemunduran sesaat (lapse) adalah belokan di jalan pemulihan, bukan akhir dari perjalanan (relapse).',
  'Satu hari yang berat tidak menghapus kemajuan berminggu-minggu yang telah berhasil kamu bangun.',
  'Pemulihan kesehatan mental tidak berjalan linier; bersikaplah lembut terhadap diri sendiri sebagaimana kamu menyayangi sahabat.',
  'Saat terjatuh, kamu tidak kembali ke titik nol; kamu bangkit kembali membawa pembelajaran dan ketahanan baru.',
];

export const DEFAULT_RELAPSE_PLAN: RelapsePreventionPlan = {
  id: 'relapse-plan-default',
  warningSigns: DEFAULT_WARNING_SIGNS,
  strategies: DEFAULT_STRATEGIES,
  supportContacts: DEFAULT_SUPPORT_CONTACTS,
  aveAffirmations: DEFAULT_AVE_AFFIRMATIONS,
  selfCompassionNotes:
    'Ketika emosiku terasa kembali mundur, aku berhak bernapas sejenak. Aku mengakui bahwa aku sedang merasa lelah, dan rasa lelah ini bukan kegagalan pribadiku. Aku akan memperlakukan diriku dengan kehangatan dan mengambil satu langkah kecil hari ini.',
  updatedAt: new Date().toISOString(),
};

export const useRelapseStore = create<RelapseStoreState>()(
  persist(
    (set) => ({
      plan: DEFAULT_RELAPSE_PLAN,

      addWarningSign: (category, text) => {
        const item: WarningSignItem = {
          id: generateId(),
          category,
          text: text.trim(),
          isCustom: true,
        };
        set((state) => ({
          plan: {
            ...state.plan,
            warningSigns: [...state.plan.warningSigns, item],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removeWarningSign: (id) => {
        set((state) => ({
          plan: {
            ...state.plan,
            warningSigns: state.plan.warningSigns.filter((w) => w.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      addStrategy: (level, title, description) => {
        const item: DeEscalationStrategyItem = {
          id: generateId(),
          level,
          title: title.trim(),
          description: description?.trim(),
          isCustom: true,
        };
        set((state) => ({
          plan: {
            ...state.plan,
            strategies: [...state.plan.strategies, item],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removeStrategy: (id) => {
        set((state) => ({
          plan: {
            ...state.plan,
            strategies: state.plan.strategies.filter((s) => s.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      addSupportContact: (name, relationship, phone) => {
        const item: SupportiveContactItem = {
          id: generateId(),
          name: name.trim(),
          relationship: relationship.trim(),
          phone: phone?.trim(),
        };
        set((state) => ({
          plan: {
            ...state.plan,
            supportContacts: [...state.plan.supportContacts, item],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removeSupportContact: (id) => {
        set((state) => ({
          plan: {
            ...state.plan,
            supportContacts: state.plan.supportContacts.filter((c) => c.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      updateSelfCompassionNotes: (notes) => {
        set((state) => ({
          plan: {
            ...state.plan,
            selfCompassionNotes: notes,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      resetPlanToDefault: () => {
        set({
          plan: {
            ...DEFAULT_RELAPSE_PLAN,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'rima-relapse-plan',
      storage: createJSONStorage(() => rimaAsyncStorage),
    }
  )
);
