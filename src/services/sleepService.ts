import type { SleepDiaryEntry, SleepStatistics } from '../types';

const STORAGE_KEY = 'rima-sleep-diary';

/**
 * Converts "HH:mm" time string to minutes from midnight.
 */
export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return (h % 24) * 60 + (m % 60);
}

/**
 * Calculates total minutes in bed between bedTime and wakeTime, handling overnight rollover.
 */
export function calculateTimeInBedMinutes(bedTime: string, wakeTime: string): number {
  const bedMinutes = timeStringToMinutes(bedTime);
  const wakeMinutes = timeStringToMinutes(wakeTime);

  if (wakeMinutes >= bedMinutes) {
    return wakeMinutes - bedMinutes;
  }
  // Midnight rollover (e.g. 23:00 to 07:00)
  return 1440 - bedMinutes + wakeMinutes;
}

/**
 * Calculates standard CBT-I sleep efficiency metrics.
 * Formula: Sleep Efficiency (%) = (Total Sleep Time / Total Time in Bed) * 100
 */
export function calculateSleepMetrics(
  bedTime: string,
  wakeTime: string,
  latencyMinutes: number,
  awakeningsDurationMinutes: number
): {
  timeInBedMinutes: number;
  totalSleepMinutes: number;
  sleepEfficiency: number;
} {
  const timeInBedMinutes = calculateTimeInBedMinutes(bedTime, wakeTime);
  const wakeTimeInBed = Math.max(0, latencyMinutes) + Math.max(0, awakeningsDurationMinutes);
  const totalSleepMinutes = Math.max(0, timeInBedMinutes - wakeTimeInBed);

  const sleepEfficiency =
    timeInBedMinutes > 0 ? Math.min(100, Math.round((totalSleepMinutes / timeInBedMinutes) * 100)) : 0;

  return {
    timeInBedMinutes,
    totalSleepMinutes,
    sleepEfficiency,
  };
}

/**
 * Saves a sleep diary entry to local storage.
 */
export function saveSleepEntry(entry: SleepDiaryEntry): void {
  try {
    const history = getSleepHistory();
    const updated = [entry, ...history.filter(e => e.id !== entry.id)].slice(0, 60);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: STORAGE_KEY } }));
  } catch (err) {
    console.error('Failed to save sleep diary entry locally:', err);
  }
}

/**
 * Retrieves sleep diary records from storage.
 */
export function getSleepHistory(): SleepDiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Deletes a sleep diary entry by ID.
 */
export function deleteSleepEntry(id: string): void {
  try {
    const history = getSleepHistory();
    const updated = history.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key: STORAGE_KEY } }));
  } catch (err) {
    console.error('Failed to delete sleep entry:', err);
  }
}

/**
 * Computes aggregate summary statistics for recent sleep entries.
 */
export function calculateSleepStats(history: SleepDiaryEntry[]): SleepStatistics {
  if (history.length === 0) {
    return {
      totalEntries: 0,
      avgEfficiency: 0,
      avgSleepDurationMinutes: 0,
      avgQuality: 0,
      efficiencyStatus: 'moderate',
    };
  }

  const recent = history.slice(0, 14);
  const totalEntries = history.length;

  const totalEff = recent.reduce((sum, e) => sum + e.sleepEfficiency, 0);
  const avgEfficiency = Math.round(totalEff / recent.length);

  const totalDuration = recent.reduce((sum, e) => sum + e.totalSleepMinutes, 0);
  const avgSleepDurationMinutes = Math.round(totalDuration / recent.length);

  const totalQual = recent.reduce((sum, e) => sum + e.quality, 0);
  const avgQuality = Number((totalQual / recent.length).toFixed(1));

  let efficiencyStatus: SleepStatistics['efficiencyStatus'] = 'moderate';
  if (avgEfficiency >= 85) {
    efficiencyStatus = 'optimal';
  } else if (avgEfficiency < 75) {
    efficiencyStatus = 'needs_improvement';
  }

  return {
    totalEntries,
    avgEfficiency,
    avgSleepDurationMinutes,
    avgQuality,
    efficiencyStatus,
  };
}

export interface SleepHygieneTip {
  id: string;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
}

export const CBT_I_TIPS: SleepHygieneTip[] = [
  {
    id: 'stimulus_control',
    titleKey: 'sleep.tip_stimulus_title',
    titleFallback: 'Aturan Kendali Stimulus 20 Menit',
    descKey: 'sleep.tip_stimulus_desc',
    descFallback: 'Jika Anda belum bisa tidur setelah 20 menit berbaring, bangkitlah dari kasur. Lakukan relaksasi tenang (Cyclic Sighing atau Grounding) di ruangan redup, dan kembali tidur hanya saat mengantuk.',
  },
  {
    id: 'consistent_wake',
    titleKey: 'sleep.tip_wake_title',
    titleFallback: 'Konsistensi Jam Bangun Tidur',
    descKey: 'sleep.tip_wake_desc',
    descFallback: 'Bangun pada jam yang sama setiap hari (termasuk akhir pekan). Ini adalah jangkar terkuat untuk mengatur ritme sirkadian tubuh.',
  },
  {
    id: 'digital_sunset',
    titleKey: 'sleep.tip_screen_title',
    titleFallback: 'Matahari Terbenam Digital (60 Menit)',
    descKey: 'sleep.tip_screen_desc',
    descFallback: 'Hindari layar ponsel dan cahaya biru 60 menit sebelum tidur untuk memicu pelepasan hormon melatonin alami tubuh.',
  },
  {
    id: 'caffeine_cutoff',
    titleKey: 'sleep.tip_caffeine_title',
    titleFallback: 'Batas Kafein 6 Jam Sebelum Tidur',
    descKey: 'sleep.tip_caffeine_desc',
    descFallback: 'Waktu paruh kafein dalam tubuh berkisar 5–7 jam. Hentikan konsumsi kopi, teh pekat, atau minuman energi setelah pukul 14:00.',
  },
];
