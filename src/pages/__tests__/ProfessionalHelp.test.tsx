import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfessionalHelp } from '../ProfessionalHelp';
import * as referralService from '../../services/referralService';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
    i18n: { language: 'id' },
  }),
}));

describe('ProfessionalHelp Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders default directory view with service cards and tab switcher', () => {
    render(<ProfessionalHelp />);
    expect(screen.getByText('Bantuan Profesional')).toBeInTheDocument();
    expect(screen.getByText(/Direktori Layanan/i)).toBeInTheDocument();
    expect(screen.getByText(/Panduan BPJS & Ringkasan Dokter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cari layanan/i)).toBeInTheDocument();
  });

  it('switches to BPJS referral guide tab and displays 3-step workflow and hero badge', () => {
    render(<ProfessionalHelp />);
    const bpjsTab = screen.getByRole('tab', { name: /Panduan BPJS & Ringkasan Dokter/i });
    fireEvent.click(bpjsTab);

    expect(screen.getAllByText(/100% Ditanggung BPJS/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Panduan Berobat Kesehatan Mental dengan BPJS/i)).toBeInTheDocument();
    expect(screen.getByText(/Alur Rujukan 3 Langkah/i)).toBeInTheDocument();
    expect(screen.getByText(/Kunjungi Faskes Tingkat Pertama/i)).toBeInTheDocument();
  });

  it('allows switching doctor conversation scripts and copies script to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ProfessionalHelp />);
    const bpjsTab = screen.getByRole('tab', { name: /Panduan BPJS & Ringkasan Dokter/i });
    fireEvent.click(bpjsTab);

    expect(screen.getByText(/Skrip Percakapan dengan Dokter Puskesmas/i)).toBeInTheDocument();

    // Click anxiety script pill
    const anxietyPill = screen.getByText(/Serangan Cemas/i);
    fireEvent.click(anxietyPill);

    const copyBtn = screen.getByRole('button', { name: /Salin Skrip/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalled();
  });

  it('triggers print and download functions for clinical handover brief', () => {
    const printSpy = vi.spyOn(referralService, 'printDoctorHandoverBrief').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(referralService, 'downloadDoctorHandoverBrief').mockImplementation(() => {});

    render(<ProfessionalHelp />);
    const bpjsTab = screen.getByRole('tab', { name: /Panduan BPJS & Ringkasan Dokter/i });
    fireEvent.click(bpjsTab);

    const printBtn = screen.getByRole('button', { name: /Cetak Lembar Rujukan/i });
    const downloadBtn = screen.getByRole('button', { name: /Unduh Berkas HTML/i });

    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledWith('id', '');

    fireEvent.click(downloadBtn);
    expect(downloadSpy).toHaveBeenCalledWith('id', '');
  });

  it('displays 5 clinical metrics in handover section and updates patient note', () => {
    render(<ProfessionalHelp />);
    const bpjsTab = screen.getByRole('tab', { name: /Panduan BPJS & Ringkasan Dokter/i });
    fireEvent.click(bpjsTab);

    expect(screen.getByText(/Skrining PHQ-9/i)).toBeInTheDocument();
    expect(screen.getByText(/Skrining GAD-7/i)).toBeInTheDocument();
    expect(screen.getByText(/Indeks WHO-5/i)).toBeInTheDocument();
    expect(screen.getByText(/CBT-I Efisiensi Tidur/i)).toBeInTheDocument();
    expect(screen.getByText(/Suasana Hati 30 Hari/i)).toBeInTheDocument();

    const noteInput = screen.getByPlaceholderText(/Tambahkan catatan keluhan utama/i);
    fireEvent.change(noteInput, { target: { value: 'Keluhan insomnia dan cemas' } });
    expect(noteInput).toHaveValue('Keluhan insomnia dan cemas');
  });

  it('opens in-app A4 handover brief modal preview and allows closing', () => {
    render(<ProfessionalHelp />);
    const bpjsTab = screen.getByRole('tab', { name: /Panduan BPJS & Ringkasan Dokter/i });
    fireEvent.click(bpjsTab);

    const previewBtn = screen.getByRole('button', { name: /Pratinjau Lembar Rujukan/i });
    fireEvent.click(previewBtn);

    // Modal title & content should be visible
    expect(screen.getByText('Pratinjau Lembar Ringkasan Klinis')).toBeInTheDocument();
    expect(screen.getByText(/Berikut adalah format dokumen A4 yang akan dicetak/i)).toBeInTheDocument();
    expect(screen.getByText(/Lembar Ringkasan Klinis & Rujukan Pasien/i)).toBeInTheDocument();

    // Close preview
    const closeBtn = screen.getByRole('button', { name: /Tutup Pratinjau/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Pratinjau Lembar Ringkasan Klinis')).not.toBeInTheDocument();
  });
});
