import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../../i18n/config';
import { ChatbotDrawer } from '../ChatbotDrawer';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ChatbotDrawer Component', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id');
    vi.useFakeTimers();
    mockNavigate.mockClear();
    // Polyfill scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders floating trigger button when drawer is closed', () => {
    renderWithRouter(<ChatbotDrawer />);
    const trigger = screen.getByRole('button', { name: /Buka Pendamping Psikoedukasi AI/i });
    expect(trigger).toBeInTheDocument();
  });

  it('opens drawer when floating trigger button is clicked', () => {
    renderWithRouter(<ChatbotDrawer />);
    const trigger = screen.getByRole('button', { name: /Buka Pendamping Psikoedukasi AI/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /RIMA AI Companion/i })).toBeInTheDocument();
    expect(screen.getByText(/Bukan pengganti diagnosis medis/i)).toBeInTheDocument();
  });

  it('renders suggested topic chips when fresh and handles chip click', async () => {
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Topik Panduan Populer/i)).toBeInTheDocument();
    const panicChip = screen.getByRole('button', { name: /Cara atasi serangan panik/i });
    expect(panicChip).toBeInTheDocument();

    fireEvent.click(panicChip);

    // Fast-forward simulated thinking timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Cara atasi serangan panik/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mencari panduan klinis terverifikasi/i)).not.toBeInTheDocument();
  });

  it('allows typing and submitting a query', async () => {
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Ketik pertanyaan atau ceritakan perasaanmu/i);
    const sendBtn = screen.getByLabelText(/Kirim pesan/i);

    fireEvent.change(input, { target: { value: 'Bagaimana teknik pernapasan untuk cemas?' } });
    expect(sendBtn).not.toBeDisabled();

    fireEvent.click(sendBtn);

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Bagaimana teknik pernapasan untuk cemas/i)).toBeInTheDocument();
  });

  it('displays crisis hotline options when severe crisis is detected', async () => {
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Ketik pertanyaan atau ceritakan perasaanmu/i);
    const sendBtn = screen.getByLabelText(/Kirim pesan/i);

    fireEvent.change(input, { target: { value: 'Saya ingin bunuh diri malam ini' } });
    fireEvent.click(sendBtn);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Bantuan Darurat & Keselamatan Segera/i)).toBeInTheDocument();
    expect(screen.getByText(/SEJIWA 119 Ext 8/i)).toBeInTheDocument();
  });

  it('navigates and closes when clicking an interactive action button', async () => {
    const handleClose = vi.fn();
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={handleClose} />);

    const input = screen.getByPlaceholderText(/Ketik pertanyaan atau ceritakan perasaanmu/i);
    fireEvent.change(input, { target: { value: 'Apa itu teknik grounding 5-4-3-2-1?' } });
    fireEvent.click(screen.getByLabelText(/Kirim pesan/i));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const actionBtn = screen.getByRole('button', { name: /Coba Latihan Grounding/i });
    expect(actionBtn).toBeInTheDocument();

    fireEvent.click(actionBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/grounding');
    expect(handleClose).toHaveBeenCalled();
  });

  it('clears chat history when trash button is clicked', async () => {
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Ketik pertanyaan atau ceritakan perasaanmu/i);
    fireEvent.change(input, { target: { value: 'Halo' } });
    fireEvent.click(screen.getByLabelText(/Kirim pesan/i));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const clearBtn = screen.getByLabelText(/Hapus riwayat percakapan/i);
    fireEvent.click(clearBtn);

    // Only welcome message remains
    expect(screen.getByText(/Halo, saya RIMA AI Companion/i)).toBeInTheDocument();
    expect(screen.queryByText('Halo')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText(/Tutup percakapan/i);
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();
    renderWithRouter(<ChatbotDrawer isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});
