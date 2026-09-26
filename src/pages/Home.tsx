import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Book, MessageCircle, Heart, Flame, Wind, BookOpen, Globe, Sparkles, ClipboardCheck, Snowflake } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { Modal } from '../components/ui/Modal';
import { useMood } from '../hooks/useMood';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getGreeting, formatDate } from '../utils/helpers';
import { DAILY_AFFIRMATIONS, AVAILABLE_LANGUAGES, MOOD_EMOJIS } from '../utils/constants';
import { SPIRITUAL_CONTENT } from '../data/spiritualContent';
import { EscalationBanner } from '../components/common/EscalationBanner';
import { generateInsights } from '../services/moodAnalysisService';
import type { Language, MoodScore } from '../types';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { moods, getTodayMood, getWeeklyMoods, addMood, getMoodStats } = useMood();
  const [showLangModal, setShowLangModal] = useState(false);
  
  const currentLang = (i18n.language?.split('-')[0] || 'id') as Language;
  const todayMood = getTodayMood();
  const weeklyMoods = getWeeklyMoods();

  // Chronologically sorted (past -> present) and localized mood records for the chart
  const recentMoods = useMemo(() => {
    return [...weeklyMoods]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((m) => {
        const score = m.score as MoodScore;
        const moodInfo = MOOD_EMOJIS[score];
        const moodLabel = moodInfo
          ? (currentLang === 'en' ? moodInfo.labelEn : moodInfo.labelId)
          : `${score}`;
        return {
          date: formatDate(m.createdAt, currentLang),
          score: m.score,
          label: moodLabel,
          emoji: moodInfo?.emoji || '😐',
          color: moodInfo?.color || 'var(--color-primary)'
        };
      });
  }, [weeklyMoods, currentLang]);

  const stats = getMoodStats();
  const currentStreak = stats.streak;
  const isGrace = stats.isGrace;
  
  const affirmationIndex = new Date().getDay() % DAILY_AFFIRMATIONS.length;
  const affirmation = DAILY_AFFIRMATIONS[affirmationIndex];
  const currentLangObj = AVAILABLE_LANGUAGES.find(l => l.code === currentLang) || AVAILABLE_LANGUAGES[0];
  const affirmationText = affirmation[currentLang] || affirmation.en || affirmation.id;
  const insights = generateInsights(weeklyMoods);

  const [spiritualEnabled] = useLocalStorage('rima-spiritual-enabled', false);
  const [spiritualSource] = useLocalStorage<string>('rima-spiritual-source', 'universal');

  const spiritualItems = spiritualEnabled 
    ? SPIRITUAL_CONTENT.filter(s => spiritualSource === 'universal' ? true : s.source === spiritualSource || s.source === 'universal')
    : [];

  const showSpiritual = spiritualEnabled && spiritualItems.length > 0 && new Date().getDate() % 2 === 0;
  const spiritualItem = spiritualItems[new Date().getDay() % (spiritualItems.length || 1)];

  // Read the latest journal content for escalation detection
  const [journals] = useLocalStorage<{ content?: string }[]>('rima-journals', []);
  const latestJournalContent = journals.length > 0 ? journals[0]?.content : undefined;

  return (
    <div className="home-page">
      <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h1 className="home-greeting">{getGreeting(currentLang)}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="home-lang-btn"
            onClick={() => setShowLangModal(true)}
            aria-label={t('profile.language', 'Bahasa (Language)')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.813rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
          >
            <Globe size={15} style={{ color: 'var(--color-primary)' }} />
            <span>{currentLangObj.flag} {currentLangObj.nativeName}</span>
          </button>

          <div className="streak-badge" style={isGrace ? { borderColor: 'var(--color-secondary)', background: 'hsla(165, 45%, 50%, 0.15)' } : undefined}>
            <Flame size={20} style={{ color: isGrace ? 'var(--color-secondary)' : undefined }} />
            <span>{currentStreak} {t('home.daysStreak', 'Hari')}</span>
            {isGrace && (
              <span style={{ fontSize: '0.688rem', color: 'var(--color-secondary)', marginLeft: '4px', fontWeight: 600 }}>
                🌱 {t('streak.recovery', 'Pemulihan')}
              </span>
            )}
          </div>
        </div>
      </header>

      {showLangModal && (
        <Modal
          isOpen={showLangModal}
          onClose={() => setShowLangModal(false)}
          title={t('profile.language', 'Bahasa (Language)')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '8px' }}>
            {AVAILABLE_LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`btn btn-sm ${currentLang === item.code ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 8px',
                  fontSize: '0.85rem',
                  border: currentLang === item.code ? 'none' : '1px solid var(--border-subtle)'
                }}
                onClick={() => {
                  i18n.changeLanguage(item.code);
                  setShowLangModal(false);
                }}
              >
                <span aria-hidden="true">{item.flag}</span>
                <span>{item.nativeName}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

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
            <p className="affirmation-text">"{currentLang === 'id' ? spiritualItem.contentId : spiritualItem.contentEn}"</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
              {spiritualItem.icon} {currentLang === 'id' ? spiritualItem.titleId : spiritualItem.titleEn}
            </p>
          </>
        ) : (
          <p className="affirmation-text">"{affirmationText}"</p>
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
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '10px', textAlign: 'center', fontStyle: 'italic' }}>
            ⚕️ {t('disclaimer.insights', 'Insight ini diolah dari data pribadi untuk refleksi diri, bukan diagnosis klinis profesional.')}
          </p>
        </section>
      )}

      <section className="quick-actions">
        <button className="quick-action-btn journal" onClick={() => navigate('/journal')}>
          <Book className="action-icon" />
          <span>{t('home.writeJournal', 'Tulis Jurnal')}</span>
        </button>
        <button className="quick-action-btn forum" onClick={() => navigate('/forum')}>
          <MessageCircle className="action-icon" />
          <span>{t('home.viewForum', 'Lihat Forum')}</span>
        </button>
        <button className="quick-action-btn safety" onClick={() => navigate('/safety-plan')}>
          <Heart className="action-icon" />
          <span>{t('home.safetyPlan', 'Rencana Keselamatan')}</span>
        </button>
        <button className="quick-action-btn meditate" onClick={() => navigate('/breathe')}>
          <Wind className="action-icon" />
          <span>{t('home.meditate', 'Latihan Napas')}</span>
        </button>
        <button className="quick-action-btn grounding" onClick={() => navigate('/grounding')}>
          <Sparkles className="action-icon" />
          <span>{t('home.grounding', 'Grounding 5-4-3-2-1')}</span>
        </button>
        <button className="quick-action-btn tipp" onClick={() => navigate('/tipp')}>
          <Snowflake className="action-icon" />
          <span>{t('home.tippCrisis', 'TIPP Krisis')}</span>
        </button>
        <button className="quick-action-btn assessment" onClick={() => navigate('/assessment')}>
          <ClipboardCheck className="action-icon" />
          <span>{t('home.assessment', 'Skrining Mandiri')}</span>
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentMoods} margin={{ top: 16, right: 16, left: 16, bottom: 6 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis domain={[0, 5.5]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-elevated)',
                    padding: '8px 12px'
                  }}
                  formatter={(value: unknown) => {
                    const score = Number(value) as MoodScore;
                    const moodInfo = MOOD_EMOJIS[score];
                    const label = moodInfo
                      ? (currentLang === 'en' ? moodInfo.labelEn : moodInfo.labelId)
                      : `${score}`;
                    const emoji = moodInfo?.emoji || '';
                    return [`${emoji} ${label} (${score}/5)`, t('home.todayMood', 'Mood')];
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="var(--color-primary)" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={42} 
                >
                  {recentMoods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
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
