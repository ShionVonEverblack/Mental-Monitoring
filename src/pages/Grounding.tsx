import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Hand, Ear, Sparkles, Heart, CheckCircle, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';

interface GroundingStep {
  step: number;
  count: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  titleKey: string;
  titleFallback: string;
  promptKey: string;
  promptFallback: string;
  exampleKey: string;
  exampleFallback: string;
}

const GROUNDING_STEPS: GroundingStep[] = [
  {
    step: 1,
    count: 5,
    icon: Eye,
    color: 'var(--color-primary)',
    bg: 'hsla(215, 65%, 55%, 0.12)',
    titleKey: 'grounding.step5Title',
    titleFallback: '5 Hal yang Dapat Kamu Lihat',
    promptKey: 'grounding.step5Prompt',
    promptFallback: 'Lihatlah ke sekelilingmu. Perhatikan 5 benda berbeda yang ada di ruangan atau sekitarmu.',
    exampleKey: 'grounding.step5Example',
    exampleFallback: 'Contoh: Jam dinding, pola di lantai, warna tirai, cangkir di meja, bayangan daun.',
  },
  {
    step: 2,
    count: 4,
    icon: Hand,
    color: 'var(--color-secondary)',
    bg: 'hsla(165, 45%, 50%, 0.12)',
    titleKey: 'grounding.step4Title',
    titleFallback: '4 Hal yang Dapat Kamu Sentuh / Rasakan',
    promptKey: 'grounding.step4Prompt',
    promptFallback: 'Fokus pada sensasi fisik tubuhmu. Sentuh 4 tekstur permukaan yang berbeda di dekatmu.',
    exampleKey: 'grounding.step4Example',
    exampleFallback: 'Contoh: Halusnya kain bajumu, dinginnya permukaan meja, sentuhan telapak kaki ke lantai, cincin di jarimu.',
  },
  {
    step: 3,
    count: 3,
    icon: Ear,
    color: 'var(--color-accent)',
    bg: 'hsla(270, 50%, 65%, 0.12)',
    titleKey: 'grounding.step3Title',
    titleFallback: '3 Suara yang Dapat Kamu Dengar',
    promptKey: 'grounding.step3Prompt',
    promptFallback: 'Tutup matamu sejenak jika nyaman. Dengarkan dan identifikasi 3 bunyi di sekitarmu.',
    exampleKey: 'grounding.step3Example',
    exampleFallback: 'Contoh: Desir angin/AC, suara kendaraan di kejauhan, detak jam, suara napasmu sendiri.',
  },
  {
    step: 4,
    count: 2,
    icon: Sparkles,
    color: 'var(--color-warm)',
    bg: 'hsla(35, 75%, 60%, 0.12)',
    titleKey: 'grounding.step2Title',
    titleFallback: '2 Aroma yang Dapat Kamu Cium',
    promptKey: 'grounding.step2Prompt',
    promptFallback: 'Tarik napas perlahan melalui hidung. Cari 2 aroma di sekitarmu, atau ingat aroma yang menenangkanmu.',
    exampleKey: 'grounding.step2Example',
    exampleFallback: 'Contoh: Aroma kopi/teh, wangi sabun pada kulitmu, aroma udara segar, minyak angin.',
  },
  {
    step: 5,
    count: 1,
    icon: Heart,
    color: 'var(--color-secondary)',
    bg: 'hsla(165, 45%, 50%, 0.15)',
    titleKey: 'grounding.step1Title',
    titleFallback: '1 Hal Positif / Rasa Syukur tentang Dirimu',
    promptKey: 'grounding.step1Prompt',
    promptFallback: 'Katakan satu hal baik tentang dirimu, atau satu hal kecil yang kamu syukuri saat ini.',
    exampleKey: 'grounding.step1Example',
    exampleFallback: 'Contoh: "Saya kuat dan sedang berusaha sebaik mungkin", atau rasakan rasa manis/segar di lidahmu.',
  },
];

