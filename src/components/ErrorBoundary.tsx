import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected application error.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('HARRBOTIX ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-white/75 bg-white/80 p-6 shadow-xl backdrop-blur-xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/75 bg-rose-500/15 text-rose-700">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="text-xs leading-relaxed text-slate-600 break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-5 py-2.5 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reload HARRBOTIX</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
