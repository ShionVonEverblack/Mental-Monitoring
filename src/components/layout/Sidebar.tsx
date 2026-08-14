import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, SmilePlus, BookOpen, Users, User, Menu, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{t(tab.label)}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-mood">
          <div className="sidebar-mood-emoji">😊</div>
          {!isCollapsed && (
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('home.todayMood', 'Mood Hari Ini')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('home.feelingGood', 'Cukup Baik')}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
