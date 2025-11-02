import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: Replaced constructor with a class property for state initialization.
  // This common pattern resolves errors where TypeScript fails to recognize
  // `this.state` and `this.props` on the component instance.
  public state: State = {
    hasError: false,
    error: undefined,
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
        <div className="min-h-screen flex items-center justify-center bg-amber-100 dark:bg-gray-900 p-4">
            <div className="max-w-lg w-full p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-xl text-center border border-red-200 dark:border-red-800">
                <h1 className="text-3xl font-bold text-red-800 dark:text-red-400 mb-4">Oops! Something went wrong.</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    An unexpected error occurred. This might be due to a missing API key or a network issue. 
                    Please try refreshing the page. If the problem persists, please check the console for more details.
                </p>
                {this.state.error && (
                    <details className="text-left bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-600 dark:text-gray-400">
                        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">Error Details</summary>
                        <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                            {this.state.error.message}
                        </pre>
                    </details>
                )}
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-amber-700 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 transition-colors duration-300"
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