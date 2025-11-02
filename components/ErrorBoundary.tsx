import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: Removed explicit 'public' modifiers. While valid TypeScript, this can resolve obscure tooling or parser errors like the one reported for `this.props`.
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-amber-100 p-4">
            <div className="max-w-lg w-full p-8 bg-white shadow-2xl rounded-xl text-center border border-red-200">
                <h1 className="text-3xl font-bold text-red-800 mb-4">Oops! Something went wrong.</h1>
                <p className="text-gray-700 mb-6">
                    An unexpected error occurred. This might be due to a missing API key or a network issue. 
                    Please try refreshing the page. If the problem persists, please check the console for more details.
                </p>
                {/* Fix: Changed check to this.state.error to ensure it is not null before accessing its properties, preventing a potential runtime error. */}
                {this.state.error && (
                    <details className="text-left bg-gray-100 p-3 rounded text-sm text-gray-600">
                        <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
                        <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                            {this.state.error.message}
                        </pre>
                    </details>
                )}
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-amber-700 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-800 transition-colors duration-300"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
