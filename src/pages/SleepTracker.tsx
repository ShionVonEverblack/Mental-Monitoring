import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MoonStar,
  Plus,
  Trash2,
  Wind,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  BatteryCharging,
  Calendar,
  Compass,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  getSleepHistory,
  saveSleepEntry,
  deleteSleepEntry,
  calculateSleepMetrics,
  calculateSleepStats,
  CBT_I_TIPS,
} from '../services/sleepService';
import type { SleepDiaryEntry } from '../types';
import { formatDate } from '../utils/helpers';

const SLEEP_FACTOR_KEYS = [
  { id: 'caffeine', labelKey: 'sleep.factor_caffeine', fallback: '☕ Kafein' },
  { id: 'screen', labelKey: 'sleep.factor_screen', fallback: '📱 Layar Gadget' },
  { id: 'stress', labelKey: 'sleep.factor_stress', fallback: '💭 Cemas / Beban Pikiran' },
  { id: 'noise', labelKey: 'sleep.factor_noise', fallback: '🔊 Suara Bising' },
  { id: 'temperature', labelKey: 'sleep.factor_temp', fallback: '🌡️ Suhu Panas / Dingin' },
  { id: 'late_meal', labelKey: 'sleep.factor_meal', fallback: '🍲 Makan Terlambat' },
];

