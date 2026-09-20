import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import i18n from '../../i18n/config';
import { CbtWizard } from '../journal/CbtWizard';
import { COGNITIVE_DISTORTIONS } from '../../utils/constants';

// Mock window.scrollTo and enforce Indonesian for tests
beforeEach(async () => {
  window.scrollTo = vi.fn();
  await i18n.changeLanguage('id');
});

describe('CbtWizard Component', () => {
  it('renders Step 1 with situation textarea and intensity slider', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(<CbtWizard onSave={handleSave} onCancel={handleCancel} />);

    expect(screen.getByText(/Pembedah Pikiran \(CBT Wizard\)/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Apa peristiwa objektif yang terjadi\?/i)).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /intensitas emosi saat itu/i })).toBeInTheDocument();
  });

  it('disables next button until situation is entered in Step 1', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(<CbtWizard onSave={handleSave} onCancel={handleCancel} />);

    const nextBtn = screen.getByRole('button', { name: /lanjutkan/i });
    expect(nextBtn).toBeDisabled();

    const situationInput = screen.getByLabelText(/Apa peristiwa objektif yang terjadi\?/i);
    fireEvent.change(situationInput, { target: { value: 'Pesan saya tidak dibalas seharian' } });

    expect(nextBtn).not.toBeDisabled();
  });

  it('navigates through all 5 steps and submits structured CBT record on completion', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(<CbtWizard onSave={handleSave} onCancel={handleCancel} />);

    // --- STEP 1 ---
    const situationInput = screen.getByLabelText(/Apa peristiwa objektif yang terjadi\?/i);
    fireEvent.change(situationInput, { target: { value: 'Manajer belum membalas email proyek penting' } });
    
    // Select emotion 'anxious' (Cemas)
    const anxiousChip = screen.getByRole('button', { name: /cemas/i });
    fireEvent.click(anxiousChip);

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }));

    // --- STEP 2 ---
    expect(screen.getByText(/2\. Apa pikiran spontan yang langsung muncul\?/i)).toBeInTheDocument();
    const thoughtInput = screen.getByLabelText(/Apa pikiran spontan yang langsung muncul\?/i);
    fireEvent.change(thoughtInput, { target: { value: 'Dia pasti kecewa dengan performa kerja saya' } });

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }));

    // --- STEP 3 ---
    expect(screen.getByText(/3\. Deteksi Jebakan Pikiran/i)).toBeInTheDocument();
    // Toggle Mind Reading distortion
    const mindReadingCard = screen.getByRole('button', { name: /membaca pikiran/i });
    fireEvent.click(mindReadingCard);
    expect(mindReadingCard).toHaveAttribute('aria-pressed', 'true');

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }));

    // --- STEP 4 ---
    expect(screen.getByText(/4\. Uji Bukti Secara Objektif/i)).toBeInTheDocument();
    const evidenceFor = screen.getByPlaceholderText(/tulis fakta nyata yang mendukung/i);
    const evidenceAgainst = screen.getByPlaceholderText(/dia mungkin sedang rapat padat/i);

    fireEvent.change(evidenceFor, { target: { value: 'Email sudah 4 jam terkirim' } });
    fireEvent.change(evidenceAgainst, { target: { value: 'Kemarin beliau memuji hasil draft pertama' } });

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }));

    // --- STEP 5 ---
    expect(screen.getByText(/5\. Formulasi Pikiran Baru yang Seimbang/i)).toBeInTheDocument();
    const balancedInput = screen.getByLabelText(/Formulasi Pikiran Baru yang Seimbang/i);
    fireEvent.change(balancedInput, {
      target: { value: 'Belum dibalas bukan berarti kecewa, beliau memang sering sibuk di hari Senin.' },
    });

    // Adjust final intensity slider to 3
    const finalSlider = screen.getByRole('slider', { name: /intensitas emosimu sekarang/i });
    fireEvent.change(finalSlider, { target: { value: '3' } });

    // Verify emotional relief message is shown
    expect(screen.getByText(/Bagus sekali! Beban emosimu berkurang/i)).toBeInTheDocument();

    // Finish & Save
    const saveBtn = screen.getByRole('button', { name: /simpan ke jurnal/i });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    const payload = handleSave.mock.calls[0][0];

    expect(payload.cbtRecord).toEqual({
      situation: 'Manajer belum membalas email proyek penting',
      initialEmotion: 'anxious',
      initialIntensity: 7,
      automaticThought: 'Dia pasti kecewa dengan performa kerja saya',
      distortions: ['mind_reading'],
      evidenceFor: 'Email sudah 4 jam terkirim',
      evidenceAgainst: 'Kemarin beliau memuji hasil draft pertama',
      balancedThought: 'Belum dibalas bukan berarti kecewa, beliau memang sering sibuk di hari Senin.',
      finalIntensity: 3,
    });
    expect(payload.content).toContain('[Pembedah Pikiran CBT]');
    expect(payload.content).toContain('Membaca Pikiran');
    expect(payload.content).toContain('Evaluasi Emosi Akhir: 3/10 (Penurunan: 4 poin)');
  });

  it('supports back navigation between steps', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(<CbtWizard onSave={handleSave} onCancel={handleCancel} />);

    const situationInput = screen.getByLabelText(/Apa peristiwa objektif yang terjadi\?/i);
    fireEvent.change(situationInput, { target: { value: 'Situasi pengujian' } });

    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }));
    expect(screen.getByText(/2\. Apa pikiran spontan yang langsung muncul\?/i)).toBeInTheDocument();

    // Click Back
    fireEvent.click(screen.getByRole('button', { name: /sebelumnya/i }));
    expect(screen.getByText(/1\. Apa peristiwa objektif yang terjadi\?/i)).toBeInTheDocument();
  });

  it('invokes onCancel when cancel button is clicked', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(<CbtWizard onSave={handleSave} onCancel={handleCancel} />);

    // Cancel in step 1 footer or header
    const cancelBtns = screen.getAllByRole('button', { name: /batal/i });
    fireEvent.click(cancelBtns[0]);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('exports all 8 evidence-based cognitive distortions', () => {
    expect(COGNITIVE_DISTORTIONS).toHaveLength(8);
    const distortionIds = COGNITIVE_DISTORTIONS.map(d => d.id);
    expect(distortionIds).toEqual([
      'catastrophizing',
      'all_or_nothing',
      'mind_reading',
      'overgeneralization',
      'emotional_reasoning',
      'should_statements',
      'personalization',
      'mental_filter',
    ]);
  });
});
