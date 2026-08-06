import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMood } from '../hooks/useMood';
import { MOOD_FACTORS } from '../utils/constants';

export const MoodTracker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addMood, getMoods, getMoodStats } = useMood();
  
  const history = getMoods().map((m: any) => ({ ...m, date: new Date(m.createdAt).toLocaleDateString(), relativeTime: new Date(m.createdAt).toLocaleDateString() }));
  const stats = getMoodStats();
  
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const handleSave = () => {
    if (selectedScore) {
      addMood({ 
        score: selectedScore as 1|2|3|4|5, 
        emoji: ['😢', '😟', '😐', '🙂', '😊'][selectedScore - 1] as any,
        factors: selectedFactors, 
        note 
      });
      setSelectedScore(null);
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
    <div className="mood-tracker-page animate-fade-in-up">
      <header>
        <h1>{t('moodTracker.title', 'Tracker Mood')}</h1>
      </header>

      <section className="input-section">
        <Card>
          <h3>{t('moodTracker.logMood', { defaultValue: 'Catat Mood' })}</h3>
          <MoodSelector 
            value={selectedScore as 1|2|3|4|5} 
            onChange={setSelectedScore} 
          />
          
          {selectedScore && (
            <div className="expanded-input animate-fade-in">
              <div className="factors-section">
                <h4>{t('moodTracker.factors', { defaultValue: 'Apa yang memengaruhi moodmu?' })}</h4>
                <div className="factors-chips">
                  {MOOD_FACTORS.map(factor => (
                    <button
                      key={factor.id}
                      className={`chip ${selectedFactors.includes(factor.id) ? 'active' : ''}`}
                      onClick={() => toggleFactor(factor.id)}
                    >
                      {factor.icon} {t(`factors.${factor.id}`, { defaultValue: i18n.language === 'en' ? factor.labelEn : factor.labelId })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="note-section">
                <h4>{t('moodTracker.note', { defaultValue: 'Catatan tambahan (opsional)' })}</h4>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('moodTracker.notePlaceholder', { defaultValue: 'Tulis sesuatu...' })}
                  className="input-textarea"
                />
              </div>

              <Button onClick={handleSave} className="w-full mt-4">
                {t('common.save', { defaultValue: 'Simpan' })}
              </Button>
            </div>
          )}
        </Card>
      </section>

      <section className="stats-cards">
        <Card className="stat-card">
          <div className="stat-value">{stats.average.toFixed(1)}</div>
          <div className="stat-label">{t('moodTracker.avgMood', { defaultValue: 'Rata-rata Mood' })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">{t('moodTracker.streak', { defaultValue: 'Streak' })}</div>
        </Card>
      </section>

      <section className="chart-section">
        <div className="chart-controls">
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => setTimeRange('week')}
          >
            {t('moodTracker.weekly', { defaultValue: 'Mingguan' })}
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            {t('moodTracker.monthly', { defaultValue: 'Bulanan' })}
          </button>
        </div>
        <Card className="chart-card">
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
        </Card>
      </section>

      <section className="history-section">
        <h3>{t('moodTracker.history', { defaultValue: 'Riwayat' })}</h3>
        <div className="history-list">
          {history.map((entry: any) => (
            <Card key={entry.id} className="history-item">
              <div className="history-header">
                <span className="history-emoji">{entry.emoji}</span>
                <span className="history-date">{entry.relativeTime}</span>
              </div>
              {entry.factors.length > 0 && (
                <div className="history-factors">
                  {entry.factors.map((f: string) => <span key={f} className="small-chip">{f}</span>)}
                </div>
              )}
              {entry.note && <p className="history-note">{entry.note}</p>}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
