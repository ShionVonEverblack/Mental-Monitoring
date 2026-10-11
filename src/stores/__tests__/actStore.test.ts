import { describe, it, expect, beforeEach } from 'vitest';
import { useActStore, DEFAULT_ACT_VALUES } from '../actStore';

describe('ACT Store (Acceptance & Commitment Therapy)', () => {
  beforeEach(() => {
    useActStore.getState().resetAct();
  });

  it('initializes with default core values across the 4 Hayes domains', () => {
    const { values } = useActStore.getState();
    expect(values.relationships.importance).toBe(DEFAULT_ACT_VALUES.relationships.importance);
    expect(values.growth.importance).toBe(DEFAULT_ACT_VALUES.growth.importance);
    expect(values.health.importance).toBe(DEFAULT_ACT_VALUES.health.importance);
    expect(values.work.importance).toBe(DEFAULT_ACT_VALUES.work.importance);
  });

  it('updates importance rating and personal value statement', () => {
    const { updateValue } = useActStore.getState();

    updateValue('relationships', { importance: 10, statement: 'Menjaga kejujuran dan cinta kasih.' });

    const updated = useActStore.getState().values.relationships;
    expect(updated.importance).toBe(10);
    expect(updated.statement).toBe('Menjaga kejujuran dan cinta kasih.');
  });

  it('adds, toggles, and deletes committed actions', () => {
    const { addCommittedAction, toggleCommittedAction, deleteCommittedAction } = useActStore.getState();

    addCommittedAction({
      domain: 'growth',
      title: 'Membaca buku refleksi selama 15 menit',
    });

    const actionsAfterAdd = useActStore.getState().committedActions;
    const added = actionsAfterAdd.find((a) => a.title === 'Membaca buku refleksi selama 15 menit');
    expect(added).toBeDefined();
    expect(added?.isCompleted).toBe(false);

    // Toggle completion
    toggleCommittedAction(added!.id);
    expect(useActStore.getState().committedActions.find((a) => a.id === added!.id)?.isCompleted).toBe(true);

    // Delete action
    deleteCommittedAction(added!.id);
    expect(useActStore.getState().committedActions.some((a) => a.id === added!.id)).toBe(false);
  });

  it('records defusion sessions (Leaves on Stream and Thought Labeling)', () => {
    const { addDefusionSession } = useActStore.getState();

    addDefusionSession({
      exerciseId: 'leaves_on_stream',
      originalThought: 'Aku merasa serba salah',
      reframedThought: 'Dibiarkan mengalir lewat',
    });

    addDefusionSession({
      exerciseId: 'thought_labeling',
      originalThought: 'Aku tidak mampu',
      reframedThought: 'Aku menyadari bahwa pikiranku sedang berkata bahwa aku tidak mampu',
    });

    const sessions = useActStore.getState().defusionSessions;
    expect(sessions.length).toBe(2);
    expect(sessions[0].exerciseId).toBe('thought_labeling');
    expect(sessions[1].exerciseId).toBe('leaves_on_stream');
  });

  it('resets state to defaults cleanly', () => {
    const { updateValue, addDefusionSession, resetAct } = useActStore.getState();

    updateValue('health', { importance: 2 });
    addDefusionSession({
      exerciseId: 'leaves_on_stream',
      originalThought: 'Pikiran',
    });

    resetAct();

    const state = useActStore.getState();
    expect(state.values.health.importance).toBe(DEFAULT_ACT_VALUES.health.importance);
    expect(state.defusionSessions.length).toBe(0);
  });
});
