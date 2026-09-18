import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(function Input(
  { label, error, helperText, icon: Icon, className, ...props },
  ref
) {
  return (
    <div className="w-full text-left space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-dark-muted tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-dark-faint pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full h-11 bg-white border border-border rounded-md text-sm text-dark-text placeholder:text-dark-faint transition-all duration-150',
              'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              Icon ? 'pl-10 pr-3.5' : 'px-3.5',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-dark-faint">{helperText}</p>
      )}
    </div>
  );
});
