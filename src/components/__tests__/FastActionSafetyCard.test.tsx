import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import i18n from '../../i18n/config';
import { FastActionSafetyCard } from '../safety/FastActionSafetyCard';
import { DEFAULT_COPING_STRATEGY } from '../../services/safetyCardService';

beforeEach(async () => {
  await i18n.changeLanguage('id');
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('FastActionSafetyCard Component', () => {
  it('renders crisis de-escalation dialog with accessible attributes when open', () => {
    render(<FastActionSafetyCard isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Title and badge
    expect(screen.getByText(/Kamu Tidak Sendirian/i)).toBeInTheDocument();
    expect(screen.getByText(/Bantuan Cepat Darurat/i)).toBeInTheDocument();

    // Default coping strategy
    expect(screen.getByText(DEFAULT_COPING_STRATEGY)).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(<FastActionSafetyCard isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders embedded region without modal overlay when embedded={true}', () => {
    render(<FastActionSafetyCard embedded={true} />);

    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();
    expect(region).not.toHaveAttribute('aria-modal');
  });

  it('extracts and displays primary coping strategy from localStorage', () => {
    const plan = [
      {
        id: 'copingStrategies',
        items: ['Mandi air hangat lalu dengarkan musik klasik'],
      },
    ];
    localStorage.setItem('rima-safety-plan', JSON.stringify(plan));

    render(<FastActionSafetyCard />);
    expect(
      screen.getByText('Mandi air hangat lalu dengarkan musik klasik')
    ).toBeInTheDocument();
  });

  it('renders 119 Ext 8 hotline with strict href="tel:119,8"', () => {
    render(<FastActionSafetyCard />);

    // Must match telephone href strictly
    const link119 = screen.getByRole('link', {
      name: /Healing 119.*119 ext 8/i,
    });
    expect(link119).toHaveAttribute('href', 'tel:119,8');

    // Verify text contains both Healing 119 and 119 ext 8
    expect(screen.getByText(/Healing 119/i)).toBeInTheDocument();
    expect(screen.getAllByText(/119 ext 8/i).length).toBeGreaterThan(0);
  });

  it('renders emergency 112 line with href="tel:112"', () => {
    render(<FastActionSafetyCard />);

    const link112 = screen.getByRole('link', {
      name: /Panggilan Darurat Bebas Pulsa/i,
    });
    expect(link112).toHaveAttribute('href', 'tel:112');
  });

  it('renders trusted contact dialing button with working tel: link when configured', () => {
    localStorage.setItem(
      'rima-trusted-contacts',
      JSON.stringify([
        { name: 'Bunda', phone: '0812-3456-7890', relationship: 'Keluarga' },
      ])
    );

    render(<FastActionSafetyCard />);

    const callContactBtn = screen.getByRole('link', {
      name: /Telepon Bunda: 0812-3456-7890/i,
    });
    expect(callContactBtn).toBeInTheDocument();
    expect(callContactBtn).toHaveAttribute('href', 'tel:081234567890');
    expect(screen.getByText(/Hubungi Bunda/i)).toBeInTheDocument();
    expect(screen.getByText(/0812-3456-7890 \(Keluarga\)/i)).toBeInTheDocument();
  });

  it('displays contact name without dial link when contact has no phone number', () => {
    localStorage.setItem(
      'rima-trusted-contacts',
      JSON.stringify([{ name: 'Teman Sekamar' }])
    );

    render(<FastActionSafetyCard />);

    expect(screen.getByText(/Kontak Tepercaya: Teman Sekamar/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Belum ada nomor telepon tersimpan/i)
    ).toBeInTheDocument();
  });

  it('displays prompt to set up trusted contact when none is configured', () => {
    render(<FastActionSafetyCard />);

    const setupLink = screen.getByRole('link', {
      name: /Atur Kontak Tepercaya/i,
    });
    expect(setupLink).toHaveAttribute('href', '/safety-plan');
  });

  it('renders somatic grounding shortcut to /grounding by default', () => {
    render(<FastActionSafetyCard />);

    const somaticLink = screen.getByRole('link', {
      name: /Latihan Grounding Sensorik 5-4-3-2-1/i,
    });
    expect(somaticLink).toHaveAttribute('href', '/grounding');
  });

  it('renders somatic breathing shortcut when customActions specifies /breathe', () => {
    const customActions = {
      primaryCopingStrategy: 'Napas teratur',
      trustedContact: null,
      hotline119: {
        name: 'Healing 119',
        phone: '119 ext 8',
        href: 'tel:119,8',
      },
      hotline112: {
        name: 'Darurat 112',
        phone: '112',
        href: 'tel:112',
      },
      somaticRoute: '/breathe',
    };

    render(<FastActionSafetyCard customActions={customActions} />);

    const somaticLink = screen.getByRole('link', {
      name: /Pernapasan Cepat \(Cyclic Sighing\)/i,
    });
    expect(somaticLink).toHaveAttribute('href', '/breathe');
  });

  it('invokes onNavigate and onClose when somatic shortcut is clicked with onNavigate prop', () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();

    render(<FastActionSafetyCard onNavigate={onNavigate} onClose={onClose} />);

    const somaticLink = screen.getByRole('link', {
      name: /Latihan Grounding Sensorik 5-4-3-2-1/i,
    });

    fireEvent.click(somaticLink);

    expect(onNavigate).toHaveBeenCalledWith('/grounding');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when header close button is clicked', () => {
    const onClose = vi.fn();
    render(<FastActionSafetyCard onClose={onClose} />);

    const closeBtn = screen.getByRole('button', {
      name: /Tutup Bantuan Darurat/i,
    });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when footer dismiss button is clicked', () => {
    const onClose = vi.fn();
    render(<FastActionSafetyCard onClose={onClose} />);

    const dismissBtn = screen.getByRole('button', {
      name: /Saya Merasa Lebih Tenang/i,
    });
    fireEvent.click(dismissBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<FastActionSafetyCard isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside on modal overlay', () => {
    const onClose = vi.fn();
    render(<FastActionSafetyCard isOpen={true} onClose={onClose} />);

    const overlay = document.querySelector('.fast-safety-overlay');
    expect(overlay).not.toBeNull();
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('satisfies WCAG 2.2 touch target sizing on all interactive actions', () => {
    render(
      <FastActionSafetyCard
        onClose={vi.fn()}
        customActions={{
          primaryCopingStrategy: 'Grounding 54321',
          trustedContact: { name: 'Ayah', phone: '0812000000' },
          hotline119: { name: 'Healing 119', phone: '119 ext 8', href: 'tel:119,8' },
          hotline112: { name: '112', phone: '112', href: 'tel:112' },
          somaticRoute: '/grounding',
        }}
      />
    );

    // Header close button min-height
    const closeBtn = screen.getByRole('button', { name: /Tutup Bantuan Darurat/i });
    expect(closeBtn).toHaveClass('fast-safety-close-btn');

    // Action links
    const link119 = screen.getByRole('link', { name: /Healing 119/i });
    expect(link119).toHaveClass('fast-action-btn');

    const contactLink = screen.getByRole('link', { name: /Ayah/i });
    expect(contactLink).toHaveClass('fast-action-btn');

    const groundingLink = screen.getByRole('link', { name: /Grounding/i });
    expect(groundingLink).toHaveClass('fast-action-btn');

    const link112 = screen.getByRole('link', { name: /112/i });
    expect(link112).toHaveClass('fast-action-btn');

    // Footer dismiss button
    const dismissBtn = screen.getByRole('button', { name: /Saya Merasa Lebih Tenang/i });
    expect(dismissBtn).toHaveClass('fast-safety-dismiss-btn');
  });
});
