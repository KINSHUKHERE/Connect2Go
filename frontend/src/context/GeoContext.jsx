import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { detectLiveGpsLocation, reverseGeocodeIndia } from '../utils/geoService.js';
import { useAuth } from './AuthContext.jsx';
import { getActivityImage } from '../utils/imageUtils.js';

const GeoContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export const SAMPLE_ACTIVITIES = [];
export const SAMPLE_PEOPLE = [];

const getInitialLocation = () => {
  try {
    const saved = localStorage.getItem('connect2go_user_location');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lat && parsed.lng) {
        return parsed;
      }
    }
  } catch (e) {}
  return { lat: 26.7725, lng: 75.8753, name: 'Poornima Campus Hub' };
};

export function GeoProvider({ children }) {
  const { user } = useAuth();
  const initialLoc = getInitialLocation();
  const [coordinates, setCoordinates] = useState({ lat: initialLoc.lat, lng: initialLoc.lng });
  const [locationName, setLocationName] = useState(initialLoc.name || 'Poornima Campus Hub');
  const [radiusKm, setRadiusKm] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activities, setActivities] = useState([]);
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch activities dynamically from Backend (Supabase PostgreSQL)
  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/activities`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          radius: radiusKm,
          category: selectedCategory
        },
        timeout: 4000
      });

      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mapped = res.data.data.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          distanceKm: item.distance_km ?? 1.0,
          date: 'Upcoming',
          time: item.time_slot || 'Today',
          time_slot: item.time_slot || 'Today',
          locationName: item.location_label || 'Jaipur Hub',
          location_label: item.location_label || 'Jaipur Hub',
          lat: item.lat || coordinates.lat,
          lng: item.lon || coordinates.lng,
          participantCount: item.max_participants || 4,
          joinedCount: item.current_participants || 1,
          creator: {
            name: item.creator_name || 'Member',
            avatar: item.creator_avatar || '/avatars/male.png',
            badge: 'Host'
          },
          imageUrl: getActivityImage({ title: item.title, category: item.category, imageUrl: item.image_url }),
          matchScore: 94,
          description: item.description
        }));
        setActivities(mapped);
      }
    } catch (err) {
      console.warn('Backend activity fetch failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nearby peers dynamically from Backend (Supabase Profiles)
  const fetchPeople = async () => {
    try {
      let activeUser = user;
      if (!activeUser) {
        try {
          const stored = localStorage.getItem('connect2go_user');
          if (stored) activeUser = JSON.parse(stored);
        } catch (e) {}
      }

      const res = await axios.get(`${API_BASE}/users`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          current_user_id: activeUser?.id,
          current_user_email: activeUser?.email
        },
        timeout: 4000
      });

      if (res.data?.success && Array.isArray(res.data?.data)) {
        // Exclude admin & exclude current user's own profile completely
        const nonSelfPeers = res.data.data.filter(p => {
          const isAdmin = p.role === 'admin' || p.username === 'kinshuk_admin' || (p.email || '').toLowerCase() === 'herekinshuk@gmail.com';
          const isSelf = activeUser && (
            (activeUser.id && p.id === activeUser.id) ||
            (activeUser.email && (p.email || '').toLowerCase() === (activeUser.email || '').toLowerCase()) ||
            (activeUser.username && (p.username || '').toLowerCase() === (activeUser.username || '').toLowerCase())
          );
          return !isAdmin && !isSelf;
        });

        const mappedPeople = nonSelfPeers.map(p => ({
          id: p.id,
          name: p.name,
          username: p.username || (p.name || 'user').toLowerCase().replace(/\s+/g, '_'),
          gender: p.gender || 'Male',
          email: p.email,
          distanceKm: p.distanceKm ?? 1.2,
          avatar: p.avatar,
          bio: p.bio,
          interests: Array.isArray(p.interests) && p.interests.length > 0 ? p.interests : ['Badminton', 'Fitness', 'Study'],
          status: p.status === 'Active' ? 'Online' : p.status,
          trustScore: p.trustScore || 95
        }));
        setPeople(mappedPeople);
      }
    } catch (err) {
      console.warn('Backend users fetch error:', err.message);
    }
  };

  const syncLocationToBackend = async (latVal, lngVal, nameVal) => {
    try {
      let activeUser = user;
      if (!activeUser) {
        try {
          const stored = localStorage.getItem('connect2go_user');
          if (stored) activeUser = JSON.parse(stored);
        } catch (e) {}
      }

      if (activeUser?.id || activeUser?.email) {
        await axios.post(`${API_BASE}/users/location`, {
          userId: activeUser.id,
          userEmail: activeUser.email,
          lat: latVal,
          lon: lngVal,
          location_label: nameVal
        });
      }
    } catch (e) {}
  };

  // Synchronize on mount and parameter changes
  useEffect(() => {
    fetchActivities();
    fetchPeople();
    syncLocationToBackend(coordinates.lat, coordinates.lng, locationName);
  }, [selectedCategory, radiusKm, coordinates, locationName]);

  // Connect Socket.IO for real-time live activity creation
  useEffect(() => {
    let socket;
    try {
      socket = io(SOCKET_URL, { reconnectionAttempts: 3, timeout: 3000 });
      socket.on('activity_created', (newAct) => {
        const formatted = {
          id: newAct.id,
          title: newAct.title,
          category: newAct.category,
          distanceKm: 0.5,
          date: 'Just now',
          time: newAct.time_slot || 'Today',
          time_slot: newAct.time_slot || 'Today',
          locationName: newAct.location_label,
          location_label: newAct.location_label,
          lat: newAct.lat || coordinates.lat,
          lng: newAct.lon || coordinates.lng,
          participantCount: newAct.max_participants || 4,
          joinedCount: 1,
          creator: {
            name: newAct.creator_name || 'Member',
            avatar: newAct.creator_avatar || '/avatars/male.png',
            badge: 'Host'
          },
          imageUrl: getActivityImage({ title: newAct.title, category: newAct.category }),
          matchScore: 95,
          description: newAct.description
        };
        setActivities(prev => {
          const exists = prev.some(a => a.id === formatted.id || (a.title === formatted.title && a.creator?.name === formatted.creator.name));
          if (exists) {
            return prev.map(a => (a.id === formatted.id || (a.title === formatted.title && a.creator?.name === formatted.creator.name)) ? formatted : a);
          }
          return [formatted, ...prev];
        });
      });

      socket.on('user_location_updated', () => {
        fetchPeople();
      });
    } catch (e) {
      // socket fallback
    }

    return () => {
      socket?.disconnect();
    };
  }, [coordinates]);

  // Create new activity via Backend API
  const addActivity = async (newAct) => {
    const actWithImg = {
      ...newAct,
      imageUrl: getActivityImage(newAct)
    };

    try {
      const payload = {
        title: actWithImg.title,
        category: actWithImg.category,
        description: actWithImg.description,
        location_label: actWithImg.locationName || actWithImg.location_label || locationName,
        lat: actWithImg.lat || coordinates.lat,
        lon: actWithImg.lng || coordinates.lng,
        max_participants: actWithImg.participantCount || 4,
        time_slot: actWithImg.time || actWithImg.time_slot || 'Today',
        creator_name: actWithImg.creator?.name || 'You',
        creator_avatar: actWithImg.creator?.avatar
      };

      const res = await axios.post(`${API_BASE}/activities`, payload);
      if (res.data?.data) {
        const created = res.data.data;
        const formatted = {
          ...actWithImg,
          id: created.id || actWithImg.id
        };
        setActivities(prev => {
          const exists = prev.some(a => a.id === formatted.id || (a.title === formatted.title && a.creator?.name === formatted.creator.name));
          if (exists) {
            return prev.map(a => (a.id === formatted.id || (a.title === formatted.title && a.creator?.name === formatted.creator.name)) ? formatted : a);
          }
          return [formatted, ...prev];
        });
        return;
      }
    } catch (err) {
      console.warn('Backend activity post failed, adding locally:', err.message);
    }

    // Local fallback
    setActivities((prev) => {
      const exists = prev.some(a => a.id === actWithImg.id || (a.title === actWithImg.title && a.creator?.name === actWithImg.creator.name));
      if (exists) return prev;
      return [actWithImg, ...prev];
    });
  };

  // Join / Express Interest in an activity
  const joinActivity = async (activityId) => {
    try {
      await axios.post(`${API_BASE}/activities/${activityId}/join`, {});
    } catch (err) {
      console.warn('Backend join failed, updating locally:', err.message);
    }

    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const nextCount = Math.min((act.joinedCount || act.current_participants || 1) + 1, act.participantCount || act.max_participants || 4);
          return {
            ...act,
            joinedCount: nextCount,
            current_participants: nextCount,
            isJoined: true
          };
        }
        return act;
      })
    );
    return true;
  };

  // Delete an activity
  const deleteActivity = async (activityId) => {
    try {
      await axios.delete(`${API_BASE}/activities/${activityId}`);
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err.message);
    }

    setActivities((prev) => prev.filter((act) => act.id !== activityId));
  };

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Live GPS Geolocation with exact street/city address resolution for India
  const requestUserLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await detectLiveGpsLocation();
      const numLat = Number(loc.lat);
      const numLng = Number(loc.lng);
      setCoordinates({ lat: numLat, lng: numLng });
      setLocationName(loc.locationName);
      try {
        localStorage.setItem('connect2go_user_location', JSON.stringify({ lat: numLat, lng: numLng, name: loc.locationName, isManual: false }));
      } catch (e) {}
      syncLocationToBackend(numLat, numLng, loc.locationName);
      fetchActivities();
      fetchPeople();
      setIsDetectingLocation(false);
      return { success: true, location: loc };
    } catch (err) {
      console.warn('Live location detection failed:', err.message);
      setIsDetectingLocation(false);
      return { success: false, message: err.message };
    }
  };

  // Change location to any city or place in India
  const setCustomLocation = (lat, lng, name) => {
    const numLat = Number(lat);
    const numLng = Number(lng);
    const finalName = name || locationName;
    setCoordinates({ lat: numLat, lng: numLng });
    if (name) setLocationName(name);
    try {
      localStorage.setItem('connect2go_user_location', JSON.stringify({ lat: numLat, lng: numLng, name: finalName, isManual: true }));
    } catch (e) {}
    syncLocationToBackend(numLat, numLng, finalName);
    fetchActivities();
    fetchPeople();
  };

  return (
    <GeoContext.Provider
      value={{
        coordinates,
        setCoordinates,
        locationName,
        setLocationName,
        radiusKm,
        setRadiusKm,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        activities,
        people,
        addActivity,
        joinActivity,
        deleteActivity,
        requestUserLocation,
        setCustomLocation,
        isDetectingLocation,
        isLoading,
        refreshActivities: fetchActivities,
        refreshPeople: fetchPeople,
        refreshData: () => {
          fetchActivities();
          fetchPeople();
        }
      }}
    >
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  const context = useContext(GeoContext);
  if (!context) {
    throw new Error('useGeo must be used within a GeoProvider');
  }
  return context;
}
