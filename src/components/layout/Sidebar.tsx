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
    <aside className={`hidden md:flex flex-col bg-card border-r border-border h-screen transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 h-16 border-b border-border">
        {!isCollapsed && <span className="text-xl font-bold text-primary truncate">RIMA</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex items-center w-full p-3 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'} ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{t(tab.label)}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            😊
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium">Mood Hari Ini</span>
              <span className="text-xs text-muted-foreground">Cukup Baik</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
