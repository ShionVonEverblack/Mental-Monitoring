import React, { useEffect, useRef, useId } from 'react';
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

interface ModalStackItem {
  id: string;
  close: () => void;
}

let activeModalStack: ModalStackItem[] = [];
let initialBodyOverflow: string | null = null;

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const instanceId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    if (activeModalStack.length === 0) {
      initialBodyOverflow = document.body.style.overflow || 'auto';
      document.body.style.overflow = 'hidden';
    }

    const item: ModalStackItem = {
      id: instanceId,
      close: () => onCloseRef.current(),
    };
    activeModalStack.push(item);
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      const top = activeModalStack[activeModalStack.length - 1];

      if (e.key === 'Escape') {
        if (top && top.id === instanceId) {
          e.stopPropagation();
          onCloseRef.current();
        }
        return;
      }

      if (e.key === 'Tab' && top && top.id === instanceId) {
        if (!modalRef.current) return;
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      activeModalStack = activeModalStack.filter((m) => m.id !== instanceId);
      if (activeModalStack.length === 0) {
        document.body.style.overflow = initialBodyOverflow ?? 'auto';
        initialBodyOverflow = null;
      }
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, instanceId]);

  if (!isOpen) return null;

  const stackIndex = Math.max(0, activeModalStack.findIndex((m) => m.id === instanceId));
  const overlayStyle: React.CSSProperties = stackIndex > 0
    ? { zIndex: `calc(var(--z-modal, 1000) + ${stackIndex * 20})` }
    : {};

  return createPortal(
    <div className="modal-overlay" style={overlayStyle} onClick={onClose}>
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
