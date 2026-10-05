import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  SlidersHorizontal, 
  Calendar, 
  Filter, 
  ChevronRight, 
  Plus, 
  Minus, 
  Compass, 
  Users, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useGeo } from '../../context/GeoContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSafeAvatar, handleAvatarError } from '../../utils/imageUtils.js';
import { MAPBOX_TILE_URL, MAPBOX_ATTRIBUTION } from '../../utils/geoService.js';

// Category Emoji Mapping
const categoryEmojis = {
  Sports: '🏸',
  Fitness: '🏋️',
  Gaming: '🎮',
  Study: '📖',
  Food: '☕',
  Travel: '✈️',
  Music: '🎵',
  Others: '💬',
};

// Pulsing Center User Location Icon
const userBeaconIcon = L.divIcon({
  className: 'live-user-center-beacon',
  html: `
    <div style="position: relative; width: 28px; height: 28px;">
      <div style="
        position: absolute;
        inset: -10px;
        background: rgba(34, 197, 94, 0.35);
        border-radius: 50%;
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: absolute;
        inset: 0;
        background: #0F172A;
        border: 3px solid #22C55E;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Create Nearby Person Avatar Map Pin
const createPeopleAvatarIcon = (avatarUrl, name, isOnline = true) => {
  return L.divIcon({
    className: 'custom-people-avatar-pin',
    html: `
      <div style="position: relative; width: 40px; height: 40px; cursor: pointer;">
        <img 
          src="${avatarUrl}" 
          alt="${name}"
          style="
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            object-fit: cover; 
            border: 2.5px solid white; 
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
            background: #f1f5f9;
          "
        />
        ${isOnline ? `
          <span style="
            position: absolute; 
            bottom: 1px; 
            right: 1px; 
            width: 11px; 
            height: 11px; 
            background: #22C55E; 
            border: 2px solid white; 
            border-radius: 50%;
          "></span>
        ` : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Create Floating Activity Callout Card Map Marker
const createFloatingActivityCardIcon = (activity) => {
  const emoji = categoryEmojis[activity.category] || '⚡';
  const participants = activity.joinedCount || activity.current_participants || 3;
  const distance = activity.distanceKm || 0.8;
  const title = activity.title || 'Activity';

  return L.divIcon({
    className: 'floating-map-activity-card',
    html: `
      <div style="
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(8px);
        border-radius: 18px;
        padding: 8px 14px;
        border: 1px solid rgba(226, 232, 240, 0.95);
        box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.18);
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: #F0FDF4;
          border: 1px solid #DCFCE7;
          color: #22C55E;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        ">
          ${emoji}
        </div>
        <div style="text-align: left; line-height: 1.25;">
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">${title}</div>
          <div style="font-size: 11px; font-weight: 600; color: #64748B;">${participants} people • ${distance} km</div>
        </div>
      </div>
    `,
    iconSize: [210, 52],
    iconAnchor: [105, 26],
  });
};

function MapController({ lat, lng, zoom = 14 }) {
  const map = useMap();
  const prevRef = React.useRef(null);

  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          const prev = prevRef.current;
          if (!prev || Math.abs(prev.lat - lat) > 0.0001 || Math.abs(prev.lng - lng) > 0.0001) {
            map.flyTo([lat, lng], zoom, { duration: 1.0 });
            prevRef.current = { lat, lng };
          }
        }
      } catch (e) {}
    }
  }, [lat, lng, zoom, map]);

  return null;
}

// Custom Map Controls Handler
function MapZoomControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[400] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg text-slate-700 hover:text-emerald-600 flex items-center justify-center font-bold transition-all active:scale-95 cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg text-slate-700 hover:text-emerald-600 flex items-center justify-center font-bold transition-all active:scale-95 cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

