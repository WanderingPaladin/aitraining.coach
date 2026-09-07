'use client';

import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onReset: () => void;
  onBack?: () => void;
};

type State = { failed: boolean };

export default class AssistantErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Assistant] render error', error);
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="feedback-error-state" role="alert">
        <p>Something went wrong</p>
        <p>We couldn&apos;t load this part of the assistant.</p>
        <div className="feedback-success-actions">
          <button
            type="button"
            className="feedback-primary"
            onClick={() => {
              this.setState({ failed: false });
              this.props.onReset();
            }}
          >
            Try Again
          </button>
          <button
            type="button"
            className="feedback-secondary"
            onClick={() => {
              this.setState({ failed: false });
              (this.props.onBack ?? this.props.onReset)();
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }
}
