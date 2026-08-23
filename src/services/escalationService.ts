import type { MoodEntry } from '../types';
import { detectCrisis } from './crisisDetectionService';

export type EscalationLevel = 0 | 1 | 2 | 3;

export interface EscalationState {
  level: EscalationLevel;
  messageKey: string;
  messageFallback: string;
  suggestedActions: { labelKey: string, labelFallback: string, route: string, icon: string }[];
}

export function calculateEscalation(moods: MoodEntry[], latestJournalContent?: string): EscalationState {
  let level: EscalationLevel = 0;
  
  if (latestJournalContent) {
    const crisisResult = detectCrisis(latestJournalContent);
    if (crisisResult.severity === 'severe' || crisisResult.severity === 'moderate') {
      level = 3;
      return {
        level,
        messageKey: 'escalation.level3Msg',
        messageFallback: 'Kami mendeteksi Anda sedang mengalami masa yang sangat sulit. Bantuan tersedia untuk Anda.',
        suggestedActions: [
          {
            labelKey: 'escalation.actionSOS',
            labelFallback: 'Layanan Darurat',
            route: '/sos',
            icon: '🚨'
          },
          {
            labelKey: 'escalation.actionSupport',
            labelFallback: 'Kontak Darurat',
            route: '/contacts',
            icon: '📞'
          }
        ]
      };
    }
  }

  if (!moods || moods.length === 0) {
    return {
      level: 0,
      messageKey: 'escalation.level0Msg',
      messageFallback: 'Bagaimana perasaan Anda hari ini? Mari mulai mencatat mood Anda.',
      suggestedActions: []
    };
  }

  const sortedMoods = [...moods].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const avgMood = sortedMoods.reduce((acc, m) => acc + m.score, 0) / sortedMoods.length;
  
  let consecutiveLowMoods = 0;
  for (const m of sortedMoods) {
    if (m.score <= 2) {
      consecutiveLowMoods++;
    } else {
      break;
    }
  }

  let decliningTrendFor5Days = false;
  if (sortedMoods.length >= 5) {
    const last5 = sortedMoods.slice(0, 5); 
    if (last5[0].score < last5[last5.length - 1].score && avgMood < 2) {
       decliningTrendFor5Days = true;
    }
  }

  if (avgMood < 2 || decliningTrendFor5Days) {
    level = 2;
    return {
      level,
      messageKey: 'escalation.level2Msg',
      messageFallback: 'Sepertinya akhir-akhir ini terasa berat. Anda tidak sendirian.',
      suggestedActions: [
        {
          labelKey: 'escalation.actionForum',
          labelFallback: 'Forum Dukungan',
          route: '/forum',
          icon: '👥'
        },
        {
          labelKey: 'escalation.actionSafetyPlan',
          labelFallback: 'Rencana Keamanan',
          route: '/safety-plan',
          icon: '🛡️'
        }
      ]
    };
  } else if ((avgMood >= 2 && avgMood < 3) || consecutiveLowMoods >= 3) {
    level = 1;
    return {
      level,
      messageKey: 'escalation.level1Msg',
      messageFallback: 'Hari ini mungkin melelahkan. Mari ambil waktu sejenak untuk bersantai.',
      suggestedActions: [
        {
          labelKey: 'escalation.actionBreathe',
          labelFallback: 'Latihan Pernapasan',
          route: '/breathe',
          icon: '😮‍💨'
        },
        {
          labelKey: 'escalation.actionJournal',
          labelFallback: 'Tulis Jurnal',
          route: '/journal',
          icon: '📓'
        }
      ]
    };
  }

  return {
    level: 0,
    messageKey: 'escalation.level0Msg',
    messageFallback: 'Bagus! Lanjutkan hari-hari positif Anda.',
    suggestedActions: []
  };
}
