import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import '../i18n/config';
import i18n from 'i18next';

// Components & Utilities under empirical test
import { RootRedirector, AppShellLayout } from '../App';
import { Landing } from '../pages/Landing';
import { Profile } from '../pages/Profile';
import { wipeAllData } from '../utils/dataWipe';

// Mock Recharts for Home / Analytics subcomponents
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock AudioSomatics to avoid Web Audio API issues in jsdom
vi.mock('../services/audioSomaticsService', () => ({
  audioSomatics: {
    play: vi.fn(),
    stop: vi.fn(),
    getState: () => ({ isPlaying: false, soundType: 'brown', volume: 0.5, timerMinutes: 0, timeRemainingSec: 0 }),
    subscribe: () => () => {},
  },
}));

// Configurable auth mock to stress-test guest vs authenticated flows
let mockIsAuthenticated = false;
let mockIsAnonymousMode = true;

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isAnonymousMode: mockIsAnonymousMode,
    user: { id: 'u-anon', displayName: 'Tamu Anonim', language: 'id', theme: 'dark', createdAt: '' },
    accountUser: mockIsAuthenticated ? { id: 'acc-1', email: 'user@example.com', displayName: 'Akun Pengguna' } : null,
    activeDisplayName: mockIsAuthenticated && !mockIsAnonymousMode ? 'Akun Pengguna' : 'Tamu Anonim',
    isAuthenticating: false,
    isSupabaseConfigured: true,
    toggleAnonymousMode: vi.fn(() => ({ success: true, requiresAuth: false })),
    setAnonymousMode: vi.fn(),
    updateDisplayName: vi.fn(),
    regenerateAnonymousName: vi.fn(),
    loginWithEmail: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Helper component to track current location inside MemoryRouter
const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

// Minimalistic Home mock to distinguish from Landing
vi.mock('../pages/Home', () => ({
  Home: () => <div data-testid="mock-home-page"><h1>Dashboard Beranda RIMA</h1></div>,
  default: () => <div data-testid="mock-home-page"><h1>Dashboard Beranda RIMA</h1></div>,
}));

