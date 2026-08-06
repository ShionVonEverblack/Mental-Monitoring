import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CRISIS_HOTLINES } from '../../utils/constants';

export const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-danger text-white rounded-full shadow-lg flex items-center justify-center hover:bg-danger/90 transition-transform hover:scale-105 active:scale-95 animate-pulse z-[60]"
        aria-label="SOS - Butuh Bantuan"
      >
        <Phone size={28} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('sos.title', 'Butuh Bantuan?')} size="md">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm text-center mb-6">
            {t('sos.subtitle', 'Kamu tidak sendirian. Silakan hubungi layanan di bawah ini untuk mendapatkan bantuan.')}
          </p>

          <div className="space-y-3">
            {CRISIS_HOTLINES.map((hotline, idx) => (
              <Card key={idx} padding="sm" className="flex flex-col gap-2 bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{hotline.name}</h3>
                    <p className="text-xs text-muted-foreground">{hotline.description}</p>
                  </div>
                </div>
                <a
                  href={`tel:${hotline.phone.replace(/[^0-9+]/g, '')}`}
                  className="mt-2 w-full"
                >
                  <Button variant="danger" className="w-full" icon={<Phone size={16} />}>
                    {hotline.phone}
                  </Button>
                </a>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {t('sos.disclaimer', 'Layanan ini dikelola oleh pihak ketiga. Jika dalam keadaan darurat medis, segera pergi ke IGD terdekat.')}
          </div>
        </div>
      </Modal>
    </>
  );
};
