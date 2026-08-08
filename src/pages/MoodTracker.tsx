import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { useMood } from '../hooks/useMood';
import { MOOD_FACTORS } from '../utils/constants';
import type { MoodScore, MoodEmoji } from '../types';

export const MoodTracker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addMood, getMoods, getMoodStats } = useMood();
  
  const history = getMoods().map((m) => ({ 
    ...m, 
    date: new Date(m.createdAt).toLocaleDateString(), 
    relativeTime: new Date(m.createdAt).toLocaleDateString() 
  }));
  const stats = getMoodStats();
  
  const [selectedScore, setSelectedScore] = useState<MoodScore | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<MoodEmoji | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const lang = i18n.language as 'id' | 'en';

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
              {MOOD_FACTORS.map(factor => (
                <button
                  key={factor.id}
                  className={`factor-chip ${selectedFactors.includes(factor.id) ? 'active' : ''}`}
                  onClick={() => toggleFactor(factor.id)}
                >
                  {lang === 'en' ? factor.labelEn : factor.labelId}
                </button>
              ))}
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
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={history}>
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
        </div>
      </section>

      <section className="mood-history">
        <h3>{t('moodTracker.history', { defaultValue: 'Riwayat' })}</h3>
        {history.map((entry) => (
          <div key={entry.id} className="mood-history-item">
            <div className="mood-history-emoji">{entry.emoji}</div>
            <div className="mood-history-info">
              <span className="mood-history-date">{entry.relativeTime}</span>
              {entry.factors.length > 0 && (
                <div className="mood-history-factors">
                  {entry.factors.map(f => {
                    const factorObj = MOOD_FACTORS.find(x => x.id === f);
                    const fLabel = factorObj ? (lang === 'en' ? factorObj.labelEn : factorObj.labelId) : f;
                    return <span key={f} className="factor-chip active">{fLabel}</span>
                  })}
                </div>
              )}
              {entry.note && <p className="mood-history-note">{entry.note}</p>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
