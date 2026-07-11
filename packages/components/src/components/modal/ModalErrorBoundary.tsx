import React from 'react';

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error) => void;
}

export class ModalErrorBoundary extends React.Component<
  ModalErrorBoundaryProps,
  ModalErrorBoundaryState
> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ModalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Modal content error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultModalErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultModalErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry
}) => (
  <div className="modal-error">
    <h3>Something went wrong</h3>
    <p className="error-message">{error.message}</p>
    <button onClick={retry} className="button button--primary">
      Try again
    </button>
  </div>
);