import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { Journal } from '../Journal';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Journal Page & Gentle Crisis Interventions', () => {
  beforeEach(async () => {
    localStorage.clear();
    mockNavigate.mockReset();
    await i18n.changeLanguage('id');
  });

  it('renders journal page and template selector', () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Tulis Bebas/i)).toBeInTheDocument();
  });

  it('triggers gentle crisis modal when saving crisis content, and dismisses before navigating when clicking safety plan button', () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>
    );

    // Select Free Reflection template
    const freeReflectBtn = screen.getByText(/Tulis Bebas/i).closest('button');
    expect(freeReflectBtn).not.toBeNull();
    fireEvent.click(freeReflectBtn!);

    // Fill in title and crisis content
    const titleInput = screen.getByPlaceholderText(/Judul jurnal/i);
    const contentTextarea = screen.getByPlaceholderText(/Mulai menulis/i);

    fireEvent.change(titleInput, { target: { value: 'Catatan Malam' } });
    fireEvent.change(contentTextarea, { target: { value: 'Aku ingin bunuh diri dan mengakhiri semuanya' } });

    // Submit journal
    const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
    fireEvent.click(saveBtn);

    // Gentle crisis prompt should appear
    expect(screen.getByText(/Kami Memperhatikan/i)).toBeInTheDocument();

    // Click "Lihat Rencana Keselamatan"
    const safetyPlanBtn = screen.getByRole('button', { name: /Lihat Rencana Keselamatan/i });
    fireEvent.click(safetyPlanBtn);

    // Should navigate to /safety-plan
    expect(mockNavigate).toHaveBeenCalledWith('/safety-plan');

    // Crisis modal should be dismissed
    expect(screen.queryByText(/Kami Memperhatikan/i)).toBeNull();
  });
});
