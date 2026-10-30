import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-white rounded-2xl border border-red-200 shadow-sm max-w-2xl mx-auto text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {this.props.fallbackTitle || 'Unable to display this view'}
            </h3>
            <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
              A temporary issue prevented this component from rendering properly. You can try refreshing or return to the main dashboard.
            </p>
            {this.state.error?.message && (
              <div className="mt-3 p-2 bg-red-50 text-red-800 text-[11px] font-mono rounded border border-red-200 text-left max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-3.5 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Retry Action</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.search = '';
              }}
              className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Home size={13} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
