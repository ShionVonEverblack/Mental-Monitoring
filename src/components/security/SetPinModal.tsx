import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import {
  hashPin,
  verifyPin,
  getLockoutStatus,
  recordFailedAttempt,
  resetLockout,
  type LockoutStatus
} from '../../utils/security';
import { Lock, Delete, AlertTriangle } from 'lucide-react';

interface SetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'set' | 'change' | 'disable';
  onSuccess: () => void;
}

export const SetPinModal: React.FC<SetPinModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSuccess
}) => {
  const { t } = useTranslation();

  // Current step:
  // 'verify-current': enter current PIN (for 'change' or 'disable')
  // 'enter-new': enter new PIN (for 'set' or after verifying current)
  // 'confirm-new': confirm new PIN
  const [step, setStep] = useState<'verify-current' | 'enter-new' | 'confirm-new'>(
    mode === 'set' ? 'enter-new' : 'verify-current'
  );

  const [pinInput, setPinInput] = useState<string>('');
  const [newPinCandidate, setNewPinCandidate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockout, setLockout] = useState<LockoutStatus>(() => getLockoutStatus());

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setNewPinCandidate('');
      setErrorMsg(null);
      setStep(mode === 'set' ? 'enter-new' : 'verify-current');
      setLockout(getLockoutStatus());
    }
  }, [isOpen, mode]);

  // Live countdown timer during lockout when verifying current PIN
  useEffect(() => {
    if (!lockout.isLockedOut || step !== 'verify-current') return;

    const interval = setInterval(() => {
      const current = getLockoutStatus();
      setLockout(current);
      if (!current.isLockedOut) {
        setErrorMsg(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockout.isLockedOut, step]);

  const isKeypadDisabled = isProcessing || (step === 'verify-current' && lockout.isLockedOut);

  const handleDigit = useCallback((digit: string) => {
    if (isKeypadDisabled) return;
    setErrorMsg(null);
    setPinInput(prev => {
      if (prev.length >= 4) return prev;
      return prev + digit;
    });
  }, [isKeypadDisabled]);

  const handleDelete = useCallback(() => {
    if (isKeypadDisabled) return;
    setErrorMsg(null);
    setPinInput(prev => prev.slice(0, -1));
  }, [isKeypadDisabled]);

  const handleClear = useCallback(() => {
    if (isKeypadDisabled) return;
    setErrorMsg(null);
    setPinInput('');
  }, [isKeypadDisabled]);

  // Submit step when 4 digits are entered
  const processPin = useCallback(async (pinToProcess: string) => {
    if (pinToProcess.length !== 4) return;

    if (step === 'verify-current') {
      const currentLockout = getLockoutStatus();
      if (currentLockout.isLockedOut) {
        setLockout(currentLockout);
        setPinInput('');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const storedHash = localStorage.getItem('rima-app-lock-pin') || '';

      if (step === 'verify-current') {
        const isValid = await verifyPin(pinToProcess, storedHash);
        if (!isValid) {
          const updatedStatus = recordFailedAttempt();
          setLockout(updatedStatus);
          setPinInput('');
          setIsProcessing(false);

          if (updatedStatus.isLockedOut) {
            setErrorMsg(
              t('appLock.tooManyAttempts', 'Terlalu banyak percobaan gagal. Silakan coba lagi dalam {{seconds}} detik.', {
                seconds: updatedStatus.remainingSeconds
              })
            );
          } else {
            const remaining = updatedStatus.maxAttempts - updatedStatus.failedAttempts;
            setErrorMsg(
              t('appLock.attemptsRemaining', 'PIN salah. Sisa percobaan: {{count}}', {
                count: remaining
              })
            );
          }
          return;
        }

        // Valid current PIN
        resetLockout();
        setLockout(getLockoutStatus());

        if (mode === 'disable') {
          localStorage.removeItem('rima-app-lock-pin');
          localStorage.setItem('rima-app-lock-enabled', 'false');
          sessionStorage.removeItem('rima-app-unlocked');
          window.dispatchEvent(new Event('local-storage'));
          onSuccess();
          onClose();
        } else {
          // Mode change: proceed to enter new PIN
          setStep('enter-new');
          setPinInput('');
        }
      } else if (step === 'enter-new') {
        setNewPinCandidate(pinToProcess);
        setStep('confirm-new');
        setPinInput('');
      } else if (step === 'confirm-new') {
        if (pinToProcess !== newPinCandidate) {
          setErrorMsg(t('appLock.pinMismatch', 'Konfirmasi PIN tidak cocok. Silakan ulangi.'));
          setStep('enter-new');
          setNewPinCandidate('');
          setPinInput('');
          setIsProcessing(false);
          return;
        }

        const hashed = await hashPin(pinToProcess);
        localStorage.setItem('rima-app-lock-pin', hashed);
        localStorage.setItem('rima-app-lock-enabled', 'true');
        sessionStorage.setItem('rima-app-unlocked', 'true');
        window.dispatchEvent(new Event('local-storage'));
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error processing PIN:', err);
      setErrorMsg(t('common.error', 'Terjadi kesalahan'));
    } finally {
      setIsProcessing(false);
    }
  }, [step, mode, newPinCandidate, t, onSuccess, onClose]);

  // Trigger process when pin reaches 4 digits
  useEffect(() => {
    if (pinInput.length === 4) {
      processPin(pinInput);
    }
  }, [pinInput, processPin]);

  // Keyboard handler for physical typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'verify-current' && lockout.isLockedOut) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, lockout.isLockedOut, handleDigit, handleDelete, onClose]);

  const getStepTitle = () => {
    if (step === 'verify-current') {
      if (lockout.isLockedOut) return t('appLock.lockedOutTitle', 'Akses Dikunci Sementara');
      return t('appLock.enterCurrentPin', 'Masukkan PIN Saat Ini');
    }
    if (step === 'enter-new') {
      return t('appLock.enterNewPin', 'Masukkan PIN Baru (4-Digit)');
    }
    return t('appLock.confirmNewPin', 'Konfirmasi PIN Baru');
  };

  const getStepDesc = () => {
    if (step === 'verify-current') {
      if (lockout.isLockedOut) return t('appLock.lockedOutDesc', 'Keamanan aktif: batasi percobaan berulang');
      return mode === 'disable'
        ? t('appLock.verifyToDisable', 'Verifikasi identitas Anda untuk menonaktifkan kunci aplikasi.')
        : t('appLock.verifyToChange', 'Verifikasi identitas Anda sebelum mengatur PIN baru.');
    }
    if (step === 'enter-new') {
      return t('appLock.newPinPrompt', 'Gunakan kombinasi 4 digit angka yang mudah Anda ingat.');
    }
    return t('appLock.confirmPinPrompt', 'Ketik ulang 4 digit PIN Anda untuk memastikan kesesuaian.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('appLock.title', 'Kunci Aplikasi (PIN 4-Digit)')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: (step === 'verify-current' && lockout.isLockedOut)
            ? 'hsla(0, 84%, 60%, 0.15)'
            : 'hsla(215, 65%, 55%, 0.15)',
          color: (step === 'verify-current' && lockout.isLockedOut)
            ? 'var(--color-danger)'
            : 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          transition: 'all 0.3s'
        }}>
          {(step === 'verify-current' && lockout.isLockedOut) ? <AlertTriangle size={26} /> : <Lock size={26} />}
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', textAlign: 'center' }}>
          {getStepTitle()}
        </h3>
        <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', margin: '0 0 20px', textAlign: 'center', maxWidth: '300px' }}>
          {getStepDesc()}
        </p>

        {/* 4 Pin Dots */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          alignItems: 'center',
          opacity: (step === 'verify-current' && lockout.isLockedOut) ? 0.4 : 1
        }}>
          {[0, 1, 2, 3].map(index => {
            const isFilled = index < pinInput.length;
            return (
              <div
                key={index}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: isFilled ? '2px solid var(--color-primary)' : '2px solid var(--border-strong)',
                  backgroundColor: isFilled ? 'var(--color-primary)' : 'transparent',
                  transition: 'all 0.15s ease-in-out',
                  transform: isFilled ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div style={{
            color: 'var(--color-danger)',
            fontSize: '0.813rem',
            marginBottom: '16px',
            textAlign: 'center',
            fontWeight: 500,
            animation: 'fadeIn 0.2s',
            maxWidth: '280px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          width: '100%',
          maxWidth: '280px',
          marginBottom: '16px',
          opacity: isKeypadDisabled ? 0.4 : 1,
          pointerEvents: isKeypadDisabled ? 'none' : 'auto',
          transition: 'opacity 0.2s'
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              className="btn btn-ghost"
              disabled={isKeypadDisabled}
              style={{
                height: '52px',
                fontSize: '1.25rem',
                fontWeight: 600,
                borderRadius: '16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              onClick={() => handleDigit(num)}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-ghost"
            disabled={isKeypadDisabled || pinInput.length === 0}
            style={{
              height: '52px',
              fontSize: '0.875rem',
              borderRadius: '16px',
              color: 'var(--text-tertiary)'
            }}
            onClick={handleClear}
          >
            C
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={isKeypadDisabled}
            style={{
              height: '52px',
              fontSize: '1.25rem',
              fontWeight: 600,
              borderRadius: '16px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            onClick={() => handleDigit('0')}
          >
            0
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={isKeypadDisabled || pinInput.length === 0}
            style={{
              height: '52px',
              borderRadius: '16px',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleDelete}
            aria-label={t('common.delete', 'Hapus')}
          >
            <Delete size={20} />
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ marginTop: '8px' }}
        >
          {t('common.cancel', 'Batal')}
        </button>
      </div>
    </Modal>
  );
};
