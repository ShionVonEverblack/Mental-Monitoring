import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '../../../i18n/config';
import i18n from 'i18next';
import { IncognitoPillToggle } from '../IncognitoPillToggle';

const mockToggleAnonymousMode = vi.fn();
let mockIsAnonymousMode = true;
let mockIsAuthenticated = false;

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAnonymousMode: mockIsAnonymousMode,
    isAuthenticated: mockIsAuthenticated,
    toggleAnonymousMode: mockToggleAnonymousMode,
  }),
}));

describe('IncognitoPillToggle Component', () => {
  beforeEach(async () => {
    mockIsAnonymousMode = true;
    mockIsAuthenticated = false;
    mockToggleAnonymousMode.mockReset();
    mockToggleAnonymousMode.mockReturnValue({ success: true, requiresAuth: false });
    await act(async () => {
      await i18n.changeLanguage('id');
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================================
   * 1. Mode Anonim (Anonymous Mode) Render State
   * ========================================================================= */
  describe('Anonymous Mode (Active)', () => {
    it('renders "🕶️ Mode Anonim Aktif" with active class when isAnonymousMode is true', () => {
      mockIsAnonymousMode = true;
      mockIsAuthenticated = false;

      render(<IncognitoPillToggle />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('incognito-pill-btn', 'incognito-pill-active');
      expect(button).toHaveAttribute('type', 'button');

      // Emoji and text label
      expect(button.querySelector('.incognito-pill-emoji')).toHaveTextContent('🕶️');
      expect(button.querySelector('.incognito-pill-label')).toHaveTextContent('Mode Anonim Aktif');
    });

    it('displays "Hubungkan Akun" title tooltip when anonymous and unauthenticated', () => {
      mockIsAnonymousMode = true;
      mockIsAuthenticated = false;

      render(<IncognitoPillToggle />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      expect(button).toHaveAttribute('title', 'Hubungkan Akun');
    });

    it('displays "Gunakan Akun Terhubung" title tooltip when anonymous but user is authenticated', () => {
      mockIsAnonymousMode = true;
      mockIsAuthenticated = true;

      render(<IncognitoPillToggle />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      expect(button).toHaveAttribute('title', 'Gunakan Akun Terhubung');
    });
  });

  /* =========================================================================
   * 2. Toggle Interactions in Anonymous Mode
   * ========================================================================= */
  describe('Toggle Actions in Anonymous Mode', () => {
    it('triggers onRequireAuth when unauthenticated and anonymous toggle is clicked', () => {
      mockIsAnonymousMode = true;
      mockIsAuthenticated = false;
      mockToggleAnonymousMode.mockReturnValue({ success: false, requiresAuth: true });

      const onRequireAuth = vi.fn();
      render(<IncognitoPillToggle onRequireAuth={onRequireAuth} />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      fireEvent.click(button);

      expect(mockToggleAnonymousMode).toHaveBeenCalledTimes(1);
      expect(onRequireAuth).toHaveBeenCalledTimes(1);
    });

    it('does not throw when unauthenticated and onRequireAuth is not provided', () => {
      mockIsAnonymousMode = true;
      mockIsAuthenticated = false;
      mockToggleAnonymousMode.mockReturnValue({ success: false, requiresAuth: true });

      render(<IncognitoPillToggle />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      expect(() => fireEvent.click(button)).not.toThrow();
      expect(mockToggleAnonymousMode).toHaveBeenCalledTimes(1);
    });

    it('switches to account mode without calling onRequireAuth when user is already authenticated', () => {
      mockIsAnonymousMode = true;
      mockIsAuthenticated = true;
      mockToggleAnonymousMode.mockReturnValue({ success: true, requiresAuth: false });

      const onRequireAuth = vi.fn();
      render(<IncognitoPillToggle onRequireAuth={onRequireAuth} />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      fireEvent.click(button);

      expect(mockToggleAnonymousMode).toHaveBeenCalledTimes(1);
      expect(onRequireAuth).not.toHaveBeenCalled();
    });
  });

  /* =========================================================================
   * 3. Mode Akun Terhubung (Connected Account Mode) Render & 1-Click Return
   * ========================================================================= */
  describe('Connected Account Mode', () => {
    it('renders "👤 Akun Terhubung" with hint and account class when isAnonymousMode is false', () => {
      mockIsAnonymousMode = false;
      mockIsAuthenticated = true;

      render(<IncognitoPillToggle />);

      const button = screen.getByRole('button', { name: /Akun Terhubung/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('incognito-pill-btn', 'incognito-pill-account');
      expect(button).toHaveAttribute('type', 'button');

      // Emoji, label, and 1-Click hint
      expect(button.querySelector('.incognito-pill-emoji')).toHaveTextContent('👤');
      expect(button.querySelector('.incognito-pill-label')).toHaveTextContent('Akun Terhubung');
      expect(button.querySelector('.incognito-pill-hint')).toHaveTextContent('1-Klik Anonim');

      // Tooltip title
      expect(button).toHaveAttribute('title', 'Aktifkan Mode Anonim');
    });

    it('performs 1-click return to anonymous mode when account is connected and clicked', () => {
      mockIsAnonymousMode = false;
      mockIsAuthenticated = true;
      mockToggleAnonymousMode.mockReturnValue({ success: true, requiresAuth: false });

      const onRequireAuth = vi.fn();
      render(<IncognitoPillToggle onRequireAuth={onRequireAuth} />);

      const button = screen.getByRole('button', { name: /Akun Terhubung/i });
      fireEvent.click(button);

      expect(mockToggleAnonymousMode).toHaveBeenCalledTimes(1);
      expect(onRequireAuth).not.toHaveBeenCalled();
    });
  });

  /* =========================================================================
   * 4. Styling & Custom Classes
   * ========================================================================= */
  describe('Styling & Accessibility Properties', () => {
    it('appends custom className correctly', () => {
      mockIsAnonymousMode = true;

      render(<IncognitoPillToggle className="custom-zen-header-pill extra-test-class" />);

      const button = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      expect(button).toHaveClass('custom-zen-header-pill');
      expect(button).toHaveClass('extra-test-class');
      expect(button).toHaveClass('incognito-pill-btn');
    });

    it('has accessible aria-label matching visual label in both modes', () => {
      mockIsAnonymousMode = true;
      const { unmount } = render(<IncognitoPillToggle />);
      expect(screen.getByRole('button', { name: 'Mode Anonim Aktif' })).toBeInTheDocument();
      unmount();

      mockIsAnonymousMode = false;
      render(<IncognitoPillToggle />);
      expect(screen.getByRole('button', { name: 'Akun Terhubung' })).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 5. Multi-Language Parity
   * ========================================================================= */
  describe('Multi-Language Parity', () => {
    it('localizes labels cleanly into English', async () => {
      await act(async () => {
        await i18n.changeLanguage('en');
      });

      mockIsAnonymousMode = true;
      const { unmount } = render(<IncognitoPillToggle />);
      expect(screen.getByRole('button', { name: /Anonymous Mode Active/i })).toBeInTheDocument();
      unmount();

      mockIsAnonymousMode = false;
      render(<IncognitoPillToggle />);
      expect(screen.getByRole('button', { name: /Account Connected/i })).toBeInTheDocument();
    });
  });
});
