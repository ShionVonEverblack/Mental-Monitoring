import React from 'react';
import { useTranslation } from 'react-i18next';
import { MOOD_EMOJIS } from '../../utils/constants';

import type { MoodScore, MoodEmoji } from '../../types';

export interface MoodSelectorProps {
  value?: MoodScore;
  onChange: (score: MoodScore, emoji: MoodEmoji) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center w-full max-w-md mx-auto gap-2">
      {(Object.entries(MOOD_EMOJIS) as [string, { emoji: MoodEmoji; labelId: string; labelEn: string; color: string }][]).map(([scoreStr, mood]) => {
        const score = parseInt(scoreStr) as MoodScore;
        const isSelected = value === score;
        return (
          <button
            key={score}
            onClick={() => onChange(score, mood.emoji)}
            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 ${isSelected ? 'scale-110 bg-primary/10' : 'hover:scale-105 hover:bg-muted/50'}`}
          >
            <span className="text-4xl filter drop-shadow-sm">{mood.emoji}</span>
            <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
              {t(`mood.${mood.labelId}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
