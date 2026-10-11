import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  HeartHandshake,
  Sprout,
  Activity,
  Briefcase,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Waves,
  Eye,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { useActStore } from '../stores/actStore';
import type { ActDomain } from '../types/act';

type ActTab = 'compass' | 'leaves' | 'noticing';

const DOMAIN_ICONS: Record<ActDomain, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  relationships: HeartHandshake,
  growth: Sprout,
  health: Activity,
  work: Briefcase,
};

const DOMAIN_FALLBACKS: Record<ActDomain, { title: string; subtitle: string }> = {
  relationships: {
    title: 'Hubungan & Koneksi',
    subtitle: 'Keluarga, sahabat, pasangan, dan empati sosial',
  },
  growth: {
    title: 'Pertumbuhan Diri',
    subtitle: 'Pembelajaran, kebijaksanaan, dan keberanian batin',
  },
  health: {
    title: 'Kesehatan & Vitalitas',
    subtitle: 'Kebugaran fisik, ritme tidur, dan ketenangan jiwa',
  },
  work: {
    title: 'Karya & Kontribusi',
    subtitle: 'Pekerjaan, pelayanan, dan dampak bermakna bagi sesama',
  },
};

export const ActTherapy: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActTab>('compass');

  const {
    values,
    committedActions,
    defusionSessions,
    updateValue,
    addCommittedAction,
    toggleCommittedAction,
    deleteCommittedAction,
    addDefusionSession,
  } = useActStore();

  // Tab 1 state: Committed action input
  const [newActionDomain, setNewActionDomain] = useState<ActDomain>('relationships');
  const [newActionTitle, setNewActionTitle] = useState('');

  // Tab 2 state: Leaves on a stream
  const [leafThought, setLeafThought] = useState('');
  const [isLeafFloating, setIsLeafFloating] = useState(false);
  const [leafStep, setLeafStep] = useState<number>(0);

  // Tab 3 state: Thought Labeling Wizard
  const [rawThought, setRawThought] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const timerIdsRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    return () => {
      timerIdsRef.current.forEach((id) => window.clearTimeout(id));
      timerIdsRef.current = [];
    };
  }, []);

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    addCommittedAction({
      domain: newActionDomain,
      title: newActionTitle.trim(),
    });
    setNewActionTitle('');
  };

  const handleStartLeafStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leafThought.trim() || isLeafFloating) return;
    setIsLeafFloating(true);
    setLeafStep(1);

    const t1 = window.setTimeout(() => setLeafStep(2), 2500);
    const t2 = window.setTimeout(() => setLeafStep(3), 5000);
    const t3 = window.setTimeout(() => {
      addDefusionSession({
        exerciseId: 'leaves_on_stream',
        originalThought: leafThought.trim(),
        reframedThought: t('act.leaves.reframedLabel', 'Dibiarkan mengalir lewat di atas daun'),
      });
      setIsLeafFloating(false);
      setLeafStep(0);
      setLeafThought('');
    }, 7500);

    timerIdsRef.current.push(t1, t2, t3);
  };

  const handleSaveNoticingSession = () => {
    if (!rawThought.trim()) return;
    const reframed = `${t('act.noticing.tier3Prefix', 'Aku menyadari bahwa pikiranku sedang berkata bahwa')} "${rawThought.trim()}"`;
    addDefusionSession({
      exerciseId: 'thought_labeling',
      originalThought: rawThought.trim(),
      reframedThought: reframed,
    });
    setSavedSuccess(true);
    const tSaved = window.setTimeout(() => {
      setSavedSuccess(false);
      setRawThought('');
    }, 2000);
    timerIdsRef.current.push(tSaved);
  };

  const domains: ActDomain[] = ['relationships', 'growth', 'health', 'work'];

  return (
    <div className="act-therapy-page" style={{ padding: 'var(--spacing-md) 0 var(--spacing-3xl)' }}>
      {/* Page Header */}
      <header className="act-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
          <Compass size={28} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <h1 className="page-title" style={{ margin: 0 }}>
            {t('act.title', 'Terapi Keberterimaan & Komitmen (ACT)')}
          </h1>
        </div>
        <p className="page-subtitle" style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--text-secondary)' }}>
          {t('act.subtitle', 'Menemukan kompas nilai hidup bermakna dan membebaskan diri dari jeratan pikiran (Hayes et al.)')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
          <span className="badge badge-primary">
            ⚕️ {t('act.clinicalBadge', 'Steven C. Hayes • Model Heksafleks Klinis')}
          </span>
          <span className="badge badge-secondary">
            🍃 {t('act.defusionBadge', 'Defusi Kognitif & Aksi Berkomitmen')}
          </span>
        </div>
      </header>

      {/* Tab Switcher */}
      <nav
        className="act-tabs"
        role="tablist"
        aria-label={t('act.tabsAria', 'Pilihan Modul Terapi ACT')}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'compass'}
          className={`btn ${activeTab === 'compass' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('compass')}
          style={{ justifyContent: 'center', gap: '8px', minHeight: '44px' }}
        >
          <Compass size={18} aria-hidden="true" />
          <span>{t('act.tabs.compass', '🧭 Kompas Nilai Hidup')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'leaves'}
          className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('leaves')}
          style={{ justifyContent: 'center', gap: '8px', minHeight: '44px' }}
        >
          <Waves size={18} aria-hidden="true" />
          <span>{t('act.tabs.leaves', '🍃 Daun di Aliran Sungai')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'noticing'}
          className={`btn ${activeTab === 'noticing' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('noticing')}
          style={{ justifyContent: 'center', gap: '8px', minHeight: '44px' }}
        >
          <Eye size={18} aria-hidden="true" />
          <span>{t('act.tabs.noticing', '💬 Aku Menyadari Pikiran')}</span>
        </button>
      </nav>

      {/* TAB 1: KOMPAS NILAI HIDUP */}
      {activeTab === 'compass' && (
        <section aria-label={t('act.compass.sectionLabel', 'Eksplorasi Nilai Hidup & Tindakan Berkomitmen')}>
          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-glass-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: '0 0 var(--spacing-xs)' }}>
              {t('act.compass.introTitle', 'Arah Kompas, Bukan Garis Akhir')}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              {t(
                'act.compass.introDesc',
                'Nilai hidup bukanlah tujuan (goals) yang bisa dicoret setelah selesai, melainkan arah mata angin kompas: cara Anda memilih bersikap dan menjalani hidup di setiap detik.'
              )}
            </p>
          </div>

          {/* 4 Core Value Domains */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-2xl)',
            }}
          >
            {domains.map((dom) => {
              const Icon = DOMAIN_ICONS[dom];
              const valueData = values[dom];
              return (
                <Card key={dom} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-transparent)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0 }}>
                        {t(`act.domains.${dom}.title`, DOMAIN_FALLBACKS[dom].title)}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-secondary)',
                      }}
                    >
                      {valueData.importance}/10 {t('act.compass.importanceSuffix', 'Penting')}
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                    {t(`act.domains.${dom}.subtitle`, DOMAIN_FALLBACKS[dom].subtitle)}
                  </p>

                  {/* Importance Slider */}
                  <div style={{ marginTop: 'var(--spacing-xs)' }}>
                    <label
                      htmlFor={`slider-${dom}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                      }}
                    >
                      {t('act.compass.importanceSliderLabel', 'Tingkat Kepentingan Batin:')}
                    </label>
                    <input
                      id={`slider-${dom}`}
                      type="range"
                      min={1}
                      max={10}
                      value={valueData.importance}
                      onChange={(e) => updateValue(dom, { importance: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    />
                  </div>

                  {/* Personal Value Statement */}
                  <div>
                    <label
                      htmlFor={`stmt-${dom}`}
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                      }}
                    >
                      {t('act.compass.statementLabel', 'Pernyataan Sikap Bermakna:')}
                    </label>
                    <textarea
                      id={`stmt-${dom}`}
                      rows={2}
                      className="textarea"
                      value={valueData.statement}
                      onChange={(e) => updateValue(dom, { statement: e.target.value })}
                      style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Committed Actions Section */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
              <Sparkles size={20} style={{ color: 'var(--color-warm)' }} aria-hidden="true" />
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                {t('act.actions.sectionTitle', 'Tindakan Berkomitmen (Committed Action)')}
              </h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--spacing-md)' }}>
              {t(
                'act.actions.sectionDesc',
                'Langkah nyata berukuran kecil yang Anda ambil hari ini selaras dengan nilai hidup yang Anda pilih.'
              )}
            </p>

            {/* Add action form */}
            <form onSubmit={handleAddAction} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              <select
                className="select"
                value={newActionDomain}
                onChange={(e) => setNewActionDomain(e.target.value as ActDomain)}
                style={{ flex: '1 1 180px' }}
                aria-label={t('act.actions.selectDomain', 'Pilih Domain')}
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {t(`act.domains.${d}.title`, DOMAIN_FALLBACKS[d].title)}
                  </option>
                ))}
              </select>
              <Input
                placeholder={t('act.actions.inputPlaceholder', 'Tuliskan satu tindakan kecil hari ini...')}
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                style={{ flex: '3 1 260px' }}
              />
              <Button type="submit" variant="primary" style={{ gap: '6px' }}>
                <Plus size={16} />
                <span>{t('act.actions.btnAdd', 'Tambah Aksi')}</span>
              </Button>
            </form>

            {/* Actions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {committedActions.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                  {t('act.actions.emptyList', 'Belum ada tindakan berkomitmen. Mulai dari satu hal kecil.')}
                </p>
              ) : (
                committedActions.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: act.isCompleted ? 'var(--bg-secondary)' : 'var(--bg-glass-subtle)',
                      border: '1px solid var(--border-subtle)',
                      opacity: act.isCompleted ? 0.75 : 1,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCommittedAction(act.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        textAlign: 'left',
                        flex: 1,
                        color: 'inherit',
                      }}
                      aria-label={act.isCompleted ? t('act.actions.markUndone', 'Tandai belum selesai') : t('act.actions.markDone', 'Tandai selesai')}
                    >
                      {act.isCompleted ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-secondary)' }} />
                      ) : (
                        <Circle size={18} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <div>
                        <span
                          style={{
                            textDecoration: act.isCompleted ? 'line-through' : 'none',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                          }}
                        >
                          {act.title}
                        </span>
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          ({t(`act.domains.${act.domain}.title`, DOMAIN_FALLBACKS[act.domain].title)})
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCommittedAction(act.id)}
                      className="btn-icon"
                      style={{ padding: '6px', color: 'var(--text-tertiary)' }}
                      aria-label={t('common.delete', 'Hapus')}
                      title={t('common.delete', 'Hapus')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: DAUN DI ALIRAN SUNGAI (LEAVES ON A STREAM) */}
      {activeTab === 'leaves' && (
        <section aria-label={t('act.leaves.sectionLabel', 'Latihan Defusi: Daun di Aliran Sungai')}>
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-glass-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--spacing-xl)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)' }}>
              <Waves size={24} style={{ color: 'var(--color-secondary)' }} aria-hidden="true" />
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                {t('act.leaves.title', 'Daun di Aliran Sungai (Leaves on a Stream)')}
              </h2>
            </div>
            <p
              style={{
                maxWidth: '640px',
                margin: '0 auto var(--spacing-lg)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.6,
              }}
            >
              {t(
                'act.leaves.guideText',
                'Bayangkan Anda duduk di tepi sungai yang tenang dengan dedaunan yang hanyut mengalir. Ketika ada pikiran yang melelahkan atau mencemaskan, letakkan pikiran itu di atas daun, dan biarkan ia hanyut mengalir tanpa perlu Anda tahan atau usir.'
              )}
            </p>

            {/* Input Form */}
            {!isLeafFloating ? (
              <form onSubmit={handleStartLeafStream} style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <Input
                  placeholder={t('act.leaves.inputPlaceholder', 'Ketik pikiran yang sedang membebanimu... (misal: "Aku takut gagal")')}
                  value={leafThought}
                  onChange={(e) => setLeafThought(e.target.value)}
                  style={{ textAlign: 'center' }}
                />
                <Button type="submit" variant="primary" style={{ justifyContent: 'center', gap: '8px' }}>
                  <span>🍃 {t('act.leaves.btnRelease', 'Letakkan di Daun & Hanyutkan')}</span>
                </Button>
              </form>
            ) : (
              <div
                style={{
                  padding: 'var(--spacing-xl) var(--spacing-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  minHeight: '220px',
                }}
              >
                {/* Floating Leaf Visual */}
                <div
                  style={{
                    backgroundColor: 'hsla(165, 45%, 50%, 0.15)',
                    border: '1px solid var(--color-secondary)',
                    borderRadius: '24px 8px 24px 8px',
                    padding: '16px 24px',
                    maxWidth: '380px',
                    boxShadow: 'var(--shadow-card)',
                    transform: leafStep === 1 ? 'translateY(0) scale(1)' : leafStep === 2 ? 'translateY(20px) scale(0.95)' : 'translateY(50px) scale(0.85) opacity(0.3)',
                    transition: 'all 2.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                >
                  <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '4px' }}>🍃</span>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}>
                    “{leafThought}”
                  </p>
                </div>

                {/* Mindful Step Indicator */}
                <div style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                  {leafStep === 1 && t('act.leaves.step1', 'Pikiranmu telah diletakkan di atas daun... Bernapaslah perlahan.')}
                  {leafStep === 2 && t('act.leaves.step2', 'Daun hanyut terbawa aliran arus air... Anda adalah sungainya, bukan daun itu.')}
                  {leafStep === 3 && t('act.leaves.step3', 'Daun perlahan menjauh... Pikiran hanyalah peristiwa mental yang lewat.')}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: AKU MENYADARI PIKIRAN (THOUGHT LABELING / SELF-AS-CONTEXT) */}
      {activeTab === 'noticing' && (
        <section aria-label={t('act.noticing.sectionLabel', 'Latihan Pelabelan Pikiran & Pengamat Berkesadaran')}>
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-glass-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <Eye size={24} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                {t('act.noticing.title', 'Aku Menyadari Bahwa... (Defusi Bertingkat)')}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: '0 0 var(--spacing-lg)' }}>
              {t(
                'act.noticing.desc',
                'Mengurai fusi kognitif dengan 3 langkah pengamat berkesadaran (Self-as-Context) untuk meredakan cengkeraman emosional pikiran.'
              )}
            </p>

            {/* Thought input */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label htmlFor="raw-thought" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
                {t('act.noticing.inputLabel', 'Tuliskan Pikiran Otomatis yang Terasa Melekat:')}
              </label>
              <Input
                id="raw-thought"
                placeholder={t('act.noticing.inputPlaceholder', 'Misal: "Aku orang yang gagal" atau "Semuanya akan hancur"')}
                value={rawThought}
                onChange={(e) => setRawThought(e.target.value)}
              />
            </div>

            {/* 3-Tier Step Visualizer */}
            {rawThought.trim() && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                {/* Level 1: Fusi Penuh */}
                <div
                  style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'hsla(0, 65%, 55%, 0.1)',
                    border: '1px solid var(--color-danger)',
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase' }}>
                    {t('act.noticing.tier1Title', 'Tahap 1: Fusi Kognitif (Pikiran = Fakta Nyata)')}
                  </span>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                    “{rawThought.trim()}”
                  </p>
                </div>

                {/* Level 2: Memberi Jarak */}
                <div
                  style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'hsla(35, 75%, 60%, 0.1)',
                    border: '1px solid var(--color-warm)',
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-warm)', textTransform: 'uppercase' }}>
                    {t('act.noticing.tier2Title', 'Tahap 2: Menyadari Proses Berpikir')}
                  </span>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                    {t('act.noticing.tier2Prefix', 'Aku sedang memiliki pikiran bahwa')} “{rawThought.trim()}”
                  </p>
                </div>

                {/* Level 3: Pengamat Berkesadaran */}
                <div
                  style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'hsla(165, 45%, 50%, 0.12)',
                    border: '1px solid var(--color-secondary)',
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                    {t('act.noticing.tier3Title', 'Tahap 3: Pengamat Diri (Self-as-Context)')}
                  </span>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                    {t('act.noticing.tier3Prefix', 'Aku menyadari bahwa pikiranku sedang berkata bahwa')} “{rawThought.trim()}”
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-xs)' }}>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveNoticingSession}
                    disabled={savedSuccess}
                    style={{ gap: '8px' }}
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{t('act.noticing.savedToast', 'Tersimpan ke Riwayat Defusi')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>{t('act.noticing.btnSave', 'Simpan Perspektif Pengamat')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Defusion History Log */}
      {defusionSessions.length > 0 && (
        <section style={{ marginTop: 'var(--spacing-xl)' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
            {t('act.history.title', 'Riwayat Latihan Defusi Terakhir')} ({defusionSessions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {defusionSessions.slice(0, 5).map((sess) => (
              <div
                key={sess.id}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-glass-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    {sess.exerciseId === 'leaves_on_stream' ? '🍃 Daun di Sungai: ' : '💬 Refleksi Pengamat: '}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>“{sess.originalThought}”</span>
                </div>
                <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {new Date(sess.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clinical Disclaimer */}
      <div style={{ marginTop: 'var(--spacing-2xl)' }}>
        <ClinicalDisclaimer />
      </div>
    </div>
  );
};

export default ActTherapy;
