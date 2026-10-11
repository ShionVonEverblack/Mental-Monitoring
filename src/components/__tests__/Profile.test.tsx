import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { Profile } from '../../pages/Profile';
import * as exportImport from '../../utils/exportImport';

beforeEach(async () => {
  localStorage.clear();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  await i18n.changeLanguage('id');
});

describe('Profile Component - Import File Handling', () => {
  it('resets file input value after selection allowing same file re-upload', async () => {
    const importSpy = vi.spyOn(exportImport, 'importDataFromJSON').mockReturnValue({
      success: true,
      message: 'Impor berhasil',
    });

    const { container } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const mockFile = new File(['{"version":"1.0","moods":[]}'], 'backup.json', { type: 'application/json' });

    // Simulate selecting the file
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // The input value must be reset to empty string immediately so re-selecting same file fires change event
    expect(fileInput.value).toBe('');

    await waitFor(() => {
      expect(importSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('toggles Low-Stimulation sensory mode and applies data-sensory attribute', async () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const sensoryBtn = getByRole('button', { name: /Mode Sensori Tenang/i });
    expect(sensoryBtn).toBeInTheDocument();
    expect(document.documentElement.hasAttribute('data-sensory')).toBe(false);

    await act(async () => {
      fireEvent.click(sensoryBtn);
    });
    expect(document.documentElement.getAttribute('data-sensory')).toBe('calm');

    await act(async () => {
      fireEvent.click(sensoryBtn);
    });
    expect(document.documentElement.hasAttribute('data-sensory')).toBe(false);
  });

  it('renders Dual-Mode operating settings and allows toggling between Air-Gapped and Connected modes', async () => {
    let rendered: ReturnType<typeof render>;
    await act(async () => {
      rendered = render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });

    const { getByText, getAllByRole } = rendered!;

    // Verify section title is present
    expect(getByText(/MODE OPERASIONAL \(DUAL-MODE\)/i)).toBeInTheDocument();

    // Verify toggle button is present
    const toggleButtons = getAllByRole('button', { name: /Mode Tersambung|Mode Luring Penuh/i });
    expect(toggleButtons.length).toBeGreaterThan(0);

    const toggleBtn = toggleButtons[0];
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Should now indicate air-gapped mode
    expect(getByText(/Mode Luring Penuh \(Air-Gapped Vault\)/i)).toBeInTheDocument();
  });

  it('renders seedling recovery streak icon instead of toxic flame gamification icon', async () => {
    let rendered: ReturnType<typeof render>;
    await act(async () => {
      rendered = render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });

    const statValues = rendered!.container.querySelectorAll('.stat-value');
    const statTexts = Array.from(statValues).map(el => el.textContent || '');

    // Must celebrate with gentle seedling 🌱 and never with punitive flame 🔥
    const hasSeedling = statTexts.some(text => text.includes('🌱'));
    const hasFlame = statTexts.some(text => text.includes('🔥'));

    expect(hasSeedling).toBe(true);
    expect(hasFlame).toBe(false);
  });
});
