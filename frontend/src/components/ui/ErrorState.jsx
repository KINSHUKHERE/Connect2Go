import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please check your connection and try again.",
  onRetry,
  className = ""
}) {
  return (
    <div className={`p-8 bg-white border border-red-100 rounded-2xl text-center space-y-4 shadow-soft max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
        <AlertCircle className="w-6 h-6 stroke-[2.2]" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-dark-text">{title}</h4>
        <p className="text-xs text-dark-muted leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="mx-auto text-xs font-semibold"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
