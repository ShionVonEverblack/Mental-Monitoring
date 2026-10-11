export type WarningSignCategory = 'behavioral' | 'emotional' | 'cognitive' | 'physical';

export interface WarningSignItem {
  id: string;
  category: WarningSignCategory;
  text: string;
  isCustom?: boolean;
}

export type DeEscalationLevel = 1 | 2 | 3;

export interface DeEscalationStrategyItem {
  id: string;
  level: DeEscalationLevel; // 1: Mandiri Cepat, 2: Jeda Lingkungan, 3: Kontak Pendukung
  title: string;
  description?: string;
  isCustom?: boolean;
}

export interface SupportiveContactItem {
  id: string;
  name: string;
  phone?: string;
  relationship: string;
}

export interface RelapsePreventionPlan {
  id: string;
  warningSigns: WarningSignItem[];
  strategies: DeEscalationStrategyItem[];
  supportContacts: SupportiveContactItem[];
  aveAffirmations: string[];
  selfCompassionNotes: string;
  updatedAt: string;
}
