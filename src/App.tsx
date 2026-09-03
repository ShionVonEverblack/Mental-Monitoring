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
import { ConsentModal } from './components/common/ConsentModal';

const App: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConsentModal />
        <AppShell>
          <Suspense fallback={<LoadingSpinner message={
            (() => {
              const l = localStorage.getItem('i18nextLng')?.split('-')[0];
              switch (l) {
                case 'en': return 'Loading Safe Space...';
                case 'jv': return 'Ngundhuh Ruang Aman...';
                case 'su': return 'Ngunggahkeun Rohangan Aman...';
                case 'ja': return '安全な空間を読み込み中...';
                case 'zh': return '正在进入安全空间...';
                case 'es': return 'Cargando Espacio Seguro...';
                case 'ar': return 'جاري تحميل المساحة الآمنة...';
                default: return 'Memuat Ruang Aman...';
              }
            })()
          } />}>
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
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
