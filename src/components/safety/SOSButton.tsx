import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CRISIS_HOTLINES } from '../../utils/constants';

export const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

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
        .sos-modal-subtitle {
          color: var(--text-muted);
          font-size: var(--font-size-sm);
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }
        .sos-hotline-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .sos-hotline-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        .sos-hotline-name {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }
        .sos-hotline-desc {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }
        .sos-hotline-call {
          margin-top: var(--spacing-sm);
          width: 100%;
        }
        .sos-disclaimer {
          margin-top: var(--spacing-lg);
          text-align: center;
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }
      `}</style>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-danger btn-icon sos-float"
        aria-label="SOS - Butuh Bantuan"
      >
        <Phone size={28} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('sos.title', 'Butuh Bantuan?')} size="md">
        <div>
          <p className="sos-modal-subtitle">
            {t('sos.subtitle', 'Kamu tidak sendirian. Silakan hubungi layanan di bawah ini untuk mendapatkan bantuan.')}
          </p>

          <div className="sos-hotline-list">
            {CRISIS_HOTLINES.map((hotline, idx) => (
              <Card key={idx} padding="sm" className="sos-hotline-card">
                <div>
                  <h3 className="sos-hotline-name">{hotline.name}</h3>
                  <p className="sos-hotline-desc">{i18n.language === 'en' ? hotline.descriptionEn : hotline.descriptionId}</p>
                </div>
                <a
                  href={`tel:${hotline.phone.replace(/[^0-9+]/g, '')}`}
                  className="sos-hotline-call"
                >
                  <Button variant="danger" style={{ width: '100%' }} icon={<Phone size={16} />}>
                    {hotline.phone}
                  </Button>
                </a>
              </Card>
            ))}
          </div>

          <div className="sos-disclaimer">
            {t('sos.disclaimer', 'Layanan ini dikelola oleh pihak ketiga. Jika dalam keadaan darurat medis, segera pergi ke IGD terdekat.')}
          </div>
        </div>
      </Modal>
    </>
  );
};
