import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AuthModal } from '../components/auth/AuthModal';
import { AVAILABLE_LANGUAGES } from '../utils/constants';
import {
  Globe,
  Sun,
  Moon,
  Sparkles,
  Shield,
  EyeOff,
  Activity,
  SmilePlus,
  BookOpen,
  HeartPulse,
  PhoneCall,
  Users,
  ChevronDown,
  ArrowRight,
  LogIn,
  Phone
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  // If already authenticated, redirect straight to home
  useEffect(() => {
    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rima-has-entered', 'true');
      }
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleEnterAsGuest = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rima-has-entered', 'true');
      localStorage.setItem('rima-consent-accepted', new Date().toISOString());
    }
    navigate('/');
  };

  const currentLang = i18n.language || 'id';
  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang) || AVAILABLE_LANGUAGES[0];

  return (
    <div className="landing-page">
      {/* Standalone Minimalist Header */}
      <header className="landing-header">
        <div className="landing-header-brand">
          <span className="landing-brand-icon" style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">🌱</span>
          <span style={{
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            RIMA
          </span>
        </div>

        <div className="landing-header-actions">
          {/* Language Switcher */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ minHeight: '48px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowLangModal(true)}
            aria-label={t('profile.language', 'Bahasa')}
          >
            <Globe size={16} aria-hidden="true" />
            <span>{currentLangObj.flag} {currentLangObj.code.toUpperCase()}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ minHeight: '48px', minWidth: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('profile.lightMode', 'Mode Terang') : t('profile.darkMode', 'Mode Gelap')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Masuk dengan Akun Trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAuthOpen(true)}
            style={{ minHeight: '48px' }}
          >
            {t('landing.ctaLogin', 'Masuk dengan Akun')}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="landing-container">
        {/* Hero Section */}
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="landing-hero-badge">
            <Sparkles size={14} aria-hidden="true" />
            <span>{t('landing.heroBadge')}</span>
          </div>

          <h1 id="hero-title" className="landing-hero-title">
            {t('landing.heroTitle')}
          </h1>

          <p className="landing-hero-subtitle">
            {t('landing.heroSubtitle')}
          </p>

          <div
            className="landing-hero-tagline"
            style={{
              marginBottom: 'var(--spacing-xl)',
              fontSize: '0.938rem',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic'
            }}
          >
            {t('landing.heroTagline')}
          </div>

          {/* Dual CTA */}
          <div className="landing-cta-group">
            <Button
              variant="primary"
              size="lg"
              onClick={handleEnterAsGuest}
              icon={<ArrowRight size={18} />}
            >
              {t('landing.ctaGuest')}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setIsAuthOpen(true)}
              icon={<LogIn size={18} />}
            >
              {t('landing.ctaLogin')}
            </Button>
          </div>

          <div style={{
            fontSize: '0.813rem',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            marginTop: 'calc(var(--spacing-md) * -1)',
            marginBottom: 'var(--spacing-2xl)'
          }}>
            {t('landing.ctaGuestSub')}
          </div>
        </section>

        {/* 3 Core Value Pillars */}
        <section className="landing-pillars-section" aria-labelledby="pillars-title">
          <div className="landing-section-header">
            <h2 id="pillars-title" className="landing-section-title">
              {t('landing.pillarsTitle')}
            </h2>
            <p className="landing-section-subtitle">
              {t('landing.pillarsSubtitle')}
            </p>
          </div>

          <div className="landing-pillars">
            {/* Pillar 1: 100% Privacy & UU PDP */}
            <div className="landing-pillar-card">
              <div className="landing-pillar-badge">
                <Shield size={12} style={{ marginInlineEnd: '4px' }} aria-hidden="true" />
                <span>{t('landing.pillar1Badge')}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.pillar1Title')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.pillar1Desc')}
              </p>
            </div>

            {/* Pillar 2: Stigma-Free Instant Access */}
            <div className="landing-pillar-card">
              <div className="landing-pillar-badge">
                <EyeOff size={12} style={{ marginInlineEnd: '4px' }} aria-hidden="true" />
                <span>{t('landing.pillar2Badge')}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.pillar2Title')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.pillar2Desc')}
              </p>
            </div>

            {/* Pillar 3: Clinical Evidence-Based */}
            <div className="landing-pillar-card">
              <div className="landing-pillar-badge">
                <Activity size={12} style={{ marginInlineEnd: '4px' }} aria-hidden="true" />
                <span>{t('landing.pillar3Badge')}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.pillar3Title')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.pillar3Desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Feature Showcase Grid (6 Features) */}
        <section className="landing-showcase-section" aria-labelledby="showcase-title">
          <div className="landing-section-header">
            <h2 id="showcase-title" className="landing-section-title">
              {t('landing.showcaseTitle')}
            </h2>
            <p className="landing-section-subtitle">
              {t('landing.showcaseSubtitle')}
            </p>
          </div>

          <div className="landing-showcase">
            {/* 1. Yale Mood Meter 2D */}
            <div className="landing-showcase-card">
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-transparent)',
                color: 'var(--color-primary)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <SmilePlus size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.featMoodTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.featMoodDesc')}
              </p>
            </div>

            {/* 2. Encrypted Journal & CBT */}
            <div className="landing-showcase-card">
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsla(210, 80%, 55%, 0.12)',
                color: 'var(--color-secondary)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <BookOpen size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.featJournalTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.featJournalDesc')}
              </p>
            </div>

            {/* 3. Somatics & Brownian Noise */}
            <div className="landing-showcase-card">
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsla(160, 60%, 45%, 0.12)',
                color: 'var(--color-accent)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <HeartPulse size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.featSomaticsTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.featSomaticsDesc')}
              </p>
            </div>

            {/* 4. Crisis Safety Net */}
            <div className="landing-showcase-card">
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsla(0, 65%, 55%, 0.12)',
                color: 'var(--color-danger)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <PhoneCall size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.featCrisisTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.featCrisisDesc')}
              </p>
            </div>

            {/* 5. Supportive Peer Community */}
            <div className="landing-showcase-card">
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsla(280, 65%, 60%, 0.12)',
                color: 'var(--color-warm)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <Users size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.featForumTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.featForumDesc')}
              </p>
            </div>

            {/* 6. JITAI Smart Nudge */}
            <div className="landing-showcase-card">
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-transparent)',
                color: 'var(--color-primary)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                {t('landing.featJitaiTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {t('landing.featJitaiDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="landing-faq-section" aria-labelledby="faq-title">
          <div className="landing-section-header">
            <h2 id="faq-title" className="landing-section-title">
              {t('landing.faqTitle')}
            </h2>
            <p className="landing-section-subtitle">
              {t('landing.faqSubtitle')}
            </p>
          </div>

          <div className="landing-faq">
            {[1, 2, 3, 4].map((itemNum) => {
              const isExpanded = openFaq === itemNum;
              return (
                <div key={itemNum} className="landing-faq-item">
                  <button
                    type="button"
                    className="landing-faq-question"
                    onClick={() => setOpenFaq(isExpanded ? null : itemNum)}
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${itemNum}`}
                  >
                    <span>{t(`landing.faq${itemNum}Q`)}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform var(--transition-normal)',
                        flexShrink: 0,
                        marginInlineStart: 'var(--spacing-sm)'
                      }}
                      aria-hidden="true"
                    />
                  </button>
                  {isExpanded && (
                    <div id={`faq-answer-${itemNum}`} className="landing-faq-answer">
                      <p style={{ margin: 0 }}>{t(`landing.faq${itemNum}A`)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Pre-Footer Action Box */}
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl) var(--spacing-md)',
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-2xl)',
          marginBottom: 'var(--spacing-3xl)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
            {t('landing.continuePrompt')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto var(--spacing-lg)' }}>
            {t('landing.heroTagline')}
          </p>
          <div className="landing-cta-group" style={{ marginBottom: 0 }}>
            <Button variant="primary" size="lg" onClick={handleEnterAsGuest} icon={<ArrowRight size={18} />}>
              {t('landing.ctaGuest')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setIsAuthOpen(true)} icon={<LogIn size={18} />}>
              {t('landing.ctaLogin')}
            </Button>
          </div>
        </div>
      </main>

      {/* Independent Minimalist Public Footer */}
      <footer className="landing-footer">
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-md)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-transparent)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Sparkles size={12} aria-hidden="true" />
            <span>{t('landing.footerBadge')}</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '640px' }}>
            {t('landing.footerDesc')}
          </p>

          {/* Emergency Hotline Reminder */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'hsla(0, 65%, 55%, 0.08)',
            border: '1px solid hsla(0, 65%, 55%, 0.2)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-danger)',
            fontSize: '0.813rem'
          }}>
            <Phone size={15} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>
              <strong>Hotline 119 Ext 8 (SEJIWA)</strong> &bull; Layanan Darurat Pencegahan Krisis Jiwa Kemenkes RI
            </span>
          </div>

          {/* Medical Disclaimer */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0, maxWidth: '680px' }}>
            {t('safety.disclaimer')}
          </p>

          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            width: '100%',
            paddingTop: 'var(--spacing-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-sm)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              &copy; {new Date().getFullYear()} RIMA. {t('profile.anonBadge', 'Profil Anonim Aman • Terjaga di Perangkat')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnterAsGuest}
              style={{ minHeight: '44px', fontSize: '0.813rem' }}
            >
              {t('landing.footerEnterApp')} &rarr;
            </Button>
          </div>
        </div>
      </footer>

      {/* Language Selection Modal */}
      {showLangModal && (
        <Modal
          isOpen={showLangModal}
          onClose={() => setShowLangModal(false)}
          title={t('profile.language', 'Bahasa (Language)')}
        >
          <div className="zen-lang-modal-grid">
            {AVAILABLE_LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`btn btn-sm ${currentLang === item.code ? 'btn-primary' : 'btn-ghost'} zen-lang-modal-btn`}
                onClick={() => {
                  i18n.changeLanguage(item.code);
                  setShowLangModal(false);
                }}
              >
                <span aria-hidden="true">{item.flag}</span>
                <span>{item.nativeName}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Auth Modal for Magic Link Login */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
