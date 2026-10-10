import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export interface PageFallbackLoaderProps {
  /** Optional custom message; defaults to t('calmLoader.message', t('common.loadingSafeSpace', 'Memuat Ruang Aman...')) */
  message?: string;
  /** Optional soothing hint text; defaults to t('calmLoader.hint', 'Tarik napas perlahan dan rileks sejenak.') */
  hint?: string;
  /** Optional explicit aria-label for screen readers; defaults to t('calmLoader.accessibleLabel', 'Menyiapkan ruang tenang Anda...') */
  ariaLabel?: string;
  /** Whether to render the primary hero skeleton card (default: true) */
  showHero?: boolean;
  /** Number of content card skeletons to render in the grid (default: 2) */
  cardsCount?: number;
  /** Additional CSS class name */
  className?: string;
  /** Optional sensory mode override ('calm' | 'low-stimulation') */
  'data-sensory'?: 'low-stimulation' | 'calm';
}

export const PageFallbackLoader: React.FC<PageFallbackLoaderProps> = ({
  message,
  hint,
  ariaLabel,
  showHero = true,
  cardsCount = 2,
  className = '',
  'data-sensory': propSensory,
}) => {
  const { t } = useTranslation();

  const [isLowStimulation, setIsLowStimulation] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const docSensory = document.documentElement.getAttribute('data-sensory');
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return (
      propSensory === 'low-stimulation' ||
      propSensory === 'calm' ||
      docSensory === 'calm' ||
      docSensory === 'low-stimulation' ||
      Boolean(prefersReduced)
    );
  });

  useEffect(() => {
    const checkSensory = () => {
      if (typeof window === 'undefined') return;
      const docSensory = document.documentElement.getAttribute('data-sensory');
      const prefersReduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsLowStimulation(
        propSensory === 'low-stimulation' ||
        propSensory === 'calm' ||
        docSensory === 'calm' ||
        docSensory === 'low-stimulation' ||
        Boolean(prefersReduced)
      );
    };

    checkSensory();

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const observer = new MutationObserver(checkSensory);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-sensory'],
      });
      return () => observer.disconnect();
    }
  }, [propSensory]);

  const displayMessage = message ?? t('calmLoader.message', t('common.loadingSafeSpace', 'Memuat Ruang Aman...'));
  const displayHint = hint ?? t('calmLoader.hint', 'Tarik napas perlahan dan rileks sejenak.');
  const accessibleLabel = ariaLabel ?? t('calmLoader.accessibleLabel', 'Menyiapkan ruang tenang Anda...');

  const activeSensoryAttr = propSensory || (isLowStimulation ? 'low-stimulation' : undefined);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={accessibleLabel}
      data-sensory={activeSensoryAttr}
      data-testid="page-fallback-loader"
      className={`page-fallback-loader ${className}`.trim()}
    >
      {/* Screen-reader-only accessible notification */}
      <span className="sr-only">{accessibleLabel}</span>

      {/* Calm Status Pill and Soothing Hint */}
      <div className="page-fallback-status-area">
        <div className="page-fallback-status-pill">
          <Shield className="page-fallback-status-icon" size={16} aria-hidden="true" />
          <span className="page-fallback-status-dot" aria-hidden="true" />
          <span className="page-fallback-status-text">{displayMessage}</span>
        </div>
        {displayHint && (
          <p className="page-fallback-status-hint">{displayHint}</p>
        )}
      </div>

      {/* Page Header Skeleton */}
      <div className="page-fallback-header" aria-hidden="true">
        <div className="page-fallback-skeleton page-fallback-skeleton-title" />
        <div className="page-fallback-skeleton page-fallback-skeleton-subtitle" />
      </div>

      {/* Primary Hero Skeleton Card */}
      {showHero && (
        <div
          className="page-fallback-card page-fallback-hero-card"
          aria-hidden="true"
          data-testid="page-fallback-hero-card"
        >
          <div className="page-fallback-card-header">
            <div className="page-fallback-skeleton page-fallback-skeleton-avatar" />
            <div className="page-fallback-card-header-lines">
              <div className="page-fallback-skeleton page-fallback-skeleton-line-lg" />
              <div className="page-fallback-skeleton page-fallback-skeleton-line-sm" />
            </div>
          </div>
          <div className="page-fallback-skeleton page-fallback-skeleton-block" />
        </div>
      )}

      {/* Content Cards Grid Skeleton */}
      {cardsCount > 0 && (
        <div
          className="page-fallback-grid"
          aria-hidden="true"
          data-testid="page-fallback-grid"
        >
          {Array.from({ length: cardsCount }).map((_, index) => (
            <div
              key={index}
              className="page-fallback-card"
              aria-hidden="true"
              data-testid="page-fallback-grid-card"
            >
              <div className="page-fallback-skeleton page-fallback-skeleton-line-md" />
              <div className="page-fallback-skeleton page-fallback-skeleton-line-full" />
              <div className="page-fallback-skeleton page-fallback-skeleton-line-sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default PageFallbackLoader;
