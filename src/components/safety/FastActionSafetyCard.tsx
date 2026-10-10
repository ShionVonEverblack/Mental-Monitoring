import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { Phone, Shield, Wind, X, User, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getEmergencySafetyActions,
  formatPhoneTelUri,
  type EmergencySafetyAction,
} from '../../services/safetyCardService';

export interface FastActionSafetyCardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (route: string) => void;
  embedded?: boolean;
  customActions?: EmergencySafetyAction;
}

export const FastActionSafetyCard: React.FC<FastActionSafetyCardProps> = ({
  isOpen = true,
  onClose,
  onNavigate,
  embedded = false,
  customActions,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const copingDescId = useId();

  const actions = customActions ?? getEmergencySafetyActions();

  // Escape key handler & body scroll lock for modal mode
  useEffect(() => {
    if (!isOpen || embedded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Initial focus on dialog for accessibility
    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, embedded, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSomaticClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(actions.somaticRoute);
      onClose?.();
    }
  };

  const cardContent = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : 'true'}
      aria-labelledby={titleId}
      aria-describedby={copingDescId}
      className={`fast-safety-card ${embedded ? 'fast-safety-embedded' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .fast-safety-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          z-index: var(--z-sos, 100);
          animation: fastSafetyFadeIn 150ms ease-out;
        }
        @keyframes fastSafetyFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fast-safety-card {
          width: 100%;
          max-width: 520px;
          background: var(--bg-card);
          color: var(--text-primary);
          border: 2px solid var(--color-danger);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-elevated), var(--glow-danger);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          outline: none;
          max-height: 90vh;
          overflow-y: auto;
        }
        .fast-safety-embedded {
          max-width: 100%;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
        }
        .fast-safety-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--spacing-sm);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: var(--spacing-sm);
        }
        .fast-safety-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fast-safety-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-bold);
          color: #fff;
          background: var(--color-danger);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          width: fit-content;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .fast-safety-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0;
          line-height: 1.25;
        }
        .fast-safety-subtitle {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          margin: 0;
        }
        .fast-safety-close-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          min-height: 48px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast);
          flex-shrink: 0;
        }
        .fast-safety-close-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .fast-safety-coping-box {
          background: hsla(215, 65%, 55%, 0.12);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        .fast-safety-coping-tag {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .fast-safety-coping-text {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }
        .fast-safety-actions-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        .fast-action-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md);
          min-height: 52px;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-family: var(--font-family-base);
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-base);
          cursor: pointer;
          transition: transform var(--transition-fast), filter var(--transition-fast);
          border: 1px solid transparent;
          outline: none;
        }
        .fast-action-btn:focus-visible {
          outline: 3px solid var(--color-primary);
          outline-offset: 2px;
        }
        .fast-action-btn:active {
          transform: scale(0.99);
        }
        .fast-action-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          text-align: start;
        }
        .fast-action-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fast-action-texts {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fast-action-label {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          line-height: 1.2;
        }
        .fast-action-subtext {
          font-size: var(--font-size-xs);
          opacity: 0.9;
          font-weight: var(--font-weight-regular);
        }
        .fast-action-call-119 {
          background: var(--color-danger);
          color: #fff;
          border-color: var(--color-danger);
          box-shadow: var(--glow-danger);
        }
        .fast-action-call-119:hover {
          background: var(--color-danger-hover);
        }
        .fast-action-call-contact {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }
        .fast-action-call-contact:hover {
          background: var(--color-primary-hover);
        }
        .fast-action-call-112 {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }
        .fast-action-call-112:hover {
          background: hsla(0, 0%, 100%, 0.1);
        }
        .fast-action-somatic {
          background: var(--color-secondary);
          color: var(--text-inverse);
          border-color: var(--color-secondary);
        }
        .fast-action-somatic:hover {
          background: var(--color-secondary-hover);
        }
        .fast-safety-footer {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--spacing-sm);
        }
        .fast-safety-dismiss-btn {
          min-height: 48px;
          width: 100%;
        }
        .fast-safety-disclaimer {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
          text-align: center;
          margin: 0;
          font-style: italic;
        }
      `}</style>

      {/* Header */}
      <div className="fast-safety-header">
        <div className="fast-safety-title-group">
          <span className="fast-safety-badge">
            <AlertCircle size={14} />
            {t('safetyCard.badge', 'Bantuan Cepat Darurat')}
          </span>
          <h2 id={titleId} className="fast-safety-title">
            {t('safetyCard.title', 'Kamu Tidak Sendirian')}
          </h2>
          <p className="fast-safety-subtitle">
            {t(
              'safetyCard.subtitle',
              'Tenangkan pikiran. Kamu aman di sini. Pilih salah satu tindakan cepat di bawah.'
            )}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="fast-safety-close-btn"
            aria-label={t('safetyCard.closeAria', 'Tutup Bantuan Darurat')}
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* 1. Prominent Primary Coping Action */}
      <div className="fast-safety-coping-box">
        <div className="fast-safety-coping-tag">
          <Shield size={16} />
          <span>{t('safetyCard.copingTag', 'Langkah Pertama Koping Kamu')}</span>
        </div>
        <p id={copingDescId} className="fast-safety-coping-text">
          {actions.primaryCopingStrategy}
        </p>
      </div>

      {/* Action Buttons Grid */}
      <div className="fast-safety-actions-grid">
        {/* 2. Single-tap call button for 119 Ext 8 (href="tel:119,8") */}
        <a
          href={actions.hotline119.href}
          className="fast-action-btn fast-action-call-119"
          aria-label={`${t('safetyCard.call119Aria', 'Telepon')} ${actions.hotline119.name} ${actions.hotline119.phone}`}
        >
          <div className="fast-action-content">
            <div className="fast-action-icon">
              <Phone size={22} />
            </div>
            <div className="fast-action-texts">
              <span className="fast-action-label">
                {actions.hotline119.name}
              </span>
              <span className="fast-action-subtext">
                {t('safetyCard.callPrompt', 'Telepon')} {actions.hotline119.phone} ({t('safetyCard.freeToll', 'Bebas Pulsa 24 Jam')})
              </span>
            </div>
          </div>
        </a>

        {/* 3. Single-tap call button for trusted contact (with working tel: link) */}
        {actions.trustedContact?.phone ? (
          <a
            href={formatPhoneTelUri(actions.trustedContact.phone)}
            className="fast-action-btn fast-action-call-contact"
            aria-label={`${t('safetyCard.callTrustedAria', 'Telepon')} ${actions.trustedContact.name}: ${actions.trustedContact.phone}`}
          >
            <div className="fast-action-content">
              <div className="fast-action-icon">
                <User size={22} />
              </div>
              <div className="fast-action-texts">
                <span className="fast-action-label">
                  {t('safetyCard.callContactPrefix', 'Hubungi')} {actions.trustedContact.name}
                </span>
                <span className="fast-action-subtext">
                  {actions.trustedContact.phone}
                  {actions.trustedContact.relationship ? ` (${actions.trustedContact.relationship})` : ''}
                </span>
              </div>
            </div>
          </a>
        ) : actions.trustedContact ? (
          <div
            className="fast-action-btn fast-action-call-contact"
            style={{ opacity: 0.95 }}
          >
            <div className="fast-action-content">
              <div className="fast-action-icon">
                <User size={22} />
              </div>
              <div className="fast-action-texts">
                <span className="fast-action-label">
                  {t('safetyCard.contactNamePrefix', 'Kontak Tepercaya:')} {actions.trustedContact.name}
                </span>
                <span className="fast-action-subtext">
                  {t('safetyCard.noContactPhone', 'Belum ada nomor telepon tersimpan')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <a
            href="/safety-plan"
            className="fast-action-btn fast-action-call-contact"
            style={{ opacity: 0.9 }}
          >
            <div className="fast-action-content">
              <div className="fast-action-icon">
                <User size={22} />
              </div>
              <div className="fast-action-texts">
                <span className="fast-action-label">
                  {t('safetyCard.addContactTitle', 'Atur Kontak Tepercaya')}
                </span>
                <span className="fast-action-subtext">
                  {t('safetyCard.addContactSub', 'Tambahkan nomor di Rencana Keselamatan')}
                </span>
              </div>
            </div>
          </a>
        )}

        {/* 4. Single-tap somatic grounding shortcut */}
        <a
          href={actions.somaticRoute}
          onClick={handleSomaticClick}
          className="fast-action-btn fast-action-somatic"
          aria-label={
            actions.somaticRoute === '/breathe'
              ? t('safetyCard.somaticBreatheAria', 'Latihan Pernapasan Cepat (Cyclic Sighing)')
              : t('safetyCard.somaticGroundingAria', 'Mulai Latihan Grounding Sensorik 5-4-3-2-1')
          }
        >
          <div className="fast-action-content">
            <div className="fast-action-icon">
              <Wind size={22} />
            </div>
            <div className="fast-action-texts">
              <span className="fast-action-label">
                {actions.somaticRoute === '/breathe'
                  ? t('safetyCard.somaticBreatheTitle', 'Pernapasan Cepat (Cyclic Sighing)')
                  : t('safetyCard.somaticGroundingTitle', 'Latihan Grounding Sensorik 5-4-3-2-1')}
              </span>
              <span className="fast-action-subtext">
                {t('safetyCard.somaticSub', 'Turunkan denyut jantung dan kepanikan seketika')}
              </span>
            </div>
          </div>
        </a>

        {/* 5. Emergency 112 backup hotline */}
        <a
          href={actions.hotline112.href}
          className="fast-action-btn fast-action-call-112"
          aria-label={`${t('safetyCard.call112Aria', 'Telepon')} ${actions.hotline112.name} ${actions.hotline112.phone}`}
        >
          <div className="fast-action-content">
            <div className="fast-action-icon">
              <Phone size={22} />
            </div>
            <div className="fast-action-texts">
              <span className="fast-action-label">
                {actions.hotline112.name}
              </span>
              <span className="fast-action-subtext">
                {t('safetyCard.call112Sub', 'Panggilan Darurat Bebas Pulsa Nasional')}
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Footer & Accessible Dismiss Button */}
      <div className="fast-safety-footer">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost fast-safety-dismiss-btn"
          >
            {t('safetyCard.dismiss', 'Saya Merasa Lebih Tenang (Tutup)')}
          </button>
        )}
        <p className="fast-safety-disclaimer">
          {t(
            'safetyCard.disclaimer',
            'Layanan darurat bebas pulsa. Jika dalam bahaya fisik segera, hubungi 112 atau datangi IGD rumah sakit terdekat.'
          )}
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return cardContent;
  }

  const modalWrapper = (
    <div
      className="fast-safety-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {cardContent}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalWrapper, document.body) : modalWrapper;
};
