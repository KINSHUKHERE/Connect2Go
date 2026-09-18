import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-soft hover:shadow-soft-hover',
    secondary: 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/60',
    outline: 'bg-white hover:bg-slate-50 text-dark-text border border-border shadow-xs',
    ghost: 'hover:bg-slate-100/80 text-dark-muted hover:text-dark-text',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-soft',
  };

  const sizes = {
    sm: 'text-xs h-9 px-3.5 rounded-md gap-1.5',
    md: 'text-sm h-11 px-5 rounded-md gap-2 min-h-[44px]',
    lg: 'text-base h-12 px-6 rounded-lg gap-2.5 min-h-[48px]',
    icon: 'h-11 w-11 rounded-full p-0 min-h-[44px] min-w-[44px]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
