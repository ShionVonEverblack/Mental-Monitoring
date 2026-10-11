import type { MoodEntry } from '../types';
import { calculateGraceStreak } from '../utils/helpers';

export interface MindfulMomentum {
  presenceCountWeekly: number;
  streak: number;
  isGrace: boolean;
  compassionMessageKey: string;
  compassionDefaultText: string;
  isRestCelebrated: boolean;
}

/**
 * Calculates mindful momentum based on self-compassion principles (welas asih).
 * Replaces punitive toxic streak mechanics with gentle celebration of presence.
 * Recognizes that rest and gaps are an essential part of psychological recovery.
 */
export function calculateMindfulMomentum(moods: MoodEntry[]): MindfulMomentum {
  if (!moods || moods.length === 0) {
    return {
      presenceCountWeekly: 0,
      streak: 0,
      isGrace: false,
      compassionMessageKey: 'streak.gentleEncouragement',
      compassionDefaultText: 'Setiap hembusan napas dan jeda berharga bagi jiwamu.',
      isRestCelebrated: true,
    };
  }

  // Filter for valid entries with valid dates
  const validMoods = moods.filter(
    (m) => m && m.createdAt && !isNaN(new Date(m.createdAt).getTime())
  );

  if (validMoods.length === 0) {
    return {
      presenceCountWeekly: 0,
      streak: 0,
      isGrace: false,
      compassionMessageKey: 'streak.gentleEncouragement',
      compassionDefaultText: 'Setiap hembusan napas dan jeda berharga bagi jiwamu.',
      isRestCelebrated: true,
    };
  }

  // Calculate presence in the 7-day calendar window (today + 6 prior calendar days)
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setHours(0, 0, 0, 0);
  windowStart.setDate(windowStart.getDate() - 6);

  // Upper bound allows up to 24 hours future skew for device clock differences
  const windowEnd = new Date(now.getTime() + 86400000);

  const weeklyEntries = validMoods.filter((m) => {
    const d = new Date(m.createdAt);
    return d >= windowStart && d <= windowEnd;
  });

  // Unique calendar days logged in the rolling 7-day window
  const uniqueDaysLogged = new Set(
    weeklyEntries.map((m) => {
      const d = new Date(m.createdAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    })
  ).size;

  const graceData = calculateGraceStreak(validMoods);

  let messageKey = 'streak.compassionPresence';
  let defaultText = 'Hadir penuh welas asih minggu ini';
  let isRestCelebrated = false;

  if (graceData.isGrace) {
    messageKey = 'streak.restIsRecovery';
    defaultText = 'Istirahat juga bagian dari pemulihan';
    isRestCelebrated = true;
  } else if (graceData.streak === 0) {
    messageKey = 'streak.restIsRecovery';
    defaultText = 'Istirahat juga bagian dari pemulihan';
    isRestCelebrated = true;
  } else {
    messageKey = 'streak.compassionPresence';
    defaultText = 'Hadir penuh welas asih minggu ini';
  }

  return {
    presenceCountWeekly: uniqueDaysLogged,
    streak: graceData.streak,
    isGrace: graceData.isGrace,
    compassionMessageKey: messageKey,
    compassionDefaultText: defaultText,
    isRestCelebrated,
  };
}
