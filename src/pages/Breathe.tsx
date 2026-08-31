import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { FC } from 'react';

type TechniqueId = '4-7-8' | 'box' | 'calm';

interface Technique {
  id: TechniqueId;
  nameKey: string;
  nameFallback: string;
  descKey: string;
  descFallback: string;
  icon: string;
  phases: {
    phase: 'inhale' | 'hold' | 'exhale' | 'holdOut';
    duration: number; // in seconds
  }[];
}

const TECHNIQUES: Technique[] = [
  {
    id: '4-7-8',
    nameKey: 'breathe.tech.478',
    nameFallback: '4-7-8',
    descKey: 'breathe.desc.478',
    descFallback: '4s In, 7s Hold, 8s Out',
    icon: '🌬️',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 7 },
      { phase: 'exhale', duration: 8 }
    ]
  },
  {
    id: 'box',
    nameKey: 'breathe.tech.box',
    nameFallback: 'Box Breathing',
    descKey: 'breathe.desc.box',
    descFallback: '4-4-4-4 Pattern',
    icon: '🔲',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'holdOut', duration: 4 }
    ]
  },
  {
    id: 'calm',
    nameKey: 'breathe.tech.calm',
    nameFallback: 'Simple Calm',
    descKey: 'breathe.desc.calm',
    descFallback: '4s In, 4s Out',
    icon: '🍃',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'exhale', duration: 4 }
    ]
  }
];

export const Breathe: FC = () => {
  const { t } = useTranslation();
  
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueId>('4-7-8');
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  const activeTech = TECHNIQUES.find(t => t.id === selectedTechnique) || TECHNIQUES[0];
  const currentPhaseDef = activeTech.phases[currentPhaseIndex];
  
  const toggleExercise = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    } else {
      setIsActive(true);
      setCurrentPhaseIndex(0);
      setSecondsRemaining(activeTech.phases[0].duration);
    }
  }, [isActive, activeTech]);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = window.setInterval(() => {
      setTotalSeconds(prev => prev + 1);
      
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextIndex = (currentPhaseIndex + 1) % activeTech.phases.length;
          if (nextIndex === 0) {
            setCyclesCompleted(c => c + 1);
          }
          setCurrentPhaseIndex(nextIndex);
          return activeTech.phases[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isActive, currentPhaseIndex, activeTech]);

  // Reset when technique changes
  useEffect(() => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(0);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
  }, [selectedTechnique]);

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'inhale': return t('breathe.phase.inhale', 'Tarik Napas');
      case 'hold': return t('breathe.phase.hold', 'Tahan');
      case 'exhale': return t('breathe.phase.exhale', 'Buang Napas');
      case 'holdOut': return t('breathe.phase.hold', 'Tahan');
      default: return '';
    }
  };

  const currentPhaseClass = isActive ? currentPhaseDef.phase : 'holdOut';
  const displaySeconds = isActive ? secondsRemaining : activeTech.phases[0].duration;

  return (
    <div className="breathe-page">
      <header>
        <h1>{t('breathe.title', 'Latihan Pernapasan')}</h1>
        <p>{t('breathe.subtitle', 'Tenangkan pikiran dengan teknik pernapasan')}</p>
      </header>
      
      <div className="breathe-techniques">
        {TECHNIQUES.map(tech => (
          <button 
            key={tech.id}
            className={`breathe-technique-card ${selectedTechnique === tech.id ? 'active' : ''}`}
            onClick={() => setSelectedTechnique(tech.id)}
            disabled={isActive}
            aria-pressed={selectedTechnique === tech.id}
          >
            <span className="breathe-tech-icon" aria-hidden="true">{tech.icon}</span>
            <span className="breathe-tech-name">{t(tech.nameKey, tech.nameFallback)}</span>
            <span className="breathe-tech-desc">{t(tech.descKey, tech.descFallback)}</span>
          </button>
        ))}
      </div>
      
      <div className="breathe-circle-container">
        <div className={`breathe-circle ${currentPhaseClass}`}>
          <span className="breathe-phase-text">
            {isActive ? getPhaseLabel(currentPhaseDef.phase) : t('breathe.ready', 'Siap')}
          </span>
          <span className="breathe-timer">{displaySeconds}</span>
        </div>
      </div>
      
      <div className="breathe-controls">
        <button className="btn btn-primary" onClick={toggleExercise}>
          {isActive ? t('breathe.stop', 'Berhenti') : t('breathe.start', 'Mulai')}
        </button>
      </div>
      
      <div className="breathe-stats">
        <span>{t('breathe.cycles', 'Siklus')}: {cyclesCompleted}</span>
        <span>{t('breathe.duration', 'Durasi')}: {formatDuration(totalSeconds)}</span>
      </div>
    </div>
  );
};
