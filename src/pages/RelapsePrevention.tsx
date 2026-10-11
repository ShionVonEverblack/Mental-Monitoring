import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  AlertTriangle,
  Heart,
  Plus,
  Trash2,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { useRelapseStore } from '../stores/relapseStore';
import type { WarningSignCategory, DeEscalationLevel } from '../types/relapse';

type RelapseTab = 'warning' | 'deescalation' | 'compassion';

export const RelapsePrevention: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RelapseTab>('warning');

  const {
    plan,
    addWarningSign,
    removeWarningSign,
    addStrategy,
    removeStrategy,
    addSupportContact,
    removeSupportContact,
    updateSelfCompassionNotes,
    resetPlanToDefault,
  } = useRelapseStore();

  // New Warning Sign input state
  const [newWsCategory, setNewWsCategory] = useState<WarningSignCategory>('behavioral');
  const [newWsText, setNewWsText] = useState('');

  // New Strategy input state
  const [newStratLevel, setNewStratLevel] = useState<DeEscalationLevel>(1);
  const [newStratTitle, setNewStratTitle] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');

  // New Contact input state
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const [notesSavedToast, setNotesSavedToast] = useState(false);
  const toastTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleAddWarningSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsText.trim()) return;
    addWarningSign(newWsCategory, newWsText.trim());
    setNewWsText('');
  };

  const handleAddStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratTitle.trim()) return;
    addStrategy(newStratLevel, newStratTitle.trim(), newStratDesc.trim());
    setNewStratTitle('');
    setNewStratDesc('');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    addSupportContact(newContactName.trim(), newContactRel.trim(), newContactPhone.trim());
    setNewContactName('');
    setNewContactRel('');
    setNewContactPhone('');
  };

  const handleSaveNotes = () => {
    setNotesSavedToast(true);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setNotesSavedToast(false), 2500);
  };

  const warningCategories: WarningSignCategory[] = ['behavioral', 'emotional', 'cognitive', 'physical'];

  return (
    <div className="relapse-prevention-page" style={{ padding: 'var(--spacing-md) 0 var(--spacing-3xl)' }}>
      {/* Header */}
      <header className="relapse-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
          <ShieldAlert size={28} style={{ color: 'var(--color-secondary)' }} aria-hidden="true" />
          <h1 className="page-title" style={{ margin: 0 }}>
            {t('relapse.title', 'Rencana Antisipasi Kambuh (Relapse Prevention)')}
          </h1>
        </div>
        <p className="page-subtitle" style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--text-secondary)' }}>
          {t(
            'relapse.subtitle',
            'Peta perlindungan diri dini berbasis Marlatt & Gordon: kenali tanda awal, de-eskalasi sebelum krisis, dan rangkul kemunduran dengan welas asih.'
          )}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
          <span className="badge badge-secondary">
            🛡️ {t('relapse.badgeMarlatt', 'Model Kognitif-Perilaku Marlatt & Gordon')}
          </span>
          <span className="badge badge-primary">
            🌿 {t('relapse.badgeAve', 'Penawar Abstinence Violation Effect (AVE)')}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <nav
        className="relapse-tabs"
        role="tablist"
        aria-label={t('relapse.tabsAria', 'Pilihan Bagian Rencana Antisipasi Kambuh')}
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
          aria-selected={activeTab === 'warning'}
          className={`btn ${activeTab === 'warning' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('warning')}
          style={{ justifyContent: 'center', gap: '8px', minHeight: '44px' }}
        >
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{t('relapse.tabs.warning', '⚠️ Tanda Peringatan Dini')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'deescalation'}
          className={`btn ${activeTab === 'deescalation' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('deescalation')}
          style={{ justifyContent: 'center', gap: '8px', minHeight: '44px' }}
        >
          <ShieldAlert size={18} aria-hidden="true" />
          <span>{t('relapse.tabs.deescalation', '🛡️ Strategi De-Eskalasi')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'compassion'}
          className={`btn ${activeTab === 'compassion' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('compassion')}
          style={{ justifyContent: 'center', gap: '8px', minHeight: '44px' }}
        >
          <Heart size={18} aria-hidden="true" />
          <span>{t('relapse.tabs.compassion', '🌿 Welas Asih & Penawar AVE')}</span>
        </button>
      </nav>

      {/* TAB 1: TANDA PERINGATAN DINI */}
      {activeTab === 'warning' && (
        <section aria-label={t('relapse.warning.sectionLabel', 'Pemetaan Tanda Peringatan Dini')}>
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
              {t('relapse.warning.introTitle', 'Kenali Riak Sebelum Menjadi Gelombang')}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              {t(
                'relapse.warning.introDesc',
                'Kemunduran emosi jarang terjadi secara tiba-tiba. Biasanya diawali oleh riak-riak kecil pada perilaku, pikiran, emosi, atau sensasi fisik. Mengenalinya sejak awal memberi Anda waktu untuk jeda.'
              )}
            </p>
          </div>

          {/* Form Tambah Tanda Dini */}
          <form onSubmit={handleAddWarningSign} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            <select
              className="select"
              value={newWsCategory}
              onChange={(e) => setNewWsCategory(e.target.value as WarningSignCategory)}
              style={{ flex: '1 1 180px' }}
              aria-label={t('relapse.warning.categoryLabel', 'Kategori Tanda')}
            >
              {warningCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`relapse.warning.cat_${cat}`, cat)}
                </option>
              ))}
            </select>
            <Input
              placeholder={t('relapse.warning.inputPlaceholder', 'Tuliskan tanda peringatan dini baru...')}
              value={newWsText}
              onChange={(e) => setNewWsText(e.target.value)}
              style={{ flex: '3 1 260px' }}
            />
            <Button type="submit" variant="primary" style={{ gap: '6px' }}>
              <Plus size={16} />
              <span>{t('relapse.warning.btnAdd', 'Tambah Tanda')}</span>
            </Button>
          </form>

          {/* Daftar Tanda Dini Berdasarkan Kategori */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
            {warningCategories.map((cat) => {
              const items = plan.warningSigns.filter((w) => w.category === cat);
              return (
                <Card key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      {t(`relapse.warning.cat_${cat}`, cat)}
                    </h3>
                    <span className="badge badge-primary" style={{ fontSize: '0.688rem' }}>
                      {items.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginTop: '4px' }}>
                    {items.length === 0 ? (
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        {t('relapse.warning.emptyCat', 'Belum ada catatan tanda di kategori ini.')}
                      </p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-glass-subtle)',
                            border: '1px solid var(--border-subtle)',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            • {item.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeWarningSign(item.id)}
                            className="btn-icon"
                            style={{ padding: '4px', color: 'var(--text-tertiary)' }}
                            aria-label={t('common.delete', 'Hapus')}
                            title={t('common.delete', 'Hapus')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: STRATEGI DE-ESKALASI */}
      {activeTab === 'deescalation' && (
        <section aria-label={t('relapse.deescalation.sectionLabel', 'Strategi De-Eskalasi Bertingkat')}>
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
              {t('relapse.deescalation.introTitle', 'Protokol De-Eskalasi 3 Lapis')}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              {t(
                'relapse.deescalation.introDesc',
                'Mulai dari tindakan mandiri paling cepat dan mudah (Level 1), jeda ruang dan sensorik (Level 2), hingga menghubungi jangkar kontak sosial dan layanan resmi (Level 3).'
              )}
            </p>
          </div>

          {/* Form Tambah Strategi */}
          <form onSubmit={handleAddStrategy} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, margin: 0 }}>
              {t('relapse.deescalation.addTitle', 'Tambah Strategi De-Eskalasi Pribadi')}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
              <select
                className="select"
                value={newStratLevel}
                onChange={(e) => setNewStratLevel(Number(e.target.value) as DeEscalationLevel)}
                style={{ flex: '1 1 200px' }}
                aria-label={t('relapse.deescalation.levelSelect', 'Pilih Level')}
              >
                <option value={1}>{t('relapse.deescalation.lvl1_title', 'Level 1: Aksi Mandiri Cepat')}</option>
                <option value={2}>{t('relapse.deescalation.lvl2_title', 'Level 2: Jeda Ruang & Sensorik')}</option>
                <option value={3}>{t('relapse.deescalation.lvl3_title', 'Level 3: Dukungan Sosial & Darurat')}</option>
              </select>
              <Input
                placeholder={t('relapse.deescalation.titlePlaceholder', 'Nama aksi de-eskalasi (misal: Kompres air dingin)')}
                value={newStratTitle}
                onChange={(e) => setNewStratTitle(e.target.value)}
                style={{ flex: '2 1 240px' }}
              />
            </div>
            <Input
              placeholder={t('relapse.deescalation.descPlaceholder', 'Detail panduan singkat cara melakukannya (opsional)...')}
              value={newStratDesc}
              onChange={(e) => setNewStratDesc(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" style={{ gap: '6px' }}>
                <Plus size={16} />
                <span>{t('relapse.deescalation.btnAdd', 'Simpan Strategi')}</span>
              </Button>
            </div>
          </form>

          {/* 3 Level Accordion / Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
            {([1, 2, 3] as DeEscalationLevel[]).map((lvl) => {
              const strats = plan.strategies.filter((s) => s.level === lvl);
              const badgeColors = {
                1: 'var(--color-secondary)',
                2: 'var(--color-primary)',
                3: 'var(--color-warm)',
              };
              return (
                <div
                  key={lvl}
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-glass-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: badgeColors[lvl],
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.813rem',
                          fontWeight: 700,
                        }}
                      >
                        {lvl}
                      </span>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0 }}>
                        {t(`relapse.deescalation.lvl${lvl}_title`, `Level ${lvl}`)}
                      </h3>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                      {strats.length} {t('relapse.deescalation.actionsCount', 'aksi')}
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', margin: '0 0 var(--spacing-sm)' }}>
                    {t(`relapse.deescalation.lvl${lvl}_desc`, '')}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    {strats.map((strat) => (
                      <div
                        key={strat.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-glass-subtle)',
                          border: '1px solid var(--border-subtle)',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', display: 'block' }}>
                            {strat.title}
                          </strong>
                          {strat.description && (
                            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {strat.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStrategy(strat.id)}
                          className="btn-icon"
                          style={{ padding: '6px', color: 'var(--text-tertiary)' }}
                          aria-label={t('common.delete', 'Hapus')}
                          title={t('common.delete', 'Hapus')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kontak Jangkar Sosial */}
          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={20} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0 }}>
                  {t('relapse.contacts.title', 'Daftar Kontak Jangkar Terpercaya')}
                </h3>
              </div>
              <a
                href="tel:119,8"
                className="btn btn-sm btn-danger"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <PhoneCall size={14} />
                <span>{t('safety.callNow', 'Telepon Darurat 119 Ext 8')}</span>
              </a>
            </div>

            {/* List contacts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
              {plan.supportContacts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      {c.name}
                    </span>
                    <span style={{ marginLeft: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      ({c.relationship})
                    </span>
                    {c.phone && (
                      <span style={{ marginLeft: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
                        📞 {c.phone}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSupportContact(c.id)}
                    className="btn-icon"
                    style={{ padding: '6px', color: 'var(--text-tertiary)' }}
                    aria-label={t('common.delete', 'Hapus')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Form tambah kontak */}
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
              <Input
                placeholder={t('relapse.contacts.namePlaceholder', 'Nama orang/layanan')}
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                style={{ flex: '2 1 180px' }}
              />
              <Input
                placeholder={t('relapse.contacts.relPlaceholder', 'Peran/Hubungan')}
                value={newContactRel}
                onChange={(e) => setNewContactRel(e.target.value)}
                style={{ flex: '2 1 180px' }}
              />
              <Input
                placeholder={t('relapse.contacts.phonePlaceholder', 'Nomor telepon')}
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                style={{ flex: '1 1 140px' }}
              />
              <Button type="submit" variant="secondary" style={{ gap: '6px' }}>
                <Plus size={16} />
                <span>{t('relapse.contacts.btnAdd', 'Tambah Kontak')}</span>
              </Button>
            </form>
          </div>
        </section>
      )}

      {/* TAB 3: WELAS ASIH & PENAWAR AVE */}
      {activeTab === 'compassion' && (
        <section aria-label={t('relapse.compassion.sectionLabel', 'Welas Asih & Penawar Abstinence Violation Effect')}>
          {/* Card Marlatt's AVE Psychoeducation */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'hsla(165, 45%, 50%, 0.1)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-secondary)',
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <Sparkles size={24} style={{ color: 'var(--color-secondary)' }} aria-hidden="true" />
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                {t('relapse.ave.title', 'Mengatasi Abstinence Violation Effect (AVE)')}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, margin: '0 0 var(--spacing-sm)' }}>
              {t(
                'relapse.ave.body1',
                'Dalam riset Dr. Alan Marlatt, musuh terbesar pemulihan bukanlah kemunduran itu sendiri, melainkan "Abstinence Violation Effect" (AVE): rasa bersalah berlebih dan keyakinan hitam-putih bahwa satu hari buruk berarti semua usaha selama ini hancur.'
              )}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, margin: 0 }}>
              <strong>{t('relapse.ave.formulaTitle', 'Rumus Klinis Pemulihan:')}</strong>{' '}
              {t(
                'relapse.ave.formulaBody',
                'Kemunduran sesaat (Lapse) hanyalah sebuah slip kecil di jalan. Ia tidak otomatis menjadi kejatuhan total (Relapse), kecuali jika Anda menghakimi diri sendiri dan menyerah.'
              )}
            </p>
          </div>

          {/* Affirmation Cards */}
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
            {t('relapse.ave.affirmationsTitle', 'Jangkar Afirmasi Welas Asih Saat Terjadi Kemunduran:')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            {plan.aveAffirmations.map((aff, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🌿</span>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                  “{aff}”
                </p>
              </div>
            ))}
          </div>

          {/* Editable Self-Compassion Notes */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <label htmlFor="ave-notes" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              {t('relapse.ave.notesLabel', 'Pesan Welas Asih Pribadi untuk Diriku Saat Hari Terasa Berat:')}
            </label>
            <textarea
              id="ave-notes"
              rows={4}
              className="textarea"
              value={plan.selfCompassionNotes}
              onChange={(e) => updateSelfCompassionNotes(e.target.value)}
              style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              {notesSavedToast && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {t('common.saved', 'Tersimpan otomatis')}
                </span>
              )}
              <Button type="button" variant="primary" onClick={handleSaveNotes} style={{ gap: '6px' }}>
                <BookmarkCheck size={16} />
                <span>{t('common.save', 'Simpan Catatan')}</span>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer Actions: Reset button & Disclaimer */}
      <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('relapse.confirmReset', 'Kembalikan rencana ke setelan awal bukti ilmiah?'))) {
              resetPlanToDefault();
            }
          }}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px', color: 'var(--text-tertiary)' }}
        >
          <RotateCcw size={14} />
          <span>{t('relapse.btnReset', 'Reset Rencana ke Default')}</span>
        </button>
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <ClinicalDisclaimer />
      </div>
    </div>
  );
};

export default RelapsePrevention;
