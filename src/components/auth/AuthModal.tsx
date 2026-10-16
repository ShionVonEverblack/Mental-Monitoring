import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { Mail, CheckCircle2, Shield, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { loginWithEmail, isSupabaseConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'input' | 'sending' | 'sent'>('input');
  const [resendSuccess, setResendSuccess] = useState(false);

  const validateEmail = (val: string) => {
    const s = val.trim();
    return s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t('auth.invalidEmail', 'Mohon masukkan format email yang valid.'));
      return;
    }
    if (!validateEmail(trimmed)) {
      setError(t('auth.invalidEmail', 'Mohon masukkan format email yang valid.'));
      return;
    }

    setError(null);
    setStatus('sending');

    try {
      await loginWithEmail(trimmed);
      setStatus('sent');
    } catch (err: unknown) {
      setStatus('input');
      const msg = err instanceof Error ? err.message : t('auth.errorGeneric', 'Terjadi kesalahan saat mengirim tautan. Silakan coba beberapa saat lagi.');
      setError(msg);
    }
  };

  const handleResend = async () => {
    const trimmed = email.trim();
    if (!trimmed || !validateEmail(trimmed)) return;
    try {
      await loginWithEmail(trimmed);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.errorGeneric', 'Terjadi kesalahan saat mengirim tautan. Silakan coba beberapa saat lagi.');
      setError(msg);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setStatus('input');
    setResendSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={status === 'sent' ? t('auth.checkEmailTitle', 'Periksa Kotak Masuk Anda') : t('auth.modalTitle', 'Masuk ke Akun RIMA')}
    >
      {status === 'sent' ? (
        <div className="auth-modal-sent">
          <div className="auth-sent-icon-wrapper">
            <CheckCircle2 className="auth-sent-icon" aria-hidden="true" />
          </div>
          <h3 className="auth-sent-heading">{t('auth.checkEmailTitle', 'Periksa Kotak Masuk Anda')}</h3>
          <p className="auth-sent-desc">
            {t('auth.checkEmailDesc', { email: email.trim(), defaultValue: `Kami telah mengirim tautan masuk ajaib ke ${email.trim()}. Klik tautan tersebut di peramban Anda untuk masuk.` })}
          </p>
          <div className="auth-sent-note">
            <Shield size={16} style={{ flexShrink: 0, color: 'var(--color-secondary)' }} aria-hidden="true" />
            <span>{t('incognito.statusActiveDesc', 'Identitas akun disembunyikan. Anda tampil sebagai nama samaran di forum, dan data tersimpan privat.')}</span>
          </div>

          <div className="auth-modal-actions">
            <Button
              variant="primary"
              onClick={handleClose}
              className="auth-btn-full"
            >
              {t('auth.backToGuest', 'Lanjutkan sebagai Tamu Anonim')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              className="auth-btn-full"
              icon={<RefreshCw size={15} />}
            >
              {resendSuccess ? t('auth.resendSuccess', 'Tautan baru berhasil dikirim!') : t('auth.resendBtn', 'Kirim Ulang Email')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-modal-form" noValidate>
          <p className="auth-modal-desc">
            {t('auth.modalSubtitle', 'Masukkan alamat email Anda untuk menerima tautan masuk satu kali (Magic Link OTP). Bebas kata sandi dan aman.')}
          </p>

          {!isSupabaseConfigured && (
            <div className="auth-warning-box" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
              <span>{t('auth.localModeWarning', 'Layanan cloud belum terhubung. Aplikasi tetap beroperasi penuh dalam mode lokal privat.')}</span>
            </div>
          )}

          <Input
            label={t('auth.emailLabel', 'Alamat Email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t('auth.emailPlaceholder', 'nama@contoh.com')}
            icon={<Mail size={18} />}
            error={error || undefined}
            autoFocus
            disabled={status === 'sending'}
            required
            aria-required="true"
          />

          <div className="auth-modal-actions">
            <Button
              type="submit"
              variant="primary"
              loading={status === 'sending'}
              disabled={status === 'sending' || !isSupabaseConfigured}
              className="auth-btn-full"
            >
              {status === 'sending' ? t('auth.sending', 'Mengirim tautan...') : t('auth.sendOtpBtn', 'Kirim Tautan Masuk (OTP)')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={status === 'sending'}
              className="auth-btn-full"
              icon={<ArrowLeft size={16} />}
            >
              {t('auth.backToGuest', 'Lanjutkan sebagai Tamu Anonim')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
