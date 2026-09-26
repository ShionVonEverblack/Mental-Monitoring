import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import i18n from '../../i18n/config';
import { SOSButton } from '../safety/SOSButton';

beforeEach(async () => {
  await i18n.changeLanguage('id');
});

describe('SOSButton Component', () => {
  it('renders floating SOS button with accessible label', () => {
    render(<SOSButton />);
    const sosBtn = screen.getByRole('button', { name: /sos - butuh bantuan/i });
    expect(sosBtn).toBeInTheDocument();
  });

  it('opens crisis hotline modal when clicked', () => {
    render(<SOSButton />);
    const sosBtn = screen.getByRole('button', { name: /sos - butuh bantuan/i });
    
    fireEvent.click(sosBtn);

    // Crisis hotline text should now be in document
    expect(screen.getByText(/Into The Light Indonesia/i)).toBeInTheDocument();
    expect(screen.getAllByText(/119 ext 8/i).length).toBeGreaterThan(0);
  });
});
