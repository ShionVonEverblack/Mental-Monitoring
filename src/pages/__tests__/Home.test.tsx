import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n/config';
import i18n from 'i18next';
import { Home } from '../Home';
import { useMoodStore } from '../../stores/moodStore';
import { audioSomatics } from '../../services/audioSomaticsService';
import type { JitaiNudge } from '../../types/jitai';
import type { MoodEntry } from '../../types';

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock recharts for robust, headless jsdom SVG rendering
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="bar-chart" data-count={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock useJitai hook for deterministic micro-intervention testing
const mockDismissNudge = vi.fn();
const mockAcceptNudge = vi.fn();
let mockNudge: JitaiNudge | null = null;

vi.mock('../../hooks/useJitai', () => ({
  useJitai: () => ({
    nudge: mockNudge,
    dismissNudge: mockDismissNudge,
    acceptNudge: mockAcceptNudge,
    recordImpression: vi.fn(),
    state: { dismissedTypes: [], dailyCount: 0, dismissedAllToday: false },
    refresh: vi.fn(),
  }),
}));

const sampleVagalNudge: JitaiNudge = {
  id: 'jitai-red-vagal-test',
  type: 'mood_red_vagal_reset',
  category: 'mood',
  urgency: 'high',
  titleKey: 'jitai.red_vagal_title',
  titleFallback: 'Atur Ritme Saraf Otonom',
  messageKey: 'jitai.red_vagal_desc',
  messageFallback:
    'Aktivasi sistem sarafmu sedang tinggi. Tarik napas ganda lewat hidung dan embuskan panjang (Cyclic Sighing) untuk menurunkan detak jantung.',
  actionLabelKey: 'jitai.action_breathe',
  actionLabelFallback: 'Mulai Pernapasan (60d)',
  targetRoute: '/breathe',
  iconName: 'Wind',
  evidenceBadgeKey: 'jitai.badge_vagal',
  evidenceBadgeFallback: 'Stanford Cyclic Sighing',
};

describe('Home Page — Zen Monastic & Apple Health Wellbeing Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    useMoodStore.setState({ moods: [] });
    mockNudge = null;
    mockNavigate.mockClear();
    mockDismissNudge.mockClear();
    mockAcceptNudge.mockClear();
    vi.restoreAllMocks();

    vi.spyOn(audioSomatics, 'play').mockResolvedValue(true);
    vi.spyOn(audioSomatics, 'stop').mockReturnValue();
    vi.spyOn(audioSomatics, 'getIsPlaying').mockReturnValue(false);

    await act(async () => {
      await i18n.changeLanguage('id');
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  /* =========================================================================
   * 1. Zen Header & Presence Streak Badge
   * ========================================================================= */
  describe('Zen Header & Presence Streak Badge', () => {
    it('renders serene greeting header with proper semantic hierarchy and language trigger', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const header = document.querySelector('.zen-home-header');
      expect(header).toBeInTheDocument();

      const greeting = document.querySelector('.zen-greeting');
      expect(greeting).toBeInTheDocument();
      expect(greeting?.tagName.toLowerCase()).toBe('h1');
      expect(greeting?.textContent?.length).toBeGreaterThan(0);

      const langBtn = screen.getByRole('button', { name: /Bahasa/i });
      expect(langBtn).toBeInTheDocument();
      expect(langBtn).toHaveClass('zen-lang-btn');
    });

    it('displays presence streak badge without gamification pressure during normal active streak', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      useMoodStore.setState({
        moods: [
          { id: 'm1', score: 4, emoji: '🙂', factors: [], note: '', createdAt: today.toISOString() },
          { id: 'm2', score: 3, emoji: '😐', factors: [], note: '', createdAt: yesterday.toISOString() },
          { id: 'm3', score: 4, emoji: '🙂', factors: [], note: '', createdAt: twoDaysAgo.toISOString() },
        ],
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const streakBadge = document.querySelector('.zen-streak-badge');
      expect(streakBadge).toBeInTheDocument();
      expect(streakBadge).toHaveTextContent('3 Hari');
      expect(streakBadge).toHaveAttribute('aria-label', '3 Hari');
      expect(streakBadge).not.toHaveClass('zen-streak-grace');
      expect(document.querySelector('.zen-streak-recovery')).not.toBeInTheDocument();
    });

    it('displays presence streak with gentle seedling grace recovery badge when a day was missed', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      useMoodStore.setState({
        moods: [
          { id: 'm1', score: 4, emoji: '🙂', factors: [], note: '', createdAt: twoDaysAgo.toISOString() },
        ],
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const streakBadge = document.querySelector('.zen-streak-badge');
      expect(streakBadge).toBeInTheDocument();
      expect(streakBadge).toHaveClass('zen-streak-grace');
      expect(streakBadge?.getAttribute('aria-label')).toContain('Pemulihan');

      const recoverySpan = document.querySelector('.zen-streak-recovery');
      expect(recoverySpan).toBeInTheDocument();
      expect(recoverySpan).toHaveTextContent(/🌱.*Pemulihan/i);
    });

    it('displays zero streak calmly without guilt-inducing gamification messaging', () => {
      useMoodStore.setState({ moods: [] });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const streakBadge = document.querySelector('.zen-streak-badge');
      expect(streakBadge).toBeInTheDocument();
      expect(streakBadge).toHaveTextContent('0 Hari');

      // Verify absence of punitive or gamified pressure words
      const pageText = document.body.textContent || '';
      expect(pageText).not.toMatch(/kalah|gagal|hancur|streak broken|terputus/i);
    });

    it('opens language modal on language switcher click and allows switching language', async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const langBtn = screen.getByRole('button', { name: /Bahasa/i });
      fireEvent.click(langBtn);

      const modalTitle = await screen.findByRole('heading', { name: /Bahasa/i });
      expect(modalTitle).toBeInTheDocument();

      const englishBtn = screen.getByRole('button', { name: /English/i });
      expect(englishBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(englishBtn);
      });

      expect(i18n.language).toMatch(/^en/);
    });
  });

  /* =========================================================================
   * 2. Fluid Mood Check-In
   * ========================================================================= */
  describe('Fluid Mood Check-In', () => {
    it('renders mood prompt card, options, and Yale Mood Meter 2D shortcut when no mood is logged today', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const promptCard = document.querySelector('.zen-mood-prompt-card');
      expect(promptCard).toBeInTheDocument();
      expect(screen.getByText(/Bagaimana perasaanmu hari ini\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Bagaimana perasaanmu saat ini\?/i)).toBeInTheDocument();

      const moodMeterLink = screen.getByRole('button', { name: /Yale Mood Meter 2D/i });
      expect(moodMeterLink).toBeInTheDocument();

      fireEvent.click(moodMeterLink);
      expect(mockNavigate).toHaveBeenCalledWith('/mood');

      // MoodSelector buttons should be rendered
      const goodMoodBtn = screen.getByRole('button', { name: /^Baik$/i });
      expect(goodMoodBtn).toBeInTheDocument();
    });

    it('logs mood directly from prompt card and persists entry into store', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const goodMoodBtn = screen.getByRole('button', { name: /^Baik$/i });
      fireEvent.click(goodMoodBtn);

      const moods = useMoodStore.getState().moods;
      expect(moods.length).toBe(1);
      expect(moods[0].score).toBe(4);
      expect(moods[0].emoji).toBe('🙂');
    });

    it('renders serene logged status chip and update button when mood is already logged today', () => {
      useMoodStore.setState({
        moods: [
          {
            id: 'today-1',
            score: 5,
            emoji: '😊',
            factors: ['tidur'],
            note: 'Sangat damai',
            createdAt: new Date().toISOString(),
          },
        ],
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(document.querySelector('.zen-mood-prompt-card')).not.toBeInTheDocument();

      const loggedCard = document.querySelector('.zen-mood-logged-card');
      expect(loggedCard).toBeInTheDocument();
      expect(screen.getByText(/Mood hari ini tercatat/i)).toBeInTheDocument();
      expect(screen.getByText(/Sangat Baik/i)).toBeInTheDocument();

      const badge = document.querySelector('.zen-logged-badge');
      expect(badge).toHaveTextContent('😊');

      const updateBtn = screen.getByRole('button', { name: /Edit|Perbarui/i });
      expect(updateBtn).toBeInTheDocument();
      expect(updateBtn).toHaveClass('zen-mood-update-btn');

      fireEvent.click(updateBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/mood');
    });
  });

  /* =========================================================================
   * 3. Whisper Nudge (JITAI Adaptive Micro-Intervention)
   * ========================================================================= */
  describe('Whisper Nudge (JITAI Integration)', () => {
    it('renders nothing when no contextual micro-intervention is eligible', () => {
      mockNudge = null;

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(document.querySelector('.jitai-nudge-card')).not.toBeInTheDocument();
    });

    it('renders adaptive nudge with evidence badge and handles action navigation', () => {
      mockNudge = sampleVagalNudge;

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const aside = screen.getByRole('complementary', { name: /Rekomendasi Adaptif/i });
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveClass('jitai-urgency-high');

      expect(screen.getByText(/Stanford Cyclic Sighing/i)).toBeInTheDocument();
      expect(screen.getByText('Atur Ritme Saraf Otonom')).toBeInTheDocument();
      expect(screen.getByText(/Aktivasi sistem sarafmu sedang tinggi/i)).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /Mulai Pernapasan \(60d\)/i });
      expect(actionBtn).toBeInTheDocument();

      fireEvent.click(actionBtn);
      expect(mockAcceptNudge).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/breathe');
    });

    it('triggers dismiss callback when top-right close or secondary button is clicked', () => {
      mockNudge = sampleVagalNudge;

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const dismissBtn = screen.getByRole('button', { name: /Tutup saran ini/i });
      fireEvent.click(dismissBtn);
      expect(mockDismissNudge).toHaveBeenCalledTimes(1);

      const laterBtn = screen.getByRole('button', { name: /Nanti Saja/i });
      fireEvent.click(laterBtn);
      expect(mockDismissNudge).toHaveBeenCalledTimes(2);
    });
  });

  /* =========================================================================
   * 4. Editorial Zen Quote / Afirmasi
   * ========================================================================= */
  describe('Editorial Zen Quote / Afirmasi', () => {
    it('renders affirmation card with editorial typography and text content', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const card = document.querySelector('.zen-affirmation-card');
      expect(card).toBeInTheDocument();

      const label = document.querySelector('.zen-affirmation-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent(/Renungan & Afirmasi/i);

      const text = document.querySelector('.zen-affirmation-text');
      expect(text).toBeInTheDocument();
      expect(text?.textContent?.startsWith('“')).toBe(true);
      expect(text?.textContent?.endsWith('”')).toBe(true);
      expect((text?.textContent?.length ?? 0)).toBeGreaterThan(10);
    });

    it('renders spiritual affirmation variant when spiritual feature is enabled in localStorage', () => {
      localStorage.setItem('rima-spiritual-enabled', JSON.stringify(true));
      localStorage.setItem('rima-spiritual-source', JSON.stringify('universal'));

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const card = document.querySelector('.zen-affirmation-card');
      expect(card).toBeInTheDocument();
      expect(document.querySelector('.zen-affirmation-text')).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 5. Pilihan Hening (4 Structured Minimalist Card Rows)
   * ========================================================================= */
  describe('Pilihan Hening (.zen-feature-matrix)', () => {
    it('renders .zen-feature-matrix section containing exactly 4 structured groups and header', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const matrix = document.querySelector('.zen-feature-matrix');
      expect(matrix).toBeInTheDocument();
      expect(matrix).toHaveAttribute('aria-label', 'Ruang Pemulihan');

      expect(screen.getByText('Pilihan Hening')).toBeInTheDocument();
      expect(screen.getByText('Ruang pemulihan bertahap sesuai ritme batinmu')).toBeInTheDocument();

      const groups = document.querySelectorAll('.zen-feature-group');
      expect(groups.length).toBe(4);
    });

    /* Row 1: Jurnal & Refleksi */
    it('Row 1 (Jurnal & Refleksi): triggers navigation for Jurnal, Skrining Mandiri, and Edukasi Jiwa', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText('Jurnal & Refleksi')).toBeInTheDocument();
      expect(screen.getByText('Ruang mencatat rasa, skrining mandiri, dan literasi emosi')).toBeInTheDocument();

      const journalTile = screen.getByRole('button', { name: 'Tulis Jurnal' });
      fireEvent.click(journalTile);
      expect(mockNavigate).toHaveBeenCalledWith('/journal');

      const assessmentTile = screen.getByRole('button', { name: 'Skrining Mandiri' });
      fireEvent.click(assessmentTile);
      expect(mockNavigate).toHaveBeenCalledWith('/assessment');

      const educationTile = screen.getByRole('button', { name: 'Edukasi Jiwa' });
      fireEvent.click(educationTile);
      expect(mockNavigate).toHaveBeenCalledWith('/education');
    });

    /* Row 2: Regulasi Somatik */
    it('Row 2 (Regulasi Somatik): controls Brownian noise audio toggle and navigates to breathe and grounding', async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText('Regulasi Somatik')).toBeInTheDocument();
      expect(screen.getByText('Tenangkan detak jantung dan ketegangan sensorik tubuh')).toBeInTheDocument();

      const soundscapeTile = screen.getByRole('button', { name: /Audio Relaksasi/i });
      expect(soundscapeTile).toHaveAttribute('aria-pressed', 'false');
      expect(soundscapeTile).not.toHaveClass('active');

      // Click to start audio
      await act(async () => {
        fireEvent.click(soundscapeTile);
      });
      expect(audioSomatics.play).toHaveBeenCalledWith('brown_noise');
      expect(soundscapeTile).toHaveAttribute('aria-pressed', 'true');
      expect(soundscapeTile).toHaveClass('active');
      expect(soundscapeTile).toHaveTextContent(/· ON/i);

      // Click again to stop audio
      await act(async () => {
        fireEvent.click(soundscapeTile);
      });
      expect(audioSomatics.stop).toHaveBeenCalled();
      expect(soundscapeTile).toHaveAttribute('aria-pressed', 'false');
      expect(soundscapeTile).not.toHaveClass('active');

      // Breathe navigation
      const breatheTile = screen.getByRole('button', { name: 'Latihan Napas' });
      fireEvent.click(breatheTile);
      expect(mockNavigate).toHaveBeenCalledWith('/breathe');

      // Grounding navigation
      const groundingTile = screen.getByRole('button', { name: 'Grounding 5-4-3-2-1' });
      fireEvent.click(groundingTile);
      expect(mockNavigate).toHaveBeenCalledWith('/grounding');
    });

    /* Row 3: Welas Asih & Koping */
    it('Row 3 (Welas Asih & Koping): opens SelfCompassionModal and navigates to TIPP and Activation', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText('Welas Asih & Koping')).toBeInTheDocument();
      expect(screen.getByText('Rangkul kerentanan diri, redakan krisis akut, dan ambil tindakan kecil')).toBeInTheDocument();

      // Belas Kasih Diri opens SelfCompassionModal
      const cftTile = screen.getByRole('button', { name: 'Belas Kasih Diri' });
      fireEvent.click(cftTile);

      const modalTitle = screen.getByRole('heading', {
        name: /Jeda Belas Kasih Diri \(Self-Compassion Break\)/i,
      });
      expect(modalTitle).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close modal/i });
      fireEvent.click(closeBtn);

      // TIPP Krisis navigation
      const tippTile = screen.getByRole('button', { name: 'TIPP Krisis' });
      fireEvent.click(tippTile);
      expect(mockNavigate).toHaveBeenCalledWith('/tipp');

      // Aktivasi Perilaku navigation
      const activationTile = screen.getByRole('button', { name: 'Aktivasi Perilaku (BA)' });
      fireEvent.click(activationTile);
      expect(mockNavigate).toHaveBeenCalledWith('/activation');
    });

    /* Row 4: Jaring Pengaman & Bantuan */
    it('Row 4 (Jaring Pengaman & Bantuan): navigates to safety plan, clinic referral, and provides Hotline 119 Ext 8 tel: link', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText('Jaring Pengaman & Bantuan')).toBeInTheDocument();
      expect(screen.getByText('Rencana keselamatan, saluran darurat cepat, dan rujukan faskes resmi')).toBeInTheDocument();

      // Safety Plan navigation
      const safetyTile = screen.getByRole('button', { name: 'Rencana Keselamatan' });
      fireEvent.click(safetyTile);
      expect(mockNavigate).toHaveBeenCalledWith('/safety-plan');

      // Hotline 119 Ext 8 (telephone anchor with strict href)
      const hotlineLink = screen.getByRole('link', { name: 'Hotline 119 Ext 8' });
      expect(hotlineLink).toBeInTheDocument();
      expect(hotlineLink).toHaveAttribute('href', 'tel:119,8');
      expect(hotlineLink).toHaveClass('zen-hotline-tile');

      // Professional Help referral navigation
      const referralTile = screen.getByRole('button', { name: 'Rujukan Puskesmas & BPJS' });
      fireEvent.click(referralTile);
      expect(mockNavigate).toHaveBeenCalledWith('/professional-help');
    });
  });

  /* =========================================================================
   * 6. Accessibility & Touch Targets
   * ========================================================================= */
  describe('Accessibility & Touch Target Standards (WCAG 2.2 AA)', () => {
    it('ensures all 12 action tiles conform to touch target styling, proper roles, and non-empty accessible names', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const tiles = document.querySelectorAll('.zen-item-tile');
      expect(tiles.length).toBe(12);

      let buttonCount = 0;
      let linkCount = 0;

      tiles.forEach((tile) => {
        // Must have non-empty accessible name
        const accessibleName = tile.getAttribute('aria-label') || tile.textContent;
        expect(accessibleName?.trim().length).toBeGreaterThan(0);

        // Check roles
        const tagName = tile.tagName.toLowerCase();
        if (tagName === 'button') {
          buttonCount++;
          expect(tile).toHaveAttribute('type', 'button');
        } else if (tagName === 'a') {
          linkCount++;
          expect(tile).toHaveAttribute('href', 'tel:119,8');
        }

        // Child icon should have aria-hidden="true"
        const iconSpan = tile.querySelector('.zen-item-tile-icon');
        expect(iconSpan).toHaveAttribute('aria-hidden', 'true');
      });

      expect(buttonCount).toBe(11);
      expect(linkCount).toBe(1);
    });

    it('provides bidirectional RTL flip classes for chevron indicators', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const rtlIcons = document.querySelectorAll('.zen-rtl-flip');
      expect(rtlIcons.length).toBeGreaterThanOrEqual(1);
      rtlIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  /* =========================================================================
   * 7. Mood History Chart & Weekly Insights
   * ========================================================================= */
  describe('Mood History Chart & Insights', () => {
    it('displays tranquil empty placeholder message when no weekly moods exist', () => {
      useMoodStore.setState({ moods: [] });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const emptyMsg = document.querySelector('.zen-chart-empty');
      expect(emptyMsg).toBeInTheDocument();
      expect(emptyMsg).toHaveTextContent('Belum ada data mood untuk ditampilkan.');
      expect(document.querySelector('.zen-chart-card')).not.toBeInTheDocument();
    });

    it('renders BarChart with mood data when entries are present in the past 7 days', () => {
      const now = new Date();
      const past1 = new Date(now.getTime() - 24 * 3600 * 1000);
      const past2 = new Date(now.getTime() - 48 * 3600 * 1000);

      const testMoods: MoodEntry[] = [
        { id: '1', score: 4, emoji: '🙂', factors: [], note: '', createdAt: now.toISOString() },
        { id: '2', score: 3, emoji: '😐', factors: [], note: '', createdAt: past1.toISOString() },
        { id: '3', score: 5, emoji: '😊', factors: [], note: '', createdAt: past2.toISOString() },
      ];

      useMoodStore.setState({ moods: testMoods });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(document.querySelector('.zen-chart-empty')).not.toBeInTheDocument();
      const chartCard = document.querySelector('.zen-chart-card');
      expect(chartCard).toBeInTheDocument();

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();
      expect(barChart).toHaveAttribute('data-count', '3');
    });

    it('renders Weekly Insights section with clinical disclaimer when weekly moods >= 3', () => {
      const now = new Date();
      const testMoods: MoodEntry[] = [
        { id: '1', score: 2, emoji: '😟', factors: ['tidur'], note: '', createdAt: now.toISOString() },
        { id: '2', score: 2, emoji: '😟', factors: ['pekerjaan'], note: '', createdAt: new Date(now.getTime() - 86400000).toISOString() },
        { id: '3', score: 1, emoji: '😢', factors: ['sosial'], note: '', createdAt: new Date(now.getTime() - 172800000).toISOString() },
      ];

      useMoodStore.setState({ moods: testMoods });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const insightSection = document.querySelector('.zen-insight-section');
      expect(insightSection).toBeInTheDocument();
      expect(screen.getByText('Insight Mingguan')).toBeInTheDocument();
      expect(screen.getByText(/Insight ini diolah dari data pribadi untuk refleksi diri/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 8. Multi-Language Parity (English & Indonesian)
   * ========================================================================= */
  describe('Multi-Language Parity (English Localization)', () => {
    it('seamlessly updates all 4 card group titles and action labels when switched to English', async () => {
      await act(async () => {
        await i18n.changeLanguage('en');
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      // Section titles
      expect(screen.getByText('Mindful Spaces')).toBeInTheDocument();
      expect(screen.getByText('Gentle restoration at your own natural pace')).toBeInTheDocument();

      // Row 1
      expect(screen.getByText('Journal & Reflection')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mindful Journal' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Self-Screening' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mental Health Education' })).toBeInTheDocument();

      // Row 2
      expect(screen.getByText('Somatic Regulation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Soundscape & Brown Noise/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Breathwork' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5-4-3-2-1 Grounding' })).toBeInTheDocument();

      // Row 3
      expect(screen.getByText('Compassion & Coping')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Self-Compassion (CFT)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'TIPP Crisis Skills' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Behavioral Activation (BA)' })).toBeInTheDocument();

      // Row 4
      expect(screen.getByText('Safety Net & Support')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Safety Plan' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Hotline 119 Ext 8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'BPJS / Clinic Referral' })).toBeInTheDocument();
    });

    it('renders cleanly without error across all 8 supported languages', async () => {
      const languages = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'] as const;

      for (const lang of languages) {
        await act(async () => {
          await i18n.changeLanguage(lang);
        });

        const { container, unmount } = render(
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        );

        expect(container.querySelector('.zen-feature-matrix')).toBeInTheDocument();
        expect(container.querySelectorAll('.zen-feature-group').length).toBe(4);
        expect(container.querySelectorAll('.zen-item-tile').length).toBe(12);

        unmount();
      }
    });
  });

  /* =========================================================================
   * 9. Clinical Escalation Safeguard Integration
   * ========================================================================= */
  describe('Clinical Escalation Safeguard Integration', () => {
    it('renders clinical escalation alert when crisis patterns are detected in journal', () => {
      localStorage.setItem(
        'rima-journals',
        JSON.stringify([{ content: 'Saya merasa sangat putus asa dan ingin bunuh diri' }])
      );

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('escalation-banner');
    });

    it('does not render clinical escalation banner when entries are benign', () => {
      localStorage.setItem(
        'rima-journals',
        JSON.stringify([{ content: 'Hari ini cukup menyenangkan dan damai' }])
      );

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
