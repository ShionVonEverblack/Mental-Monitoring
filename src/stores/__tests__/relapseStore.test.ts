import { describe, it, expect, beforeEach } from 'vitest';
import { useRelapseStore } from '../relapseStore';

describe('Relapse Prevention Store (Marlatt & Gordon Model)', () => {
  beforeEach(() => {
    useRelapseStore.getState().resetPlanToDefault();
  });

  it('initializes with evidence-based warning signs and de-escalation strategies', () => {
    const { plan } = useRelapseStore.getState();
    expect(plan.warningSigns.length).toBeGreaterThan(0);
    expect(plan.strategies.length).toBeGreaterThan(0);
    expect(plan.supportContacts.length).toBeGreaterThan(0);
    expect(plan.aveAffirmations.length).toBeGreaterThan(0);
  });

  it('adds and removes early warning signs across categories', () => {
    const { addWarningSign, removeWarningSign } = useRelapseStore.getState();

    addWarningSign('cognitive', 'Mulai membandingkan diri secara negatif di media sosial');

    const signsAfterAdd = useRelapseStore.getState().plan.warningSigns;
    const added = signsAfterAdd.find((w) => w.text === 'Mulai membandingkan diri secara negatif di media sosial');
    expect(added).toBeDefined();
    expect(added?.category).toBe('cognitive');

    // Remove
    removeWarningSign(added!.id);
    const signsAfterRemove = useRelapseStore.getState().plan.warningSigns;
    expect(signsAfterRemove.some((w) => w.id === added!.id)).toBe(false);
  });

  it('adds and removes de-escalation strategies across 3 levels', () => {
    const { addStrategy, removeStrategy } = useRelapseStore.getState();

    addStrategy(1, 'Latihan Pernapasan Kotak 4x4', 'Tarik 4 detik, tahan 4 detik, buang 4 detik.');

    const stratsAfterAdd = useRelapseStore.getState().plan.strategies;
    const added = stratsAfterAdd.find((s) => s.title === 'Latihan Pernapasan Kotak 4x4');
    expect(added).toBeDefined();
    expect(added?.level).toBe(1);

    // Remove
    removeStrategy(added!.id);
    expect(useRelapseStore.getState().plan.strategies.some((s) => s.id === added!.id)).toBe(false);
  });

  it('adds and removes supportive anchor contacts', () => {
    const { addSupportContact, removeSupportContact } = useRelapseStore.getState();

    addSupportContact('Dokter Puskesmas', 'Dokter Pembina', '081234567890');

    const contacts = useRelapseStore.getState().plan.supportContacts;
    const added = contacts.find((c) => c.name === 'Dokter Puskesmas');
    expect(added).toBeDefined();
    expect(added?.relationship).toBe('Dokter Pembina');

    // Remove
    removeSupportContact(added!.id);
    expect(useRelapseStore.getState().plan.supportContacts.some((c) => c.id === added!.id)).toBe(false);
  });

  it('updates self-compassion notes for Abstinence Violation Effect (AVE)', () => {
    const { updateSelfCompassionNotes } = useRelapseStore.getState();

    const note = 'Jika hari ini berat, aku akan memeluk diriku sendiri dan beristirahat tanpa rasa bersalah.';
    updateSelfCompassionNotes(note);

    expect(useRelapseStore.getState().plan.selfCompassionNotes).toBe(note);
  });
});
