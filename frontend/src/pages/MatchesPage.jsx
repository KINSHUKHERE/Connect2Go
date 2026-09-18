import React from 'react';
import { Heart, MapPin, MessageCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useGeo } from '../context/GeoContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar } from '../utils/imageUtils.js';

export function MatchesPage({ onJoinChat, onOpenReport, onComingSoon }) {
  const { people } = useGeo();

  return (
    <div className="w-full space-y-6 text-left pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-border/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-text tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-emerald-600 fill-emerald-100" />
            <span>Matched Peers</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            People nearby with overlapping hobbies, activities, and availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
            {people.length} Potential Partners Nearby
          </span>
        </div>
      </div>

      {/* Grid of Matched Peers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {people.map((p) => {
          const avatar = getSafeAvatar(p.name, p.avatar);

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-border/80 p-5 shadow-soft hover:shadow-soft-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-100 bg-slate-100"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-text">{p.name}</h3>
                    <p className="text-xs text-brand-600 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {p.distanceKm} km away
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenReport ? onOpenReport(p.name) : onComingSoon('Report User')}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Report user"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>

              {/* Shared Interests */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  <span>{p.commonInterests} Shared Interests</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(p.interests || ['Badminton', 'Running', 'Fitness']).map((tag) => (
                    <Badge key={tag} variant="default" size="sm" className="bg-slate-100 text-slate-700 text-[11px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/70 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onJoinChat({ title: `Chat with ${p.name}`, creator: p })}
                  icon={MessageCircle}
                  className="w-full text-xs font-bold h-9"
                >
                  Chat Anonymously
                </Button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default MatchesPage;
