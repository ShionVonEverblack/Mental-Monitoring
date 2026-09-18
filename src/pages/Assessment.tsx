import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  FREQUENCY_OPTIONS,
  evaluatePHQ9,
  evaluateGAD7,
  saveAssessmentResult,
  getAssessmentHistory,
} from '../services/assessmentService';
import type { AssessmentType, AssessmentResult } from '../types';
import { CrisisInterceptor } from '../components/safety/CrisisInterceptor';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { History, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export const Assessment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'id';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AssessmentType | 'history'>('phq9');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'phq9' | 'gad7'>('all');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    severity: string;
    label: string;
    recommendation: string;
    color: string;
  } | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  useEffect(() => {
    setHistory(getAssessmentHistory());
  }, []);

  const chartData = useMemo(() => {
    // Sort chronologically ascending
    const sorted = [...history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sorted.map(entry => ({
      date: formatDate(entry.createdAt, lang),
      rawDate: entry.createdAt,
      type: entry.type,
      phq9: entry.type === 'phq9' ? entry.score : undefined,
      gad7: entry.type === 'gad7' ? entry.score : undefined,
      score: entry.score,
    }));
  }, [history, lang]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return history;
    return history.filter(h => h.type === historyFilter);
  }, [history, historyFilter]);

  const handleSelectOption = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const currentQuestions = activeTab === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const isAllAnswered = currentQuestions.every(q => answers[q.id] !== undefined);

  const handleSubmit = () => {
    if (!isAllAnswered) return;

    if (activeTab === 'phq9') {
      const evaluation = evaluatePHQ9(answers);
      const resData = {
        score: evaluation.score,
        maxScore: 27,
        severity: evaluation.eval.severity,
        label: t(evaluation.eval.labelKey, evaluation.eval.labelFallback),
        recommendation: t(evaluation.eval.recommendationKey, evaluation.eval.recommendationFallback),
        color: evaluation.eval.color,
      };
      setResult(resData);

      // Save locally
      const assessmentEntry: AssessmentResult = {
        id: 'asm-' + Date.now(),
        type: 'phq9',
        score: evaluation.score,
        maxScore: 27,
        severity: evaluation.eval.severity,
        answers,
        createdAt: new Date().toISOString(),
      };
      saveAssessmentResult(assessmentEntry);
      setHistory(getAssessmentHistory());

      // Item 9 Critical Safety Interceptor
      if (evaluation.eval.isCrisisTriggered) {
        setShowCrisisModal(true);
      }
    } else if (activeTab === 'gad7') {
      const evaluation = evaluateGAD7(answers);
      const resData = {
        score: evaluation.score,
        maxScore: 21,
        severity: evaluation.eval.severity,
        label: t(evaluation.eval.labelKey, evaluation.eval.labelFallback),
        recommendation: t(evaluation.eval.recommendationKey, evaluation.eval.recommendationFallback),
        color: evaluation.eval.color,
      };
      setResult(resData);

      const assessmentEntry: AssessmentResult = {
        id: 'asm-' + Date.now(),
        type: 'gad7',
        score: evaluation.score,
        maxScore: 21,
        severity: evaluation.eval.severity,
        answers,
        createdAt: new Date().toISOString(),
      };
      saveAssessmentResult(assessmentEntry);
      setHistory(getAssessmentHistory());
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  const switchTab = (tab: AssessmentType | 'history') => {
    setActiveTab(tab);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="assessment-page">
      <header className="assessment-header">
        <h1 className="page-title">{t('assessment.title', 'Skrining Kesehatan Mental Mandiri')}</h1>
        <p className="assessment-subtitle">
          {t('assessment.subtitle', 'Kuisioner psikometri terstandarisasi (PHQ-9 & GAD-7) berbasis bukti ilmiah untuk memantau dinamika suasana hati dan kecemasan Anda.')}
        </p>
      </header>

      {/* Tabs */}
      <div className="category-chips" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <button
          className={`category-chip ${activeTab === 'phq9' ? 'active' : ''}`}
          onClick={() => switchTab('phq9')}
        >
          {t('assessment.phq9Tab', 'Depresi (PHQ-9)')}
        </button>
        <button
          className={`category-chip ${activeTab === 'gad7' ? 'active' : ''}`}
          onClick={() => switchTab('gad7')}
        >
          {t('assessment.gad7Tab', 'Kecemasan (GAD-7)')}
        </button>
        <button
          className={`category-chip ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => switchTab('history')}
        >
          <History size={14} style={{ display: 'inline', marginRight: '4px' }} />
          {t('assessment.historyTab', 'Riwayat Skrining')} ({history.length})
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="assessment-history">
          {history.length === 0 ? (
            <Card style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t('assessment.noHistory', 'Belum ada riwayat pengisian skrining. Pilih PHQ-9 atau GAD-7 untuk memulai skrining mandiri.')}
              </p>
            </Card>
          ) : (
            <>
              {/* History Filter Chips */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`chip ${historyFilter === 'all' ? 'chip-active' : ''}`}
                  onClick={() => setHistoryFilter('all')}
                >
                  {t('assessment.filterAll', 'Semua')} ({history.length})
                </button>
                <button
                  type="button"
                  className={`chip ${historyFilter === 'phq9' ? 'chip-active' : ''}`}
                  onClick={() => setHistoryFilter('phq9')}
                >
                  {t('assessment.phq9Tab', 'Depresi (PHQ-9)')} ({history.filter(h => h.type === 'phq9').length})
                </button>
                <button
                  type="button"
                  className={`chip ${historyFilter === 'gad7' ? 'chip-active' : ''}`}
                  onClick={() => setHistoryFilter('gad7')}
                >
                  {t('assessment.gad7Tab', 'Kecemasan (GAD-7)')} ({history.filter(h => h.type === 'gad7').length})
                </button>
              </div>

              {/* Longitudinal Trend Chart (if at least 2 entries exist) */}
              {chartData.length >= 2 && (
                <Card style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                    {t('assessment.chartTitle', 'Grafik Tren Skrining')}
                  </h3>
                  <div style={{ width: '100%', height: 260, marginTop: 'var(--spacing-sm)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <YAxis domain={[0, 27]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: '0.813rem',
                          }}
                        />
                        <Legend />
                        <ReferenceLine
                          y={10}
                          stroke="var(--color-danger)"
                          strokeDasharray="4 4"
                          label={{
                            value: t('assessment.clinicalCutoff', 'Batas Klinis (10)'),
                            fill: 'var(--color-danger)',
                            fontSize: 10,
                            position: 'insideTopRight',
                          }}
                        />
                        {(historyFilter === 'all' || historyFilter === 'phq9') && (
                          <Line
                            type="monotone"
                            dataKey="phq9"
                            name={t('assessment.phq9Tab', 'Depresi (PHQ-9)')}
                            stroke="var(--color-primary)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'var(--color-primary)' }}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        )}
                        {(historyFilter === 'all' || historyFilter === 'gad7') && (
                          <Line
                            type="monotone"
                            dataKey="gad7"
                            name={t('assessment.gad7Tab', 'Kecemasan (GAD-7)')}
                            stroke="var(--color-secondary)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'var(--color-secondary)' }}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Assessment Records List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {filteredHistory.map(entry => (
                  <Card key={entry.id} style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                          {entry.type.toUpperCase()}
                        </span>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {t('assessment.scoreLabel', 'Skor')}: {entry.score} / {entry.maxScore}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {formatDate(entry.createdAt, lang)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', margin: '8px 0 0' }}>
                      {t('assessment.severityLabel', 'Tingkat Keparahan')}: <strong>{t(`assessment.${entry.type}.${entry.severity}`, entry.severity.replace('_', ' ').toUpperCase())}</strong>
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : result ? (
        /* Result Screen */
        <Card style={{ padding: 'var(--spacing-xl)', textAlign: 'center', animation: 'fadeInUp 0.4s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'hsla(215, 65%, 55%, 0.1)', color: result.color, marginBottom: 'var(--spacing-md)' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{result.score}</span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
            {result.label}
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
            {t('assessment.scoreOfMax', 'Skor {{type}}: {{score}} dari maksimal {{max}}', { type: activeTab.toUpperCase(), score: result.score, max: result.maxScore })}
          </p>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', maxWidth: '540px', margin: '0 auto var(--spacing-lg)', textAlign: 'left' }}>
            <strong style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              📋 {t('assessment.recommendationTitle', 'Saran & Tindak Lanjut Mandiri')}:
            </strong>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {result.recommendation}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={handleReset} icon={<RotateCcw size={16} />}>
              {t('assessment.repeatTest', 'Ulangi Skrining')}
            </Button>
            <Button variant="primary" onClick={() => navigate('/safety-plan')}>
              {t('home.safetyPlan', 'Rencana Keselamatan')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              {t('common.backToHome', 'Kembali')}
            </Button>
          </div>
        </Card>
      ) : (
        /* Questionnaire Screen */
        <div className="assessment-form card" style={{ padding: 'var(--spacing-xl)', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>
              <ShieldCheck size={18} />
              <span>{t('assessment.timeframePrompt', 'Selama 2 MINGGU TERAKHIR, seberapa sering Anda terganggu oleh masalah berikut?')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {currentQuestions.map((q, idx) => (
              <div key={q.id} style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.938rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                  {idx + 1}. {t(q.textKey, q.textFallback)}
                  {q.id === 9 && activeTab === 'phq9' && (
                    <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginLeft: '6px' }}>*</span>
                  )}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--spacing-xs)' }}>
                  {FREQUENCY_OPTIONS.map(opt => {
                    const isSelected = answers[q.id] === opt.score;
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.score)}
                        aria-pressed={isSelected}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                          background: isSelected ? 'hsla(215, 65%, 55%, 0.12)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.813rem',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          minHeight: '44px',
                          textAlign: 'center',
                        }}
                      >
                        {t(opt.labelKey, opt.labelFallback)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>
              {t('assessment.answeredCount', '{{answered}} dari {{total}} terjawab', { answered: Object.keys(answers).length, total: currentQuestions.length })}
            </span>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              icon={<ArrowRight size={16} />}
            >
              {t('assessment.calculateScore', 'Lihat Hasil Skrining')}
            </Button>
          </div>
        </div>
      )}

      {/* Safety Interceptor Modal for PHQ-9 Item 9 */}
      <CrisisInterceptor
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      <ClinicalDisclaimer context={t('disclaimer.assessment', 'Skrining PHQ-9 dan GAD-7 adalah instrumen skrining mandiri awal untuk refleksi diri, BUKAN diagnosis medis atau evaluasi psikiatri resmi.')} />
    </div>
  );
};
