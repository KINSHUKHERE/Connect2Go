import React, { useState } from 'react';
import { Heart, MapPin, MessageCircle, ShieldAlert, Sparkles, SlidersHorizontal, Check, Search, X } from 'lucide-react';
import { useGeo } from '../context/GeoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar } from '../utils/imageUtils.js';
import { calculateCompatibility } from '../utils/matchingEngine.js';

export function MatchesPage({ onJoinChat, onOpenReport, onComingSoon }) {
  const { people } = useGeo();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'distance'
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-calculate compatibility for each peer (excluding logged-in user)
  const scoredPeople = people
    .filter(p => !user || (p.id !== user.id && p.username !== user.username && p.name !== user.name))
    .map((p) => {
      const comp = calculateCompatibility(user, p, 'peer');
      return {
        ...p,
        compatibility: comp,
      };
    }).sort((a, b) => {
    if (sortBy === 'match') {
      return b.compatibility.score - a.compatibility.score;
    }
    return (a.distanceKm || 1) - (b.distanceKm || 1);
  });

  // Filter peers by search query (name, hobbies, highlight)
  const q = searchQuery.trim().toLowerCase();
  const filteredPeople = scoredPeople.filter((p) => {
    if (!q) return true;
    const nameMatch = p.name?.toLowerCase().includes(q);
    const interestsMatch = p.interests?.some((i) => i.toLowerCase().includes(q));
    const highlightMatch = p.compatibility?.highlight?.toLowerCase().includes(q);
    return nameMatch || interestsMatch || highlightMatch;
  });

  if (!user) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto text-2xl shadow-soft">
          <Heart className="w-8 h-8 text-brand-600 fill-brand-100" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-dark-text tracking-tight">
            Matched Peers is a Member Feature
          </h2>
          <p className="text-xs sm:text-sm text-dark-muted max-w-md mx-auto leading-relaxed">
            Sign in or create a free account to discover active partners nearby matched to your specific sports, hobbies, skill levels, and schedule.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => onJoinChat && onJoinChat({ creator: null })}
            className="font-bold text-xs shadow-xs"
          >
            Sign In to View Matches
          </Button>
        </div>
      </div>
    );
  }

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
            People nearby scored by multi-factor compatibility: distance, hobbies, schedule, and skill.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sorting Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setSortBy('match')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'match'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-dark-text'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Best Match</span>
            </button>
            <button
              onClick={() => setSortBy('distance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'distance'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-dark-text'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Nearest</span>
            </button>
          </div>

          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200 shrink-0">
            {people.length} Partners Nearby
          </span>
        </div>
      </div>

      {/* Search & Results Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border/80 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search matched peers by name, hobby, or interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-9 bg-slate-50 border border-border rounded-xl text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-dark-text p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-500">
          <span>Showing <strong>{filteredPeople.length}</strong> of {people.length} peers</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-brand-600 hover:underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid of Matched Peers or Empty State */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPeople.map((p) => {
            const { score, label, highlight, breakdown } = p.compatibility;

            // Determine badge color tone based on score
            const scoreColor = score >= 85 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : score >= 70 
              ? 'bg-brand-50 text-brand-700 border-brand-200' 
              : 'bg-slate-100 text-slate-700 border-slate-200';

            const avatar = getSafeAvatar(p.name, p.avatar, p.gender);
            const handle = p.username || (p.name || 'user').toLowerCase().replace(/\s+/g, '_');

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-border/80 p-5 shadow-soft hover:shadow-soft-hover transition-all space-y-4 text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={avatar}
                          alt={handle}
                          onError={(e) => handleAvatarError(e, p.name, p.gender)}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-brand-100 bg-slate-100 shadow-2xs"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-dark-text leading-tight">@{handle}</h3>
                        <p className="text-xs text-brand-600 font-semibold flex items-center gap-1 mt-0.5">
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

                  {/* Algorithmic Match Score Pill & Highlight */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${scoreColor}`}>
                        <Sparkles className="w-3 h-3" />
                        {score}% Compatibility
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      {highlight}
                    </p>
                  </div>
                </div>

                {/* Shared Interests */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-500" />
                    <span>{p.commonInterests || (p.interests?.length || 3)} Shared Interests</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.interests || ['Badminton', 'Running', 'Fitness']).map((tag) => (
                      <Badge key={tag} variant="default" size="sm" className="bg-slate-100 text-slate-700 text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-3 border-t border-border/70 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onJoinChat({ title: `Chat with ${p.name}`, creator: p })}
                    icon={MessageCircle}
                    className="flex-1 text-xs font-bold h-9"
                  >
                    Chat Anonymously
                  </Button>
                  <button
                    onClick={() => onOpenReport ? onOpenReport(p.name) : null}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-slate-200/70 hover:border-amber-200 transition-colors"
                    title={`Report ${p.name} for safety violation`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search State */
        <div className="p-12 bg-white rounded-2xl border border-border/80 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-base font-bold text-dark-text">
              {searchQuery ? 'No matched peers found' : 'No other members nearby yet'}
            </h4>
            <p className="text-xs text-dark-muted">
              {searchQuery 
                ? `We couldn't find anyone matching "${searchQuery}". Try searching for another name or hobby like "Badminton", "Running", or "Fitness".`
                : 'You are currently the only registered member in this area. As soon as another member signs up or hosts an activity, they will appear here scored by compatibility!'}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="font-bold text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

    </div>
  );
}

export default MatchesPage;
