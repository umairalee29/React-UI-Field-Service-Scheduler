'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-sm font-medium text-text-primary mb-1">Something went wrong</p>
            <p className="text-xs text-text-secondary mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-xs text-accent-blue hover:underline"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
