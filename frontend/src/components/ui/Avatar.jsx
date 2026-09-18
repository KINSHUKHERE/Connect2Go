import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, Shield } from 'lucide-react';

export function Avatar({
  src,
  alt = 'User Avatar',
  size = 'md',
  isAnonymous = false,
  isOnline = false,
  className,
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block shrink-0 select-none">
      <div
        className={twMerge(
          clsx(
            'rounded-full overflow-hidden flex items-center justify-center border border-border/80 bg-slate-100',
            sizes[size],
            isAnonymous && 'bg-purple-100/80 border-purple-200 text-purple-700',
            className
          )
        )}
        {...props}
      >
        {isAnonymous ? (
          <Shield className="w-1/2 h-1/2 text-purple-600 animate-pulse" />
        ) : src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <User className="w-1/2 h-1/2 text-slate-400" />
        )}
      </div>

      {isOnline && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 bg-brand-500 rounded-full ring-2 ring-white',
            dotSizes[size]
          )}
          title="Online now"
        />
      )}
    </div>
  );
}
