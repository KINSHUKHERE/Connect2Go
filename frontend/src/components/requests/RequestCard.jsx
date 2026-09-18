import React from 'react';
import { MapPin, Clock, Users, Heart, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { getActivityImage, getSafeAvatar, handleImageError, handleAvatarError } from '../../utils/imageUtils.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { calculateCompatibility } from '../../utils/matchingEngine.js';

export function RequestCard({ activity, onJoin, onComingSoon }) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const creatorName = activity.creator?.name || activity.creator_name || 'Member';
  const creatorAvatar = activity.creator?.avatar || activity.creator_avatar;
  const cardImage = getActivityImage(activity);

  const compatibility = activity.compatibility || calculateCompatibility(user, activity, 'activity');

  return (
    <div className="bg-white rounded-lg border border-border/80 overflow-hidden shadow-soft hover:shadow-soft-hover transition-all duration-200 group flex flex-col justify-between">
      
      {/* Top Image Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={cardImage}
          alt={activity.title}
          onError={(e) => handleImageError(e, activity.category)}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="primary" size="sm" className="bg-white/90 text-dark-text backdrop-blur-xs font-bold shadow-xs">
            {activity.category}
          </Badge>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-dark-muted hover:text-red-500 transition-colors shadow-xs"
          title="Save Activity"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Dynamic Compatibility Score Pill */}
        <div
          className={`absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
            compatibility.score >= 85
              ? 'bg-emerald-600/95 text-white ring-1 ring-white/30'
              : compatibility.score >= 70
              ? 'bg-brand-600/95 text-white'
              : 'bg-slate-900/85 text-slate-100'
          }`}
        >
          <Sparkles className="w-3 h-3 fill-white" />
          <span>{compatibility.score}% Match</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-brand-700 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              {activity.distanceKm} km away
            </span>
            <span className="flex items-center gap-1 text-dark-muted font-normal">
              <Clock className="w-3.5 h-3.5" />
              {activity.date}, {activity.time}
            </span>
          </div>

          <h3 className="text-base font-bold text-dark-text group-hover:text-brand-600 transition-colors line-clamp-1">
            {activity.title}
          </h3>

          {compatibility.highlight && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
              <span>✨ {compatibility.highlight}</span>
            </div>
          )}

          <p className="text-xs text-dark-muted mt-1.5 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* Footer Meta & Join Button */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          {/* Creator & Quota */}
          <div className="flex items-center gap-2">
            <img
              src={getSafeAvatar(creatorName, creatorAvatar)}
              alt={creatorName}
              onError={(e) => handleAvatarError(e, creatorName)}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-border bg-slate-100"
            />
            <div className="text-[11px] leading-tight text-left">
              <span className="font-semibold text-dark-text block">{creatorName}</span>
              <span className="text-dark-faint flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />
                {activity.joinedCount || activity.current_participants || 1}/{activity.participantCount || activity.max_participants || 2} joined
              </span>
            </div>
          </div>

          {/* Join / Connect Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => onJoin(activity)}
            className="px-4 text-xs font-bold"
          >
            Join
          </Button>
        </div>
      </div>
    </div>
  );
}
