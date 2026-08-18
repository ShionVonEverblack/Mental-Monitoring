import React, { useCallback } from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card = ({ children, className = '', variant = 'default', padding = 'md', onClick }: CardProps) => {
  const cardClass = variant === 'glass' ? 'card card-glass' : 'card';
  const paddingStyle = padding === 'none' ? { padding: 0 } : padding === 'sm' ? { padding: 'var(--spacing-sm)' } : padding === 'lg' ? { padding: 'var(--spacing-xl)' } : {};
  const clickableStyle = onClick ? { cursor: 'pointer' } : {};

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <div 
      className={`${cardClass} ${className}`} 
      style={{ ...paddingStyle, ...clickableStyle }} 
      onClick={onClick}
      {...(onClick ? { role: 'button', tabIndex: 0, onKeyDown: handleKeyDown } : {})}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

Card.Body = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
