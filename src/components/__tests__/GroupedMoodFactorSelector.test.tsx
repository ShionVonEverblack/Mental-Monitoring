import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupedMoodFactorSelector } from '../mood/GroupedMoodFactorSelector';
import i18n from '../../i18n/config';

describe('GroupedMoodFactorSelector Component', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id');
  });

  it('renders all 4 clean domain categories eliminating choice overload', () => {
    const handleToggle = vi.fn();
    render(
      <GroupedMoodFactorSelector
        selectedFactors={[]}
        onToggleFactor={handleToggle}
      />
    );

    // 4 Domains
    expect(screen.getByText(/Diri Sendiri/i)).toBeInTheDocument();
    expect(screen.getByText(/Hubungan Sosial/i)).toBeInTheDocument();
    expect(screen.getByText(/Beban Aktivitas/i)).toBeInTheDocument();
    expect(screen.getByText(/Kondisi Fisik/i)).toBeInTheDocument();
  });

  it('renders factor chips grouped under domains with proper accessibility attributes', () => {
    const handleToggle = vi.fn();
    render(
      <GroupedMoodFactorSelector
        selectedFactors={['meditation', 'sleep']}
        onToggleFactor={handleToggle}
      />
    );

    // Factors inside domains
    const medChip = screen.getByRole('button', { name: /Meditasi/i });
    expect(medChip).toBeInTheDocument();
    expect(medChip).toHaveClass('active');
    expect(medChip).toHaveAttribute('aria-pressed', 'true');

    const sleepChip = screen.getByRole('button', { name: /Tidur/i });
    expect(sleepChip).toBeInTheDocument();
    expect(sleepChip).toHaveClass('active');
    expect(sleepChip).toHaveAttribute('aria-pressed', 'true');

    const workChip = screen.getByRole('button', { name: /Pekerjaan/i });
    expect(workChip).toBeInTheDocument();
    expect(workChip).not.toHaveClass('active');
    expect(workChip).toHaveAttribute('aria-pressed', 'false');

    // Click toggles factor
    fireEvent.click(workChip);
    expect(handleToggle).toHaveBeenCalledWith('work');
  });

  it('supports English localization for domains and factor chips seamlessly', async () => {
    await i18n.changeLanguage('en');
    const handleToggle = vi.fn();
    render(
      <GroupedMoodFactorSelector
        selectedFactors={[]}
        onToggleFactor={handleToggle}
      />
    );

    expect(screen.getByText(/Self & Inner Life/i)).toBeInTheDocument();
    expect(screen.getByText(/Social Relationships/i)).toBeInTheDocument();
    expect(screen.getByText(/Activity & Workload/i)).toBeInTheDocument();
    expect(screen.getByText(/Physical Health/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Sleep/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Meditation/i })).toBeInTheDocument();
  });

  it('renders through MoodSelector wrapper with backward compatibility', async () => {
    const { MoodSelector } = await import('../mood/MoodSelector');
    const handleToggle = vi.fn();
    const { container } = render(
      <MoodSelector
        selectedFactors={['hobby']}
        onToggleFactor={handleToggle}
        className="test-mood-selector"
      />
    );

    expect(container.querySelector('.test-mood-selector')).toBeInTheDocument();
    const hobbyBtn = screen.getByRole('button', { name: /Hobi/i });
    expect(hobbyBtn).toHaveClass('active');
  });
});
