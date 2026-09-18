import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-canvas text-dark-text text-center">
          <div className="max-w-md w-full bg-white border border-border p-6 rounded-2xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark-text">Something went wrong</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              We encountered an unexpected display glitch. Don't worry, your data and preferences are safe.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              onClick={this.handleReset}
              className="mx-auto text-xs font-bold"
            >
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
