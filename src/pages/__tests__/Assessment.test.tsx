import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { Assessment } from '../Assessment';

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ReferenceLine: () => null,
  };
});

describe('Assessment Page & C-SSRS Escalation', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('id');
  });

  it('renders PHQ-9 questions and on-demand C-SSRS button', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    expect(screen.getByText(/Skrining Kesehatan Mental Mandiri/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skrining Keselamatan \(C-SSRS\)/i })).toBeInTheDocument();
  });

  it('opens C-SSRS modal on demand when clicking the safety screener button', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    const cssrsBtn = screen.getByRole('button', { name: /Skrining Keselamatan \(C-SSRS\)/i });
    fireEvent.click(cssrsBtn);

    expect(screen.getByText(/Skrining Keselamatan Diri \(C-SSRS\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Keinginan Mengakhiri Hidup/i)).toBeInTheDocument();
  });

  it('triggers C-SSRS escalation when PHQ-9 Item 9 is answered with score >= 1', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    // Answer questions 1 to 8 with "Tidak pernah" (0)
    // and question 9 with "Beberapa hari" (1)
    const options0 = screen.getAllByRole('button', { name: /tidak pernah/i });
    const options1 = screen.getAllByRole('button', { name: /beberapa hari/i });

    // Click option 0 for questions 1-8
    for (let i = 0; i < 8; i++) {
      fireEvent.click(options0[i]);
    }

    // Click option 1 for question 9 (Item 9)
    fireEvent.click(options1[8]);

    // Submit the assessment
    const submitBtn = screen.getByRole('button', { name: /Lihat Hasil Skrining/i });
    fireEvent.click(submitBtn);

    // C-SSRS Modal should now be open with the trigger notice
    expect(screen.getByText(/Skrining Keselamatan Diri \(C-SSRS\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamu mengindikasikan adanya pikiran yang berat/i)).toBeInTheDocument();
  });

  it('renders WHO-5 tab and switches to WHO-5 positive well-being questionnaire', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    const who5Tab = screen.getByRole('button', { name: /Kesejahteraan \(WHO-5\)/i });
    expect(who5Tab).toBeInTheDocument();

    fireEvent.click(who5Tab);

    expect(screen.getByText(/Saya merasa ceria dan dalam suasana hati yang baik/i)).toBeInTheDocument();
    expect(screen.getByText(/Saya bangun tidur dengan rasa segar dan bugar/i)).toBeInTheDocument();
  });

  it('completes WHO-5 assessment with low score and presents gentle non-stigma recovery card', () => {
    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    // Switch to WHO-5 tab
    const who5Tab = screen.getByRole('button', { name: /Kesejahteraan \(WHO-5\)/i });
    fireEvent.click(who5Tab);

    // Answer all 5 questions with "Sesekali / Kadang-kadang (1)" -> Raw: 5, Percentage: 20% (<50%)
    const options1 = screen.getAllByRole('button', { name: /Sesekali \/ Kadang-kadang/i });
    expect(options1.length).toBe(5);

    options1.forEach(btn => fireEvent.click(btn));

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Lihat Hasil Skrining/i });
    fireEvent.click(submitBtn);

    // Result card should show percentage (20%), raw score (5 of 25), and gentle recovery card
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText(/Kesejahteraan Sangat Rendah/i)).toBeInTheDocument();
    expect(screen.getByText(/Saran Pendampingan & Pemulihan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lanjut ke Skrining PHQ-9/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aktivasi Perilaku/i })).toBeInTheDocument();
  });
});
