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
});
