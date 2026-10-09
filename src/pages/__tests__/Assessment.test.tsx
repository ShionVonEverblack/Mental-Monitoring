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
});
