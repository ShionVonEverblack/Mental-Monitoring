import type { MoodEntry, SleepDiaryEntry, BaActivity } from './index';

export type JitaiNudgeType =
  | 'mood_red_vagal_reset'
  | 'mood_blue_activation_spark'
  | 'mood_drop_recovery'
  | 'sleep_efficiency_stimulus_control'
  | 'sleep_latency_winddown'
  | 'sleep_waso_relaxation'
  | 'activity_inactivity_spark'
  | 'activity_scheduled_reminder';

export type JitaiCategory = 'mood' | 'sleep' | 'activity';
export type JitaiUrgency = 'low' | 'medium' | 'high';

export interface JitaiNudge {
  id: string;
  type: JitaiNudgeType;
  category: JitaiCategory;
  urgency: JitaiUrgency;
  titleKey: string;
  titleFallback: string;
  messageKey: string;
  messageFallback: string;
  actionLabelKey: string;
  actionLabelFallback: string;
  targetRoute: string; // e.g. '/breathe', '/activation', '/sleep', '/journal', '/tipp'
  iconName: string; // Lucide icon identifier: 'Wind', 'MoonStar', 'Activity', 'Sparkles', 'HeartHandshake', 'Clock'
  evidenceBadgeKey?: string;
  evidenceBadgeFallback?: string;
}

export interface JitaiPersistedState {
  date: string; // YYYY-MM-DD
  dailyCount: number;
  lastNudgeTimestamp: string | null;
  dismissedTypes: JitaiNudgeType[];
  dismissedAllToday: boolean;
}

export interface JitaiContext {
  currentTime: Date;
  moods: MoodEntry[];
  sleepHistory: SleepDiaryEntry[];
  activities: BaActivity[];
  persistedState: JitaiPersistedState;
}

export interface JitaiHookResult {
  nudge: JitaiNudge | null;
  dismissNudge: () => void;
  acceptNudge: () => void;
  recordImpression: (type: JitaiNudgeType) => void;
  state: JitaiPersistedState;
  refresh: () => void;
}