export function DesktopExploreMap({ 
  activities = [], 
  people = [], 
  onJoinActivity, 
  onOpenCreate,
  onOpenReport,
  dateFilter,
  setDateFilter,
  spotsFilter,
  setSpotsFilter,
  showFilters,
  setShowFilters,
  viewMode = 'map',
  setViewMode
}) {
  const { 
    coordinates, 
    radiusKm, 
    setRadiusKm, 
    locationName, 
    requestUserLocation 
  } = useGeo();

  // Helper to ensure 100% valid, deterministic, non-NaN coordinates for Leaflet map
  const getValidCoord = (val, baseCoord, index = 0, isLat = true) => {
    const num = Number(val);
    if (!isNaN(num) && isFinite(num) && num !== 0) {
      return num;
    }
    const baseN = Number(baseCoord);
    const safeBase = (!isNaN(baseN) && isFinite(baseN) && baseN !== 0) 
      ? baseN 
      : (isLat ? 26.7725 : 75.8753);
    const angle = ((index + 1) * 45 * Math.PI) / 180;
    const dist = 0.003 + (index % 5) * 0.002;
    const offset = isLat ? Math.sin(angle) * dist : Math.cos(angle) * dist;
    return safeBase + offset;
  };

  const safeLat = getValidCoord(coordinates?.lat, 26.7725, 0, true);
  const safeLng = getValidCoord(coordinates?.lng, 75.8753, 0, false);

  const { user } = useAuth();
  const [internalViewMode, setInternalViewMode] = useState('map');
  const activeViewMode = viewMode || internalViewMode;

  const handleSwitchView = (mode) => {
    if (setViewMode) {
      setViewMode(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Approximate relative positioning offsets for nearby people around center GPS
  const peopleWithOffsets = people.map((p, idx) => {
    return {
      ...p,
      lat: getValidCoord(p.lat, safeLat, idx, true),
      lng: getValidCoord(p.lng, safeLng, idx, false)
    };
  });

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 flex flex-col justify-between">
      
      {/* ============================================================ */}
      {/* 1. TOP FLOATING MAP CONTROLS BAR (Matching Reference Image) */}
      {/* ============================================================ */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Control Chips */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          
          {/* Radius Selector */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-2 text-xs font-bold text-[#0F172A]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#22C55E]" />
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer pr-1"
            >
              <option value="1">Within 1 km</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
            </select>
          </div>

          {/* Date Selector */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-2 text-xs font-bold text-[#0F172A]">
            <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
            <select
              value={dateFilter || 'All'}
              onChange={(e) => setDateFilter && setDateFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="Weekend">This Weekend</option>
            </select>
          </div>

          {/* All Filters Drawer Toggle Button */}
          <button
            onClick={() => setShowFilters && setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              showFilters
                ? 'bg-[#22C55E] text-white border-emerald-500'
                : 'bg-white/95 text-[#0F172A] border-slate-200/90 hover:bg-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Filters</span>
          </button>

        </div>

        {/* Right Switcher Pill (List View vs Map View) */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => handleSwitchView('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'grid' || activeViewMode === 'list'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => handleSwitchView('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'map'
                ? 'bg-[#22C55E] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            Map View
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. LEAFLET HD MAP CANVAS */}
      {/* ============================================================ */}
      <div className="w-full h-full relative z-10">
        <MapContainer
          center={[safeLat, safeLng]}
          zoom={14}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full"
        >
          {/* Mapbox High Definition Tiles */}
          <TileLayer
            attribution={MAPBOX_ATTRIBUTION}
            url={MAPBOX_TILE_URL}
            tileSize={256}
            maxZoom={20}
          />

          <MapController lat={safeLat} lng={safeLng} zoom={14} />
          <MapZoomControls />

          {/* Concentric Pulsing Green Radar Rings */}
          <Circle
            center={[safeLat, safeLng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#22C55E',
              fillColor: '#22C55E',
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: '6, 8'
            }}
          />
          <Circle
            center={[safeLat, safeLng]}
            radius={radiusKm * 500}
            pathOptions={{
              color: '#22C55E',
              fillColor: '#22C55E',
              fillOpacity: 0.08,
              weight: 2,
            }}
          />
          <Circle
            center={[safeLat, safeLng]}
            radius={radiusKm * 250}
            pathOptions={{
              color: '#22C55E',
              fillColor: '#22C55E',
              fillOpacity: 0.12,
              weight: 2.5,
            }}
          />

          {/* Center User Location Marker */}
          <Marker position={[safeLat, safeLng]} icon={userBeaconIcon}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <span className="text-xs font-extrabold text-[#0F172A] block">📍 Your Location</span>
                <span className="text-[11px] text-slate-500">{locationName}</span>
              </div>
            </Popup>
          </Marker>

          {/* Nearby Member Avatars on Map */}
          {peopleWithOffsets.map((person) => {
            const avatar = getSafeAvatar(person.name, person.avatar, person.gender);
            const personIcon = createPeopleAvatarIcon(avatar, person.name, person.status === 'Online');

            return (
              <Marker
                key={person.id}
                position={[person.lat, person.lng]}
                icon={personIcon}
              >
                <Popup>
                  <div className="p-2 text-left font-sans space-y-2 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <img
                        src={avatar}
                        alt={person.name}
                        onError={(e) => handleAvatarError(e, person.name, person.gender)}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#0F172A] truncate">@{person.username || person.name}</p>
                        <p className="text-[10px] font-bold text-[#22C55E]">{person.distanceKm} km away</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onJoinActivity({ title: `Chat with @${person.username || person.name}`, creator: person })}
                      className="w-full h-7 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Say Hi in Chat
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Floating Activity Callout Cards Pinned on Map */}
          {activities.map((act, idx) => {
            const actIcon = createFloatingActivityCardIcon(act);
            const actLat = getValidCoord(act.lat, safeLat, idx + 2, true);
            const actLng = getValidCoord(act.lng, safeLng, idx + 2, false);

            return (
              <Marker
                key={act.id}
                position={[actLat, actLng]}
                icon={actIcon}
              >
                <Popup>
                  <div className="p-2 text-left font-sans space-y-2 max-w-[220px]">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                      {act.category} • {act.distanceKm} km
                    </span>
                    <h4 className="text-xs font-black text-[#0F172A] leading-snug">{act.title}</h4>
                    <p className="text-[11px] text-slate-500">📍 {act.locationName || act.location_label}</p>
                    <button
                      onClick={() => onJoinActivity(act)}
                      className="w-full h-8 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Join Activity
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>

        {/* Floating Activity Toast Overlay (Matching Reference Image) */}
        <div className="absolute bottom-28 left-6 z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xl flex items-center gap-3 text-xs font-extrabold text-[#0F172A] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex -space-x-2 overflow-hidden">
            {people.slice(0, 3).map((p, i) => (
              <img
                key={i}
                src={getSafeAvatar(p.name, p.avatar, p.gender)}
                alt={p.name}
                className="w-6 h-6 rounded-full ring-2 ring-white object-cover"
              />
            ))}
          </div>
          <div>
            <span className="text-[#22C55E] font-black">12+ people nearby</span> are looking for badminton partners
          </div>
          <button
            onClick={() => onOpenCreate && onOpenCreate()}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#22C55E] flex items-center justify-center transition-colors shrink-0"
            title="Create Activity"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* GPS Center Control Button */}
        <button
          onClick={requestUserLocation}
          className="absolute bottom-28 right-4 z-[400] w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-slate-700 hover:text-[#22C55E] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Recenter to Live GPS"
        >
          <Navigation className="w-4 h-4 fill-slate-700 hover:fill-[#22C55E]" />
        </button>

        {/* ============================================================ */}
        {/* 3. BOTTOM "PEOPLE NEAR YOU" STRIP (Matching Reference Image) */}
        {/* ============================================================ */}
        <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-2xl space-y-2 text-left">
          
          <div className="flex items-center justify-between text-xs font-extrabold text-[#0F172A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span>People Near You</span>
            </div>
            <button
              onClick={() => handleSwitchView('grid')}
              className="text-[11px] font-bold text-[#22C55E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Horizontal Scrollable Avatar Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {people.slice(0, 10).map((p) => {
              const avatar = getSafeAvatar(p.name, p.avatar, p.gender);
              const displayName = p.name ? p.name.split(' ')[0] : 'Member';

              return (
                <div
                  key={p.id}
                  onClick={() => onJoinActivity({ title: `Chat with @${p.username || p.name}`, creator: p })}
                  className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
                  title={`Chat with ${p.name} (${p.distanceKm} km)`}
                >
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={p.name}
                      onError={(e) => handleAvatarError(e, p.name, p.gender)}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-[#22C55E] transition-all bg-slate-100"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] ring-2 ring-white"></span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0F172A] group-hover:text-[#22C55E] transition-colors truncate max-w-[60px]">
                    {displayName}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 -mt-1">
                    {p.distanceKm} km
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}

export default DesktopExploreMap;
