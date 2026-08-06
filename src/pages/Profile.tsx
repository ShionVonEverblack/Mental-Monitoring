import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Moon, Sun, Globe, Heart, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMood } from '../hooks/useMood';
import { useNavigate } from 'react-router-dom';

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
    <div className="profile-page animate-fade-in-up">
      <header>
        <h1>{t('profile.title', 'Profil')}</h1>
      </header>

      <section className="profile-header-card">
        <Card className="text-center">
          <div className="avatar-large mx-auto bg-primary text-white">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          
          {isEditingName ? (
            <div className="mt-4 flex gap-2 justify-center">
              <input 
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="input-text text-center w-48"
              />
              <Button size="sm" onClick={() => setIsEditingName(false)}>OK</Button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-2">
              <h2 className="m-0">{displayName}</h2>
              <button className="text-secondary" onClick={() => setIsEditingName(true)}>
                <User size={16} />
              </button>
            </div>
          )}
        </Card>
      </section>

      <section className="stats-grid mt-6">
        <Card className="stat-card">
          <div className="stat-value text-primary">{stats.totalEntries}</div>
          <div className="stat-label">{t('profile.totalMoods', { defaultValue: 'Mood Dicatat' })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value text-secondary">{journals.length}</div>
          <div className="stat-label">{t('profile.totalJournals', { defaultValue: 'Jurnal Ditulis' })}</div>
        </Card>
        <Card className="stat-card col-span-2">
          <div className="stat-value text-warm">{stats.streak} 🔥</div>
          <div className="stat-label">{t('profile.currentStreak', { defaultValue: 'Streak Saat Ini' })}</div>
        </Card>
      </section>

      <section className="settings-section mt-8">
        <h3>{t('profile.settings', { defaultValue: 'Pengaturan' })}</h3>
        
        <Card className="settings-list p-0 overflow-hidden">
          <div className="setting-item flex-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{t('profile.theme', { defaultValue: 'Tema Gelap' })}</span>
            </div>
            <button 
              className={`toggle-switch ${theme === 'dark' ? 'on' : 'off'}`}
              onClick={toggleTheme}
            >
              <div className="toggle-knob"></div>
            </button>
          </div>
          
          <div className="setting-item flex-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Globe size={20} />
              <span>{t('profile.language', { defaultValue: 'Bahasa' })}</span>
            </div>
            <button className="chip" onClick={toggleLanguage}>
              {i18n.language === 'id' ? 'ID' : 'EN'}
            </button>
          </div>

          <div 
            className="setting-item flex-between p-4 interactive text-danger"
            onClick={() => navigate('/safety-plan')}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert size={20} />
              <span>{t('profile.safetyPlan', { defaultValue: 'Rencana Keselamatan' })}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="about-section mt-8 text-center text-secondary text-sm">
        <Heart size={24} className="mx-auto mb-2 text-primary opacity-50" />
        <p>RIMA (Ruang Interaksi Mental Aman) v1.0.0</p>
        <p className="mt-2 text-danger-soft">
          {t('profile.disclaimer', { defaultValue: 'RIMA bukan pengganti layanan kesehatan profesional. Hubungi profesional jika Anda dalam krisis.' })}
        </p>
      </section>
    </div>
  );
};
