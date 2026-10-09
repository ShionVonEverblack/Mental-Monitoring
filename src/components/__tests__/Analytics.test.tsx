import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import i18n from '../../i18n/config';
import { Analytics } from '../../pages/Analytics';
import { useMoodStore } from '../../stores/moodStore';

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Pie: ({ data, nameKey }: { data?: Array<Record<string, unknown>>; nameKey?: string }) => (
      <div data-testid="pie-chart">
        {data?.map((entry, idx) => (
          <span key={idx}>{String(nameKey ? entry[nameKey] : '')}</span>
        ))}
      </div>
    ),
    Cell: () => null,
    Tooltip: () => null,
    Legend: () => null,
    BarChart: () => null,
    Bar: () => null,
    LineChart: () => null,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
  };
});

beforeEach(async () => {
  localStorage.clear();
  useMoodStore.setState({
    moods: [
      { id: '1', score: 5, emoji: '😊', factors: [], note: '', createdAt: new Date().toISOString() },
      { id: '2', score: 1, emoji: '😢', factors: [], note: '', createdAt: new Date().toISOString() }
    ]
  });
  await i18n.changeLanguage('id');
});

describe('Analytics Component - Multilingual Mood Distribution', () => {
  it('renders mood distribution chart and localizes score labels in Indonesian', () => {
    render(<Analytics />);
    expect(screen.getByRole('heading', { level: 3, name: /Distribusi Mood/i })).toBeInTheDocument();
    expect(screen.getByText(/Sangat Baik/i)).toBeInTheDocument();
    expect(screen.getByText(/Sangat Buruk/i)).toBeInTheDocument();
  });

  it('localizes score labels in Japanese when language is changed to ja', async () => {
    await act(async () => {
      await i18n.changeLanguage('ja');
    });
    render(<Analytics />);
    expect(screen.getByRole('heading', { level: 3, name: /気分の分布/i })).toBeInTheDocument();
    expect(screen.getByText(/とても良い/i)).toBeInTheDocument();
    expect(screen.getByText(/とても悪い/i)).toBeInTheDocument();
  });

  it('localizes score labels in English when language is changed to en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    render(<Analytics />);
    expect(screen.getByRole('heading', { level: 3, name: /Mood Distribution/i })).toBeInTheDocument();
    expect(screen.getByText(/Great/i)).toBeInTheDocument();
    expect(screen.getByText(/Very Bad/i)).toBeInTheDocument();
  });
});
