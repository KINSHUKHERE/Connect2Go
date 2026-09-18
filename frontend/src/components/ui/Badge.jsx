import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-semibold select-none transition-colors';

  const variants = {
    default: 'bg-brand-50 text-brand-700 border border-brand-200/70',
    primary: 'bg-brand-500 text-white',
    mint: 'bg-brand-100 text-brand-800',
    outline: 'bg-white text-dark-muted border border-border',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    pink: 'bg-pink-50 text-pink-700 border border-pink-200/80',
    sports: 'bg-blue-50 text-blue-700 border border-blue-200/70',
    anon: 'bg-purple-50 text-purple-700 border border-purple-200/70',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full gap-1',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 rounded-full gap-2',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
}
