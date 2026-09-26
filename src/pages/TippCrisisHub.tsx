import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Snowflake, 
  Flame, 
  Wind, 
  Activity, 
  PhoneCall, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { TIPP_MODULES, PMR_BODY_ZONES, CRISIS_HOTLINES } from '../utils/constants';
import type { TippModuleId } from '../types';

let audioCtx: AudioContext | null = null;

function playAudioTone(freq: number, durationMs: number = 200) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

function triggerHaptic(pattern: number | number[] = 60) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  }
}

export const TippCrisisHub: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [activeModule, setActiveModule] = useState<TippModuleId | null>(null);
  const [preDistress, setPreDistress] = useState<number>(7);
  const [postDistress, setPostDistress] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Exercise selection
  const [selectedExercise, setSelectedExercise] = useState<string>('jumping_jacks');

  // Generic Timer state (Temperature / Exercise)
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // PMR State
  const [pmrZoneIndex, setPmrZoneIndex] = useState<number>(0);
  const [pmrPhase, setPmrPhase] = useState<'tension' | 'release'>('tension');
  const [pmrSecondsLeft, setPmrSecondsLeft] = useState<number>(5);
  const [isPmrRunning, setIsPmrRunning] = useState<boolean>(false);
  const pmrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inline Paced Breathing mini-pacer state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState<number>(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const breathingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pmrTimerRef.current) clearInterval(pmrTimerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, []);

  // Generic Timer effect for Temperature / Exercise
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            triggerHaptic([100, 50, 150]);
            playAudioTone(528, 400);
            return 0;
          }
          if (prev === 11 || prev === 6) {
            triggerHaptic(50);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  // PMR Timer effect
  useEffect(() => {
    if (isPmrRunning) {
      pmrTimerRef.current = setInterval(() => {
        setPmrSecondsLeft(prev => {
          if (prev <= 1) {
            if (pmrPhase === 'tension') {
              // Transition from tension (5s) to release (10s)
              setPmrPhase('release');
              triggerHaptic([60, 40, 120]);
              playAudioTone(396, 300);
              return PMR_BODY_ZONES[pmrZoneIndex].releaseSeconds;
            } else {
              // Release phase ended, move to next zone or complete
              if (pmrZoneIndex < PMR_BODY_ZONES.length - 1) {
                setPmrZoneIndex(curr => curr + 1);
                setPmrPhase('tension');
                triggerHaptic(80);
                playAudioTone(480, 250);
                return PMR_BODY_ZONES[pmrZoneIndex + 1].tensionSeconds;
              } else {
                // Completed all 5 zones!
                setIsPmrRunning(false);
                clearInterval(pmrTimerRef.current!);
                triggerHaptic([100, 60, 200]);
                playAudioTone(528, 500);
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pmrTimerRef.current) clearInterval(pmrTimerRef.current);
    }
    return () => {
      if (pmrTimerRef.current) clearInterval(pmrTimerRef.current);
    };
  }, [isPmrRunning, pmrPhase, pmrZoneIndex]);

  // Paced Breathing Mini-Pacer effect (4-7-8)
  useEffect(() => {
    if (isBreathingRunning) {
      breathingTimerRef.current = setInterval(() => {
        setBreathingSecondsLeft(prev => {
          if (prev <= 1) {
            if (breathingPhase === 'inhale') {
              setBreathingPhase('hold');
              triggerHaptic(50);
              playAudioTone(480, 200);
              return 7;
            } else if (breathingPhase === 'hold') {
              setBreathingPhase('exhale');
              triggerHaptic([40, 40]);
              playAudioTone(396, 300);
              return 8;
            } else {
              setBreathingPhase('inhale');
              triggerHaptic(60);
              playAudioTone(432, 250);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    }
    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [isBreathingRunning, breathingPhase]);

  // Select module handler
  const handleSelectModule = (id: TippModuleId) => {
    triggerHaptic(60);
    setActiveModule(id);
    setIsCompleted(false);

    if (id === 'temperature') {
      setTimerSeconds(30);
      setIsTimerRunning(false);
    } else if (id === 'exercise') {
      setTimerSeconds(60);
      setIsTimerRunning(false);
    } else if (id === 'pmr') {
      setPmrZoneIndex(0);
      setPmrPhase('tension');
      setPmrSecondsLeft(PMR_BODY_ZONES[0].tensionSeconds);
      setIsPmrRunning(false);
    } else if (id === 'breathing') {
      setBreathingPhase('inhale');
      setBreathingSecondsLeft(4);
      setIsBreathingRunning(false);
    }
  };

  const handleFinishModule = useCallback(() => {
    triggerHaptic([60, 60]);
    setIsTimerRunning(false);
    setIsPmrRunning(false);
    setIsBreathingRunning(false);
    setIsCompleted(true);
    // Suggest post distress score
    const estimatedPost = Math.max(1, preDistress - 3);
    setPostDistress(estimatedPost);
  }, [preDistress]);

  const handleResetModule = () => {
    triggerHaptic(50);
    if (activeModule === 'temperature') {
      setTimerSeconds(30);
      setIsTimerRunning(false);
    } else if (activeModule === 'exercise') {
      setTimerSeconds(60);
      setIsTimerRunning(false);
    } else if (activeModule === 'pmr') {
      setPmrZoneIndex(0);
      setPmrPhase('tension');
      setPmrSecondsLeft(PMR_BODY_ZONES[0].tensionSeconds);
      setIsPmrRunning(false);
    } else if (activeModule === 'breathing') {
      setBreathingPhase('inhale');
      setBreathingSecondsLeft(4);
      setIsBreathingRunning(false);
    }
  };

  const handleBackToMenu = () => {
    triggerHaptic(40);
    setIsTimerRunning(false);
    setIsPmrRunning(false);
    setIsBreathingRunning(false);
    setActiveModule(null);
    setIsCompleted(false);
  };

  // SUDS color helper
  const getSudsColor = (val: number) => {
    if (val <= 3) return 'var(--color-secondary)';
    if (val <= 6) return 'var(--color-warm)';
    return 'var(--color-danger)';
  };

  const getSudsLabel = (val: number) => {
    if (val <= 3) return t('tipp.sudsLow', 'Tenang / Terkendali');
    if (val <= 6) return t('tipp.sudsMedium', 'Cemas Sedang / Gelisah');
    if (val <= 8) return t('tipp.sudsHigh', 'Panik / Arousal Sangat Tinggi');
    return t('tipp.sudsExtreme', 'Krisis Akut / Disregulasi');
  };

  // Render Completion Screen
  if (isCompleted) {
    const sudsDelta = preDistress - postDistress;
    return (
      <div className="tipp-page">
        <header className="tipp-header">
          <h1 className="page-title">{t('tipp.completedTitle', 'Latihan TIPP Selesai')}</h1>
          <p className="tipp-subtitle">
            {t('tipp.completedDesc', 'Kamu telah memberi jeda pada sistem saraf simpatetikmu melalui intervensi fisiologis.')}
          </p>
        </header>

        <div className="tipp-completion-card card">
          <div style={{ color: 'var(--color-secondary)', fontSize: '3rem', marginBottom: 'var(--spacing-sm)' }}>
            <CheckCircle size={56} style={{ margin: '0 auto' }} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            {t('tipp.sudsPostQuestion', 'Berapa tingkat distres / keteganganmu sekarang?')}
          </h2>

          <div style={{ maxWidth: '400px', margin: '0 auto var(--spacing-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>SUDS (1 - 10)</span>
              <span className="tipp-suds-value" style={{ color: getSudsColor(postDistress), background: 'var(--bg-secondary)' }}>
                {postDistress} / 10
              </span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={10} 
              value={postDistress} 
              onChange={(e) => setPostDistress(Number(e.target.value))}
              className="tipp-suds-slider"
              aria-label="Skala Distres Pasca Latihan"
            />
            <div style={{ fontSize: '0.813rem', color: getSudsColor(postDistress), fontWeight: 600, marginTop: '4px' }}>
              {getSudsLabel(postDistress)}
            </div>
          </div>

          <div className="tipp-delta-container">
            <div className="tipp-delta-item">
              <div className="tipp-delta-label">{t('tipp.preLabel', 'Sebelum')}</div>
              <div className="tipp-delta-value" style={{ color: getSudsColor(preDistress) }}>{preDistress}</div>
            </div>
            <div className="tipp-delta-arrow">➔</div>
            <div className="tipp-delta-item">
              <div className="tipp-delta-label">{t('tipp.postLabel', 'Sesudah')}</div>
              <div className="tipp-delta-value" style={{ color: getSudsColor(postDistress) }}>{postDistress}</div>
            </div>
          </div>

          {sudsDelta > 0 ? (
            <div className="tipp-delta-badge improved">
              🌱 {t('tipp.sudsImproved', 'Distres turun {{points}} poin! Tubuhmu mulai rileks.', { points: sudsDelta })}
            </div>
          ) : sudsDelta === 0 ? (
            <div className="tipp-delta-badge same">
              😐 {t('tipp.sudsSame', 'Tingkat distres sama. Tidak apa-apa, kamu bisa mencoba teknik TIPP lainnya.')}
            </div>
          ) : (
            <div className="tipp-delta-badge elevated">
              🌊 {t('tipp.sudsWorse', 'Masih terasa tegang. Jangan ragu untuk mencari dukungan atau membuka rencana keselamatan.')}
            </div>
          )}

          {/* High distress fallback action banner */}
          {postDistress >= 7 && (
            <div style={{ 
              background: 'hsla(0, 65%, 55%, 0.1)', 
              border: '1px solid var(--color-danger)', 
              borderRadius: 'var(--radius-md)', 
              padding: 'var(--spacing-md)', 
              margin: 'var(--spacing-lg) 0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontWeight: 700, marginBottom: '6px' }}>
                <ShieldAlert size={20} />
                <span>{t('tipp.highDistressAlert', 'Tingkat distres masih tinggi?')}</span>
              </div>
              <p style={{ fontSize: '0.844rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                {t('tipp.highDistressDesc', 'Kamu tidak harus melewati ini sendirian. Bantuan profesional dan rencana keselamatan siap menopangmu.')}
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                <a 
                  href={`tel:${CRISIS_HOTLINES[0].phone}`} 
                  className="btn btn-sm btn-danger"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <PhoneCall size={14} />
                  <span>{t('safety.callNow', 'Hubungi Sekarang')} ({CRISIS_HOTLINES[0].phone})</span>
                </a>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate('/safety-plan')}
                >
                  {t('home.safetyPlan', 'Rencana Keselamatan')}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-secondary" onClick={handleBackToMenu}>
              <RotateCcw size={16} />
              <span>{t('tipp.tryAnother', 'Coba Modul Lain')}</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/journal')}>
              <span>{t('home.writeJournal', 'Tulis Jurnal')}</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              <span>{t('common.backToHome', 'Kembali ke Beranda')}</span>
            </button>
          </div>
        </div>

        <ClinicalDisclaimer context={t('disclaimer.tipp', 'Protokol DBT TIPP adalah keterampilan toleransi distres untuk stabilisasi krisis dan bukan pengganti perawatan psikiatri atau psikoterapi komprehensif.')} />
      </div>
    );
  }

  // Render Module Selector (Overview)
  if (!activeModule) {
    return (
      <div className="tipp-page">
        <header className="tipp-header">
          <h1 className="page-title">{t('tipp.title', 'Protokol TIPP (Distress Tolerance)')}</h1>
          <p className="tipp-subtitle">
            {t('tipp.subtitle', 'Intervensi somatik berbasis bukti untuk meredakan krisis emosional, serangan panik, dan arousal tinggi dalam hitungan menit.')}
          </p>
        </header>

        {/* SUDS Pre-Rating Box */}
        <div className="tipp-suds-box">
          <div className="tipp-suds-header">
            <span className="tipp-suds-title">{t('tipp.sudsPreQuestion', 'Seberapa tinggi tingkat distres/panikmu saat ini?')}</span>
            <span className="tipp-suds-value" style={{ color: getSudsColor(preDistress), background: 'var(--bg-secondary)' }}>
              {preDistress} / 10
            </span>
          </div>
          <input 
            type="range" 
            min={1} 
            max={10} 
            value={preDistress} 
            onChange={(e) => setPreDistress(Number(e.target.value))}
            className="tipp-suds-slider"
            aria-label="Skala Distres Sebelum Latihan"
          />
          <div className="tipp-suds-labels">
            <span>1 (Tenang)</span>
            <span style={{ color: getSudsColor(preDistress), fontWeight: 600 }}>{getSudsLabel(preDistress)}</span>
            <span>10 (Krisis)</span>
          </div>
        </div>

        {/* 4 TIPP Modules Grid */}
        <div className="tipp-module-grid">
          {TIPP_MODULES.map((module) => {
            let title = '';
            let desc = '';
            let badge = '';
            if (module.id === 'temperature') {
              title = t('tipp.moduleTemperature', 'Suhu Dingin (Temperature)');
              desc = t('tipp.tempShort', 'Memicu Mammalian Dive Reflex untuk menurunkan denyut jantung dalam 30 detik.');
              badge = '30s';
            } else if (module.id === 'exercise') {
              title = t('tipp.moduleExercise', 'Latihan Intensif (Intense Exercise)');
              desc = t('tipp.exerciseShort', 'Keluarkan energi adrenalin dan ketegangan melalui aktivitas fisik 60 detik.');
              badge = '60s';
            } else if (module.id === 'breathing') {
              title = t('tipp.moduleBreathing', 'Napas Berirama (Paced Breathing)');
              desc = t('tipp.breathingShort', 'Perlambat ritme napas dengan ekshalasi panjang untuk mengaktifkan saraf parasimpatetik.');
              badge = '1-3 min';
            } else if (module.id === 'pmr') {
              title = t('tipp.modulePmr', 'Relaksasi Otot Pasangan (PMR)');
              desc = t('tipp.pmrShort', 'Kencangkan dan lepaskan 5 kelompok otot tubuh untuk meredakan ketegangan fisik.');
              badge = '75s';
            }

            return (
              <div 
                key={module.id} 
                className="tipp-module-card" 
                onClick={() => handleSelectModule(module.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectModule(module.id); }}
                aria-label={title}
              >
                <div className="tipp-module-card-top">
                  <div className="tipp-module-icon-wrap" style={{ backgroundColor: 'var(--bg-secondary)', color: module.color }}>
                    {module.icon}
                  </div>
                  <span className="tipp-module-badge">{badge}</span>
                </div>
                <h2 className="tipp-module-title">{title}</h2>
                <p className="tipp-module-desc">{desc}</p>
                <div className="tipp-module-action">
                  <span>{t('common.start', 'Mulai')}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        <ClinicalDisclaimer context={t('disclaimer.tipp', 'Protokol DBT TIPP adalah keterampilan toleransi distres untuk stabilisasi krisis dan bukan pengganti perawatan psikiatri atau psikoterapi komprehensif.')} />
      </div>
    );
  }

  // Render Active Module View
  return (
    <div className="tipp-page tipp-active-module">
      <button className="tipp-back-btn" onClick={handleBackToMenu}>
        <ArrowLeft size={16} />
        <span>{t('tipp.backToOverview', 'Kembali ke Pilihan Modul')}</span>
      </button>

      {/* Module 1: Temperature */}
      {activeModule === 'temperature' && (
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'hsla(215, 65%, 55%, 0.12)', color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>
              <Snowflake size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {t('tipp.tempTitle', 'Suhu Dingin: Mammalian Dive Reflex')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', maxWidth: '540px', margin: '0 auto' }}>
              {t('tipp.tempSubtitle', 'Menempelkan kompres es atau air dingin pada wajah secara instan merangsang saraf vagus untuk menurunkan denyut jantung.')}
            </p>
          </header>

          <div className="tipp-instruction-box">
            <h3>🧊 {t('tipp.tempStepsTitle', 'Langkah Melakukan:')}</h3>
            <ol>
              <li>{t('tipp.tempStep1', 'Siapkan mangkuk air dingin (10-15°C), kain basah dingin, atau es batu yang dibungkus handuk.')}</li>
              <li>{t('tipp.tempStep2', 'Duduk tegak, condongkan tubuh ke depan, dan tempelkan kompres pada area bawah mata dan pipi atas.')}</li>
              <li>{t('tipp.tempStep3', 'Tahan napas secara santai (jangan memaksakan) selama hitungan mundur 30 detik di bawah.')}</li>
            </ol>
          </div>

          <div className="tipp-science-callout">
            💡 <strong>{t('tipp.tempScienceTitle', 'Dasar Ilmiah')}:</strong> {t('tipp.tempScienceDesc', 'Reseptor dingin pada saraf kranial V (Trigeminus) mengirim sinyal parasimpatetik ke nukleus vagus di batang otak, memicu sinus bradycardia (penurunan denyut jantung 10-25 bpm) dalam 15-30 detik.')}
          </div>

          {/* Countdown Timer */}
          <div className="tipp-timer-container">
            <div className={`tipp-timer-circle ${isTimerRunning ? 'active' : ''}`}>
              <span className="tipp-timer-number">{timerSeconds}</span>
              <span className="tipp-timer-label">{t('breathe.seconds', 'Detik')}</span>
            </div>

            <div className="tipp-timer-controls">
              {!isTimerRunning ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => { triggerHaptic(60); setIsTimerRunning(true); }}
                  style={{ minWidth: '120px' }}
                >
                  <Play size={16} />
                  <span>{timerSeconds === 30 ? t('common.start', 'Mulai') : t('common.resume', 'Lanjut')}</span>
                </button>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { triggerHaptic(40); setIsTimerRunning(false); }}
                  style={{ minWidth: '120px' }}
                >
                  <Pause size={16} />
                  <span>{t('common.pause', 'Jeda')}</span>
                </button>
              )}

              <button className="btn btn-ghost" onClick={handleResetModule} title={t('common.reset', 'Reset')}>
                <RotateCcw size={16} />
                <span>{t('common.reset', 'Reset')}</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-secondary" onClick={handleFinishModule}>
              <CheckCircle size={16} />
              <span>{t('tipp.finishModule', 'Selesai & Evaluasi Distres')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Module 2: Intense Exercise */}
      {activeModule === 'exercise' && (
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'hsla(35, 75%, 60%, 0.15)', color: 'var(--color-warm)', marginBottom: 'var(--spacing-xs)' }}>
              <Flame size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {t('tipp.exerciseTitle', 'Latihan Intensif: 60 Detik')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', maxWidth: '540px', margin: '0 auto' }}>
              {t('tipp.exerciseSubtitle', 'Bakar kelebihan hormon stres (adrenalin & kortisol) melalui aktivitas fisik singkat dan bertenaga.')}
            </p>
          </header>

          <div style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.844rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              {t('tipp.selectExercise', 'Pilih Gerakan Fisik:')}
            </div>
            <div className="tipp-exercise-options">
              {[
                { id: 'jumping_jacks', label: '🏃 Jumping Jacks' },
                { id: 'high_knees', label: '🦵 Angkat Lutut Tinggi' },
                { id: 'wall_pushup', label: '🧱 Wall Push-Ups' },
                { id: 'fast_walk', label: '⚡ Jalan Cepat di Tempat' },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`tipp-exercise-chip ${selectedExercise === opt.id ? 'active' : ''}`}
                  onClick={() => { triggerHaptic(40); setSelectedExercise(opt.id); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tipp-science-callout">
            ⚡ <strong>{t('tipp.exerciseScienceTitle', 'Dasar Fisiologis')}:</strong> {t('tipp.exerciseScienceDesc', 'Saat panik, amigdala memicu respons fight-or-flight dengan membanjiri tubuh dengan energi glukosa. Mengeluarkan energi ini lewat aktivitas fisik singkat memberi sinyal aman pada otak bahwa ancaman sudah teratasi.')}
          </div>

          {/* Countdown Timer */}
          <div className="tipp-timer-container">
            <div className={`tipp-timer-circle ${isTimerRunning ? 'active' : ''}`} style={{ borderColor: 'var(--color-warm)' }}>
              <span className="tipp-timer-number" style={{ color: 'var(--color-warm)' }}>{timerSeconds}</span>
              <span className="tipp-timer-label">{t('breathe.seconds', 'Detik')}</span>
            </div>

            <div className="tipp-timer-controls">
              {!isTimerRunning ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => { triggerHaptic([60, 40]); setIsTimerRunning(true); }}
                  style={{ minWidth: '120px', background: 'var(--color-warm)', borderColor: 'var(--color-warm)' }}
                >
                  <Play size={16} />
                  <span>{timerSeconds === 60 ? t('common.start', 'Mulai') : t('common.resume', 'Lanjut')}</span>
                </button>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { triggerHaptic(40); setIsTimerRunning(false); }}
                  style={{ minWidth: '120px' }}
                >
                  <Pause size={16} />
                  <span>{t('common.pause', 'Jeda')}</span>
                </button>
              )}

              <button className="btn btn-ghost" onClick={handleResetModule} title={t('common.reset', 'Reset')}>
                <RotateCcw size={16} />
                <span>{t('common.reset', 'Reset')}</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-secondary" onClick={handleFinishModule}>
              <CheckCircle size={16} />
              <span>{t('tipp.finishModule', 'Selesai & Evaluasi Distres')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Module 3: Paced Breathing */}
      {activeModule === 'breathing' && (
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'hsla(165, 45%, 50%, 0.15)', color: 'var(--color-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              <Wind size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {t('tipp.breathingTitle', 'Napas Berirama: Ekshalasi Panjang')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', maxWidth: '540px', margin: '0 auto' }}>
              {t('tipp.breathingSubtitle', 'Bernapas lambat dan dalam (5-6 napas/menit) dengan durasi hembusan lebih panjang daripada tarikan.')}
            </p>
          </header>

          <div className="tipp-science-callout">
            🌬️ <strong>{t('tipp.breathingScienceTitle', 'Mekanisme Baroreflex')}:</strong> {t('tipp.breathingScienceDesc', 'Ketika Anda mengembuskan napas panjang secara perlahan, diafragma naik, ruang jantung bertambah, dan baroreseptor menginstruksikan saraf vagus memperlambat detak jantung (Respiratory Sinus Arrhythmia).')}
          </div>

          {/* Mini Pacer 4-7-8 */}
          <div className="tipp-timer-container">
            <div style={{ marginBottom: 'var(--spacing-sm)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
              {breathingPhase === 'inhale' && t('breathe.inhale', 'Tarik Napas')}
              {breathingPhase === 'hold' && t('breathe.hold', 'Tahan Napas')}
              {breathingPhase === 'exhale' && t('breathe.exhale', 'Hembuskan Panjang')}
            </div>

            <div className={`tipp-timer-circle ${isBreathingRunning ? 'active' : ''}`} style={{ borderColor: 'var(--color-secondary)' }}>
              <span className="tipp-timer-number" style={{ color: 'var(--color-secondary)' }}>{breathingSecondsLeft}</span>
              <span className="tipp-timer-label">{breathingPhase}</span>
            </div>

            <div className="tipp-timer-controls">
              {!isBreathingRunning ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => { triggerHaptic(50); setIsBreathingRunning(true); }}
                  style={{ minWidth: '120px' }}
                >
                  <Play size={16} />
                  <span>{t('common.start', 'Mulai Pacer')}</span>
                </button>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { triggerHaptic(40); setIsBreathingRunning(false); }}
                  style={{ minWidth: '120px' }}
                >
                  <Pause size={16} />
                  <span>{t('common.pause', 'Jeda')}</span>
                </button>
              )}

              <button className="btn btn-ghost" onClick={handleResetModule} title={t('common.reset', 'Reset')}>
                <RotateCcw size={16} />
                <span>{t('common.reset', 'Reset')}</span>
              </button>
            </div>
          </div>

          {/* Direct link to Stanford Cyclic Sighing in /breathe */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: 'var(--spacing-md)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: 'var(--spacing-md)',
            flexWrap: 'wrap',
            margin: 'var(--spacing-lg) 0'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                🫁 {t('tipp.breatheFullTitle', 'Buka Modul Latihan Napas Lengkap')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('tipp.breatheFullDesc', 'Tersedia teknik Cyclic Sighing (Stanford RCT) dengan audio mangkuk Tibet.')}
              </div>
            </div>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={() => navigate('/breathe')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{t('common.open', 'Buka')}</span>
              <ExternalLink size={14} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-secondary" onClick={handleFinishModule}>
              <CheckCircle size={16} />
              <span>{t('tipp.finishModule', 'Selesai & Evaluasi Distres')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Module 4: Paired Muscle Relaxation (PMR) */}
      {activeModule === 'pmr' && (
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'hsla(270, 50%, 65%, 0.15)', color: 'var(--color-accent)', marginBottom: 'var(--spacing-xs)' }}>
              <Activity size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {t('tipp.pmrTitle', 'Relaksasi Otot Pasangan (PMR)')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', maxWidth: '540px', margin: '0 auto' }}>
              {t('tipp.pmrSubtitle', 'Kencangkan satu kelompok otot sekuat tenaga saat menarik napas (5s), lalu lepaskan sepenuhnya saat mengembuskan napas (10s).')}
            </p>
          </header>

          {/* PMR Zone Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            {PMR_BODY_ZONES.map((zone, idx) => (
              <button
                key={zone.id}
                onClick={() => {
                  setPmrZoneIndex(idx);
                  setPmrPhase('tension');
                  setPmrSecondsLeft(zone.tensionSeconds);
                  setIsPmrRunning(false);
                }}
                className={`btn btn-sm ${idx === pmrZoneIndex ? 'btn-primary' : idx < pmrZoneIndex ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                {idx + 1}. {t(zone.nameKey, zone.nameFallback)}
              </button>
            ))}
          </div>

          {/* Active Zone Card */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--spacing-lg)', 
            textAlign: 'center',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <div style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {t('tipp.pmrZoneProgress', 'Zona {{current}} dari {{total}}', { current: pmrZoneIndex + 1, total: PMR_BODY_ZONES.length })}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {t(PMR_BODY_ZONES[pmrZoneIndex].nameKey, PMR_BODY_ZONES[pmrZoneIndex].nameFallback)}
            </h3>
            <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto var(--spacing-md)' }}>
              {t(PMR_BODY_ZONES[pmrZoneIndex].instructionKey, PMR_BODY_ZONES[pmrZoneIndex].instructionFallback)}
            </p>

            <div className="tipp-pmr-phases">
              <span className={`tipp-pmr-phase-pill tension ${pmrPhase === 'tension' ? 'active' : ''}`} style={{ opacity: pmrPhase === 'tension' ? 1 : 0.4 }}>
                ⚡ {t('tipp.pmrTensionPhase', '1. Kencangkan (5s)')}
              </span>
              <span className={`tipp-pmr-phase-pill release ${pmrPhase === 'release' ? 'active' : ''}`} style={{ opacity: pmrPhase === 'release' ? 1 : 0.4 }}>
                🍃 {t('tipp.pmrReleasePhase', '2. Lepaskan (10s)')}
              </span>
            </div>

            {/* PMR Timer */}
            <div className="tipp-timer-container" style={{ margin: 'var(--spacing-md) 0' }}>
              <div className={`tipp-timer-circle ${pmrPhase === 'tension' ? 'tension' : 'release'} ${isPmrRunning ? 'active' : ''}`}>
                <span className="tipp-timer-number" style={{ color: pmrPhase === 'tension' ? 'var(--color-warm)' : 'var(--color-secondary)' }}>
                  {pmrSecondsLeft}
                </span>
                <span className="tipp-timer-label">
                  {pmrPhase === 'tension' ? t('tipp.tense', 'Kencangkan!') : t('tipp.release', 'Lepaskan...')}
                </span>
              </div>

              <div className="tipp-timer-controls">
                {!isPmrRunning ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { triggerHaptic(50); setIsPmrRunning(true); }}
                    style={{ minWidth: '120px' }}
                  >
                    <Play size={16} />
                    <span>{t('common.start', 'Mulai')}</span>
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { triggerHaptic(40); setIsPmrRunning(false); }}
                    style={{ minWidth: '120px' }}
                  >
                    <Pause size={16} />
                    <span>{t('common.pause', 'Jeda')}</span>
                  </button>
                )}

                <button className="btn btn-ghost" onClick={handleResetModule} title={t('common.reset', 'Reset')}>
                  <RotateCcw size={16} />
                  <span>{t('common.reset', 'Reset')}</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-secondary" onClick={handleFinishModule}>
              <CheckCircle size={16} />
              <span>{t('tipp.finishModule', 'Selesai & Evaluasi Distres')}</span>
            </button>
          </div>
        </div>
      )}

      <ClinicalDisclaimer context={t('disclaimer.tipp', 'Protokol DBT TIPP adalah keterampilan toleransi distres untuk stabilisasi krisis dan bukan pengganti perawatan psikiatri atau psikoterapi komprehensif.')} />
    </div>
  );
};
