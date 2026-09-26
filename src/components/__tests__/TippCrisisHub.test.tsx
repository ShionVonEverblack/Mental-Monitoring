import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { TippCrisisHub } from '../../pages/TippCrisisHub';

beforeEach(async () => {
  window.scrollTo = vi.fn();
  await i18n.changeLanguage('id');
});

describe('TippCrisisHub Component', () => {
  it('renders TIPP hub with 4 module cards and pre-distress SUDS slider', () => {
    render(
      <MemoryRouter>
        <TippCrisisHub />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Protokol TIPP/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /Skala Distres Sebelum Latihan/i })).toBeInTheDocument();
    expect(screen.getByText(/Suhu Dingin \(Temperature\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Latihan Intensif \(Intense Exercise\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Napas Berirama \(Paced Breathing\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Relaksasi Otot Pasangan \(PMR\)/i)).toBeInTheDocument();
  });

  it('adjusts pre-distress slider value', () => {
    render(
      <MemoryRouter>
        <TippCrisisHub />
      </MemoryRouter>
    );

    const slider = screen.getByRole('slider', { name: /Skala Distres Sebelum Latihan/i });
    fireEvent.change(slider, { target: { value: '9' } });
    expect(screen.getByText(/9 \/ 10/)).toBeInTheDocument();
  });

  it('opens Temperature module with 30s timer and returns back to overview', () => {
    render(
      <MemoryRouter>
        <TippCrisisHub />
      </MemoryRouter>
    );

    const tempCard = screen.getByRole('button', { name: /Suhu Dingin \(Temperature\)/i });
    fireEvent.click(tempCard);

    expect(screen.getByText(/Suhu Dingin: Mammalian Dive Reflex/i)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mulai/i })).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Kembali ke Pilihan Modul/i });
    fireEvent.click(backBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Protokol TIPP/i })).toBeInTheDocument();
  });

  it('opens Exercise module with 60s timer and allows selecting exercise options', () => {
    render(
      <MemoryRouter>
        <TippCrisisHub />
      </MemoryRouter>
    );

    const exerciseCard = screen.getByRole('button', { name: /Latihan Intensif \(Intense Exercise\)/i });
    fireEvent.click(exerciseCard);

    expect(screen.getByText(/Latihan Intensif: 60 Detik/i)).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();

    const highKneesChip = screen.getByRole('button', { name: /Angkat Lutut Tinggi/i });
    fireEvent.click(highKneesChip);
    expect(highKneesChip).toHaveClass('active');
  });

  it('opens PMR module and allows toggling through body zones', () => {
    render(
      <MemoryRouter>
        <TippCrisisHub />
      </MemoryRouter>
    );

    const pmrCard = screen.getByRole('button', { name: /Relaksasi Otot Pasangan \(PMR\)/i });
    fireEvent.click(pmrCard);

    expect(screen.getByText(/Relaksasi Otot Pasangan \(PMR\)/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Kepalan Tangan & Lengan/i })).toBeInTheDocument();

    // Click shoulder zone button
    const shoulderBtn = screen.getByRole('button', { name: /2\. Bahu & Leher/i });
    fireEvent.click(shoulderBtn);

    expect(screen.getByText(/Angkat bahu tinggi-tinggi/i)).toBeInTheDocument();
  });

  it('finishes module and renders completion screen with SUDS delta evaluation', () => {
    render(
      <MemoryRouter>
        <TippCrisisHub />
      </MemoryRouter>
    );

    // Open breathing module
    const breathingCard = screen.getByRole('button', { name: /Napas Berirama \(Paced Breathing\)/i });
    fireEvent.click(breathingCard);

    expect(screen.getByText(/Napas Berirama: Ekshalasi Panjang/i)).toBeInTheDocument();

    // Click finish module
    const finishBtn = screen.getByRole('button', { name: /Selesai & Evaluasi Distres/i });
    act(() => {
      fireEvent.click(finishBtn);
    });

    expect(screen.getByText(/Latihan TIPP Selesai/i)).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /Skala Distres Pasca Latihan/i })).toBeInTheDocument();
    expect(screen.getByText(/Distres turun/i)).toBeInTheDocument();

    // Can return back to try another module
    const tryAnotherBtn = screen.getByRole('button', { name: /Coba Modul Lain/i });
    fireEvent.click(tryAnotherBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Protokol TIPP/i })).toBeInTheDocument();
  });
});
