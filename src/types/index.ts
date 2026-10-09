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

export type CognitiveDistortionId =
  | 'catastrophizing'
  | 'all_or_nothing'
  | 'mind_reading'
  | 'overgeneralization'
  | 'emotional_reasoning'
  | 'should_statements'
  | 'personalization'
  | 'mental_filter';

export interface CbtThoughtRecord {
  situation: string;
  initialEmotion: string;
  initialIntensity: number; // 1-10
  automaticThought: string;
  distortions: CognitiveDistortionId[];
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  finalIntensity: number; // 1-10
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  template: JournalTemplate;
  moodId?: string;
  isPrivate: boolean;
  cbtRecord?: CbtThoughtRecord;
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

export type Language = 'id' | 'en' | 'jv' | 'su' | 'ja' | 'zh' | 'es' | 'ar';


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

export type AssessmentType = 'phq9' | 'gad7' | 'who5';

export interface AssessmentResult {
  id: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  percentageScore?: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  answers: Record<number, number>;
  createdAt: string;
}

export type TippModuleId = 'temperature' | 'exercise' | 'breathing' | 'pmr';

export interface TippSessionLog {
  id: string;
  moduleId: TippModuleId;
  preDistress: number; // 1-10
  postDistress: number; // 1-10
  completedAt: string;
}

export type CssrsRiskLevel = 'none' | 'low' | 'moderate' | 'high';

export interface CssrsAnswers {
  q1: boolean; // Wish to be dead
  q2: boolean; // Suicidal thoughts
  q3?: boolean; // Thoughts with methods
  q4?: boolean; // Intent without plan
  q5?: boolean; // Intent with specific plan
  q6: boolean; // Suicidal behavior
  q6Recent?: boolean; // Behavior in past 3 months
}

export interface CssrsEvaluation {
  riskLevel: CssrsRiskLevel;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
  color: string;
  actionRecommendation: 'coping_and_safety_plan' | 'urgent_hotline_support' | 'imminent_emergency_intervention' | 'stable';
}

export interface CssrsResult {
  id: string;
  answers: CssrsAnswers;
  evaluation: CssrsEvaluation;
  source: 'phq9_item9' | 'manual' | 'keyword_crisis';
  createdAt: string;
}

export type BaDomain = 'pleasure' | 'mastery' | 'spiritual' | 'social';

export interface BaActivity {
  id: string;
  title: string;
  titleKey?: string;
  domain: BaDomain;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  predictedMood: number; // 1-10
  actualMood?: number; // 1-10 (post-completion rating)
  isCompleted: boolean;
  completedAt?: string;
  reflection?: string;
  createdAt: string;
}

export interface BaCatalogItem {
  id: string;
  titleKey: string;
  titleFallback: string;
  domain: BaDomain;
  iconName: string;
  defaultDurationMinutes: number;
}

export interface BaStatistics {
  totalScheduled: number;
  totalCompleted: number;
  completionRate: number; // 0-100%
  averagePredictedMood: number;
  averageActualMood: number;
  averageMoodDelta: number; // e.g. +2.3
  domainCounts: Record<BaDomain, number>;
}

export interface SleepDiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:mm
  wakeTime: string; // HH:mm
  latencyMinutes: number; // minutes to fall asleep
  awakeningsCount: number; // number of nighttime awakenings
  awakeningsDurationMinutes: number; // total minutes awake during night
  quality: 1 | 2 | 3 | 4 | 5; // 1: very poor to 5: excellent
  totalSleepMinutes: number;
  timeInBedMinutes: number;
  sleepEfficiency: number; // 0-100%
  factors?: string[]; // e.g. 'caffeine', 'screen', 'stress', 'noise'
  notes?: string;
  createdAt: string;
}

export interface SleepStatistics {
  totalEntries: number;
  avgEfficiency: number; // e.g. 86%
  avgSleepDurationMinutes: number; // e.g. 420 (7h)
  avgQuality: number; // e.g. 3.8
  efficiencyStatus: 'optimal' | 'moderate' | 'needs_improvement';
}



