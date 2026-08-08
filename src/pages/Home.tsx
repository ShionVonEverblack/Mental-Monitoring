import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Book, MessageCircle, Heart, Flame, Wind } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { useMood } from '../hooks/useMood';
import { getGreeting } from '../utils/helpers';
import { DAILY_AFFIRMATIONS } from '../utils/constants';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getTodayMood, getWeeklyMoods, addMood, getMoodStats } = useMood();
  
  const todayMood = getTodayMood();
  const recentMoods = getWeeklyMoods().map((m) => ({ 
    date: new Date(m.createdAt).toLocaleDateString(), 
    score: m.score 
  }));
  const currentStreak = getMoodStats().streak;
  
  const affirmationIndex = new Date().getDay() % DAILY_AFFIRMATIONS.length;
  const affirmation = DAILY_AFFIRMATIONS[affirmationIndex];
  const lang = i18n.language as 'id' | 'en';

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-greeting">{getGreeting(lang)}</h1>
        <div className="streak-badge">
          <Flame size={20} />
          <span>{currentStreak} {t('home.daysStreak', { defaultValue: 'Hari' })}</span>
        </div>
      </header>

      <section className="mood-section">
        {!todayMood ? (
          <div className="mood-prompt-card">
            <h2>{t('home.howAreYou', { defaultValue: 'Bagaimana perasaanmu hari ini?' })}</h2>
            <MoodSelector onChange={(score, emoji) => addMood({ score, emoji, factors: [], note: '' })} />
          </div>
        ) : (
          <div className="mood-logged-card">
            <h2>{t('home.moodLogged', { defaultValue: 'Mood hari ini tercatat' })}</h2>
            <div className="logged-emoji">{todayMood.emoji}</div>
          </div>
        )}
      </section>

      <div className="affirmation-card" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
        <p className="affirmation-text">"{lang === 'en' ? affirmation.en : affirmation.id}"</p>
      </div>

      <section className="quick-actions">
        <button className="quick-action-btn journal" onClick={() => navigate('/journal')}>
          <Book className="action-icon" />
          <span>{t('home.writeJournal', { defaultValue: 'Tulis Jurnal' })}</span>
        </button>
        <button className="quick-action-btn forum" onClick={() => navigate('/forum')}>
          <MessageCircle className="action-icon" />
          <span>{t('home.viewForum', { defaultValue: 'Lihat Forum' })}</span>
        </button>
        <button className="quick-action-btn safety" onClick={() => navigate('/safety-plan')}>
          <Heart className="action-icon" />
          <span>{t('home.safetyPlan', { defaultValue: 'Rencana Keselamatan' })}</span>
        </button>
        <button className="quick-action-btn meditate" onClick={() => navigate('/meditate')}>
          <Wind className="action-icon" />
          <span>{t('home.meditate', { defaultValue: 'Meditasi' })}</span>
        </button>
      </section>

      <section className="chart-section">
        <h3>{t('home.recentMoods', { defaultValue: 'Mood 7 Hari Terakhir' })}</h3>
        {recentMoods.length > 0 ? (
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={recentMoods}>
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} hide />
                <Tooltip />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-empty">
            {t('home.noMoodsYet', { defaultValue: 'Belum ada data mood untuk ditampilkan.' })}
          </div>
        )}
      </section>
    </div>
  );
};
