import { useDualModeStore } from '../stores/dualModeStore';
import type { OperatingMode } from '../stores/dualModeStore';

export interface UseDualModeReturn {
  operatingMode: OperatingMode;
  isAirgappedMode: boolean;
  setOperatingMode: (mode: OperatingMode) => void;
  toggleOperatingMode: () => void;
}

export function useDualMode(): UseDualModeReturn {
  const operatingMode = useDualModeStore((s) => s.operatingMode);
  const isAirgappedMode = useDualModeStore((s) => s.isAirgappedMode);
  const setOperatingMode = useDualModeStore((s) => s.setOperatingMode);
  const toggleOperatingMode = useDualModeStore((s) => s.toggleOperatingMode);

  return {
    operatingMode,
    isAirgappedMode,
    setOperatingMode,
    toggleOperatingMode,
  };
}
