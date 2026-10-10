import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  CFT_MINDFULNESS_PHRASES,
  CFT_HUMANITY_PHRASES,
  CFT_KINDNESS_PHRASES,
  SOOTHING_TOUCH_TECHNIQUES,
} from '../../data/cftContent';
import { Heart, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export interface SelfCompassionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (summary: {
    mindfulness: string;
    humanity: string;
    kindness: string;
    touchTechnique: string;
  }) => void;
}

export const SelfCompassionModal: React.FC<SelfCompassionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [selectedMindfulness, setSelectedMindfulness] = useState<string>(CFT_MINDFULNESS_PHRASES[0].id);
  const [customMindfulness, setCustomMindfulness] = useState<string>('');
  const [selectedHumanity, setSelectedHumanity] = useState<string>(CFT_HUMANITY_PHRASES[0].id);
  const [selectedTouch, setSelectedTouch] = useState<string>(SOOTHING_TOUCH_TECHNIQUES[0].id);
  const [selectedKindness, setSelectedKindness] = useState<string>(CFT_KINDNESS_PHRASES[0].id);

  const resetState = () => {
    setStep(1);
    setSelectedMindfulness(CFT_MINDFULNESS_PHRASES[0].id);
    setCustomMindfulness('');
    setSelectedHumanity(CFT_HUMANITY_PHRASES[0].id);
    setSelectedTouch(SOOTHING_TOUCH_TECHNIQUES[0].id);
    setSelectedKindness(CFT_KINDNESS_PHRASES[0].id);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const getMindfulnessText = (): string => {
    if (customMindfulness.trim()) return customMindfulness.trim();
    const found = CFT_MINDFULNESS_PHRASES.find((p) => p.id === selectedMindfulness);
    return found ? t(found.key, found.fallback) : '';
  };

  const getHumanityText = (): string => {
    const found = CFT_HUMANITY_PHRASES.find((p) => p.id === selectedHumanity);
    return found ? t(found.key, found.fallback) : '';
  };

  const getKindnessText = (): string => {
    const found = CFT_KINDNESS_PHRASES.find((p) => p.id === selectedKindness);
    return found ? t(found.key, found.fallback) : '';
  };

  const getTouchObj = () => {
    return SOOTHING_TOUCH_TECHNIQUES.find((t) => t.id === selectedTouch) || SOOTHING_TOUCH_TECHNIQUES[0];
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete({
        mindfulness: getMindfulnessText(),
        humanity: getHumanityText(),
        kindness: getKindnessText(),
        touchTechnique: selectedTouch,
      });
    }
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('cft.modal_title', 'Jeda Belas Kasih Diri (Self-Compassion Break)')}
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Step Progress Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: step === s ? 'var(--color-primary)' : step > s ? 'var(--color-success)' : 'var(--bg-secondary)',
                  color: step >= s ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {step <= 3 ? `${t('cft.step_label', 'Langkah')} ${step} / 3` : t('cft.completed_label', 'Selesai')}
          </span>
        </div>

        {/* STEP 1: Mindfulness */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {t('cft.step1_heading', '1. Mindfulness: Akui Rasa Sakit Tanpa Menghakimi')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('cft.step1_sub', 'Beri nama pada apa yang sedang kamu rasakan. Kamu tidak perlu berpura-pura kuat.')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CFT_MINDFULNESS_PHRASES.map((phrase) => {
                const isSelected = selectedMindfulness === phrase.id && !customMindfulness;
                return (
                  <button
                    key={phrase.id}
                    type="button"
                    onClick={() => {
                      setSelectedMindfulness(phrase.id);
                      setCustomMindfulness('');
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                    }}
                  >
                    "{t(phrase.key, phrase.fallback)}"
                  </button>
                );
              })}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('cft.step1_custom_label', 'Atau tulis apa yang sedang kamu rasakan dengan kata-katamu sendiri:')}
              </label>
              <textarea
                value={customMindfulness}
                onChange={(e) => setCustomMindfulness(e.target.value)}
                placeholder={t('cft.step1_custom_placeholder', 'Contoh: Hatiku terasa sangat sesak karena masalah ini...')}
                className="input textarea"
                style={{ width: '100%', minHeight: '60px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                icon={<ArrowRight size={16} />}
              >
                {t('common.next', 'Lanjut ke Langkah 2')}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Common Humanity */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {t('cft.step2_heading', '2. Kemanusiaan Bersama: Kamu Tidak Sendirian')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('cft.step2_sub', 'Kesulitan, kekecewaan, dan ketidaksempurnaan adalah bagian dari pengalaman universal seluruh manusia.')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CFT_HUMANITY_PHRASES.map((phrase) => {
                const isSelected = selectedHumanity === phrase.id;
                return (
                  <button
                    key={phrase.id}
                    type="button"
                    onClick={() => setSelectedHumanity(phrase.id)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                    }}
                  >
                    "{t(phrase.key, phrase.fallback)}"
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />}>
                {t('common.back', 'Kembali')}
              </Button>
              <Button variant="primary" onClick={() => setStep(3)} icon={<ArrowRight size={16} />}>
                {t('common.next', 'Lanjut ke Langkah 3')}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Self-Kindness & Soothing Touch */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {t('cft.step3_heading', '3. Kebaikan Diri & Sentuhan Menenangkan')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('cft.step3_sub', 'Sentuhan fisik yang lembut memicu pelepasan hormon oksitosin untuk menenangkan sistem saraf otonommu.')}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {t('cft.step3_touch_pick', 'Pilih pose sentuhan somatik yang paling nyaman bagimu saat ini:')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {SOOTHING_TOUCH_TECHNIQUES.map((tech) => {
                  const isSelected = selectedTouch === tech.id;
                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTouch(tech.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem' }}>{tech.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {t(tech.titleKey, tech.titleFallback)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {t(tech.descKey, tech.descFallback)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {t('cft.step3_kindness_pick', 'Pilih doa atau harapan welas asih untuk dirimu:')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CFT_KINDNESS_PHRASES.map((phrase) => {
                  const isSelected = selectedKindness === phrase.id;
                  return (
                    <button
                      key={phrase.id}
                      type="button"
                      onClick={() => setSelectedKindness(phrase.id)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      "{t(phrase.key, phrase.fallback)}"
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft size={16} />}>
                {t('common.back', 'Kembali')}
              </Button>
              <Button variant="primary" onClick={() => setStep(4)} icon={<Sparkles size={16} />}>
                {t('cft.see_covenant', 'Lihat Ikrar Welas Asih')}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Summary / Covenant */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600 }}>
                <Heart size={20} />
                <span>{t('cft.covenant_title', 'Ikrar Belas Kasih Diri Hari Ini')}</span>
              </div>

              <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                <p style={{ margin: 0 }}>"{getMindfulnessText()}"</p>
                <p style={{ margin: 0 }}>"{getHumanityText()}"</p>
                <p style={{ margin: 0 }}>"{getKindnessText()}"</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <span style={{ fontSize: '1.25rem' }}>{getTouchObj().icon}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t(getTouchObj().titleKey, getTouchObj().titleFallback)}
                </span>
              </div>
            </Card>

            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {t('cft.covenant_blessing', 'Tarik satu napas dalam. Rasakan kehangatan sentuhanmu dan biarkan hatimu melembut.')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setStep(3)} icon={<ArrowLeft size={16} />}>
                {t('common.back', 'Kembali')}
              </Button>
              <Button variant="primary" onClick={handleFinish} icon={<CheckCircle2 size={16} />}>
                {t('cft.finish_btn', 'Selesai & Simpan Ketenangan')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