export const SleepTracker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'id';
  const navigate = useNavigate();

  const [history, setHistory] = useState<SleepDiaryEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTip, setExpandedTip] = useState<string | null>('stimulus_control');

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [latencyMinutes, setLatencyMinutes] = useState(20);
  const [awakeningsCount, setAwakeningsCount] = useState(0);
  const [awakeningsDurationMinutes, setAwakeningsDurationMinutes] = useState(0);
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setHistory(getSleepHistory());
  }, []);

  const stats = useMemo(() => calculateSleepStats(history), [history]);

  const livePreview = useMemo(() => {
    return calculateSleepMetrics(bedTime, wakeTime, latencyMinutes, awakeningsDurationMinutes);
  }, [bedTime, wakeTime, latencyMinutes, awakeningsDurationMinutes]);

  const handleToggleFactor = (id: string) => {
    setSelectedFactors(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSaveEntry = (e?: React.FormEvent) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    const metrics = calculateSleepMetrics(
      bedTime,
      wakeTime,
      latencyMinutes,
      awakeningsDurationMinutes
    );

    const newEntry: SleepDiaryEntry = {
      id: 'sleep-' + Date.now(),
      date,
      bedTime,
      wakeTime,
      latencyMinutes,
      awakeningsCount,
      awakeningsDurationMinutes,
      quality,
      totalSleepMinutes: metrics.totalSleepMinutes,
      timeInBedMinutes: metrics.timeInBedMinutes,
      sleepEfficiency: metrics.sleepEfficiency,
      factors: selectedFactors,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    saveSleepEntry(newEntry);
    setHistory(getSleepHistory());
    setIsModalOpen(false);
    // Reset fields
    setNotes('');
    setSelectedFactors([]);
  };

  const handleDelete = (id: string) => {
    deleteSleepEntry(id);
    setHistory(getSleepHistory());
  };

  const getEfficiencyBadge = (eff: number) => {
    if (eff >= 85) {
      return (
        <span className="badge badge-secondary" style={{ backgroundColor: 'hsla(150, 40%, 45%, 0.15)', color: 'var(--color-secondary)' }}>
          {eff}% • {t('sleep.effOptimal', 'Optimal (Sehat)')}
        </span>
      );
    }
    if (eff >= 75) {
      return (
        <span className="badge badge-warm" style={{ backgroundColor: 'hsla(38, 75%, 50%, 0.15)', color: 'var(--color-warm)' }}>
          {eff}% • {t('sleep.effModerate', 'Cukup')}
        </span>
      );
    }
    return (
      <span className="badge badge-danger" style={{ backgroundColor: 'hsla(0, 65%, 55%, 0.15)', color: 'var(--color-danger)' }}>
        {eff}% • {t('sleep.effLow', 'Perlu Peningkatan')}
      </span>
    );
  };

  return (
    <div className="sleep-tracker-page" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-lg) var(--spacing-md)' }}>
      {/* Header with Clinical RCT Badge */}
      <header style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'hsla(215, 65%, 55%, 0.1)', color: 'var(--color-primary)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          <Award size={14} />
          <span>{t('sleep.evidenceBadge', 'Bukti Klinis Digital CBT-I (SMD = -0.76 hingga -0.94)')}</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
          {t('sleep.title', 'Buku Harian Tidur & CBT-I')}
        </h1>
        <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          {t('sleep.subtitle', 'Pendekatan terstruktur Cognitive Behavioral Therapy for Insomnia untuk melacak efisiensi tidur, merestrukturisasi ritme tidur, dan mengatasi sulit tidur tanpa obat.')}
        </p>
      </header>

      {/* 20-Minute Stimulus Control Protocol Card */}
      <Card style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)', borderLeft: '4px solid var(--color-warm)', background: 'hsla(38, 80%, 50%, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'hsla(38, 80%, 50%, 0.15)', color: 'var(--color-warm)' }}>
            <MoonStar size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {t('sleep.stimulusRuleTitle', 'Aturan Kendali Stimulus 20 Menit')}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 var(--spacing-md)', lineHeight: 1.5 }}>
              {t('sleep.stimulusRuleDesc', 'Jika Anda berbaring di tempat tidur lebih dari 20 menit namun belum dapat tidur, bangkitlah dari kasur. Pindahlah ke ruangan redup dan lakukan aktivitas menenangkan sistem saraf hingga kantuk datang kembali.')}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/breathe')}
                icon={<Wind size={14} />}
              >
                {t('breathe.tech.sighing', 'Napas Cyclic Sighing')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/grounding')}
                icon={<Compass size={14} />}
              >
                {t('home.grounding', 'Grounding 5-4-3-2-1')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/journal')}
              >
                {t('sleep.thoughtDump', 'Catat Pikiran')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sleep Statistics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <Card style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            {t('sleep.avgEfficiency', 'Rata-rata Efisiensi')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stats.avgEfficiency >= 85 ? 'var(--color-secondary)' : stats.avgEfficiency >= 75 ? 'var(--color-warm)' : 'var(--color-danger)' }}>
            {stats.totalEntries > 0 ? `${stats.avgEfficiency}%` : '-'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('sleep.targetEfficiency', 'Target Klinis: ≥85%')}
          </div>
        </Card>

        <Card style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            {t('sleep.avgDuration', 'Durasi Tidur')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalEntries > 0 ? `${(stats.avgSleepDurationMinutes / 60).toFixed(1)}j` : '-'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('sleep.avgTimeInBed', '{{minutes}} menit', { minutes: stats.avgSleepDurationMinutes })}
          </div>
        </Card>

        <Card style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            {t('sleep.avgQuality', 'Kualitas Tidur')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {stats.totalEntries > 0 ? `⭐ ${stats.avgQuality}` : '-'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('sleep.outOfStars', 'dari 5 bintang')}
          </div>
        </Card>

        <Card style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            {t('sleep.loggedNights', 'Malam Terekam')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalEntries}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('sleep.recordsCount', 'total entri')}
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {t('sleep.diaryRecordsTitle', 'Catatan Buku Harian Tidur')}
        </h2>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={16} />}
        >
          {t('sleep.addEntryBtn', 'Catat Tidur Tadi Malam')}
        </Button>
      </div>

      {/* Entries List */}
      {history.length === 0 ? (
        <Card style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <MoonStar size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--spacing-sm)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {t('sleep.noEntriesTitle', 'Belum Ada Catatan Tidur')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto var(--spacing-md)' }}>
            {t('sleep.noEntriesDesc', 'Mulai mencatat waktu tidur, jeda kantuk, dan efisiensi untuk membangun pemahaman pola tidur Anda.')}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
            {t('sleep.startFirstEntry', 'Mulai Catatan Pertama')}
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
          {history.map(entry => (
            <Card key={entry.id} style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.938rem' }}>
                      {formatDate(entry.date, lang)}
                    </span>
                    {getEfficiencyBadge(entry.sleepEfficiency)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.813rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {entry.bedTime} ➔ {entry.wakeTime} ({(entry.timeInBedMinutes / 60).toFixed(1)}j di kasur)
                    </span>
                    <span>
                      <BatteryCharging size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {(entry.totalSleepMinutes / 60).toFixed(1)}j tidur pulas
                    </span>
                    <span>⭐ {entry.quality} / 5</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => handleDelete(entry.id)}
                  aria-label={t('common.delete', 'Hapus')}
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {entry.factors && entry.factors.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {entry.factors.map(f => {
                    const factorMeta = SLEEP_FACTOR_KEYS.find(k => k.id === f);
                    return (
                      <span key={f} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                        {factorMeta ? t(factorMeta.labelKey, factorMeta.fallback) : f}
                      </span>
                    );
                  })}
                </div>
              )}

              {entry.notes && (
                <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', margin: '8px 0 0', fontStyle: 'italic' }}>
                  "{entry.notes}"
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* CBT-I Psychoeducation Tips Section */}
      <section style={{ marginTop: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
          <span>{t('sleep.tipsHeader', 'Panduan Higienitas Tidur CBT-I')}</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {CBT_I_TIPS.map(tip => {
            const isExpanded = expandedTip === tip.id;
            return (
              <Card key={tip.id} style={{ overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.938rem',
                  }}
                >
                  <span>{t(tip.titleKey, tip.titleFallback)}</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isExpanded && (
                  <div style={{ padding: '0 var(--spacing-md) var(--spacing-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {t(tip.descKey, tip.descFallback)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Add Sleep Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('sleep.modalTitle', 'Catat Buku Harian Tidur')}
      >
        <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('sleep.dateLabel', 'Tanggal Tidur')}
            </label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={{ width: '100%', minHeight: '44px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('sleep.bedTimeLabel', 'Jam Masuk Kasur')}
              </label>
              <input
                type="time"
                className="input"
                value={bedTime}
                onChange={e => setBedTime(e.target.value)}
                required
                style={{ width: '100%', minHeight: '44px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('sleep.wakeTimeLabel', 'Jam Bangun Tidur')}
              </label>
              <input
                type="time"
                className="input"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                required
                style={{ width: '100%', minHeight: '44px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('sleep.latencyLabel', 'Lama Tertidur (menit)')}
              </label>
              <input
                type="number"
                min="0"
                max="300"
                className="input"
                value={latencyMinutes}
                onChange={e => setLatencyMinutes(Number(e.target.value))}
                style={{ width: '100%', minHeight: '44px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('sleep.awakeningsLabel', 'Lama Terbangun (menit)')}
              </label>
              <input
                type="number"
                min="0"
                max="300"
                className="input"
                value={awakeningsDurationMinutes}
                onChange={e => {
                  const val = Number(e.target.value);
                  setAwakeningsDurationMinutes(val);
                  if (val > 0 && awakeningsCount === 0) setAwakeningsCount(1);
                }}
                style={{ width: '100%', minHeight: '44px' }}
              />
            </div>
          </div>

          {/* Quality Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('sleep.qualityLabel', 'Kualitas Tidur (1–5 Bintang)')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(q => (
                <button
                  key={q}
                  type="button"
                  className={`btn ${quality === q ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setQuality(q as 1 | 2 | 3 | 4 | 5)}
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  ⭐ {q}
                </button>
              ))}
            </div>
          </div>

          {/* Factors Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('sleep.factorsLabel', 'Faktor yang Mempengaruhi')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SLEEP_FACTOR_KEYS.map(f => {
                const isSelected = selectedFactors.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`chip ${isSelected ? 'chip-active' : ''}`}
                    onClick={() => handleToggleFactor(f.id)}
                    style={{ minHeight: '40px' }}
                  >
                    {t(f.labelKey, f.fallback)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Calculation */}
          <div style={{ background: 'var(--bg-secondary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                {t('sleep.calculatedEff', 'Kalkulasi Efisiensi Tidur:')}
              </span>
              <strong style={{ fontSize: '1rem', color: livePreview.sleepEfficiency >= 85 ? 'var(--color-secondary)' : 'var(--color-warm)' }}>
                {livePreview.sleepEfficiency}%
              </strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {(livePreview.totalSleepMinutes / 60).toFixed(1)} {t('sleep.hoursAsleep', 'jam tidur')} / {(livePreview.timeInBedMinutes / 60).toFixed(1)} {t('sleep.hoursInBed', 'jam di kasur')}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--spacing-sm)' }}>
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel', 'Batal')}
            </Button>
            <Button variant="primary" type="submit" onClick={handleSaveEntry}>
              {t('common.save', 'Simpan Catatan')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
