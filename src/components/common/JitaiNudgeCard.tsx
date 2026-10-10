import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wind,
  MoonStar,
  Activity,
  Sparkles,
  HeartHandshake,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react';
import { useJitai } from '../../hooks/useJitai';
import type { JitaiNudge } from '../../types/jitai';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Wind,
  MoonStar,
  Activity,
  Sparkles,
  HeartHandshake,
  Clock,
};

export interface JitaiNudgeCardProps {
  className?: string;
  onNavigate?: (route: string) => void;
  customNudge?: JitaiNudge | null;
  onDismiss?: () => void;
}

export const JitaiNudgeCard: React.FC<JitaiNudgeCardProps> = ({
  className,
  onNavigate,
  customNudge,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const hookResult = useJitai();
  const navigate = useNavigate();

  const nudge = customNudge !== undefined ? customNudge : hookResult.nudge;
  const dismiss = onDismiss ?? hookResult.dismissNudge;
  const accept = hookResult.acceptNudge;

  if (!nudge) {
    return null;
  }

  const IconComponent = ICON_MAP[nudge.iconName] || Sparkles;

  const handleAction = () => {
    accept();
    if (onNavigate) {
      onNavigate(nudge.targetRoute);
    } else {
      navigate(nudge.targetRoute);
    }
  };

  const evidenceBadgeText = nudge.evidenceBadgeKey
    ? t(nudge.evidenceBadgeKey, nudge.evidenceBadgeFallback || '')
    : nudge.evidenceBadgeFallback || t('jitai.badge_adaptive', 'Rekomendasi Adaptif');

  return (
    <aside
      className={`jitai-nudge-card jitai-urgency-${nudge.urgency} ${className || ''}`}
      aria-label={t('jitai.badge_adaptive', 'Rekomendasi Adaptif')}
    >
      <div className="jitai-header">
        <span className="jitai-evidence-badge">
          <Sparkles size={14} aria-hidden="true" />
          <span>{evidenceBadgeText}</span>
        </span>
        <button
          type="button"
          onClick={dismiss}
          className="jitai-dismiss-btn"
          aria-label={t('jitai.dismissAria', 'Tutup saran ini')}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="jitai-body">
        <div className="jitai-icon-wrapper" aria-hidden="true">
          <IconComponent size={24} />
        </div>
        <div className="jitai-content">
          <h3 className="jitai-title">
            {t(nudge.titleKey, nudge.titleFallback)}
          </h3>
          <p className="jitai-message">
            {t(nudge.messageKey, nudge.messageFallback)}
          </p>
        </div>
      </div>

      <div className="jitai-actions">
        <button
          type="button"
          onClick={dismiss}
          className="btn btn-ghost jitai-secondary-dismiss-btn"
        >
          {t('jitai.dismiss', 'Nanti Saja')}
        </button>
        <button
          type="button"
          onClick={handleAction}
          className="btn btn-primary jitai-action-btn"
        >
          <span>{t(nudge.actionLabelKey, nudge.actionLabelFallback)}</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};

export default JitaiNudgeCard;
