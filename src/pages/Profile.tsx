import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useMood } from '../hooks/useMood';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import {
  exportAllDataAsJSON,
  exportMoodsAsCSV,
  exportJournalsAsCSV,
  generateClinicalSummaryHTML,
  importDataFromJSON
} from '../utils/exportImport';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
  RefreshCw,
  Shield,
  CheckCircle,
  Database,
  Info,
  BarChart2,
  Stethoscope,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  ClipboardCheck,
  MoonStar,
  Lock,
  KeyRound,
  HardDrive,
  Feather
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SPIRITUAL_SOURCES } from '../data/spiritualContent';
import { Modal } from '../components/ui/Modal';
import { SetPinModal } from '../components/security/SetPinModal';
import { getStorageQuotaInfo, requestPersistentStorage, type StorageStatus } from '../utils/indexedDb';
import { wipeAllData } from '../utils/dataWipe';
import { AVAILABLE_LANGUAGES } from '../utils/constants';
import type { Language } from '../types';

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, lowStimulation, toggleLowStimulation } = useTheme();
  const { getMoodStats } = useMood();
  const { user, updateDisplayName, regenerateAnonymousName, isSupabaseConfigured } = useAuth();
  const {
    enabled: notifEnabled,
    reminderTime,
    quietHoursStart,
    quietHoursEnd,
    toggleNotifications,
    setReminderTime,
    setQuietHours,
    sendTestNotification
  } = useNotifications();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.displayName);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [spiritualEnabled, setSpiritualEnabled] = useLocalStorage('rima-spiritual-enabled', false);
  const [spiritualSource, setSpiritualSource] = useLocalStorage<string>('rima-spiritual-source', 'universal');
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // App Lock (4-digit PIN) states
  const [isLockEnabled] = useLocalStorage<boolean>('rima-app-lock-enabled', false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'set' | 'change' | 'disable'>('set');

  const [storageInfo, setStorageInfo] = useState<StorageStatus | null>(null);

  useEffect(() => {
    getStorageQuotaInfo().then(setStorageInfo);
  }, []);

  const handleRequestPersistence = async () => {
    const granted = await requestPersistentStorage();
    const updated = await getStorageQuotaInfo();
    setStorageInfo(updated);
    if (granted || updated.persisted) {
      showToast(t('profile.persistenceEnabledToast', 'Proteksi penyimpanan persisten aktif!'));
    } else {
      showToast(t('profile.persistenceFailedToast', 'Izin penyimpanan persisten tidak diberikan oleh peramban.'));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = getMoodStats();
  const lang = (i18n.language?.split('-')[0] || 'id') as Language;

  const handleConfirmWipe = async () => {
    setIsWiping(true);
    try {
      await wipeAllData();
      setShowWipeModal(false);
      showToast(t('dataWipe.success', 'Seluruh data lokal & cloud berhasil dihapus.'));
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (e) {
      console.error(e);
      showToast(t('common.error', 'Terjadi kesalahan'));
    } finally {
      setIsWiping(false);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateDisplayName(tempName.trim());
      setIsEditingName(false);
      showToast(t('profile.nameUpdated', 'Nama tampilan diperbarui!'));
    }
  };

  const handleRegenerate = () => {
    regenerateAnonymousName();
    showToast(t('profile.nameRegenerated', 'Nama anonim baru dibuat!'));
  };

  const handleExportMoods = () => {
    const ok = exportMoodsAsCSV(i18n.language);
    if (ok) {
      showToast(t('profile.exportMoodsSuccess', 'Laporan mood CSV berhasil diunduh!'));
    } else {
      showToast(t('profile.noMoodsToExport', 'Belum ada data mood untuk diekspor.'));
    }
  };

  const handleExportJournals = () => {
    const ok = exportJournalsAsCSV(i18n.language);
    if (ok) {
      showToast(t('profile.exportJournalsSuccess', 'Laporan jurnal CSV berhasil diunduh!'));
    } else {
      showToast(t('profile.noJournalsToExport', 'Belum ada entri jurnal untuk diekspor.'));
    }
  };

  const handleExportClinical = () => {
    const ok = generateClinicalSummaryHTML(i18n.language);
    if (ok) {
      showToast(t('profile.exportClinicalSuccess', 'Laporan klinis HTML berhasil dibuat!'));
    } else {
      showToast(t('profile.noClinicalDataToExport', 'Belum ada data mood atau jurnal yang cukup.'));
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (content) {
          const result = importDataFromJSON(content);
          showToast(result.message);
        }
      } catch (err) {
        showToast(t('common.error', 'Terjadi kesalahan saat membaca file'));
        console.error('Import file error:', err);
      }
    };
    reader.onerror = () => {
      showToast(t('common.error', 'Gagal membaca file'));
    };
    reader.readAsText(file);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleLock = () => {
    if (isLockEnabled) {
      setPinModalMode('disable');
    } else {
      setPinModalMode('set');
    }
    setPinModalOpen(true);
  };

  const handleChangePin = () => {
    setPinModalMode('change');
    setPinModalOpen(true);
  };

  const handleLockNow = () => {
    sessionStorage.removeItem('rima-app-unlocked');
    window.dispatchEvent(new Event('local-storage'));
    showToast(t('appLock.lockedToast', 'Aplikasi telah dikunci.'));
  };

  const handlePinModalSuccess = () => {
    if (pinModalMode === 'set') {
      showToast(t('appLock.pinSetSuccess', 'PIN berhasil diatur!'));
    } else if (pinModalMode === 'change') {
      showToast(t('appLock.pinChangedSuccess', 'PIN berhasil diubah!'));
    } else if (pinModalMode === 'disable') {
      showToast(t('appLock.pinDisabledSuccess', 'Kunci PIN berhasil dinonaktifkan.'));
    }
  };

  return (
    <div className="profile-page">
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border-strong)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircle size={18} style={{ color: 'var(--color-secondary)' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          {user.displayName.charAt(0).toUpperCase()}
        </div>

        {isEditingName ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="profile-name-input"
            />
            <Button variant="primary" size="sm" onClick={handleSaveName}>
              {t('common.save', 'Simpan')}
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="profile-name">{user.displayName}</h1>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => { setTempName(user.displayName); setIsEditingName(true); }}
              title={t('profile.editName', 'Edit nama')}
            >
              ✏️
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleRegenerate}
              title={t('profile.regenerateName', 'Generate Nama Anonim Baru')}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
          <Shield size={14} style={{ color: 'var(--color-secondary)' }} />
          <span>{t('profile.anonBadge', 'Profil Anonim Aman • Terjaga di Perangkat')}</span>
        </div>
      </div>

      <div className="profile-stats">
        <Card className="stat-card">
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">{t('profile.totalMoods', 'Total Log Mood')}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-warm)' }}>{stats.streak}🔥</div>
          <div className="stat-label">{t('profile.streakDays', 'Hari Berturut')}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>{stats.average || '-'}</div>
          <div className="stat-label">{t('profile.avgMood', 'Rata-rata Mood')}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
            {stats.trend === 'improving' ? '📈 ' + t('mood.improving', 'Membaik') : stats.trend === 'declining' ? '📉 ' + t('mood.declining', 'Menurun') : '➖ ' + t('mood.stable', 'Stabil')}
          </div>
          <div className="stat-label">{t('profile.trend', 'Tren 30 Hari')}</div>
        </Card>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.appSettings', 'TAMPILAN & BAHASA')}</h2>
        <div className="settings-list">
          <button className="settings-item" type="button" onClick={toggleTheme}>
            <div className="settings-item-left">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{t('profile.theme', 'Tema Aplikasi')}</span>
            </div>
            <div className="settings-item-right">
              <span style={{ fontWeight: 600, marginRight: '12px' }}>
                {theme === 'dark' ? t('profile.darkMode', 'Mode Gelap') : t('profile.lightMode', 'Mode Terang')}
              </span>
              <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`} />
            </div>
          </button>

          <button
            className="settings-item"
            type="button"
            onClick={toggleLowStimulation}
            aria-pressed={lowStimulation}
          >
            <div className="settings-item-left" style={{ alignItems: 'flex-start' }}>
              <Feather size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>{t('profile.sensoryTitle', 'Mode Sensori Tenang (Low-Stimulation)')}</span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.688rem', padding: '2px 6px' }}>
                    {t('profile.sensoryBadge', 'Neuro-Inklusif')}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {t('profile.sensoryDesc', 'Meredakan saturasi warna, mematikan seluruh animasi/transisi, dan mereduksi silau untuk kenyamanan sensorik (ADHD & Sensory Overload).')}
                </p>
              </div>
            </div>
            <div className="settings-item-right" style={{ flexShrink: 0, marginLeft: '12px' }}>
              <span style={{ fontWeight: 600, marginRight: '12px' }}>
                {lowStimulation ? t('common.on', 'ON') : t('common.off', 'OFF')}
              </span>
              <div className={`toggle-switch ${lowStimulation ? 'active' : ''}`} />
            </div>
          </button>

          <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="settings-item-left">
                <Globe size={18} />
                <span>{t('profile.language', 'Bahasa (Language)')}</span>
              </div>
              <span className="badge badge-primary">
                {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.flag} {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.nativeName || lang}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', width: '100%' }}>
              {AVAILABLE_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`btn btn-sm ${lang === item.code ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 6px',
                    fontSize: '0.813rem',
                    border: lang === item.code ? 'none' : '1px solid var(--border-subtle)'
                  }}
                  onClick={() => i18n.changeLanguage(item.code)}
                >
                  <span aria-hidden="true">{item.flag}</span>
                  <span>{item.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spiritual Content */}
          <Card>
            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <span className="profile-setting-label">{t('profile.spiritualContent', 'Konten Spiritual')}</span>
                <span className="profile-setting-desc">{t('profile.spiritualDesc', 'Tampilkan doa dan refleksi spiritual')}</span>
              </div>
              <button className={`btn btn-sm ${spiritualEnabled ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSpiritualEnabled(!spiritualEnabled)}>
                {spiritualEnabled ? t('common.on', 'ON') : t('common.off', 'OFF')}
              </button>
            </div>
            {spiritualEnabled && (
              <div className="profile-spiritual-sources">
                {SPIRITUAL_SOURCES.map(source => (
                  <button
                    key={source.id}
                    className={`chip ${spiritualSource === source.id ? 'chip-active' : ''}`}
                    onClick={() => setSpiritualSource(source.id)}
                  >
                    {source.icon} {lang === 'en' ? source.labelEn : source.labelId}
                  </button>
                ))}
              </div>
            )}
          </Card>
          
          <div style={{ marginTop: '12px' }}>
            <Card onClick={() => navigate('/analytics')} className="clickable">
              <div className="profile-setting-item">
                <BarChart2 size={20} />
                <span className="profile-setting-label">{t('profile.analytics', 'Dashboard Analytics')}</span>
              </div>
            </Card>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <Card onClick={() => navigate('/professional-help')} className="clickable">
              <div className="profile-setting-item">
                <Stethoscope size={20} />
                <span className="profile-setting-label">{t('profile.professionalHelp', 'Bantuan Profesional')}</span>
              </div>
            </Card>
          </div>

          <div style={{ marginTop: '12px' }}>
            <Card onClick={() => navigate('/assessment')} className="clickable">
              <div className="profile-setting-item">
                <ClipboardCheck size={20} />
                <span className="profile-setting-label">{t('profile.assessment', 'Skrining Mandiri (PHQ-9 & GAD-7)')}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.notificationsTitle', 'PENGINGAT HARIAN & NOTIFIKASI')}</h2>
        <div className="settings-list">
          <button className="settings-item" type="button" onClick={toggleNotifications}>
            <div className="settings-item-left">
              <Bell size={18} />
              <span>{t('profile.dailyReminder', 'Pengingat Mood Harian')}</span>
            </div>
            <div className="settings-item-right">
              <div className={`toggle-switch ${notifEnabled ? 'active' : ''}`} />
            </div>
          </button>

          {notifEnabled && (
            <>
              <div className="settings-item" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="settings-item-left">
                  <span style={{ fontSize: '0.875rem' }}>{t('profile.reminderTime', 'Waktu Pengingat:')}</span>
                </div>
                <div className="settings-item-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="time"
                    className="input"
                    style={{ padding: '4px 8px', fontSize: '0.875rem', width: 'auto' }}
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                  <Button variant="ghost" size="sm" onClick={sendTestNotification}>
                    {t('profile.testNotif', 'Uji Notifikasi')}
                  </Button>
                </div>
              </div>

              <div className="settings-item" style={{ backgroundColor: 'var(--bg-secondary)', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  <MoonStar size={16} style={{ color: 'var(--color-primary)' }} />
                  <strong>{t('profile.quietHours', 'Jam Tenang (Quiet Hours)')}</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                  {t('profile.quietHoursDesc', 'Notifikasi diredam otomatis saat jam tidur untuk melindungi siklus istirahat Anda.')}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>{t('common.start', 'Mulai')}:</span>
                  <input
                    type="time"
                    className="input"
                    style={{ padding: '4px 8px', fontSize: '0.813rem', width: 'auto' }}
                    value={quietHoursStart}
                    onChange={(e) => setQuietHours(e.target.value, quietHoursEnd)}
                  />
                  <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>{t('common.end', 'Selesai')}:</span>
                  <input
                    type="time"
                    className="input"
                    style={{ padding: '4px 8px', fontSize: '0.813rem', width: 'auto' }}
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHours(quietHoursStart, e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.backupExport', 'EKSPOR, IMPOR & CADANGAN DATA')}</h2>
        <div className="settings-list">
          <div 
            className="settings-item" 
            role="button" 
            tabIndex={0} 
            onClick={exportAllDataAsJSON}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') exportAllDataAsJSON(); }}
          >
            <div className="settings-item-left">
              <Download size={18} />
              <span>{t('profile.exportJSON', 'Ekspor Cadangan Lengkap (JSON)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<Download size={14} />} tabIndex={-1}>
                {t('common.download', 'Unduh')}
              </Button>
            </div>
          </div>

          <div 
            className="settings-item" 
            role="button" 
            tabIndex={0} 
            onClick={handleExportMoods}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExportMoods(); }}
          >
            <div className="settings-item-left">
              <FileSpreadsheet size={18} />
              <span>{t('profile.exportCSV', 'Ekspor Laporan Mood ke Terapis (CSV)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<FileSpreadsheet size={14} />} tabIndex={-1}>
                CSV
              </Button>
            </div>
          </div>

          <div 
            className="settings-item" 
            role="button" 
            tabIndex={0} 
            onClick={handleExportJournals}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExportJournals(); }}
          >
            <div className="settings-item-left">
              <FileText size={18} />
              <span>{t('profile.exportJournalsCSV', 'Ekspor Catatan Jurnal (CSV)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<FileText size={14} />} tabIndex={-1}>
                CSV
              </Button>
            </div>
          </div>

          <div 
            className="settings-item" 
            role="button" 
            tabIndex={0} 
            onClick={handleExportClinical}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExportClinical(); }}
          >
            <div className="settings-item-left">
              <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
              <span>{t('profile.exportClinicalHTML', 'Ekspor Ringkasan Klinis untuk Terapis (HTML)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<Download size={14} />} tabIndex={-1}>
                HTML
              </Button>
            </div>
          </div>

          <div 
            className="settings-item" 
            role="button" 
            tabIndex={0} 
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          >
            <div className="settings-item-left">
              <Upload size={18} />
              <span>{t('profile.importJSON', 'Pulihkan Data dari File JSON')}</span>
            </div>
            <div className="settings-item-right">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleImportFile}
              />
              <Button variant="ghost" size="sm" icon={<Upload size={14} />} tabIndex={-1}>
                {t('profile.selectFile', 'Pilih File')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.backendStatus', 'STATUS BACKEND & SINKRONISASI')}</h2>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-left">
              <Database size={18} />
              <span>{t('profile.supabaseStorage', 'Penyimpanan Supabase')}</span>
            </div>
            <div className="settings-item-right">
              <span className={`badge ${isSupabaseConfigured ? 'badge-primary' : 'badge-secondary'}`}>
                {isSupabaseConfigured ? t('profile.connected', '⚡ Connected') : t('profile.localMode', '🔒 Mode Lokal (Offline-first)')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.storageTitle', 'PENYIMPANAN PERSISTEN & KETAHANAN DATA')}</h2>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-left">
              <HardDrive size={18} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600 }}>{t('profile.storageType', 'Tipe Penyimpanan Data')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {t('profile.storageTypeDesc', 'IndexedDB offline-first dengan kapasitas tinggi & proteksi data lokal')}
                </span>
              </div>
            </div>
            <div className="settings-item-right">
              <span className="badge badge-primary">
                {storageInfo?.isIndexedDbSupported ? 'IndexedDB (Active)' : 'localStorage'}
              </span>
            </div>
          </div>

          <div className="settings-item">
            <div className="settings-item-left">
              <ShieldCheck
                size={18}
                style={{ color: storageInfo?.persisted ? 'var(--color-secondary)' : 'var(--color-warm)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600 }}>{t('profile.persistenceStatus', 'Status Proteksi OS (Storage Persistence)')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {storageInfo?.persisted
                    ? t('profile.persistedActive', 'Terlindungi dari pembersihan otomatis oleh browser/iOS')
                    : t('profile.persistedInactive', 'Belum berstatus persisten penuh')}
                </span>
              </div>
            </div>
            <div className="settings-item-right">
              {storageInfo && !storageInfo.persisted ? (
                <Button variant="secondary" size="sm" onClick={handleRequestPersistence}>
                  {t('profile.btnEnablePersistence', 'Aktifkan Persisten')}
                </Button>
              ) : (
                <span className="badge badge-primary">✓ Persisted</span>
              )}
            </div>
          </div>

          {storageInfo && storageInfo.quotaMB > 0 && (
            <div className="settings-item">
              <div className="settings-item-left">
                <Database size={18} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600 }}>{t('profile.quotaUsage', 'Kapasitas Penyimpanan Digunakan')}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {storageInfo.usedMB} MB / {storageInfo.quotaMB} MB ({storageInfo.availableMB} MB tersedia)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('appLock.sectionTitle', 'KEAMANAN & KUNCI APLIKASI (APP LOCK)')}</h2>
        <div className="settings-list">
          <button className="settings-item" type="button" onClick={handleToggleLock}>
            <div className="settings-item-left">
              <Lock size={18} style={{ color: isLockEnabled ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600 }}>{t('appLock.title', 'Kunci Aplikasi (PIN 4-Digit)')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {t('appLock.desc', 'Lindungi privasi jurnal dan data Anda saat perangkat digunakan orang lain.')}
                </span>
              </div>
            </div>
            <div className="settings-item-right">
              <div className={`toggle-switch ${isLockEnabled ? 'active' : ''}`} />
            </div>
          </button>

          {isLockEnabled && (
            <>
              <div 
                className="settings-item" 
                role="button" 
                tabIndex={0} 
                onClick={handleChangePin}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleChangePin(); }}
              >
                <div className="settings-item-left">
                  <KeyRound size={18} />
                  <span>{t('appLock.changePin', 'Ubah PIN')}</span>
                </div>
                <div className="settings-item-right">
                  <Button variant="ghost" size="sm" tabIndex={-1}>
                    {t('common.edit', 'Ubah')}
                  </Button>
                </div>
              </div>

              <div 
                className="settings-item" 
                role="button" 
                tabIndex={0} 
                onClick={handleLockNow}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLockNow(); }}
              >
                <div className="settings-item-left">
                  <Shield size={18} style={{ color: 'var(--color-warning)' }} />
                  <span>{t('appLock.lockNow', 'Kunci Sekarang')}</span>
                </div>
                <div className="settings-item-right">
                  <Button variant="ghost" size="sm" tabIndex={-1}>
                    {t('appLock.lockNowBtn', 'Kunci')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.privacyTitle', 'HAK DATA & KEBIJAKAN PRIVASI (UU PDP)')}</h2>
        <div className="settings-list">
          <div 
            className="settings-item" 
            role="button" 
            tabIndex={0} 
            onClick={() => navigate('/privacy')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/privacy'); }}
          >
            <div className="settings-item-left">
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
              <span>{t('profile.privacyPolicyLink', 'Kebijakan Privasi & Hak Pengguna')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" tabIndex={-1}>
                {t('common.view', 'Lihat')}
              </Button>
            </div>
          </div>

          <button className="settings-item" type="button" onClick={() => setShowWipeModal(true)}>
            <div className="settings-item-left">
              <Trash2 size={18} style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--color-danger)' }}>{t('profile.wipeDataBtn', 'Hapus Seluruh Data Permanen')}</span>
            </div>
            <div className="settings-item-right">
              <span className="badge" style={{ background: 'hsla(0, 65%, 55%, 0.15)', color: 'var(--color-danger)' }}>
                {t('profile.irreversible', 'Permanen')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Wipe Confirmation Modal */}
      {showWipeModal && (
        <Modal
          isOpen={showWipeModal}
          onClose={() => setShowWipeModal(false)}
          title={t('dataWipe.confirmTitle', 'Konfirmasi Penghapusan Data')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'hsla(0, 65%, 55%, 0.1)', padding: '12px', borderRadius: '10px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                {t('dataWipe.warningDesc', 'Tindakan ini akan menghapus seluruh catatan mood, entri jurnal, rencana keselamatan, dan pengaturan Anda dari perangkat ini dan server. Tindakan ini TIDAK dapat dibatalkan.')}
              </p>
            </div>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', margin: 0 }}>
              {t('dataWipe.recommendExport', 'Disarankan untuk mengekspor cadangan data JSON terlebih dahulu jika Anda ingin menyimpannya.')}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setShowWipeModal(false)} disabled={isWiping}>
                {t('common.cancel', 'Batal')}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmWipe}
                disabled={isWiping}
                style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                icon={<Trash2 size={16} />}
              >
                {isWiping ? t('common.loading', 'Memuat...') : t('dataWipe.confirmDelete', 'Ya, Hapus Semua')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Set/Change PIN Modal */}
      {pinModalOpen && (
        <SetPinModal
          isOpen={pinModalOpen}
          onClose={() => setPinModalOpen(false)}
          mode={pinModalMode}
          onSuccess={handlePinModalSuccess}
        />
      )}

      <div className="about-section">
        <div className="about-logo">RIMA</div>
        <div className="about-version">{t('profile.version', 'Ruang Interaksi Mental Aman v1.0.0 (Fase 2)')}</div>
        <p style={{ marginTop: '8px', fontSize: '0.813rem' }}>
          {t('profile.aboutDesc', 'Dibuat berdasarkan riset kesehatan mental berbasis bukti ilmiah untuk masyarakat Indonesia.')}
        </p>

        <div className="about-disclaimer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
            <Info size={16} /> {t('profile.disclaimer', 'Disclaimer Penting')}
          </div>
          {t('safety.disclaimer')}
        </div>
      </div>
    </div>
  );
};
