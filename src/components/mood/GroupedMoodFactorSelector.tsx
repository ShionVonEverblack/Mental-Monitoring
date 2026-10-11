import React from 'react';
import { useTranslation } from 'react-i18next';
import { MOOD_FACTOR_DOMAINS } from '../../utils/constants';

export interface GroupedMoodFactorSelectorProps {
  selectedFactors: string[];
  onToggleFactor: (factorId: string) => void;
  className?: string;
}

export const GroupedMoodFactorSelector: React.FC<GroupedMoodFactorSelectorProps> = ({
  selectedFactors,
  onToggleFactor,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'id';

  return (
    <div className={`mood-factor-domains ${className}`.trim()} role="group" aria-label={t('mood.factors', 'Apa yang memengaruhi moodmu?')}>
      {MOOD_FACTOR_DOMAINS.map((domain) => {
        const domainLabel = t(
          `mood.domains.${domain.id}`,
          lang === 'en' ? domain.labelEn : domain.labelId
        );

        return (
          <div key={domain.id} className="mood-factor-domain-card">
            <div className="mood-factor-domain-header">
              <span className="mood-factor-domain-icon" aria-hidden="true">
                {domain.icon}
              </span>
              <span className="mood-factor-domain-title">{domainLabel}</span>
            </div>
            <div className="mood-factor-domain-chips">
              {domain.factors.map((factor) => {
                const isSelected = selectedFactors.includes(factor.id);
                const factorLabel = t(
                  `mood.factorList.${factor.id}`,
                  lang === 'en' ? factor.labelEn : factor.labelId
                );

                return (
                  <button
                    key={factor.id}
                    type="button"
                    className={`factor-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => onToggleFactor(factor.id)}
                    aria-pressed={isSelected}
                    aria-label={`${factorLabel} (${domainLabel})`}
                  >
                    <span>{factorLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
