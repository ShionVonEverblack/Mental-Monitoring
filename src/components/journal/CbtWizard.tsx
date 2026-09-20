import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check, HelpCircle, Sparkles, TrendingDown } from 'lucide-react';
import type { CbtThoughtRecord, CognitiveDistortionId } from '../../types';
import { COGNITIVE_DISTORTIONS } from '../../utils/constants';

const COMMON_EMOTIONS = [
  { id: 'anxious', labelKey: 'cbt.emotion.anxious', fallback: 'Cemas / Gelisah' },
  { id: 'sad', labelKey: 'cbt.emotion.sad', fallback: 'Sedih / Tertekan' },
  { id: 'angry', labelKey: 'cbt.emotion.angry', fallback: 'Marah / Kesal' },
  { id: 'overwhelmed', labelKey: 'cbt.emotion.overwhelmed', fallback: 'Kewalahan' },
  { id: 'ashamed', labelKey: 'cbt.emotion.ashamed', fallback: 'Malu / Bersalah' },
  { id: 'hopeless', labelKey: 'cbt.emotion.hopeless', fallback: 'Putus Asa' },
  { id: 'lonely', labelKey: 'cbt.emotion.lonely', fallback: 'Kesepian' },
];

export interface CbtWizardProps {
  initialData?: CbtThoughtRecord;
  initialTitle?: string;
  onSave: (payload: { title: string; content: string; cbtRecord: CbtThoughtRecord }) => void;
  onCancel: () => void;
}

