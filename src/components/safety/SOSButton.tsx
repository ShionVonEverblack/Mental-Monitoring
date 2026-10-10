import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FastActionSafetyCard } from './FastActionSafetyCard';

export const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-danger btn-icon sos-float"
        aria-label={t('sos.buttonAria', 'SOS - Butuh Bantuan')}
      >
        <Phone size={28} />
      </button>

      <FastActionSafetyCard
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
