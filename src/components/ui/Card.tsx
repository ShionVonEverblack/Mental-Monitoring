import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card = ({ children, className = '', variant = 'default', padding = 'md', onClick }: CardProps) => {
  const baseClasses = 'card rounded-xl overflow-hidden';
  const variantClasses = variant === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-card text-card-foreground shadow-sm';
  const paddingClasses = padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-4' : padding === 'md' ? 'p-6' : 'p-8';
  const clickableClasses = onClick ? 'cursor-pointer transition-transform active:scale-[0.98]' : '';

  return (
    <div className={`${baseClasses} ${variantClasses} ${paddingClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

Card.Body = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex-1 ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mt-4 pt-4 border-t border-border ${className}`}>{children}</div>
);
