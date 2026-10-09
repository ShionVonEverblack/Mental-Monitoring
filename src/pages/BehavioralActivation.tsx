import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  TrendingUp,
  Award,
  BookOpen,
  Coffee,
  Heart,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import {
  BA_CATALOG,
  getBaActivities,
  getTodayDateString,
  saveBaActivity,
  completeBaActivity,
  deleteBaActivity,
  getBaStatistics,
} from '../services/behavioralActivationService';
import type { BaActivity, BaDomain } from '../types';

export const BehavioralActivation: React.FC = () => {
  const { t } = useTranslation();

  const [activities, setActivities] = useState<BaActivity[]>([]);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<BaDomain | 'all'>('all');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<BaActivity | null>(null);
  const [showPsychoeducation, setShowPsychoeducation] = useState(false);

  // Form State for Planning Modal
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [planDomain, setPlanDomain] = useState<BaDomain>('pleasure');
  const [planDate, setPlanDate] = useState(getTodayDateString());
  const [planTime, setPlanTime] = useState('');
  const [predictedMood, setPredictedMood] = useState(6);

  // Form State for Completion Modal
  const [actualMood, setActualMood] = useState(7);
  const [reflectionText, setReflectionText] = useState('');

  const loadActivities = () => {
    setActivities(getBaActivities());
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const stats = useMemo(() => getBaStatistics(activities), [activities]);

  const todayStr = getTodayDateString();

  const filteredActivities = useMemo(() => {
    if (selectedDomainFilter === 'all') return activities;
    return activities.filter(a => a.domain === selectedDomainFilter);
  }, [activities, selectedDomainFilter]);

  const todayActivities = useMemo(() => {
    return filteredActivities.filter(a => a.scheduledDate === todayStr);
  }, [filteredActivities, todayStr]);

  const pastAndUpcoming = useMemo(() => {
    return filteredActivities.filter(a => a.scheduledDate !== todayStr);
  }, [filteredActivities, todayStr]);

  const handleOpenPlanModal = () => {
    setSelectedCatalogId('');
    setCustomTitle('');
    setPlanDomain('pleasure');
    setPlanDate(getTodayDateString());
    setPlanTime('');
    setPredictedMood(6);
    setIsPlanModalOpen(true);
  };

  const handleSelectCatalogItem = (catId: string) => {
    setSelectedCatalogId(catId);
    const item = BA_CATALOG.find(c => c.id === catId);
    if (item) {
      setPlanDomain(item.domain);
    }
  };

  const handleSavePlan = () => {
    let titleToSave = customTitle.trim();
    let titleKey: string | undefined;

    if (selectedCatalogId) {
      const cat = BA_CATALOG.find(c => c.id === selectedCatalogId);
      if (cat) {
        titleToSave = t(cat.titleKey, cat.titleFallback);
        titleKey = cat.titleKey;
      }
    }

    if (!titleToSave) return;

    saveBaActivity({
      title: titleToSave,
      titleKey,
      domain: planDomain,
      scheduledDate: planDate,
      scheduledTime: planTime ? planTime : undefined,
      predictedMood,
    });

    loadActivities();
    setIsPlanModalOpen(false);
  };

  const handleOpenCompleteModal = (act: BaActivity) => {
    setCompleteTarget(act);
    setActualMood(Math.min(10, act.predictedMood + 1));
    setReflectionText('');
  };

  const handleSaveCompletion = () => {
    if (!completeTarget) return;

    completeBaActivity(completeTarget.id, actualMood, reflectionText);
    loadActivities();
    setCompleteTarget(null);
  };

  const handleDelete = (id: string) => {
    deleteBaActivity(id);
    loadActivities();
  };

  const getDomainColor = (domain: BaDomain): string => {
    switch (domain) {
      case 'pleasure':
        return 'var(--color-primary, #3b82f6)';
      case 'mastery':
        return 'var(--color-warning, #f59e0b)';
      case 'spiritual':
        return 'var(--color-secondary, #10b981)';
      case 'social':
        return '#8b5cf6';
    }
  };

  const getDomainLabel = (domain: BaDomain): string => {
    switch (domain) {
      case 'pleasure':
        return t('ba.tabPleasure', 'Kesenangan');
      case 'mastery':
        return t('ba.tabMastery', 'Pencapaian');
      case 'spiritual':
        return t('ba.tabSpiritual', 'Spiritual');
      case 'social':
        return t('ba.tabSocial', 'Sosial');
    }
  };

  return (
    <div className="activation-page" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: 'var(--spacing-2xl)' }}>
      {/* Page Header */}
      <header className="page-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.688rem',
              fontWeight: 700,
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={13} />
            {t('ba.badgeEvidence', 'Bukti Ilmiah RCT: Arjadi et al., The Lancet Psychiatry')}
          </span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
          {t('ba.title', 'Aktivasi Perilaku (Behavioral Activation)')}
        </h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.938rem', lineHeight: 1.6, margin: 0 }}>
          {t('ba.subtitle', 'Jadwalkan aktivitas mikro bernilai untuk memutus siklus kelesuan mental dan memulihkan energi positifmu.')}
        </p>
      </header>

      {/* Quick Stats Grid */}
      <div
        className="ba-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <Card padding="md" style={{ textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {t('ba.statScheduled', 'Total Direncanakan')}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats.totalScheduled}
          </div>
        </Card>
        <Card padding="md" style={{ textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {t('ba.statCompleted', 'Selesai')}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
            {stats.totalCompleted}
          </div>
        </Card>
        <Card padding="md" style={{ textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {t('ba.statRate', 'Tingkat Penyelesaian')}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
            {stats.completionRate}%
          </div>
        </Card>
        <Card padding="md" style={{ textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {t('ba.statDelta', 'Rata-rata Dampak Mood')}
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: stats.averageMoodDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
              marginTop: '4px',
            }}
          >
            {stats.averageMoodDelta > 0 ? `+${stats.averageMoodDelta}` : stats.averageMoodDelta}
          </div>
        </Card>
      </div>

      {/* Main Action & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {/* Domain Filter Tabs */}
        <div className="category-chips">
          <button
            className={`category-chip ${selectedDomainFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDomainFilter('all')}
          >
            {t('ba.tabAll', 'Semua')}
          </button>
          <button
            className={`category-chip ${selectedDomainFilter === 'pleasure' ? 'active' : ''}`}
            onClick={() => setSelectedDomainFilter('pleasure')}
          >
            <Coffee size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {t('ba.tabPleasure', 'Kesenangan')}
          </button>
          <button
            className={`category-chip ${selectedDomainFilter === 'mastery' ? 'active' : ''}`}
            onClick={() => setSelectedDomainFilter('mastery')}
          >
            <Award size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {t('ba.tabMastery', 'Pencapaian')}
          </button>
          <button
            className={`category-chip ${selectedDomainFilter === 'spiritual' ? 'active' : ''}`}
            onClick={() => setSelectedDomainFilter('spiritual')}
          >
            <Heart size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {t('ba.tabSpiritual', 'Spiritual')}
          </button>
          <button
            className={`category-chip ${selectedDomainFilter === 'social' ? 'active' : ''}`}
            onClick={() => setSelectedDomainFilter('social')}
          >
            <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {t('ba.tabSocial', 'Sosial')}
          </button>
        </div>

        {/* Schedule Button */}
        <Button
          variant="primary"
          onClick={handleOpenPlanModal}
          icon={<Plus size={16} />}
          style={{ minHeight: '44px', fontWeight: 600 }}
        >
          {t('ba.planActivityBtn', 'Rencanakan Aktivitas')}
        </Button>
      </div>

      {/* Section 1: Today's Scheduled Activities */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.188rem', fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
          {t('ba.todayHeading', 'Aktivitas Hari Ini')}
        </h2>

        {todayActivities.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', background: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.938rem' }}>
              {t('ba.noActivitiesToday', 'Belum ada aktivitas yang direncanakan untuk hari ini. Mulai dengan satu tindakan kecil!')}
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {todayActivities.map(act => {
              const delta = act.actualMood !== undefined ? act.actualMood - act.predictedMood : undefined;
              return (
                <Card
                  key={act.id}
                  padding="md"
                  style={{
                    background: 'var(--bg-card)',
                    borderLeft: `4px solid ${getDomainColor(act.domain)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.688rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: 'var(--bg-secondary)',
                            color: getDomainColor(act.domain),
                            textTransform: 'uppercase',
                          }}
                        >
                          {getDomainLabel(act.domain)}
                        </span>
                        {act.scheduledTime && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={12} /> {act.scheduledTime}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {act.titleKey ? t(act.titleKey, act.title) : act.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleDelete(act.id)}
                        className="btn btn-ghost"
                        style={{ padding: '6px', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        aria-label={t('ba.deleteActivity', 'Hapus')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mood Metrics & Completion Button */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 'var(--spacing-sm)',
                      paddingTop: 'var(--spacing-xs)',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.813rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        {t('ba.predictedMoodLabel', 'Ekspektasi: {{val}}/10', { val: act.predictedMood })}
                      </span>
                      {act.isCompleted && act.actualMood !== undefined && (
                        <span
                          style={{
                            fontWeight: 700,
                            color: delta && delta >= 0 ? 'var(--color-success)' : 'var(--text-primary)',
                          }}
                        >
                          {t('ba.actualMoodLabel', 'Nyata: {{val}}/10', { val: act.actualMood })}
                          {delta !== undefined && (
                            <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>
                              ({delta > 0 ? `+${delta}` : delta})
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {!act.isCompleted ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenCompleteModal(act)}
                        icon={<CheckCircle2 size={15} />}
                        style={{ minHeight: '40px', fontWeight: 600 }}
                      >
                        {t('ba.markComplete', 'Tandai Selesai')}
                      </Button>
                    ) : (
                      <span style={{ fontSize: '0.813rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> {t('ba.statCompleted', 'Selesai')}
                      </span>
                    )}
                  </div>

                  {act.reflection && (
                    <div
                      style={{
                        padding: '6px 10px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.813rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                      }}
                    >
                      "{act.reflection}"
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Other Days & Accomplishment History */}
      {pastAndUpcoming.length > 0 && (
        <section style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '1.188rem', fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
            {t('ba.historyHeading', 'Riwayat & Jadwal Lain')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {pastAndUpcoming.map(act => (
              <Card
                key={act.id}
                padding="sm"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-secondary)',
                  opacity: act.isCompleted ? 0.85 : 1,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.688rem', fontWeight: 700, color: getDomainColor(act.domain) }}>
                      {getDomainLabel(act.domain)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      • {act.scheduledDate}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.938rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {act.titleKey ? t(act.titleKey, act.title) : act.title}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {act.isCompleted ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      ✓ {act.actualMood}/10
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenCompleteModal(act)}
                      icon={<CheckCircle2 size={13} />}
                      style={{ minHeight: '36px', fontSize: '0.75rem' }}
                    >
                      {t('ba.markComplete', 'Selesai')}
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(act.id)}
                    className="btn btn-ghost"
                    style={{ padding: '4px', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                    aria-label={t('ba.deleteActivity', 'Hapus')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Psychoeducation Card */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Card
          padding="md"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
          }}
          onClick={() => setShowPsychoeducation(!showPsychoeducation)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '0.938rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {t('ba.psychoTitle', 'Mengapa Aktivasi Perilaku Bekerja?')}
              </h3>
            </div>
            {showPsychoeducation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {showPsychoeducation && (
            <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                {t('ba.psychoViciousCycle', 'Siklus Kelesuan (Vicious Cycle): Saat mood rendah, kita cenderung menarik diri dan menunda hal kecil, membuat energi semakin terkuras.')}
              </p>
              <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                {t('ba.psychoVirtuousCycle', 'Siklus Energi (Virtuous Cycle): Tindakan mendahului motivasi. Memulai langkah mikro merangsang dopamin dan memulihkan rasa efikasi diri.')}
              </p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>
                {t('ba.psychoFooter', 'Riset membuktikan aktivitas terjadwal berbasis nilai efektif mengurangi gejala depresi dan anhedonia secara mandiri.')}
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Modal 1: Plan Activity Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={t('ba.modalPlanTitle', 'Rencanakan Aktivitas Baru')}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-xs) 0' }}>
          {/* Domain Selector */}
          <div>
            <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              {t('ba.selectDomain', 'Kategori Nilai (Value Domain)')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {(['pleasure', 'mastery', 'spiritual', 'social'] as BaDomain[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setPlanDomain(d);
                    setSelectedCatalogId('');
                  }}
                  className={`btn btn-sm ${planDomain === d ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    fontSize: '0.75rem',
                    padding: '8px 4px',
                    border: planDomain === d ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  {getDomainLabel(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Recommendations for Selected Domain */}
          <div>
            <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              {t('ba.chooseFromCatalog', 'Pilih dari Katalog Rekomendasi')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {BA_CATALOG.filter(c => c.domain === planDomain).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectCatalogItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedCatalogId === item.id ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    background: selectedCatalogId === item.id ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.813rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{t(item.titleKey, item.titleFallback)}</span>
                  <span style={{ fontSize: '0.688rem', color: 'var(--text-tertiary)' }}>~{item.defaultDurationMinutes} min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Or Custom Title */}
          <div>
            <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              {t('ba.orCustomActivity', 'Atau Tulis Aktivitas Sendiri')}
            </label>
            <Input
              value={customTitle}
              onChange={e => {
                setCustomTitle(e.target.value);
                if (e.target.value) setSelectedCatalogId('');
              }}
              placeholder={t('ba.customTitlePlaceholder', 'Misal: Menyiram tanaman di teras')}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                {t('ba.scheduleDate', 'Tanggal')}
              </label>
              <Input
                type="date"
                value={planDate}
                onChange={e => setPlanDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                {t('ba.scheduleTime', 'Waktu (Opsional)')}
              </label>
              <Input
                type="time"
                value={planTime}
                onChange={e => setPlanTime(e.target.value)}
              />
            </div>
          </div>

          {/* Predicted Mood Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('ba.predictMoodQuestion', 'Seberapa baik perasaanmu setelah melakukan ini?')}
              </label>
              <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {predictedMood}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={predictedMood}
              onChange={e => setPredictedMood(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
          </div>

          {/* Save / Cancel buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end', marginTop: 'var(--spacing-sm)' }}>
            <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)}>
              {t('ba.btnCancel', 'Batal')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePlan}
              disabled={!selectedCatalogId && !customTitle.trim()}
            >
              {t('ba.btnSavePlan', 'Jadwalkan Sekarang')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Completion & Reflection Modal */}
      {completeTarget && (
        <Modal
          isOpen={!!completeTarget}
          onClose={() => setCompleteTarget(null)}
          title={t('ba.modalCompleteTitle', 'Evaluasi Dampak Aktivitas')}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-xs) 0' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {t('ba.completeSubtitle', 'Bandingkan perasaanmu sekarang dengan ekspektasi awal sebelum beraktivitas.')}
            </p>

            {/* Target Activity Summary */}
            <div
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${getDomainColor(completeTarget.domain)}`,
              }}
            >
              <div style={{ fontSize: '0.938rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {completeTarget.titleKey ? t(completeTarget.titleKey, completeTarget.title) : completeTarget.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                {t('ba.predictedMoodLabel', 'Ekspektasi: {{val}}/10', { val: completeTarget.predictedMood })}
              </div>
            </div>

            {/* Actual Mood Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('ba.actualMoodQuestion', 'Berapa skor mood nyatamu setelah menyelesaikannya? (1-10)')}
                </label>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {actualMood}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={actualMood}
                onChange={e => setActualMood(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-success)' }}
              />
            </div>

            {/* Real-time Delta Feedback */}
            {actualMood > completeTarget.predictedMood ? (
              <div
                style={{
                  padding: 'var(--spacing-sm)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--color-success)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <TrendingUp size={16} />
                {t('ba.deltaCongratulation', 'Luar biasa! Moodmu naik {{delta}} poin lebih tinggi dari prediksimu 🎉', {
                  delta: actualMood - completeTarget.predictedMood,
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--spacing-sm)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.813rem',
                }}
              >
                {t('ba.deltaComfort', 'Setiap langkah kecil berharga. Kamu telah membuktikan komitmenmu pada dirimu sendiri 🌿')}
              </div>
            )}

            {/* Reflection Textarea */}
            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                {t('ba.reflectionLabel', 'Refleksi:')}
              </label>
              <textarea
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder={t('ba.reflectionPlaceholder', 'Catatan singkat atau hal yang kamu rasakan (opsional)...')}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-input, var(--bg-secondary))',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end', marginTop: 'var(--spacing-sm)' }}>
              <Button variant="ghost" onClick={() => setCompleteTarget(null)}>
                {t('ba.btnCancel', 'Batal')}
              </Button>
              <Button variant="primary" onClick={handleSaveCompletion}>
                {t('ba.btnSaveEvaluation', 'Simpan Evaluasi')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clinical Disclaimer */}
      <ClinicalDisclaimer
        context={t(
          'disclaimer.ba',
          'Modul Behavioral Activation didasarkan pada riset klinis RCT untuk melatih inisiasi tindakan mandiri dan bukan pengganti psikoterapi tatap muka.'
        )}
      />
    </div>
  );
};
