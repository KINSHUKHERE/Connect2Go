import React from 'react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  emoji = "📍",
  title = "No items found",
  message = "Try adjusting your filters or search criteria.",
  actionLabel,
  onAction,
  className = ""
}) {
  return (
    <div className={`p-10 sm:p-12 bg-white rounded-2xl border border-border/80 text-center space-y-4 shadow-soft max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-2xl text-brand-600">
        {Icon ? <Icon className="w-7 h-7 stroke-[2]" /> : emoji}
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-dark-text tracking-tight">{title}</h4>
        <p className="text-xs text-dark-muted leading-relaxed max-w-sm mx-auto">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          className="font-bold text-xs"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
