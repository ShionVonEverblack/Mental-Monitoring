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
const Breathe = lazy(() => import('./pages/Breathe').then(module => ({ default: module.Breathe })));
const Education = lazy(() => import('./pages/Education').then(module => ({ default: module.Education })));
const ProfessionalHelp = lazy(() => import('./pages/ProfessionalHelp').then(module => ({ default: module.ProfessionalHelp })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const Grounding = lazy(() => import('./pages/Grounding').then(module => ({ default: module.Grounding })));
const Assessment = lazy(() => import('./pages/Assessment').then(module => ({ default: module.Assessment })));
import { ConsentModal } from './components/common/ConsentModal';

import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConsentModal />
        <AppShell>
          <Suspense fallback={<LoadingSpinner message={t('common.loadingSafeSpace', 'Memuat Ruang Aman...')} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mood" element={<MoodTracker />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/safety-plan" element={<SafetyPlan />} />
              <Route path="/breathe" element={<Breathe />} />
              <Route path="/education" element={<Education />} />
              <Route path="/professional-help" element={<ProfessionalHelp />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/grounding" element={<Grounding />} />
              <Route path="/assessment" element={<Assessment />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
