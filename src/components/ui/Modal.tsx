import React, { useEffect, useRef } from 'react';
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

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-lg' : 'max-w-2xl';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`bg-card text-card-foreground w-full ${sizeClasses} rounded-xl shadow-xl relative z-[101] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={20} />} aria-label="Close modal" />
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};
