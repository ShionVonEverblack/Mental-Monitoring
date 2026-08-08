import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      padding: '40px 20px',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid hsla(215, 65%, 55%, 0.2)',
        borderTopColor: 'var(--color-primary, #4a7cf7)',
        borderRadius: '50%',
        animation: 'rimaSpin 0.8s linear infinite'
      }} />
      {message && (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes rimaSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
