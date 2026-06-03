import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-heading text-3xl text-foreground">Erreur de chargement</h1>
            <p className="font-body text-sm text-muted-foreground">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-accent text-accent-foreground font-heading px-6 py-3 rounded-lg"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
