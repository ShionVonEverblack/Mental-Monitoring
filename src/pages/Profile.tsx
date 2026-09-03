import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useMood } from '../hooks/useMood';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import {
  exportAllDataAsJSON,
  exportMoodsAsCSV,
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
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SPIRITUAL_SOURCES } from '../data/spiritualContent';
import { Modal } from '../components/ui/Modal';
import { wipeAllData } from '../utils/dataWipe';

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { getMoodStats } = useMood();
  const { user, updateDisplayName, regenerateAnonymousName, isSupabaseConfigured } = useAuth();
  const { enabled: notifEnabled, reminderTime, toggleNotifications, setReminderTime, sendTestNotification } = useNotifications();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.displayName);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [spiritualEnabled, setSpiritualEnabled] = useLocalStorage('rima-spiritual-enabled', false);
  const [spiritualSource, setSpiritualSource] = useLocalStorage<string>('rima-spiritual-source', 'universal');
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = getMoodStats();
  const lang = i18n.language as 'id' | 'en' | 'jv';

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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

          <div className="settings-item">
            <div className="settings-item-left">
              <Globe size={18} />
              <span>{t('profile.language', 'Bahasa (Language)')}</span>
            </div>
            <div className="settings-item-right" style={{ display: 'flex', gap: '4px' }}>
              {(['id', 'en', 'jv'] as const).map((langCode) => (
                <button
                  key={langCode}
                  className={`btn btn-sm ${lang === langCode ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => i18n.changeLanguage(langCode)}
                >
                  {langCode === 'id' ? 'Indonesia' : langCode === 'en' ? 'English' : 'Basa Jawa'}
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
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.backupExport', 'EKSPOR, IMPOR & CADANGAN DATA')}</h2>
        <div className="settings-list">
          <button className="settings-item" type="button" onClick={exportAllDataAsJSON}>
            <div className="settings-item-left">
              <Download size={18} />
              <span>{t('profile.exportJSON', 'Ekspor Cadangan Lengkap (JSON)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                {t('common.download', 'Unduh')}
              </Button>
            </div>
          </button>

          <button className="settings-item" type="button" onClick={exportMoodsAsCSV}>
            <div className="settings-item-left">
              <FileSpreadsheet size={18} />
              <span>{t('profile.exportCSV', 'Ekspor Laporan Mood ke Terapis (CSV)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<FileSpreadsheet size={14} />}>
                CSV
              </Button>
            </div>
          </button>

          <button className="settings-item" type="button" onClick={() => fileInputRef.current?.click()}>
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
              <Button variant="ghost" size="sm" icon={<Upload size={14} />}>
                {t('profile.selectFile', 'Pilih File')}
              </Button>
            </div>
          </button>
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
        <h2 className="settings-title">{t('profile.privacyTitle', 'HAK DATA & KEBIJAKAN PRIVASI (UU PDP)')}</h2>
        <div className="settings-list">
          <button className="settings-item" type="button" onClick={() => navigate('/privacy')}>
            <div className="settings-item-left">
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
              <span>{t('profile.privacyPolicyLink', 'Kebijakan Privasi & Hak Pengguna')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm">
                {t('common.view', 'Lihat')}
              </Button>
            </div>
          </button>

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
