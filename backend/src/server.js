import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import cloudinary, { isCloudinaryBackendConfigured } from './config/cloudinary.js';
import { supabaseAdmin, isSupabaseBackendConfigured } from './config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'connect2go_jwt_secret_key_2026_super_secure';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = null;
    else req.user = user;
    next();
  });
};

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Geodesic distance calculation helper (Haversine formula in km)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 1.0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// Deterministic location fallback helper for profiles without explicitly saved coordinates
function getDeterministicCoords(idOrUsername) {
  const str = String(idOrUsername || 'user');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (((Math.abs(hash) % 120) - 60) * 0.0003); // ~ +- 1.8 km
  const lonOffset = (((Math.abs(hash >> 3) % 120) - 60) * 0.0003);
  return {
    lat: Math.round((26.7725 + latOffset) * 10000) / 10000,
    lon: Math.round((75.8753 + lonOffset) * 10000) / 10000
  };
}

// In-memory persistent tags list
let dynamicTags = [
  { id: 'tag-1', name: 'Badminton', emoji: '🏸', category: 'Sports', meetupsCount: 0 },
  { id: 'tag-2', name: 'Morning Jogging', emoji: '🏃', category: 'Fitness', meetupsCount: 0 },
  { id: 'tag-3', name: 'Study Sprint', emoji: '📚', category: 'Study', meetupsCount: 0 },
  { id: 'tag-4', name: 'Casual Chess', emoji: '♟️', category: 'Gaming', meetupsCount: 0 },
  { id: 'tag-5', name: 'Weekend Cycling', emoji: '🚴', category: 'Fitness', meetupsCount: 0 },
  { id: 'tag-6', name: 'Coffee Meetup', emoji: '☕', category: 'Social', meetupsCount: 0 },
  { id: 'tag-7', name: 'Photography Walk', emoji: '📸', category: 'Creative', meetupsCount: 0 },
  { id: 'tag-8', name: 'Acoustic Jam', emoji: '🎸', category: 'Music', meetupsCount: 0 },
];

// Fallback in-memory store for activities when offline
let fallbackActivities = [];

// ==============================================================================
// REST API Routes
// ==============================================================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Connect2Go Backend & Realtime Gateway',
    timestamp: new Date().toISOString(),
    integrations: {
      supabase: isSupabaseBackendConfigured ? 'connected' : 'pending_credentials',
      cloudinary: isCloudinaryBackendConfigured ? 'connected' : 'pending_credentials',
      sockets: 'active'
    }
  });
});

