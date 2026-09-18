// Geolocation & High-Speed Geocoding Service for India
// Powered by Mapbox High-Definition API with Photon/OSM Cascade Fallback

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const MAPBOX_TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
  : 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

export const MAPBOX_ATTRIBUTION = MAPBOX_TOKEN
  ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>';

/**
 * Search any location, neighborhood, college, landmark, or village in India
 * Powered by Mapbox Geocoding with fuzzy matching and locality prioritization
 * @param {string} query Search term
 * @returns {Promise<Array>} List of locations with lat, lng, displayName, shortName, city, state
 */
export async function searchIndiaPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();

  // 1. Primary: Mapbox Places Geocoding Engine
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      cleanQuery
    )}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=8`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        // Boost matches where the place name matches a typed term
        const queryLower = cleanQuery.toLowerCase();
        const tokens = queryLower.split(/[, ]+/).filter((t) => t.length > 2);

        const sorted = [...data.features].sort((a, b) => {
          const aText = (a.text || '').toLowerCase();
          const bText = (b.text || '').toLowerCase();
          const aExact = tokens.some((t) => aText === t);
          const bExact = tokens.some((t) => bText === t);
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return (b.relevance || 0) - (a.relevance || 0);
        });

        return sorted.map((item) => {
          const ctx = item.context || [];
          const place = ctx.find((c) => c.id.startsWith('place'))?.text;
          const district = ctx.find((c) => c.id.startsWith('district'))?.text;
          const region = ctx.find((c) => c.id.startsWith('region'))?.text;

          const shortParts = [item.text, place || district, region].filter(Boolean);
          const shortName = shortParts.join(', ') || item.text;

          return {
            id: item.id || Math.random().toString(),
            shortName,
            displayName: item.place_name,
            city: place || district || item.text,
            state: region || '',
            lat: item.center[1],
            lng: item.center[0],
          };
        });
      }
    }
  } catch (err) {
    console.warn('Mapbox search error, trying Photon fallback:', err);
  }

  // 2. Cascade Fallback: Komoot Photon
  try {
    const parts = cleanQuery.split(/[,]+/).map((s) => s.trim()).filter(Boolean);
    const seenIds = new Set();
    const results = [];

    const addFeatures = (features) => {
      for (const f of features) {
        if (!f || !f.properties || !f.geometry?.coordinates) continue;
        const p = f.properties;
        const id = `${p.osm_id || ''}-${p.name || ''}`;
        if (p.countrycode && p.countrycode !== 'IN') continue;
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const lat = f.geometry.coordinates[1];
        const lng = f.geometry.coordinates[0];
        const name = p.name || '';
        const admin = p.city || p.county || p.town || p.village || '';
        const state = p.state || '';

        results.push({
          id: id || Math.random().toString(),
          displayName: [name, admin, state, 'India'].filter(Boolean).join(', '),
          shortName: [name, admin, state].filter(Boolean).join(', ') || name,
          city: admin || 'India',
          state,
          lat,
          lng,
        });
        if (results.length >= 8) break;
      }
    };

    if (parts.length > 1) {
      const townPart = parts[parts.length - 1];
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(townPart)}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        addFeatures(data.features || []);
      }
    }

    const fullRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6`);
    if (fullRes.ok) {
      const fullData = await fullRes.json();
      addFeatures(fullData.features || []);
    }

    return results;
  } catch (error) {
    console.warn('Fallback geocoding error:', error);
    return [];
  }
}

/**
 * Reverse-geocode coordinates to find the exact street / village / area in India
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @returns {Promise<{ locationName: string, fullAddress: string, city: string, state: string }>}
 */
export async function reverseGeocodeIndia(lat, lng) {
  // 1. Primary: Mapbox Reverse Geocoding
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const f = data.features?.[0];
      if (f) {
        const ctx = f.context || [];
        const place = ctx.find((c) => c.id.startsWith('place'))?.text;
        const region = ctx.find((c) => c.id.startsWith('region'))?.text;
        const locationName = [f.text, place || region].filter(Boolean).join(', ') || f.text;

        return {
          locationName,
          fullAddress: f.place_name,
          city: place || f.text,
          state: region || '',
        };
      }
    }
  } catch (err) {
    console.warn('Mapbox reverse geocode error:', err);
  }

  // 2. Fallback: Photon
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
    if (res.ok) {
      const data = await res.json();
      const f = data.features?.[0];
      if (f && f.properties) {
        const p = f.properties;
        const name = p.name || '';
        const admin = p.city || p.county || p.town || p.village || '';
        const state = p.state || '';
        return {
          locationName: [name, admin, state].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          fullAddress: [name, p.street, admin, state, 'India'].filter(Boolean).join(', '),
          city: admin || 'India',
          state,
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)} (India)`,
    city: 'India',
    state: '',
  };
}

/**
 * Detect user's current live GPS coordinates via browser Geolocation API
 * @returns {Promise<{ lat: number, lng: number, accuracy: number, locationName: string }>}
 */
export function detectLiveGpsLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const geocoded = await reverseGeocodeIndia(latitude, longitude);
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
            locationName: geocoded.locationName,
            fullAddress: geocoded.fullAddress,
            city: geocoded.city,
          });
        } catch {
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
            locationName: 'My Live Location',
            fullAddress: 'Current Live GPS Location',
            city: 'India',
          });
        }
      },
      (error) => {
        let msg = 'Unable to detect location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable. Please check your GPS / network connection.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location detection timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}

// Google Maps Platform Dynamic Loader (Optional API Engine)
let googleMapsLoadingPromise = null;
export function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.trim() === '') return Promise.resolve(null);
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve) => {
    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey.trim()}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google?.maps || null);
      script.onerror = () => {
        console.warn('Google Maps script failed to load. Falling back to OpenStreetMap.');
        resolve(null);
      };
      document.head.appendChild(script);
    } catch {
      resolve(null);
    }
  });

  return googleMapsLoadingPromise;
}

