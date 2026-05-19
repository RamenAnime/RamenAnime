import { Component, ReactNode } from 'react';
import i18n from 'i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <h2 className="text-xl font-bold">{i18n.t('errorBoundary.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || i18n.t('errorBoundary.body')}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              {i18n.t('errorBoundary.refresh')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
