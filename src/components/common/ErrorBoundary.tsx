import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const getLang = (): string => {
  try { return localStorage.getItem('i18nextLng') || 'id'; } catch { return 'id'; }
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RIMA Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--bg-primary, #10141d)',
          color: 'var(--text-primary, #f0f4f8)',
          fontFamily: 'var(--font-family-base, sans-serif)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--bg-card, #1a202c)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            borderRadius: '24px',
            padding: '32px 24px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'hsla(35, 75%, 60%, 0.15)',
              color: 'var(--color-warm, #e29547)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              {getLang() === 'en' ? 'Technical Issue' : 'Ada Kendala Teknis'}
            </h1>

            <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary, #a0aec0)', lineHeight: 1.6, margin: 0 }}>
              {getLang() === 'en' ? "Don't worry, your mood and journal data is safe on your device. Try reloading the app." : 'Jangan khawatir, data mood dan jurnal kamu tetap aman di perangkat. Cobalah memuat ulang aplikasi.'}
            </p>

            {this.state.error && (
              <div style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--bg-secondary, #141824)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary, #718096)',
                fontFamily: 'monospace',
                overflowX: 'auto',
                textAlign: 'left'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={18} />
                <span>{getLang() === 'en' ? 'Reload' : 'Muat Ulang'}</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn btn-ghost"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Home size={18} />
                <span>{getLang() === 'en' ? 'Home' : 'Beranda'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
