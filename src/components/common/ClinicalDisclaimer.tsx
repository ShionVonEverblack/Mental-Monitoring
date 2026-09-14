import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClinicalDisclaimerProps {
  context?: string;
}

/**
 * ClinicalDisclaimer — Reusable APA App Advisor compliance component
 * 
 * APA Tier 2 requires explicit clarification that analytics and insights
 * are descriptive self-monitoring tools, not diagnostic evaluations.
 */
export const ClinicalDisclaimer: React.FC<ClinicalDisclaimerProps> = ({ context }) => {
  const { t } = useTranslation();

  return (
    <p style={{
      fontSize: '0.75rem',
      color: 'var(--text-tertiary)',
      marginTop: 'var(--spacing-md)',
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 1.5,
    }}>
      ⚕️ {context || t('disclaimer.clinical', 'RIMA adalah alat pendampingan mandiri berbasis bukti ilmiah, bukan pengganti konsultasi dengan psikolog atau psikiater profesional.')}
    </p>
  );
};
