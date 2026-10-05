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
  Check,
  Heart,
  Clock,
  ArrowRight,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useGeo } from '../context/GeoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RequestCard } from '../components/requests/RequestCard.jsx';
import { MapView } from '../components/map/MapView.jsx';
import { DesktopExploreMap } from '../components/map/DesktopExploreMap.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar, handleAvatarError, getActivityImage, handleImageError } from '../utils/imageUtils.js';
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

  // Track screen size to mount Leaflet map ONLY in the active viewport (prevents display:none zero-size Leaflet errors)
  const [isMobileScreen, setIsMobileScreen] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Advanced Filters State
  const [dateFilter, setDateFilter] = useState('All'); // 'All', 'Today', 'Tomorrow', 'Weekend'
  const [spotsFilter, setSpotsFilter] = useState('all'); // 'all', 'open'
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'newest', 'match'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [desktopTab, setDesktopTab] = useState('nearby'); // 'nearby', 'trending', 'upcoming', 'joined'
  const [favorites, setFavorites] = useState({});

  const categories = ['All', 'Sports', 'Fitness', 'Gaming', 'Study', 'Food', 'Travel', 'Music', 'Others'];

  const categoryEmojis = {
    All: '⚡',
    Sports: '🏸',
    Fitness: '🏋️',
    Gaming: '🎮',
    Study: '📖',
    Food: '☕',
    Travel: '✈️',
    Music: '🎵',
    Others: '💬',
  };

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    return 0;
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
    <div className="w-full text-left">

      {/* ============================================================ */}
      {/* 1. MOBILE & TABLET EXPLORE PAGE (< lg BREAKPOINT — UNTOUCHED) */}
      {/* ============================================================ */}
      <div className="block lg:hidden space-y-8 pb-16">
        
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

            {/* Location Picker */}
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

          {/* Category Pills & View Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border/60">
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

            <div className="flex items-center gap-2 shrink-0">
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

          {/* Advanced Filters Panel */}
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

        {/* Mobile Feed & Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-dark-text tracking-tight">
                Activities Within {radiusKm} km
              </h3>
              <p className="text-xs text-dark-faint">
                Showing {filteredActivities.length} available requests
              </p>
            </div>
          </div>

          {isMobileScreen && viewMode === 'map' ? (
            <MapView onJoinActivity={handleJoin} />
          ) : filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div className="p-12 bg-white rounded-2xl border border-border/80 text-center space-y-4 shadow-soft">
              <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl">
                🏸
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-dark-text">No activities found matching filters</h4>
                <p className="text-xs text-dark-muted">Try widening your search radius.</p>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetFilters} className="font-semibold text-xs">Reset Filters</Button>
                <Button variant="primary" onClick={onOpenCreate} icon={Plus} className="font-bold text-xs">Host Activity</Button>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP / LAPTOP EXPLORE PAGE (EXACT REFERENCE REDESIGN) */}
      {/* ============================================================ */}
      {viewMode === 'grid' || viewMode === 'list' ? (
        <div className="hidden lg:block space-y-6 pb-12">
          {/* Top Bar for Desktop List View */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xl flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                All Nearby Activities <span className="text-[#22C55E]">({filteredActivities.length})</span>
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Showing available activities within {radiusKm} km in {locationName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Category selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#22C55E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View mode switcher */}
              <div className="bg-white border border-slate-200 p-1 rounded-2xl flex items-center gap-1 shadow-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] text-white shadow-xs cursor-pointer"
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0F172A] cursor-pointer"
                >
                  Map View
                </button>
              </div>

              <Button variant="primary" onClick={onOpenCreate} icon={Plus} className="font-bold text-xs shadow-xs">
                Host Activity
              </Button>
            </div>
          </div>

          {/* Full-width Responsive Activity Cards Grid */}
          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            <div className="p-12 bg-white rounded-3xl border border-slate-200/90 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#22C55E] flex items-center justify-center mx-auto text-2xl">
                🏸
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-[#0F172A]">No activities found matching filters</h4>
                <p className="text-xs text-slate-500">Try widening your search radius or changing category.</p>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetFilters} className="font-semibold text-xs">Reset Filters</Button>
                <Button variant="primary" onClick={onOpenCreate} icon={Plus} className="font-bold text-xs">Host Activity</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-5.5rem)] overflow-hidden">
          
          {/* LEFT DISCOVERY PANEL (approx 38% width on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl flex flex-col h-full overflow-hidden space-y-5">
            
            {/* Header & Value Proposition */}
            <div className="space-y-3 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>EXPLORE NEARBY</span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-black text-[#0F172A] tracking-tight leading-[1.12]">
                Find Your Next <br />
                <span className="text-[#22C55E]">Activity</span> Near You
              </h1>

              <p className="text-xs text-[#64748B] font-semibold">
                Real people. Real activities. Real experiences.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search activities, people, or places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors"
              />
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`absolute right-2.5 top-2.5 p-1 rounded-xl transition-colors ${
                  showAdvancedFilters ? 'bg-[#22C55E] text-white' : 'text-slate-400 hover:text-[#0F172A]'
                }`}
                title="Toggle Advanced Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Category Chips Grid */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
              {categories.map((cat) => {
                const emoji = categoryEmojis[cat] || '✨';
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#22C55E] text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Sub-Tabs */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-bold text-slate-600">
                <button
                  onClick={() => setDesktopTab('nearby')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    desktopTab === 'nearby'
                      ? 'bg-[#22C55E] text-white shadow-xs'
                      : 'hover:text-[#0F172A]'
                  }`}
                >
                  Nearby ({filteredActivities.length})
                </button>
                <button
                  onClick={() => setDesktopTab('trending')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    desktopTab === 'trending'
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'hover:text-[#0F172A]'
                  }`}
                >
                  Trending
                </button>
                <button
                  onClick={() => setDesktopTab('upcoming')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    desktopTab === 'upcoming'
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'hover:text-[#0F172A]'
                  }`}
                >
                  Upcoming
                </button>
              </div>

              <button
                onClick={() => setSortBy(sortBy === 'nearest' ? 'match' : 'nearest')}
                className="p-1.5 rounded-xl text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sort Order"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Compact Activity Cards Feed */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const cardImage = getActivityImage(act);
                  const compatibility = act.compatibility || calculateCompatibility(user, act, 'activity');
                  const isFav = favorites[act.id];

                  return (
                    <div
                      key={act.id}
                      onClick={() => handleJoin(act)}
                      className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-xl hover:border-emerald-200 transition-all duration-200 group cursor-pointer flex gap-3 text-left items-stretch"
                    >
                      {/* Left Thumbnail with Heart */}
                      <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={cardImage}
                          alt={act.title}
                          onError={(e) => handleImageError(e, act.category)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => toggleFavorite(act.id, e)}
                          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-red-500 shadow-xs"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      {/* Right Details Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs font-black text-[#0F172A] truncate group-hover:text-[#22C55E] transition-colors">
                              {act.title}
                            </h3>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                              ✨ {compatibility.score}% match
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">{act.category}</span>
                            <span className="truncate">📍 {act.locationName || act.location_label}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-bold text-slate-600">
                          <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
                            <Users className="w-3 h-3 text-[#22C55E]" />
                            {act.joinedCount || 3}/{act.participantCount || 6} joined
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoin(act);
                            }}
                            className="px-3 py-1 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full font-bold text-[10px] shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <span>Join</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#22C55E] flex items-center justify-center mx-auto text-xl">
                    🏸
                  </div>
                  <p className="text-xs font-bold text-[#0F172A]">No activities found in this area</p>
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 bg-[#22C55E] text-white text-xs font-bold rounded-full shadow-xs hover:bg-[#16A34A] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT INTERACTIVE MAP CANVAS (approx 62% width on desktop — Matching Reference Image) */}
          <div className="lg:col-span-7 xl:col-span-8 h-full relative">
            <DesktopExploreMap
              activities={filteredActivities}
              people={people}
              onJoinActivity={handleJoin}
              onOpenCreate={onOpenCreate}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              spotsFilter={spotsFilter}
              setSpotsFilter={setSpotsFilter}
              showFilters={showAdvancedFilters}
              setShowFilters={setShowAdvancedFilters}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>

        </div>
      )}

    </div>
  );
}

export default DashboardPage;
