import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, SmilePlus, BookOpen, Users, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const tabs = [
    { path: '/', icon: Home, label: 'nav.home' },
    { path: '/mood', icon: SmilePlus, label: 'nav.mood' },
    { path: '/journal', icon: BookOpen, label: 'nav.journal' },
    { path: '/forum', icon: Users, label: 'nav.forum' },
    { path: '/profile', icon: User, label: 'nav.profile' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{t(tab.label)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