describe('Adversarial Navigation & Layout Decoupling Stress Suite (M4)', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    mockIsAuthenticated = false;
    mockIsAnonymousMode = true;
    await act(async () => {
      await i18n.changeLanguage('id');
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  /* =========================================================================
   * SCENARIO 1: FIRST-TIME VISITOR (Clean Session)
   * ========================================================================= */
  describe('Scenario 1: First-Time Visitor Navigation & Layout Decoupling', () => {
    it('1.1 Deterministic Redirect: Accessing "/" with clean localStorage redirects to "/landing"', async () => {
      expect(localStorage.getItem('rima-has-entered')).toBeNull();

      render(
        <MemoryRouter initialEntries={['/']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Verify immediate redirection to /landing
      const location = screen.getByTestId('location-display');
      expect(location.textContent).toBe('/landing');

      // Verify Landing page content is mounted
      expect(screen.getByRole('heading', { level: 1, name: /Ruang Digital Aman/i })).toBeInTheDocument();
      expect(screen.queryByTestId('mock-home-page')).not.toBeInTheDocument();
    });

    it('1.2 Layout Decoupling: Public /landing route has ZERO AppShell chrome', () => {
      render(
        <MemoryRouter initialEntries={['/landing']}>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Verify landing container is mounted
      expect(document.querySelector('.landing-page')).toBeInTheDocument();
      expect(document.querySelector('.landing-header')).toBeInTheDocument();

      // Assert complete absence of internal AppShell chrome
      expect(document.querySelector('.app-shell')).not.toBeInTheDocument();
      expect(document.querySelector('.sidebar')).not.toBeInTheDocument();
      expect(document.querySelector('.bottom-nav')).not.toBeInTheDocument();
      expect(document.querySelector('.sos-float')).not.toBeInTheDocument();
      expect(document.querySelector('.quick-exit-btn')).not.toBeInTheDocument();
      expect(document.querySelector('.skip-link')).not.toBeInTheDocument();

      // Assert absence of lock screen and consent modal overlays on standalone landing
      expect(document.querySelector('.app-lock-screen')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Komitmen Privasi & Keamanan RIMA/i })).not.toBeInTheDocument();
    });

    it('1.3 Boundary Edge Cases: Invalid or corrupted "rima-has-entered" values redirect to "/landing"', () => {
      const invalidValues = ['false', '0', 'null', 'undefined', '', 'TRUE', 'yes', 'no', ' true '];

      for (const val of invalidValues) {
        localStorage.setItem('rima-has-entered', val);

        const { unmount } = render(
          <MemoryRouter initialEntries={['/']}>
            <LocationDisplay />
            <Routes>
              <Route path="/landing" element={<div data-testid="landing-target">Landing</div>} />
              <Route element={<AppShellLayout />}>
                <Route path="/" element={<RootRedirector />} />
              </Route>
            </Routes>
          </MemoryRouter>
        );

        expect(
          screen.getByTestId('location-display').textContent,
          `Failed for invalid value "${val}"`
        ).toBe('/landing');
        expect(screen.getByTestId('landing-target')).toBeInTheDocument();
        unmount();
      }
    });

    it('1.4 Direct Navigation: Accessing "/landing" directly stays on "/landing" for clean session', () => {
      render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location-display').textContent).toBe('/landing');
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * SCENARIO 2: 1-CLICK GUEST CTA
   * ========================================================================= */
  describe('Scenario 2: 1-Click Guest CTA Transition & Storage Persistence', () => {
    it('2.1 Hero CTA "Mulai sebagai Tamu Anonim" sets storage flags and routes to "/"', async () => {
      render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const beforeTime = Date.now();
      const heroGuestBtn = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i })[0];
      fireEvent.click(heroGuestBtn);

      // Verify exact localStorage key contracts
      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      const consentIso = localStorage.getItem('rima-consent-accepted');
      expect(consentIso).toBeTruthy();
      const parsedTime = new Date(consentIso!).getTime();
      expect(parsedTime).toBeGreaterThanOrEqual(beforeTime - 1000);
      expect(parsedTime).toBeLessThanOrEqual(Date.now() + 1000);

      // Verify URL navigation to "/"
      expect(screen.getByTestId('location-display').textContent).toBe('/');

      // Verify AppShell layout and Home page are mounted on "/"
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();
      expect(document.querySelector('.app-shell')).toBeInTheDocument();
      expect(document.querySelector('.sidebar')).toBeInTheDocument();
      expect(document.querySelector('.bottom-nav')).toBeInTheDocument();
      expect(document.querySelector('.sos-float')).toBeInTheDocument();
    });

    it('2.2 Pre-footer CTA "Mulai sebagai Tamu Anonim" provides identical storage persistence and navigation', async () => {
      render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const guestBtns = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i });
      expect(guestBtns.length).toBeGreaterThanOrEqual(2);
      fireEvent.click(guestBtns[1]);

      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      expect(localStorage.getItem('rima-consent-accepted')).toBeTruthy();
      expect(screen.getByTestId('location-display').textContent).toBe('/');
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();
    });

    it('2.3 Footer "Buka Aplikasi Beranda" button acts as third fallback guest entry point', async () => {
      render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const footerEnterBtn = screen.getByRole('button', { name: /Buka Aplikasi Beranda/i });
      fireEvent.click(footerEnterBtn);

      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      expect(localStorage.getItem('rima-consent-accepted')).toBeTruthy();
      expect(screen.getByTestId('location-display').textContent).toBe('/');
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();
    });

    it('2.4 ConsentModal does NOT re-prompt user when entering via Guest CTA', () => {
      render(
        <MemoryRouter initialEntries={['/landing']}>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const heroGuestBtn = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i })[0];
      fireEvent.click(heroGuestBtn);

      // Because handleEnterAsGuest saved rima-consent-accepted, ConsentModal should remain closed
      expect(screen.queryByRole('heading', { name: /Komitmen Privasi & Keamanan RIMA/i })).not.toBeInTheDocument();
    });
  });

  /* =========================================================================
   * SCENARIO 3: RETURNING VISITOR
   * ========================================================================= */
  describe('Scenario 3: Returning Visitor Instant Access (No Bounce / Flicker)', () => {
    it('3.1 Returning visitor with "rima-has-entered" = "true" renders Home directly on "/"', async () => {
      localStorage.setItem('rima-has-entered', 'true');
      localStorage.setItem('rima-consent-accepted', new Date().toISOString());

      render(
        <MemoryRouter initialEntries={['/']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Verify URL stayed at "/" with no redirection
      expect(screen.getByTestId('location-display').textContent).toBe('/');

      // Verify Home is mounted with full AppShell
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();
      expect(document.querySelector('.app-shell')).toBeInTheDocument();
      expect(document.querySelector('.sidebar')).toBeInTheDocument();
      expect(document.querySelector('.bottom-nav')).toBeInTheDocument();

      // Verify Landing page was never mounted
      expect(document.querySelector('.landing-page')).not.toBeInTheDocument();
    });

    it('3.2 Rapid repeated mounting does not degrade or flicker routing state', async () => {
      localStorage.setItem('rima-has-entered', 'true');

      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <MemoryRouter initialEntries={['/']}>
            <LocationDisplay />
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route element={<AppShellLayout />}>
                <Route path="/" element={<RootRedirector />} />
              </Route>
            </Routes>
          </MemoryRouter>
        );

        expect(screen.getByTestId('location-display').textContent).toBe('/');
        expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();
        unmount();
      }
    });

    it('3.3 Legacy/Upgraded Visitor: "rima-has-entered" present without "rima-consent-accepted" renders Home with ConsentModal displayed', async () => {
      localStorage.setItem('rima-has-entered', 'true');
      // Intentionally omit rima-consent-accepted to simulate legacy user
      expect(localStorage.getItem('rima-consent-accepted')).toBeNull();

      render(
        <MemoryRouter initialEntries={['/']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Verify stays on "/"
      expect(screen.getByTestId('location-display').textContent).toBe('/');
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();

      // Verify ConsentModal opens to safely obtain consent
      expect(screen.getByRole('heading', { name: /Komitmen Privasi & Keamanan RIMA/i })).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * SCENARIO 4: DEEP LINK & RETURNING TO LANDING
   * ========================================================================= */
  describe('Scenario 4: Deep Link & Returning to Landing Exploration', () => {
    it('4.1 Returning guest user can explicitly navigate to "/landing" without getting bounced to "/"', () => {
      localStorage.setItem('rima-has-entered', 'true');
      mockIsAuthenticated = false; // Guest / offline mode (RIMA default)

      render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Verify user remains at /landing
      expect(screen.getByTestId('location-display').textContent).toBe('/landing');
      expect(document.querySelector('.landing-page')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.queryByTestId('mock-home-page')).not.toBeInTheDocument();
    });

    it('4.2 Profile view link "Tentang RIMA (Landing Page)" navigates to "/landing"', () => {
      localStorage.setItem('rima-has-entered', 'true');
      mockIsAuthenticated = false;

      render(
        <MemoryRouter initialEntries={['/profile']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Locate Profile settings item for Landing page
      const landingLink = screen.getByText(/Tentang RIMA \(Landing Page\)/i);
      expect(landingLink).toBeInTheDocument();

      // Click the settings row container
      const settingsRow = landingLink.closest('.settings-item');
      expect(settingsRow).not.toBeNull();
      fireEvent.click(settingsRow!);

      // Verify navigation transitioned to /landing and displays Landing Page
      expect(screen.getByTestId('location-display').textContent).toBe('/landing');
      expect(document.querySelector('.landing-page')).toBeInTheDocument();
      expect(document.querySelector('.app-shell')).not.toBeInTheDocument();
    });

    it('4.3 Sidebar navigation link "Tentang RIMA" navigates to "/landing"', () => {
      localStorage.setItem('rima-has-entered', 'true');
      mockIsAuthenticated = false;

      render(
        <MemoryRouter initialEntries={['/']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Find Sidebar landing link
      const sidebarLandingLink = screen.getByTitle(/Tentang RIMA/i);
      expect(sidebarLandingLink).toBeInTheDocument();
      fireEvent.click(sidebarLandingLink);

      // Verify user transitioned to /landing
      expect(screen.getByTestId('location-display').textContent).toBe('/landing');
      expect(document.querySelector('.landing-page')).toBeInTheDocument();
      expect(document.querySelector('.app-shell')).not.toBeInTheDocument();
    });

    it('4.4 Adversarial Edge Case: Authenticated user (Supabase) visiting "/landing" triggers auto-redirect to "/"', async () => {
      // When a user has an active Supabase session (isAuthenticated = true),
      // Landing.tsx explicitly implements auto-forwarding to "/" to guide logged-in users directly to their dashboard.
      localStorage.setItem('rima-has-entered', 'true');
      mockIsAuthenticated = true; // Actively logged in

      render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Empirically verifies Landing.tsx line 41-46 forwards authenticated sessions to "/"
      expect(screen.getByTestId('location-display').textContent).toBe('/');
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();
    });

    it('4.5 Deep link to internal route (e.g. "/privacy") remains accessible without "rima-has-entered"', () => {
      // First-time visitor given a direct link to Privacy Policy (UU PDP requirement)
      render(
        <MemoryRouter initialEntries={['/privacy']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
              <Route path="/privacy" element={<div data-testid="privacy-page">Kebijakan Privasi</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location-display').textContent).toBe('/privacy');
      expect(screen.getByTestId('privacy-page')).toBeInTheDocument();
    });

    it('4.6 Cyclic Navigation: Guest user repeatedly transitions between "/" and "/landing" without loops', async () => {
      localStorage.setItem('rima-has-entered', 'true');
      mockIsAuthenticated = false;

      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location-display').textContent).toBe('/');
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();

      // Click sidebar landing link
      const sidebarLandingLink = screen.getByTitle(/Tentang RIMA/i);
      fireEvent.click(sidebarLandingLink);
      expect(screen.getByTestId('location-display').textContent).toBe('/landing');

      // Click Hero guest CTA to re-enter
      const heroGuestBtn = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i })[0];
      fireEvent.click(heroGuestBtn);
      expect(screen.getByTestId('location-display').textContent).toBe('/');
      expect(await screen.findByTestId('mock-home-page')).toBeInTheDocument();

      unmount();
    });

    it('4.7 Authenticated user logging out recovers the ability to explore "/landing"', async () => {
      localStorage.setItem('rima-has-entered', 'true');

      // 1. Initially authenticated -> bounced from /landing to /
      mockIsAuthenticated = true;
      const { unmount: unmountAuth } = render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByTestId('location-display').textContent).toBe('/');
      unmountAuth();

      // 2. User logs out -> becomes guest (isAuthenticated = false)
      mockIsAuthenticated = false;
      const { unmount: unmountGuest } = render(
        <MemoryRouter initialEntries={['/landing']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Now user can explore /landing freely!
      expect(screen.getByTestId('location-display').textContent).toBe('/landing');
      expect(document.querySelector('.landing-page')).toBeInTheDocument();
      unmountGuest();
    });
  });

  /* =========================================================================
   * SCENARIO 5: DATA WIPE & SESSION RESET
   * ========================================================================= */
  describe('Scenario 5: Data Wipe & Clean Session Reversion', () => {
    it('5.1 wipeAllData() clears all "rima-*" keys and preserves non-rima keys', async () => {
      // Populate comprehensive RIMA state
      localStorage.setItem('rima-has-entered', 'true');
      localStorage.setItem('rima-consent-accepted', '2026-10-10T15:00:00Z');
      localStorage.setItem('rima-anonymous-mode', 'true');
      localStorage.setItem('rima-user-profile', JSON.stringify({ displayName: 'Test User' }));
      localStorage.setItem('rima-mood-entries', JSON.stringify([{ id: 'm1', mood: 4 }]));
      localStorage.setItem('rima-journal-entries', JSON.stringify([{ id: 'j1', text: 'Peace' }]));
      localStorage.setItem('rima-app-lock-enabled', 'true');
      localStorage.setItem('local-storage', 'custom-bus');

      // Populate unrelated key
      localStorage.setItem('unrelated-system-flag', 'persistent-value');

      const expectedKeysCount = Object.keys(localStorage).filter(
        k => k.startsWith('rima-') || k === 'local-storage'
      ).length;
      expect(expectedKeysCount).toBeGreaterThanOrEqual(8);

      const wipeResult = await wipeAllData();

      expect(wipeResult.success).toBe(true);
      expect(wipeResult.keysRemoved).toBe(expectedKeysCount);

      // Verify all rima-* keys are completely removed
      expect(localStorage.getItem('rima-has-entered')).toBeNull();
      expect(localStorage.getItem('rima-consent-accepted')).toBeNull();
      expect(localStorage.getItem('rima-anonymous-mode')).toBeNull();
      expect(localStorage.getItem('rima-user-profile')).toBeNull();
      expect(localStorage.getItem('rima-mood-entries')).toBeNull();
      expect(localStorage.getItem('rima-journal-entries')).toBeNull();
      expect(localStorage.getItem('rima-app-lock-enabled')).toBeNull();
      expect(localStorage.getItem('local-storage')).toBeNull();

      // Verify non-rima key is preserved
      expect(localStorage.getItem('unrelated-system-flag')).toBe('persistent-value');
    });

    it('5.2 wipeAllData() dispatches "local-storage" and "storage" window events', async () => {
      localStorage.setItem('rima-has-entered', 'true');

      let localStorageFired = false;
      let storageFired = false;

      const handleLocalStorage = () => { localStorageFired = true; };
      const handleStorage = () => { storageFired = true; };

      window.addEventListener('local-storage', handleLocalStorage);
      window.addEventListener('storage', handleStorage);

      await wipeAllData();

      window.removeEventListener('local-storage', handleLocalStorage);
      window.removeEventListener('storage', handleStorage);

      expect(localStorageFired).toBe(true);
      expect(storageFired).toBe(true);
    });

    it('5.3 Accessing "/" immediately following wipeAllData() redirects back to "/landing"', async () => {
      // Simulate active user session
      localStorage.setItem('rima-has-entered', 'true');
      localStorage.setItem('rima-consent-accepted', new Date().toISOString());

      // Trigger full data wipe
      await wipeAllData();

      // User navigates or refreshes to root "/"
      render(
        <MemoryRouter initialEntries={['/']}>
          <LocationDisplay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Verifies clean reset: user is redirected deterministically to /landing
      expect(screen.getByTestId('location-display').textContent).toBe('/landing');
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.queryByTestId('mock-home-page')).not.toBeInTheDocument();
    });

    it('5.4 wipeAllData() is idempotent and handles empty localStorage without crashing', async () => {
      localStorage.clear();
      expect(localStorage.length).toBe(0);

      const res = await wipeAllData();
      expect(res.success).toBe(true);
      expect(res.keysRemoved).toBe(0);
      expect(res.error).toBeUndefined();
    });
  });
});
