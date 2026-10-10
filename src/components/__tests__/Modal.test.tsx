import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../ui/Modal';

describe('Modal Component & Stacking Architecture', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('renders content when isOpen is true and hides when false', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal Body</p>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).toBeNull();
    expect(screen.queryByText('Modal Body')).toBeNull();

    rerender(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal Body</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeDefined();
    expect(screen.getByText('Modal Body')).toBeDefined();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal closes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal Body</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal Body</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('auto');
  });

  it('handles stacked modals: Escape closes only top modal and preserves scroll lock', () => {
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();

    const StackedWrapper = ({ openB }: { openB: boolean }) => (
      <>
        <Modal isOpen={true} onClose={onCloseA} title="Modal A">
          <p>Content A</p>
        </Modal>
        {openB && (
          <Modal isOpen={true} onClose={onCloseB} title="Modal B">
            <p>Content B</p>
          </Modal>
        )}
      </>
    );

    const { rerender } = render(<StackedWrapper openB={false} />);
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByText('Modal A')).toBeDefined();

    // Open Modal B on top
    rerender(<StackedWrapper openB={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByText('Modal B')).toBeDefined();

    // Press Escape: only Modal B should receive escape event
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).toHaveBeenCalledTimes(0);

    // Simulate Modal B closing
    rerender(<StackedWrapper openB={false} />);
    // Body overflow MUST still be hidden because Modal A is still open!
    expect(document.body.style.overflow).toBe('hidden');

    // Press Escape again: now Modal A should close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseA).toHaveBeenCalledTimes(1);
  });

  it('clicking close button or overlay triggers onClose', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Click Test">
        <button>Inside Button</button>
      </Modal>
    );

    // Clicking close button
    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Clicking inside modal content does not trigger onClose
    const insideBtn = screen.getByRole('button', { name: /inside button/i });
    fireEvent.click(insideBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
