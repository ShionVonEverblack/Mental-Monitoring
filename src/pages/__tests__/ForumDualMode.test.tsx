import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Forum } from '../Forum';
import { useDualModeStore } from '../../stores/dualModeStore';
import i18n from '../../i18n/config';

describe('Forum Dual-Mode Gating & Quiet Support Reactions', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id');
    localStorage.clear();
    useDualModeStore.setState({
      operatingMode: 'airgapped',
      isAirgappedMode: true,
    });
  });

  it('renders empathetic Air-Gapped Mode banner with 1-click button to switch to Connected Mode', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Forum />
        </MemoryRouter>
      );
    });

    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass('forum-airgapped-banner');
    expect(screen.getByText(/Forum Memerlukan Mode Tersambung/i)).toBeInTheDocument();
    expect(screen.getByText(/Air-Gapped Vault/i)).toBeInTheDocument();

    const switchBtn = screen.getByRole('button', { name: /Beralih ke Mode Tersambung/i });
    expect(switchBtn).toBeInTheDocument();
  });

  it('1-click switch button immediately activates Connected Mode and removes air-gapped banner', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Forum />
        </MemoryRouter>
      );
    });

    const switchBtn = screen.getByRole('button', { name: /Beralih ke Mode Tersambung/i });
    await act(async () => {
      fireEvent.click(switchBtn);
    });

    expect(useDualModeStore.getState().operatingMode).toBe('connected');
    expect(useDualModeStore.getState().isAirgappedMode).toBe(false);
    expect(screen.queryByText(/Forum Memerlukan Mode Tersambung/i)).not.toBeInTheDocument();
  });

  it('renders quiet support resonance reactions without competitive vanity numbers', async () => {
    useDualModeStore.setState({
      operatingMode: 'connected',
      isAirgappedMode: false,
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Forum />
        </MemoryRouter>
      );
    });

    // Verify quiet support reaction buttons exist
    const hugButtons = await screen.findAllByRole('button', { name: /Kirim Pelukan Hangat/i });
    expect(hugButtons.length).toBeGreaterThan(0);

    const heartButtons = screen.getAllByRole('button', { name: /Hadir Mendengarkan/i });
    expect(heartButtons.length).toBeGreaterThan(0);

    const strengthButtons = screen.getAllByRole('button', { name: /Kirim Kekuatan Lembut/i });
    expect(strengthButtons.length).toBeGreaterThan(0);

    // Verify that the quiet support button does NOT contain competitive numeric like counts
    const firstHugBtn = hugButtons[0];
    expect(firstHugBtn.textContent).not.toMatch(/\d+/);

    // Clicking quiet support fires empathetic feedback toast
    await act(async () => {
      fireEvent.click(firstHugBtn);
    });

    expect(screen.getByText(/Dukungan empati terkirim/i)).toBeInTheDocument();
  });

  it('allows composing posts in air-gapped mode, saving locally with air-gapped toast notification', async () => {
    useDualModeStore.setState({
      operatingMode: 'airgapped',
      isAirgappedMode: true,
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Forum />
        </MemoryRouter>
      );
    });

    // Open composer
    const composeBtn = screen.getByRole('button', { name: /Buat Postingan/i });
    await act(async () => {
      fireEvent.click(composeBtn);
    });

    // Fill title and content
    const titleInput = screen.getByPlaceholderText(/Judul cerita atau pertanyaanmu/i);
    const contentInput = screen.getByPlaceholderText(/Ceritakan apa yang sedang kamu rasakan/i);

    fireEvent.change(titleInput, { target: { value: 'Cerita di Ruang Luring' } });
    fireEvent.change(contentInput, { target: { value: 'Menemukan kedamaian batin tanpa terhubung ke internet.' } });

    // Submit post
    const submitBtn = screen.getByRole('button', { name: /Kirim Cerita/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Verify air-gapped toast appears
    expect(screen.getByText(/Disimpan di Vault Luring lokal/i)).toBeInTheDocument();

    // Verify post is in feed
    expect(screen.getByText('Cerita di Ruang Luring')).toBeInTheDocument();
  });
});
