import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ActDomain, ActCommittedAction, DefusionSession } from '../types/act';
import { generateId } from '../utils/helpers';
import { rimaAsyncStorage } from '../utils/indexedDb';

export interface ActValueDetail {
  importance: number; // 1-10
  statement: string;
}

export interface ActStoreState {
  values: Record<ActDomain, ActValueDetail>;
  committedActions: ActCommittedAction[];
  defusionSessions: DefusionSession[];

  updateValue: (domain: ActDomain, updates: Partial<ActValueDetail>) => void;
  addCommittedAction: (action: { domain: ActDomain; title: string; targetDate?: string }) => void;
  toggleCommittedAction: (id: string) => void;
  deleteCommittedAction: (id: string) => void;
  addDefusionSession: (session: {
    exerciseId: 'leaves_on_stream' | 'thought_labeling';
    originalThought: string;
    reframedThought?: string;
  }) => void;
  resetAct: () => void;
}

export const DEFAULT_ACT_VALUES: Record<ActDomain, ActValueDetail> = {
  relationships: {
    importance: 8,
    statement: 'Hadir dengan empati, mendengarkan tanpa menghakimi, dan merawat ikatan tulus bersama sesama.',
  },
  growth: {
    importance: 8,
    statement: 'Terbuka untuk belajar, menerima kerentanan diri, dan bertumbuh dengan welas asih.',
  },
  health: {
    importance: 8,
    statement: 'Menghormati ritme tubuh, menjaga istirahat sadar, dan memulihkan energi batin secara holistik.',
  },
  work: {
    importance: 7,
    statement: 'Berkarya dengan integritas, berfokus pada proses bermakna, dan memberi dampak bermanfaat.',
  },
};

export const DEFAULT_COMMITTED_ACTIONS: ActCommittedAction[] = [
  {
    id: 'act-sample-1',
    domain: 'relationships',
    title: 'Kirim pesan hangat atau tanyakan kabar sahabat hari ini',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act-sample-2',
    domain: 'health',
    title: 'Istirahatkan mata dan ponsel 30 menit sebelum jam tidur',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

export const useActStore = create<ActStoreState>()(
  persist(
    (set) => ({
      values: DEFAULT_ACT_VALUES,
      committedActions: DEFAULT_COMMITTED_ACTIONS,
      defusionSessions: [],

      updateValue: (domain, updates) => {
        set((state) => ({
          values: {
            ...state.values,
            [domain]: {
              ...state.values[domain],
              ...updates,
            },
          },
        }));
      },

      addCommittedAction: ({ domain, title, targetDate }) => {
        const newAction: ActCommittedAction = {
          id: generateId(),
          domain,
          title,
          targetDate,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          committedActions: [newAction, ...state.committedActions],
        }));
      },

      toggleCommittedAction: (id) => {
        set((state) => ({
          committedActions: state.committedActions.map((act) =>
            act.id === id ? { ...act, isCompleted: !act.isCompleted } : act
          ),
        }));
      },

      deleteCommittedAction: (id) => {
        set((state) => ({
          committedActions: state.committedActions.filter((act) => act.id !== id),
        }));
      },

      addDefusionSession: ({ exerciseId, originalThought, reframedThought }) => {
        const session: DefusionSession = {
          id: generateId(),
          exerciseId,
          originalThought,
          reframedThought,
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          defusionSessions: [session, ...state.defusionSessions].slice(0, 30),
        }));
      },

      resetAct: () => {
        set({
          values: DEFAULT_ACT_VALUES,
          committedActions: DEFAULT_COMMITTED_ACTIONS,
          defusionSessions: [],
        });
      },
    }),
    {
      name: 'rima-act-data',
      storage: createJSONStorage(() => rimaAsyncStorage),
    }
  )
);
