import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { detectLiveGpsLocation, reverseGeocodeIndia } from '../utils/geoService.js';

const GeoContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export const SAMPLE_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Evening Badminton Doubles Rally',
    category: 'Sports',
    distanceKm: 1.2,
    date: 'Today',
    time: '6:00 PM',
    time_slot: 'Today, 6:00 PM - 7:30 PM',
    locationName: 'Campus Sports Arena, Court 2',
    location_label: 'Campus Sports Arena, Court 2',
    lat: 26.7725,
    lng: 75.8753,
    participantCount: 4,
    joinedCount: 2,
    creator: {
      name: 'Kinshuk K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      badge: 'Intermediate Player'
    },
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    matchScore: 95,
    description: 'Looking for 2 more players for an informal friendly badminton rally at the campus indoor courts.'
  },
  {
    id: 'act-2',
    title: 'Morning 5K Jog & Cardio Session',
    category: 'Fitness',
    distanceKm: 0.8,
    date: 'Tomorrow',
    time: '6:30 AM',
    time_slot: 'Tomorrow, 6:30 AM',
    locationName: 'Central Park Green Loop',
    location_label: 'Central Park Green Loop',
    lat: 26.7740,
    lng: 75.8765,
    participantCount: 5,
    joinedCount: 3,
    creator: {
      name: 'Lavanshu B.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      badge: 'Casual Runner'
    },
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
    matchScore: 88,
    description: 'Easy pace 5k morning run followed by light stretching. All fitness levels welcome, let’s stay consistent!'
  },
  {
    id: 'act-3',
    title: 'Weekend Chess Blitz & Coffee',
    category: 'Gaming',
    distanceKm: 1.9,
    date: 'Saturday',
    time: '4:00 PM',
    time_slot: 'Saturday, 4:00 PM',
    locationName: 'Student Center Lounge',
    location_label: 'Student Center Lounge',
    lat: 26.7710,
    lng: 75.8730,
    participantCount: 2,
    joinedCount: 1,
    creator: {
      name: 'Lavish G.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      badge: 'Blitz Player'
    },
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80',
    matchScore: 82,
    description: 'Casual 5+3 blitz games and tactics over iced cold brews at the cafeteria.'
  },
  {
    id: 'act-4',
    title: 'Fullstack Dev & Hackathon Prep',
    category: 'Study',
    distanceKm: 2.4,
    date: 'Friday',
    time: '5:00 PM',
    time_slot: 'Friday, 5:00 PM - 8:00 PM',
    locationName: 'Central Innovation Lab',
    location_label: 'Central Innovation Lab',
    lat: 26.7735,
    lng: 75.8780,
    participantCount: 4,
    joinedCount: 2,
    creator: {
      name: 'Kirti S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      badge: 'Frontend Dev'
    },
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    matchScore: 91,
    description: 'Working on React & Supabase architectures, exploring spatial queries and building cool side projects together.'
  },
];

export const SAMPLE_PEOPLE = [
  {
    id: 'p-1',
    name: 'Rohan Sharma',
    distanceKm: 2.1,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    commonInterests: 3,
    interests: ['Badminton', 'Running', 'Fitness'],
    status: 'Online',
  },
  {
    id: 'p-2',
    name: 'Priya Mehta',
    distanceKm: 1.5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    commonInterests: 4,
    interests: ['Running', 'Yoga', 'Travel', 'Music'],
    status: 'Online',
  },
  {
    id: 'p-3',
    name: 'Arjun Verma',
    distanceKm: 3.1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    commonInterests: 2,
    interests: ['Football', 'Gaming'],
    status: 'Away',
  },
  {
    id: 'p-4',
    name: 'Sneha Rao',
    distanceKm: 2.8,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    commonInterests: 3,
    interests: ['Coding', 'Photography', 'Music'],
    status: 'Online',
  },
];

export function GeoProvider({ children }) {
  const [coordinates, setCoordinates] = useState({ lat: 26.7725, lng: 75.8753 });
  const [locationName, setLocationName] = useState('Poornima Campus Hub');
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activities, setActivities] = useState(SAMPLE_ACTIVITIES);
  const [people, setPeople] = useState(SAMPLE_PEOPLE);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch activities from Backend (Supabase / In-memory)
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

      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        // Map backend format to UI card format
        const mapped = res.data.data.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          distanceKm: item.distance_km || 1.0,
          date: 'Upcoming',
          time: item.time_slot || 'Today',
          time_slot: item.time_slot || 'Today',
          locationName: item.location_label || 'Nearby Venue',
          location_label: item.location_label || 'Nearby Venue',
          lat: item.lat || coordinates.lat,
          lng: item.lon || coordinates.lng,
          participantCount: item.max_participants || 4,
          joinedCount: item.current_participants || 1,
          creator: {
            name: item.creator_name || 'Member',
            avatar: item.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            badge: 'Active Member'
          },
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
          matchScore: 92,
          description: item.description
        }));
        setActivities(mapped);
      }
    } catch (err) {
      console.warn('Backend activity fetch failed, retaining default activities:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, radiusKm]);

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
            avatar: newAct.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            badge: 'Host'
          },
          imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
          matchScore: 95,
          description: newAct.description
        };
        setActivities(prev => [formatted, ...prev.filter(a => a.id !== formatted.id)]);
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
    try {
      const payload = {
        title: newAct.title,
        category: newAct.category,
        description: newAct.description,
        location_label: newAct.locationName || newAct.location_label || locationName,
        lat: newAct.lat || coordinates.lat,
        lon: newAct.lng || coordinates.lng,
        max_participants: newAct.participantCount || 4,
        time_slot: newAct.time || newAct.time_slot || 'Today',
        creator_name: newAct.creator?.name || 'You',
        creator_avatar: newAct.creator?.avatar
      };

      const res = await axios.post(`${API_BASE}/activities`, payload);
      if (res.data?.data) {
        const created = res.data.data;
        const formatted = {
          ...newAct,
          id: created.id || `act-${Date.now()}`
        };
        setActivities(prev => [formatted, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Backend activity post failed, adding locally:', err.message);
    }

    // Local fallback
    setActivities((prev) => [newAct, ...prev]);
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
      setCoordinates({ lat: loc.lat, lng: loc.lng });
      setLocationName(loc.locationName);
      fetchActivities();
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
    setCoordinates({ lat, lng });
    if (name) setLocationName(name);
    fetchActivities();
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
        refreshActivities: fetchActivities
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
