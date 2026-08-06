import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, icon, className = '', multiline, rows = 3, ...props }, ref) => {
    const inputClasses = `w-full bg-background border ${error ? 'border-danger' : 'border-input'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${icon ? 'pl-10' : ''}`;
    
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-muted-foreground flex items-center justify-center">
              {icon}
            </div>
          )}
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={inputClasses}
              rows={rows}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              className={inputClasses}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
