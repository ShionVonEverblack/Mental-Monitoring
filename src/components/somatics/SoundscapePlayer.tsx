import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  audioSomatics,
  SOUNDSCAPE_PRESETS,
  type SoundscapePresetId,
} from '../../services/audioSomaticsService';
import { Volume2, VolumeX, Play, Square, Headphones, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SoundscapePlayerProps {
  initialPreset?: SoundscapePresetId;
  compact?: boolean;
}

export const SoundscapePlayer: React.FC<SoundscapePlayerProps> = ({
  initialPreset = 'brown_noise',
  compact = false,
}) => {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<SoundscapePresetId>(initialPreset);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    setIsPlaying(audioSomatics.getIsPlaying());
    setVolume(audioSomatics.getVolume());
  }, []);

  const handleTogglePlay = async () => {
    if (isPlaying) {
      audioSomatics.stop();
      setIsPlaying(false);
    } else {
      await audioSomatics.play(preset);
      setIsPlaying(true);
    }
  };

  const handleChangePreset = async (newPreset: SoundscapePresetId) => {
    setPreset(newPreset);
    if (isPlaying) {
      await audioSomatics.play(newPreset);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSomatics.setVolume(val);
  };

  const activePresetInfo = SOUNDSCAPE_PRESETS.find((p) => p.id === preset) || SOUNDSCAPE_PRESETS[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: compact ? '12px 16px' : '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: isPlaying ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-secondary)',
              color: isPlaying ? 'var(--color-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Headphones size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {t('audio.player_title', 'Generator Audio Somatik Offline')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {isPlaying
                ? t('audio.playing_status', 'Sedang memutar suara prosedural...')
                : t('audio.offline_badge', '100% Disintesis lokal tanpa kuota data')}
            </div>
          </div>
        </div>

        <Button
          variant={isPlaying ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleTogglePlay}
          icon={isPlaying ? <Square size={14} /> : <Play size={14} />}
          aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
        >
          {isPlaying ? t('audio.stop_btn', 'Hentikan') : t('audio.play_btn', 'Putar Suara')}
        </Button>
      </div>

      {/* Preset Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}
      >
        {SOUNDSCAPE_PRESETS.map((p) => {
          const isSelected = preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              data-testid={`preset-${p.id}`}
              aria-label={t(p.nameKey, p.nameFallback)}
              onClick={() => handleChangePreset(p.id)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {p.category === 'binaural' ? '🎧 ' : '🌊 '}
              {p.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Preset Details & Headphone recommendation */}
      {!compact && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '8px' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
            {t(activePresetInfo.nameKey, activePresetInfo.nameFallback)}
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.4 }}>
            {t(activePresetInfo.descKey, activePresetInfo.descFallback)}
          </p>
          {activePresetInfo.category === 'binaural' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              <Sparkles size={12} />
              <span>{t('audio.headphone_note', 'Disarankan menggunakan earphone/headphone untuk efek gelombang binaural optimal.')}</span>
            </div>
          )}
        </div>
      )}

      {/* Volume Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
        <button
          type="button"
          onClick={() => {
            const nextVol = volume === 0 ? 0.5 : 0;
            setVolume(nextVol);
            audioSomatics.setVolume(nextVol);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}
          aria-label="Toggle mute"
        >
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            flex: 1,
            accentColor: 'var(--color-primary)',
            height: '4px',
            cursor: 'pointer',
          }}
          aria-label="Soundscape volume slider"
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', minWidth: '32px', textAlign: 'right' }}>
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};
