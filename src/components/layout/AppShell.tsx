import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SOSButton } from '../safety/SOSButton';

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="app-shell">
    <Sidebar />
    <main className="app-main">
      <div className="app-content">{children}</div>
    </main>
    <BottomNav />
    <SOSButton />
  </div>
);
