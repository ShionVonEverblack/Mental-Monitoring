import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export interface IncognitoPillToggleProps {
  onRequireAuth?: () => void;
  className?: string;
}

export const IncognitoPillToggle: React.FC<IncognitoPillToggleProps> = ({
  onRequireAuth,
  className = '',
}) => {
  const { t } = useTranslation();
  const { isAnonymousMode, isAuthenticated, toggleAnonymousMode } = useAuth();

  const handleToggle = () => {
    const result = toggleAnonymousMode();
    if (!result.success && result.requiresAuth && onRequireAuth) {
      onRequireAuth();
    }
  };

  if (isAnonymousMode) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`incognito-pill-btn incognito-pill-active ${className}`.trim()}
        aria-label={t('incognito.activeBadge', 'Mode Anonim Aktif')}
        title={isAuthenticated ? t('incognito.turnOff', 'Gunakan Akun Terhubung') : t('nav.guestBannerAction', 'Hubungkan Akun')}
      >
        <span className="incognito-pill-emoji" aria-hidden="true">🕶️</span>
        <span className="incognito-pill-label">{t('incognito.activeBadge', 'Mode Anonim Aktif')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`incognito-pill-btn incognito-pill-account ${className}`.trim()}
      aria-label={t('incognito.connectedBadge', 'Akun Terhubung')}
      title={t('incognito.turnOn', 'Aktifkan Mode Anonim')}
    >
      <span className="incognito-pill-emoji" aria-hidden="true">👤</span>
      <span className="incognito-pill-label">{t('incognito.connectedBadge', 'Akun Terhubung')}</span>
      <span className="incognito-pill-hint" style={{ fontSize: '0.688rem', opacity: 0.85, marginInlineStart: '4px' }}>
        1-Klik Anonim
      </span>
    </button>
  );
};
