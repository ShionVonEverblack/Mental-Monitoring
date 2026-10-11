import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../AppShell';
import { useDualModeStore } from '../../../stores/dualModeStore';
import i18n from '../../../i18n/config';

// Mock matchMedia for responsive UI components
beforeEach(async () => {
  await i18n.changeLanguage('id');
  useDualModeStore.setState({
    operatingMode: 'connected',
    isAirgappedMode: false,
  });
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
});

describe('AppShell Layout Component', () => {
  it('renders header with DualModePillToggle and accessible role and aria-label', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div data-testid="test-child">Child Content</div>
        </AppShell>
      </MemoryRouter>
    );

    const header = document.querySelector('.app-shell-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('aria-label', expect.stringContaining('Mode Operasional'));

    const toggleBtn = screen.getByRole('button', { name: /Mode Tersambung/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveTextContent(/Mode Tersambung/i);

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('renders DualModePillToggle in Air-Gapped mode inside AppShell header', () => {
    useDualModeStore.setState({
      operatingMode: 'airgapped',
      isAirgappedMode: true,
    });

    render(
      <MemoryRouter>
        <AppShell>
          <div>Main Content</div>
        </AppShell>
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /Mode Luring Penuh/i });
    expect(toggleBtn).toHaveTextContent(/Mode Luring Penuh/i);
    expect(toggleBtn).toHaveClass('dual-mode-pill-airgapped');
  });

  it('preserves skip-link and quick exit button for accessibility and crisis safety', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Main Content</div>
        </AppShell>
      </MemoryRouter>
    );

    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const quickExit = document.querySelector('.quick-exit-btn');
    expect(quickExit).toBeInTheDocument();
  });
});
