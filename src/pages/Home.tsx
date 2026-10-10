import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Heart,
  Wind,
  BookOpen,
  Globe,
  Sparkles,
  ClipboardCheck,
  Snowflake,
  Activity,
  Headphones,
  Shield,
  PhoneCall,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodSelector } from '../components/ui/MoodSelector';
import { Modal } from '../components/ui/Modal';
import { useMood } from '../hooks/useMood';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getGreeting, formatDate } from '../utils/helpers';
import { DAILY_AFFIRMATIONS, AVAILABLE_LANGUAGES, MOOD_EMOJIS } from '../utils/constants';
import { SPIRITUAL_CONTENT } from '../data/spiritualContent';
import { EscalationBanner } from '../components/common/EscalationBanner';
import { JitaiNudgeCard } from '../components/common/JitaiNudgeCard';
import { generateInsights } from '../services/moodAnalysisService';
import { SelfCompassionModal } from '../components/cft/SelfCompassionModal';
import { audioSomatics } from '../services/audioSomaticsService';
import type { Language, MoodScore } from '../types';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { moods, getTodayMood, getWeeklyMoods, addMood, getMoodStats } = useMood();
  const [showLangModal, setShowLangModal] = useState(false);
  const [isCftOpen, setIsCftOpen] = useState(false);
  const [isPlayingBrownNoise, setIsPlayingBrownNoise] = useState(false);
  
  const currentLang = (i18n.language?.split('-')[0] || 'id') as Language;
  const todayMood = getTodayMood();
  const weeklyMoods = getWeeklyMoods();

  useEffect(() => {
    setIsPlayingBrownNoise(audioSomatics.getIsPlaying());
  }, []);

  const handleToggleBrownNoise = async () => {
    if (isPlayingBrownNoise) {
      audioSomatics.stop();
      setIsPlayingBrownNoise(false);
    } else {
      await audioSomatics.play('brown_noise');
      setIsPlayingBrownNoise(true);
    }
  };

  // Chronologically sorted (past -> present) and localized mood records for the chart
  const recentMoods = useMemo(() => {
    return [...weeklyMoods]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((m) => {
        const score = m.score as MoodScore;
        const moodInfo = MOOD_EMOJIS[score];
        const moodLabel = moodInfo
          ? t(`mood.scores.${score}`, currentLang === 'en' ? moodInfo.labelEn : moodInfo.labelId)
          : `${score}`;
        return {
          date: formatDate(m.createdAt, currentLang),
          score: m.score,
          label: moodLabel,
          emoji: moodInfo?.emoji || '😐',
          color: moodInfo?.color || 'var(--color-primary)',
        };
      });
  }, [weeklyMoods, currentLang, t]);

  const stats = getMoodStats();
  const currentStreak = stats.streak;
  const isGrace = stats.isGrace;
  
  const affirmationIndex = new Date().getDay() % DAILY_AFFIRMATIONS.length;
  const affirmation = DAILY_AFFIRMATIONS[affirmationIndex];
  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang) || AVAILABLE_LANGUAGES[0];
  const affirmationText = affirmation[currentLang] || affirmation.en || affirmation.id;
  const insights = generateInsights(weeklyMoods);

  const [spiritualEnabled] = useLocalStorage('rima-spiritual-enabled', false);
  const [spiritualSource] = useLocalStorage<string>('rima-spiritual-source', 'universal');

  const spiritualItems = spiritualEnabled 
    ? SPIRITUAL_CONTENT.filter((s) => (spiritualSource === 'universal' ? true : s.source === spiritualSource || s.source === 'universal'))
    : [];

  const showSpiritual = spiritualEnabled && spiritualItems.length > 0 && new Date().getDate() % 2 === 0;
  const spiritualItem = spiritualItems[new Date().getDay() % (spiritualItems.length || 1)];

  // Read the latest journal content for escalation detection
  const [journals] = useLocalStorage<{ content?: string }[]>('rima-journals', []);
  const latestJournalContent = journals.length > 0 ? journals[0]?.content : undefined;

  return (
    <div className="home-page">
      {/* Header Hening */}
      <header className="home-header zen-home-header">
        <h1 className="home-greeting zen-greeting">{getGreeting(currentLang)}</h1>
        <div className="zen-header-actions">
          <button
            type="button"
            className="home-lang-btn zen-lang-btn"
            onClick={() => setShowLangModal(true)}
            aria-label={t('profile.language', 'Bahasa (Language)')}
          >
            <Globe size={15} className="zen-lang-icon" aria-hidden="true" />
            <span>{currentLangObj.flag} {currentLangObj.nativeName}</span>
          </button>

          <div
            className={`streak-badge zen-streak-badge ${isGrace ? 'zen-streak-grace' : ''}`}
            aria-label={`${currentStreak} ${t('home.daysStreak', 'Hari')}${isGrace ? ` (${t('home.streakRecovery', 'Pemulihan')})` : ''}`}
          >
            <Sparkles size={16} className="zen-streak-icon" aria-hidden="true" />
            <span>{currentStreak} {t('home.daysStreak', 'Hari')}</span>
            {isGrace && (
              <span className="zen-streak-recovery">
                🌱 {t('home.streakRecovery', { defaultValue: t('streak.recovery', 'Pemulihan') })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Modal Pemilihan 8 Bahasa */}
      {showLangModal && (
        <Modal
          isOpen={showLangModal}
          onClose={() => setShowLangModal(false)}
          title={t('profile.language', 'Bahasa (Language)')}
        >
          <div className="zen-lang-modal-grid">
            {AVAILABLE_LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`btn btn-sm ${currentLang === item.code ? 'btn-primary' : 'btn-ghost'} zen-lang-modal-btn`}
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

      {/* Fluid Mood Check-In */}
      <section className="mood-section zen-mood-section">
        {!todayMood ? (
          <div className="mood-prompt-card zen-mood-prompt-card">
            <div className="zen-mood-header">
              <div>
                <h2 className="zen-mood-title">{t('home.howAreYou', { defaultValue: 'Bagaimana perasaanmu hari ini?' })}</h2>
                <p className="zen-mood-subtitle">{t('mood.howDoYouFeel', { defaultValue: 'Bagaimana perasaanmu saat ini?' })}</p>
              </div>
              <button
                type="button"
                className="zen-mood-meter-link"
                onClick={() => navigate('/mood')}
                aria-label="Yale Mood Meter 2D"
              >
                <span>Yale Mood Meter 2D</span>
                <ChevronRight size={16} className="zen-rtl-flip" aria-hidden="true" />
              </button>
            </div>
            <MoodSelector onChange={(score, emoji) => addMood({ score, emoji, factors: [], note: '' })} />
          </div>
        ) : (
          <div className="mood-logged-card zen-mood-logged-card">
            <div className="zen-logged-info">
              <div className="logged-emoji zen-logged-badge" aria-hidden="true">{todayMood.emoji}</div>
              <div>
                <h2 className="zen-logged-title">{t('home.moodLogged', { defaultValue: 'Mood hari ini tercatat' })}</h2>
                <p className="zen-logged-subtitle">
                  {MOOD_EMOJIS[todayMood.score as MoodScore]
                    ? t(`mood.scores.${todayMood.score}`, currentLang === 'en' ? MOOD_EMOJIS[todayMood.score as MoodScore].labelEn : MOOD_EMOJIS[todayMood.score as MoodScore].labelId)
                    : `${todayMood.score}/5`}
                </p>
              </div>
            </div>
            <div className="zen-logged-actions">
              <button
                type="button"
                className="zen-mood-update-btn"
                onClick={() => navigate('/mood')}
                aria-label={t('common.edit', 'Perbarui')}
              >
                <span>{t('common.edit', 'Perbarui')} · Mood Meter 2D</span>
                <ChevronRight size={16} className="zen-rtl-flip" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Clinical Escalation Safeguard Banner */}
      <EscalationBanner moods={moods} latestJournalContent={latestJournalContent} />

      {/* Whisper Nudge (JITAI Adaptive Micro-Intervention) */}
      <JitaiNudgeCard />

      {/* Zen Quote / Afirmasi */}
      <div className="affirmation-card zen-affirmation-card">
        <span className="zen-affirmation-label" aria-hidden="true">
          {t('home.zenAffirmation', { defaultValue: 'Renungan & Afirmasi' })}
        </span>
        {showSpiritual && spiritualItem ? (
          <>
            <p className="affirmation-text zen-affirmation-text">“{currentLang === 'id' ? spiritualItem.contentId : spiritualItem.contentEn}”</p>
            <p className="zen-affirmation-meta">
              <span aria-hidden="true">{spiritualItem.icon}</span> {currentLang === 'id' ? spiritualItem.titleId : spiritualItem.titleEn}
            </p>
          </>
        ) : (
          <p className="affirmation-text zen-affirmation-text">“{affirmationText}”</p>
        )}
      </div>

      {/* Weekly Insights */}
      {weeklyMoods.length >= 3 && (
        <section className="insight-section zen-insight-section">
          <h3 className="zen-section-title">{t('insights.weeklyTitle', { defaultValue: 'Insight Mingguan' })}</h3>
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
            ⚕️ {t('disclaimer.insights', { defaultValue: 'Insight ini diolah dari data pribadi untuk refleksi diri, bukan diagnosis klinis profesional.' })}
          </p>
        </section>
      )}

      {/* Pilihan Hening (4 Baris Kartu Minimalis Terstruktur Menggantikan 11 Tombol Kotak) */}
      <section className="zen-feature-matrix" aria-label={t('home.quietChoices', { defaultValue: 'Ruang Pemulihan' })}>
        <div className="zen-matrix-header">
          <h2 className="zen-matrix-title">
            {t('home.editorialTitle', { defaultValue: 'Pilihan Hening' })}
          </h2>
          <p className="zen-matrix-subtitle">
            {t('home.editorialSubtitle', { defaultValue: 'Ruang pemulihan bertahap sesuai ritme batinmu' })}
          </p>
        </div>

        {/* Baris 1: Jurnal & Refleksi */}
        <div className="zen-feature-group">
          <div className="zen-group-header">
            <span className="zen-group-title">{t('home.groupJournalTitle', { defaultValue: 'Jurnal & Refleksi' })}</span>
            <span className="zen-group-desc">{t('home.groupJournalDesc', { defaultValue: 'Ruang mencatat rasa, skrining mandiri, dan literasi emosi' })}</span>
          </div>
          <div className="zen-group-items">
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/journal')}
              aria-label={t('home.actionJournal', { defaultValue: 'Tulis Jurnal' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Book size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionJournal', { defaultValue: 'Tulis Jurnal' })}</span>
            </button>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/assessment')}
              aria-label={t('home.actionAssessment', { defaultValue: 'Skrining Mandiri' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><ClipboardCheck size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionAssessment', { defaultValue: 'Skrining Mandiri' })}</span>
            </button>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/education')}
              aria-label={t('home.actionEducation', { defaultValue: 'Edukasi Jiwa' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><BookOpen size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionEducation', { defaultValue: 'Edukasi Jiwa' })}</span>
            </button>
          </div>
        </div>

        {/* Baris 2: Regulasi Somatik */}
        <div className="zen-feature-group">
          <div className="zen-group-header">
            <span className="zen-group-title">{t('home.groupSomaticTitle', { defaultValue: 'Regulasi Somatik' })}</span>
            <span className="zen-group-desc">{t('home.groupSomaticDesc', { defaultValue: 'Tenangkan detak jantung dan ketegangan sensorik tubuh' })}</span>
          </div>
          <div className="zen-group-items">
            <button
              type="button"
              className={`zen-item-tile ${isPlayingBrownNoise ? 'active' : ''}`}
              onClick={handleToggleBrownNoise}
              aria-label={t('home.actionSoundscape', { defaultValue: 'Audio Relaksasi' })}
              aria-pressed={isPlayingBrownNoise}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Headphones size={20} /></span>
              <span className="zen-item-tile-label">
                {t('home.actionSoundscape', { defaultValue: 'Audio Relaksasi' })}
                {isPlayingBrownNoise && <span className="zen-audio-active-badge"> · ON</span>}
              </span>
            </button>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/breathe')}
              aria-label={t('home.actionBreathe', { defaultValue: 'Latihan Napas' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Wind size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionBreathe', { defaultValue: 'Latihan Napas' })}</span>
            </button>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/grounding')}
              aria-label={t('home.actionGrounding', { defaultValue: 'Grounding 5-4-3-2-1' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Sparkles size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionGrounding', { defaultValue: 'Grounding 5-4-3-2-1' })}</span>
            </button>
          </div>
        </div>

        {/* Baris 3: Welas Asih & Koping */}
        <div className="zen-feature-group">
          <div className="zen-group-header">
            <span className="zen-group-title">{t('home.groupCopingTitle', { defaultValue: 'Welas Asih & Koping' })}</span>
            <span className="zen-group-desc">{t('home.groupCopingDesc', { defaultValue: 'Rangkul kerentanan diri, redakan krisis akut, dan ambil tindakan kecil' })}</span>
          </div>
          <div className="zen-group-items">
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => setIsCftOpen(true)}
              aria-label={t('home.actionCft', { defaultValue: 'Belas Kasih Diri' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Heart size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionCft', { defaultValue: 'Belas Kasih Diri' })}</span>
            </button>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/tipp')}
              aria-label={t('home.actionTipp', { defaultValue: 'TIPP Krisis' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Snowflake size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionTipp', { defaultValue: 'TIPP Krisis' })}</span>
            </button>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/activation')}
              aria-label={t('home.actionActivation', { defaultValue: 'Aktivasi Perilaku (BA)' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Activity size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionActivation', { defaultValue: 'Aktivasi Perilaku (BA)' })}</span>
            </button>
          </div>
        </div>

        {/* Baris 4: Jaring Pengaman & Bantuan */}
        <div className="zen-feature-group">
          <div className="zen-group-header">
            <span className="zen-group-title">{t('home.groupSafetyTitle', { defaultValue: 'Jaring Pengaman & Bantuan' })}</span>
            <span className="zen-group-desc">{t('home.groupSafetyDesc', { defaultValue: 'Rencana keselamatan, saluran darurat cepat, dan rujukan faskes resmi' })}</span>
          </div>
          <div className="zen-group-items">
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/safety-plan')}
              aria-label={t('home.actionSafetyPlan', { defaultValue: 'Rencana Keselamatan' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Shield size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionSafetyPlan', { defaultValue: 'Rencana Keselamatan' })}</span>
            </button>
            <a
              href="tel:119,8"
              className="zen-item-tile zen-hotline-tile"
              aria-label={t('home.actionHotline', { defaultValue: 'Hotline 119 Ext 8' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><PhoneCall size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionHotline', { defaultValue: 'Hotline 119 Ext 8' })}</span>
            </a>
            <button
              type="button"
              className="zen-item-tile"
              onClick={() => navigate('/professional-help')}
              aria-label={t('home.actionReferral', { defaultValue: 'Rujukan Puskesmas & BPJS' })}
            >
              <span className="zen-item-tile-icon" aria-hidden="true"><Building2 size={20} /></span>
              <span className="zen-item-tile-label">{t('home.actionReferral', { defaultValue: 'Rujukan Puskesmas & BPJS' })}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Mood History Chart */}
      <section className="chart-section zen-chart-section">
        <h3 className="zen-section-title">{t('home.recentMoods', { defaultValue: 'Mood 7 Hari Terakhir' })}</h3>
        {recentMoods.length > 0 ? (
          <div className="chart-card zen-chart-card">
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
                    padding: '8px 12px',
                  }}
                  formatter={(value: unknown) => {
                    const score = Number(value) as MoodScore;
                    const moodInfo = MOOD_EMOJIS[score];
                    const label = moodInfo
                      ? t(`mood.scores.${score}`, currentLang === 'en' ? moodInfo.labelEn : moodInfo.labelId)
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
          <div className="chart-empty zen-chart-empty">
            {t('home.noMoodsYet', { defaultValue: 'Belum ada data mood untuk ditampilkan.' })}
          </div>
        )}
      </section>

      {/* Self-Compassion CFT Modal */}
      <SelfCompassionModal isOpen={isCftOpen} onClose={() => setIsCftOpen(false)} />
    </div>
  );
};
