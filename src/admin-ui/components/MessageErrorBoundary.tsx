import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode; // 👈 Properly type children
}

export class MessageErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message.includes('asynchronous response')) {
      console.error('Caught message error from:', 
        window.location.href, 
        error.stack
      );
    }
  }

  render() {
    return this.state.hasError 
      ? <div>Message error occurred</div> 
      : this.props.children;
  }
}