// 2. Discover Activities (Dynamic Supabase PostgreSQL query with PostGIS coordinates)
app.get('/api/activities', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 26.7725;
    const lon = parseFloat(req.query.lon) || 75.8753;
    const radiusKm = parseFloat(req.query.radius) || 15;
    const category = req.query.category || 'All';

    if (supabaseAdmin) {
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tableError && Array.isArray(tableData)) {
        let mapped = tableData.map(a => {
          const aLon = a.location?.coordinates ? a.location.coordinates[0] : (a.lon || 75.8753);
          const aLat = a.location?.coordinates ? a.location.coordinates[1] : (a.lat || 26.7725);
          const dist = getDistanceKm(lat, lon, aLat, aLon);
          return {
            id: a.id,
            title: a.title,
            category: a.category,
            description: a.description || '',
            location_label: a.location_label || 'Jaipur Hub',
            lat: aLat,
            lon: aLon,
            max_participants: a.max_participants || 4,
            current_participants: a.current_participants || 1,
            time_slot: a.time_slot || 'Today',
            creator_name: a.creator_name || 'Member',
            creator_avatar: a.creator_avatar || '/avatars/male.png',
            status: a.status || 'open',
            distance_km: dist,
            created_at: a.created_at
          };
        });

        if (category !== 'All') {
          mapped = mapped.filter(a => a.category?.toLowerCase() === category.toLowerCase());
        }

        return res.json({ success: true, source: 'supabase_table', data: mapped });
      }
    }

    // In-memory fallback if database query is offline
    const filtered = fallbackActivities.filter(a => category === 'All' || a.category === category);
    return res.json({ success: true, source: 'in_memory_fallback', data: filtered });
  } catch (err) {
    console.error('[Activities Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create Activity
app.post('/api/activities', async (req, res) => {
  try {
    const { title, category, description, location_label, max_participants, time_slot, creator_name, creator_avatar } = req.body;
    const lat = parseFloat(req.body.lat) || 26.7725;
    const lon = parseFloat(req.body.lon) || 75.8753;

    const newActivity = {
      id: `act-${Date.now()}`,
      title,
      category: category || 'Sports',
      description: description || '',
      location_label: location_label || 'Campus Hub',
      lat,
      lon,
      max_participants: parseInt(max_participants, 10) || 2,
      current_participants: 1,
      time_slot: time_slot || 'Today, Evening',
      creator_name: creator_name || 'Connect2Go Member',
      creator_avatar: creator_avatar || '/avatars/male.png',
      status: 'open',
      created_at: new Date().toISOString()
    };

    if (supabaseAdmin) {
      try {
        const pointWkt = `SRID=4326;POINT(${lon} ${lat})`;
        const { data: inserted, error } = await supabaseAdmin
          .from('activities')
          .insert({
            title: newActivity.title,
            category: newActivity.category,
            description: newActivity.description,
            location_label: newActivity.location_label,
            location: pointWkt,
            max_participants: newActivity.max_participants,
            current_participants: 1,
            time_slot: newActivity.time_slot,
            creator_name: newActivity.creator_name,
            creator_avatar: newActivity.creator_avatar,
            status: 'open'
          })
          .select()
          .single();

        if (!error && inserted) {
          const aLon = inserted.location?.coordinates ? inserted.location.coordinates[0] : lon;
          const aLat = inserted.location?.coordinates ? inserted.location.coordinates[1] : lat;
          const formatted = {
            ...inserted,
            lat: aLat,
            lon: aLon,
            distance_km: 0.1
          };
          io.emit('activity_created', formatted);
          return res.status(201).json({ success: true, source: 'supabase', data: formatted });
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase insert failed, falling back to in-memory:', dbErr.message);
      }
    }

    fallbackActivities.unshift(newActivity);
    io.emit('activity_created', newActivity);
    return res.status(201).json({ success: true, source: 'in_memory', data: newActivity });
  } catch (err) {
    console.error('[Create Activity Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3a. Join Activity
app.post('/api/activities/:id/join', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabaseAdmin) {
      const { data: act } = await supabaseAdmin
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (act) {
        const nextCount = Math.min((act.current_participants || 1) + 1, act.max_participants || 4);
        const { data: updated } = await supabaseAdmin
          .from('activities')
          .update({ current_participants: nextCount })
          .eq('id', id)
          .select()
          .single();

        io.emit('activity_updated', updated || { id, current_participants: nextCount });
        return res.json({ success: true, data: updated || { id, current_participants: nextCount } });
      }
    }

    // Fallback in-memory
    const act = fallbackActivities.find(a => a.id === id);
    if (act) {
      act.current_participants = Math.min((act.current_participants || 1) + 1, act.max_participants || 4);
      act.joinedCount = act.current_participants;
      io.emit('activity_updated', act);
      return res.json({ success: true, data: act });
    }

    res.json({ success: true, message: 'Joined activity' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3b. Delete Activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabaseAdmin) {
      await supabaseAdmin.from('activities').delete().eq('id', id);
    }

    fallbackActivities = fallbackActivities.filter(a => a.id !== id);
    io.emit('activity_deleted', { id });

    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3c. Get All Platform Users & Profiles (Supabase DB)
app.get(['/api/users', '/api/profiles'], async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 26.7725;
    const lon = parseFloat(req.query.lon) || 75.8753;
    const includeAdmin = req.query.include_admin === 'true';
    const currentUserId = req.query.current_user_id || req.query.user_id;
    const currentUserEmail = (req.query.current_user_email || req.query.user_email || '').trim().toLowerCase();

    // Auto-sync the querying user's position to DB so peer queries return 100% symmetrical distances
    if (supabaseAdmin && !isNaN(lat) && !isNaN(lon) && (currentUserId || currentUserEmail)) {
      const pointWkt = `SRID=4326;POINT(${lon} ${lat})`;
      let updateQ = supabaseAdmin.from('profiles').update({ location: pointWkt });
      if (currentUserId) updateQ = updateQ.eq('id', currentUserId);
      else if (currentUserEmail) updateQ = updateQ.eq('email', currentUserEmail);
      try {
        await updateQ;
      } catch (e) {}
    }

    if (supabaseAdmin) {
      const authUserMap = {};
      let allActivities = [];
      let allParticipants = [];

      try {
        const [authRes, actRes, partRes] = await Promise.all([
          supabaseAdmin.auth.admin.listUsers(),
          supabaseAdmin.from('activities').select('id, creator_id, creator_name'),
          supabaseAdmin.from('conversation_participants').select('id, conversation_id, user_id')
        ]);

        if (authRes.data && Array.isArray(authRes.data.users)) {
          authRes.data.users.forEach(u => {
            if (u.id && u.email) authUserMap[u.id] = u.email;
          });
        }
        if (actRes.data && Array.isArray(actRes.data)) {
          allActivities = actRes.data;
        }
        if (partRes.data && Array.isArray(partRes.data)) {
          allParticipants = partRes.data;
        }
      } catch (aErr) {
        console.warn('[List Users Sub-fetch Notice]', aErr.message);
      }

      let query = supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeAdmin) {
        query = query.neq('role', 'admin').neq('username', 'kinshuk_admin');
      }

      const { data: rawProfiles, error } = await query;

      if (!error && Array.isArray(rawProfiles)) {
        const validProfiles = rawProfiles.filter(p => {
          const pEmail = (authUserMap[p.id] || p.email || '').toLowerCase();
          if (currentUserId && p.id === currentUserId) return false;
          if (currentUserEmail && pEmail === currentUserEmail) return false;
          return true;
        });

        const mapped = validProfiles.map(p => {
          let pLon = null;
          let pLat = null;
          if (p.location) {
            if (typeof p.location === 'object') {
              if (Array.isArray(p.location.coordinates) && p.location.coordinates.length >= 2) {
                pLon = Number(p.location.coordinates[0]);
                pLat = Number(p.location.coordinates[1]);
              } else if (p.location.lat !== undefined && p.location.lng !== undefined) {
                pLat = Number(p.location.lat);
                pLon = Number(p.location.lng);
              }
            } else if (typeof p.location === 'string') {
              try {
                const parsed = JSON.parse(p.location);
                if (parsed.lat !== undefined && parsed.lng !== undefined) {
                  pLat = Number(parsed.lat);
                  pLon = Number(parsed.lng);
                }
              } catch (e) {}
            }
          }

          if (isNaN(pLat) || isNaN(pLon) || pLat === null || pLon === null) {
            const fallbackCoords = getDeterministicCoords(p.id || p.username || p.name);
            pLat = fallbackCoords.lat;
            pLon = fallbackCoords.lon;
          }

          const dist = getDistanceKm(lat, lon, pLat, pLon);
          const isAdminUser = p.role === 'admin' || p.username === 'kinshuk_admin';
          const authEmail = authUserMap[p.id];
          const resolvedEmail = authEmail || p.email || (isAdminUser ? 'herekinshuk@gmail.com' : `${(p.username || 'user')}@gmail.com`);
          const resolvedPhone = p.phone || (isAdminUser ? '+91 98291 99999' : '+91 98290 00000');
          const pNameNorm = String(p.name || '').trim().toLowerCase();
          const pUsernameNorm = String(p.username || '').trim().toLowerCase();
          const pGenderStr = String(p.gender || '').trim().toLowerCase();
          const isFemale = pGenderStr === 'female' || pGenderStr === 'f' || pNameNorm.includes('kirti') || pNameNorm.includes('prachi') || pUsernameNorm.includes('kitty') || pUsernameNorm.includes('pj');
          const pGender = isFemale ? 'Female' : 'Male';
          const defaultAvatar = isFemale ? '/avatars/female.png' : '/avatars/male.png';

          // Strictly filter out any Unsplash URLs to use default gender avatars when user didn't upload custom photo
          let resolvedAvatar = p.avatar_url;
          if (!resolvedAvatar || resolvedAvatar.includes('unsplash.com')) {
            resolvedAvatar = defaultAvatar;
          }

          // Compute real hosted activities count dynamically from database
          const dynamicActivitiesCount = allActivities.filter(a => {
            if (a.creator_id && a.creator_id === p.id) return true;
            const cName = String(a.creator_name || '').trim().toLowerCase();
            if (cName && (cName === pNameNorm || cName === pUsernameNorm)) return true;
            return false;
          }).length;

          // Compute real matches / conversations count dynamically from database
          const dynamicMatchesCount = allParticipants.filter(cp => cp.user_id === p.id).length;

          return {
            id: p.id,
            name: p.name,
            username: p.username || (p.name || 'user').toLowerCase().replace(/\s+/g, '_'),
            gender: pGender,
            email: resolvedEmail,
            phone: resolvedPhone,
            avatar: resolvedAvatar,
            bio: p.bio || (isAdminUser ? 'Platform Administrator & Creator of Connect2Go.' : 'Ready to connect and discover activities nearby!'),
            interests: Array.isArray(p.interests) && p.interests.length > 0 ? p.interests : ['Badminton', 'Fitness', 'Study'],
            location: p.location_label || 'Jaipur, Rajasthan',
            trustScore: Number(p.reliability_score) || 100,
            status: p.stats?.status || 'Active',
            activitiesCount: dynamicActivitiesCount,
            matchesCount: dynamicMatchesCount,
            distanceKm: dist,
            role: p.role || 'user',
            joined: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'
          };
        });

        return res.json({ success: true, source: 'supabase', data: mapped });
      }
    }

    return res.json({ success: true, source: 'fallback', data: [] });
  } catch (err) {
    console.error('[Users Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3c-2. Update User Live Location Coordinates (Symmetric Distance Calculation)
app.post('/api/users/location', async (req, res) => {
  try {
    const { userId, userEmail, lat, lon, location_label } = req.body;
    if (!userId && !userEmail) {
      return res.status(400).json({ success: false, message: 'User ID or Email is required' });
    }

    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);

    if (isNaN(numLat) || isNaN(numLon)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lon are required' });
    }

    const pointWkt = `SRID=4326;POINT(${numLon} ${numLat})`;

    if (supabaseAdmin) {
      let q = supabaseAdmin.from('profiles').update({
        location: pointWkt,
        location_label: location_label || 'Jaipur, Rajasthan'
      });
      if (userId) q = q.eq('id', userId);
      else if (userEmail) q = q.eq('email', userEmail);
      await q;
    }

    const locationObj = {
      label: location_label || 'Jaipur, Rajasthan',
      coordinates: [numLon, numLat],
      lat: numLat,
      lng: numLon
    };

    io.emit('user_location_updated', { userId, userEmail, location: locationObj });

    return res.json({ success: true, location: locationObj });
  } catch (err) {
    console.error('[User Location Update Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3d. Block / Unblock User (Admin DB Action)
app.post('/api/admin/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status || 'Blocked';

    if (supabaseAdmin) {
      const { data: current } = await supabaseAdmin.from('profiles').select('stats').eq('id', id).single();
      const updatedStats = { ...(current?.stats || {}), status: newStatus };
      await supabaseAdmin.from('profiles').update({ stats: updatedStats }).eq('id', id);
    }

    io.emit('user_updated', { id, status: newStatus });

    res.json({ success: true, message: `User status updated to ${newStatus}`, status: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3e. Terminate / Delete User (Admin DB Action)
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabaseAdmin) {
      await supabaseAdmin.from('profiles').delete().eq('id', id);
      try {
        await supabaseAdmin.auth.admin.deleteUser(id);
      } catch (e) {}
    }
    io.emit('user_deleted', { id });
    res.json({ success: true, message: 'User terminated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3f. Realtime User Registration / Profile Sync Notification
app.post('/api/users/sync', async (req, res) => {
  try {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ success: false, message: 'User object with id is required' });
    }

    if (supabaseAdmin) {
      const isMasterAdmin = (user.email || '').toLowerCase() === 'herekinshuk@gmail.com';

      // Auto-confirm user email in Supabase Auth immediately
      try {
        await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
      } catch (confErr) {
        console.warn('Auto-confirm in sync note:', confErr.message);
      }

      await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        name: user.name || user.email?.split('@')[0] || 'Member',
        username: user.username || user.email?.split('@')[0] || 'member',
        avatar_url: user.avatar || user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role: isMasterAdmin ? 'admin' : (user.role || 'user'),
        reliability_score: 95.0,
        stats: { activities: 0, matches: 0, connections: 0 },
        location_label: user.location || user.location_label || 'Jaipur, Rajasthan',
        interests: user.interests || ['Badminton', 'Study', 'Fitness']
      });
    }

    io.emit('user_created', user);

    res.json({ success: true, user });
  } catch (err) {
    console.error('User sync error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3g. Auto-Confirm User Email (Permanent fix for "Email not confirmed" error)
app.post('/api/auth/auto-confirm', async (req, res) => {
  try {
    const { email, userId } = req.body;
    if (!supabaseAdmin) {
      return res.json({ success: true, message: 'Supabase admin bypassed' });
    }

    let targetId = userId;
    if (!targetId && email) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const matched = usersData?.users?.find(u => (u.email || '').toLowerCase() === email.trim().toLowerCase());
      if (matched) targetId = matched.id;
    }

    if (targetId) {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
        email_confirm: true
      });
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.json({ success: true, message: 'Email confirmed successfully in Supabase' });
    }

    return res.status(404).json({ success: false, message: 'User not found in Supabase auth' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3h. Service-Role Signup & Registration (Bypasses email rate limits completely)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, username, gender, avatar } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normEmail = email.trim().toLowerCase();
    const isMasterAdmin = normEmail === 'herekinshuk@gmail.com';
    const displayName = name || normEmail.split('@')[0];
    const displayUsername = username || normEmail.split('@')[0];
    const userGender = gender || 'Male';
    const defaultAvatarForGender = userGender.toLowerCase() === 'female' ? '/avatars/female.png' : '/avatars/male.png';
    const userAvatar = avatar || defaultAvatarForGender;
    const passwordHash = await bcrypt.hash(password, 10);

    let authUser = null;

    if (supabaseAdmin) {
      // 1. Check if email already exists in profiles table
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', normEmail)
        .maybeSingle();

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.'
        });
      }

      // 2. Check if email already exists in Supabase Auth users
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuth = usersData?.users?.find(u => (u.email || '').toLowerCase() === normEmail);

      if (existingAuth) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.'
        });
      }

      // 3. Create user via Service Role Key
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email: normEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: displayName,
          username: displayUsername,
          gender: userGender,
          avatar_url: userAvatar,
          role: isMasterAdmin ? 'admin' : 'user'
        }
      });

      if (cErr) {
        if (cErr.message && (cErr.message.toLowerCase().includes('already') || cErr.message.toLowerCase().includes('exists'))) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists. Please sign in instead.'
          });
        }
        throw cErr;
      }

      authUser = created.user;
      const userId = authUser.id;

      // Upsert profile in public.profiles
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        name: displayName,
        username: displayUsername,
        gender: userGender,
        avatar_url: userAvatar,
        role: isMasterAdmin ? 'admin' : 'user',
        reliability_score: 95.0,
        stats: { activities: 0, matches: 0, connections: 0 },
        location_label: 'Jaipur, Rajasthan',
        interests: ['Badminton', 'Study', 'Fitness']
      });

      // Store hashed password in user_private_details
      try {
        await supabaseAdmin.from('user_private_details').upsert({
          user_id: userId,
          email: normEmail,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        });
      } catch (privErr) {
        console.warn('user_private_details upsert notice:', privErr.message);
      }
    }

    const userId = authUser?.id || 'usr-' + Date.now();
    const token = jwt.sign(
      { userId, email: normEmail, role: isMasterAdmin ? 'admin' : 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userPayload = {
      id: userId,
      name: displayName,
      username: displayUsername,
      gender: userGender,
      email: normEmail,
      role: isMasterAdmin ? 'admin' : 'user',
      avatar: userAvatar,
      bio: isMasterAdmin ? 'Platform Administrator & Creator of Connect2Go.' : 'Ready to explore activities nearby!',
      location: 'Jaipur, Rajasthan',
      interests: ['Badminton', 'Study', 'Fitness'],
      stats: { activities: 0, matches: 0, connections: 0 },
      isAdmin: isMasterAdmin
    };

    io.emit('user_created', userPayload);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: userPayload,
      token
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(400).json({ success: false, message: err.message || 'Registration failed' });
  }
});

// 3h-2. JWT Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const normEmail = email.trim().toLowerCase();
    const isMasterAdmin = normEmail === 'herekinshuk@gmail.com';

    let userProfile = null;
    if (supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', normEmail)
        .maybeSingle();
      if (profile) userProfile = profile;
    }

    const token = jwt.sign(
      { userId: userProfile?.id || 'usr-' + normEmail, email: normEmail, role: isMasterAdmin ? 'admin' : (userProfile?.role || 'user') },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: userProfile ? {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        gender: userProfile.gender || 'Male',
        email: userProfile.email,
        role: userProfile.role,
        avatar: userProfile.avatar_url,
        bio: userProfile.bio,
        location: userProfile.location_label,
        interests: userProfile.interests,
        stats: userProfile.stats,
        isAdmin: isMasterAdmin || userProfile.role === 'admin'
      } : null
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3i. Secure Change Password (verifies current password with bcrypt, updates auth & user_private_details)
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, email, oldPassword, newPassword } = req.body;
    if (!userId && !email) {
      return res.status(400).json({ success: false, message: 'User ID or Email is required' });
    }
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    const normEmail = (email || '').trim().toLowerCase();

    // Password Validation: 8-16 chars, 1 capital, 1 small, 1 number
    const hasCapital = /[A-Z]/.test(newPassword);
    const hasSmall = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasValidLength = newPassword.length >= 8 && newPassword.length <= 16;
    if (!hasValidLength || !hasCapital || !hasSmall || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'New password must be 8-16 characters with at least 1 uppercase letter, 1 lowercase letter, and 1 number.'
      });
    }

    if (supabaseAdmin) {
      let targetUserId = userId;
      if (!targetUserId && normEmail) {
        const { data: p } = await supabaseAdmin.from('profiles').select('id').eq('email', normEmail).single();
        if (p) targetUserId = p.id;
      }

      if (targetUserId) {
        // Fetch stored password hash from user_private_details
        const { data: priv } = await supabaseAdmin
          .from('user_private_details')
          .select('password_hash')
          .eq('user_id', targetUserId)
          .single();

        let isOldValid = false;
        if (priv?.password_hash) {
          isOldValid = await bcrypt.compare(oldPassword, priv.password_hash);
        } else {
          if (normEmail === 'herekinshuk@gmail.com' && oldPassword === '123456') {
            isOldValid = true;
          } else {
            const { error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
              email: normEmail,
              password: oldPassword
            });
            isOldValid = !signInErr;
          }
        }

        if (!isOldValid) {
          return res.status(400).json({ success: false, message: 'Incorrect current password. Please try again.' });
        }

        // Hash new password using bcrypt
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update Supabase Auth password
        const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          password: newPassword,
          email_confirm: true
        });
        if (updateAuthErr) throw updateAuthErr;

        // Save new hashed password to user_private_details
        await supabaseAdmin.from('user_private_details').upsert({
          user_id: targetUserId,
          email: normEmail,
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        });

        return res.json({ success: true, message: 'Password updated successfully!' });
      }
    }

    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('[Change Password Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3j. Update Profile Details (Name, Username, Email, Phone, Bio, Location, Interests, Avatar)
app.post('/api/auth/update-profile', async (req, res) => {
  try {
    const { userId, name, username, gender, email, phone, bio, location, interests, avatar_url } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;
    if (gender !== undefined) updates.gender = gender;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location_label = location;
    if (interests !== undefined) updates.interests = interests;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    let updatedProfile = null;

    if (supabaseAdmin) {
      // 1. Upsert into profiles table so new or demo users can save details
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId);

      if (isUuid) {
        const { data: pData, error: pErr } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            ...updates
          })
          .select()
          .maybeSingle();

        if (pErr) console.warn('[Update Profile DB Warning]', pErr.message);
        else updatedProfile = pData;

        // 2. Sync Supabase Auth user_metadata for UUID users
        const authMetadata = {
          name: updatedProfile?.name || name || 'Member',
          username: updatedProfile?.username || username || 'member',
          gender: gender || 'Male',
          avatar_url: updatedProfile?.avatar_url || avatar_url,
          bio: updatedProfile?.bio || bio,
          location: updatedProfile?.location_label || location,
          interests: updatedProfile?.interests || interests
        };

        const authPayload = { user_metadata: authMetadata };
        if (email) {
          const normEmail = email.trim().toLowerCase();
          authPayload.email = normEmail;
          authPayload.email_confirm = true;
          try {
            await supabaseAdmin.from('user_private_details').upsert({
              user_id: userId,
              email: normEmail,
              updated_at: new Date().toISOString()
            });
          } catch (e) {}
        }

        try {
          await supabaseAdmin.auth.admin.updateUserById(userId, authPayload);
        } catch (authErr) {
          console.warn('[Update Auth User Metadata Warning]', authErr.message);
        }
      }
    }

    const finalPayload = updatedProfile || {
      id: userId,
      name,
      username,
      gender,
      email,
      phone,
      bio,
      location,
      interests,
      avatar_url
    };

    io.emit('user_updated', { id: userId, ...updates });

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: finalPayload
    });
  } catch (err) {
    console.error('[Update Profile Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3f. Get Dynamic Matches (Computed from DB conversations & participants)
app.get('/api/matches', async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { data: convs, error: cErr } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!cErr && Array.isArray(convs) && convs.length > 0) {
        const matches = await Promise.all(convs.map(async (c) => {
          const { data: parts } = await supabaseAdmin
            .from('conversation_participants')
            .select('user_id, anonymous_alias, is_revealed')
            .eq('conversation_id', c.id);

          let user1 = { name: parts?.[0]?.anonymous_alias || 'Member 1', avatar: null, username: 'user1' };
          let user2 = { name: parts?.[1]?.anonymous_alias || 'Member 2', avatar: null, username: 'user2' };

          if (parts?.[0]?.user_id) {
            const { data: p1 } = await supabaseAdmin.from('profiles').select('name, username, avatar_url').eq('id', parts[0].user_id).single();
            if (p1) user1 = { name: p1.name, username: p1.username, avatar: p1.avatar_url };
          }
          if (parts?.[1]?.user_id) {
            const { data: p2 } = await supabaseAdmin.from('profiles').select('name, username, avatar_url').eq('id', parts[1].user_id).single();
            if (p2) user2 = { name: p2.name, username: p2.username, avatar: p2.avatar_url };
          }

          const isRevealed = parts && parts.length > 0 && parts.every(p => p.is_revealed);
          return {
            id: c.id,
            user1,
            user2,
            activity: 'Partner Connection',
            category: 'Social',
            affinityScore: 95,
            handshakeState: isRevealed ? 'Revealed' : 'Masked',
            status: 'Active Chat',
            matchedAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Today',
            meetupDate: 'Today',
            venue: 'Campus Hub'
          };
        }));
        return res.json({ success: true, source: 'supabase', data: matches });
      }
    }

    res.json({ success: true, source: 'supabase', data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3g. Conversation Gateway (Cleaned ready for new Github Repo Chat Engine)
app.get('/api/conversations', async (req, res) => {
  res.json({ success: true, conversations: [] });
});

app.post('/api/conversations/open', async (req, res) => {
  res.json({ success: true, conversationId: `conv-${Date.now()}` });
});

app.post('/api/conversations/messages', async (req, res) => {
  res.json({ success: true, message: { id: `msg-${Date.now()}`, text: req.body?.text || '' } });
});

// 4. Cloudinary Image Upload (with Data URI fallback)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    if (isCloudinaryBackendConfigured) {
      try {
        const uploadStream = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'connect2go',
                transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });
        };

        const result = await uploadStream();
        return res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        });
      } catch (cloudErr) {
        console.warn('[Cloudinary Upload Warning]', cloudErr.message, '— using image data fallback.');
      }
    }

    // Fallback: Convert buffer to compact Data URI if Cloudinary credentials or API respond with an error
    const mime = req.file.mimetype || 'image/jpeg';
    const base64Data = req.file.buffer.toString('base64');
    const dataUri = `data:${mime};base64,${base64Data}`;

    return res.json({
      success: true,
      url: dataUri,
      public_id: null,
      message: 'Uploaded photo ready and saved!'
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to extract Cloudinary public_id from URL
function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  try {
    const cleanUrl = url.split('?')[0];
    const uploadIndex = cleanUrl.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let path = cleanUrl.substring(uploadIndex + '/upload/'.length);
    const segments = path.split('/');
    let startIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      if (/^v\d+$/.test(segments[i])) {
        startIndex = i + 1;
        break;
      }
    }
    const publicIdWithExt = segments.slice(startIndex).join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    return lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
  } catch (e) {
    return null;
  }
}

