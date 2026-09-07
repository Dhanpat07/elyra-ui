import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Error Boundary Class Component
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface-800 rounded-2xl border border-white/[0.08] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-6">
              We encountered an unexpected error. Our team has been notified.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-sm text-slate-400 cursor-pointer hover:text-white mb-2">
                  <span className="flex items-center gap-2">
                    <Bug size={14} />
                    Error Details
                  </span>
                </summary>
                <pre className="p-4 rounded-xl bg-surface-900 text-xs text-red-400 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-700 text-white font-medium hover:bg-surface-600 transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional Error Display Component
export function ErrorDisplay({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
  showRetry = true,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 transition-all flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}

// Empty State Component
export function EmptyState({
  icon: Icon = AlertTriangle,
  title,
  message,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-500" />
      </div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 mb-4">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// 404 Not Found Component
export function NotFound() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-brand-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all flex items-center gap-2 mx-auto"
        >
          <Home size={16} />
          Back to Home
        </button>
      </div>
    </div>
  );
}

// Offline Indicator
export function OfflineIndicator() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-500/90 text-white text-sm font-medium flex items-center gap-2 z-50 shadow-lg">
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      You're offline
    </div>
  );
}
