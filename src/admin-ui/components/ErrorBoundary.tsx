import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
    // Consider sending to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: 'red' }}>
          Une erreur s'est produite. Veuillez rafraîchir la page.
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;