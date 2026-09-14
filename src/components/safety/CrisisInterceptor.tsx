import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Heart, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { CRISIS_HOTLINES } from '../../utils/constants';

interface CrisisInterceptorProps {
  isOpen: boolean;
  onClose: () => void;
  matchedKeywords?: string[];
}

/**
 * CrisisInterceptor — Full-screen crisis modal (Trauma-Informed Design)
 * 
 * Based on SAMHSA 6 Principles:
 * - Non-alarmist language (no red/emergency colors dominating)
 * - Empowerment & Choice: Clear dismissal option
 * - Safety: 1-tap emergency hotline buttons
 * 
 * Replaces abrupt popup interruptions with gentle, supportive full-screen modal.
 */
export const CrisisInterceptor: React.FC<CrisisInterceptorProps> = ({ isOpen, onClose, matchedKeywords }) => {
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div style={{ textAlign: 'center', padding: 'var(--spacing-md) 0' }}>
        {/* Gentle, non-alarmist header */}
        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
          <Heart size={48} style={{ color: 'var(--color-secondary)' }} />
        </div>
        
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          marginBottom: 'var(--spacing-sm)',
          lineHeight: 1.3
        }}>
          {t('crisis.interceptorTitle', 'Kamu tidak sendirian')}
        </h2>
        
        <p style={{ 
          fontSize: '1rem', 
          color: 'var(--text-secondary)', 
          marginBottom: 'var(--spacing-lg)',
          lineHeight: 1.6,
          maxWidth: '400px',
          margin: '0 auto var(--spacing-lg)'
        }}>
          {t('crisis.interceptorMessage', 'Kami menyadari kamu mungkin sedang mengalami masa yang sulit. Bantuan tersedia sekarang, dan kamu berhak mendapatkannya.')}
        </p>

        {/* Emergency hotline buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-lg)',
          maxWidth: '360px',
          margin: '0 auto var(--spacing-lg)'
        }}>
          {CRISIS_HOTLINES.filter(h => h.isActive).slice(0, 3).map((hotline, idx) => (
            <a
              key={idx}
              href={`tel:${hotline.phone.includes('ext') ? hotline.phone.replace(/\s*ext\s*/i, ',').replace(/[^0-9+,]/g, '') : hotline.phone.replace(/[^0-9+]/g, '')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: 'var(--spacing-md)',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: '48px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Phone size={18} />
              {hotline.name} — {hotline.phone}
            </a>
          ))}
        </div>

        {/* Supportive resources */}
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)', 
          marginBottom: 'var(--spacing-lg)',
          lineHeight: 1.5
        }}>
          {t('crisis.interceptorGuide', 'Atau buka Rencana Keselamatan yang sudah kamu susun untuk panduan langkah selanjutnya.')}
        </p>

        {/* Dismiss button — SAMHSA Empowerment & Choice */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            margin: '0 auto',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: '0.875rem',
            color: 'var(--text-tertiary)',
            minHeight: '44px'
          }}
        >
          <X size={16} />
          {t('crisis.interceptorDismiss', 'Saya baik-baik saja, terima kasih')}
        </button>

        {/* Clinical disclaimer */}
        <p style={{ 
          fontSize: '0.688rem', 
          color: 'var(--text-tertiary)', 
          marginTop: 'var(--spacing-lg)', 
          fontStyle: 'italic' 
        }}>
          ⚕️ {t('disclaimer.crisis', 'Deteksi ini bersifat otomatis dan bukan diagnosis klinis. Jika Anda merasa aman, silakan abaikan pesan ini.')}
        </p>

        {matchedKeywords && matchedKeywords.length > 0 && (
          <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
            [{matchedKeywords.join(', ')}]
          </p>
        )}
      </div>
    </Modal>
  );
};
