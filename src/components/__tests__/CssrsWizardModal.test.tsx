import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { CssrsWizardModal } from '../safety/CssrsWizardModal';
import { CSSRS_STORAGE_KEY } from '../../services/cssrsService';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CssrsWizardModal Component', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id');
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders modal when open and starts at Question 1', () => {
    render(
      <MemoryRouter>
        <CssrsWizardModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Skrining Keselamatan Diri \(C-SSRS\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Keinginan Mengakhiri Hidup/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ya$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^tidak$/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter>
        <CssrsWizardModal isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('follows skip logic when Q2 is answered "Tidak" (skips Q3-Q5 straight to Q6)', () => {
    render(
      <MemoryRouter>
        <CssrsWizardModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    // Q1: Keinginan Mengakhiri Hidup -> Click Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    // Now at Q2: Pikiran Bunuh Diri Umum
    expect(screen.getByText(/Pikiran Bunuh Diri Umum/i)).toBeInTheDocument();

    // Click Tidak on Q2 -> should skip Q3, Q4, Q5 and jump to Q6
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    // Now should be at Q6: Riwayat Perilaku
    expect(screen.getByText(/Riwayat Perilaku/i)).toBeInTheDocument();

    // Click Tidak on Q6 -> finishes with "Minimal / Stabil"
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    // Evaluation screen
    expect(screen.getByText(/Tingkat Risiko: Minimal \/ Stabil/i)).toBeInTheDocument();
    expect(screen.getByText(/Kondisimu Relatif Stabil/i)).toBeInTheDocument();

    // Check stored result in localStorage
    const saved = JSON.parse(localStorage.getItem(CSSRS_STORAGE_KEY) || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].evaluation.riskLevel).toBe('none');
  });

  it('detects High Risk when intent (Q4) is answered "Ya" and displays emergency hotline buttons', () => {
    const onCompleteMock = vi.fn();

    render(
      <MemoryRouter>
        <CssrsWizardModal
          isOpen={true}
          onClose={vi.fn()}
          source="phq9_item9"
          onComplete={onCompleteMock}
        />
      </MemoryRouter>
    );

    // Shows trigger notice for PHQ-9 Item 9
    expect(screen.getByText(/Kamu mengindikasikan adanya pikiran yang berat/i)).toBeInTheDocument();

    // Q1 -> Ya
    fireEvent.click(screen.getByRole('button', { name: /^ya$/i }));

    // Q2 -> Ya
    fireEvent.click(screen.getByRole('button', { name: /^ya$/i }));

    // Q3 -> Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    // Q4 -> Ya (Intent without plan = High Risk)
    fireEvent.click(screen.getByRole('button', { name: /^ya$/i }));

    // Q5 -> Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    // Q6 -> Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    // High risk outcome
    expect(screen.getByText(/Tingkat Risiko: Tinggi/i)).toBeInTheDocument();
    expect(screen.getByText(/Tindakan Keselamatan Mendesak Diperlukan/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Hubungi Healing 119/i })).toHaveAttribute(
      'href',
      'tel:119,8'
    );
    expect(screen.getByRole('link', { name: /Hubungi Darurat 112/i })).toHaveAttribute(
      'href',
      'tel:112'
    );

    expect(onCompleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        evaluation: expect.objectContaining({ riskLevel: 'high' }),
      })
    );
  });

  it('allows navigating back to previous question using Back button', () => {
    render(
      <MemoryRouter>
        <CssrsWizardModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    // Q1 -> click Ya
    fireEvent.click(screen.getByRole('button', { name: /^ya$/i }));

    // Now at Q2
    expect(screen.getByText(/Pikiran Bunuh Diri Umum/i)).toBeInTheDocument();

    // Click Kembali
    const backBtn = screen.getByRole('button', { name: /kembali/i });
    fireEvent.click(backBtn);

    // Back at Q1
    expect(screen.getByText(/Keinginan Mengakhiri Hidup/i)).toBeInTheDocument();
  });

  it('navigates to /safety-plan when safety plan button is clicked on outcome screen', () => {
    render(
      <MemoryRouter>
        <CssrsWizardModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    // Q1 -> Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));
    // Q2 -> Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));
    // Q6 -> Tidak
    fireEvent.click(screen.getByRole('button', { name: /^tidak$/i }));

    const planBtn = screen.getByRole('button', { name: /buka rencana keselamatan/i });
    fireEvent.click(planBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/safety-plan');
  });
});
