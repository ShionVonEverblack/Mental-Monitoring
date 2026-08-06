import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n/config'; // side effect import for i18n
import './styles/index.css';

import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { MoodTracker } from './pages/MoodTracker';
import { Journal } from './pages/Journal';
import { Forum } from './pages/Forum';
import { Profile } from './pages/Profile';
import { SafetyPlan } from './components/ui/SafetyPlan'; // Assuming this exists or will be created
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/safety-plan" element={<SafetyPlan />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
