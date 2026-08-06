import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Book, MessageCircle, Heart, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMood } from '../hooks/useMood';
import { getGreeting } from '../utils/helpers';
import { DAILY_AFFIRMATIONS } from '../utils/constants';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getTodayMood, getWeeklyMoods, addMood, getMoodStats } = useMood();
  
  const todayMood = getTodayMood();
  const recentMoods = getWeeklyMoods().map((m: any) => ({ date: new Date(m.createdAt).toLocaleDateString(), score: m.score }));
  const currentStreak = getMoodStats().streak;
  
  const affirmation = DAILY_AFFIRMATIONS[new Date().getDay() % DAILY_AFFIRMATIONS.length];

  return (
    <div className="home-page animate-fade-in-up">
      <header className="home-header">
        <h1>{getGreeting(i18n.language as 'id' | 'en')}</h1>
        <div className="streak-badge">
          <Flame size={20} className="text-warm" />
          <span>{currentStreak} {t('home.daysStreak', { defaultValue: 'Hari' })}</span>
        </div>
      </header>

      <section className="mood-section">
        {!todayMood ? (
          <Card className="mood-prompt">
            <h2>{t('home.howAreYou', { defaultValue: 'Bagaimana perasaanmu hari ini?' })}</h2>
            <MoodSelector onChange={(score, emoji) => addMood({ score, emoji, factors: [], note: '' })} />
          </Card>
        ) : (
          <Card className="mood-logged">
            <h2>{t('home.moodLogged', { defaultValue: 'Mood hari ini tercatat' })}</h2>
            <div className="logged-emoji">{(todayMood as any).emoji}</div>
          </Card>
        )}
      </section>

      <section className="affirmation-section">
        <Card className="affirmation-card bg-accent-soft">
          <p className="affirmation-text">"{i18n.language === 'en' ? affirmation.en : affirmation.id}"</p>
        </Card>
      </section>

      <section className="quick-actions">
        <Button variant="ghost" className="action-btn" onClick={() => navigate('/journal')}>
          <Book size={24} />
          <span>{t('home.writeJournal', { defaultValue: 'Tulis Jurnal' })}</span>
        </Button>
        <Button variant="ghost" className="action-btn" onClick={() => navigate('/forum')}>
          <MessageCircle size={24} />
          <span>{t('home.viewForum', { defaultValue: 'Lihat Forum' })}</span>
        </Button>
        <Button variant="primary" className="action-btn sos-btn" onClick={() => navigate('/safety-plan')}>
          <Heart size={24} />
          <span>{t('home.safetyPlan', { defaultValue: 'Rencana Keselamatan' })}</span>
        </Button>
      </section>

      <section className="chart-section">
        <h3>{t('home.recentMoods', { defaultValue: 'Mood 7 Hari Terakhir' })}</h3>
        <Card className="chart-card">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recentMoods}>
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} hide />
              <Tooltip />
              <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>
    </div>
  );
};
