export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type MoodEmoji = '😢' | '😟' | '😐' | '🙂' | '😊';

export interface MoodEntry {
  id: string;
  score: MoodScore;
  emoji: MoodEmoji;
  note?: string;
  factors: string[];
  createdAt: string;
}

export type JournalTemplate = 'free' | 'cbt' | 'gratitude' | 'reflection';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  template: JournalTemplate;
  moodId?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ForumCategory = 'anxiety' | 'depression' | 'relationships' | 'work' | 'family' | 'self-care' | 'other';

export interface ForumPost {
  id: string;
  authorName: string;
  category: ForumCategory;
  title: string;
  content: string;
  reactions: Record<string, number>;
  commentCount: number;
  isFlagged: boolean;
  createdAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  isSupportive: boolean;
  createdAt: string;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  relationship?: string;
}

export interface SafetyPlan {
  id: string;
  warningSigns: string[];
  copingStrategies: string[];
  peopleToContact: ContactInfo[];
  professionalContacts: ContactInfo[];
  safeEnvironment: string[];
  reasonsToLive: string[];
  updatedAt: string;
}

export interface CrisisResource {
  id: string;
  name: string;
  phone: string;
  descriptionId: string;
  descriptionEn: string;
  isActive: boolean;
}

export type Theme = 'dark' | 'light';

export type Language = 'id' | 'en';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarSeed: string;
  language: Language;
  theme: Theme;
  createdAt: string;
}

export interface AppState {
  user: UserProfile | null;
  moods: MoodEntry[];
  journals: JournalEntry[];
  safetyPlan: SafetyPlan | null;
}
