import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useMood } from '../hooks/useMood';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getFactorCorrelation } from '../services/moodAnalysisService';
import { MOOD_EMOJIS } from '../utils/constants';

const MOOD_COLORS = ['#e74c3c', '#e67e22', '#95a5a6', '#3498db', '#9b59b6'];

export const Analytics: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { moods, getMoodStats } = useMood();
  const [journals] = useLocalStorage('rima-journals', []);
  
  const stats = useMemo(() => getMoodStats(), [getMoodStats]);
  const totalEntries = stats.totalEntries;
  const averageMood = stats.average;
  const streak = stats.streak;
  const journalCount = journals.length;

  const lang = i18n.language;

  // Mood Distribution
  const moodDistribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moods.forEach(m => {
      if (m.score >= 1 && m.score <= 5) {
        counts[m.score as keyof typeof counts]++;
      }
    });
    return Object.entries(counts).map(([score, count]) => ({
      score: Number(score),
      label: MOOD_EMOJIS[Number(score) as keyof typeof MOOD_EMOJIS] || score,
      count
    })).filter(item => item.count > 0);
  }, [moods]);

  // Mood by Day
  const moodByDay = useMemo(() => {
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysId = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysJv = ['Ahd', 'Sen', 'Sel', 'Reb', 'Kem', 'Jum', 'Sab'];
    const daysLabels = lang === 'en' ? daysEn : lang === 'jv' ? daysJv : daysId;
    
    const dayData = Array.from({ length: 7 }, (_, i) => ({
      day: daysLabels[i],
      total: 0,
      count: 0,
      average: 0
    }));

    moods.forEach(m => {
      const date = new Date(m.createdAt);
      const dayIndex = date.getDay();
      dayData[dayIndex].total += m.score;
      dayData[dayIndex].count++;
    });

    return dayData.map(d => ({
      day: d.day,
      average: d.count > 0 ? Number((d.total / d.count).toFixed(1)) : 0
    }));
  }, [moods, lang]);

  // Factor Impact
  const factorData = useMemo(() => {
    try {
      return getFactorCorrelation(moods);
    } catch (e) {
      return [];
    }
  }, [moods]);

  // Monthly Trend
  const monthlyTrend = useMemo(() => {
    const monthsData: Record<string, { total: number, count: number }> = {};
    
    moods.forEach(m => {
      const date = new Date(m.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = { total: 0, count: 0 };
      }
      monthsData[monthKey].total += m.score;
      monthsData[monthKey].count++;
    });

    return Object.entries(monthsData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        average: Number((data.total / data.count).toFixed(1))
      }));
  }, [moods]);

  return (
    <div className="analytics-page">
      <header>
        <h1>{t('analytics.title', 'Dashboard Analytics')}</h1>
        <p>{t('analytics.subtitle', 'Statistik kesehatan mentalmu')}</p>
        <p className="analytics-privacy">🔒 {t('analytics.privacy', 'Semua data diproses secara lokal di perangkatmu')}</p>
      </header>
      
      {/* Stats Overview Cards */}
      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <span className="analytics-stat-value">{totalEntries}</span>
          <span className="analytics-stat-label">{t('analytics.totalEntries', 'Total Entri')}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="analytics-stat-value">{averageMood.toFixed(1)}</span>
          <span className="analytics-stat-label">{t('analytics.averageMood', 'Rata-rata Mood')}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="analytics-stat-value">{streak}</span>
          <span className="analytics-stat-label">{t('analytics.streak', 'Streak (Hari)')}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="analytics-stat-value">{journalCount}</span>
          <span className="analytics-stat-label">{t('analytics.journals', 'Total Jurnal')}</span>
        </div>
      </div>
      
      {/* Charts */}
      {moods.length > 0 && (
        <>
          <section className="analytics-chart-section">
            <h3>{t('analytics.moodDistribution', 'Distribusi Mood')}</h3>
            <div className="analytics-chart-card" role="img" aria-label={t('analytics.moodDistribution', 'Distribusi Mood')}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={moodDistribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                    {moodDistribution.map((entry, index) => (
                      <Cell key={index} fill={MOOD_COLORS[entry.score - 1] || MOOD_COLORS[0]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
          
          <section className="analytics-chart-section">
            <h3>{t('analytics.moodByDay', 'Mood per Hari')}</h3>
            <div className="analytics-chart-card" role="img" aria-label={t('analytics.moodByDay', 'Mood per Hari')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={moodByDay}>
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="var(--color-primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          
          {factorData && factorData.length > 0 && (
            <section className="analytics-chart-section">
              <h3>{t('analytics.factorImpact', 'Dampak Faktor')}</h3>
              <div className="analytics-chart-card" role="img" aria-label={t('analytics.factorImpact', 'Dampak Faktor')}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={factorData} layout="vertical">
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis type="category" dataKey="factor" width={80} />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="var(--color-secondary)" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
          
          <section className="analytics-chart-section">
            <h3>{t('analytics.monthlyTrend', 'Tren Bulanan')}</h3>
            <div className="analytics-chart-card" role="img" aria-label={t('analytics.monthlyTrend', 'Tren Bulanan')}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="average" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
