import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SOSButton } from '../safety/SOSButton';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      
      <main className="flex-1 relative pb-16 md:pb-0 overflow-x-hidden">
        <div className="w-full h-full mx-auto max-w-5xl p-4 md:p-8">
          {children}
        </div>
      </main>

      <BottomNav />
      <SOSButton />
    </div>
  );
};
