import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n/config';
import './styles/index.css';

import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useTheme } from './hooks/useTheme';

// Lazy loading pages for code splitting & faster initial load
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const MoodTracker = lazy(() => import('./pages/MoodTracker').then(module => ({ default: module.MoodTracker })));
const Journal = lazy(() => import('./pages/Journal').then(module => ({ default: module.Journal })));
const Forum = lazy(() => import('./pages/Forum').then(module => ({ default: module.Forum })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const SafetyPlan = lazy(() => import('./components/safety/SafetyPlan').then(module => ({ default: module.SafetyPlan })));

const App: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell>
          <Suspense fallback={<LoadingSpinner message="Memuat Ruang Aman..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mood" element={<MoodTracker />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/safety-plan" element={<SafetyPlan />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
