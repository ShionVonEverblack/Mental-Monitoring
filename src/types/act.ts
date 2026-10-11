export type ActDomain = 'relationships' | 'growth' | 'health' | 'work';

export interface ActValueItem {
  id: string;
  domain: ActDomain;
  titleKey: string;
  titleFallback: string;
  importance: number; // 1-10
  actionStatements: string[];
}

export interface ActCommittedAction {
  id: string;
  domain: ActDomain;
  title: string;
  targetDate?: string;
  isCompleted: boolean;
  createdAt: string;
}

export type DefusionExerciseId = 'leaves_on_stream' | 'thought_labeling';

export interface DefusionSession {
  id: string;
  exerciseId: DefusionExerciseId;
  originalThought: string;
  reframedThought?: string;
  completedAt: string;
}

export interface ActState {
  values: Record<ActDomain, {
    importance: number;
    statement: string;
  }>;
  committedActions: ActCommittedAction[];
  defusionSessions: DefusionSession[];
}
