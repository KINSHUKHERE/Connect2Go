import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Search, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal, 
  X, 
  Loader2,
  Compass
} from 'lucide-react';
import { useGeo } from '../../context/GeoContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { searchIndiaPlaces, MAPBOX_TILE_URL, MAPBOX_ATTRIBUTION } from '../../utils/geoService.js';

// Custom Pin Icon using inline HTML/SVG for crystal clear rendering
const createCustomPin = (emoji = '📍', bgColor = '#22C55E') => {
  return L.divIcon({
    className: 'custom-activity-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: ${bgColor};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2.5px solid white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          line-height: 1;
        ">${emoji}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

// Pulsing Live GPS User Location Beacon
const liveUserIcon = L.divIcon({
  className: 'live-gps-user-beacon',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        inset: -8px;
        background: rgba(34, 197, 94, 0.35);
        border-radius: 50%;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: absolute;
        inset: 0;
        background: #0F172A;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

// Category Emoji Map
const categoryEmojis = {
  Sports: '🏸',
  Fitness: '🏃',
  Gaming: '♟️',
  Study: '📚',
  Food: '☕',
  Travel: '🚴',
  Music: '🎸',
  Others: '✨',
};

// Map View Controller to smoothly fly to coordinates when changed
function MapController({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export function MapView({ onJoinActivity }) {
  const { 
    coordinates, 
    radiusKm, 
    setRadiusKm, 
    activities, 
    locationName, 
    requestUserLocation,
    setCustomLocation,
    isDetectingLocation 
  } = useGeo();

  // Search state for India locations
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounced search for any place in India
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchIndiaPlaces(val);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchResults(true);
    }, 450);
  };

  const handleSelectLocation = (loc) => {
    setCustomLocation(loc.lat, loc.lng, loc.shortName);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <div className="w-full space-y-3 text-left">
      
      {/* Top Floating Controls Bar: Live Location Detector, Search Any Place in India & Radius */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Live GPS Detection Button */}
        <button
          onClick={requestUserLocation}
          disabled={isDetectingLocation}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-75"
          title="Detect your exact live GPS coordinates"
        >
          {isDetectingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 fill-white" />
          )}
          <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect My Live Location'}</span>
        </button>

        {/* Search Any Location in India */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search any city, area, campus or ground in India..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-border rounded-xl text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin absolute right-3" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-dark-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results for India */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-border rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectLocation(item)}
                  className="px-3.5 py-2.5 hover:bg-brand-50/70 cursor-pointer text-left transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-dark-text truncate">{item.shortName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.displayName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Location Badge & Quick Radius Toggles */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-border/80 rounded-xl text-xs font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate max-w-[150px]">{locationName}</span>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
            {[1, 2, 5, 10, 20].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  radiusKm === r
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-500 hover:text-dark-text'
                }`}
                title={`Set search radius to ${r} km`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden border border-border/90 shadow-soft relative z-10">
        
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Mapbox High-Definition Retina Tiles */}
          <TileLayer
            attribution={MAPBOX_ATTRIBUTION}
            url={MAPBOX_TILE_URL}
            tileSize={256}
            maxZoom={20}
          />

          {/* Controller to fly smoothly to new coordinates */}
          <MapController center={[coordinates.lat, coordinates.lng]} zoom={14} />

          {/* Dynamic Radar Search Radius Circle around User's Location */}
          <Circle
            center={[coordinates.lat, coordinates.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#22C55E',
              fillColor: '#22C55E',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '5, 8'
            }}
          />

          {/* Live User Location Beacon Marker */}
          <Marker position={[coordinates.lat, coordinates.lng]} icon={liveUserIcon}>
            <Tooltip permanent direction="top" offset={[0, -18]} className="font-sans font-bold text-xs shadow-md">
              <span>📍 {locationName}</span>
            </Tooltip>
            <Popup>
              <div className="p-1 text-center font-sans">
                <span className="text-xs font-bold text-dark-text block">📍 Your Current Position</span>
                <span className="text-[11px] text-slate-500">{locationName}</span>
                <p className="text-[10px] text-brand-600 font-semibold mt-1">
                  Radar radius: {radiusKm} km
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Activity Pins with Emoji Icons */}
          {activities.map((act) => {
            const emoji = categoryEmojis[act.category] || '✨';
            const pinIcon = createCustomPin(emoji, '#22C55E');

            return (
              <Marker
                key={act.id}
                position={[act.lat, act.lng]}
                icon={pinIcon}
              >
                <Popup>
                  <div className="p-1 max-w-[220px] text-left font-sans space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="primary" size="sm" className="text-[10px] font-bold">
                        {emoji} {act.category}
                      </Badge>
                      <span className="text-[10px] text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-full">
                        {act.distanceKm} km away
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-dark-text leading-tight">
                      {act.title}
                    </h4>

                    <p className="text-[10px] text-slate-500">
                      📍 {act.locationName || act.location_label} • {act.time || act.time_slot}
                    </p>

                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs h-8 font-bold mt-1 shadow-xs"
                      onClick={() => onJoinActivity(act)}
                    >
                      Join / Connect
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Quick Legend & Stats on the Map */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border shadow-md flex items-center gap-3 text-xs font-bold text-dark-text">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-2xs"></span>
            <span className="text-[11px]">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow-2xs"></span>
            <span className="text-[11px]">{activities.length} Activities in India</span>
          </div>
        </div>

      </div>

    </div>
  );
}
