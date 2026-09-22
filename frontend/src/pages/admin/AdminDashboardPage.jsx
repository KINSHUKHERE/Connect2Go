import React, { useState, useEffect } from 'react';
import { 
  Home,
  Users, 
  Heart, 
  ShieldAlert, 
  ShieldCheck,
  Shield,
  BarChart3, 
  Tag, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Search, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
  Ban,
  UserX,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { io } from 'socket.io-client';
import { supabase, isSupabaseConfigured } from '../../services/supabase.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const VALID_ADMIN_TABS = ['dashboard', 'users', 'matches', 'reports', 'analytics', 'tags', 'settings'];

const getInitialAdminTab = (pathStr) => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = pathStr || window.location.pathname || '';
  // Normalize: remove leading /admin/ or /admin, and trailing slash
  const subPath = path.replace(/^\/admin\/?/, '').replace(/\/+$/, '');
  const pathTab = subPath.split('/')[0]?.toLowerCase();

  if (pathTab && VALID_ADMIN_TABS.includes(pathTab)) {
    return pathTab;
  }

  // Support query param fallback: /admin?tab=users
  try {
    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get('tab')?.toLowerCase();
    if (queryTab && VALID_ADMIN_TABS.includes(queryTab)) {
      return queryTab;
    }
  } catch (e) {}

  // Support localStorage fallback
  try {
    const saved = localStorage.getItem('connect2go_admin_tab')?.toLowerCase();
    if (saved && VALID_ADMIN_TABS.includes(saved)) {
      return saved;
    }
  } catch (e) {}

  return 'dashboard';
};

