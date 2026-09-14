import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, SmilePlus, BookOpen, Users, User, Menu, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMood } from '../../hooks/useMood';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const { getTodayMood } = useMood();
  const todayMood = getTodayMood();

  const tabs = [
    { path: '/', icon: Home, label: 'nav.home' },
    { path: '/mood', icon: SmilePlus, label: 'nav.mood' },
    { path: '/journal', icon: BookOpen, label: 'nav.journal' },
    { path: '/forum', icon: Users, label: 'nav.forum' },
    { path: '/profile', icon: User, label: 'nav.profile' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-brand">RIMA</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{t(tab.label)}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* Dynamic mood display — replaces hardcoded static emoji */}
        <div className="sidebar-mood">
          {todayMood ? (
            <>
              <div className="sidebar-mood-emoji">{todayMood.emoji}</div>
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {t('home.todayMood', 'Mood Hari Ini')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {todayMood.score >= 4 ? '✨' : todayMood.score <= 2 ? '💙' : '🌿'} {t('home.moodLogged', 'Tercatat')}
                  </div>
                </div>
              )}
            </>
          ) : (
            <NavLink to="/mood" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
              <div className="sidebar-mood-emoji">📝</div>
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {t('sidebar.logMoodToday', 'Catat Mood Hari Ini')}
                  </div>
                </div>
              )}
            </NavLink>
          )}
        </div>

        {/* Peripheral ambient status — Calm Technology */}
        {!isCollapsed && (
          <div style={{ 
            fontSize: '0.688rem', 
            color: 'var(--text-tertiary)', 
            textAlign: 'center', 
            marginTop: 'var(--spacing-sm)',
            opacity: 0.7 
          }}>
            🟢 {t('sidebar.offlineReady', 'Offline-Ready')}
          </div>
        )}
      </div>
    </aside>
  );
};
