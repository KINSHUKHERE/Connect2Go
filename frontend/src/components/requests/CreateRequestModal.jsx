import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { 
  Sparkles, 
  Check, 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  Search, 
  Loader2, 
  Clock, 
  Calendar,
  X 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGeo } from '../../context/GeoContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { reverseGeocodeIndia, detectLiveGpsLocation, searchIndiaPlaces, MAPBOX_TILE_URL, MAPBOX_ATTRIBUTION } from '../../utils/geoService.js';
import { categoryBanners } from '../../utils/imageUtils.js';

// Custom Pin for picked meetup venue
const meetupPinIcon = L.divIcon({
  className: 'meetup-pin',
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
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    ">
      <span style="transform: rotate(45deg); font-size: 15px;">📍</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function MapEventsHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyMapTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { duration: 0.8 });
    }
  }, [center, map]);
  return null;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export function CreateRequestModal({ isOpen, onClose, onCreated }) {
  const { addActivity, coordinates, locationName } = useGeo();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sports');
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('6:00 PM');
  const [radius, setRadius] = useState(2);
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [isSuccess, setIsSuccess] = useState(false);

  // Meetup location states
  const [meetupLocation, setMeetupLocation] = useState(locationName || 'Central Park, Jaipur');
  const [meetupCoords, setMeetupCoords] = useState({ lat: coordinates.lat, lng: coordinates.lng });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Search in India
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setMeetupLocation(locationName || 'Central Park, Jaipur');
      setMeetupCoords({ lat: coordinates.lat, lng: coordinates.lng });
      setShowMapPicker(false);
      setIsSuccess(false);
    }
  }, [isOpen, locationName, coordinates]);

  const categories = ['Sports', 'Fitness', 'Gaming', 'Study', 'Food', 'Travel', 'Music', 'Others'];

  const handleMapClick = async (lat, lng) => {
    setMeetupCoords({ lat, lng });
    setIsGeocoding(true);
    try {
      const geo = await reverseGeocodeIndia(lat, lng);
      setMeetupLocation(geo.locationName);
    } catch {
      setMeetupLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
    setIsGeocoding(false);
  };

  const handleDetectLiveLocation = async () => {
    setIsDetectingGPS(true);
    try {
      const loc = await detectLiveGpsLocation();
      setMeetupCoords({ lat: loc.lat, lng: loc.lng });
      setMeetupLocation(loc.locationName);
    } catch (err) {
      alert(err.message || 'Unable to detect GPS position.');
    }
    setIsDetectingGPS(false);
  };

  const handleSearchLocations = async (val) => {
    setLocationSearch(val);
    if (!val || val.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await searchIndiaPlaces(val);
    setSearchResults(results);
  };

  const handleSelectSearchResult = (item) => {
    setMeetupCoords({ lat: item.lat, lng: item.lng });
    setMeetupLocation(item.shortName);
    setLocationSearch('');
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const bannerImage = categoryBanners[category] || categoryBanners.Sports;

    const newActivity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      category,
      distanceKm: 0.5,
      date,
      time,
      time_slot: `${date}, ${time}`,
      locationName: meetupLocation || 'Jaipur, Rajasthan',
      location_label: meetupLocation || 'Jaipur, Rajasthan',
      lat: meetupCoords.lat,
      lng: meetupCoords.lng,
      participantCount: parseInt(maxParticipants, 10) || 4,
      joinedCount: 1,
      creator: {
        name: user ? user.name : 'Host',
        avatar: user ? user.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host&backgroundColor=e2e8f0,cbd5e1',
        badge: 'Host'
      },
      imageUrl: bannerImage,
      matchScore: 99,
      description: description.trim() || `Looking for activity partners for ${category} nearby!`
    };

    addActivity(newActivity);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onCreated) onCreated();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Host an Activity"
      subtitle="Find like-minded companions nearby to join your activity."
      maxWidth="max-w-xl"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h4 className="text-xl font-bold text-dark-text">Activity Request Published!</h4>
          <p className="text-xs sm:text-sm text-dark-muted max-w-sm mx-auto">
            Your activity is now pinned on the live map. Nearby peers will discover it and can request to join.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-left">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-dark-muted mb-1.5">
              Activity Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-dark-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Title */}
          <Input
            label="Activity Title"
            placeholder="e.g. Evening Badminton Doubles Rally, Weekend 5K Run..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Date, Time & Max Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Date"
              placeholder="e.g. Today, Tomorrow, Saturday"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Time Slot"
              placeholder="e.g. 6:00 PM - 7:30 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1">
                Max People
              </label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs font-semibold text-dark-text focus:outline-none focus:border-brand-500"
              >
                <option value="2">2 Players (1-on-1)</option>
                <option value="4">4 Players (Doubles/Group)</option>
                <option value="6">6 Players</option>
                <option value="8">8 Players</option>
                <option value="12">12+ Players (Open Team)</option>
              </select>
            </div>
          </div>

          {/* Meetup Location Picker with Live GPS and Map */}
          <div className="p-3.5 bg-slate-50 border border-border/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Meetup Venue / Location in India</span>
              </label>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDetectLiveLocation}
                  disabled={isDetectingGPS}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                  title="Detect live GPS"
                >
                  {isDetectingGPS ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 fill-brand-600" />}
                  <span>Live GPS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    showMapPicker 
                      ? 'bg-brand-500 text-white shadow-2xs' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-border'
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>{showMapPicker ? 'Close Map' : 'Pick on Map'}</span>
                </button>
              </div>
            </div>

            {/* Location Name Input */}
            <input
              type="text"
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              placeholder="e.g. Campus Sports Arena Court 2, Jaipur"
              className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs text-dark-text font-semibold focus:outline-none focus:border-brand-500"
            />
            {isGeocoding && (
              <p className="text-[10px] text-brand-600 font-semibold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Detecting street address from map pin...
              </p>
            )}

            {/* Embedded Interactive Map for Pin Dropping */}
            {showMapPicker && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                {/* Search in India */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search any place in India to place pin..."
                    value={locationSearch}
                    onChange={(e) => handleSearchLocations(e.target.value)}
                    className="w-full h-8 pl-8 pr-7 bg-white border border-border rounded-lg text-[11px] focus:outline-none focus:border-brand-500"
                  />
                  {locationSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationSearch('');
                        setSearchResults([]);
                      }}
                      className="absolute right-2 top-2 text-slate-400 hover:text-dark-text p-0.5 rounded"
                      title="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-36 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSearchResult(item)}
                          className="px-3 py-1.5 hover:bg-brand-50 cursor-pointer text-left text-[11px] font-medium text-dark-text truncate"
                        >
                          📍 {item.shortName} <span className="text-slate-400">({item.city})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full h-52 rounded-xl overflow-hidden border border-border relative z-10 shadow-inner">
                  {/* Floating Location Badge on Map */}
                  <div className="absolute top-2 left-2 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-brand-200/80 shadow-md flex items-center gap-1.5 max-w-[85%] pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shrink-0"></span>
                    <span className="text-[11px] font-bold text-dark-text truncate">
                      📍 {meetupLocation || 'Select meetup location'}
                    </span>
                  </div>

                  <MapContainer
                    center={[
                      Number(meetupCoords?.lat) || 26.7725, 
                      Number(meetupCoords?.lng) || 75.8753
                    ]}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                    style={{ height: '100%', width: '100%', minHeight: '200px' }}
                  >
                    <TileLayer
                      attribution={MAPBOX_ATTRIBUTION}
                      url={MAPBOX_TILE_URL}
                      tileSize={256}
                      maxZoom={20}
                    />
                    <MapResizeHandler />
                    <FlyMapTo center={[
                      Number(meetupCoords?.lat) || 26.7725, 
                      Number(meetupCoords?.lng) || 75.8753
                    ]} />
                    <MapEventsHandler onLocationSelect={handleMapClick} />
                    <Marker 
                      position={[
                        Number(meetupCoords?.lat) || 26.7725, 
                        Number(meetupCoords?.lng) || 75.8753
                      ]} 
                      icon={meetupPinIcon}
                    >
                      <Tooltip permanent direction="top" offset={[0, -28]} className="font-sans font-bold text-xs shadow-md">
                        <span>📍 {meetupLocation || 'Meetup spot'}</span>
                      </Tooltip>
                    </Marker>
                  </MapContainer>
                </div>
                <p className="text-[10px] text-slate-500">
                  💡 Tip: Click anywhere on the map of India to drop the meetup pin.
                </p>
              </div>
            )}
          </div>

          {/* Target Radius Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-dark-muted mb-1">
              <span>Notify Interested People Within</span>
              <span className="text-brand-600 font-extrabold">{radius} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-dark-muted mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring your own badminton racket, intermediate level rally, let’s have fun!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-border rounded-xl text-dark-text placeholder:text-dark-faint focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex gap-2.5">
            <Button type="button" variant="outline" onClick={onClose} className="w-1/3 text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="w-2/3 font-bold text-xs shadow-xs">
              Publish Activity Request
            </Button>
          </div>

        </form>
      )}
    </Modal>
  );
}
