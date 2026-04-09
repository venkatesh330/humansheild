import React from 'react';

export class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-black text-red-500 mb-4">SYSTEM_FAILURE</h2>
          <p className="text-slate-400 max-w-lg font-mono text-sm mb-6">
            {this.state.error?.message || "An unexpected system crash was detected. We've logged this anomaly."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-500 text-black font-black uppercase text-xs rounded-full hover:bg-cyan-400 transition"
          >
            Reboot Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
