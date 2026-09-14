import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SOSButton } from '../safety/SOSButton';
import { SessionAwareness } from '../common/SessionAwareness';

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="app-shell">
    {/* WCAG 2.4.1 — Skip to Main Content bypass link for keyboard users */}
    <a href="#main-content" className="skip-link">
      Lewati ke konten utama
    </a>

    {/* Quick Exit — SAMHSA Safety principle: for users in unsafe environments */}
    <a
      href="https://www.google.com"
      className="quick-exit-btn"
      title="Quick Exit"
      aria-label="Keluar cepat ke halaman aman"
    >
      ✕
    </a>

    <Sidebar />
    <main className="app-main" id="main-content">
      <div className="app-content">{children}</div>
    </main>
    <BottomNav />
    <SOSButton />
    <SessionAwareness />
  </div>
);
