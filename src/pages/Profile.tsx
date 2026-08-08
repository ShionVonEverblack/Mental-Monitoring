import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMood } from '../hooks/useMood';

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { getMoodStats } = useMood();
  const stats = getMoodStats();
  const [journals] = useLocalStorage<any[]>('rima-journals', []);
  const [displayName, setDisplayName] = useLocalStorage('rima-display-name', 'Anonim');
  const [isEditingName, setIsEditingName] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar">
          {displayName.substring(0, 2).toUpperCase()}
        </div>
        
        {isEditingName ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', marginTop: 'var(--spacing-sm)' }}>
            <input 
              type="text" 
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
            <button className="btn-primary" onClick={() => setIsEditingName(false)}>OK</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
            <h2 className="profile-name">{displayName}</h2>
            <button onClick={() => setIsEditingName(true)}>✏️</button>
          </div>
        )}
      </header>

      <section className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">{t('profile.totalMoods', { defaultValue: 'Mood Dicatat' })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{journals.length}</div>
          <div className="stat-label">{t('profile.totalJournals', { defaultValue: 'Jurnal Ditulis' })}</div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-value">{stats.streak} 🔥</div>
          <div className="stat-label">{t('profile.currentStreak', { defaultValue: 'Streak Saat Ini' })}</div>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-title">{t('profile.settings', { defaultValue: 'Pengaturan' })}</h3>
        
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-left">
              <span>{t('profile.theme', { defaultValue: 'Tema Gelap' })}</span>
            </div>
            <div className="settings-item-right">
              <button 
                className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
              >
                <div className="toggle-knob"></div>
              </button>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <span>{t('profile.language', { defaultValue: 'Bahasa' })}</span>
            </div>
            <div className="settings-item-right">
              <button className="btn-secondary" onClick={toggleLanguage}>
                {i18n.language === 'id' ? 'ID' : 'EN'}
              </button>
            </div>
          </div>

          <div className="settings-item" onClick={() => navigate('/safety-plan')} style={{ cursor: 'pointer' }}>
            <div className="settings-item-left text-danger">
              <span>{t('profile.safetyPlan', { defaultValue: 'Rencana Keselamatan' })}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-logo">❤️</div>
        <p className="about-version">RIMA (Ruang Interaksi Mental Aman) v1.0.0</p>
        <p className="about-disclaimer">
          {t('profile.disclaimer', { defaultValue: 'RIMA bukan pengganti layanan kesehatan profesional. Hubungi profesional jika Anda dalam krisis.' })}
        </p>
      </section>
    </div>
  );
};
