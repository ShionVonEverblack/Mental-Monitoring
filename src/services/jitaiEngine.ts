import type {
  JitaiContext,
  JitaiNudge,
  JitaiNudgeType,
  JitaiPersistedState,
} from '../types/jitai';
import type { MoodEntry, SleepDiaryEntry, BaActivity } from '../types';

export const JITAI_QUIET_HOURS_START = 22; // 22:00
export const JITAI_QUIET_HOURS_END = 7;    // 07:00
export const JITAI_COOLDOWN_HOURS = 4;
export const JITAI_COOLDOWN_MS = JITAI_COOLDOWN_HOURS * 60 * 60 * 1000;
export const JITAI_DAILY_CAP = 3;
export const MS_IN_48_HOURS = 48 * 60 * 60 * 1000;

export interface GuardrailEvaluation {
  allowed: boolean;
  reason?: 'dismissed_all' | 'daily_cap_reached' | 'quiet_hours' | 'cooldown_active';
}

/**
 * Checks anti-habituation guardrails to prevent notification fatigue and habituation.
 * Quiet hours (22:00-07:00), 4h cooldown, and 3-nudge daily cap.
 */
export function checkGuardrails(
  currentTime: Date,
  persistedState: JitaiPersistedState
): GuardrailEvaluation {
  if (persistedState.dismissedAllToday) {
    return { allowed: false, reason: 'dismissed_all' };
  }

  if (persistedState.dailyCount >= JITAI_DAILY_CAP) {
    return { allowed: false, reason: 'daily_cap_reached' };
  }

  const hour = currentTime.getHours();
  if (hour >= JITAI_QUIET_HOURS_START || hour < JITAI_QUIET_HOURS_END) {
    return { allowed: false, reason: 'quiet_hours' };
  }

  if (persistedState.lastNudgeTimestamp) {
    const lastTimestamp = new Date(persistedState.lastNudgeTimestamp).getTime();
    if (!isNaN(lastTimestamp)) {
      const elapsed = currentTime.getTime() - lastTimestamp;
      if (elapsed >= 0 && elapsed < JITAI_COOLDOWN_MS) {
        return { allowed: false, reason: 'cooldown_active' };
      }
    }
  }

  return { allowed: true };
}

/**
 * Helper to check whether a specific nudge type has been dismissed today.
 */
export function isTypeDismissed(
  type: JitaiNudgeType,
  persistedState: JitaiPersistedState
): boolean {
  return persistedState.dismissedTypes.includes(type);
}

/**
 * Sorts mood entries descending by createdAt timestamp.
 */
function getSortedMoods(moods: MoodEntry[]): MoodEntry[] {
  return [...moods].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Sorts sleep entries descending by date/createdAt.
 */
function getSortedSleep(sleepHistory: SleepDiaryEntry[]): SleepDiaryEntry[] {
  return [...sleepHistory].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date).getTime();
    const timeB = new Date(b.createdAt || b.date).getTime();
    return timeB - timeA;
  });
}

/**
 * Deterministically evaluates local context against clinical intervention rules.
 * Returns the highest priority eligible micro-intervention, or null if suppressed.
 */
