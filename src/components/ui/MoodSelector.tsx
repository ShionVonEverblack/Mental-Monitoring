import React from 'react';
import { useTranslation } from 'react-i18next';
import { MOOD_EMOJIS } from '../../utils/constants';

import type { MoodScore, MoodEmoji } from '../../types';

export interface MoodSelectorProps {
  value?: MoodScore;
  onChange: (score: MoodScore, emoji: MoodEmoji) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange }) => {
  const { i18n } = useTranslation();

  return (
    <>
      <style>{`
        .mood-selector {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 28rem;
          margin: 0 auto;
          gap: var(--spacing-sm);
        }
        .mood-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          border-radius: var(--radius-xl);
          transition: all var(--transition-normal);
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .mood-option:hover {
          transform: scale(1.05);
          background-color: var(--bg-secondary);
        }
        .mood-option.selected {
          transform: scale(1.1);
          background-color: var(--color-primary-transparent);
        }
        .mood-emoji {
          font-size: 2.25rem;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
        }
        .mood-label {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
        }
        .mood-option.selected .mood-label {
          color: var(--color-primary);
        }
      `}</style>
      <div className="mood-selector">
        {(Object.entries(MOOD_EMOJIS) as [string, { emoji: MoodEmoji; labelId: string; labelEn: string; color: string }][]).map(([scoreStr, mood]) => {
          const score = parseInt(scoreStr) as MoodScore;
          const isSelected = value === score;
          return (
            <button
              key={score}
              onClick={() => onChange(score, mood.emoji)}
              className={`mood-option ${isSelected ? 'selected' : ''}`}
              data-mood={score}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">
                {i18n.language === 'en' ? mood.labelEn : mood.labelId}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
