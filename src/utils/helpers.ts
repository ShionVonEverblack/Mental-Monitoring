import type { MoodEntry, Language } from '../types';
import { ANONYMOUS_ADJECTIVES, ANONYMOUS_NOUNS } from './constants';

export const getLocaleTag = (lang: Language | string): string => {
  switch (lang) {
    case 'jv': return 'jv-ID';
    case 'su': return 'su-ID';
    case 'ja': return 'ja-JP';
    case 'zh': return 'zh-CN';
    case 'es': return 'es-ES';
    case 'ar': return 'ar-SA';
    case 'en': return 'en-US';
    case 'id':
    default:
      return 'id-ID';
  }
};

export const getGreeting = (language: Language | string): string => {
  const hour = new Date().getHours();
  switch (language) {
    case 'jv':
      if (hour < 12) return 'Sugeng Enjang';
      if (hour < 15) return 'Sugeng Siang';
      if (hour < 18) return 'Sugeng Sonten';
      return 'Sugeng Dalu';
    case 'su':
      if (hour < 12) return 'Wilujeng Énjing';
      if (hour < 15) return 'Wilujeng Siang';
      if (hour < 18) return 'Wilujeng Sonten';
      return 'Wilujeng Wengi';
    case 'ja':
      if (hour < 12) return 'おはようございます';
      if (hour < 18) return 'こんにちは';
      return 'こんばんは';
    case 'zh':
      if (hour < 12) return '早上好';
      if (hour < 18) return '下午好';
      return '晚上好';
    case 'es':
      if (hour < 12) return 'Buenos días';
      if (hour < 18) return 'Buenas tardes';
      return 'Buenas noches';
    case 'ar':
      if (hour < 12) return 'صباح الخير';
      return 'مساء الخير';
    case 'en':
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    case 'id':
    default:
      if (hour < 12) return 'Selamat Pagi';
      if (hour < 15) return 'Selamat Siang';
      if (hour < 18) return 'Selamat Sore';
      return 'Selamat Malam';
  }
};

export const generateAnonymousName = (): string => {
  const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
  const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
  return `${adj} ${noun}`;
};

export const formatDate = (date: Date | string, language: string = 'id'): string => {
  const d = new Date(date);
  return d.toLocaleDateString(getLocaleTag(language), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (date: Date | string, language: string = 'id'): string => {
  try {
    const rtf = new Intl.RelativeTimeFormat(getLocaleTag(language), { numeric: 'auto' });
    const d = new Date(date);
    const diffInSeconds = (d.getTime() - Date.now()) / 1000;
    
    if (Math.abs(diffInSeconds) < 60) return rtf.format(Math.round(diffInSeconds), 'second');
    if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    return rtf.format(Math.round(diffInSeconds / 86400), 'day');
  } catch {
    return formatDate(date, language);
  }
};

export const getMoodColor = (score: number): string => {
  switch (score) {
    case 1: return 'var(--color-danger)';
    case 2: return 'var(--color-warm)';
    case 3: return 'var(--color-secondary)';
    case 4: return 'var(--color-primary)';
    case 5: return 'var(--color-accent)';
    default: return 'var(--color-secondary)';
  }
};

export const getMoodTrend = (moods: MoodEntry[]): 'improving' | 'declining' | 'stable' => {
  if (moods.length < 2) return 'stable';
  const recent = moods.slice(0, 5); // take last 5
  if (recent.length < 2) return 'stable';
  
  const scores = recent.map(m => m.score);
  const firstHalfAvg = scores.slice(Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 2);
  const secondHalfAvg = scores.slice(0, Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(scores.length / 2);
  
  if (secondHalfAvg > firstHalfAvg + 0.5) return 'improving';
  if (secondHalfAvg < firstHalfAvg - 0.5) return 'declining';
  return 'stable';
};

export interface GraceStreakResult {
  streak: number;
  isGrace: boolean;
}

export const calculateGraceStreak = (moods: MoodEntry[]): GraceStreakResult => {
  if (moods.length === 0) return { streak: 0, isGrace: false };
  
  const sorted = [...moods].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentDate = new Date(sorted[0].createdAt);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  const diffFromToday = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24));
  
  // If last logged > 2 days ago, streak is broken even with 1 grace day
  if (diffFromToday > 2) return { streak: 0, isGrace: false };
  
  const isGrace = diffFromToday === 2; // Missed yesterday, but today can recover!
  let streak = 1;
  let prevDate = mostRecentDate;
  let usedGraceInHistory = false;
  
  for (let i = 1; i < sorted.length; i++) {
    const d = new Date(sorted[i].createdAt);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((prevDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
    
    if (diff === 0) {
      continue; // Same day entry
    } else if (diff === 1) {
      streak++;
      prevDate = d;
    } else if (diff === 2 && !usedGraceInHistory) {
      // 1 recovery gap day forgiven
      streak++;
      usedGraceInHistory = true;
      prevDate = d;
    } else {
      break;
    }
  }
  
  return { streak, isGrace };
};

export const calculateStreak = (moods: MoodEntry[]): number => {
  return calculateGraceStreak(moods).streak;
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