export const Grounding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reflection, setReflection] = useState<'calmer' | 'same' | 'anxious' | null>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(70); } catch { /* Ignore */ }
    }
  };

  const handleNext = () => {
    triggerHaptic();
    if (currentStepIndex < GROUNDING_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setReflection(null);
  };

  const currentStep = GROUNDING_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="grounding-page">
      <header className="grounding-header">
        <h1 className="page-title">{t('grounding.title', 'Teknik Grounding 5-4-3-2-1')}</h1>
        <p className="grounding-subtitle">
          {t('grounding.subtitle', 'Metode somatik berbasis bukti untuk meredakan panik, kecemasan akut, dan mengembalikan kesadaran ke saat ini.')}
        </p>
      </header>

      {!isCompleted ? (
        <div className="grounding-card card" style={{ padding: 'var(--spacing-xl)', animation: 'fadeInUp 0.4s ease-out' }}>
          {/* Progress indicators */}
          <div className="grounding-progress" role="progressbar" aria-valuenow={currentStepIndex + 1} aria-valuemin={1} aria-valuemax={5}>
            {GROUNDING_STEPS.map((s, idx) => (
              <button
                key={s.step}
                className={`grounding-dot ${idx === currentStepIndex ? 'active' : idx < currentStepIndex ? 'done' : ''}`}
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={t('grounding.stepAria', 'Langkah {{step}}: {{title}}', { step: idx + 1, title: t(s.titleKey, s.titleFallback) })}
              >
                {s.count}
              </button>
            ))}
          </div>

          {/* Main step content */}
          <div className="grounding-step-content" style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <div 
              className="grounding-icon-wrapper" 
              style={{ 
                backgroundColor: currentStep.bg, 
                color: currentStep.color,
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <StepIcon size={40} />
            </div>

            <div className="grounding-count-badge" style={{ color: currentStep.color, fontWeight: 700, fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)' }}>
              {currentStep.count} {t('grounding.things', 'HAL')}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              {t(currentStep.titleKey, currentStep.titleFallback)}
            </h2>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto var(--spacing-lg)' }}>
              {t(currentStep.promptKey, currentStep.promptFallback)}
            </p>

            <div className="grounding-example-box" style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: 'var(--spacing-md)',
              maxWidth: '520px',
              margin: '0 auto var(--spacing-xl)',
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              textAlign: 'left'
            }}>
              💡 <strong>{t('common.example', 'Contoh')}:</strong> {t(currentStep.exampleKey, currentStep.exampleFallback)}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
              {currentStepIndex > 0 && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handlePrev}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <ArrowLeft size={16} />
                  <span>{t('common.previous', 'Sebelumnya')}</span>
                </button>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleNext}
                style={{ minHeight: '44px', minWidth: '140px' }}
              >
                <span>{currentStepIndex === GROUNDING_STEPS.length - 1 ? t('grounding.finish', 'Selesai') : t('common.next', 'Lanjut')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', animation: 'scaleIn 0.4s ease-out' }}>
          <div style={{ color: 'var(--color-secondary)', fontSize: '3.5rem', marginBottom: 'var(--spacing-sm)' }}>
            <CheckCircle size={56} style={{ margin: '0 auto' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
            {t('grounding.completedTitle', 'Latihan Grounding Selesai')}
          </h2>

          <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto var(--spacing-lg)', lineHeight: 1.6 }}>
            {t('grounding.completedDesc', 'Kamu telah membawa pikiran dan tubuhmu kembali ke saat ini. Beri dirimu apresiasi atas langkah ini 🌱')}
          </p>

          {/* Post-session Reflection */}
          <div className="breathe-reflection" style={{ margin: 'var(--spacing-lg) 0' }}>
            <p style={{ fontWeight: 600, fontSize: '0.938rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              {t('breathe.reflectionQuestion', 'Bagaimana perasaanmu sekarang?')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className={`breathe-reflection-btn calmer ${reflection === 'calmer' ? 'active' : ''}`}
                onClick={() => setReflection('calmer')}
              >
                🌱 {t('breathe.feelCalmer', 'Lebih tenang')}
              </button>
              <button
                className={`breathe-reflection-btn ${reflection === 'same' ? 'active' : ''}`}
                onClick={() => setReflection('same')}
              >
                😐 {t('breathe.feelSame', 'Sama saja')}
              </button>
              <button
                className={`breathe-reflection-btn anxious ${reflection === 'anxious' ? 'active' : ''}`}
                onClick={() => setReflection('anxious')}
              >
                🌊 {t('breathe.feelAnxious', 'Masih gelisah')}
              </button>
            </div>
            {reflection && (
              <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)', fontStyle: 'italic' }}>
                {reflection === 'anxious'
                  ? t('grounding.stillAnxiousNote', 'Tidak apa-apa jika belum langsung tenang. Kamu bisa mencoba latihan pernapasan atau membuka rencana keselamatanmu.')
                  : t('breathe.reflectionNote', 'Apapun yang kamu rasakan, itu valid. Kamu sudah melakukan sesuatu yang baik untuk dirimu.')}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              {t('grounding.repeat', 'Ulangi Latihan')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/breathe')}>
              {t('home.meditate', 'Latihan Napas')}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              {t('common.backToHome', 'Kembali ke Beranda')}
            </button>
          </div>
        </div>
      )}

      <ClinicalDisclaimer context={t('disclaimer.grounding', 'Teknik grounding 5-4-3-2-1 adalah intervensi swa-bantu (self-help) untuk regulasi sistem saraf dan bukan pengganti penanganan psikoterapi profesional.')} />
    </div>
  );
};
