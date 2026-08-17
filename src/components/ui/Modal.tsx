import React, { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', trapFocus);
      document.body.style.overflow = 'hidden';
      // Focus the modal after a tick to ensure it's rendered
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = 'auto';
      // Restore focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose, trapFocus]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: size === 'sm' ? '400px' : size === 'md' ? '500px' : '700px'
        }}
      >
        <div className="modal-header">
          {title && <h2 id={titleId} style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{title}</h2>}
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={20} />} aria-label="Close modal" />
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};
