import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DualModePillToggle } from '../DualModePillToggle';
import { useDualModeStore } from '../../../stores/dualModeStore';
import i18n from '../../../i18n/config';

describe('DualModePillToggle Component', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id');
    useDualModeStore.setState({
      operatingMode: 'airgapped',
      isAirgappedMode: true,
    });
  });

  it('renders "🛡️ Mode Luring Penuh" when Air-Gapped Mode is active in Indonesian', () => {
    render(<DualModePillToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('dual-mode-pill-airgapped');
    expect(button).toHaveTextContent(/Mode Luring Penuh/i);
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Mode Luring Penuh'));
  });

  it('toggles to "🌐 Mode Tersambung" when clicked', () => {
    render(<DualModePillToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(useDualModeStore.getState().operatingMode).toBe('connected');
    expect(button).toHaveClass('dual-mode-pill-connected');
    expect(button).toHaveTextContent(/Mode Tersambung/i);
  });

  it('toggles back to Air-Gapped when clicked again', () => {
    useDualModeStore.setState({
      operatingMode: 'connected',
      isAirgappedMode: false,
    });

    render(<DualModePillToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/Mode Tersambung/i);

    fireEvent.click(button);
    expect(useDualModeStore.getState().operatingMode).toBe('airgapped');
    expect(button).toHaveTextContent(/Mode Luring Penuh/i);
  });

  it('supports English localization seamlessly', async () => {
    await i18n.changeLanguage('en');
    act(() => {
      useDualModeStore.setState({
        operatingMode: 'airgapped',
        isAirgappedMode: true,
      });
    });

    render(<DualModePillToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/Air-Gapped Vault/i);
  });

  it('verifies accessibility toggle button semantics with aria-pressed', () => {
    // Airgapped is false (disconnected, not pressed)
    render(<DualModePillToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Toggle to connected (pressed)
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders localized 1-click hints when showHint is true', async () => {
    // Indonesian
    const { rerender } = render(<DualModePillToggle showHint={true} />);
    expect(screen.getByText('1-Klik Online')).toBeInTheDocument();

    act(() => {
      useDualModeStore.setState({ operatingMode: 'connected', isAirgappedMode: false });
      rerender(<DualModePillToggle showHint={true} />);
    });
    expect(screen.getByText('1-Klik Luring')).toBeInTheDocument();

    // English
    await i18n.changeLanguage('en');
    act(() => {
      useDualModeStore.setState({ operatingMode: 'airgapped', isAirgappedMode: true });
      rerender(<DualModePillToggle showHint={true} />);
    });
    expect(screen.getByText('1-Click Online')).toBeInTheDocument();
  });

  it('applies custom className to the container', () => {
    const { container } = render(<DualModePillToggle className="custom-test-class" />);
    expect(container.querySelector('.dual-mode-pill-container')).toHaveClass('custom-test-class');
  });
});
