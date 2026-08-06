import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, SmilePlus, BookOpen, Users, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BottomNav: React.FC = () => {
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon size={24} className={isActive ? 'animate-bounce-short' : ''} />
              <span className="text-[10px] font-medium">{t(tab.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
