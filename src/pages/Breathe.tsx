import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { FC } from 'react';

type TechniqueId = '4-7-8' | 'box' | 'calm' | 'coherent';

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

export interface BreathingSession {
  id: string;
  date: string;
  technique: TechniqueId;
  durationSeconds: number;
  cyclesCompleted: number;
  postFeeling?: 'calmer' | 'same' | 'still_anxious';
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
  },
  {
    // Coherent Breathing — based on Polyvagal Theory research
    // 5.5s in / 5.5s out = ~5.5 breaths/min = optimal HRV resonance frequency
    id: 'coherent',
    nameKey: 'breathe.tech.coherent',
    nameFallback: 'Coherent Breathing',
    descKey: 'breathe.desc.coherent',
    descFallback: '5.5s In, 5.5s Out — HRV Optimal',
    icon: '💚',
    phases: [
      { phase: 'inhale', duration: 6 }, // rounded to 6s for timer
      { phase: 'exhale', duration: 6 }
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
  const [hapticEnabled, setHapticEnabled] = useState(true);
  
  // Post-session reflection state
  const [showReflection, setShowReflection] = useState(false);
  const [sessionJustEnded, setSessionJustEnded] = useState(false);

  // Breathing session history
  const [sessions, setSessions] = useLocalStorage<BreathingSession[]>('rima-breathing-sessions', []);
  
  const timerRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(0);

  const activeTech = TECHNIQUES.find(t => t.id === selectedTechnique) || TECHNIQUES[0];
  const currentPhaseDef = activeTech.phases[currentPhaseIndex];

  // Haptic feedback on phase transitions (Polyvagal Theory — eyes-closed pacing)
  const triggerHaptic = useCallback(() => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(70); // gentle 70ms pulse
    }
  }, [hapticEnabled]);
  
  const stopExercise = useCallback(() => {
    setIsActive(false);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }

    // Show reflection if user completed 3+ cycles
    if (cyclesCompleted >= 3) {
      setSessionJustEnded(true);
      setShowReflection(true);
    }
  }, [cyclesCompleted]);

  const startExercise = useCallback(() => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(activeTech.phases[0].duration);
    setCyclesCompleted(0);
    setTotalSeconds(0);
    setShowReflection(false);
    setSessionJustEnded(false);
    sessionStartRef.current = Date.now();
    triggerHaptic();
  }, [activeTech, triggerHaptic]);

  const toggleExercise = useCallback(() => {
    if (isActive) {
      stopExercise();
    } else {
      startExercise();
    }
  }, [isActive, stopExercise, startExercise]);

  // Save session and close reflection
  const handleReflection = useCallback((feeling: 'calmer' | 'same' | 'still_anxious') => {
    const session: BreathingSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      date: new Date().toISOString(),
      technique: selectedTechnique,
      durationSeconds: totalSeconds,
      cyclesCompleted,
      postFeeling: feeling,
    };
    setSessions(prev => [session, ...prev].slice(0, 100)); // keep last 100 sessions
    setShowReflection(false);
    setSessionJustEnded(false);
  }, [selectedTechnique, totalSeconds, cyclesCompleted, setSessions]);

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
          triggerHaptic(); // Haptic on phase transition
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
  }, [isActive, currentPhaseIndex, activeTech, triggerHaptic]);

  // Reset when technique changes
  useEffect(() => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(0);
    setShowReflection(false);
    setSessionJustEnded(false);
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

  const supportsHaptic = typeof navigator !== 'undefined' && 'vibrate' in navigator;

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
        {/* aria-live for screen readers — Polyvagal pacing for visually impaired users */}
        <div 
          className={`breathe-circle ${currentPhaseClass}`}
          role="timer"
          aria-live="polite"
          aria-label={isActive ? `${getPhaseLabel(currentPhaseDef.phase)} — ${secondsRemaining} ${t('breathe.seconds', 'detik')}` : t('breathe.ready', 'Siap')}
        >
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
        
        {supportsHaptic && (
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setHapticEnabled(!hapticEnabled)}
            style={{ marginLeft: '8px', fontSize: '0.813rem' }}
          >
            {hapticEnabled ? '📳 ' + t('breathe.hapticOn', 'Getar: Aktif') : '📴 ' + t('breathe.hapticOff', 'Getar: Mati')}
          </button>
        )}
      </div>
      
      <div className="breathe-stats">
        <span>{t('breathe.cycles', 'Siklus')}: {cyclesCompleted}</span>
        <span>{t('breathe.duration', 'Durasi')}: {formatDuration(totalSeconds)}</span>
      </div>

      {/* Post-Session Reflection — amplifies therapeutic benefit */}
      {showReflection && sessionJustEnded && (
        <div className="breathe-reflection" role="dialog" aria-label={t('breathe.reflectionTitle', 'Refleksi Pasca-Sesi')}>
          <div className="breathe-reflection-card">
            <p className="breathe-reflection-question">
              {t('breathe.reflectionQuestion', 'Bagaimana perasaanmu sekarang?')}
            </p>
            <div className="breathe-reflection-options">
              <button 
                className="breathe-reflection-btn calmer"
                onClick={() => handleReflection('calmer')}
              >
                😌 {t('breathe.feelCalmer', 'Lebih tenang')}
              </button>
              <button 
                className="breathe-reflection-btn same"
                onClick={() => handleReflection('same')}
              >
                😐 {t('breathe.feelSame', 'Sama saja')}
              </button>
              <button 
                className="breathe-reflection-btn anxious"
                onClick={() => handleReflection('still_anxious')}
              >
                😟 {t('breathe.feelAnxious', 'Masih gelisah')}
              </button>
            </div>
            <p className="breathe-reflection-note">
              {t('breathe.reflectionNote', 'Apapun yang kamu rasakan, itu valid. Kamu sudah melakukan sesuatu yang baik untuk dirimu.')}
            </p>
          </div>
        </div>
      )}

      {/* Session History Summary */}
      {sessions.length > 0 && !isActive && !showReflection && (
        <div className="breathe-history">
          <h3>{t('breathe.recentSessions', 'Sesi Terakhir')}</h3>
          <div className="breathe-history-list">
            {sessions.slice(0, 5).map(s => (
              <div key={s.id} className="breathe-history-item">
                <span className="breathe-history-tech">
                  {TECHNIQUES.find(tech => tech.id === s.technique)?.icon || '🌬️'}{' '}
                  {t(TECHNIQUES.find(tech => tech.id === s.technique)?.nameKey || '', s.technique)}
                </span>
                <span className="breathe-history-meta">
                  {formatDuration(s.durationSeconds)} · {s.cyclesCompleted} {t('breathe.cycles', 'siklus')}
                  {s.postFeeling === 'calmer' && ' · 😌'}
                  {s.postFeeling === 'same' && ' · 😐'}
                  {s.postFeeling === 'still_anxious' && ' · 😟'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
