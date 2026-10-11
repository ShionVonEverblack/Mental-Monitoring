import { describe, it, expect, beforeEach } from 'vitest';
import { useDualModeStore, isNetworkAllowed } from '../dualModeStore';

describe('useDualModeStore', () => {
  beforeEach(() => {
    useDualModeStore.setState({
      operatingMode: 'connected',
      isAirgappedMode: false,
    });
  });

  it('initializes in Connected Hybrid mode by default allowing hybrid sync', () => {
    const state = useDualModeStore.getState();
    expect(state.operatingMode).toBe('connected');
    expect(state.isAirgappedMode).toBe(false);
    expect(isNetworkAllowed()).toBe(true);
  });

  it('switches to Air-Gapped Vault mode and blocks outgoing network requests programmatically', () => {
    useDualModeStore.getState().setOperatingMode('airgapped');

    const state = useDualModeStore.getState();
    expect(state.operatingMode).toBe('airgapped');
    expect(state.isAirgappedMode).toBe(true);
    expect(isNetworkAllowed()).toBe(false);
  });

  it('toggles between connected and airgapped modes reliably', () => {
    expect(useDualModeStore.getState().operatingMode).toBe('connected');
    expect(isNetworkAllowed()).toBe(true);

    useDualModeStore.getState().toggleOperatingMode();
    expect(useDualModeStore.getState().operatingMode).toBe('airgapped');
    expect(useDualModeStore.getState().isAirgappedMode).toBe(true);
    expect(isNetworkAllowed()).toBe(false);

    useDualModeStore.getState().toggleOperatingMode();
    expect(useDualModeStore.getState().operatingMode).toBe('connected');
    expect(useDualModeStore.getState().isAirgappedMode).toBe(false);
    expect(isNetworkAllowed()).toBe(true);
  });

  it('blocks network when set explicitly to airgapped', () => {
    useDualModeStore.getState().setOperatingMode('airgapped');
    expect(useDualModeStore.getState().operatingMode).toBe('airgapped');
    expect(useDualModeStore.getState().isAirgappedMode).toBe(true);
    expect(isNetworkAllowed()).toBe(false);
  });

  it('guarantees defense in depth: isNetworkAllowed returns false if isAirgappedMode is true even if operatingMode is corrupted', () => {
    useDualModeStore.setState({
      operatingMode: 'connected',
      isAirgappedMode: true, // inconsistent state simulated
    });
    expect(isNetworkAllowed()).toBe(false);

    useDualModeStore.setState({
      operatingMode: 'airgapped',
      isAirgappedMode: false, // inconsistent state simulated
    });
    expect(isNetworkAllowed()).toBe(false);
  });
});
