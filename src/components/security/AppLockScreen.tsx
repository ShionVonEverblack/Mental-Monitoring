import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyPin } from '../../utils/security';
import { Shield, Lock, Delete, LogOut } from 'lucide-react';

export const AppLockScreen: React.FC = () => {
  const { t } = useTranslation();

  const isLockEnabled = () => localStorage.getItem('rima-app-lock-enabled') === 'true';
  const isUnlockedThisSession = () => sessionStorage.getItem('rima-app-unlocked') === 'true';

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return isLockEnabled() && !isUnlockedThisSession();
  });

  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Synchronize lock state on storage events (e.g. user toggled or locked from Profile)
  useEffect(() => {
    const checkState = () => {
      setIsLocked(isLockEnabled() && !isUnlockedThisSession());
    };

    window.addEventListener('storage', checkState);
    window.addEventListener('local-storage', checkState);
    return () => {
      window.removeEventListener('storage', checkState);
      window.removeEventListener('local-storage', checkState);
    };
  }, []);

  const handleDigit = useCallback((digit: string) => {
    setErrorMsg(null);
    setPin(prev => {
      if (prev.length >= 4) return prev;
      return prev + digit;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setErrorMsg(null);
    setPin(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setErrorMsg(null);
    setPin('');
  }, []);

  const verifyAndUnlock = useCallback(async (pinInput: string) => {
    if (pinInput.length !== 4) return;
    setIsVerifying(true);

    try {
      const storedHash = localStorage.getItem('rima-app-lock-pin') || '';
      const isValid = await verifyPin(pinInput, storedHash);

      if (isValid) {
        sessionStorage.setItem('rima-app-unlocked', 'true');
        setIsLocked(false);
        setPin('');
        setErrorMsg(null);
      } else {
        setErrorMsg(t('appLock.incorrectPin', 'PIN salah. Silakan coba lagi.'));
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 500);
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setErrorMsg(t('common.error', 'Terjadi kesalahan'));
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }, [t]);

  useEffect(() => {
    if (pin.length === 4) {
      verifyAndUnlock(pin);
    }
  }, [pin, verifyAndUnlock]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, handleDigit, handleDelete]);

  if (!isLocked) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('appLock.title', 'Kunci Aplikasi')}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Quick Exit in top right */}
      <a
        href="https://www.google.com"
        className="btn btn-ghost btn-sm"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.813rem',
          color: 'var(--text-tertiary)'
        }}
        title={t('accessibility.quickExit', 'Quick Exit')}
      >
        <LogOut size={16} />
        <span>{t('appLock.quickExit', 'Keluar Cepat')}</span>
      </a>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '320px',
        width: '100%'
      }}>
        {/* Lock Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'hsla(215, 65%, 55%, 0.12)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 24px hsla(215, 65%, 55%, 0.18)'
        }}>
          <Lock size={32} />
        </div>

        <h1 style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          textAlign: 'center'
        }}>
          {t('appLock.enterPin', 'Masukkan PIN 4-Digit')}
        </h1>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '0 0 28px',
          textAlign: 'center'
        }}>
          {t('appLock.protectedPrompt', 'Ruang pribadi Anda terlindungi')}
        </p>

        {/* 4 Pin Indicator Dots */}
        <div
          style={{
            display: 'flex',
            gap: '18px',
            marginBottom: '28px',
            alignItems: 'center',
            transform: isShaking ? 'translateX(-8px)' : 'none',
            transition: isShaking ? 'transform 0.08s ease-in-out' : 'none'
          }}
        >
          {[0, 1, 2, 3].map(index => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: isFilled ? '2px solid var(--color-primary)' : '2px solid var(--border-strong)',
                  backgroundColor: isFilled ? 'var(--color-primary)' : 'transparent',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFilled ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: isFilled ? '0 0 10px hsla(215, 65%, 55%, 0.4)' : 'none'
                }}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div style={{
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {errorMsg}
          </div>
        )}

        {/* Keypad Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          width: '100%',
          maxWidth: '280px',
          marginBottom: '20px'
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              className="btn btn-ghost"
              disabled={isVerifying}
              style={{
                height: '56px',
                fontSize: '1.375rem',
                fontWeight: 600,
                borderRadius: '18px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                transition: 'transform 0.1s ease, background-color 0.15s'
              }}
              onClick={() => handleDigit(num)}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-ghost"
            disabled={isVerifying || pin.length === 0}
            style={{
              height: '56px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '18px',
              color: 'var(--text-tertiary)'
            }}
            onClick={handleClear}
          >
            C
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={isVerifying}
            style={{
              height: '56px',
              fontSize: '1.375rem',
              fontWeight: 600,
              borderRadius: '18px',
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
            disabled={isVerifying || pin.length === 0}
            style={{
              height: '56px',
              borderRadius: '18px',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleDelete}
            aria-label={t('common.delete', 'Hapus')}
          >
            <Delete size={22} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          marginTop: '8px'
        }}>
          <Shield size={14} style={{ color: 'var(--color-secondary)' }} />
          <span>{t('profile.anonBadge', 'Profil Anonim Aman • Terjaga di Perangkat')}</span>
        </div>
      </div>
    </div>
  );
};
