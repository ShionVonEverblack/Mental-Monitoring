import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '../../../i18n/config';
import i18n from 'i18next';
import { AuthModal } from '../AuthModal';

const mockLoginWithEmail = vi.fn();
let mockIsSupabaseConfigured = true;

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    loginWithEmail: mockLoginWithEmail,
    isSupabaseConfigured: mockIsSupabaseConfigured,
  }),
}));

describe('AuthModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(async () => {
    mockLoginWithEmail.mockReset();
    mockLoginWithEmail.mockResolvedValue(undefined);
    mockIsSupabaseConfigured = true;
    mockOnClose.mockReset();

    await act(async () => {
      await i18n.changeLanguage('id');
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================================
   * 1. Visibility & Lifecycle
   * ========================================================================= */
  describe('Visibility & Lifecycle', () => {
    it('does not render dialog content when isOpen is false', () => {
      render(<AuthModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Masuk ke Akun RIMA/i })).not.toBeInTheDocument();
    });

    it('renders modal dialog, title, email input, and action buttons when isOpen is true', () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      const heading = screen.getByRole('heading', { name: /Masuk ke Akun RIMA/i });
      expect(heading).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'nama@contoh.com');

      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();

      const cancelBtn = screen.getByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i });
      expect(cancelBtn).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 2. Offline Fallback & Unconfigured Warning
   * ========================================================================= */
  describe('Offline Fallback & Cloud Connection Status', () => {
    it('displays unconfigured warning box and disables submit when isSupabaseConfigured is false', () => {
      mockIsSupabaseConfigured = false;

      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const alertBox = screen.getByRole('alert');
      expect(alertBox).toBeInTheDocument();
      expect(alertBox).toHaveTextContent(/Layanan cloud belum terhubung/i);

      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });
      expect(submitBtn).toBeDisabled();
    });

    it('does not display warning box when isSupabaseConfigured is true', () => {
      mockIsSupabaseConfigured = true;

      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });
      expect(submitBtn).not.toBeDisabled();
    });
  });

  /* =========================================================================
   * 3. Email Validation
   * ========================================================================= */
  describe('Email Input Validation', () => {
    it('displays error on empty email submission', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });
      fireEvent.click(submitBtn);

      expect(mockLoginWithEmail).not.toHaveBeenCalled();
      const errorMsg = await screen.findByText(/Mohon masukkan format email yang valid/i);
      expect(errorMsg).toBeInTheDocument();
    });

    it('displays error on whitespace-only email submission', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      fireEvent.change(emailInput, { target: { value: '   ' } });

      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });
      fireEvent.click(submitBtn);

      expect(mockLoginWithEmail).not.toHaveBeenCalled();
      expect(await screen.findByText(/Mohon masukkan format email yang valid/i)).toBeInTheDocument();
    });

    it('displays error on malformed email format', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      // Missing @ and domain
      fireEvent.change(emailInput, { target: { value: 'notanemail' } });
      fireEvent.click(submitBtn);
      expect(mockLoginWithEmail).not.toHaveBeenCalled();
      expect(screen.getByText(/Mohon masukkan format email yang valid/i)).toBeInTheDocument();

      // Missing top-level domain
      fireEvent.change(emailInput, { target: { value: 'user@nodomain' } });
      fireEvent.click(submitBtn);
      expect(mockLoginWithEmail).not.toHaveBeenCalled();
      expect(screen.getByText(/Mohon masukkan format email yang valid/i)).toBeInTheDocument();
    });

    it('clears error message when user resumes typing in email input', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      // Trigger error
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Mohon masukkan format email yang valid/i)).toBeInTheDocument();

      // Resume typing
      fireEvent.change(emailInput, { target: { value: 'valid@' } });
      expect(screen.queryByText(/Mohon masukkan format email yang valid/i)).not.toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 4. Happy Path Submission & Sent Confirmation State
   * ========================================================================= */
  describe('Happy Path Submission & Confirmation State', () => {
    it('calls loginWithEmail and transitions to sent state with confirmation details', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockLoginWithEmail).toHaveBeenCalledWith('user@example.com');

      // Verify transition to 'sent' state (both Modal h2 and inner h3 render checkEmailTitle)
      const sentHeadings = await screen.findAllByRole('heading', { name: /Periksa Kotak Masuk Anda/i });
      expect(sentHeadings.length).toBeGreaterThanOrEqual(1);

      // Check email is reflected in instructions
      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();

      // Check incognito privacy reminder
      expect(screen.getByText(/Identitas akun disembunyikan/i)).toBeInTheDocument();

      // Sent state action buttons
      expect(screen.getByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Kirim Ulang Email/i })).toBeInTheDocument();
    });

    it('allows resending email from sent state', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      fireEvent.change(emailInput, { target: { value: 'resend@test.org' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i }));
      });

      expect(mockLoginWithEmail).toHaveBeenCalledTimes(1);

      const resendBtn = await screen.findByRole('button', { name: /Kirim Ulang Email/i });

      await act(async () => {
        fireEvent.click(resendBtn);
      });

      expect(mockLoginWithEmail).toHaveBeenCalledTimes(2);
      expect(mockLoginWithEmail).toHaveBeenLastCalledWith('resend@test.org');

      // Success feedback
      expect(await screen.findByText(/Tautan baru berhasil dikirim!/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 5. Error Handling During Submission
   * ========================================================================= */
  describe('Error Handling During Submission', () => {
    it('displays error message when loginWithEmail rejects with an Error', async () => {
      mockLoginWithEmail.mockRejectedValueOnce(new Error('Koneksi jaringan terputus.'));

      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      fireEvent.change(emailInput, { target: { value: 'error@domain.com' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i }));
      });

      expect(await screen.findByText('Koneksi jaringan terputus.')).toBeInTheDocument();
      // Remains in input mode
      expect(screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i })).toBeInTheDocument();
    });

    it('displays generic fallback error when loginWithEmail rejects with non-Error', async () => {
      mockLoginWithEmail.mockRejectedValueOnce('Unexpected failure string');

      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      fireEvent.change(emailInput, { target: { value: 'fail@domain.com' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i }));
      });

      expect(
        await screen.findByText(/Terjadi kesalahan saat mengirim tautan/i)
      ).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 6. Cancellation & Modal Dismissal
   * ========================================================================= */
  describe('Cancellation & Modal Dismissal', () => {
    it('calls onClose when "Lanjutkan sebagai Tamu Anonim" is clicked in input mode', () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const cancelBtn = screen.getByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i });
      fireEvent.click(cancelBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when "Lanjutkan sebagai Tamu Anonim" is clicked in sent mode', async () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      fireEvent.change(emailInput, { target: { value: 'guest@test.id' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i }));
      });

      const guestBtn = await screen.findByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i });
      fireEvent.click(guestBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal close button (X) is clicked', () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const closeIconBtn = screen.getByRole('button', { name: /Close modal/i });
      fireEvent.click(closeIconBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('resets input state cleanly when reopened after close', async () => {
      const { rerender } = render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'temp@test.id' } });
      expect(emailInput.value).toBe('temp@test.id');

      // Click cancel which calls handleClose
      fireEvent.click(screen.getByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i }));
      expect(mockOnClose).toHaveBeenCalled();

      // Simulate re-opening
      rerender(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const freshInput = screen.getByLabelText(/Alamat Email/i) as HTMLInputElement;
      expect(freshInput.value).toBe('');
      expect(screen.queryByText(/Mohon masukkan format email yang valid/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i })).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 7. Multi-Language Parity
   * ========================================================================= */
  describe('Multi-Language Parity', () => {
    it('localizes into English cleanly', async () => {
      await act(async () => {
        await i18n.changeLanguage('en');
      });

      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('heading', { name: /Sign in to (Your )?RIMA/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Sign-in Link \(OTP\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue as Anonymous Guest/i })).toBeInTheDocument();
    });
  });
});
