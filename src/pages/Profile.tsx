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
  Info
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { getMoodStats } = useMood();
  const { user, updateDisplayName, regenerateAnonymousName, isSupabaseConfigured } = useAuth();
  const { enabled: notifEnabled, reminderTime, toggleNotifications, setReminderTime, sendTestNotification } = useNotifications();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.displayName);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = getMoodStats();
  const lang = i18n.language as 'id' | 'en';

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

  const handleLanguageChange = (newLang: 'id' | 'en') => {
    i18n.changeLanguage(newLang);
    showToast(t('profile.langChanged', newLang === 'id' ? 'Bahasa diubah ke Bahasa Indonesia' : 'Language changed to English'));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJSON(content);
        showToast(result.message);
      }
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
          <div className="settings-item" onClick={toggleTheme}>
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
          </div>

          <div className="settings-item">
            <div className="settings-item-left">
              <Globe size={18} />
              <span>{t('profile.language', 'Bahasa (Language)')}</span>
            </div>
            <div className="settings-item-right" style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`btn btn-sm ${lang === 'id' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleLanguageChange('id')}
              >
                ID 🇮🇩
              </button>
              <button
                className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleLanguageChange('en')}
              >
                EN 🇬🇧
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">{t('profile.notificationsTitle', 'PENGINGAT HARIAN & NOTIFIKASI')}</h2>
        <div className="settings-list">
          <div className="settings-item" onClick={toggleNotifications}>
            <div className="settings-item-left">
              <Bell size={18} />
              <span>{t('profile.dailyReminder', 'Pengingat Mood Harian')}</span>
            </div>
            <div className="settings-item-right">
              <div className={`toggle-switch ${notifEnabled ? 'active' : ''}`} />
            </div>
          </div>

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
          <div className="settings-item" onClick={exportAllDataAsJSON}>
            <div className="settings-item-left">
              <Download size={18} />
              <span>{t('profile.exportJSON', 'Ekspor Cadangan Lengkap (JSON)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                {t('common.download', 'Unduh')}
              </Button>
            </div>
          </div>

          <div className="settings-item" onClick={exportMoodsAsCSV}>
            <div className="settings-item-left">
              <FileSpreadsheet size={18} />
              <span>{t('profile.exportCSV', 'Ekspor Laporan Mood ke Terapis (CSV)')}</span>
            </div>
            <div className="settings-item-right">
              <Button variant="ghost" size="sm" icon={<FileSpreadsheet size={14} />}>
                CSV
              </Button>
            </div>
          </div>

          <div className="settings-item" onClick={() => fileInputRef.current?.click()}>
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
