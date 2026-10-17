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

  it('does NOT trigger gentle crisis modal when saving pure recovery content', () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>
    );

    const freeReflectBtn = screen.getByText(/Tulis Bebas/i).closest('button');
    fireEvent.click(freeReflectBtn!);

    const titleInput = screen.getByPlaceholderText(/Judul jurnal/i);
    const contentTextarea = screen.getByPlaceholderText(/Mulai menulis/i);

    fireEvent.change(titleInput, { target: { value: 'Kemajuan Pemulihanku' } });
    fireEvent.change(contentTextarea, { target: { value: 'Hari ini aku merasa jauh lebih baik dan aku sudah tidak ingin menyakiti diri lagi.' } });

    const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
    fireEvent.click(saveBtn);

    // Crisis modal should NOT appear (Zero False-Positive)
    expect(screen.queryByText(/Kami Memperhatikan/i)).toBeNull();
    // Journal entry should be saved into history
    expect(screen.getByText('Kemajuan Pemulihanku')).toBeInTheDocument();
  });

  it('triggers crisis modal for contrast compound sentence and provides direct 119 Ext 8 and somatic grounding', () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>
    );

    const freeReflectBtn = screen.getByText(/Tulis Bebas/i).closest('button');
    fireEvent.click(freeReflectBtn!);

    const titleInput = screen.getByPlaceholderText(/Judul jurnal/i);
    const contentTextarea = screen.getByPlaceholderText(/Mulai menulis/i);

    fireEvent.change(titleInput, { target: { value: 'Malam Ini' } });
    fireEvent.change(contentTextarea, { target: { value: 'tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup' } });

    const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
    fireEvent.click(saveBtn);

    // Crisis modal MUST appear
    expect(screen.getByText(/Kami Memperhatikan/i)).toBeInTheDocument();

    // 1-click dialer link for 119 Ext 8
    const call119 = screen.getByRole('link', { name: /SEJIWA 119 Ext 8/i });
    expect(call119).toBeInTheDocument();
    expect(call119).toHaveAttribute('href', 'tel:119,8');

    // Dial extension helper notice
    expect(screen.getByText(/Tekan 8 saat nada sambung berbunyi/i)).toBeInTheDocument();

    // Somatic grounding shortcut button
    const somaticBtn = screen.getByRole('button', { name: /Latihan Grounding Sensorik 5-4-3-2-1/i });
    expect(somaticBtn).toBeInTheDocument();
    fireEvent.click(somaticBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/grounding');
  });

  it('does NOT trigger gentle crisis modal when saving mild daily sadness/overwhelm', () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>
    );

    const freeReflectBtn = screen.getByText(/Tulis Bebas/i).closest('button');
    fireEvent.click(freeReflectBtn!);

    const titleInput = screen.getByPlaceholderText(/Judul jurnal/i);
    const contentTextarea = screen.getByPlaceholderText(/Mulai menulis/i);

    fireEvent.change(titleInput, { target: { value: 'Hari yang Melelahkan' } });
    fireEvent.change(contentTextarea, { target: { value: 'Hari ini saya sangat sedih dan lelah karena tugas menumpuk.' } });

    const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
    fireEvent.click(saveBtn);

    // Crisis modal should NOT appear for mild sadness
    expect(screen.queryByText(/Kami Memperhatikan/i)).toBeNull();
    expect(screen.getByText('Hari yang Melelahkan')).toBeInTheDocument();
  });
});

