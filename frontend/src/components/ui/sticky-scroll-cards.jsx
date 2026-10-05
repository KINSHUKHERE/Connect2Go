import React from 'react';

export function StickyScrollCards({ hint, cards = [] }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="w-full relative py-12">
      {/* Hint Header */}
      {hint && (
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold tracking-wider uppercase shadow-2xs">
            {hint}
          </span>
        </div>
      )}

      {/* Sticky Stacking Cards Container */}
      <div className="max-w-5xl mx-auto relative">
        {cards.map((card, index) => {
          const isLast = index === cards.length - 1;
          const topOffset = 90 + index * 28;
          const zIndex = (index + 1) * 10;

          return (
            <div
              key={card.title || index}
              className={`sticky transition-all duration-300 ${!isLast ? 'mb-[18vh] sm:mb-[24vh]' : 'mb-0'}`}
              style={{
                top: `${topOffset}px`,
                zIndex: zIndex,
              }}
            >
              <div 
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[400px] transform-gpu transition-all duration-300"
                style={{
                  transform: `scale(${1 - (cards.length - 1 - index) * 0.012})`,
                  transformOrigin: 'top center'
                }}
              >
                {/* Text Content Column */}
                <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6 text-left bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl sm:text-5xl font-black text-[#22C55E] tracking-tight">
                        {card.number || `0${index + 1}`}
                      </span>
                      {card.badge && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight leading-tight">
                      {card.title}
                    </h3>

                    {card.description && (
                      <p className="text-sm text-[#64748B] leading-relaxed">
                        {card.description}
                      </p>
                    )}

                    {card.features && card.features.length > 0 && (
                      <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                        {card.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#22C55E] flex items-center justify-center font-bold text-[10px] shrink-0">
                              ✓
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-xs font-extrabold text-[#22C55E] flex items-center justify-between">
                    <span>Step {index + 1} of {cards.length}</span>
                    <span className="text-slate-400 font-normal">Scroll to stack ↓</span>
                  </div>
                </div>

                {/* Image Column */}
                <div className="md:col-span-6 relative h-64 md:h-auto min-h-[320px] overflow-hidden bg-slate-900">
                  <img
                    src={card.src}
                    alt={card.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StickyScrollCards;
