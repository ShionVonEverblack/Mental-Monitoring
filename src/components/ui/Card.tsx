import React from 'react';

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

  return (
    <div 
      className={`${cardClass} ${className}`} 
      style={{ ...paddingStyle, ...clickableStyle }} 
      onClick={onClick}
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
