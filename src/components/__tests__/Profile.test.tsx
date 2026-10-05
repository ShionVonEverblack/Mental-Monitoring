import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
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
});
