import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { 
  Navigation, 
  Search, 
  MapPin, 
  Check, 
  Loader2, 
  X,
  Compass
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGeo } from '../../context/GeoContext.jsx';
import { searchIndiaPlaces, reverseGeocodeIndia, MAPBOX_TILE_URL, MAPBOX_ATTRIBUTION } from '../../utils/geoService.js';

// Custom Pin for picked location
const pickedPinIcon = L.divIcon({
  className: 'picked-pin',
  html: `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #22C55E;
      color: white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    ">
      <span style="transform: rotate(45deg); font-size: 15px;">📍</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Map Click Listener component
function MapEvents({ onLocationClick }) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Map Centering Controller
function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 1.0 });
    }
  }, [center, map]);
  return null;
}

export function LocationPickerModal({ isOpen, onClose }) {
  const { 
    coordinates, 
    locationName, 
    setCustomLocation, 
    requestUserLocation, 
    isDetectingLocation 
  } = useGeo();

  const [pickedCoords, setPickedCoords] = useState({ lat: coordinates.lat, lng: coordinates.lng });
  const [pickedName, setPickedName] = useState(locationName);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPickedCoords({ lat: coordinates.lat, lng: coordinates.lng });
      setPickedName(locationName);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, coordinates, locationName]);

  const popularHubs = [
    { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Poornima University, Jaipur', lat: 26.7725, lng: 75.8753 },
    { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
    { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
  ];

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
    }, 400);
  };

  const handleSelectSearchResult = (item) => {
    setPickedCoords({ lat: item.lat, lng: item.lng });
    setPickedName(item.shortName);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMapClick = async (lat, lng) => {
    setPickedCoords({ lat, lng });
    setIsGeocoding(true);
    try {
      const geo = await reverseGeocodeIndia(lat, lng);
      setPickedName(geo.locationName);
    } catch {
      setPickedName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
    setIsGeocoding(false);
  };

  const handleDetectGPS = async () => {
    const res = await requestUserLocation();
    if (res?.success && res.location) {
      setPickedCoords({ lat: res.location.lat, lng: res.location.lng });
      setPickedName(res.location.locationName);
    }
  };

  const handleApply = () => {
    setCustomLocation(pickedCoords.lat, pickedCoords.lng, pickedName);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Discovery Location"
      subtitle="Search any location across India or detect your live GPS position."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 pt-1 text-left">
        
        {/* Live GPS Detector Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 bg-brand-50/70 border border-brand-200/80 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Navigation className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-900">Current Selected Spot:</h4>
              <p className="text-xs text-brand-700 font-semibold truncate max-w-xs sm:max-w-sm">
                {isGeocoding ? 'Detecting address...' : pickedName}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleDetectGPS}
            disabled={isDetectingLocation}
            className="font-bold text-xs shrink-0 shadow-xs"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Navigation className="w-3.5 h-3.5 mr-1.5 fill-white" />
            )}
            <span>Detect My Live GPS</span>
          </Button>
        </div>

        {/* Search Any Location in India */}
        <div className="relative">
          <label className="block text-xs font-bold text-dark-muted mb-1">
            Search Location in India
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Type any city, area, ground, or campus (e.g. Mansarovar, Jaipur)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-10 pl-10 pr-9 bg-slate-50 border border-border rounded-xl text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin absolute right-3.5" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3.5 text-slate-400 hover:text-dark-text p-0.5 rounded"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchResult(item)}
                  className="px-3.5 py-2 hover:bg-brand-50 cursor-pointer text-left transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-dark-text truncate">{item.shortName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.displayName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Popular Hubs */}
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Locations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularHubs.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => {
                  setPickedCoords({ lat: hub.lat, lng: hub.lng });
                  setPickedName(hub.name);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-dark-text rounded-lg text-xs font-medium transition-colors"
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive India Map Preview with Click-To-Pin */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Click anywhere on the map to drop the pin</span>
            <span>All India OpenStreetMap</span>
          </div>
          <div className="w-full h-60 rounded-2xl overflow-hidden border border-border relative z-10 shadow-inner">
            {/* Floating Location Name Badge directly on top of the map */}
            <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-brand-200/80 shadow-md flex items-center gap-2 max-w-[85%] pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-bold text-dark-text truncate">
                📍 {isGeocoding ? 'Detecting address...' : pickedName}
              </span>
            </div>

            <MapContainer
              center={[pickedCoords.lat, pickedCoords.lng]}
              zoom={13}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution={MAPBOX_ATTRIBUTION}
                url={MAPBOX_TILE_URL}
                tileSize={256}
                maxZoom={20}
              />
              <FlyToLocation center={[pickedCoords.lat, pickedCoords.lng]} />
              <MapEvents onLocationClick={handleMapClick} />
              <Marker position={[pickedCoords.lat, pickedCoords.lng]} icon={pickedPinIcon}>
                <Tooltip permanent direction="top" offset={[0, -32]} className="font-sans font-bold text-xs shadow-md">
                  <span>📍 {isGeocoding ? 'Detecting...' : pickedName}</span>
                </Tooltip>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            icon={Check}
            className="font-bold text-xs shadow-xs"
          >
            Set Discovery Location
          </Button>
        </div>

      </div>
    </Modal>
  );
}