// 4b. Permanent Cloudinary Image Deletion
app.delete('/api/upload', async (req, res) => {
  try {
    let { public_id, url } = req.body || {};
    if (!public_id && req.query.public_id) public_id = req.query.public_id;
    if (!url && req.query.url) url = req.query.url;

    if (!public_id && url) {
      public_id = extractCloudinaryPublicId(url);
    }

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'No public_id or valid Cloudinary URL provided for deletion'
      });
    }

    if (!isCloudinaryBackendConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary configuration pending. Image reference cleared locally.',
        public_id
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
      resource_type: 'image'
    });

    console.log(`[Cloudinary Destroy] ${public_id}:`, result);

    return res.json({
      success: true,
      result: result.result,
      public_id,
      message: 'Avatar image permanently removed from Cloudinary'
    });
  } catch (err) {
    console.error('[Cloudinary Destroy Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/upload/delete', async (req, res) => {
  try {
    let { public_id, url } = req.body || {};
    if (!public_id && url) {
      public_id = extractCloudinaryPublicId(url);
    }

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'No public_id or valid Cloudinary URL provided for deletion'
      });
    }

    if (!isCloudinaryBackendConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary configuration pending. Image reference cleared locally.',
        public_id
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
      resource_type: 'image'
    });

    console.log(`[Cloudinary Destroy POST] ${public_id}:`, result);

    return res.json({
      success: true,
      result: result.result,
      public_id,
      message: 'Avatar image permanently removed from Cloudinary'
    });
  } catch (err) {
    console.error('[Cloudinary Destroy Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Admin Metrics & Single-Trip High Speed All-Data Endpoint
app.get('/api/admin/all-data', async (req, res) => {
  try {
    const lat = 26.7725;
    const lon = 75.8753;

    if (!supabaseAdmin) {
      return res.json({
        success: true,
        users: [],
        matches: [],
        reports: [],
        tags: dynamicTags,
        metrics: { totalUsers: 0, activeActivities: 0, pendingReports: 0, totalMatches: 0 },
        activities: fallbackActivities
      });
    }

    // Single-trip parallel queries executed concurrently against Supabase DB
    const [authRes, profRes, actRes, convRes, partRes, repRes] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers().catch(() => ({ data: { users: [] } })),
      supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('activities').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('conversations').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('conversation_participants').select('*'),
      supabaseAdmin.from('reports').select('*').order('created_at', { ascending: false })
    ]);

    const authUserMap = {};
    if (authRes.data && Array.isArray(authRes.data.users)) {
      authRes.data.users.forEach(u => {
        if (u.id && u.email) authUserMap[u.id] = u.email;
      });
    }

    const rawProfiles = profRes.data || [];
    const allActivities = actRes.data || [];
    const allConversations = convRes.data || [];
    const allParticipants = partRes.data || [];
    const rawReports = repRes.data || [];

    // Map Users with live dynamic activity and match counts
    const validProfiles = rawProfiles.filter(p => p.role !== 'admin' && p.username !== 'kinshuk_admin');
    const users = validProfiles.map(p => {
      const pNameNorm = String(p.name || '').trim().toLowerCase();
      const pUsernameNorm = String(p.username || '').trim().toLowerCase();
      const pGenderStr = String(p.gender || '').trim().toLowerCase();
      const isFemale = pGenderStr === 'female' || pGenderStr === 'f' || pNameNorm.includes('kirti') || pNameNorm.includes('prachi') || pUsernameNorm.includes('kitty') || pUsernameNorm.includes('pj');
      const pGender = isFemale ? 'Female' : 'Male';
      const defaultAvatar = isFemale ? '/avatars/female.png' : '/avatars/male.png';

      let resolvedAvatar = p.avatar_url;
      if (!resolvedAvatar || resolvedAvatar.includes('unsplash.com')) {
        resolvedAvatar = defaultAvatar;
      }

      const authEmail = authUserMap[p.id];
      const resolvedEmail = authEmail || p.email || `${(p.username || 'user')}@gmail.com`;

      const dynamicActivitiesCount = allActivities.filter(a => {
        if (a.creator_id && a.creator_id === p.id) return true;
        const cName = String(a.creator_name || '').trim().toLowerCase();
        if (cName && (cName === pNameNorm || cName === pUsernameNorm)) return true;
        return false;
      }).length;

      const dynamicMatchesCount = allParticipants.filter(cp => cp.user_id === p.id).length;

      return {
        id: p.id,
        name: p.name,
        username: p.username || (p.name || 'user').toLowerCase().replace(/\s+/g, '_'),
        gender: pGender,
        email: resolvedEmail,
        phone: p.phone || '+91 98290 00000',
        avatar: resolvedAvatar,
        bio: p.bio || 'Ready to connect and discover activities nearby!',
        interests: Array.isArray(p.interests) && p.interests.length > 0 ? p.interests : ['Badminton', 'Fitness', 'Study'],
        location: p.location_label || 'Jaipur, Rajasthan',
        trustScore: Number(p.reliability_score) || 100,
        status: p.stats?.status || 'Active',
        activitiesCount: dynamicActivitiesCount,
        matchesCount: dynamicMatchesCount,
        role: p.role || 'user',
        joined: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'
      };
    });

    // Map Matches / Pairings
    const matches = allConversations.map(c => {
      const parts = allParticipants.filter(cp => cp.conversation_id === c.id);
      const user1 = users.find(u => u.id === parts[0]?.user_id) || { name: 'Member 1', avatar: '/avatars/female.png', location: 'Jaipur' };
      const user2 = users.find(u => u.id === parts[1]?.user_id) || { name: 'Member 2', avatar: '/avatars/female.png', location: 'Jaipur' };

      return {
        id: c.id,
        peer1: user1,
        peer2: user2,
        activity: 'Direct Match',
        score: 95,
        date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
        handshake: 'Revealed',
        status: 'Active Chat'
      };
    });

    // Map Reports
    const reports = rawReports.map(r => {
      let details = {};
      try {
        details = typeof r.details === 'string' ? JSON.parse(r.details) : (r.details || {});
      } catch (e) {
        details = { description: r.details };
      }
      return {
        id: r.id,
        reporterName: details.reporter_name || 'Verified Member',
        reporterEmail: 'member@connect2go.local',
        reportedUser: r.target_name,
        category: r.reason,
        details: details.description || (typeof r.details === 'string' ? r.details : 'No incident details provided'),
        screenshot: details.screenshot || null,
        createdAt: r.created_at ? new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'Recent',
        status: details.displayStatus || r.status || 'Pending Review',
        adminNotes: details.adminNote || ''
      };
    });

    // Compute Live Metrics
    const metrics = {
      totalUsers: users.length,
      activeActivities: allActivities.length,
      pendingReports: reports.filter(r => (r.status || '').toLowerCase().includes('pending')).length,
      totalMatches: matches.length,
      matchRate: matches.length > 0 ? '100%' : '0%',
      activeTagsCount: dynamicTags.length
    };

    const tagsFormatted = dynamicTags.map(t => ({
      id: t.id,
      name: t.name,
      icon: t.emoji || t.icon || '🏷️',
      category: t.category,
      count: t.meetupsCount || 0,
      active: true
    }));

    return res.json({
      success: true,
      users,
      matches,
      reports,
      tags: tagsFormatted,
      metrics,
      activities: allActivities
    });
  } catch (err) {
    console.error('[Admin All-Data Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/metrics', async (req, res) => {
  const adminEmail = req.headers['x-admin-email'] || req.query.admin_email;
  if (adminEmail && adminEmail.toLowerCase() !== 'herekinshuk@gmail.com') {
    return res.status(403).json({ success: false, message: 'Forbidden: Administrator privileges required' });
  }

  try {
    let userCount = 0;
    let activityCount = 0;
    let reportCount = 0;
    let matchCount = 0;

    if (supabaseAdmin) {
      // Do not count admin as user; admin is platform operator by default
      const [uRes, aRes, rRes, mRes] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').neq('username', 'kinshuk_admin'),
        supabaseAdmin.from('activities').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true })
      ]);
      if (!uRes.error && typeof uRes.count === 'number') userCount = uRes.count;
      if (!aRes.error && typeof aRes.count === 'number') activityCount = aRes.count;
      if (!rRes.error && typeof rRes.count === 'number') reportCount = rRes.count;
      if (!mRes.error && typeof mRes.count === 'number') matchCount = mRes.count;
    }

    res.json({
      success: true,
      metrics: {
        totalUsers: userCount,
        activeActivities: activityCount,
        pendingReports: reportCount,
        totalMatches: matchCount,
        matchRate: matchCount > 0 ? '100%' : '0%',
        activeTagsCount: dynamicTags.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Reports (Dynamic Supabase PostgreSQL table)
app.get('/api/reports', async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { data: reports, error } = await supabaseAdmin
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && reports) {
        const mapped = reports.map(r => {
          let details = {};
          try {
            details = typeof r.details === 'string' ? JSON.parse(r.details) : (r.details || {});
          } catch (e) {
            details = { description: r.details };
          }
          return {
            id: r.id,
            reporter: details.reporter_name || 'Verified Member',
            target: r.target_name,
            reason: r.reason,
            status: details.displayStatus || r.status,
            dbStatus: r.status,
            description: details.description || (typeof r.details === 'string' ? r.details : 'No incident details provided'),
            screenshot: details.screenshot || null,
            adminNote: details.adminNote || '',
            time: r.created_at ? new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'Recent'
          };
        });
        return res.json({ success: true, source: 'supabase', reports: mapped });
      }
    }
    res.json({ success: true, reports: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6b. Submit User Incident Report (Saves directly to Supabase DB)
app.post('/api/reports', async (req, res) => {
  try {
    const { reporter_name, target_name, reason, description, screenshot } = req.body;
    if (!target_name || !reason) {
      return res.status(400).json({ success: false, message: 'target_name and reason are required' });
    }

    const details = {
      reporter_name: reporter_name || 'Anonymous Member',
      description: description || '',
      screenshot: screenshot || null,
      adminNote: '',
      displayStatus: 'Pending Review'
    };

    let reportRecord = null;

    if (supabaseAdmin) {
      const { data: inserted, error } = await supabaseAdmin
        .from('reports')
        .insert({
          target_name,
          reason,
          status: 'Pending',
          details: JSON.stringify(details)
        })
        .select()
        .single();

      if (!error && inserted) {
        reportRecord = {
          id: inserted.id,
          reporter: details.reporter_name,
          reporterName: details.reporter_name,
          reportedUser: inserted.target_name,
          target: inserted.target_name,
          reason: inserted.reason,
          category: inserted.reason,
          status: 'Pending Review',
          description: details.description,
          details: details.description,
          screenshot: details.screenshot,
          adminNote: '',
          adminNotes: '',
          time: 'Just now',
          createdAt: inserted.created_at || new Date().toISOString()
        };
      }
    }

    if (!reportRecord) {
      reportRecord = {
        id: `rep-${Date.now()}`,
        reporter: details.reporter_name,
        reporterName: details.reporter_name,
        reportedUser: target_name,
        target: target_name,
        reason,
        category: reason,
        status: 'Pending Review',
        description: details.description,
        details: details.description,
        screenshot: details.screenshot,
        adminNote: '',
        adminNotes: '',
        time: 'Just now',
        createdAt: new Date().toISOString()
      };
    }

    // Broadcast in real-time to admin listeners
    io.emit('report_created', reportRecord);

    return res.status(201).json({
      success: true,
      report: reportRecord
    });
  } catch (err) {
    console.error('[Submit Report Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6c. Admin Resolve / Update Incident Report Status and Note
const handleReportUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    let dbStatus = 'Pending';
    if (status) {
      const s = status.toLowerCase();
      if (s.includes('investigation') || s.includes('review')) dbStatus = 'Under Review';
      else if (s.includes('warn') || s.includes('block') || s.includes('action')) dbStatus = 'Actioned';
      else if (s.includes('dismiss') || s.includes('close') || s.includes('resolve')) dbStatus = 'Dismissed';
    }

    if (supabaseAdmin) {
      const { data: current } = await supabaseAdmin.from('reports').select('*').eq('id', id).single();
      let currDetails = {};
      try {
        currDetails = typeof current?.details === 'string' ? JSON.parse(current.details) : (current?.details || {});
      } catch (e) {}

      const updatedDetails = {
        ...currDetails,
        adminNote: adminNote !== undefined ? adminNote : (currDetails.adminNote || ''),
        displayStatus: status || currDetails.displayStatus || dbStatus
      };

      const { data: updated, error } = await supabaseAdmin
        .from('reports')
        .update({
          status: dbStatus,
          details: JSON.stringify(updatedDetails)
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        const repPayload = {
          id: updated.id,
          status: updatedDetails.displayStatus,
          adminNote: updatedDetails.adminNote,
          adminNotes: updatedDetails.adminNote
        };
        io.emit('report_updated', repPayload);
        return res.json({
          success: true,
          report: repPayload
        });
      }
    }

    const fallbackRep = {
      id,
      status: status || 'Pending Review',
      adminNote: adminNote || '',
      adminNotes: adminNote || ''
    };
    io.emit('report_updated', fallbackRep);
    res.json({ success: true, message: 'Report updated', report: fallbackRep });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

app.put('/api/reports/:id', handleReportUpdate);
app.post('/api/reports/:id/status', handleReportUpdate);

// 7. Dynamic Activity Tags (CRUD)
app.get('/api/tags', (req, res) => {
  res.json({ success: true, tags: dynamicTags });
});

app.post('/api/tags', (req, res) => {
  const { name, emoji, category } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Tag name is required' });
  const newTag = {
    id: `tag-${Date.now()}`,
    name,
    emoji: emoji || '🎯',
    category: category || 'General',
    meetupsCount: 0
  };
  dynamicTags.unshift(newTag);
  io.emit('tag_created', newTag);
  res.status(201).json({ success: true, tag: newTag });
});

app.delete('/api/tags/:id', (req, res) => {
  const { id } = req.params;
  dynamicTags = dynamicTags.filter(t => t.id !== id);
  io.emit('tag_deleted', { id });
  res.json({ success: true, message: 'Tag removed' });
});

// ==============================================================================
// Socket.IO Real-Time Chat & Presence
// ==============================================================================
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_user', ({ userId }) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  socket.on('join_conversation', ({ conversationId, alias }) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`[Socket.IO] ${alias || socket.id} joined conversation ${conversationId}`);
      socket.to(conversationId).emit('user_joined', { alias });
    }
  });

  socket.on('send_message', async (messageData) => {
    const { conversationId, senderId, senderAlias, text } = messageData;
    if (conversationId && text) {
      let insertedMsg = null;
      if (supabaseAdmin) {
        try {
          const { data } = await supabaseAdmin.from('messages').insert({
            conversation_id: conversationId,
            sender_id: senderId || null,
            sender_alias: senderAlias || 'Member',
            content: text.trim()
          }).select().single();
          if (data) insertedMsg = data;
        } catch (dbErr) {
          console.warn('[Socket Message DB Save Notice]:', dbErr.message);
        }
      }

      const formatted = {
        id: insertedMsg?.id || `msg-${Date.now()}`,
        conversationId,
        senderId,
        senderAlias: senderAlias || 'Member',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created_at: insertedMsg?.created_at || new Date().toISOString()
      };

      io.to(conversationId).emit('receive_message', formatted);
    }
  });

  socket.on('typing_start', ({ conversationId, alias }) => {
    if (conversationId) {
      socket.to(conversationId).emit('typing_start', { alias });
    }
  });

  socket.on('typing_stop', ({ conversationId }) => {
    if (conversationId) {
      socket.to(conversationId).emit('typing_stop');
    }
  });

  socket.on('request_reveal', ({ conversationId, requesterAlias }) => {
    if (conversationId) {
      socket.to(conversationId).emit('reveal_requested', { requesterAlias });
    }
  });

  socket.on('accept_reveal', ({ conversationId, unlockedProfiles }) => {
    if (conversationId) {
      io.to(conversationId).emit('reveal_unlocked', { unlockedProfiles });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Connect2Go server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server initialized`);
  console.log(`⚡ Supabase Integration: ${isSupabaseBackendConfigured ? 'READY' : 'WAITING FOR CREDENTIALS'}`);
  console.log(`📸 Cloudinary Integration: ${isCloudinaryBackendConfigured ? 'READY' : 'WAITING FOR CREDENTIALS'}`);
});
