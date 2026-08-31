import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Book, MessageCircle, Heart, Flame, Wind, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { useMood } from '../hooks/useMood';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getGreeting } from '../utils/helpers';
import { DAILY_AFFIRMATIONS } from '../utils/constants';
import { SPIRITUAL_CONTENT } from '../data/spiritualContent';
import { EscalationBanner } from '../components/common/EscalationBanner';
import { generateInsights } from '../services/moodAnalysisService';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { moods, getTodayMood, getWeeklyMoods, addMood, getMoodStats } = useMood();
  
  const todayMood = getTodayMood();
  const weeklyMoods = getWeeklyMoods();
  const recentMoods = weeklyMoods.map((m) => ({ 
    date: new Date(m.createdAt).toLocaleDateString(), 
    score: m.score 
  }));
  const currentStreak = getMoodStats().streak;
  
  const affirmationIndex = new Date().getDay() % DAILY_AFFIRMATIONS.length;
  const affirmation = DAILY_AFFIRMATIONS[affirmationIndex];
  const lang = i18n.language as 'id' | 'en';
  
  const insights = generateInsights(weeklyMoods);

  const [spiritualEnabled] = useLocalStorage('rima-spiritual-enabled', false);
  const [spiritualSource] = useLocalStorage<string>('rima-spiritual-source', 'universal');

  // Rotate between regular affirmations and spiritual content
  const spiritualItems = spiritualEnabled 
    ? SPIRITUAL_CONTENT.filter(s => spiritualSource === 'universal' ? true : s.source === spiritualSource || s.source === 'universal')
    : [];

  const showSpiritual = spiritualEnabled && spiritualItems.length > 0 && new Date().getDate() % 2 === 0;
  const spiritualItem = spiritualItems[new Date().getDay() % (spiritualItems.length || 1)];

  // In a real app, you'd fetch the latest journal content here. For now, pass undefined.
  const latestJournalContent = undefined;

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

      <EscalationBanner moods={moods} latestJournalContent={latestJournalContent} />

      <div className="affirmation-card" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
        {showSpiritual && spiritualItem ? (
          <>
            <p className="affirmation-text">"{lang === 'en' ? spiritualItem.contentEn : spiritualItem.contentId}"</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
              {spiritualItem.icon} {lang === 'en' ? spiritualItem.titleEn : spiritualItem.titleId}
            </p>
          </>
        ) : (
          <p className="affirmation-text">"{lang === 'en' ? affirmation.en : affirmation.id}"</p>
        )}
      </div>

      {weeklyMoods.length >= 3 && (
        <section className="insight-section">
          <h3>{t('insights.weeklyTitle', 'Insight Mingguan')}</h3>
          <div className="insight-cards">
            {insights.map((insight: { severity: string; icon: string; titleKey: string; titleFallback: string; descriptionKey: string; descriptionFallback: string }, i: number) => (
              <div key={i} className={`insight-card insight-${insight.severity}`}>
                <span className="insight-icon">{insight.icon}</span>
                <div>
                  <strong>{String(t(insight.titleKey, insight.titleFallback))}</strong>
                  <p>{String(t(insight.descriptionKey, insight.descriptionFallback))}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <button className="quick-action-btn meditate" onClick={() => navigate('/breathe')}>
          <Wind className="action-icon" />
          <span>{t('home.meditate', { defaultValue: 'Meditasi' })}</span>
        </button>
        <button className="quick-action-btn education" onClick={() => navigate('/education')}>
          <BookOpen className="action-icon" />
          <span>{t('home.education', 'Edukasi')}</span>
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
