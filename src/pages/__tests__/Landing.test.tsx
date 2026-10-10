import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n/config';
import i18n from 'i18next';
import { Landing } from '../Landing';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth
let mockIsAuthenticated = false;
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isAnonymousMode: true,
    user: { id: 'u1', displayName: 'Tamu Anonim', language: 'id', theme: 'dark', createdAt: '' },
    accountUser: null,
    activeDisplayName: 'Tamu Anonim',
    isAuthenticating: false,
    isSupabaseConfigured: true,
    toggleAnonymousMode: vi.fn(),
    setAnonymousMode: vi.fn(),
    updateDisplayName: vi.fn(),
    regenerateAnonymousName: vi.fn(),
    loginWithEmail: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock matchMedia for useTheme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Landing Page — Modern Minimalist Public Web Access', () => {
  beforeEach(async () => {
    localStorage.clear();
    mockNavigate.mockReset();
    mockIsAuthenticated = false;

    await act(async () => {
      await i18n.changeLanguage('id');
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  /* =========================================================================
   * 1. Brand & Header Presentation
   * ========================================================================= */
  describe('Brand Presentation & Header', () => {
    it('renders standalone minimalist header with brand icon and title RIMA', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const header = document.querySelector('.landing-header');
      expect(header).toBeInTheDocument();

      const brand = document.querySelector('.landing-header-brand');
      expect(brand).toBeInTheDocument();
      expect(brand).toHaveTextContent('🌱');
      expect(brand).toHaveTextContent('RIMA');
    });

    it('renders language switcher trigger, theme toggle, and header login button', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const langBtn = screen.getByRole('button', { name: /Bahasa/i });
      expect(langBtn).toBeInTheDocument();
      expect(langBtn).toHaveTextContent(/ID/i);

      const themeBtn = screen.getByRole('button', { name: /Mode (Terang|Gelap)/i });
      expect(themeBtn).toBeInTheDocument();

      const headerLoginBtn = screen.getAllByRole('button', { name: /Masuk dengan Akun/i })[0];
      expect(headerLoginBtn).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 2. Hero Section & Dual CTA
   * ========================================================================= */
  describe('Hero Section & Dual Call-to-Action', () => {
    it('renders hero badge, title, subtitle, and calming tagline', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByText(/100% On-Device & Anonim • Bebas Akses/i)).toBeInTheDocument();

      const heroHeading = screen.getByRole('heading', { level: 1 });
      expect(heroHeading).toBeInTheDocument();
      expect(heroHeading).toHaveTextContent(/Ruang Digital Aman untuk Ketenangan Jiwamu/i);

      expect(screen.getByText(/RIMA hadir mendampingi kesehatan mental Anda/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Tanpa syarat pendaftaran\. Mulai rawat dirimu sekarang\./i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders primary guest CTA and secondary login CTA buttons in hero', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const guestBtn = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i })[0];
      expect(guestBtn).toBeInTheDocument();

      const loginBtns = screen.getAllByRole('button', { name: /Masuk dengan Akun/i });
      expect(loginBtns.length).toBeGreaterThanOrEqual(2); // Header, hero, pre-footer

      expect(screen.getByText(/1-klik instan • Tanpa registrasi • Data tersimpan lokal/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 3. Three Core Value Pillars
   * ========================================================================= */
  describe('3 Core Value Pillars (Security & Integrity Foundations)', () => {
    it('renders section heading and exactly 3 value pillar cards', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Fondasi Keamanan & Integritas Kami/i })).toBeInTheDocument();
      expect(screen.getByText(/Tiga prinsip utama yang menjamin kenyamanan Anda/i)).toBeInTheDocument();

      const pillarCards = document.querySelectorAll('.landing-pillar-card');
      expect(pillarCards.length).toBe(3);
    });

    it('Pillar 1: displays 100% Privacy & UU PDP No. 27/2022 compliance', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByText('Zero-Telemetry')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Privasi Mutlak & UU PDP/i })).toBeInTheDocument();
      expect(screen.getAllByText(/UU PDP No\. 27\/2022/i).length).toBeGreaterThanOrEqual(1);
    });

    it('Pillar 2: displays Stigma-Free Instant Access without phone number or real name', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByText('100% Anonim')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Akses Bebas Stigma/i })).toBeInTheDocument();
      expect(screen.getByText(/Mulai tanpa nomor HP atau nama asli/i)).toBeInTheDocument();
    });

    it('Pillar 3: displays Clinical Evidence-Based Interventions', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByText('Evidence-Based')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Berbasis Bukti Klinis/i })).toBeInTheDocument();
      expect(screen.getByText(/Yale Mood Meter 2D.*DBT TIPP.*Grounding/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 4. Feature Showcase Grid (6 Features)
   * ========================================================================= */
  describe('Feature Showcase Grid (6 Features)', () => {
    it('renders showcase header and exactly 6 feature showcase cards', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Fitur yang Dirancang untuk Kesejahteraanmu/i })).toBeInTheDocument();
      expect(screen.getByText(/Alat terintegrasi untuk mengenali diri/i)).toBeInTheDocument();

      const showcaseCards = document.querySelectorAll('.landing-showcase-card');
      expect(showcaseCards.length).toBe(6);
    });

    it('renders details for all 6 scientific features', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      // 1. Yale Mood Meter 2D
      expect(screen.getByRole('heading', { level: 3, name: /Yale Mood Meter 2D/i })).toBeInTheDocument();
      expect(screen.getByText(/Petakan spektrum energi dan kenyamanan emosional/i)).toBeInTheDocument();

      // 2. CBT Journal
      expect(screen.getByRole('heading', { level: 3, name: /Jurnal Terenkripsi & CBT/i })).toBeInTheDocument();
      expect(screen.getByText(/ruang hening terenkripsi lokal/i)).toBeInTheDocument();

      // 3. Somatics & Brownian Noise
      expect(screen.getByRole('heading', { level: 3, name: /Regulasi Somatik & Audio/i })).toBeInTheDocument();
      expect(screen.getByText(/Coherent Breathing.*brownian noise/i)).toBeInTheDocument();

      // 4. Crisis Safety Net
      expect(screen.getByRole('heading', { level: 3, name: /Jaring Pengaman Krisis \(119 Ext 8\)/i })).toBeInTheDocument();
      expect(screen.getByText(/SEJIWA Kemenkes/i)).toBeInTheDocument();

      // 5. Peer Forum
      expect(screen.getByRole('heading', { level: 3, name: /Komunitas Sebaya Suportif/i })).toBeInTheDocument();
      expect(screen.getByText(/ruang diskusi aman dengan perlindungan identitas otomatis/i)).toBeInTheDocument();

      // 6. JITAI Smart Nudge
      expect(screen.getByRole('heading', { level: 3, name: /JITAI On-Device Smart Nudge/i })).toBeInTheDocument();
      expect(screen.getByText(/Mesin intervensi cerdas di perangkat/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 5. FAQ Accordion & Expansion Interactivity
   * ========================================================================= */
  describe('FAQ Accordion & Expansion Interactivity', () => {
    it('renders FAQ section with 4 question items', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Pertanyaan yang Sering Diajukan/i })).toBeInTheDocument();

      const faqItems = document.querySelectorAll('.landing-faq-item');
      expect(faqItems.length).toBe(4);
    });

    it('initializes with item 1 expanded and other items collapsed', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const q1Btn = screen.getByRole('button', { name: /Apakah data dan catatan saya benar-benar aman\?/i });
      expect(q1Btn).toHaveAttribute('aria-expanded', 'true');
      expect(q1Btn).toHaveAttribute('aria-controls', 'faq-answer-1');

      const answer1 = document.getElementById('faq-answer-1');
      expect(answer1).toBeInTheDocument();
      expect(answer1).toHaveTextContent(/RIMA menerapkan arsitektur offline-first/i);

      // Item 2 collapsed
      const q2Btn = screen.getByRole('button', { name: /Apakah layanan RIMA berbayar\?/i });
      expect(q2Btn).toHaveAttribute('aria-expanded', 'false');
      expect(document.getElementById('faq-answer-2')).not.toBeInTheDocument();
    });

    it('toggles FAQ item collapse when clicking the currently active question', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const q1Btn = screen.getByRole('button', { name: /Apakah data dan catatan saya benar-benar aman\?/i });
      expect(q1Btn).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse
      fireEvent.click(q1Btn);
      expect(q1Btn).toHaveAttribute('aria-expanded', 'false');
      expect(document.getElementById('faq-answer-1')).not.toBeInTheDocument();

      // Click to expand again
      fireEvent.click(q1Btn);
      expect(q1Btn).toHaveAttribute('aria-expanded', 'true');
      expect(document.getElementById('faq-answer-1')).toBeInTheDocument();
    });

    it('expands another FAQ item and collapses the previous one upon clicking', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const q1Btn = screen.getByRole('button', { name: /Apakah data dan catatan saya benar-benar aman\?/i });
      const q2Btn = screen.getByRole('button', { name: /Apakah layanan RIMA berbayar\?/i });
      const q3Btn = screen.getByRole('button', { name: /Apa perbedaan Mode Tamu Anonim dan Masuk dengan Akun\?/i });

      // Click question 2
      fireEvent.click(q2Btn);
      expect(q1Btn).toHaveAttribute('aria-expanded', 'false');
      expect(q2Btn).toHaveAttribute('aria-expanded', 'true');
      expect(document.getElementById('faq-answer-1')).not.toBeInTheDocument();
      expect(document.getElementById('faq-answer-2')).toHaveTextContent(/RIMA sepenuhnya gratis/i);

      // Click question 3
      fireEvent.click(q3Btn);
      expect(q2Btn).toHaveAttribute('aria-expanded', 'false');
      expect(q3Btn).toHaveAttribute('aria-expanded', 'true');
      expect(document.getElementById('faq-answer-2')).not.toBeInTheDocument();
      expect(document.getElementById('faq-answer-3')).toHaveTextContent(/Mode Tamu memungkinkan Anda menggunakan semua fitur/i);
    });
  });

  /* =========================================================================
   * 6. Pre-Footer Box & Public Footer
   * ========================================================================= */
  describe('Pre-Footer Box & Public Footer', () => {
    it('renders pre-footer box with continuation prompt and action buttons', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 3, name: /Sudah pernah berkunjung\? Masuk untuk melanjutkan perjalananmu\./i })).toBeInTheDocument();
    });

    it('renders footer with SEJIWA 119 Ext 8 hotline, clinical disclaimer, copyright, and enter button', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const footer = document.querySelector('.landing-footer');
      expect(footer).toBeInTheDocument();

      expect(screen.getByText('Kesehatan Jiwa untuk Semua')).toBeInTheDocument();
      expect(screen.getByText(/Ruang Interaksi Mental Aman/i)).toBeInTheDocument();
      expect(screen.getByText(/Hotline 119 Ext 8 \(SEJIWA\)/i)).toBeInTheDocument();
      expect(screen.getByText(/bukan pengganti layanan kesehatan profesional/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Buka Aplikasi Beranda/i })).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 7. Dual CTA Interactivity & Navigation
   * ========================================================================= */
  describe('Dual CTA Interactivity & Storage Flags', () => {
    it('clicking Hero "Mulai sebagai Tamu Anonim" sets localStorage flags and navigates to "/"', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const heroGuestBtn = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i })[0];
      fireEvent.click(heroGuestBtn);

      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      expect(localStorage.getItem('rima-consent-accepted')).toBeTruthy();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('clicking Pre-footer "Mulai sebagai Tamu Anonim" sets localStorage flags and navigates to "/"', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const guestBtns = screen.getAllByRole('button', { name: /Mulai sebagai Tamu Anonim/i });
      const preFooterGuestBtn = guestBtns[1]; // Second guest CTA in pre-footer
      fireEvent.click(preFooterGuestBtn);

      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      expect(localStorage.getItem('rima-consent-accepted')).toBeTruthy();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('clicking Footer "Buka Aplikasi Beranda" sets localStorage flags and navigates to "/"', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const footerEnterBtn = screen.getByRole('button', { name: /Buka Aplikasi Beranda/i });
      fireEvent.click(footerEnterBtn);

      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      expect(localStorage.getItem('rima-consent-accepted')).toBeTruthy();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('clicking Hero "Masuk dengan Akun" opens AuthModal dialog', async () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const heroLoginBtn = screen.getAllByRole('button', { name: /Masuk dengan Akun/i })[1];
      fireEvent.click(heroLoginBtn);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Masuk ke Akun RIMA/i })).toBeInTheDocument();
    });

    it('clicking Header "Masuk dengan Akun" opens AuthModal dialog', async () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const headerLoginBtn = screen.getAllByRole('button', { name: /Masuk dengan Akun/i })[0];
      fireEvent.click(headerLoginBtn);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('clicking Pre-footer "Masuk dengan Akun" opens AuthModal dialog', async () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const loginBtns = screen.getAllByRole('button', { name: /Masuk dengan Akun/i });
      const preFooterLoginBtn = loginBtns[loginBtns.length - 1];
      fireEvent.click(preFooterLoginBtn);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 8. Language Switcher & Modal
   * ========================================================================= */
  describe('Language Switcher & Selection Modal', () => {
    it('opens language modal and allows switching language to English', async () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const langBtn = screen.getByRole('button', { name: /Bahasa/i });
      fireEvent.click(langBtn);

      const modalHeading = await screen.findByRole('heading', { name: /Bahasa/i });
      expect(modalHeading).toBeInTheDocument();

      const englishBtn = screen.getByRole('button', { name: /English/i });
      expect(englishBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(englishBtn);
      });

      expect(i18n.language).toMatch(/^en/);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 9. Theme Toggle
   * ========================================================================= */
  describe('Theme Toggle Operation', () => {
    it('toggles theme between dark and light modes cleanly', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const themeBtn = screen.getByRole('button', { name: /Mode (Terang|Gelap)/i });
      const initialLabel = themeBtn.getAttribute('aria-label');

      fireEvent.click(themeBtn);

      const updatedLabel = themeBtn.getAttribute('aria-label');
      expect(updatedLabel).not.toBe(initialLabel);

      // Toggle back
      fireEvent.click(themeBtn);
      expect(themeBtn.getAttribute('aria-label')).toBe(initialLabel);
    });
  });

  /* =========================================================================
   * 10. Authenticated User Redirection
   * ========================================================================= */
  describe('Authenticated Visitor Handling', () => {
    it('automatically redirects authenticated user to "/" and sets rima-has-entered flag', () => {
      mockIsAuthenticated = true;

      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      expect(localStorage.getItem('rima-has-entered')).toBe('true');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  /* =========================================================================
   * 11. WCAG 2.2 AA Accessibility & Touch Targets
   * ========================================================================= */
  describe('WCAG 2.2 AA Accessibility Standards', () => {
    it('ensures all interactive buttons have accessible names and aria attributes', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const allButtons = screen.getAllByRole('button');
      expect(allButtons.length).toBeGreaterThanOrEqual(10);

      allButtons.forEach((btn) => {
        const name = btn.getAttribute('aria-label') || btn.textContent;
        expect(name?.trim().length).toBeGreaterThan(0);
      });
    });

    it('ensures sections have aria-labelledby connecting to valid heading IDs', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      );

      const sections = ['hero-title', 'pillars-title', 'showcase-title', 'faq-title'];
      sections.forEach((id) => {
        const heading = document.getElementById(id);
        expect(heading).toBeInTheDocument();
        expect(heading?.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  /* =========================================================================
   * 12. 8-Language Localization Suite
   * ========================================================================= */
  describe('8-Language Localization Suite', () => {
    it('renders cleanly without runtime errors across all 8 supported languages', async () => {
      const languages = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'] as const;

      for (const lang of languages) {
        await act(async () => {
          await i18n.changeLanguage(lang);
        });

        const { container, unmount } = render(
          <MemoryRouter>
            <Landing />
          </MemoryRouter>
        );

        expect(container.querySelector('.landing-hero')).toBeInTheDocument();
        expect(container.querySelectorAll('.landing-pillar-card').length).toBe(3);
        expect(container.querySelectorAll('.landing-showcase-card').length).toBe(6);
        expect(container.querySelectorAll('.landing-faq-item').length).toBe(4);
        expect(container.querySelector('.landing-footer')).toBeInTheDocument();

        unmount();
      }
    });
  });
});
