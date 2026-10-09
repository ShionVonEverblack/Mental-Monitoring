import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  ArrowLeft,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  CSSRS_QUESTIONS,
  evaluateCssrs,
  saveCssrsResult,
} from '../../services/cssrsService';
import type {
  CssrsAnswers,
  CssrsEvaluation,
  CssrsResult,
} from '../../types';

export interface CssrsWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: 'phq9_item9' | 'manual' | 'keyword_crisis';
  onComplete?: (result: CssrsResult) => void;
}

type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q6Recent';

export const CssrsWizardModal: React.FC<CssrsWizardModalProps> = ({
  isOpen,
  onClose,
  source = 'manual',
  onComplete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentQId, setCurrentQId] = useState<QuestionId>('q1');
  const [historyStack, setHistoryStack] = useState<QuestionId[]>(['q1']);
  const [answers, setAnswers] = useState<Partial<CssrsAnswers>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<CssrsResult | null>(null);

  if (!isOpen) return null;

  const currentDef = CSSRS_QUESTIONS.find(q => q.id === currentQId) || CSSRS_QUESTIONS[0];

  const handleAnswer = (value: boolean) => {
    const updatedAnswers: Partial<CssrsAnswers> = {
      ...answers,
      [currentQId]: value,
    };
    setAnswers(updatedAnswers);

    let nextQ: QuestionId | null = null;

    if (currentQId === 'q1') {
      nextQ = 'q2';
    } else if (currentQId === 'q2') {
      // Skip logic: if No, skip q3, q4, q5 and jump to q6
      nextQ = value ? 'q3' : 'q6';
    } else if (currentQId === 'q3') {
      nextQ = 'q4';
    } else if (currentQId === 'q4') {
      nextQ = 'q5';
    } else if (currentQId === 'q5') {
      nextQ = 'q6';
    } else if (currentQId === 'q6') {
      // If behavior Yes -> ask if in past 3 months (q6Recent)
      nextQ = value ? 'q6Recent' : null;
    } else if (currentQId === 'q6Recent') {
      nextQ = null;
    }

    if (nextQ) {
      setCurrentQId(nextQ);
      setHistoryStack(prev => [...prev, nextQ]);
    } else {
      // Finished all relevant questions -> evaluate
      const fullAnswers: CssrsAnswers = {
        q1: updatedAnswers.q1 ?? false,
        q2: updatedAnswers.q2 ?? false,
        q3: updatedAnswers.q3,
        q4: updatedAnswers.q4,
        q5: updatedAnswers.q5,
        q6: updatedAnswers.q6 ?? false,
        q6Recent: updatedAnswers.q6Recent,
      };

      const evaluation: CssrsEvaluation = evaluateCssrs(fullAnswers);
      const savedResult = saveCssrsResult({
        answers: fullAnswers,
        evaluation,
        source,
      });

      setResult(savedResult);
      setIsFinished(true);
      if (onComplete) {
        onComplete(savedResult);
      }
    }
  };

  const handleBack = () => {
    if (historyStack.length <= 1) return;
    const newStack = [...historyStack];
    newStack.pop();
    const prevQ = newStack[newStack.length - 1];
    setHistoryStack(newStack);
    setCurrentQId(prevQ);
  };

  const handleReset = () => {
    setCurrentQId('q1');
    setHistoryStack(['q1']);
    setAnswers({});
    setIsFinished(false);
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleOpenSafetyPlan = () => {
    handleClose();
    navigate('/safety-plan');
  };

  // Render question progression step
  const renderWizardContent = () => (
    <div style={{ padding: 'var(--spacing-md) 0' }}>
      {source === 'phq9_item9' && (
        <div
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--color-warning)',
            fontSize: '0.813rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-lg)',
            lineHeight: 1.5,
          }}
        >
          {t('cssrs.triggerNotice', 'Kamu mengindikasikan adanya pikiran yang berat pada asesmen. Kami ingin memastikan kamu mendapatkan dukungan yang tepat.')}
        </div>
      )}

      {/* Progress header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <span
          style={{
            fontSize: '0.813rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {t('cssrs.stepProgress', 'Pertanyaan {{current}} dari {{total}}', {
            current: historyStack.length,
            total: answers.q2 === false ? 3 : 6,
          })}
        </span>
        {historyStack.length > 1 && (
          <button
            onClick={handleBack}
            className="btn btn-ghost"
            style={{
              padding: '4px 8px',
              fontSize: '0.813rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            {t('cssrs.btnBack', 'Kembali')}
          </button>
        )}
      </div>

      {/* Question Card */}
      <Card
        padding="lg"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <h3
          style={{
            fontSize: '1.063rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-sm)',
            lineHeight: 1.4,
          }}
        >
          {t(currentDef.titleKey, currentDef.titleFallback)}
        </h3>
        <p
          style={{
            fontSize: '0.938rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {t(currentDef.textKey, currentDef.textFallback)}
        </p>
      </Card>

      {/* Decision Touch Targets (Bottom Thumb Zone - min 48px) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <Button
          variant="secondary"
          onClick={() => handleAnswer(false)}
          style={{
            minHeight: '52px',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {t('cssrs.btnNo', 'Tidak')}
        </Button>
        <Button
          variant="primary"
          onClick={() => handleAnswer(true)}
          style={{
            minHeight: '52px',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {t('cssrs.btnYes', 'Ya')}
        </Button>
      </div>

      {/* Subtle dismiss / cancel option */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleClose}
          className="btn btn-ghost"
          style={{
            fontSize: '0.813rem',
            color: 'var(--text-tertiary)',
            padding: '6px 12px',
            minHeight: '36px',
            cursor: 'pointer',
          }}
        >
          {t('cssrs.btnCancel', 'Tutup')}
        </button>
      </div>
    </div>
  );

  // Render evaluation outcome & tiered action screen
  const renderOutcomeContent = () => {
    if (!result) return null;
    const { evaluation } = result;
    const isHigh = evaluation.riskLevel === 'high';
    const isModerate = evaluation.riskLevel === 'moderate';
    const isLow = evaluation.riskLevel === 'low';

    return (
      <div style={{ padding: 'var(--spacing-md) 0', textAlign: 'center' }}>
        {/* Tier Icon */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          {isHigh && (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-danger, #ef4444)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={36} />
            </div>
          )}
          {isModerate && (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-warning, #f59e0b)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={36} />
            </div>
          )}
          {isLow && (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--color-info, #3b82f6)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={36} />
            </div>
          )}
          {!isHigh && !isModerate && !isLow && (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--color-success, #10b981)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={36} />
            </div>
          )}
        </div>

        {/* Risk Badge */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background:
                isHigh
                  ? 'rgba(239, 68, 68, 0.12)'
                  : isModerate
                    ? 'rgba(245, 158, 11, 0.12)'
                    : isLow
                      ? 'rgba(59, 130, 246, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
              color:
                isHigh
                  ? 'var(--color-danger, #ef4444)'
                  : isModerate
                    ? 'var(--color-warning, #f59e0b)'
                    : isLow
                      ? 'var(--color-info, #3b82f6)'
                      : 'var(--color-success, #10b981)',
            }}
          >
            {isHigh
              ? t('cssrs.riskLevelHigh', 'Tingkat Risiko: Tinggi')
              : isModerate
                ? t('cssrs.riskLevelModerate', 'Tingkat Risiko: Sedang')
                : isLow
                  ? t('cssrs.riskLevelLow', 'Tingkat Risiko: Rendah')
                  : t('cssrs.riskLevelNone', 'Tingkat Risiko: Minimal / Stabil')}
          </span>
        </div>

        {/* Evaluation Title & Description */}
        <h2
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-xs)',
            lineHeight: 1.3,
          }}
        >
          {t(evaluation.titleKey, evaluation.titleFallback)}
        </h2>

        <p
          style={{
            fontSize: '0.938rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-lg)',
            lineHeight: 1.6,
            maxWidth: '440px',
            margin: '0 auto var(--spacing-lg)',
          }}
        >
          {t(evaluation.descKey, evaluation.descFallback)}
        </p>

        {/* Action Recommendations */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
            maxWidth: '380px',
            margin: '0 auto var(--spacing-lg)',
          }}
        >
          {/* High or Moderate: Direct Call Healing 119 */}
          {(isHigh || isModerate) && (
            <a
              href="tel:119,8"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: 'var(--spacing-md)',
                background: isHigh ? 'var(--color-danger, #ef4444)' : 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: '48px',
              }}
            >
              <Phone size={18} />
              {t('cssrs.btnCall119', 'Hubungi Healing 119')} (119 ext 8)
            </a>
          )}

          {/* High risk: Secondary emergency 112 */}
          {isHigh && (
            <a
              href="tel:112"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: 'var(--spacing-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.938rem',
                minHeight: '48px',
              }}
            >
              <Phone size={18} />
              {t('cssrs.btnCall112', 'Hubungi Darurat 112')}
            </a>
          )}

          {/* Safety plan shortcut */}
          <Button
            variant={isHigh || isModerate ? 'secondary' : 'primary'}
            onClick={handleOpenSafetyPlan}
            icon={<FileText size={18} />}
            style={{
              minHeight: '48px',
              fontSize: '0.938rem',
              fontWeight: 600,
              width: '100%',
            }}
          >
            {t('cssrs.btnViewSafetyPlan', 'Buka Rencana Keselamatan')}
          </Button>

          {/* Finish / Dismiss button */}
          <button
            onClick={handleClose}
            className="btn btn-ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: 'var(--spacing-sm)',
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              minHeight: '40px',
              cursor: 'pointer',
            }}
          >
            {isHigh || isModerate ? (
              <>
                <X size={16} />
                {t('common.close', 'Tutup')}
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {t('cssrs.btnFinish', 'Selesai')}
              </>
            )}
          </button>
        </div>

        {/* Clinical Disclaimer */}
        <p
          style={{
            fontSize: '0.688rem',
            color: 'var(--text-tertiary)',
            fontStyle: 'italic',
            lineHeight: 1.4,
            maxWidth: '420px',
            margin: '0 auto',
          }}
        >
          ⚕️ {t('cssrs.disclaimer', 'Skrining ini didasarkan pada instrumen ilmiah C-SSRS untuk panduan bantuan diri dan bukan pengganti evaluasi psikiatri langsung.')}
        </p>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isFinished ? '' : t('cssrs.title', 'Skrining Keselamatan Diri (C-SSRS)')}
      size="md"
    >
      {isFinished ? renderOutcomeContent() : renderWizardContent()}
    </Modal>
  );
};
