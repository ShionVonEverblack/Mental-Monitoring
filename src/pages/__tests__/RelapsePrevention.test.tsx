import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RelapsePrevention } from '../RelapsePrevention';
import { useRelapseStore } from '../../stores/relapseStore';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
    i18n: { language: 'id' },
  }),
}));

describe('RelapsePrevention Page', () => {
  beforeEach(() => {
    localStorage.clear();
    useRelapseStore.getState().resetPlanToDefault();
    vi.restoreAllMocks();
  });

  it('renders Relapse Prevention title, Marlatt badges, and tabs', () => {
    render(<RelapsePrevention />);
    expect(screen.getByText(/Rencana Antisipasi Kambuh \(Relapse Prevention\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Marlatt & Gordon/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('tab', { name: /Tanda Peringatan Dini/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Strategi De-Eskalasi/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Welas Asih & Penawar AVE/i })).toBeInTheDocument();
  });

  it('displays early warning signs by categories and allows adding a new custom warning sign', () => {
    render(<RelapsePrevention />);

    expect(screen.getByText(/Kenali Riak Sebelum Menjadi Gelombang/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Tuliskan tanda peringatan dini baru.../i);
    const addBtn = screen.getByRole('button', { name: /Tambah Tanda/i });

    fireEvent.change(input, { target: { value: 'Mulai enggan mandi dan melewatkan makan' } });
    fireEvent.click(addBtn);

    expect(screen.getByText(/• Mulai enggan mandi dan melewatkan makan/i)).toBeInTheDocument();
  });

  it('switches to De-escalation tab, renders 3-level protocol and allows adding a strategy', () => {
    render(<RelapsePrevention />);

    const deescTab = screen.getByRole('tab', { name: /Strategi De-Eskalasi/i });
    fireEvent.click(deescTab);

    expect(screen.getByText(/Protokol De-Eskalasi 3 Lapis/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Level 1/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Level 2/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Level 3/i })).toBeInTheDocument();
    expect(screen.getByText(/Telepon Darurat 119 Ext 8/i)).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Nama aksi de-eskalasi/i);
    const saveBtn = screen.getByRole('button', { name: /Simpan Strategi/i });

    fireEvent.change(titleInput, { target: { value: 'Minum teh chamomile hangat' } });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Minum teh chamomile hangat')).toBeInTheDocument();
  });

  it('switches to Welas Asih & AVE tab, shows Marlatt AVE explanation, and updates notes', () => {
    render(<RelapsePrevention />);

    const compTab = screen.getByRole('tab', { name: /Welas Asih & Penawar AVE/i });
    fireEvent.click(compTab);

    expect(screen.getByText(/Mengatasi Abstinence Violation Effect \(AVE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Rumus Klinis Pemulihan:/i)).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Pesan Welas Asih Pribadi untuk Diriku/i);
    fireEvent.change(textarea, { target: { value: 'Catatan welas asih baru untuk diriku sendiri.' } });

    const saveNotesBtn = screen.getByRole('button', { name: /Simpan Catatan/i });
    fireEvent.click(saveNotesBtn);

    expect(useRelapseStore.getState().plan.selfCompassionNotes).toBe('Catatan welas asih baru untuk diriku sendiri.');
    expect(screen.getByText(/Tersimpan otomatis/i)).toBeInTheDocument();
  });
});
