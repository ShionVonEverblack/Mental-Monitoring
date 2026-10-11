import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDualMode } from '../../hooks/useDualMode';

export interface DualModePillToggleProps {
  className?: string;
  showHint?: boolean;
}

export const DualModePillToggle: React.FC<DualModePillToggleProps> = ({
  className = '',
  showHint = false,
}) => {
  const { t } = useTranslation();
  const { isAirgappedMode, toggleOperatingMode } = useDualMode();

  return (
    <div className={`dual-mode-pill-container ${className}`.trim()}>
      <button
        type="button"
        aria-pressed={!isAirgappedMode}
        onClick={toggleOperatingMode}
        className={`dual-mode-pill-btn ${
          isAirgappedMode ? 'dual-mode-pill-airgapped' : 'dual-mode-pill-connected'
        }`}
        aria-label={
          isAirgappedMode
            ? t('dualMode.airgappedBadge', '🛡️ Mode Luring Penuh')
            : t('dualMode.connectedBadge', '🌐 Mode Tersambung')
        }
        title={
          isAirgappedMode
            ? t('dualMode.switchToConnected', 'Beralih ke Mode Tersambung')
            : t('dualMode.switchToAirgapped', 'Beralih ke Mode Luring Penuh')
        }
      >
        <span className="dual-mode-pill-emoji" aria-hidden="true">
          {isAirgappedMode ? '🛡️' : '🌐'}
        </span>
        <span className="dual-mode-pill-label">
          {isAirgappedMode
            ? t('dualMode.airgappedBadgeText', 'Mode Luring Penuh')
            : t('dualMode.connectedBadgeText', 'Mode Tersambung')}
        </span>
        {showHint && (
          <span className="dual-mode-pill-hint" style={{ fontSize: '0.688rem', opacity: 0.85, marginInlineStart: '4px' }}>
            {isAirgappedMode
              ? t('dualMode.hintSwitchToOnline', '1-Klik Online')
              : t('dualMode.hintSwitchToOffline', '1-Klik Luring')}
          </span>
        )}
      </button>
    </div>
  );
};
