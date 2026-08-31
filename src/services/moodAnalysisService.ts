import type { MoodEntry } from '../types';

export interface MoodInsight {
  type: 'pattern' | 'factor' | 'trend' | 'recommendation';
  titleKey: string;     
  titleFallback: string; 
  descriptionKey: string;
  descriptionFallback: string;
  icon: string;         
  severity: 'positive' | 'neutral' | 'negative';
}

export interface WeeklySummary {
  averageScore: number;
  bestDay: number | null;   // day of week index (0=Sun, 6=Sat)
  worstDay: number | null;
  topFactors: { factor: string, avgScore: number, count: number }[];
  bottomFactors: { factor: string, avgScore: number, count: number }[];
  trend: 'improving' | 'declining' | 'stable';
  totalEntries: number;
}

export function getFactorCorrelation(moods: MoodEntry[]): { factor: string, avgScore: number, count: number }[] {
  if (!moods || moods.length === 0) return [];
  
  const factorMap = new Map<string, { totalScore: number; count: number }>();

  moods.forEach((entry) => {
    if (entry.factors && Array.isArray(entry.factors)) {
      entry.factors.forEach((factor) => {
        const current = factorMap.get(factor) || { totalScore: 0, count: 0 };
        factorMap.set(factor, {
          totalScore: current.totalScore + entry.score,
          count: current.count + 1,
        });
      });
    }
  });

  const correlations = Array.from(factorMap.entries()).map(([factor, data]) => ({
    factor,
    avgScore: data.totalScore / data.count,
    count: data.count,
  }));

  // Sort by avgScore descending
  correlations.sort((a, b) => b.avgScore - a.avgScore);

  return correlations;
}

export function analyzeWeeklyMoods(moods: MoodEntry[]): WeeklySummary {
  if (!moods || moods.length === 0) {
    return {
      averageScore: 0,
      bestDay: null,
      worstDay: null,
      topFactors: [],
      bottomFactors: [],
      trend: 'stable',
      totalEntries: 0,
    };
  }

  const totalEntries = moods.length;
  const averageScore = moods.reduce((acc, curr) => acc + curr.score, 0) / totalEntries;

  // Best/worst day
  const dayMap = new Map<number, { totalScore: number; count: number }>(); 
  moods.forEach(entry => {
    const day = new Date(entry.createdAt).getDay(); // 0=Sunday, 6=Saturday
    const current = dayMap.get(day) || { totalScore: 0, count: 0 };
    dayMap.set(day, { totalScore: current.totalScore + entry.score, count: current.count + 1 });
  });

  const dayAverages = Array.from(dayMap.entries()).map(([day, data]) => ({
    day,
    avg: data.totalScore / data.count
  })).sort((a, b) => b.avg - a.avg);

  const bestDay = dayAverages.length > 0 ? dayAverages[0].day : null;
  const worstDay = dayAverages.length > 0 ? dayAverages[dayAverages.length - 1].day : null;

  // Factors
  const correlations = getFactorCorrelation(moods);
  const topFactors = correlations.slice(0, 3);
  const bottomFactors = correlations.slice(-3).reverse();

  // Trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (moods.length >= 2) {
    const sortedMoods = [...moods].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const mid = Math.floor(sortedMoods.length / 2);
    const firstHalf = sortedMoods.slice(0, mid);
    const secondHalf = sortedMoods.slice(mid);
    
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((acc, m) => acc + m.score, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((acc, m) => acc + m.score, 0) / secondHalf.length : 0;
    
    if (secondAvg > firstAvg + 0.5) trend = 'improving';
    else if (secondAvg < firstAvg - 0.5) trend = 'declining';
  }

  return {
    averageScore,
    bestDay,
    worstDay,
    topFactors,
    bottomFactors,
    trend,
    totalEntries
  };
}

export function generateInsights(moods: MoodEntry[]): MoodInsight[] {
  const insights: MoodInsight[] = [];
  if (!moods || moods.length === 0) return insights;

  const weeklySummary = analyzeWeeklyMoods(moods);
  const correlations = getFactorCorrelation(moods);

  const positiveFactors = correlations.filter(c => c.avgScore >= 4 && c.count >= 2);
  if (positiveFactors.length > 0) {
    const factor = positiveFactors[0].factor;
    insights.push({
      type: 'recommendation',
      titleKey: 'insights.positiveFactorTitle',
      titleFallback: 'Pola Positif Terdeteksi',
      descriptionKey: `insights.positiveFactorDesc`,
      descriptionFallback: `Aktivitas berkaitan dengan '${factor}' tampaknya meningkatkan mood Anda. Pertahankan!`,
      icon: '✨',
      severity: 'positive'
    });
  }

  const negativeFactors = correlations.filter(c => c.avgScore < 3 && c.count >= 2);
  if (negativeFactors.length > 0) {
    const factor = negativeFactors[0].factor;
    insights.push({
      type: 'factor',
      titleKey: 'insights.negativeFactorTitle',
      titleFallback: 'Pemicu Stress Terdeteksi',
      descriptionKey: 'insights.negativeFactorDesc',
      descriptionFallback: `Faktor '${factor}' sering muncul saat mood Anda rendah. Coba kurangi atau cari bantuan.`,
      icon: '💡',
      severity: 'negative'
    });
  }

  if (weeklySummary.trend === 'declining') {
    insights.push({
      type: 'trend',
      titleKey: 'insights.decliningTrendTitle',
      titleFallback: 'Perhatian: Mood Menurun',
      descriptionKey: 'insights.decliningTrendDesc',
      descriptionFallback: 'Mood Anda terlihat menurun akhir-akhir ini. Jangan ragu untuk mencari dukungan atau istirahat.',
      icon: '📉',
      severity: 'negative'
    });
  } else if (weeklySummary.trend === 'improving') {
    insights.push({
      type: 'trend',
      titleKey: 'insights.improvingTrendTitle',
      titleFallback: 'Perkembangan Bagus!',
      descriptionKey: 'insights.improvingTrendDesc',
      descriptionFallback: 'Grafik mood Anda menunjukkan peningkatan. Terus lakukan kebiasaan baik Anda!',
      icon: '📈',
      severity: 'positive'
    });
  }

  if (weeklySummary.bestDay !== null) {
    const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    insights.push({
      type: 'pattern',
      titleKey: 'insights.bestDayTitle',
      titleFallback: 'Hari Terbaik Anda',
      descriptionKey: 'insights.bestDayDesc',
      descriptionFallback: `Hari ${daysOfWeek[weeklySummary.bestDay]} biasanya menjadi hari terbaik Anda minggu ini.`,
      icon: '📅',
      severity: 'neutral'
    });
  }

  return insights.slice(0, 4);
}
