import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelfCompassionModal } from '../cft/SelfCompassionModal';

describe('SelfCompassionModal Component', () => {
  it('renders step 1 (mindfulness) when open and hides when closed', () => {
    const { rerender } = render(
      <SelfCompassionModal isOpen={false} onClose={() => {}} />
    );
    expect(screen.queryByText(/Jeda Belas Kasih Diri/i)).toBeNull();

    rerender(<SelfCompassionModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Jeda Belas Kasih Diri/i)).toBeDefined();
    expect(screen.getByText(/1. Mindfulness/i)).toBeDefined();
  });

  it('progresses through 3 steps and displays completion covenant', () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(
      <SelfCompassionModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    );

    // Step 1: Mindfulness
    expect(screen.getByText(/1. Mindfulness/i)).toBeDefined();
    const nextBtn1 = screen.getByRole('button', { name: /Lanjut ke Langkah 2/i });
    fireEvent.click(nextBtn1);

    // Step 2: Common Humanity
    expect(screen.getByText(/2. Kemanusiaan Bersama/i)).toBeDefined();
    const nextBtn2 = screen.getByRole('button', { name: /Lanjut ke Langkah 3/i });
    fireEvent.click(nextBtn2);

    // Step 3: Self-Kindness & Soothing Touch
    expect(screen.getByText(/3. Kebaikan Diri/i)).toBeDefined();
    const seeCovenantBtn = screen.getByRole('button', { name: /Lihat Ikrar Welas Asih/i });
    fireEvent.click(seeCovenantBtn);

    // Step 4: Covenant summary
    expect(screen.getByText(/Ikrar Belas Kasih Diri Hari Ini/i)).toBeDefined();
    const finishBtn = screen.getByRole('button', { name: /Selesai & Simpan Ketenangan/i });
    fireEvent.click(finishBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
