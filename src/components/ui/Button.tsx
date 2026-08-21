import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classes = `btn btn-${variant} ${size !== 'md' ? `btn-${size}` : ''} ${className}`;
  
  return (
    <button className={classes.trim()} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
      {!loading && icon && <span style={{ marginRight: children ? '0.5rem' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
