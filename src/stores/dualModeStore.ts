import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { rimaAsyncStorage } from '../utils/indexedDb';

export type OperatingMode = 'airgapped' | 'connected';

export interface DualModeState {
  operatingMode: OperatingMode;
  isAirgappedMode: boolean;
  setOperatingMode: (mode: OperatingMode) => void;
  toggleOperatingMode: () => void;
}

export const useDualModeStore = create<DualModeState>()(
  persist(
    (set, get) => ({
      operatingMode: 'connected',
      isAirgappedMode: false,

      setOperatingMode: (mode: OperatingMode) => {
        set({
          operatingMode: mode,
          isAirgappedMode: mode === 'airgapped',
        });
      },

      toggleOperatingMode: () => {
        const nextMode: OperatingMode = get().operatingMode === 'airgapped' ? 'connected' : 'airgapped';
        set({
          operatingMode: nextMode,
          isAirgappedMode: nextMode === 'airgapped',
        });
      },
    }),
    {
      name: 'rima-dual-mode',
      storage: createJSONStorage(() => rimaAsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAirgappedMode = state.operatingMode === 'airgapped';
        }
      },
    }
  )
);

/**
 * Returns true if network requests are currently permitted by the operating mode.
 * Air-gapped mode strictly returns false (network blocked programmatically).
 */
export function isNetworkAllowed(): boolean {
  const state = useDualModeStore.getState();
  return state.operatingMode === 'connected' && !state.isAirgappedMode;
}
