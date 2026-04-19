import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  viewLabel: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ViewErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${this.props.viewLabel} view crashed:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="view-error-boundary">
          <h3>{this.props.viewLabel} view crashed</h3>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
