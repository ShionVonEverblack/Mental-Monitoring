import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  QUADRANT_META,
  EMOTION_TAXONOMY,
  getQuadrantFromCoordinates,
  mapCoordinatesToMoodScore,
} from '../../data/emotionTaxonomy';
import type { EmotionQuadrant, MoodScore, MoodEmoji } from '../../types';

export interface MoodMeterCanvasProps {
  initialValence?: number;
  initialArousal?: number;
  initialSelectedEmotions?: string[];
  onChange: (
    valence: number,
    arousal: number,
    quadrant: EmotionQuadrant,
    selectedEmotions: string[],
    computedScore: MoodScore,
    computedEmoji: MoodEmoji
  ) => void;
}

export const MoodMeterCanvas: React.FC<MoodMeterCanvasProps> = ({
  initialValence = 0,
  initialArousal = 0,
  initialSelectedEmotions = [],
  onChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [valence, setValence] = useState<number>(initialValence);
  const [arousal, setArousal] = useState<number>(initialArousal);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialSelectedEmotions);

  const currentQuadrant = getQuadrantFromCoordinates(valence, arousal);
  const quadrantInfo = QUADRANT_META[currentQuadrant];

  // Filter emotions for the currently active quadrant
  const availableEmotions = EMOTION_TAXONOMY.filter((e) => e.quadrant === currentQuadrant);

  // Compute position percentage for UI puck (0% to 100%)
  // valence: -1 -> 0%, +1 -> 100%
  const puckLeftPct = ((valence + 1) / 2) * 100;
  // arousal: +1 -> 0% (top), -1 -> 100% (bottom)
  const puckTopPct = ((1 - arousal) / 2) * 100;

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

      const relX = clamp(clientX - rect.left, 0, rect.width);
      const relY = clamp(clientY - rect.top, 0, rect.height);

      // X axis: 0 -> -1.0, width -> +1.0
      const newValence = Number(((relX / rect.width) * 2 - 1).toFixed(2));
      // Y axis: 0 -> +1.0 (top), height -> -1.0 (bottom)
      const newArousal = Number((1 - (relY / rect.height) * 2).toFixed(2));

      setValence(newValence);
      setArousal(newArousal);

      const quad = getQuadrantFromCoordinates(newValence, newArousal);
      const { score, emoji } = mapCoordinatesToMoodScore(newValence);

      onChange(newValence, newArousal, quad, selectedEmotions, score, emoji);
    },
    [onChange, selectedEmotions]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  const toggleEmotion = (emotionId: string) => {
    const updated = selectedEmotions.includes(emotionId)
      ? selectedEmotions.filter((id) => id !== emotionId)
      : [...selectedEmotions, emotionId];

    setSelectedEmotions(updated);
    const { score, emoji } = mapCoordinatesToMoodScore(valence);
    onChange(valence, arousal, currentQuadrant, updated, score, emoji);
  };

  // Notify parent on initial mount
  useEffect(() => {
    const { score, emoji } = mapCoordinatesToMoodScore(initialValence);
    onChange(initialValence, initialArousal, currentQuadrant, initialSelectedEmotions, score, emoji);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mood-meter-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 2D Quadrant Canvas */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
        {/* Axis Labels */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '4px',
          }}
        >
          ▲ {t('moodMeter.axis_high_energy', 'Tinggi Energi (Arousal +)')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              textAlign: 'center',
            }}
          >
            ◄ {t('moodMeter.axis_unpleasant', 'Tidak Enak (-)')}
          </span>

          <div
            ref={containerRef}
            className="mood-meter-canvas"
            role="slider"
            aria-label={t('moodMeter.canvas_label', 'Kanvas Mood Meter 2D')}
            aria-valuetext={`${t('moodMeter.valence', 'Valensi')}: ${valence}, ${t('moodMeter.arousal', 'Energi')}: ${arousal}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 'var(--radius-lg, 12px)',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'crosshair',
              touchAction: 'none',
              boxShadow: 'inset 0 0 0 1px var(--border-subtle, #cbd5e1)',
              background: `
                radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.35) 0%, rgba(239, 68, 68, 0.05) 70%),
                radial-gradient(circle at 75% 25%, rgba(234, 179, 8, 0.35) 0%, rgba(234, 179, 8, 0.05) 70%),
                radial-gradient(circle at 25% 75%, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.05) 70%),
                radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.05) 70%),
                var(--bg-card, #ffffff)
              `,
            }}
          >
            {/* Horizontal Axis Divider */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--border-subtle, rgba(0, 0, 0, 0.15))',
                pointerEvents: 'none',
              }}
            />

            {/* Vertical Axis Divider */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--border-subtle, rgba(0, 0, 0, 0.15))',
                pointerEvents: 'none',
              }}
            />

            {/* Quadrant Watermark Badges */}
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(239, 68, 68, 0.8)',
                pointerEvents: 'none',
              }}
            >
              🔴 {t('moodMeter.quadrant_red_short', 'Merah')}
            </span>
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(202, 138, 4, 0.9)',
                pointerEvents: 'none',
              }}
            >
              🟡 {t('moodMeter.quadrant_yellow_short', 'Kuning')}
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(37, 99, 235, 0.8)',
                pointerEvents: 'none',
              }}
            >
              🔵 {t('moodMeter.quadrant_blue_short', 'Biru')}
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(16, 185, 129, 0.9)',
                pointerEvents: 'none',
              }}
            >
              🟢 {t('moodMeter.quadrant_green_short', 'Hijau')}
            </span>

            {/* The Interactive Puck (Touch Indicator) */}
            <div
              style={{
                position: 'absolute',
                left: `${puckLeftPct}%`,
                top: `${puckTopPct}%`,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: quadrantInfo.color,
                border: '3px solid #ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                transition: isDragging ? 'none' : 'all 0.15s ease-out',
                zIndex: 10,
              }}
            />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              writingMode: 'vertical-rl',
              textAlign: 'center',
            }}
          >
            {t('moodMeter.axis_pleasant', 'Menyenangkan (+)')} ►
          </span>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginTop: '4px',
          }}
        >
          ▼ {t('moodMeter.axis_low_energy', 'Rendah Energi (Arousal -)')}
        </div>
      </div>

      {/* Active Quadrant Summary Card */}
      <div
        className="mood-meter-quadrant-card"
        style={{
          backgroundColor: quadrantInfo.bgRgba,
          border: `1px solid ${quadrantInfo.borderRgba}`,
          borderRadius: 'var(--radius-lg, 10px)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: quadrantInfo.color }}>
            {t(quadrantInfo.nameKey, quadrantInfo.nameFallback)}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
            }}
          >
            X: {valence >= 0 ? `+${valence}` : valence} | Y: {arousal >= 0 ? `+${arousal}` : arousal}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {t(quadrantInfo.descKey, quadrantInfo.descFallback)}
        </p>
      </div>

      {/* Emotion Nuances Picker (Vocabulary Granularity) */}
      <div>
        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}
        >
          🎯 {t('moodMeter.nuance_title', 'Nuansa Emosi Spesifik (Pilih yang Paling Mendekati):')}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableEmotions.map((emotion) => {
            const isSelected = selectedEmotions.includes(emotion.id);
            return (
              <button
                key={emotion.id}
                type="button"
                className={`factor-chip ${isSelected ? 'active' : ''}`}
                style={{
                  border: isSelected ? `2px solid ${quadrantInfo.color}` : undefined,
                  backgroundColor: isSelected ? quadrantInfo.bgRgba : undefined,
                  color: isSelected ? quadrantInfo.color : undefined,
                  fontWeight: isSelected ? 700 : 500,
                }}
                onClick={() => toggleEmotion(emotion.id)}
              >
                {t(emotion.labelKey, emotion.labelFallback)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Somatic Intervention Bridge for High Distress (Red/Blue) */}
      {(currentQuadrant === 'red' || currentQuadrant === 'blue') && (
        <div
          style={{
            background: 'var(--bg-secondary, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '200px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: quadrantInfo.color, textTransform: 'uppercase' }}>
              💡 {t('moodMeter.strategy_label', 'Rekomendasi Regulasi Cepat')}
            </span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t(quadrantInfo.strategyKey, quadrantInfo.strategyFallback)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => navigate(quadrantInfo.suggestedRoute)}
          >
            {currentQuadrant === 'red'
              ? t('moodMeter.btn_breathe', 'Latihan Napas')
              : t('moodMeter.btn_activate', 'Aktivasi Perilaku')}
          </button>
        </div>
      )}
    </div>
  );
};
