import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { BehavioralActivation } from '../BehavioralActivation';
import { BA_STORAGE_KEY } from '../../services/behavioralActivationService';

describe('BehavioralActivation Page Component', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('id');
  });

  it('renders page header, RCT evidence badge, and stats cards', () => {
    render(
      <MemoryRouter>
        <BehavioralActivation />
      </MemoryRouter>
    );

    expect(screen.getByText(/Aktivasi Perilaku \(Behavioral Activation\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Arjadi et al., The Lancet Psychiatry/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Direncanakan/i)).toBeInTheDocument();
    expect(screen.getByText(/Tingkat Penyelesaian/i)).toBeInTheDocument();
  });

  it('opens planning modal and schedules a new activity from catalog', () => {
    render(
      <MemoryRouter>
        <BehavioralActivation />
      </MemoryRouter>
    );

    const planBtn = screen.getByRole('button', { name: /Rencanakan Aktivitas/i });
    fireEvent.click(planBtn);

    // Modal should be open
    expect(screen.getByText(/Rencanakan Aktivitas Baru/i)).toBeInTheDocument();

    // Select the first catalog item ("Mendengarkan musik yang menenangkan")
    const catalogItemBtn = screen.getByText(/Mendengarkan musik yang menenangkan/i);
    fireEvent.click(catalogItemBtn);

    // Submit the plan
    const saveBtn = screen.getByRole('button', { name: /Jadwalkan Sekarang/i });
    fireEvent.click(saveBtn);

    // Activity should now appear in Today's list
    expect(screen.getByText(/Mendengarkan musik yang menenangkan/i)).toBeInTheDocument();
    expect(screen.getByText(/Ekspektasi: 6\/10/i)).toBeInTheDocument();

    // Verify localStorage
    const saved = JSON.parse(localStorage.getItem(BA_STORAGE_KEY) || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].isCompleted).toBe(false);
  });

  it('completes an activity, calculates mood delta, and updates completion state', () => {
    render(
      <MemoryRouter>
        <BehavioralActivation />
      </MemoryRouter>
    );

    // Schedule an activity first
    fireEvent.click(screen.getByRole('button', { name: /Rencanakan Aktivitas/i }));
    // Switch to Mastery domain to show Merapikan tempat tidur
    const domainBtns = screen.getAllByRole('button', { name: /Pencapaian/i });
    fireEvent.click(domainBtns[domainBtns.length - 1]);
    fireEvent.click(screen.getByText(/Merapikan tempat tidur/i));
    fireEvent.click(screen.getByRole('button', { name: /Jadwalkan Sekarang/i }));

    // Click "Tandai Selesai"
    const markDoneBtn = screen.getByRole('button', { name: /Tandai Selesai/i });
    fireEvent.click(markDoneBtn);

    // Complete modal should open
    expect(screen.getByText(/Evaluasi Dampak Aktivitas/i)).toBeInTheDocument();

    // Change actual mood slider or submit default
    const saveEvalBtn = screen.getByRole('button', { name: /Simpan Evaluasi/i });
    fireEvent.click(saveEvalBtn);

    // Should now show completed status with actual score
    expect(screen.getByText(/Nyata: 7\/10/i)).toBeInTheDocument();
    expect(screen.getByText(/\(\+1\)/i)).toBeInTheDocument();
  });

  it('deletes an activity when delete button is clicked', () => {
    render(
      <MemoryRouter>
        <BehavioralActivation />
      </MemoryRouter>
    );

    // Schedule an activity
    fireEvent.click(screen.getByRole('button', { name: /Rencanakan Aktivitas/i }));
    fireEvent.click(screen.getByText(/Jalan santai di udara segar/i));
    fireEvent.click(screen.getByRole('button', { name: /Jadwalkan Sekarang/i }));

    expect(screen.getByText(/Jalan santai di udara segar/i)).toBeInTheDocument();

    // Delete it
    const deleteBtn = screen.getByRole('button', { name: /Hapus/i });
    fireEvent.click(deleteBtn);

    // Should be removed
    expect(screen.queryByText(/Jalan santai di udara segar/i)).not.toBeInTheDocument();
  });
});
