import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

/**
 * Reusable ComingSoon Component
 * Follows the calm mint/green card design system.
 */
export function ComingSoon({ 
  title = "Coming Soon", 
  description = "This feature is currently being designed and developed.",
  planned = "Planned for a future release.",
  className = "",
  compact = false
}) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-800 text-xs font-semibold ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="truncate">{description}</span>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 bg-brand-50/70 border border-brand-200/80 rounded-2xl text-left relative overflow-hidden shadow-xs ${className}`}>
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/30 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white border border-brand-200 flex items-center justify-center text-brand-600 shadow-xs shrink-0">
          <Sparkles className="w-6 h-6 stroke-[2.2]" />
        </div>
        
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-dark-text tracking-tight flex items-center gap-2">
              {title}
            </h3>
            {planned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-brand-700 border border-brand-200 shadow-2xs">
                <Clock className="w-3 h-3 text-brand-600" />
                {planned}
              </span>
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-dark-muted leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
