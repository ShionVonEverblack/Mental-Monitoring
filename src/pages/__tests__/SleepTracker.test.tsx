import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { SleepTracker } from '../SleepTracker';
import { getSleepHistory } from '../../services/sleepService';

describe('SleepTracker Page Component', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('id');
  });

  it('renders page header, CBT-I clinical badge, 20-minute stimulus card, and summary stats', () => {
    render(
      <MemoryRouter>
        <SleepTracker />
      </MemoryRouter>
    );

    expect(screen.getByText(/Buku Harian Tidur & CBT-I/i)).toBeInTheDocument();
    expect(screen.getByText(/Bukti Klinis Digital CBT-I/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Aturan Kendali Stimulus 20 Menit/i })).toBeInTheDocument();
    expect(screen.getByText(/Rata-rata Efisiensi/i)).toBeInTheDocument();
    expect(screen.getByText(/Durasi Tidur/i)).toBeInTheDocument();
    expect(screen.getByText(/Kualitas Tidur/i)).toBeInTheDocument();
    expect(screen.getByText(/Malam Terekam/i)).toBeInTheDocument();
  });

  it('displays empty state initially with prompt to log first entry', () => {
    render(
      <MemoryRouter>
        <SleepTracker />
      </MemoryRouter>
    );

    expect(screen.getByText(/Belum Ada Catatan Tidur/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mulai Catatan Pertama/i })).toBeInTheDocument();
  });

  it('opens entry modal, fills sleep form, submits and renders entry in history', () => {
    render(
      <MemoryRouter>
        <SleepTracker />
      </MemoryRouter>
    );

    const openBtn = screen.getByRole('button', { name: /Catat Tidur Tadi Malam/i });
    fireEvent.click(openBtn);

    // Modal title should be visible
    expect(screen.getByText(/Catat Buku Harian Tidur/i)).toBeInTheDocument();

    // Check live preview default calculation (23:00 to 07:00 = 8h, 20m latency, 0m awakenings -> ~96% efficiency)
    expect(screen.getByText(/Kalkulasi Efisiensi Tidur:/i)).toBeInTheDocument();

    // Toggle a factor (e.g. Kafein)
    const caffeineBtn = screen.getByRole('button', { name: /☕ Kafein/i });
    fireEvent.click(caffeineBtn);

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
    fireEvent.click(saveBtn);

    // Entry should now be in the list
    expect(screen.queryByText(/Belum Ada Catatan Tidur/i)).not.toBeInTheDocument();
    expect(screen.getByText(/23:00 ➔ 07:00/i)).toBeInTheDocument();
    expect(screen.getByText(/☕ Kafein/i)).toBeInTheDocument();

    // Verify localStorage has entry
    const entries = getSleepHistory();
    expect(entries).toHaveLength(1);
    expect(entries[0].bedTime).toBe('23:00');
    expect(entries[0].wakeTime).toBe('07:00');
    expect(entries[0].factors).toContain('caffeine');
  });

  it('allows deleting a recorded entry', () => {
    render(
      <MemoryRouter>
        <SleepTracker />
      </MemoryRouter>
    );

    // Create entry
    fireEvent.click(screen.getByRole('button', { name: /Catat Tidur Tadi Malam/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Simpan$/i }));

    expect(screen.getByText(/23:00 ➔ 07:00/i)).toBeInTheDocument();

    // Click delete button
    const deleteBtn = screen.getByLabelText(/Hapus/i);
    fireEvent.click(deleteBtn);

    // History should be empty again
    expect(screen.getByText(/Belum Ada Catatan Tidur/i)).toBeInTheDocument();
    expect(getSleepHistory()).toHaveLength(0);
  });

  it('toggles CBT-I psychoeducation tips accordion', () => {
    render(
      <MemoryRouter>
        <SleepTracker />
      </MemoryRouter>
    );

    // Stimulus tip is open by default
    expect(screen.getByText(/Jika Anda belum bisa tidur setelah 20 menit berbaring/i)).toBeInTheDocument();

    // Click on digital sunset tip header to expand it
    const screenTipBtn = screen.getByText(/Matahari Terbenam Digital \(60 Menit\)/i);
    fireEvent.click(screenTipBtn);

    expect(
      screen.getByText(/Hindari layar ponsel dan cahaya biru 60 menit sebelum tidur/i)
    ).toBeInTheDocument();
  });
});
