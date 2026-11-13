import React from 'react';
import { RotateCcw } from 'lucide-react';
import { clearSessionStorage } from '../utils/storage';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private handleRecover = () => {
    clearSessionStorage();
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-[#09090D] text-[#F8FAFC] flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121A] p-7 text-center space-y-5">
            <h1 className="font-display text-2xl font-extrabold text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The current round encountered an unexpected error. You can safely
              reset the active round and return to the home screen.
            </p>
            <button
              type="button"
              onClick={this.handleRecover}
              className="w-full min-h-[52px] rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-bold tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RECOVER GAME</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
