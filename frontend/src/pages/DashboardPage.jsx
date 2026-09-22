import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Plus, 
  LayoutGrid, 
  Map as MapIcon, 
  Sparkles, 
  MessageCircle, 
  Users, 
  Navigation, 
  Filter, 
  X, 
  Calendar, 
  Check 
} from 'lucide-react';
import { useGeo } from '../context/GeoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RequestCard } from '../components/requests/RequestCard.jsx';
import { MapView } from '../components/map/MapView.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar, handleAvatarError } from '../utils/imageUtils.js';
import { calculateCompatibility } from '../utils/matchingEngine.js';

export function DashboardPage({ onOpenCreate, onJoinActivity, onOpenLocationPicker, onComingSoon }) {
  const { 
    activities, 
    people, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery, 
    radiusKm, 
    setRadiusKm, 
    locationName, 
    viewMode, 
    setViewMode,
    joinActivity,
    requestUserLocation
  } = useGeo();

  const { user } = useAuth();
  const toast = useToast();

  // Advanced Filters State
  const [dateFilter, setDateFilter] = useState('All'); // 'All', 'Today', 'Tomorrow', 'Weekend'
  const [spotsFilter, setSpotsFilter] = useState('all'); // 'all', 'open'
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'newest', 'match'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categories = ['All', 'Sports', 'Fitness', 'Gaming', 'Study', 'Food', 'Travel', 'Music', 'Others'];

  // Handle Joining an activity
  const handleJoin = async (activity) => {
    if (!user) {
      toast.warning('Please sign in to join activities and connect with hosts!');
      if (onJoinActivity) onJoinActivity(activity);
      return;
    }
    await joinActivity(activity.id);
    toast.success(`You joined "${activity.title}"! Partner chat is ready.`);
    if (onJoinActivity) {
      onJoinActivity(activity);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      act.title.toLowerCase().includes(q) ||
      (act.description && act.description.toLowerCase().includes(q)) ||
      act.category.toLowerCase().includes(q) ||
      (act.locationName && act.locationName.toLowerCase().includes(q)) ||
      (act.creator?.name && act.creator.name.toLowerCase().includes(q)) ||
      (act.creator_name && act.creator_name.toLowerCase().includes(q)) ||
      (act.tags && act.tags.some((t) => t.toLowerCase().includes(q)));

    // Date Filter
    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = (act.time || act.time_slot || '').toLowerCase().includes('today');
    } else if (dateFilter === 'Tomorrow') {
      matchesDate = (act.time || act.time_slot || '').toLowerCase().includes('tomorrow');
    } else if (dateFilter === 'Weekend') {
      const ts = (act.time || act.time_slot || '').toLowerCase();
      matchesDate = ts.includes('saturday') || ts.includes('sunday') || ts.includes('weekend');
    }

    // Spots Filter
    let matchesSpots = true;
    if (spotsFilter === 'open') {
      const current = act.joinedCount || act.current_participants || 1;
      const max = act.participantCount || act.max_participants || 4;
      matchesSpots = current < max;
    }

    return matchesCategory && matchesSearch && matchesDate && matchesSpots;
  }).sort((a, b) => {
    if (sortBy === 'nearest') {
      return (a.distanceKm || a.distance_km || 1) - (b.distanceKm || b.distance_km || 1);
    }
    if (sortBy === 'match') {
      const scoreA = a.compatibility?.score ?? calculateCompatibility(user, a, 'activity').score;
      const scoreB = b.compatibility?.score ?? calculateCompatibility(user, b, 'activity').score;
      return scoreB - scoreA;
    }
    return 0; // default
  });

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (dateFilter !== 'All' ? 1 : 0) +
    (spotsFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('All');
    setDateFilter('All');
    setSpotsFilter('all');
    setSearchQuery('');
    setSortBy('nearest');
  };

  return (
    <div className="w-full space-y-8 pb-16 text-left">
      
      {/* Top Welcome & Search Header Banner */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-border/80 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
              Good evening, {user ? user.name.split(' ')[0] : 'Friend'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-dark-muted mt-0.5">
              Find something fun to do nearby or host your own activity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              onClick={onOpenCreate}
              icon={Plus}
              className="font-bold text-xs sm:text-sm shadow-xs"
            >
              Host Activity
            </Button>
          </div>
        </div>

        {/* Primary Search, Location, and Radius Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          
          {/* Keyword Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-faint pointer-events-none" />
            <input
              type="text"
              placeholder="Search activities, sports, places, or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-border rounded-xl text-xs sm:text-sm text-dark-text placeholder:text-dark-faint focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-dark-text p-0.5 rounded"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Picker with Live GPS button & Map Modal */}
          <div 
            onClick={onOpenLocationPicker}
            className="md:col-span-4 flex items-center gap-2 h-11 px-3 bg-slate-50 hover:bg-slate-100/80 border border-border rounded-xl cursor-pointer transition-colors"
            title="Click to change location across India or pick on map"
          >
            <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="text-xs font-semibold text-dark-text truncate flex-1">{locationName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                requestUserLocation();
              }}
              className="p-1 text-brand-600 hover:text-brand-700 rounded-md hover:bg-brand-50 transition-colors"
              title="Locate Me via Live GPS"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Radius Selector */}
          <div className="md:col-span-3 flex items-center gap-2 h-11 px-3 bg-slate-50 border border-border rounded-xl">
            <SlidersHorizontal className="w-4 h-4 text-dark-faint shrink-0" />
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full bg-transparent text-xs font-semibold text-dark-text focus:outline-none cursor-pointer"
            >
              <option value="1">Within 1 km</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
            </select>
          </div>

        </div>

        {/* Category Pills, Advanced Filters Toggle & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border/60">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-dark-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Controls: Filters Drawer Toggle & Grid/Map Mode */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-brand-50 border-brand-300 text-brand-800 font-bold'
                  : 'bg-slate-50 border-border text-dark-muted hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-dark-text shadow-xs font-bold'
                    : 'text-dark-muted hover:text-dark-text'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-dark-text shadow-xs font-bold'
                    : 'text-dark-muted hover:text-dark-text'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>

          </div>

        </div>

        {/* Expandable Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="p-4 bg-slate-50/80 rounded-xl border border-border/80 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                Refine Activity Results
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              {/* Date Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">Activity Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-border rounded-lg text-xs font-semibold text-dark-text focus:outline-none focus:border-brand-500"
                >
                  <option value="All">All Dates</option>
                  <option value="Today">Today Only</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Weekend">This Weekend</option>
                </select>
              </div>

              {/* Spot Availability Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">Spot Availability</label>
                <select
                  value={spotsFilter}
                  onChange={(e) => setSpotsFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-border rounded-lg text-xs font-semibold text-dark-text focus:outline-none focus:border-brand-500"
                >
                  <option value="all">All Activities</option>
                  <option value="open">Open Spots Available</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-border rounded-lg text-xs font-semibold text-dark-text focus:outline-none focus:border-brand-500"
                >
                  <option value="nearest">Nearest Proximity First</option>
                  <option value="match">Highest Match Compatibility</option>
                  <option value="newest">Recently Posted</option>
                </select>
              </div>

            </div>
          </div>
        )}

      </section>

      {/* People Near You Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" />
            <h3 className="text-base font-bold text-dark-text">People Near You</h3>
            <span className="text-xs text-dark-faint hidden sm:inline">• Shared common hobbies</span>
          </div>
          {user && (
            <button
              onClick={() => onComingSoon('Full Community Directory')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
            >
              See All
            </button>
          )}
        </div>

        {user ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {people
              .filter(p => 
                !user || (
                  p.id !== user.id && 
                  (p.email || '').toLowerCase() !== (user.email || '').toLowerCase() &&
                  (p.username || '').toLowerCase() !== (user.username || '').toLowerCase() &&
                  (p.name || '').toLowerCase() !== (user.name || '').toLowerCase()
                )
              )
              .map((p) => {
              const avatar = getSafeAvatar(p.name, p.avatar, p.gender);

              // Calculate dynamic common hobbies between active user & peer
              const userInterests = Array.isArray(user?.interests) && user.interests.length > 0 
                ? user.interests 
                : ['Badminton', 'Study', 'Fitness'];
              const peerInterests = Array.isArray(p.interests) && p.interests.length > 0 
                ? p.interests 
                : ['Badminton', 'Fitness', 'Running'];

              const sharedInterests = peerInterests.filter(item => 
                userInterests.some(u => u.toLowerCase() === item.toLowerCase())
              );
              const sharedCount = sharedInterests.length > 0 ? sharedInterests.length : 1;
              const sharedListText = sharedInterests.length > 0 
                ? sharedInterests.join(', ') 
                : (peerInterests[0] || 'Badminton');

              return (
                <div
                  key={p.id}
                  className="bg-white p-3.5 rounded-2xl border border-border/80 shadow-soft hover:shadow-soft-hover transition-all text-center space-y-2 group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative inline-block mx-auto">
                      <img
                        src={avatar}
                        alt={p.username || p.name}
                        onError={(e) => handleAvatarError(e, p.name, p.gender)}
                        className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-brand-100 bg-slate-100 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white" title="Online Member" />
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-dark-text truncate" title={`@${p.username || p.name}`}>
                        @{p.username || (p.name || 'user').toLowerCase().replace(/\s+/g, '_')}
                      </h4>
                      <p className="text-[11px] text-brand-600 font-semibold">{p.distanceKm} km away</p>
                      <div className="mt-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold py-0.5 px-1.5 rounded-md border border-emerald-200/60 truncate" title={`Shared: ${sharedListText}`}>
                        <span>✨ {sharedCount} shared ({sharedListText})</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-[11px] h-7 font-bold mt-2"
                    onClick={() => onJoinActivity({ title: `Chat with @${p.username || p.name}`, creator: p })}
                  >
                    Chat
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-border/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-dark-text">Verified Community Members Nearby</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    Sign In Required
                  </span>
                </div>
                <p className="text-xs text-dark-muted mt-0.5">
                  Sign in to discover people near you, explore shared hobbies, compare compatibility, and start chats.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => onJoinActivity({ title: 'Community Login' })}
              className="font-bold text-xs shrink-0 shadow-xs"
            >
              Sign In to View People
            </Button>
          </div>
        )}
      </section>

      {/* Discover Activities Main Feed (Grid or Map) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-dark-text tracking-tight">
              Activities Within {radiusKm} km
            </h3>
            <p className="text-xs text-dark-faint">
              Showing {filteredActivities.length} available requests matching your criteria
            </p>
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapView onJoinActivity={handleJoin} />
        ) : filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredActivities.map((act) => (
              <RequestCard
                key={act.id}
                activity={act}
                onJoin={handleJoin}
                onComingSoon={onComingSoon}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 bg-white rounded-2xl border border-border/80 text-center space-y-4 shadow-soft">
            <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl">
              🏸
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-dark-text">No activities found matching filters</h4>
              <p className="text-xs text-dark-muted">
                Try widening your search radius or resetting the active filters.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="font-semibold text-xs"
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                onClick={onOpenCreate}
                icon={Plus}
                className="font-bold text-xs"
              >
                Host Activity
              </Button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

export default DashboardPage;
