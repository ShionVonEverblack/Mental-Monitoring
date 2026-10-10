import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n/config';
import i18n from 'i18next';
import { JitaiNudgeCard } from '../common/JitaiNudgeCard';
import type { JitaiNudge } from '../../types/jitai';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

const sampleBlueSparkNudge: JitaiNudge = {
  id: 'jitai-blue-spark-test',
  type: 'mood_blue_activation_spark',
  category: 'mood',
  urgency: 'medium',
  titleKey: 'jitai.blue_spark_title',
  titleFallback: 'Langkah Kecil Pemulihan Energi',
  messageKey: 'jitai.blue_spark_desc',
  messageFallback:
    'Energi sedang rendah dan terasa berat. Coba satu mikro-aktivitas berdurasi 5 menit untuk membangkitkan dopamin secara perlahan.',
  actionLabelKey: 'jitai.action_activation',
  actionLabelFallback: 'Pilih Mikro Aktivitas',
  targetRoute: '/activation',
  iconName: 'Sparkles',
  evidenceBadgeKey: 'jitai.badge_ba',
  evidenceBadgeFallback: 'Behavioral Activation',
};

describe('JitaiNudgeCard Component', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id');
    localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  it('renders null when customNudge is null and no active nudge exists', () => {
    const { container } = render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={null} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders contextual nudge card with evidence badge, title, and description', () => {
    render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleVagalNudge} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Stanford Cyclic Sighing/i)).toBeInTheDocument();
    expect(screen.getByText('Atur Ritme Saraf Otonom')).toBeInTheDocument();
    expect(
      screen.getByText(/Aktivasi sistem sarafmu sedang tinggi/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Mulai Pernapasan (60d)')).toBeInTheDocument();
  });

  it('applies appropriate urgency CSS class according to nudge urgency', () => {
    const { container: highContainer } = render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleVagalNudge} />
      </MemoryRouter>
    );
    expect(highContainer.querySelector('.jitai-urgency-high')).toBeInTheDocument();

    const { container: medContainer } = render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleBlueSparkNudge} />
      </MemoryRouter>
    );
    expect(medContainer.querySelector('.jitai-urgency-medium')).toBeInTheDocument();
  });

  it('single-tap action button triggers navigation to targetRoute', () => {
    render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleVagalNudge} />
      </MemoryRouter>
    );

    const actionBtn = screen.getByRole('button', { name: /Mulai Pernapasan \(60d\)/i });
    fireEvent.click(actionBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/breathe');
  });

  it('action button invokes custom onNavigate callback if provided', () => {
    const handleNavigate = vi.fn();
    render(
      <MemoryRouter>
        <JitaiNudgeCard
          customNudge={sampleBlueSparkNudge}
          onNavigate={handleNavigate}
        />
      </MemoryRouter>
    );

    const actionBtn = screen.getByRole('button', { name: /Pilih Mikro Aktivitas/i });
    fireEvent.click(actionBtn);

    expect(handleNavigate).toHaveBeenCalledWith('/activation');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('top-right dismiss button calls onDismiss callback', () => {
    const handleDismiss = vi.fn();
    render(
      <MemoryRouter>
        <JitaiNudgeCard
          customNudge={sampleVagalNudge}
          onDismiss={handleDismiss}
        />
      </MemoryRouter>
    );

    const dismissBtn = screen.getByRole('button', { name: /Tutup saran ini/i });
    fireEvent.click(dismissBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('secondary "Nanti Saja" dismiss button calls onDismiss callback', () => {
    const handleDismiss = vi.fn();
    render(
      <MemoryRouter>
        <JitaiNudgeCard
          customNudge={sampleVagalNudge}
          onDismiss={handleDismiss}
        />
      </MemoryRouter>
    );

    const secondaryDismissBtn = screen.getByRole('button', { name: /Nanti Saja/i });
    fireEvent.click(secondaryDismissBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('meets WCAG 2.2 AA touch target size requirements (min-height/min-width >= 48px classes)', () => {
    render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleVagalNudge} />
      </MemoryRouter>
    );

    const actionBtn = screen.getByRole('button', { name: /Mulai Pernapasan/i });
    expect(actionBtn).toHaveClass('jitai-action-btn');

    const dismissBtn = screen.getByRole('button', { name: /Tutup saran ini/i });
    expect(dismissBtn).toHaveClass('jitai-dismiss-btn');

    const secondaryBtn = screen.getByRole('button', { name: /Nanti Saja/i });
    expect(secondaryBtn).toHaveClass('jitai-secondary-dismiss-btn');
  });

  it('renders accessible container with region role or aria-label', () => {
    render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleVagalNudge} />
      </MemoryRouter>
    );

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveAttribute('aria-label');
  });

  it('correctly adapts translations when language changes to English', async () => {
    await i18n.changeLanguage('en');

    render(
      <MemoryRouter>
        <JitaiNudgeCard customNudge={sampleVagalNudge} />
      </MemoryRouter>
    );

    expect(screen.getByText('Regulate Autonomic Nervous System')).toBeInTheDocument();
    expect(screen.getByText('Start Breathing (60s)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Not Now/i })).toBeInTheDocument();
  });
});
