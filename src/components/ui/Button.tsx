import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  const classes = `btn btn-${variant} btn-${size} ${loading ? 'opacity-75 cursor-not-allowed' : ''} ${className}`;
  
  return (
    <button className={classes.trim()} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="animate-spin mr-2" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
      {!loading && icon && <span className="mr-2 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};