export const CbtWizard: React.FC<CbtWizardProps> = ({
  initialData,
  initialTitle = '',
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [title, setTitle] = useState(initialTitle);
  const [situation, setSituation] = useState(initialData?.situation || '');
  const [initialEmotion, setInitialEmotion] = useState(initialData?.initialEmotion || 'anxious');
  const [initialIntensity, setInitialIntensity] = useState<number>(initialData?.initialIntensity ?? 7);
  const [automaticThought, setAutomaticThought] = useState(initialData?.automaticThought || '');
  const [selectedDistortions, setSelectedDistortions] = useState<CognitiveDistortionId[]>(
    initialData?.distortions || []
  );
  const [evidenceFor, setEvidenceFor] = useState(initialData?.evidenceFor || '');
  const [evidenceAgainst, setEvidenceAgainst] = useState(initialData?.evidenceAgainst || '');
  const [balancedThought, setBalancedThought] = useState(initialData?.balancedThought || '');
  const [finalIntensity, setFinalIntensity] = useState<number>(initialData?.finalIntensity ?? 4);

  const toggleDistortion = (id: CognitiveDistortionId) => {
    setSelectedDistortions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = () => {
    const record: CbtThoughtRecord = {
      situation: situation.trim(),
      initialEmotion,
      initialIntensity,
      automaticThought: automaticThought.trim(),
      distortions: selectedDistortions,
      evidenceFor: evidenceFor.trim(),
      evidenceAgainst: evidenceAgainst.trim(),
      balancedThought: balancedThought.trim(),
      finalIntensity,
    };

    const finalTitle =
      title.trim() ||
      `${t('cbt.defaultTitle', 'Restrukturisasi Pikiran')}: ${situation.trim().slice(0, 32)}${situation.length > 32 ? '...' : ''}`;

    const distortionNames = selectedDistortions
      .map(id => {
        const item = COGNITIVE_DISTORTIONS.find(d => d.id === id);
        return item ? t(item.nameKey, item.nameFallback) : id;
      })
      .join(', ');

    const formattedContent = `[Pembedah Pikiran CBT]
1. Situasi: ${record.situation}
2. Emosi: ${record.initialEmotion} (Intensitas Awal: ${record.initialIntensity}/10)
3. Pikiran Otomatis: "${record.automaticThought}"
4. Jebakan Pikiran: ${distortionNames || '-'}
5. Bukti Mendukung: ${record.evidenceFor || '-'}
6. Bukti Membantah: ${record.evidenceAgainst || '-'}
7. Pikiran Seimbang Baru: "${record.balancedThought}"
8. Evaluasi Emosi Akhir: ${record.finalIntensity}/10 (Penurunan: ${Math.max(0, record.initialIntensity - record.finalIntensity)} poin)`;

    onSave({
      title: finalTitle,
      content: formattedContent,
      cbtRecord: record,
    });
  };

  const reliefPoints = Math.max(0, initialIntensity - finalIntensity);

  return (
    <div className="cbt-wizard-container">
      {/* Header with Title & Cancel */}
      <div className="cbt-wizard-header">
        <div>
          <div className="cbt-step-badge">
            <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
            <span>
              {t('cbt.stepIndicator', 'Langkah {{current}} dari {{total}}', {
                current: step,
                total: totalSteps,
              })}
            </span>
          </div>
          <h2 className="cbt-wizard-title">{t('cbt.wizardHeading', 'Pembedah Pikiran (CBT Wizard)')}</h2>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          {t('common.cancel', 'Batal')}
        </button>
      </div>

      {/* Visual Progress Bar */}
      <div className="cbt-progress-track" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
        <div
          className="cbt-progress-fill"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Contents */}
      <div className="cbt-step-content">
        {/* Step 1: Situasi & Emosi Awal */}
        {step === 1 && (
          <div className="cbt-step-pane">
            <h3 className="cbt-step-name">
              1. {t('cbt.step1Title', 'Apa peristiwa objektif yang terjadi?')}
            </h3>
            <p className="cbt-step-desc">
              {t('cbt.step1Desc', 'Fokus pada fakta nyata seperti kamera video yang merekam, tanpa opini atau asumsi.')}
            </p>

            <textarea
              className="cbt-textarea"
              placeholder={t('cbt.situationPlaceholder', 'Contoh: Saya mengirim pesan ke atasan/teman tadi siang tapi belum dibalas hingga sore...')}
              value={situation}
              onChange={e => setSituation(e.target.value)}
              rows={4}
              aria-label={t('cbt.step1Title', 'Apa peristiwa objektif yang terjadi?')}
            />

            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className="cbt-field-label">
                {t('cbt.chooseEmotion', 'Emosi utama yang paling kamu rasakan:')}
              </label>
              <div className="cbt-emotion-chips">
                {COMMON_EMOTIONS.map(em => (
                  <button
                    key={em.id}
                    type="button"
                    className={`cbt-emotion-chip ${initialEmotion === em.id ? 'active' : ''}`}
                    onClick={() => setInitialEmotion(em.id)}
                  >
                    {t(em.labelKey, em.fallback)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cbt-field-label" htmlFor="initial-intensity">
                  {t('cbt.initialIntensityLabel', 'Intensitas emosi saat itu (1 - 10):')}
                </label>
                <span className="cbt-intensity-badge">{initialIntensity} / 10</span>
              </div>
              <input
                id="initial-intensity"
                type="range"
                min="1"
                max="10"
                value={initialIntensity}
                onChange={e => setInitialIntensity(Number(e.target.value))}
                className="cbt-slider"
              />
              <div className="cbt-slider-labels">
                <span>{t('cbt.intensityLow', '1 (Ringan)')}</span>
                <span>{t('cbt.intensityHigh', '10 (Sangat Kuat)')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pikiran Otomatis */}
        {step === 2 && (
          <div className="cbt-step-pane">
            <h3 className="cbt-step-name">
              2. {t('cbt.step2Title', 'Apa pikiran spontan yang langsung muncul?')}
            </h3>
            <p className="cbt-step-desc">
              {t('cbt.step2Desc', 'Kalimat apa yang melintas di kepala saat situasi itu terjadi? Apa yang kamu katakan pada dirimu sendiri?')}
            </p>

            <textarea
              className="cbt-textarea"
              placeholder={t('cbt.thoughtPlaceholder', 'Contoh: Dia pasti membenci saya, saya selalu mengacaukan hubungan dengan orang lain...')}
              value={automaticThought}
              onChange={e => setAutomaticThought(e.target.value)}
              rows={4}
              aria-label={t('cbt.step2Title', 'Apa pikiran spontan yang langsung muncul?')}
            />
            
            <div className="cbt-tip-box">
              <HelpCircle size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <p>
                {t('cbt.thoughtTip', 'Pikiran otomatis sering terasa sangat nyata dan meyakinkan pada saat itu, meskipun belum tentu sesuai dengan fakta sebenarnya.')}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Identifikasi Jebakan Pikiran */}
        {step === 3 && (
          <div className="cbt-step-pane">
            <h3 className="cbt-step-name">
              3. {t('cbt.step3Title', 'Deteksi Jebakan Pikiran (Distorsi Kognitif)')}
            </h3>
            <p className="cbt-step-desc">
              {t('cbt.step3Desc', 'Pilih jebakan pikiran yang mungkin sedang bekerja pada pikiran otomatis di atas. Kamu bisa memilih lebih dari satu:')}
            </p>

            <div className="cbt-distortions-grid">
              {COGNITIVE_DISTORTIONS.map(dist => {
                const isSelected = selectedDistortions.includes(dist.id);
                return (
                  <button
                    key={dist.id}
                    type="button"
                    className={`cbt-distortion-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleDistortion(dist.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="cbt-dist-header">
                      <span className="cbt-dist-icon">{dist.icon}</span>
                      <span className="cbt-dist-name">{t(dist.nameKey, dist.nameFallback)}</span>
                      {isSelected && <Check size={16} className="cbt-dist-check" />}
                    </div>
                    <p className="cbt-dist-desc">{t(dist.descKey, dist.descFallback)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Uji Bukti (Evidence Testing) */}
        {step === 4 && (
          <div className="cbt-step-pane">
            <h3 className="cbt-step-name">
              4. {t('cbt.step4Title', 'Uji Bukti Secara Objektif')}
            </h3>
            <p className="cbt-step-desc">
              {t('cbt.step4Desc', 'Mari bersikap seperti hakim atau detektif yang adil. Pisahkan fakta nyata dari sekadar praduga emosional:')}
            </p>

            <div className="cbt-evidence-container">
              <div className="cbt-evidence-column for">
                <label className="cbt-evidence-label">
                  ⚖️ {t('cbt.evidenceForLabel', 'Fakta Nyata yang Mendukung:')}
                </label>
                <p className="cbt-evidence-hint">
                  {t('cbt.evidenceForHint', 'Bukti konkret apa yang membuktikan pikiran otomatis tersebut benar?')}
                </p>
                <textarea
                  className="cbt-textarea"
                  placeholder={t('cbt.evidenceForPlaceholder', 'Tulis fakta nyata yang mendukung...')}
                  value={evidenceFor}
                  onChange={e => setEvidenceFor(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="cbt-evidence-column against">
                <label className="cbt-evidence-label">
                  🛡️ {t('cbt.evidenceAgainstLabel', 'Fakta Nyata yang Membantah:')}
                </label>
                <p className="cbt-evidence-hint">
                  {t('cbt.evidenceAgainstHint', 'Bukti apa yang menunjukkan kemungkinan lain atau menyangkal pikiran itu?')}
                </p>
                <textarea
                  className="cbt-textarea"
                  placeholder={t('cbt.evidenceAgainstPlaceholder', 'Contoh: Kemarin dia masih menyapa ramah; dia mungkin sedang rapat padat atau ponselnya mati...')}
                  value={evidenceAgainst}
                  onChange={e => setEvidenceAgainst(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Pikiran Seimbang & Evaluasi Akhir */}
        {step === 5 && (
          <div className="cbt-step-pane">
            <h3 className="cbt-step-name">
              5. {t('cbt.step5Title', 'Formulasi Pikiran Baru yang Seimbang')}
            </h3>
            <p className="cbt-step-desc">
              {t('cbt.step5Desc', 'Setelah melihat kedua sisi bukti, tulis cara pandang baru yang lebih adil, realistis, dan berwelas asih pada diri sendiri:')}
            </p>

            <textarea
              className="cbt-textarea"
              placeholder={t('cbt.balancedPlaceholder', 'Contoh: Belum dibalas bukan berarti dia membenci saya. Dia mungkin sedang sibuk, dan saya tetap berharga tanpa perlu kepastian instan.')}
              value={balancedThought}
              onChange={e => setBalancedThought(e.target.value)}
              rows={4}
              aria-label={t('cbt.step5Title', 'Formulasi Pikiran Baru yang Seimbang')}
            />

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cbt-field-label" htmlFor="final-intensity">
                  {t('cbt.finalIntensityLabel', 'Intensitas emosimu sekarang setelah merestrukturisasi pikiran:')}
                </label>
                <span className="cbt-intensity-badge">{finalIntensity} / 10</span>
              </div>
              <input
                id="final-intensity"
                type="range"
                min="1"
                max="10"
                value={finalIntensity}
                onChange={e => setFinalIntensity(Number(e.target.value))}
                className="cbt-slider"
              />
              <div className="cbt-slider-labels">
                <span>{t('cbt.intensityLow', '1 (Ringan)')}</span>
                <span>{t('cbt.intensityHigh', '10 (Sangat Kuat)')}</span>
              </div>
            </div>

            {/* Emotional Relief Delta Card */}
            <div className="cbt-relief-card">
              <div className="cbt-relief-metric">
                <span className="cbt-relief-before">{initialIntensity}/10</span>
                <span className="cbt-relief-arrow">➔</span>
                <span className="cbt-relief-after">{finalIntensity}/10</span>
              </div>
              {reliefPoints > 0 ? (
                <div className="cbt-relief-message success">
                  <TrendingDown size={18} />
                  <span>
                    {t('cbt.reliefSuccess', 'Bagus sekali! Beban emosimu berkurang {{points}} poin setelah restrukturisasi pikiran.', {
                      points: reliefPoints,
                    })}
                  </span>
                </div>
              ) : (
                <div className="cbt-relief-message neutral">
                  <span>
                    {t('cbt.reliefNeutral', 'Terus latih pikiran seimbangmu. Restrukturisasi kognitif adalah keterampilan yang semakin kuat seiring waktu.')}
                  </span>
                </div>
              )}
            </div>

            {/* Optional Custom Title */}
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className="cbt-field-label" htmlFor="cbt-custom-title">
                {t('cbt.titleLabel', 'Judul Catatan (Opsional):')}
              </label>
              <input
                id="cbt-custom-title"
                type="text"
                className="journal-title-input"
                placeholder={t('cbt.titlePlaceholder', 'Restrukturisasi Pikiran...')}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="cbt-wizard-footer">
        {step > 1 ? (
          <button type="button" className="btn btn-ghost" onClick={handleBack}>
            <ArrowLeft size={16} />
            <span>{t('cbt.back', 'Sebelumnya')}</span>
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('common.cancel', 'Batal')}
          </button>
        )}

        {step < totalSteps ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={
              (step === 1 && !situation.trim()) ||
              (step === 2 && !automaticThought.trim())
            }
          >
            <span>{t('cbt.next', 'Lanjutkan')}</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFinish}
            disabled={!balancedThought.trim()}
          >
            <Check size={16} />
            <span>{t('cbt.saveEntry', 'Simpan ke Jurnal')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