export function evaluateJitai(context: JitaiContext): JitaiNudge | null {
  const { currentTime, moods, sleepHistory, activities, persistedState } = context;

  // 1. Guardrail enforcement
  const guardrailCheck = checkGuardrails(currentTime, persistedState);
  if (!guardrailCheck.allowed) {
    return null;
  }

  const sortedMoods = getSortedMoods(moods);
  const latestMood = sortedMoods[0] as MoodEntry | undefined;

  // Priority 1: Acute Affective Dysregulation (Yale Mood Meter 2D - Red Quadrant)
  // High sympathetic arousal + negative valence -> Parasympathetic Vagal Reset
  if (latestMood && !isTypeDismissed('mood_red_vagal_reset', persistedState)) {
    const isRedQuadrant =
      latestMood.quadrant === 'red' ||
      (typeof latestMood.valence === 'number' &&
        typeof latestMood.arousal === 'number' &&
        latestMood.valence <= -0.4 &&
        latestMood.arousal >= 0.4);

    if (isRedQuadrant) {
      return {
        id: `jitai-red-vagal-${latestMood.id || 'recent'}`,
        type: 'mood_red_vagal_reset',
        category: 'mood',
        urgency: 'high',
        titleKey: 'jitai.red_vagal_title',
        titleFallback: 'Atur Ritme Saraf Otonom',
        messageKey: 'jitai.red_vagal_desc',
        messageFallback:
          'Aktivasi sistem sarafmu sedang tinggi. Tarik napas ganda lewat hidung dan embuskan panjang (Cyclic Sighing) untuk menurunkan detak jantung.',
        actionLabelKey: 'jitai.action_breathe',
        actionLabelFallback: 'Mulai Pernapasan (60d)',
        targetRoute: '/breathe',
        iconName: 'Wind',
        evidenceBadgeKey: 'jitai.badge_vagal',
        evidenceBadgeFallback: 'Stanford Cyclic Sighing',
      };
    }
  }

  // Priority 2: Steep Negative Slope Recovery / Mood Drop
  // Trajectory indicates sudden distress or consecutive depressive states
  if (
    latestMood &&
    sortedMoods.length >= 2 &&
    !isTypeDismissed('mood_drop_recovery', persistedState)
  ) {
    const latestTime = new Date(latestMood.createdAt).getTime();

    // Check for drop of >= 2 points within 48h
    const hasSteepDrop = sortedMoods.slice(1).some((prevMood) => {
      const prevTime = new Date(prevMood.createdAt).getTime();
      const within48h = !isNaN(prevTime) && latestTime - prevTime <= MS_IN_48_HOURS && latestTime >= prevTime;
      return within48h && prevMood.score - latestMood.score >= 2;
    });

    // Check for consecutive low scores (both score <= 2 or continuous negative valence <= -0.4)
    const secondLatest = sortedMoods[1];
    const isConsecutiveLow =
      (latestMood.score <= 2 || (latestMood.valence !== undefined && latestMood.valence <= -0.4)) &&
      (secondLatest.score <= 2 || (secondLatest.valence !== undefined && secondLatest.valence <= -0.4));

    if (hasSteepDrop || isConsecutiveLow) {
      return {
        id: `jitai-drop-recovery-${latestMood.id || 'recent'}`,
        type: 'mood_drop_recovery',
        category: 'mood',
        urgency: 'medium',
        titleKey: 'jitai.drop_recovery_title',
        titleFallback: 'Ruang Welas Asih untuk Dirimu',
        messageKey: 'jitai.drop_recovery_desc',
        messageFallback:
          'Ada penurunan suasana hati yang terdeteksi. Luangkan waktu sejenak untuk mengenali perasaanmu dengan kehangatan tanpa menghakimi.',
        actionLabelKey: 'jitai.action_journal',
        actionLabelFallback: 'Buka Jurnal Refleksi',
        targetRoute: '/journal',
        iconName: 'HeartHandshake',
        evidenceBadgeKey: 'jitai.badge_cft',
        evidenceBadgeFallback: 'Compassion-Focused Therapy',
      };
    }
  }

  // Priority 3: Depressive Hypo-Arousal (Yale Mood Meter 2D - Blue Quadrant)
  // Low energy + negative valence -> Micro Behavioral Activation Spark
  if (latestMood && !isTypeDismissed('mood_blue_activation_spark', persistedState)) {
    const isBlueQuadrant =
      latestMood.quadrant === 'blue' ||
      (typeof latestMood.valence === 'number' &&
        typeof latestMood.arousal === 'number' &&
        latestMood.valence <= -0.4 &&
        latestMood.arousal <= -0.4);

    if (isBlueQuadrant) {
      return {
        id: `jitai-blue-spark-${latestMood.id || 'recent'}`,
        type: 'mood_blue_activation_spark',
        category: 'mood',
        urgency: 'medium',
        titleKey: 'jitai.blue_spark_title',
        titleFallback: 'Langkah Kecil Pemulihan Energi',
        messageKey: 'jitai.blue_spark_desc',
        messageFallback:
          'Energi sedang rendah dan terasa berat. Coba satu mikro-aktivitas berdurasi 5 menit untuk membangkitkan dopamin secara perlahan.',
        actionLabelKey: 'jitai.action_activation',
        actionLabelFallback: 'Pilih Mikro Aktivitas',
        targetRoute: '/activation',
        iconName: 'Sparkles',
        evidenceBadgeKey: 'jitai.badge_ba',
        evidenceBadgeFallback: 'Behavioral Activation',
      };
    }
  }

  // Priority 4: CBT-I Sleep Efficiency & Fragmentation Rules
  const sortedSleep = getSortedSleep(sleepHistory);
  const latestSleep = sortedSleep[0] as SleepDiaryEntry | undefined;

  if (latestSleep) {
    // 4a. Sleep Efficiency < 85% -> Stimulus Control
    if (
      latestSleep.sleepEfficiency < 85 &&
      !isTypeDismissed('sleep_efficiency_stimulus_control', persistedState)
    ) {
      return {
        id: `jitai-sleep-stimulus-${latestSleep.id || 'recent'}`,
        type: 'sleep_efficiency_stimulus_control',
        category: 'sleep',
        urgency: 'medium',
        titleKey: 'jitai.sleep_efficiency_title',
        titleFallback: 'Optimalkan Efisiensi Tidur',
        messageKey: 'jitai.sleep_efficiency_desc',
        messageFallback:
          'Efisiensi tidurmu tercatat di bawah 85%. Terapkan prinsip CBT-I: gunakan tempat tidur hanya saat benar-benar mengantuk.',
        actionLabelKey: 'jitai.action_sleep',
        actionLabelFallback: 'Lihat Panduan CBT-I',
        targetRoute: '/sleep',
        iconName: 'MoonStar',
        evidenceBadgeKey: 'jitai.badge_cbti',
        evidenceBadgeFallback: 'CBT-I Stimulus Control',
      };
    }

    // 4b. Sleep Onset Latency (SOL) > 30 minutes -> Circadian Wind-down
    if (
      latestSleep.latencyMinutes > 30 &&
      !isTypeDismissed('sleep_latency_winddown', persistedState)
    ) {
      return {
        id: `jitai-sleep-latency-${latestSleep.id || 'recent'}`,
        type: 'sleep_latency_winddown',
        category: 'sleep',
        urgency: 'low',
        titleKey: 'jitai.sleep_latency_title',
        titleFallback: 'Transisi Rileks Sebelum Tidur',
        messageKey: 'jitai.sleep_latency_desc',
        messageFallback:
          'Waktu tertidurmu membutuhkan lebih dari 30 menit. Coba kurangi paparan layar dan lakukan rutinitas wind-down 20 menit sebelum tidur.',
        actionLabelKey: 'jitai.action_sleep_winddown',
        actionLabelFallback: 'Tips Wind-Down Tidur',
        targetRoute: '/sleep',
        iconName: 'Clock',
        evidenceBadgeKey: 'jitai.badge_cbti',
        evidenceBadgeFallback: 'CBT-I Sleep Hygiene',
      };
    }

    // 4c. Wake After Sleep Onset (WASO) > 30 minutes -> 20-min bed reset rule
    if (
      latestSleep.awakeningsDurationMinutes > 30 &&
      !isTypeDismissed('sleep_waso_relaxation', persistedState)
    ) {
      return {
        id: `jitai-sleep-waso-${latestSleep.id || 'recent'}`,
        type: 'sleep_waso_relaxation',
        category: 'sleep',
        urgency: 'low',
        titleKey: 'jitai.sleep_waso_title',
        titleFallback: 'Atasi Terjaga di Tengah Malam',
        messageKey: 'jitai.sleep_waso_desc',
        messageFallback:
          'Durasi terjaga saat malam hari melebihi 30 menit. Jika terbangun lebih dari 20 menit, bangunlah dari ranjang dan lakukan aktivitas menenangkan dengan cahaya redup.',
        actionLabelKey: 'jitai.action_sleep_waso',
        actionLabelFallback: 'Panduan 20 Menit CBT-I',
        targetRoute: '/sleep',
        iconName: 'MoonStar',
        evidenceBadgeKey: 'jitai.badge_cbti',
        evidenceBadgeFallback: 'CBT-I Stimulus Control',
      };
    }
  }

  // Priority 5: Behavioral Inactivity (>48h no BA activity with stagnant mood)
  if (!isTypeDismissed('activity_inactivity_spark', persistedState)) {
    const hasRecentCompletedActivity = activities.some((act) => {
      if (!act.isCompleted) return false;
      const completedTime = act.completedAt
        ? new Date(act.completedAt).getTime()
        : new Date(act.createdAt).getTime();
      return !isNaN(completedTime) && currentTime.getTime() - completedTime < MS_IN_48_HOURS;
    });

    const isStagnantMood =
      latestMood &&
      (latestMood.score <= 3 ||
        (typeof latestMood.valence === 'number' && latestMood.valence <= 0));

    if (!hasRecentCompletedActivity && isStagnantMood) {
      return {
        id: `jitai-inactivity-spark-${currentTime.toISOString().slice(0, 10)}`,
        type: 'activity_inactivity_spark',
        category: 'activity',
        urgency: 'low',
        titleKey: 'jitai.inactivity_spark_title',
        titleFallback: 'Mulai Langkah Kecilmu Hari Ini',
        messageKey: 'jitai.inactivity_spark_desc',
        messageFallback:
          'Sudah lebih dari 48 jam sejak aktivitas bermakna terakhirmu. Luangkan 5 menit untuk satu hal kecil yang memberi kepuasan atau kesenangan.',
        actionLabelKey: 'jitai.action_activation',
        actionLabelFallback: 'Buka Aktivasi Perilaku',
        targetRoute: '/activation',
        iconName: 'Activity',
        evidenceBadgeKey: 'jitai.badge_ba',
        evidenceBadgeFallback: 'Behavioral Activation',
      };
    }
  }

  // Priority 6: Scheduled Activity Reminder for today
  if (!isTypeDismissed('activity_scheduled_reminder', persistedState)) {
    const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
    const scheduledToday = activities.find(
      (act: BaActivity) => act.scheduledDate === todayStr && !act.isCompleted
    );

    if (scheduledToday) {
      return {
        id: `jitai-scheduled-reminder-${scheduledToday.id}`,
        type: 'activity_scheduled_reminder',
        category: 'activity',
        urgency: 'low',
        titleKey: 'jitai.activity_reminder_title',
        titleFallback: 'Pengingat Rencana Aktivitas',
        messageKey: 'jitai.activity_reminder_desc',
        messageFallback: `Kamu memiliki jadwal aktivitas "${scheduledToday.title}". Siap melakukannya sekarang?`,
        actionLabelKey: 'jitai.action_activation',
        actionLabelFallback: 'Buka Jadwal Aktivitas',
        targetRoute: '/activation',
        iconName: 'Activity',
        evidenceBadgeKey: 'jitai.badge_ba',
        evidenceBadgeFallback: 'Behavioral Activation',
      };
    }
  }

  return null;
}
