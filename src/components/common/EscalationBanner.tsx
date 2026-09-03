import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { MoodEntry } from '../../types';
import { calculateEscalation } from '../../services/escalationService';

interface EscalationBannerProps {
  moods: MoodEntry[];
  latestJournalContent?: string;
}

export const EscalationBanner: React.FC<EscalationBannerProps> = ({ moods, latestJournalContent }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const escalation = calculateEscalation(moods, latestJournalContent);
  
  if (escalation.level === 0) return null;
  
  const severityClass = escalation.level === 3 ? 'danger' : escalation.level === 2 ? 'warning' : 'info';
  
  return (
    <div className={`escalation-banner escalation-${severityClass}`} role="alert">
      <p className="escalation-message">{t(escalation.messageKey, escalation.messageFallback)}</p>
      <div className="escalation-actions">
        {escalation.suggestedActions.map((action, i) => (
          <button 
            key={i} 
            className="btn btn-sm btn-ghost"
            onClick={() => navigate(action.route)}
          >
            {action.icon} {t(action.labelKey, action.labelFallback)}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.688rem', color: 'var(--text-tertiary)', marginTop: '8px', marginBottom: 0, fontStyle: 'italic' }}>
        ⚕️ {t('disclaimer.escalation', 'Saran otomatis ini bertujuan untuk pendampingan mandiri, bukan pengganti penanganan medis.')}
      </p>
    </div>
  );
};
