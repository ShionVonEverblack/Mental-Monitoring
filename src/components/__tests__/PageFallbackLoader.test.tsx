import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import i18n from '../../i18n/config';
import { PageFallbackLoader } from '../common/PageFallbackLoader';

beforeEach(async () => {
  await i18n.changeLanguage('id');
  document.documentElement.removeAttribute('data-sensory');
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-sensory');
  vi.restoreAllMocks();
});

describe('PageFallbackLoader (Trauma-Informed Calm Suspense Fallback)', () => {
  describe('Accessibility & Semantics (WCAG 2.2 AA)', () => {
    it('renders with role="status", aria-live="polite", and aria-busy="true"', () => {
      render(<PageFallbackLoader />);

      const statusContainer = screen.getByRole('status');
      expect(statusContainer).toBeInTheDocument();
      expect(statusContainer).toHaveAttribute('aria-live', 'polite');
      expect(statusContainer).toHaveAttribute('aria-busy', 'true');
    });

    it('provides accessible label on container and in .sr-only announcement span', () => {
      render(<PageFallbackLoader />);

      const statusContainer = screen.getByRole('status');
      const expectedAria = 'Menyiapkan ruang tenang Anda...';

      expect(statusContainer).toHaveAttribute('aria-label', expectedAria);

      const srOnlySpan = statusContainer.querySelector('.sr-only');
      expect(srOnlySpan).toBeInTheDocument();
      expect(srOnlySpan).toHaveTextContent(expectedAria);
    });

    it('marks all visual skeleton placeholders with aria-hidden="true"', () => {
      const { container } = render(<PageFallbackLoader showHero={true} cardsCount={2} />);

      const header = container.querySelector('.page-fallback-header');
      expect(header).toHaveAttribute('aria-hidden', 'true');

      const heroCard = screen.getByTestId('page-fallback-hero-card');
      expect(heroCard).toHaveAttribute('aria-hidden', 'true');

      const grid = screen.getByTestId('page-fallback-grid');
      expect(grid).toHaveAttribute('aria-hidden', 'true');

      const gridCards = screen.getAllByTestId('page-fallback-grid-card');
      for (const card of gridCards) {
        expect(card).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  describe('Calm Status Pill & Soothing Copy', () => {
    it('renders calm status pill with Shield icon, pulsing dot, and reassurance message', () => {
      const { container } = render(<PageFallbackLoader />);

      const pill = container.querySelector('.page-fallback-status-pill');
      expect(pill).toBeInTheDocument();

      const icon = container.querySelector('.page-fallback-status-icon');
      expect(icon).toBeInTheDocument();

      const dot = container.querySelector('.page-fallback-status-dot');
      expect(dot).toBeInTheDocument();

      expect(screen.getByText('Memuat Ruang Aman...')).toBeInTheDocument();
      expect(screen.getByText('Tarik napas perlahan dan rileks sejenak.')).toBeInTheDocument();
    });

    it('allows overriding message, hint, and ariaLabel via props', () => {
      render(
        <PageFallbackLoader
          message="Menyiapkan Sesi Relaksasi..."
          hint="Fokus pada napas masuk dan napas keluar."
          ariaLabel="Sedang menyiapkan sesi relaksasi Anda"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Sedang menyiapkan sesi relaksasi Anda');
      expect(screen.getByText('Menyiapkan Sesi Relaksasi...')).toBeInTheDocument();
      expect(screen.getByText('Fokus pada napas masuk dan napas keluar.')).toBeInTheDocument();
    });
  });

  describe('Skeleton Layout & Structural Props', () => {
    it('renders hero card by default and omits it when showHero={false}', () => {
      const { unmount } = render(<PageFallbackLoader showHero={true} />);
      expect(screen.getByTestId('page-fallback-hero-card')).toBeInTheDocument();
      unmount();

      render(<PageFallbackLoader showHero={false} />);
      expect(screen.queryByTestId('page-fallback-hero-card')).not.toBeInTheDocument();
    });

    it('renders configurable number of grid cards via cardsCount', () => {
      const { unmount } = render(<PageFallbackLoader cardsCount={3} />);
      expect(screen.getAllByTestId('page-fallback-grid-card')).toHaveLength(3);
      unmount();

      render(<PageFallbackLoader cardsCount={0} />);
      expect(screen.queryByTestId('page-fallback-grid')).not.toBeInTheDocument();
    });

    it('accepts and appends custom className', () => {
      render(<PageFallbackLoader className="custom-test-loader" />);
      const container = screen.getByTestId('page-fallback-loader');
      expect(container).toHaveClass('page-fallback-loader');
      expect(container).toHaveClass('custom-test-loader');
    });
  });

  describe('Sensory Mode & Motion Sensitivity Handling', () => {
    it('applies data-sensory attribute when prop is provided', () => {
      const { unmount } = render(<PageFallbackLoader data-sensory="low-stimulation" />);
      let container = screen.getByTestId('page-fallback-loader');
      expect(container).toHaveAttribute('data-sensory', 'low-stimulation');
      unmount();

      render(<PageFallbackLoader data-sensory="calm" />);
      container = screen.getByTestId('page-fallback-loader');
      expect(container).toHaveAttribute('data-sensory', 'calm');
    });

    it('detects and reacts to documentElement data-sensory attribute dynamically', async () => {
      render(<PageFallbackLoader />);
      const container = screen.getByTestId('page-fallback-loader');
      expect(container).not.toHaveAttribute('data-sensory');

      await act(async () => {
        document.documentElement.setAttribute('data-sensory', 'calm');
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      expect(container).toHaveAttribute('data-sensory', 'low-stimulation');

      await act(async () => {
        document.documentElement.setAttribute('data-sensory', 'low-stimulation');
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      expect(container).toHaveAttribute('data-sensory', 'low-stimulation');
    });

    it('detects prefers-reduced-motion media query and switches to low-stimulation mode', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<PageFallbackLoader />);
      const container = screen.getByTestId('page-fallback-loader');
      expect(container).toHaveAttribute('data-sensory', 'low-stimulation');

      window.matchMedia = originalMatchMedia;
    });

    it('contains strictly zero high-velocity spinning elements', () => {
      const { container } = render(<PageFallbackLoader />);
      const html = container.innerHTML;
      expect(html).not.toContain('rimaSpin');
      expect(html).not.toContain('rotate(360deg)');
      expect(html).not.toContain('0.8s linear infinite');
    });
  });

  describe('8-Language i18n Integration', () => {
    it('translates status message and aria label into English', async () => {
      await i18n.changeLanguage('en');
      render(<PageFallbackLoader />);

      expect(screen.getByText('Loading Safe Space...')).toBeInTheDocument();
      expect(screen.getByText('Take a slow breath and relax for a moment.')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Preparing your calm space...');
    });

    it('translates status message and aria label into Japanese', async () => {
      await i18n.changeLanguage('ja');
      render(<PageFallbackLoader />);

      expect(screen.getByText('安全なスペースを読み込み中...')).toBeInTheDocument();
      expect(screen.getByText('ゆっくりと深呼吸をして、一息つきましょう。')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '穏やかなスペースを準備しています...');
    });

    it('translates status message and aria label into Arabic', async () => {
      await i18n.changeLanguage('ar');
      render(<PageFallbackLoader />);

      expect(screen.getByText('جاري تحميل المساحة الآمنة...')).toBeInTheDocument();
      expect(screen.getByText('تنفس ببطء واسترخِ للحظة.')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'جاري إعداد مساحتك الهادئة...');
    });
  });
});
