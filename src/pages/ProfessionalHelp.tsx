import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { PROFESSIONAL_SERVICES, SERVICE_TYPES, PROVINCES } from '../data/professionalServices';
import type { ProfessionalService } from '../data/professionalServices';
import {
  BPJS_STEPS,
  DOCTOR_SCRIPTS,
  getClinicalHandoverData,
  printDoctorHandoverBrief,
  downloadDoctorHandoverBrief,
  formatSeverityLabel,
} from '../services/referralService';

export const ProfessionalHelp: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'directory' | 'bpjs_guide'>('directory');
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [bpjsOnly, setBpjsOnly] = useState(false);

  // Referral Script & Brief state
  const [selectedScriptId, setSelectedScriptId] = useState<'depression' | 'anxiety' | 'stress'>('depression');
  const [copiedScript, setCopiedScript] = useState(false);
  const [patientNote, setPatientNote] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handoverData = useMemo(() => getClinicalHandoverData(), []);

  const filtered = useMemo(() => {
    return PROFESSIONAL_SERVICES.filter((service: ProfessionalService) => {
      if (search && !service.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (province && service.province !== province) return false;
      if (serviceType && service.type !== serviceType) return false;
      if (onlineOnly && !service.online) return false;
      if (bpjsOnly && !service.bpjs) return false;
      return true;
    });
  }, [search, province, serviceType, onlineOnly, bpjsOnly]);

  const lang = i18n.language?.split('-')[0] || 'id';

  const activeScript = DOCTOR_SCRIPTS.find(s => s.id === selectedScriptId) || DOCTOR_SCRIPTS[0];

  const handleCopyScript = async () => {
    const textToCopy = t(activeScript.scriptKey, activeScript.scriptFallback);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    } catch {
      // Fallback if clipboard API denied
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  const handlePrint = () => {
    printDoctorHandoverBrief(lang, patientNote);
  };

  const handleDownload = () => {
    downloadDoctorHandoverBrief(lang, patientNote);
  };

  return (
    <div className="professional-page">
      <header>
        <h1>{t('professional.title', 'Bantuan Profesional')}</h1>
        <p>{t('professional.subtitle', 'Temukan layanan kesehatan mental profesional di Indonesia')}</p>
      </header>

      {/* View Switcher Tabs */}
      <div className="referral-nav-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'directory'}
          className={`referral-nav-btn ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          🏥 {t('referral.tab_directory', 'Direktori Layanan')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bpjs_guide'}
          className={`referral-nav-btn ${activeTab === 'bpjs_guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('bpjs_guide')}
        >
          📋 {t('referral.tab_bpjs_guide', 'Panduan BPJS & Ringkasan Dokter')}
        </button>
      </div>

      {activeTab === 'directory' && (
        <>
          {/* Filters */}
          <div className="professional-filters">
            <div className="professional-search">
              <input
                type="text"
                placeholder={t('professional.search', 'Cari layanan...')}
                aria-label={t('professional.search', 'Cari layanan...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="professional-filter-row">
              <select
                className="select"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                aria-label={t('professional.allProvinces', 'Semua Provinsi')}
              >
                <option value="">{t('professional.allProvinces', 'Semua Provinsi')}</option>
                {PROVINCES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t(`professional.provinces.${p.id}`, lang === 'en' ? p.labelEn : p.labelId)}
                  </option>
                ))}
              </select>
              <select
                className="select"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                aria-label={t('professional.allTypes', 'Semua Jenis Layanan')}
              >
                <option value="">{t('professional.allTypes', 'Semua Jenis Layanan')}</option>
                {SERVICE_TYPES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {t(`professional.types.${st.id}`, lang === 'en' ? st.labelEn : st.labelId)}
                  </option>
                ))}
              </select>
            </div>
            <div className="professional-toggles">
              <label>
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                />{' '}
                {t('professional.onlineOnly', 'Online saja')}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={bpjsOnly}
                  onChange={(e) => setBpjsOnly(e.target.checked)}
                />{' '}
                {t('professional.bpjsOnly', 'BPJS')}
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="professional-results">
            <p className="professional-count">
              {t('professional.servicesCount', '{{count}} layanan', { count: filtered.length })}
            </p>
            {filtered.map((service: ProfessionalService) => (
              <div className="professional-card" key={service.id}>
                <div className="professional-card-header">
                  <h3>{service.name}</h3>
                  <span className="badge badge-primary">
                    {t(`professional.types.${service.type}`, service.type)}
                  </span>
                </div>
                <p className="professional-card-location">
                  {service.city}, {service.province}
                </p>
                <p className="professional-card-desc">
                  {t(
                    `professional.services.${service.id}.desc`,
                    lang === 'en' ? service.descriptionEn : service.descriptionId
                  )}
                </p>
                <div className="professional-card-badges">
                  {service.online && (
                    <span className="badge badge-secondary">
                      {t('professional.onlineBadge', 'Online')}
                    </span>
                  )}
                  {service.bpjs && (
                    <span className="badge badge-bpjs">
                      {t('professional.bpjsBadge', 'BPJS')}
                    </span>
                  )}
                </div>
                <div className="professional-card-actions">
                  {service.phone && (
                    <a href={`tel:${service.phone}`} className="btn btn-sm btn-primary">
                      📞 {t('professional.call', 'Telepon')}
                    </a>
                  )}
                  {service.website && (
                    <a
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-secondary"
                    >
                      🌐 {t('professional.website', 'Website')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="professional-disclaimer">
            {t(
              'professional.disclaimer',
              'RIMA tidak terafiliasi dengan layanan di atas. Informasi disediakan sebagai referensi umum.'
            )}
          </p>
        </>
      )}

      {activeTab === 'bpjs_guide' && (
        <div className="referral-guide-container">
          {/* Hero Banner */}
          <div className="referral-hero-card">
            <span className="referral-hero-badge">
              💚 {t('referral.bpjs_badge_free', '100% Ditanggung BPJS')}
            </span>
            <h2>{t('referral.guide_hero_title', 'Panduan Berobat Kesehatan Mental dengan BPJS')}</h2>
            <p>
              {t(
                'referral.guide_hero_desc',
                'Banyak orang belum tahu bahwa konsultasi psikiatri, psikoterapi, dan obat kesehatan jiwa 100% ditanggung BPJS Kesehatan di Puskesmas dan RSUD.'
              )}
            </p>
          </div>

          {/* 3-Step Referral Workflow */}
          <div>
            <h3 className="referral-section-title">
              🗺️ {t('referral.workflow_title', 'Alur Rujukan 3 Langkah')}
            </h3>
            <div className="referral-workflow-grid">
              {BPJS_STEPS.map((step) => (
                <div className="referral-step-card" key={step.number}>
                  <div className="referral-step-header">
                    <span className="referral-step-num">{step.number}</span>
                    <span className="referral-step-title">
                      {t(step.titleKey, step.titleFallback)}
                    </span>
                  </div>
                  <p className="referral-step-desc">{t(step.descKey, step.descFallback)}</p>
                  <ul className="referral-step-items">
                    {step.checklistKey.map((itemKey, idx) => (
                      <li key={itemKey}>{t(itemKey, step.checklistFallback[idx])}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Conversation Scripts */}
          <div className="referral-scripts-box">
            <h3 className="referral-section-title">
              💬 {t('referral.scripts_title', 'Skrip Percakapan dengan Dokter Puskesmas')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t(
                'referral.scripts_subtitle',
                'Merasa canggung atau bingung harus bicara apa? Gunakan atau salin kalimat di bawah ini untuk disampaikan ke dokter umum:'
              )}
            </p>

            <div className="referral-script-pills" role="tablist">
              {DOCTOR_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  type="button"
                  className={`referral-script-pill ${selectedScriptId === script.id ? 'active' : ''}`}
                  onClick={() => setSelectedScriptId(script.id)}
                >
                  {t(script.categoryKey, script.categoryFallback)}
                </button>
              ))}
            </div>

            <div className="referral-script-content">
              "{t(activeScript.scriptKey, activeScript.scriptFallback)}"
            </div>

            <div className="referral-script-actions">
              <button
                type="button"
                className="referral-copy-btn"
                onClick={handleCopyScript}
              >
                📋 {copiedScript ? t('referral.copied', 'Skrip tersalin!') : t('referral.copy_script', 'Salin Skrip')}
              </button>
              {copiedScript && (
                <span className="referral-toast">✓ {t('referral.copied', 'Skrip tersalin!')}</span>
              )}
            </div>
          </div>

          {/* Clinical Handover Brief Generator */}
          <div className="referral-handover-card">
            <h3 className="referral-section-title">
              🖨️ {t('referral.handover_title', 'Cetak Lembar Ringkasan Klinis untuk Dokter')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              {t(
                'referral.handover_subtitle',
                'Dokter umum di Puskesmas memiliki waktu terbatas. Lembar ringkasan A4 ini merangkum skor skrining dan tren suasana hatimu agar dokter dapat memahami kondisimu secara cepat.'
              )}
            </p>

            <div className="referral-handover-metrics">
              <div className="referral-metric-box">
                <div className="referral-metric-label">{t('referral.metric_phq9', 'Skrining PHQ-9')}</div>
                <div className="referral-metric-value">
                  {handoverData.latestPhq9
                    ? `${handoverData.latestPhq9.score}/27 (${formatSeverityLabel(handoverData.latestPhq9.severity, lang === 'en')})`
                    : t('referral.no_data', 'Belum terisi')}
                </div>
              </div>
              <div className="referral-metric-box">
                <div className="referral-metric-label">{t('referral.metric_gad7', 'Skrining GAD-7')}</div>
                <div className="referral-metric-value">
                  {handoverData.latestGad7
                    ? `${handoverData.latestGad7.score}/21 (${formatSeverityLabel(handoverData.latestGad7.severity, lang === 'en')})`
                    : t('referral.no_data', 'Belum terisi')}
                </div>
              </div>
              <div className="referral-metric-box">
                <div className="referral-metric-label">{t('referral.metric_who5', 'Indeks WHO-5')}</div>
                <div className="referral-metric-value">
                  {handoverData.latestWho5
                    ? `${handoverData.latestWho5.percentageScore ?? handoverData.latestWho5.score * 4}% (${handoverData.latestWho5.score}/25)`
                    : t('referral.no_data', 'Belum terisi')}
                </div>
              </div>
              <div className="referral-metric-box">
                <div className="referral-metric-label">{t('referral.metric_sleep', 'CBT-I Efisiensi Tidur')}</div>
                <div className="referral-metric-value">
                  {handoverData.sleepStats && handoverData.sleepStats.totalEntries > 0
                    ? `${handoverData.sleepStats.avgEfficiency}% (${(handoverData.sleepStats.avgSleepDurationMinutes / 60).toFixed(1)} jam)`
                    : t('referral.no_data', 'Belum terisi')}
                </div>
              </div>
              <div className="referral-metric-box">
                <div className="referral-metric-label">{t('referral.metric_mood', 'Suasana Hati 30 Hari')}</div>
                <div className="referral-metric-value">
                  {handoverData.avgMoodScore !== null
                    ? `${handoverData.avgMoodScore} / 5 (${handoverData.totalMoodLogs} entri)`
                    : t('referral.no_data', 'Belum ada data')}
                </div>
              </div>
            </div>

            <textarea
              className="referral-handover-textarea"
              placeholder={t(
                'referral.handover_note_placeholder',
                'Tambahkan catatan keluhan utama yang ingin disampaikan ke dokter (opsional)...'
              )}
              value={patientNote}
              onChange={(e) => setPatientNote(e.target.value)}
            />

            <div className="referral-handover-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsPreviewOpen(true)}
              >
                👁️ {t('referral.handover_btn_preview', 'Pratinjau Lembar Rujukan')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePrint}
              >
                🖨️ {t('referral.handover_btn_print', 'Cetak Lembar Rujukan (PDF / Print)')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownload}
              >
                ⬇️ {t('referral.handover_btn_download', 'Unduh Berkas HTML')}
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
              🔒 {t(
                'referral.handover_privacy_notice',
                'Lembar ini diproses 100% di perangkatmu dan tidak disimpan di server luar mana pun.'
              )}
            </p>
          </div>

          {/* FAQ & Patient Rights */}
          <div>
            <h3 className="referral-section-title">
              ⚖️ {t('referral.faq_title', 'Hak Pasien & Ketentuan BPJS')}
            </h3>
            <div className="referral-faq-list">
              <div className="referral-faq-item">
                <div className="referral-faq-q">{t('referral.faq_q1', 'Apakah obat psikiatri gratis?')}</div>
                <p className="referral-faq-a">
                  {t(
                    'referral.faq_a1',
                    'Ya. Obat-obatan psikotropika dan antidepresan yang masuk dalam Formularium Nasional (Fornas) ditanggung penuh oleh BPJS.'
                  )}
                </p>
              </div>
              <div className="referral-faq-item">
                <div className="referral-faq-q">
                  {t('referral.faq_q2', 'Bagaimana jika situasi darurat / krisis akut?')}
                </div>
                <p className="referral-faq-a">
                  {t(
                    'referral.faq_a2',
                    'Pada kondisi kegawatdaruratan psikiatri (misal: ideasi bunuh diri akut atau gaduh gelisah), Anda dapat langsung menuju IGD Rumah Sakit terdekat tanpa memerlukan surat rujukan FKTP.'
                  )}
                </p>
              </div>
              <div className="referral-faq-item">
                <div className="referral-faq-q">
                  {t('referral.faq_q3', 'Berapa lama masa berlaku surat rujukan?')}
                </div>
                <p className="referral-faq-a">
                  {t(
                    'referral.faq_a3',
                    'Surat rujukan online (P-Care) umumnya berlaku selama 90 hari (3 bulan) dan dapat diperpanjang oleh dokter spesialis di RSUD.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handover Brief Modal Preview */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={t('referral.preview_modal_title', 'Pratinjau Lembar Ringkasan Klinis')}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--bg-secondary, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary, #475569)',
          }}>
            💡 {t('referral.preview_hint', 'Berikut adalah format dokumen A4 yang akan dicetak atau diserahkan ke dokter pemeriksa di Puskesmas / RSUD.')}
          </div>

          {/* Paper sheet preview container */}
          <div
            className="referral-paper-preview"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '24px',
              maxHeight: '52vh',
              overflowY: 'auto',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                  {lang === 'en' ? 'Clinical Handover Brief' : 'Lembar Ringkasan Klinis & Rujukan Pasien'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {lang === 'en' ? 'Standardized Self-Monitoring Summary for General Practitioner' : 'Ringkasan Pemantauan Mandiri Terstandar untuk Dokter Pemeriksa di FKTP (Puskesmas / Klinik)'}
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium' })}
              </span>
            </div>

            {/* Purpose */}
            <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '8px 12px', fontSize: '0.8rem', color: '#0369a1', borderRadius: '0 6px 6px 0', marginBottom: '16px' }}>
              <strong>{lang === 'en' ? 'Clinical Purpose: ' : 'Tujuan Klinis: '}</strong>
              {lang === 'en'
                ? 'This brief compiles standardized patient-reported outcomes to assist primary care physicians with rapid triage and BPJS psychiatric referral processing.'
                : 'Lembar ini merangkum data penilaian mandiri terstandar pasien dari aplikasi RIMA untuk mempercepat proses anamnesis dokter umum di Puskesmas dan mempermudah penerbitan Surat Rujukan BPJS ke Poli Jiwa RSUD.'}
            </div>

            {/* Metric Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'PHQ-9 Depression Screener' : 'Skrining Depresi PHQ-9'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                  {handoverData.latestPhq9
                    ? `${handoverData.latestPhq9.score}/27 (${formatSeverityLabel(handoverData.latestPhq9.severity, lang === 'en')})`
                    : (lang === 'en' ? 'No screening recorded' : 'Belum ada data')}
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'GAD-7 Anxiety Screener' : 'Skrining Kecemasan GAD-7'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                  {handoverData.latestGad7
                    ? `${handoverData.latestGad7.score}/21 (${formatSeverityLabel(handoverData.latestGad7.severity, lang === 'en')})`
                    : (lang === 'en' ? 'No screening recorded' : 'Belum ada data')}
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'WHO-5 Well-Being Index' : 'Indeks Kesejahteraan WHO-5'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                  {handoverData.latestWho5
                    ? `${handoverData.latestWho5.percentageScore ?? handoverData.latestWho5.score * 4}% (${handoverData.latestWho5.score}/25)`
                    : (lang === 'en' ? 'No index recorded' : 'Belum ada data')}
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'Sleep Efficiency (CBT-I)' : 'Arsitektur Tidur (CBT-I)'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                  {handoverData.sleepStats && handoverData.sleepStats.totalEntries > 0
                    ? `${handoverData.sleepStats.avgEfficiency}% (${(handoverData.sleepStats.avgSleepDurationMinutes / 60).toFixed(1)} jam/malam)`
                    : (lang === 'en' ? 'No sleep logs' : 'Belum ada catatan tidur')}
                </div>
              </div>
            </div>

            {/* Longitudinal Mood & Factors */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', background: '#ffffff' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {lang === 'en' ? 'Longitudinal Mood Baseline & Factors (30 Days)' : 'Rata-rata Suasana Hati 30 Hari & Faktor Distres'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                <strong>{lang === 'en' ? 'Average Score: ' : 'Skor Rata-rata: '}</strong>
                {handoverData.avgMoodScore !== null ? `${handoverData.avgMoodScore} / 5 (${handoverData.totalMoodLogs} entri)` : '-'}
              </div>
              {handoverData.topFactors.length > 0 && (
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                  <strong>{lang === 'en' ? 'Reported Life Factors: ' : 'Faktor Distres Utama: '}</strong>
                  {handoverData.topFactors.join(', ')}
                </div>
              )}
            </div>

            {/* Patient Note Preview */}
            {patientNote.trim() && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  {lang === 'en' ? 'Patient Chief Complaint / Subjective Note:' : 'Keluhan Utama & Catatan Pasien:'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                  {patientNote}
                </div>
              </div>
            )}

            {/* Clinical Recommendation */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', background: '#ffffff', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {lang === 'en' ? 'Recommended Primary Care Action:' : 'Rekomendasi Tindak Lanjut Faskes 1 (FKTP):'}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
                {lang === 'en'
                  ? 'Based on validated psychometric indicators, comprehensive clinical evaluation and/or secondary referral (P-Care) to RSUD Psychiatric Outpatient Clinic (Poli Jiwa / Sp.KJ) is respectfully requested.'
                  : 'Berdasarkan indikator psikometrik terstandar di atas, pasien memohon evaluasi klinis komprehensif dari dokter pemeriksa dan pertimbangan penerbitan Surat Rujukan BPJS Online ke Poli Jiwa / Dokter Spesialis Kedokteran Jiwa (Sp.KJ) RSUD rujukan.'}
              </p>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              {lang === 'en'
                ? 'Generated by RIMA (Ruang Interaksi Mental Aman) — Confidential Patient Health Data — Processed 100% locally on device.'
                : 'Diterbitkan secara mandiri melalui RIMA (Ruang Interaksi Mental Aman) — Data Rahasia Pasien — 100% diproses secara lokal pada perangkat.'}
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
              {t('referral.preview_close', 'Tutup Pratinjau')}
            </Button>
            <Button variant="secondary" onClick={handleDownload}>
              ⬇️ {t('referral.handover_btn_download', 'Unduh Berkas HTML')}
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              🖨️ {t('referral.handover_btn_print', 'Cetak (Print / PDF)')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
