import React, { useState } from 'react';
import { Calendar, Users, MapPin, Trash2, MessageCircle, PlusCircle, Clock } from 'lucide-react';
import { useGeo } from '../context/GeoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { getActivityImage, getSafeAvatar } from '../utils/imageUtils.js';

export function MyActivitiesPage({ onOpenCreate, onOpenChat, onComingSoon }) {
  const { activities, deleteActivity } = useGeo();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hosted'); // 'hosted' | 'joined'

  // Activities hosted by the current user (matches user name or default)
  const hostedActivities = activities.filter(
    a => (a.creator?.name === user?.name || a.creator_name === user?.name || a.id.startsWith('act-'))
  );

  // Activities joined by user
  const joinedActivities = activities.filter(
    a => a.isJoined || (a.joinedCount > 1 && a.creator?.name !== user?.name)
  );

  const displayList = activeTab === 'hosted' ? hostedActivities : joinedActivities;

  return (
    <div className="w-full space-y-6 text-left pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border/80 shadow-soft">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-text tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-brand-600" />
            <span>My Activities</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Manage activities you are hosting or participating in.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenCreate}
          icon={PlusCircle}
          className="font-bold text-xs"
        >
          Host New Activity
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('hosted')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'hosted'
              ? 'bg-white text-dark-text shadow-xs'
              : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          Hosted by Me ({hostedActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'joined'
              ? 'bg-white text-dark-text shadow-xs'
              : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          Joined Activities ({joinedActivities.length})
        </button>
      </div>

      {/* Activities Grid or Empty State */}
      {displayList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayList.map((act) => {
            const creatorName = act.creator?.name || act.creator_name || 'Member';
            const creatorAvatar = act.creator?.avatar || act.creator_avatar;
            const banner = getActivityImage(act);

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-border/80 overflow-hidden shadow-soft hover:shadow-soft-hover transition-all flex flex-col justify-between"
              >
                <div className="relative h-36 bg-slate-100 overflow-hidden">
                  <img
                    src={banner}
                    alt={act.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="primary" size="sm" className="bg-white/95 text-dark-text font-bold shadow-xs">
                      {act.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white shadow-xs">
                      {act.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>{act.time || act.time_slot || 'Today'}</span>
                    </div>

                    <h3 className="text-base font-bold text-dark-text">{act.title}</h3>
                    <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act.locationName || act.location_label || 'Jaipur'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-dark-muted font-semibold">
                      <Users className="w-4 h-4 text-brand-600" />
                      <span>{act.joinedCount || act.current_participants || 1} / {act.participantCount || act.max_participants || 4} spots filled</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onOpenChat(act.title)}
                        icon={MessageCircle}
                        className="text-xs font-bold h-8"
                      >
                        Chat
                      </Button>

                      {activeTab === 'hosted' && (
                        <button
                          onClick={() => deleteActivity(act.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          emoji="🏸"
          title={activeTab === 'hosted' ? "You haven't hosted any activities yet" : "No joined activities yet"}
          message={activeTab === 'hosted' ? "Create an activity request and connect with nearby peers for sports, study, or gaming." : "Explore the activity feed and join partners near you."}
          actionLabel="Host an Activity"
          onAction={onOpenCreate}
        />
      )}

    </div>
  );
}

export default MyActivitiesPage;
