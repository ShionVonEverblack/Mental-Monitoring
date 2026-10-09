import type { BaActivity, BaCatalogItem, BaDomain, BaStatistics } from '../types';

export const BA_STORAGE_KEY = 'rima-ba-activities';

export const BA_CATALOG: BaCatalogItem[] = [
  // 1. Pleasure (Kesenangan / Minat)
  {
    id: 'music',
    titleKey: 'ba.cat_music',
    titleFallback: 'Mendengarkan musik yang menenangkan',
    domain: 'pleasure',
    iconName: 'Headphones',
    defaultDurationMinutes: 15,
  },
  {
    id: 'tea',
    titleKey: 'ba.cat_tea',
    titleFallback: 'Menikmati minuman hangat perlahan',
    domain: 'pleasure',
    iconName: 'Coffee',
    defaultDurationMinutes: 10,
  },
  {
    id: 'reading',
    titleKey: 'ba.cat_reading',
    titleFallback: 'Membaca buku atau komik favorit',
    domain: 'pleasure',
    iconName: 'BookOpen',
    defaultDurationMinutes: 15,
  },
  {
    id: 'walk',
    titleKey: 'ba.cat_walk',
    titleFallback: 'Jalan santai di udara segar',
    domain: 'pleasure',
    iconName: 'Footprints',
    defaultDurationMinutes: 10,
  },

  // 2. Mastery (Pencapaian / Tanggung Jawab Mikro)
  {
    id: 'bed',
    titleKey: 'ba.cat_bed',
    titleFallback: 'Merapikan tempat tidur',
    domain: 'mastery',
    iconName: 'Bed',
    defaultDurationMinutes: 5,
  },
  {
    id: 'desk',
    titleKey: 'ba.cat_desk',
    titleFallback: 'Membersihkan meja belajar atau kerja',
    domain: 'mastery',
    iconName: 'Sparkles',
    defaultDurationMinutes: 10,
  },
  {
    id: 'task',
    titleKey: 'ba.cat_task',
    titleFallback: 'Selesaikan 1 tugas kecil tertunda (2 menit)',
    domain: 'mastery',
    iconName: 'CheckSquare',
    defaultDurationMinutes: 5,
  },
  {
    id: 'dishes',
    titleKey: 'ba.cat_dishes',
    titleFallback: 'Mencuci piring atau merapikan dapur',
    domain: 'mastery',
    iconName: 'CheckCircle2',
    defaultDurationMinutes: 10,
  },

  // 3. Spiritual & Mindfulness
  {
    id: 'prayer',
    titleKey: 'ba.cat_prayer',
    titleFallback: 'Doa atau ibadah hening 5 menit',
    domain: 'spiritual',
    iconName: 'Heart',
    defaultDurationMinutes: 5,
  },
  {
    id: 'chanting',
    titleKey: 'ba.cat_chanting',
    titleFallback: 'Mendengarkan lantunan rohani / murattal',
    domain: 'spiritual',
    iconName: 'Volume2',
    defaultDurationMinutes: 15,
  },
  {
    id: 'gratitude',
    titleKey: 'ba.cat_gratitude',
    titleFallback: 'Mencatat 3 hal yang disyukuri hari ini',
    domain: 'spiritual',
    iconName: 'PenTool',
    defaultDurationMinutes: 5,
  },
  {
    id: 'breathing',
    titleKey: 'ba.cat_breathing',
    titleFallback: 'Latihan napas sadar di tempat tenang',
    domain: 'spiritual',
    iconName: 'Wind',
    defaultDurationMinutes: 5,
  },

  // 4. Social & Connection
  {
    id: 'text',
    titleKey: 'ba.cat_text',
    titleFallback: 'Kirim sapaan hangat ke teman baik',
    domain: 'social',
    iconName: 'MessageCircle',
    defaultDurationMinutes: 5,
  },
  {
    id: 'call',
    titleKey: 'ba.cat_call',
    titleFallback: 'Telepon atau obrolan santai dengan keluarga',
    domain: 'social',
    iconName: 'PhoneCall',
    defaultDurationMinutes: 15,
  },
  {
    id: 'praise',
    titleKey: 'ba.cat_praise',
    titleFallback: 'Beri kata apresiasi tulus pada seseorang',
    domain: 'social',
    iconName: 'Smile',
    defaultDurationMinutes: 5,
  },
  {
    id: 'help',
    titleKey: 'ba.cat_help',
    titleFallback: 'Bantu satu hal kecil untuk orang di sekitar',
    domain: 'social',
    iconName: 'Users',
    defaultDurationMinutes: 10,
  },
];

export function getBaActivities(): BaActivity[] {
  try {
    const raw = localStorage.getItem(BA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBaActivities(activities: BaActivity[]): void {
  try {
    localStorage.setItem(BA_STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // Quota or storage error
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayActivities(): BaActivity[] {
  const today = getTodayDateString();
  const all = getBaActivities();
  return all.filter(a => a.scheduledDate === today);
}

export function saveBaActivity(
  data: Omit<BaActivity, 'id' | 'createdAt' | 'isCompleted'>
): BaActivity {
  const newActivity: BaActivity = {
    ...data,
    id: 'ba-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  const activities = getBaActivities();
  const updated = [newActivity, ...activities];
  saveBaActivities(updated);
  return newActivity;
}

export function completeBaActivity(
  id: string,
  actualMood: number,
  reflection?: string
): BaActivity | null {
  const activities = getBaActivities();
  const targetIndex = activities.findIndex(a => a.id === id);
  if (targetIndex === -1) return null;

  const target = activities[targetIndex];
  const updated: BaActivity = {
    ...target,
    isCompleted: true,
    actualMood: Math.max(1, Math.min(10, actualMood)),
    completedAt: new Date().toISOString(),
    reflection: reflection?.trim() || undefined,
  };

  activities[targetIndex] = updated;
  saveBaActivities(activities);
  return updated;
}

export function deleteBaActivity(id: string): boolean {
  const activities = getBaActivities();
  const filtered = activities.filter(a => a.id !== id);
  if (filtered.length === activities.length) return false;
  saveBaActivities(filtered);
  return true;
}

export function getBaStatistics(customActivities?: BaActivity[]): BaStatistics {
  const activities = customActivities || getBaActivities();
  const completed = activities.filter(a => a.isCompleted && a.actualMood !== undefined);

  const domainCounts: Record<BaDomain, number> = {
    pleasure: 0,
    mastery: 0,
    spiritual: 0,
    social: 0,
  };

  activities.forEach(a => {
    if (domainCounts[a.domain] !== undefined) {
      domainCounts[a.domain]++;
    }
  });

  const totalScheduled = activities.length;
  const totalCompleted = completed.length;
  const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  if (completed.length === 0) {
    return {
      totalScheduled,
      totalCompleted,
      completionRate,
      averagePredictedMood: 0,
      averageActualMood: 0,
      averageMoodDelta: 0,
      domainCounts,
    };
  }

  const sumPredicted = completed.reduce((acc, curr) => acc + curr.predictedMood, 0);
  const sumActual = completed.reduce((acc, curr) => acc + (curr.actualMood || 0), 0);
  const avgPredicted = Number((sumPredicted / completed.length).toFixed(1));
  const avgActual = Number((sumActual / completed.length).toFixed(1));
  const avgDelta = Number((avgActual - avgPredicted).toFixed(1));

  return {
    totalScheduled,
    totalCompleted,
    completionRate,
    averagePredictedMood: avgPredicted,
    averageActualMood: avgActual,
    averageMoodDelta: avgDelta,
    domainCounts,
  };
}
