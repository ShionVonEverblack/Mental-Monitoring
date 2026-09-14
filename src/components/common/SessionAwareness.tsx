import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SessionAwareness — Gentle time reminder (Humane Technology)
 * 
 * Based on Center for Humane Technology "Time Well Spent" philosophy:
 * A mental health app should NOT extract maximum engagement time.
 * After 10 minutes, a peripheral (non-intrusive) banner gently reminds
 * the user to return to real life.
 * 
 * This is NOT a modal/popup — it's a soft ambient banner that can be
 * dismissed once per session.
 */

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const SessionAwareness: React.FC = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, SESSION_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [dismissed]);

  if (!showBanner || dismissed) return null;

  return (
    <div 
      className="session-awareness-banner"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        padding: 'var(--spacing-sm) var(--spacing-md)',
        background: 'hsla(165, 45%, 50%, 0.15)',
        borderTop: '1px solid hsla(165, 45%, 50%, 0.25)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-sm)',
        animation: 'fadeInUp 0.4s ease-out',
      }}
    >
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        🍃 {t('session.timeReminder', 'Kamu sudah di sini cukup lama. Ingat untuk kembali ke dunia nyata juga ya.')}
      </span>
      <button
        onClick={() => { setDismissed(true); setShowBanner(false); }}
        className="btn btn-ghost btn-sm"
        style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '32px' }}
      >
        {t('common.dismiss', 'Tutup')}
      </button>
    </div>
  );
};
