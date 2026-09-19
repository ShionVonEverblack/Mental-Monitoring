import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Trash2 } from 'lucide-react';
import { MoodSelector } from '../components/ui/MoodSelector';
import { Modal } from '../components/ui/Modal';
import { useMood } from '../hooks/useMood';
import { MOOD_FACTORS } from '../utils/constants';
import type { MoodScore, MoodEmoji } from '../types';
import { formatDate, formatRelativeTime } from '../utils/helpers';

export const MoodTracker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addMood, deleteMood, getMoods, getWeeklyMoods, getMonthlyMoods, getMoodStats } = useMood();
  const lang = i18n.language?.split('-')[0] || 'id';
  
  const history = getMoods().map((m) => ({ 
    ...m, 
    date: formatDate(m.createdAt, lang), 
    relativeTime: formatRelativeTime(m.createdAt, lang) 
  }));
  const stats = getMoodStats();
  
  const [selectedScore, setSelectedScore] = useState<MoodScore | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<MoodEmoji | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [deletingMoodId, setDeletingMoodId] = useState<string | null>(null);

  // Chronologically ordered data filtered by selected time range
  const chartData = useMemo(() => {
    const raw = timeRange === 'week' ? getWeeklyMoods() : getMonthlyMoods();
    return [...raw]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((m) => ({
        ...m,
        date: formatDate(m.createdAt, lang),
      }));
  }, [timeRange, getWeeklyMoods, getMonthlyMoods, lang]);

  const handleSave = () => {
    if (selectedScore && selectedEmoji) {
      addMood({ 
        score: selectedScore, 
        emoji: selectedEmoji,
        factors: selectedFactors, 
        note 
      });
      setSelectedScore(null);
      setSelectedEmoji(null);
      setSelectedFactors([]);
      setNote('');
    }
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  return (
    <div className="mood-tracker-page">
      <header>
        <h1 className="page-title">{t('moodTracker.title', { defaultValue: 'Tracker Mood' })}</h1>
      </header>

      <section className="mood-input-section">
        <h3>{t('moodTracker.logMood', { defaultValue: 'Catat Mood' })}</h3>
        <MoodSelector 
          onChange={(score, emoji) => {
            setSelectedScore(score);
            setSelectedEmoji(emoji);
          }} 
        />
        
        {selectedScore && (
          <div className="factors-section">
            <h4 className="factors-title">{t('moodTracker.factors', { defaultValue: 'Apa yang memengaruhi moodmu?' })}</h4>
            <div className="factors-grid">
              {MOOD_FACTORS.map(factor => {
                const isSelected = selectedFactors.includes(factor.id);
                return (
                  <button
                    key={factor.id}
                    className={`factor-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleFactor(factor.id)}
                    aria-pressed={isSelected}
                  >
                    {t(`mood.factorList.${factor.id}`, i18n.language === 'en' ? factor.labelEn : factor.labelId)}
                  </button>
                );
              })}
            </div>

            <h4 className="factors-title">{t('moodTracker.note', { defaultValue: 'Catatan tambahan (opsional)' })}</h4>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('moodTracker.notePlaceholder', { defaultValue: 'Tulis sesuatu...' })}
              className="mood-note-input"
            />

            <button onClick={handleSave} className="mood-save-btn">
              {t('common.save', { defaultValue: 'Simpan' })}
            </button>
          </div>
        )}
      </section>

      <section className="mood-stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.average.toFixed(1)}</div>
          <div className="stat-label">{t('moodTracker.avgMood', { defaultValue: 'Rata-rata Mood' })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">{t('moodTracker.streak', { defaultValue: 'Streak' })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">{t('moodTracker.total', { defaultValue: 'Total Entri' })}</div>
        </div>
      </section>

      <section className="chart-section">
        <div className="mood-tabs">
          <button 
            className={`mood-tab ${timeRange === 'week' ? 'active' : ''}`} 
            onClick={() => setTimeRange('week')}
          >
            {t('moodTracker.weekly', { defaultValue: 'Mingguan' })}
          </button>
          <button 
            className={`mood-tab ${timeRange === 'month' ? 'active' : ''}`} 
            onClick={() => setTimeRange('month')}
          >
            {t('moodTracker.monthly', { defaultValue: 'Bulanan' })}
          </button>
        </div>
        <div className="chart-card">
          {chartData.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                {t('moodTracker.noDataRange', 'Belum ada data mood pada rentang waktu ini.')}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} hide />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mood-history">
        <h3>{t('moodTracker.history', { defaultValue: 'Riwayat' })}</h3>
        {history.map((entry) => (
          <div key={entry.id} className="mood-history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flex: 1 }}>
              <div className="mood-history-emoji">{entry.emoji}</div>
              <div className="mood-history-info">
                <span className="mood-history-date">{entry.relativeTime}</span>
                {entry.factors.length > 0 && (
                  <div className="mood-history-factors">
                    {entry.factors.map(f => {
                      const factorObj = MOOD_FACTORS.find(x => x.id === f);
                      const fLabel = t(`mood.factorList.${f}`, factorObj ? (lang === 'en' ? factorObj.labelEn : factorObj.labelId) : f);
                      return <span key={f} className="factor-chip active">{fLabel}</span>
                    })}
                  </div>
                )}
                {entry.note && <p className="mood-history-note">{entry.note}</p>}
              </div>
            </div>
            <button
              type="button"
              className="btn-icon btn-icon-danger"
              onClick={() => setDeletingMoodId(entry.id)}
              aria-label={t('common.delete', 'Hapus')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>

      {deletingMoodId && (
        <Modal
          isOpen={!!deletingMoodId}
          onClose={() => setDeletingMoodId(null)}
          title={t('common.deleteConfirmTitle', 'Konfirmasi Hapus')}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: 1.5 }}>
            {t('mood.deleteConfirm', 'Apakah kamu yakin ingin menghapus catatan mood ini?')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeletingMoodId(null)}
            >
              {t('common.cancel', 'Batal')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (deletingMoodId) {
                  deleteMood(deletingMoodId);
                  setDeletingMoodId(null);
                }
              }}
            >
              {t('common.delete', 'Hapus')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
