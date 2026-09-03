import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, EyeOff, Database } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const ConsentModal: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('rima-consent-accepted');
    if (!hasConsented) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!agreed) return;
    localStorage.setItem('rima-consent-accepted', new Date().toISOString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // User must agree to continue
      title={t('consent.title', 'Komitmen Privasi & Keamanan RIMA')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {t('consent.welcomeDesc', 'RIMA dirancang sebagai ruang aman digital untuk mendukung kesehatan mental Anda. Privasi dan keamanan data Anda adalah prioritas mutlak kami.')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Lock size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.813rem', color: 'var(--text-primary)', display: 'block' }}>
                {t('consent.offlineFirst', '100% Offline-First')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('consent.offlineFirstDesc', 'Catatan mood dan jurnal tersimpan di memori perangkat Anda, bukan di cloud server.')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <EyeOff size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.813rem', color: 'var(--text-primary)', display: 'block' }}>
                {t('consent.anonymous', 'Identitas Anonim')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('consent.anonymousDesc', 'Tidak memerlukan nama asli atau nomor HP untuk menggunakan platform ini.')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Database size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.813rem', color: 'var(--text-primary)', display: 'block' }}>
                {t('consent.control', 'Kendali Penuh di Tangan Anda')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('consent.controlDesc', 'Anda berhak mengekspor atau menghapus seluruh data kapan saja sesuai UU PDP.')}
              </span>
            </div>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.813rem', color: 'var(--text-primary)', marginTop: '4px' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', cursor: 'pointer' }}
          />
          <span>
            {t('consent.agreeCheckbox', 'Saya memahami prinsip privasi ini dan menyetujui penggunaan RIMA.')}{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
              {t('consent.readPolicy', 'Baca Kebijakan Lengkap')}
            </a>
          </span>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button
            variant="primary"
            onClick={handleAccept}
            disabled={!agreed}
            icon={<ShieldCheck size={16} />}
          >
            {t('consent.continue', 'Mulai Gunakan RIMA')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
