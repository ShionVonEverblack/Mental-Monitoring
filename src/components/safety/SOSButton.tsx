import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FastActionSafetyCard } from './FastActionSafetyCard';

export const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <style>{`
        .sos-float {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          z-index: 60;
        }
        @media (max-width: 768px) {
          .sos-float {
            bottom: 5rem;
            right: 1rem;
          }
        }
      `}</style>
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
