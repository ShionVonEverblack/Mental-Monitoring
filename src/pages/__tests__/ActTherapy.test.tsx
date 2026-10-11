import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActTherapy } from '../ActTherapy';
import { useActStore } from '../../stores/actStore';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
    i18n: { language: 'id' },
  }),
}));

describe('ActTherapy Page', () => {
  beforeEach(() => {
    localStorage.clear();
    useActStore.getState().resetAct();
    vi.restoreAllMocks();
  });

  it('renders ACT therapy title, clinical badges, and tab navigation', () => {
    render(<ActTherapy />);
    expect(screen.getByText(/Terapi Keberterimaan & Komitmen \(ACT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Steven C. Hayes/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Kompas Nilai Hidup/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Daun di Aliran Sungai/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Aku Menyadari Pikiran/i })).toBeInTheDocument();
  });

  it('renders 4 core life value domains and allows adding a committed action', () => {
    render(<ActTherapy />);

    expect(screen.getByRole('heading', { name: /Hubungan & Koneksi/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Pertumbuhan Diri/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Kesehatan & Vitalitas/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Karya & Kontribusi/i })).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Tuliskan satu tindakan kecil hari ini.../i);
    const addBtn = screen.getByRole('button', { name: /Tambah Aksi/i });

    fireEvent.change(input, { target: { value: 'Minum air putih dan jalan santai' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Minum air putih dan jalan santai')).toBeInTheDocument();
  });

  it('switches to Leaves on a Stream tab and starts interactive leaf defusion', async () => {
    vi.useFakeTimers();
    render(<ActTherapy />);

    const leavesTab = screen.getByRole('tab', { name: /Daun di Aliran Sungai/i });
    fireEvent.click(leavesTab);

    expect(screen.getByText(/Daun di Aliran Sungai \(Leaves on a Stream\)/i)).toBeInTheDocument();

    const thoughtInput = screen.getByPlaceholderText(/Ketik pikiran yang sedang membebanimu.../i);
    const floatBtn = screen.getByRole('button', { name: /Letakkan di Daun & Hanyutkan/i });

    fireEvent.change(thoughtInput, { target: { value: 'Aku merasa cemas akan masa depan' } });
    fireEvent.click(floatBtn);

    expect(screen.getByText(/“Aku merasa cemas akan masa depan”/i)).toBeInTheDocument();
    expect(screen.getByText(/Pikiranmu telah diletakkan di atas daun/i)).toBeInTheDocument();

    // Advance timers for step 2 and step 3
    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByText(/Daun hanyut terbawa aliran arus air/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByText(/Daun perlahan menjauh/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    vi.useRealTimers();
  });

  it('switches to Thought Labeling tab and walks through 3-tier defusion', () => {
    render(<ActTherapy />);

    const noticingTab = screen.getByRole('tab', { name: /Aku Menyadari Pikiran/i });
    fireEvent.click(noticingTab);

    expect(screen.getByText(/Aku Menyadari Bahwa... \(Defusi Bertingkat\)/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Misal: "Aku orang yang gagal"/i);
    fireEvent.change(input, { target: { value: 'Aku tidak mampu mengerjakan tugas ini' } });

    // 3 tiers should be visible
    expect(screen.getByText(/Tahap 1: Fusi Kognitif/i)).toBeInTheDocument();
    expect(screen.getByText(/Tahap 2: Menyadari Proses Berpikir/i)).toBeInTheDocument();
    expect(screen.getByText(/Tahap 3: Pengamat Diri \(Self-as-Context\)/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Simpan Perspektif Pengamat/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Tersimpan ke Riwayat Defusi/i)).toBeInTheDocument();
  });
});