export function AdminDashboardPage({ currentPath, onNavigate, onBackToUserPanel }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  // Exactly the 7 allowed tabs requested by the user, dynamically synced with URL
  const [currentNav, setCurrentNav] = useState(() => getInitialAdminTab(currentPath));

  const handleNavChange = (tabId) => {
    const targetTab = VALID_ADMIN_TABS.includes(tabId) ? tabId : 'dashboard';
    setCurrentNav(targetTab);
    const targetPath = targetTab === 'dashboard' ? '/admin' : `/admin/${targetTab}`;

    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }

    try {
      localStorage.setItem('connect2go_admin_tab', targetTab);
    } catch (e) {}
  };

  // Sync tab if URL / currentPath changes (e.g. Browser Back/Forward navigation)
  useEffect(() => {
    const tabFromUrl = getInitialAdminTab(currentPath || window.location.pathname);
    if (tabFromUrl && tabFromUrl !== currentNav) {
      setCurrentNav(tabFromUrl);
    }
  }, [currentPath]);

  // Listen to browser popstate for history navigation
  useEffect(() => {
    const handlePopState = () => {
      const tabFromUrl = getInitialAdminTab(window.location.pathname);
      setCurrentNav(tabFromUrl);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize document title with active admin section
  useEffect(() => {
    const titles = {
      dashboard: 'Admin Operations Dashboard — Connect2Go',
      users: 'Admin Users Hub — Connect2Go',
      matches: 'Admin Matches & Handshakes — Connect2Go',
      reports: 'Admin Reports & Safety Queue — Connect2Go',
      analytics: 'Admin Analytics & Insights — Connect2Go',
      tags: 'Admin Activity Tags — Connect2Go',
      settings: 'Admin System Settings — Connect2Go',
    };
    document.title = titles[currentNav] || 'Admin Operations Hub — Connect2Go';
  }, [currentNav]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic States for Admin operations from Supabase DB
  const [usersList, setUsersList] = useState([]);
  const [matchesList, setMatchesList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({ totalUsers: 0, activeActivities: 0, pendingReports: 0, totalMatches: 0 });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Modal inspection states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Resolution editor state for selected report
  const [reportResolutionNote, setReportResolutionNote] = useState('');
  const [reportNewStatus, setReportNewStatus] = useState('Under Investigation');

  // Tag creation form state
  const [newTagName, setNewTagName] = useState('');
  const [newTagIcon, setNewTagIcon] = useState('🎾');
  const [newTagCategory, setNewTagCategory] = useState('Sports');

  // Users filter
  const [userStatusFilter, setUserStatusFilter] = useState('All');
  // Reports filter
  const [reportStatusFilter, setReportStatusFilter] = useState('All');

  // High Speed Single-Trip Data Fetcher for instant Admin Dashboard load
  const fetchAllAdminData = async (showLoading = false) => {
    if (showLoading) setIsLoadingData(true);
    try {
      const res = await fetch(`${API_BASE}/admin/all-data`);
      const data = await res.json();
      if (data?.success) {
        if (Array.isArray(data.users)) setUsersList(data.users);
        if (Array.isArray(data.matches)) setMatchesList(data.matches);
        if (Array.isArray(data.reports)) setReportsList(data.reports);
        if (Array.isArray(data.tags)) setTagsList(data.tags);
        if (Array.isArray(data.activities)) setActivitiesList(data.activities);
        if (data.metrics) setLiveMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Fast Admin fetch error:', e);
    } finally {
      if (showLoading) setIsLoadingData(false);
    }
  };

  // Realtime multi-layer sync: Socket.IO Gateway + Supabase Postgres CDC + Heartbeat
  useEffect(() => {
    // 1. Initial synchronous data load
    fetchAllAdminData(true);

    // 2. Connect to Realtime Socket.IO Gateway
    let socket;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 20,
        reconnectionDelay: 1000
      });

      socket.on('connect', () => {
        setIsLiveConnected(true);
      });

      socket.on('disconnect', () => {
        setIsLiveConnected(false);
      });

      // Realtime: Activity Created
      socket.on('activity_created', (newAct) => {
        toast.info(`⚡ Live: Activity "${newAct.title}" created by ${newAct.creator_name || 'a member'}!`);
        fetchAllAdminData(false);
      });

      // Realtime: Activity Updated / Joined
      socket.on('activity_updated', () => {
        fetchAllAdminData(false);
      });

      // Realtime: Activity Deleted
      socket.on('activity_deleted', () => {
        fetchAllAdminData(false);
      });

      // Realtime: New User Registration
      socket.on('user_created', (newUser) => {
        toast.success(`👤 Live: New member @${newUser.username || newUser.name} registered!`);
        fetchAllAdminData(false);
      });

      // Realtime: User Block / Status Change
      socket.on('user_updated', () => {
        fetchAllAdminData(false);
      });

      // Realtime: User Deleted
      socket.on('user_deleted', () => {
        fetchAllAdminData(false);
      });

      // Realtime: Safety Incident Report Filed
      socket.on('report_created', (newReport) => {
        toast.error(`🚨 Live: Safety report filed against @${newReport.reportedUser || newReport.target}!`);
        fetchAllAdminData(false);
      });

      // Realtime: Safety Report Resolved
      socket.on('report_updated', () => {
        fetchAllAdminData(false);
      });

      // Realtime: Activity Tags CRUD
      socket.on('tag_created', () => {
        fetchAllAdminData(false);
      });

      socket.on('tag_deleted', () => {
        fetchAllAdminData(false);
      });
    } catch (sErr) {
      console.warn('Socket connection notice:', sErr.message);
    }

    // 3. Supabase Realtime Postgres CDC Subscription
    let channel;
    if (isSupabaseConfigured && supabase?.channel) {
      try {
        channel = supabase
          .channel('admin_live_postgres')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            fetchAllAdminData(false);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
            fetchAllAdminData(false);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
            fetchAllAdminData(false);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
            fetchAllAdminData(false);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsLiveConnected(true);
            }
          });
      } catch (err) {
        console.warn('Supabase realtime subscription notice:', err.message);
      }
    }

    // 4. Background Heartbeat Auto-Sync (Every 3.5 seconds)
    const interval = setInterval(() => {
      fetchAllAdminData(false);
    }, 3500);

    return () => {
      socket?.disconnect();
      if (channel && supabase?.removeChannel) supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Nav Items - ONLY the 7 requested sections
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users, badge: usersList.length },
    { id: 'matches', label: 'Matches', icon: Heart, badge: matchesList.length },
    { id: 'reports', label: 'Reports & Safety', icon: ShieldAlert, badge: reportsList.filter(r => (r.status || '').toLowerCase().includes('pending')).length, alertBadge: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tags', label: 'Manage Tags', icon: Tag },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  // User Actions: Block / Unblock (Persisted to Database)
  const handleToggleUserBlock = async (userId) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'Blocked' ? 'Active' : 'Blocked';
    try {
      await fetch(`${API_BASE}/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: nextStatus }));
      }
      toast[nextStatus === 'Blocked' ? 'error' : 'success'](`User ${targetUser.name} is now ${nextStatus} in database.`);
    } catch (e) {
      toast.error('Failed to update user status');
    }
  };

  // User Action: Terminate (Wiped from Supabase DB)
  const handleTerminateUser = async (userId) => {
    const userToTerminate = usersList.find(u => u.id === userId);
    if (!window.confirm(`Are you sure you want to permanently terminate user @${userToTerminate?.username}? This will wipe their profile from Supabase.`)) {
      return;
    }
    try {
      await fetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setSelectedUser(null);
      toast.error(`User @${userToTerminate?.username} has been permanently terminated from database.`);
    } catch (e) {
      toast.error('Failed to terminate user');
    }
  };

  // Report Action: Update Status & Admin Notes (Persisted to Supabase DB)
  const handleUpdateReportStatus = async (reportId, newStatus, note) => {
    try {
      await fetch(`${API_BASE}/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote: note })
      });
      setReportsList(prev => prev.map(rep => {
        if (rep.id === reportId) {
          return {
            ...rep,
            status: newStatus,
            adminNotes: note.trim() || rep.adminNotes,
            updatedAt: new Date().toISOString()
          };
        }
        return rep;
      }));
      toast.success(`Report updated to "${newStatus}". Communication saved to database.`);
      setSelectedReport(null);
    } catch (e) {
      toast.error('Failed to update report');
    }
  };

  // Report Action: 1-Click Block from report
  const handleBlockReportedUser = (targetUserName, reportId) => {
    const matchedUser = usersList.find(u => 
      (u.name || '').toLowerCase() === (targetUserName || '').toLowerCase() || 
      (u.username || '').toLowerCase() === (targetUserName || '').toLowerCase()
    );
    if (matchedUser) {
      handleToggleUserBlock(matchedUser.id);
    }
    handleUpdateReportStatus(
      reportId,
      'Action Taken - User Blocked',
      `Administrative action taken: User @${targetUserName} has been blocked from Connect2Go following investigation.`
    );
  };

  // Report Action: 1-Click Warn from report
  const handleWarnReportedUser = (targetUserName, reportId) => {
    handleUpdateReportStatus(
      reportId,
      'Action Taken - User Warned',
      `Official warning issued to @${targetUserName} regarding platform conduct standards.`
    );
    toast.info(`Official warning sent to ${targetUserName}.`);
  };

  // Tag Action: Add Tag (Persisted to Database)
  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          emoji: newTagIcon.trim() || '🏷️',
          category: newTagCategory
        })
      });
      const data = await res.json();
      if (data.success && data.tag) {
        setTagsList(prev => [{
          id: data.tag.id,
          name: data.tag.name,
          icon: data.tag.emoji,
          category: data.tag.category,
          count: 0,
          active: true
        }, ...prev]);
        setNewTagName('');
        toast.success(`Activity tag "${data.tag.name}" added to database!`);
      }
    } catch (e) {
      toast.error('Failed to save tag to database');
    }
  };

  // Tag Action: Delete Tag (Persisted to Database)
  const handleDeleteTag = async (tagId) => {
    try {
      await fetch(`${API_BASE}/tags/${tagId}`, { method: 'DELETE' });
      setTagsList(prev => prev.filter(t => t.id !== tagId));
      toast.info('Activity tag removed from database.');
    } catch (e) {
      toast.error('Failed to delete tag');
    }
  };

  // Search filter helper
  const q = searchQuery.trim().toLowerCase();

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = !q || (
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q)
    );
    const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMatches = matchesList.filter(m => {
    if (!q) return true;
    return (
      (m.peer1?.name || '').toLowerCase().includes(q) ||
      (m.peer2?.name || '').toLowerCase().includes(q) ||
      (m.activity || '').toLowerCase().includes(q) ||
      (m.id || '').toLowerCase().includes(q)
    );
  });

  const filteredReports = reportsList.filter(r => {
    const matchesSearch = !q || (
      (r.reportedUser || '').toLowerCase().includes(q) ||
      (r.reporterName || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.details || '').toLowerCase().includes(q)
    );
    const matchesStatus = reportStatusFilter === 'All' || r.status === reportStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // DYNAMIC REAL-TIME ANALYTICS CALCULATIONS (Zero Mock Data)
  // ============================================================
  const totalMeetupsCount = activitiesList.length;
  const totalMembersCount = usersList.length;
  const totalMatchesCount = matchesList.length;
  const totalIncidentsCount = reportsList.length;

  // 1. Handshake Success Rate: Mutual identity reveals or active chat handshakes
  const successfulMatchesCount = matchesList.filter(m => 
    m.handshake === 'Revealed' || (m.status || '').toLowerCase().includes('active')
  ).length;
  const handshakeSuccessRate = totalMatchesCount > 0 
    ? `${((successfulMatchesCount / totalMatchesCount) * 100).toFixed(1)}%` 
    : '0.0%';

  // 2. Average Match / Meetup Distance Radius (Hyper-local distance across activities)
  const validDistances = activitiesList
    .map(a => typeof a.distance_km === 'number' ? a.distance_km : parseFloat(a.distance_km))
    .filter(d => !isNaN(d));
  const avgMatchRadius = validDistances.length > 0
    ? `${(validDistances.reduce((acc, d) => acc + d, 0) / validDistances.length).toFixed(1)} km`
    : '0.0 km';

  // 3. Safety Incident Rate: Incidents relative to total interactions
  const totalPlatformInteractions = Math.max(totalMembersCount + totalMeetupsCount + totalMatchesCount, 1);
  const safetyIncidentRate = `${((totalIncidentsCount / totalPlatformInteractions) * 100).toFixed(1)}%`;
  const safeInteractionsPct = `${(100 - parseFloat(safetyIncidentRate)).toFixed(1)}% Safe interactions`;

  // 4. Top Activities by Participation (Dynamically aggregated from activities in DB)
  const categoryMap = {};
  let totalParticipants = 0;
  activitiesList.forEach(act => {
    const cat = act.category || act.title || 'General';
    const parts = act.current_participants || 1;
    categoryMap[cat] = (categoryMap[cat] || 0) + parts;
    totalParticipants += parts;
  });

  const dynamicTopActivities = Object.entries(categoryMap)
    .map(([name, count]) => ({
      name,
      count: `${count} participant${count > 1 ? 's' : ''}`,
      percent: totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0
    }))
    .sort((a, b) => b.percent - a.percent);

  // 5. Peak Meetup Hours Matrix (Dynamically aggregated from activities in DB)
  const timeBuckets = [
    { label: '6:00 AM – 12:00 PM (Morning Meetups)', regex: /am|morning/i },
    { label: '12:00 PM – 5:00 PM (Afternoon Cafes & Study)', regex: /12:|1:|2:|3:|4:.*pm|afternoon/i },
    { label: '5:00 PM – 9:00 PM (Evening Sports & Social)', regex: /5:|6:|7:|8:.*pm|evening/i },
    { label: '9:00 PM – 12:00 AM (Late Night Gaming & Chill)', regex: /9:|10:|11:.*pm|night/i },
  ];

  const dynamicPeakHours = timeBuckets.map(bucket => {
    const matching = activitiesList.filter(a => bucket.regex.test(a.time_slot || a.time || ''));
    const count = matching.length;
    const percent = totalMeetupsCount > 0 ? Math.round((count / totalMeetupsCount) * 100) : 0;
    const statusText = count === 0 ? 'No meetups (0%)' : count >= 3 ? `Peak (${percent}%)` : `Active (${percent}%)`;
    const color = count === 0 ? 'bg-slate-100 text-slate-500' : count >= 3 ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
    return {
      time: bucket.label,
      traffic: statusText,
      color,
      count
    };
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-100 selection:text-brand-900">
      
      {/* Top Admin Header Bar */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          <div 
            onClick={() => handleNavChange('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
            title="Go to Operations Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
              2Go
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-extrabold text-sm text-dark-text tracking-tight">Connect2Go</span>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded ml-1.5">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Global Search inside Admin Header */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users, matches, reports, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-dark-text p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onBackToUserPanel}
            icon={ExternalLink}
            className="text-xs font-bold border-border/80 shadow-2xs"
          >
            <span className="hidden sm:inline">Open User Site</span>
          </Button>

          {/* Admin Avatar Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#E2E8F0]">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20 shadow-2xs"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-dark-text truncate max-w-[120px]">
                {user?.name || 'Kinshuk (Admin)'}
              </div>
              <div className="text-[10px] text-brand-700 font-extrabold flex items-center gap-1">
                <Shield className="w-3 h-3 text-brand-600" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Active Tab Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Admin Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-[#E2E8F0] flex flex-col justify-between py-5 transition-all duration-200 select-none
          ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}>
          <div className="space-y-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                      isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-dark-text'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.alertBadge && item.badge > 0
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {isSidebarCollapsed && item.alertBadge && item.badge > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Logout */}
          <div className="px-3 pt-4 border-t border-[#E2E8F0]">
            <button
              onClick={async () => {
                await logout();
                try {
                  localStorage.removeItem('connect2go_admin_tab');
                } catch (e) {}
                onBackToUserPanel();
              }}
              title={isSidebarCollapsed ? "Logout" : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors ${
                isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
              }`}
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              {!isSidebarCollapsed && <span>Sign Out Admin</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Central Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden overflow-y-auto text-left max-h-[calc(100vh-4rem)]">
          
          {/* Active Search Banner */}
          {searchQuery && (
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 px-3.5 py-2 rounded-2xl text-xs font-semibold text-brand-800">
              <Search className="w-3.5 h-3.5 text-brand-600" />
              <span>Filtering records for query: <strong className="text-dark-text font-bold">"{searchQuery}"</strong></span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-auto text-xs font-bold text-brand-700 hover:underline"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 1: DASHBOARD TAB */}
          {/* ============================================================ */}
          {currentNav === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Operations Dashboard 🚀
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Live system pulse, user activities, and active matching statistics.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>All Systems Operational</span>
                  </span>
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Users */}
                <div 
                  onClick={() => handleNavChange('users')}
                  className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3 cursor-pointer hover:border-brand-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Total Users</span>
                    <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                      {usersList.length}
                    </div>
                    <div className="text-[11px] text-brand-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{usersList.filter(u => u.status === 'Active').length} Active Members</span>
                    </div>
                  </div>
                </div>

                {/* Stored Matches */}
                <div 
                  onClick={() => handleNavChange('matches')}
                  className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3 cursor-pointer hover:border-brand-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Stored Matches</span>
                    <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                      {matchesList.length}
                    </div>
                    <div className="text-[11px] text-pink-600 font-bold flex items-center gap-1 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{matchesList.length > 0 ? `Avg ${(matchesList.reduce((acc, m) => acc + (Number(m.score) || 0), 0) / matchesList.length).toFixed(0)}% affinity match score` : '0 active pairings formed'}</span>
                    </div>
                  </div>
                </div>

                {/* Pending Safety Reports */}
                <div 
                  onClick={() => handleNavChange('reports')}
                  className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3 cursor-pointer hover:border-red-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Reports Queue</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                      {reportsList.filter(r => (r.status || '').toLowerCase().includes('pending')).length}
                    </div>
                    <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{reportsList.length} total incidents logged</span>
                    </div>
                  </div>
                </div>

                {/* Activity Tags Managed */}
                <div 
                  onClick={() => handleNavChange('tags')}
                  className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3 cursor-pointer hover:border-brand-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Active Tags</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                      <Tag className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                      {tagsList.length}
                    </div>
                    <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
                      <span>Available for activity hosting</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Recent Matches & Latest Reports Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Verified Matches */}
                <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-100" />
                        <span>Recent Formed Matches</span>
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavChange('matches')}
                      className="text-xs text-brand-600 font-bold hover:underline"
                    >
                      View All ({matchesList.length}) →
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {matchesList.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No matches formed yet. As members connect, pairings will appear here.
                      </div>
                    ) : (
                      matchesList.slice(0, 4).map(m => (
                        <div key={m.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex -space-x-2">
                              <img src={m.peer1.avatar} alt={m.peer1.name} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" />
                              <img src={m.peer2.avatar} alt={m.peer2.name} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-dark-text truncate">
                                {m.peer1.name} & {m.peer2.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{m.activity} • {m.date}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {m.score}% Match
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Latest Reports Queue */}
                <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>Safety Moderation Queue</span>
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavChange('reports')}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Inspect Queue ({reportsList.length}) →
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {reportsList.length === 0 ? (
                      <div className="py-8 text-center text-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>All clear! No safety incident reports logged.</span>
                      </div>
                    ) : (
                      reportsList.slice(0, 4).map(r => (
                        <div 
                          key={r.id} 
                          onClick={() => {
                            setSelectedReport(r);
                            setReportNewStatus(r.status);
                            setReportResolutionNote(r.adminNotes || '');
                            handleNavChange('reports');
                          }}
                          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-dark-text truncate">
                              Reported: <span className="text-red-600 font-bold">{r.reportedUser}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">By {r.reporterName} • {r.category}</p>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            (r.status || '').includes('Blocked') ? 'bg-purple-100 text-purple-800' :
                            (r.status || '').includes('Warned') ? 'bg-amber-100 text-amber-800' :
                            r.status === 'Resolved - Closed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: USERS TAB (Workable & Realistic) */}
          {/* ============================================================ */}
          {currentNav === 'users' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    User Management & Directory 👥
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Inspect user profiles, monitor safety score, block, suspend, or terminate accounts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-white border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                    Total Registered: <strong className="text-dark-text">{usersList.length}</strong>
                  </span>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Active', 'Suspended', 'Blocked'].map(st => (
                  <button
                    key={st}
                    onClick={() => setUserStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      userStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-border text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-border/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        <th className="py-3.5 px-4">Member</th>
                        <th className="py-3.5 px-4">Contact & City</th>
                        <th className="py-3.5 px-4">Trust Rating</th>
                        <th className="py-3.5 px-4">Meetups / Matches</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Joined</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-border shadow-2xs" />
                                <div>
                                  <div className="font-bold text-dark-text flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.trustScore >= 95 && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="High Trust" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">@{u.username}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="text-dark-text font-semibold">{u.email}</div>
                              <div className="text-[11px] text-slate-400">{u.location}</div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                u.trustScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                u.trustScore >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {u.trustScore}% Score
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-dark-text">{u.activitiesCount} hosted</span>
                              <span className="text-slate-400"> • </span>
                              <span className="text-slate-600">{u.matchesCount} matches</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                u.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {u.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              {u.joined}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUser(u)}
                                  icon={Eye}
                                  className="text-[11px] h-7 px-2"
                                  title="Inspect Profile & Activities"
                                >
                                  Inspect
                                </Button>

                                <button
                                  onClick={() => handleToggleUserBlock(u.id)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    u.status === 'Blocked'
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                      : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                  }`}
                                  title={u.status === 'Blocked' ? "Unblock User" : "Block User"}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleTerminateUser(u.id)}
                                  className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                                  title="Terminate Account"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                            {searchQuery || userStatusFilter !== 'All'
                              ? 'No members found matching your filter criteria.'
                              : 'No registered platform members yet. As new users join Connect2Go, they will appear here.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: MATCHES TAB (Stored Match Persons Data) */}
          {/* ============================================================ */}
          {currentNav === 'matches' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Matched Companions Directory 🤝
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Records of paired members, compatibility scores, activity contexts, and meetup progress.
                  </p>
                </div>

                <span className="text-xs font-bold text-slate-600 bg-white border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  Active Stored Matches: <strong className="text-dark-text">{matchesList.length}</strong>
                </span>
              </div>

              {/* Matches Table */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-border/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        <th className="py-3.5 px-4">Match ID</th>
                        <th className="py-3.5 px-4">Companion 1</th>
                        <th className="py-3.5 px-4">Companion 2</th>
                        <th className="py-3.5 px-4">Activity Category</th>
                        <th className="py-3.5 px-4">Affinity Score</th>
                        <th className="py-3.5 px-4">Handshake Protocol</th>
                        <th className="py-3.5 px-4">Meetup State</th>
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredMatches.length > 0 ? (
                        filteredMatches.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-600">
                            {m.id}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img src={m.peer1.avatar} alt={m.peer1.name} className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <p className="font-bold text-dark-text">{m.peer1.name}</p>
                                <p className="text-[10px] text-slate-400">{m.peer1.location}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img src={m.peer2.avatar} alt={m.peer2.name} className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <p className="font-bold text-dark-text">{m.peer2.name}</p>
                                <p className="text-[10px] text-slate-400">{m.peer2.location}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-dark-text">{m.activity}</span>
                            <p className="text-[10px] text-slate-400">{m.date}</p>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {m.score}%
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.handshake === 'Revealed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {m.handshake === 'Revealed' ? '✓ Revealed' : 'Masked (Dual-Blind)'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              m.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-brand-50 text-brand-800 border border-brand-200'
                            }`}>
                              {m.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMatch(m)}
                              className="text-[11px] h-7 px-2"
                            >
                              Dossier
                            </Button>
                          </td>
                        </tr>
                      ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold text-xs">
                            No matches on record yet. When members connect, verified matches will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: REPORTS & SAFETY TAB (Two-Way Communication & Actions) */}
          {/* ============================================================ */}
          {currentNav === 'reports' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Safety & Incident Moderation 🛡️
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Review user-filed safety reports, update resolution status, and issue warnings or account blocks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                    Pending Action: {reportsList.filter(r => r.status === 'Pending').length}
                  </span>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Pending', 'Under Investigation', 'Action Taken - User Warned', 'Action Taken - User Blocked', 'Resolved - Closed'].map(st => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      reportStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-border text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Reports Table */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-border/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        <th className="py-3.5 px-4">Report ID</th>
                        <th className="py-3.5 px-4">Reported Member</th>
                        <th className="py-3.5 px-4">Filed By</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Description Snippet</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredReports.length > 0 ? (
                        filteredReports.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-600">
                              {r.id}
                            </td>

                            <td className="py-3 px-4 font-bold text-red-600">
                              {r.reportedUser}
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-semibold text-dark-text">{r.reporterName}</p>
                              <p className="text-[10px] text-slate-400">{r.reporterEmail}</p>
                            </td>

                            <td className="py-3 px-4 text-slate-700 font-semibold">
                              {r.category}
                            </td>

                            <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                              "{r.details}"
                            </td>

                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (r.status || '').includes('Blocked') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                (r.status || '').includes('Warned') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                r.status === 'Resolved - Closed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                r.status === 'Under Investigation' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-amber-50 text-amber-800 border border-amber-300 font-extrabold'
                              }`}>
                                {r.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setSelectedReport(r);
                                  setReportNewStatus(r.status);
                                  setReportResolutionNote(r.adminNotes || '');
                                }}
                                className="text-[11px] h-7 px-2.5 font-bold shadow-xs"
                              >
                                Review & Action
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No incident reports found matching this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 5: ANALYTICS TAB */}
          {/* ============================================================ */}
          {currentNav === 'analytics' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Platform Analytics & Growth 📈
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    User engagement metrics, match conversion velocity, and activity popularity.
                  </p>
                </div>
              </div>

              {/* Dynamic Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-border shadow-soft">
                  <p className="text-xs font-bold text-slate-500">Weekly Active Meetups</p>
                  <p className="text-2xl font-extrabold text-dark-text mt-1">{totalMeetupsCount}</p>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" /> 
                    {totalMeetupsCount > 0 ? `+${totalMeetupsCount} live in database` : 'No active meetups yet'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-soft">
                  <p className="text-xs font-bold text-slate-500">Handshake Success Rate</p>
                  <p className="text-2xl font-extrabold text-dark-text mt-1">{handshakeSuccessRate}</p>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-1">
                    {totalMatchesCount > 0 ? `${successfulMatchesCount} of ${totalMatchesCount} reveals active` : '0 mutual pairings formed'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-soft">
                  <p className="text-xs font-bold text-slate-500">Average Match Radius</p>
                  <p className="text-2xl font-extrabold text-dark-text mt-1">{avgMatchRadius}</p>
                  <span className="text-[11px] font-bold text-brand-600 flex items-center gap-1 mt-1">
                    {validDistances.length > 0 ? 'Hyper-local campus range' : 'Awaiting geolocated meetups'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-soft">
                  <p className="text-xs font-bold text-slate-500">Safety Incident Rate</p>
                  <p className="text-2xl font-extrabold text-dark-text mt-1">{safetyIncidentRate}</p>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    {safeInteractionsPct}
                  </span>
                </div>
              </div>

              {/* Activity Popularity Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Activities by Participation */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Top Activities by Participation
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">
                      {dynamicTopActivities.length} {dynamicTopActivities.length === 1 ? 'category' : 'categories'}
                    </span>
                  </div>

                  {dynamicTopActivities.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-1">
                      <p className="text-xs font-bold text-slate-500">No activity data available yet</p>
                      <p className="text-[11px] text-slate-400">
                        As members create activities in Badminton, Running, Study, etc., real-time participation rankings and percentages will appear here dynamically.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {dynamicTopActivities.map(item => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-dark-text">
                            <span>{item.name}</span>
                            <span className="text-slate-500 font-semibold">{item.count} ({item.percent}%)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(item.percent, 6)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Peak Meetup Hours */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Peak Activity Hours Matrix
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">
                      {totalMeetupsCount} total scheduled
                    </span>
                  </div>

                  {totalMeetupsCount === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-1">
                      <p className="text-xs font-bold text-slate-500">No scheduled meetups yet</p>
                      <p className="text-[11px] text-slate-400">
                        Time distribution will populate dynamically based on scheduled member meetup slots.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {dynamicPeakHours.map(slot => (
                        <div key={slot.time} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-dark-text">{slot.time}</span>
                          <span className={`text-xs font-bold border px-2.5 py-0.5 rounded-full ${slot.color}`}>
                            {slot.traffic}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 6: MANAGE TAGS TAB (Admin Activity Tag Creation) */}
          {/* ============================================================ */}
          {currentNav === 'tags' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Manage Activity Categories & Tags 🏷️
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Add, edit, or retire activity names. Added tags instantly appear for users when hosting meetups.
                  </p>
                </div>
              </div>

              {/* Add New Activity Tag Form */}
              <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-soft space-y-4">
                <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-600" />
                  <span>Add New Activity Tag</span>
                </h3>

                <form onSubmit={handleAddTag} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Activity Name</label>
                    <input
                      type="text"
                      required
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g. Table Tennis, Yoga, Pottery"
                      className="w-full h-10 px-3.5 bg-slate-50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Icon Emoji</label>
                    <input
                      type="text"
                      value={newTagIcon}
                      onChange={(e) => setNewTagIcon(e.target.value)}
                      placeholder="🏓"
                      className="w-full h-10 px-3.5 bg-slate-50 border border-border rounded-xl text-xs font-semibold text-center focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Category Pillar</label>
                    <select
                      value={newTagCategory}
                      onChange={(e) => setNewTagCategory(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white"
                    >
                      <option value="Sports">Sports</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Outdoors">Outdoors</option>
                      <option value="Academic">Academic / Study</option>
                      <option value="Social">Social / Food</option>
                      <option value="Leisure">Leisure / Hobbies</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-10 text-xs font-bold shadow-xs"
                      icon={Plus}
                    >
                      Add Tag
                    </Button>
                  </div>
                </form>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {tagsList.map(tag => (
                  <div key={tag.id} className="p-4 bg-white rounded-2xl border border-border shadow-2xs flex items-center justify-between gap-2 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{tag.icon}</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-dark-text truncate">{tag.name}</p>
                        <p className="text-[10px] text-slate-400">{tag.category}</p>
                      </div>
                    </div>

                    {tag.name !== 'Others' && (
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 7: SYSTEM SETTINGS TAB */}
          {/* ============================================================ */}
          {currentNav === 'settings' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Administrator System Settings ⚙️
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Platform controls, credential parameters, and security policies.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Admin Profile Details */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-soft space-y-4">
                  <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-600" />
                    <span>Administrator Profile</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Admin Account</p>
                      <p className="text-xs font-bold text-dark-text mt-0.5">{user?.name || 'Kinshuk Khandelwal'}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Admin Primary Email</p>
                      <p className="text-xs font-bold text-dark-text mt-0.5">herekinshuk@gmail.com</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Security Access Level</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">Root Superuser (Full Platform Authority)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Policy Toggles */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-soft space-y-4">
                  <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-600" />
                    <span>Global Platform Controls</span>
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-border/60 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-dark-text">Mutual Reveal Handshake Enforcement</p>
                        <p className="text-[11px] text-slate-400">Enforce dual-blind identity masking until mutual consent</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600 cursor-pointer" />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-border/60 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-dark-text">Automated Hate-Speech & Spam Filtering</p>
                        <p className="text-[11px] text-slate-400">Automatically flag abusive language in direct chat</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600 cursor-pointer" />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-border/60 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-dark-text">Maintenance Mode (Public Lockout)</p>
                        <p className="text-[11px] text-slate-400">Restrict access to administrators for database updates</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 accent-brand-600 cursor-pointer" />
                    </label>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ============================================================ */}
      {/* USER INSPECTION MODAL */}
      {/* ============================================================ */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Member Dossier: ${selectedUser.name}`}
          subtitle={`Detailed activity and moderation history for @${selectedUser.username}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-5 py-2 text-left">
            {/* Header Card */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-border">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-soft" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-dark-text">{selectedUser.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedUser.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                    selectedUser.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">@{selectedUser.username} • {selectedUser.email}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedUser.location} • Joined {selectedUser.joined}</p>
              </div>
            </div>

            {/* Bio & Interests */}
            <div className="p-3.5 bg-white rounded-xl border border-border/70 space-y-2">
              <p className="text-xs font-bold text-dark-text">Bio</p>
              <p className="text-xs text-slate-600 leading-relaxed">"{selectedUser.bio}"</p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {selectedUser.interests?.map(i => (
                  <span key={i} className="text-[10px] font-bold bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 rounded-md">
                    {i}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Trust Score</p>
                <p className="text-lg font-extrabold text-emerald-600">{selectedUser.trustScore}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Activities Hosted</p>
                <p className="text-lg font-extrabold text-dark-text">{selectedUser.activitiesCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Matches Formed</p>
                <p className="text-lg font-extrabold text-dark-text">{selectedUser.matchesCount}</p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleUserBlock(selectedUser.id)}
                className={`text-xs font-bold ${
                  selectedUser.status === 'Blocked' ? 'text-emerald-700 border-emerald-300' : 'text-amber-700 border-amber-300'
                }`}
              >
                {selectedUser.status === 'Blocked' ? 'Unblock User' : 'Block User'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTerminateUser(selectedUser.id)}
                className="text-xs bg-red-600 hover:bg-red-700 border-red-600 text-white font-bold"
              >
                Terminate Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* REPORT MODERATION & RESOLUTION MODAL */}
      {/* ============================================================ */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Review Safety Incident: ${selectedReport.id}`}
          subtitle={`Report on ${selectedReport.reportedUser} submitted by ${selectedReport.reporterName}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 py-2 text-left">
            
            {/* Incident Summary Card */}
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-red-900">{selectedReport.category}</span>
                <span className="text-[10px] text-red-700 font-medium">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-red-950 font-semibold leading-relaxed">
                "{selectedReport.details}"
              </p>
            </div>

            {/* Optional Screenshot Preview */}
            {selectedReport.screenshot && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span>Attached Screenshot Evidence:</span>
                </p>
                <div className="p-2 bg-slate-50 border border-border rounded-xl">
                  <img src={selectedReport.screenshot} alt="Evidence" className="max-h-48 rounded-lg object-contain mx-auto" />
                </div>
              </div>
            )}

            {/* Action Form */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-text">Update Report Status</label>
                <select
                  value={reportNewStatus}
                  onChange={(e) => setReportNewStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs font-semibold text-dark-text focus:outline-none focus:border-brand-500"
                >
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Action Taken - User Warned">Action Taken - User Warned</option>
                  <option value="Action Taken - User Blocked">Action Taken - User Blocked</option>
                  <option value="Resolved - Closed">Resolved - Closed (No Violation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-text">
                  Admin Resolution Note / Communication to Reporter:
                </label>
                <textarea
                  rows={3}
                  value={reportResolutionNote}
                  onChange={(e) => setReportResolutionNote(e.target.value)}
                  placeholder="e.g. Investigation concluded. The reported user has received a formal warning..."
                  className="w-full p-3 bg-slate-50 border border-border rounded-xl text-xs text-dark-text focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* 1-Click Enforcement Shortcuts */}
            <div className="p-3 bg-slate-50 rounded-xl border border-border flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Quick Enforcement:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleWarnReportedUser(selectedReport.reportedUser, selectedReport.id)}
                  className="text-xs text-amber-700 border-amber-300 font-bold"
                >
                  Warn User
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleBlockReportedUser(selectedReport.reportedUser, selectedReport.id)}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold border-red-600"
                >
                  Block User
                </Button>
              </div>
            </div>

            {/* Submit changes */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateReportStatus(selectedReport.id, reportNewStatus, reportResolutionNote)}
                className="text-xs font-bold shadow-xs"
              >
                Save Resolution
              </Button>
            </div>

          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MATCH DOSSIER MODAL */}
      {/* ============================================================ */}
      {selectedMatch && (
        <Modal
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          title={`Match Dossier: ${selectedMatch.id}`}
          subtitle={`${selectedMatch.peer1.name} & ${selectedMatch.peer2.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 py-2 text-left">
            <div className="flex items-center justify-center gap-4 py-4 bg-slate-50 rounded-2xl border border-border">
              <div className="text-center space-y-1">
                <img src={selectedMatch.peer1.avatar} alt={selectedMatch.peer1.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500 mx-auto" />
                <p className="text-xs font-bold text-dark-text">{selectedMatch.peer1.name}</p>
                <p className="text-[10px] text-slate-400">{selectedMatch.peer1.location}</p>
              </div>

              <div className="text-center px-2">
                <span className="text-sm font-extrabold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  {selectedMatch.score}%
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Affinity</p>
              </div>

              <div className="text-center space-y-1">
                <img src={selectedMatch.peer2.avatar} alt={selectedMatch.peer2.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500 mx-auto" />
                <p className="text-xs font-bold text-dark-text">{selectedMatch.peer2.name}</p>
                <p className="text-[10px] text-slate-400">{selectedMatch.peer2.location}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-border flex justify-between">
                <span className="text-slate-500">Activity Matched:</span>
                <span className="font-bold text-dark-text">{selectedMatch.activity}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border flex justify-between">
                <span className="text-slate-500">Handshake State:</span>
                <span className="font-bold text-emerald-600">{selectedMatch.handshake}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border flex justify-between">
                <span className="text-slate-500">Meetup Status:</span>
                <span className="font-bold text-dark-text">{selectedMatch.status}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border flex justify-between">
                <span className="text-slate-500">Match Timestamp:</span>
                <span className="font-bold text-slate-600">{selectedMatch.date}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMatch(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default AdminDashboardPage;
