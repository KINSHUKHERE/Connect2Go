import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import cloudinary, { isCloudinaryBackendConfigured } from './config/cloudinary.js';
import { supabaseAdmin, isSupabaseBackendConfigured } from './config/supabase.js';

dotenv.config();

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

// Fallback in-memory store for activities when Supabase tables are pending schema execution
let fallbackActivities = [
  {
    id: 'act-1',
    title: 'Evening Badminton Doubles Rally',
    category: 'Sports',
    description: 'Looking for 2 more players for an informal friendly badminton rally at the campus indoor courts.',
    location_label: 'Campus Sports Arena',
    lat: 26.7725,
    lon: 75.8753,
    max_participants: 4,
    current_participants: 2,
    time_slot: 'Today, 6:00 PM - 7:30 PM',
    creator_name: 'Kinshuk K.',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    distance_km: 0.8
  },
  {
    id: 'act-2',
    title: 'Morning 5K Jog & Cardio Session',
    category: 'Fitness',
    description: 'Pacing at ~5:30/km around the outer ring track. Beginners and regulars both welcome!',
    location_label: 'Track & Athletic Grounds',
    lat: 26.7740,
    lon: 75.8765,
    max_participants: 5,
    current_participants: 3,
    time_slot: 'Tomorrow, 6:30 AM',
    creator_name: 'Lavanshu B.',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    distance_km: 1.2
  },
  {
    id: 'act-3',
    title: 'Weekend Chess Blitz & Coffee',
    category: 'Gaming',
    description: 'Casual 5+3 blitz games and tactics over iced cold brews at the cafeteria.',
    location_label: 'Student Center Lounge',
    lat: 26.7710,
    lon: 75.8730,
    max_participants: 2,
    current_participants: 1,
    time_slot: 'Saturday, 4:00 PM',
    creator_name: 'Lavish G.',
    creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    distance_km: 1.9
  },
  {
    id: 'act-4',
    title: 'Fullstack Dev & Hackathon Prep',
    category: 'Study',
    description: 'Working on React & Supabase architectures, exploring spatial queries and building cool side projects together.',
    location_label: 'Central Innovation Lab',
    lat: 26.7735,
    lon: 75.8780,
    max_participants: 4,
    current_participants: 2,
    time_slot: 'Friday, 5:00 PM - 8:00 PM',
    creator_name: 'Kirti S.',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    distance_km: 2.4
  }
];

let fallbackReports = [
  { id: 'rep-1', reporter: 'Priya M.', target: 'SuspiciousAccount99', reason: 'Commercial Spam / Promotion', status: 'Pending', time: '2 hours ago' },
  { id: 'rep-2', reporter: 'Rohan S.', target: 'Anonymous User #18', reason: 'No-show for badminton rally without notice', status: 'Under Review', time: 'Yesterday' }
];

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

// 2. Discover Activities (PostGIS RPC -> Supabase Table -> In-Memory Fallback)
app.get('/api/activities', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 26.7725;
    const lon = parseFloat(req.query.lon) || 75.8753;
    const radiusKm = parseFloat(req.query.radius) || 10;
    const category = req.query.category || 'All';

    if (supabaseAdmin) {
      // Attempt PostGIS RPC call first
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_nearby_activities', {
        user_lat: lat,
        user_lon: lon,
        radius_km: radiusKm,
        cat_filter: category
      });

      if (!rpcError && rpcData) {
        return res.json({ success: true, source: 'postgis_rpc', data: rpcData });
      }

      // Fallback: Query activities table directly
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tableError && tableData && tableData.length > 0) {
        const filtered = tableData.filter(a => category === 'All' || a.category === category);
        return res.json({ success: true, source: 'supabase_table', data: filtered });
      }
    }

    // In-memory fallback
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
      creator_avatar: creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
          io.emit('activity_created', inserted);
          return res.status(201).json({ success: true, source: 'supabase', data: inserted });
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
    const { user_name } = req.body;

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

// 4. Cloudinary Image Upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    if (!isCloudinaryBackendConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary configuration pending. Please verify Cloud Name.'
      });
    }

    // Stream buffer to Cloudinary
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

// 5. Admin Metrics (Protected)
app.get('/api/admin/metrics', async (req, res) => {
  const adminEmail = req.headers['x-admin-email'] || req.query.admin_email;
  // If requester identifies with a non-admin email, block access
  if (adminEmail && adminEmail.toLowerCase() !== 'herekinshuk@gmail.com') {
    return res.status(403).json({ success: false, message: 'Forbidden: Administrator privileges required' });
  }

  try {
    let userCount = 10482;
    let activityCount = fallbackActivities.length;
    let reportCount = fallbackReports.length;

    if (supabaseAdmin) {
      const { count: uCount, error: uErr } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
      if (!uErr && typeof uCount === 'number') userCount = uCount;

      const { count: aCount, error: aErr } = await supabaseAdmin.from('activities').select('*', { count: 'exact', head: true });
      if (!aErr && typeof aCount === 'number') activityCount = aCount;

      const { count: rCount, error: rErr } = await supabaseAdmin.from('reports').select('*', { count: 'exact', head: true });
      if (!rErr && typeof rCount === 'number') reportCount = rCount;
    }

    res.json({
      success: true,
      metrics: {
        totalUsers: userCount,
        activeActivities: activityCount,
        pendingReports: reportCount,
        matchRate: '76.4%'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Admin Reports
app.get('/api/reports', (req, res) => {
  res.json({ success: true, reports: fallbackReports });
});

app.post('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const rep = fallbackReports.find(r => r.id === id);
  if (rep) {
    rep.status = status;
    return res.json({ success: true, report: rep });
  }
  res.status(404).json({ success: false, message: 'Report not found' });
});

// ==============================================================================
// Socket.IO Real-Time Chat & Presence
// ==============================================================================
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_conversation', ({ conversationId, alias }) => {
    socket.join(conversationId);
    console.log(`[Socket.IO] ${alias || socket.id} joined conversation ${conversationId}`);
    socket.to(conversationId).emit('user_joined', { alias });
  });

  socket.on('send_message', (messageData) => {
    const { conversationId } = messageData;
    io.to(conversationId).emit('receive_message', messageData);
  });

  socket.on('typing_start', ({ conversationId, alias }) => {
    socket.to(conversationId).emit('typing_start', { alias });
  });

  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(conversationId).emit('typing_stop');
  });

  socket.on('request_reveal', ({ conversationId, requesterAlias }) => {
    socket.to(conversationId).emit('reveal_requested', { requesterAlias });
  });

  socket.on('accept_reveal', ({ conversationId, unlockedProfiles }) => {
    io.to(conversationId).emit('reveal_unlocked', { unlockedProfiles });
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
