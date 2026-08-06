import type { MoodEntry } from '../types';
import { ANONYMOUS_ADJECTIVES, ANONYMOUS_NOUNS } from './constants';

export const getGreeting = (language: 'id' | 'en'): string => {
  const hour = new Date().getHours();
  if (language === 'id') {
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  } else {
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }
};

export const generateAnonymousName = (): string => {
  const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
  const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
  return `${adj} ${noun}`;
};

export const formatDate = (date: Date | string, language: 'id' | 'en'): string => {
  const d = new Date(date);
  return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (date: Date | string, language: 'id' | 'en'): string => {
  const rtf = new Intl.RelativeTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { numeric: 'auto' });
  const d = new Date(date);
  const diffInSeconds = (d.getTime() - Date.now()) / 1000;
  
  if (Math.abs(diffInSeconds) < 60) return rtf.format(Math.round(diffInSeconds), 'second');
  if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  return rtf.format(Math.round(diffInSeconds / 86400), 'day');
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

export const calculateStreak = (moods: MoodEntry[]): number => {
  if (moods.length === 0) return 0;
  
  const sorted = [...moods].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDate = new Date(sorted[0].createdAt);
  currentDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
  if (diffDays > 1) return 0;
  
  streak = 1;
  let prevDate = currentDate;
  
  for (let i = 1; i < sorted.length; i++) {
    const d = new Date(sorted[i].createdAt);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((prevDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
    
    if (diff === 1) {
      streak++;
      prevDate = d;
    } else if (diff === 0) {
      // Same day, continue
      continue;
    } else {
      break;
    }
  }
  
  return streak;
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
