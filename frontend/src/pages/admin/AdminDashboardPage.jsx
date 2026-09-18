import React, { useState, useEffect } from 'react';
import { 
  Home,
  Users, 
  Ticket, 
  Heart, 
  MessageSquare, 
  ShieldAlert, 
  FileCheck, 
  BarChart3, 
  Bell, 
  Tag, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Search, 
  Calendar, 
  Menu, 
  X, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Shield, 
  Check, 
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ComingSoon } from '../../components/ui/ComingSoon.jsx';

export function AdminDashboardPage({ onBackToUserPanel, onComingSoon }) {
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Metrics state
  const [liveMetrics, setLiveMetrics] = useState({
    totalUsers: '12,482',
    activeUsers: '3,945',
    activityRequests: '1,230',
    successfulMatches: '842',
    pendingReports: 12,
    blockedUsers: 3,
    inappropriateContent: 8,
    criticalIssues: 0
  });

  // Attempt to fetch real counts from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.metrics) {
          setLiveMetrics(prev => ({
            ...prev,
            totalUsers: data.metrics.totalUsers ? data.metrics.totalUsers.toLocaleString() : prev.totalUsers,
            activityRequests: data.metrics.activeActivities ? data.metrics.activeActivities.toLocaleString() : prev.activityRequests,
            pendingReports: data.metrics.pendingReports !== undefined ? data.metrics.pendingReports : prev.pendingReports,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activities', label: 'Activity Requests', icon: Ticket },
    { id: 'matches', label: 'Matches', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Safety', icon: ShieldAlert },
    { id: 'moderation', label: 'Content Moderation', icon: FileCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tags', label: 'Manage Tags', icon: Tag },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const recentRequests = [
    { id: 1, name: 'Rohan Sharma', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', activity: 'Badminton', icon: '🏸', location: 'Jaipur, Rajasthan', date: 'Sep 20, 6:00 PM', interested: 4, status: 'Active' },
    { id: 2, name: 'Priya Mehta', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', activity: 'Morning Run', icon: '🏃', location: 'Malviya Nagar', date: 'Sep 21, 7:00 AM', interested: 6, status: 'Active' },
    { id: 3, name: 'Arjun Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', activity: 'Study Group', icon: '📖', location: 'Mansarovar', date: 'Sep 20, 5:00 PM', interested: 3, status: 'Active' },
    { id: 4, name: 'Sneha Kapoor', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', activity: 'Cycling', icon: '🚴', location: 'JLN Marg', date: 'Sep 19, 6:30 AM', interested: 5, status: 'Active' },
    { id: 5, name: 'Karan Singh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', activity: 'Football', icon: '⚽', location: 'Bapu Nagar', date: 'Sep 22, 4:00 PM', interested: 2, status: 'Active' },
  ];

  const recentReports = [
    { id: 1, title: 'Inappropriate message', user: '@anonymous', time: '2 minutes ago', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800' },
    { id: 2, title: 'Fake profile', user: '@user123', time: '15 minutes ago', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800' },
    { id: 3, title: 'Harassment', user: '@user456', time: '1 hour ago', status: 'In Review', statusColor: 'bg-red-100 text-red-700' },
    { id: 4, title: 'Inappropriate content', user: '@user789', time: '3 hours ago', status: 'Resolved', statusColor: 'bg-emerald-100 text-emerald-700' },
    { id: 5, title: 'Spam activity', user: '@user101', time: '5 hours ago', status: 'Resolved', statusColor: 'bg-emerald-100 text-emerald-700' },
  ];

  const topLocations = [
    { name: 'Jaipur', count: '4,120', percent: 85 },
    { name: 'Noida', count: '2,340', percent: 62 },
    { name: 'Delhi', count: '1,980', percent: 48 },
    { name: 'Gurugram', count: '1,450', percent: 35 },
    { name: 'Bangalore', count: '980', percent: 22 },
  ];

  const newUsers = [
    { name: 'Aditi Sharma', location: 'Jaipur, Rajasthan', joined: 'Joined 2 minutes ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Vivek Patel', location: 'Delhi, NCR', joined: 'Joined 15 minutes ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Simran Kaur', location: 'Jaipur, Rajasthan', joined: 'Joined 1 hour ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name: 'Rahul Jain', location: 'Jaipur, Rajasthan', joined: 'Joined 2 hours ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-dark-text font-sans flex flex-col antialiased selection:bg-brand-100 selection:text-brand-900">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8EFF3] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 shadow-2xs">
        
        {/* Left: Brand and Mobile/Desktop Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-dark-muted hover:text-dark-text rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={onBackToUserPanel}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-xs">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-extrabold text-dark-text tracking-tight flex items-center gap-1">
                Connect<span className="text-brand-500">2Go</span>
              </span>
              <span className="text-[9px] font-semibold text-dark-faint -mt-1 hidden sm:inline">
                People Nearby. Activities Together.
              </span>
            </div>
          </div>

          {/* Desktop Collapse / Decollapse Toggle Button (Only ONE, neat & non-intrusive) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 text-slate-400 hover:text-dark-text rounded-lg hover:bg-slate-100 transition-colors ml-1"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar Collapse"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Search & Date Range */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search users, activities, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 shrink-0 cursor-pointer hover:bg-slate-100">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
          </div>
        </div>

        {/* Right: Notification, Admin Profile & Switch to User Panel */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => onComingSoon('Admin Notifications')}
            className="w-9 h-9 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-slate-600 hover:bg-slate-50 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
          </button>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-dark-text">Admin</span>
              <span className="text-[10px] text-slate-400">Super Admin</span>
            </div>
          </div>

          {/* Switch to User Panel */}
          <button
            onClick={onBackToUserPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View User Site</span>
          </button>

        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex-1 flex w-full max-w-[1700px] mx-auto">
        
        {/* Left Fixed / Sticky Sidebar */}
        <aside className={`${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 bg-white border-r border-[#E8EFF3] shrink-0 transition-all duration-300 flex flex-col justify-between px-3 pb-5 z-40 fixed inset-y-0 left-0 pt-20 lg:pt-5 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          
          {/* Primary Navigation items */}
          <div className="space-y-1 overflow-y-auto scrollbar-none flex-1 pr-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentNav(item.id);
                    setMobileMenuOpen(false);
                    if (item.id !== 'dashboard') {
                      onComingSoon(`Admin ${item.label} Module`);
                    }
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
                  } rounded-xl text-xs font-bold transition-all text-left relative group ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-dark-text'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {/* Tooltip in collapsed mode */}
                  {isSidebarCollapsed && (
                    <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Section: Others, View Site, Logout pinned at the bottom */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1 shrink-0">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                Others
              </span>
            )}
            
            <button
              onClick={onBackToUserPanel}
              title={isSidebarCollapsed ? "View Site" : undefined}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-dark-text transition-colors text-left relative group`}
            >
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              {!isSidebarCollapsed && <span>View Site</span>}
              {isSidebarCollapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  View Site
                </span>
              )}
            </button>

            <button
              onClick={onBackToUserPanel}
              title={isSidebarCollapsed ? "Logout" : undefined}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left relative group`}
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
              {isSidebarCollapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Logout
                </span>
              )}
            </button>
          </div>

        </aside>

        {/* Backdrop for mobile */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Center Main Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden text-left">
          
          {/* Greeting Banner */}
          <div className="pb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
              Good evening, Admin 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Here's what's happening on Connect2Go.
            </p>
          </div>

          {/* Row 1: 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Users */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Users</span>
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                  {liveMetrics.totalUsers}
                </div>
                <div className="text-[11px] text-brand-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% from last month</span>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active Users</span>
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                  {liveMetrics.activeUsers}
                </div>
                <div className="text-[11px] text-brand-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+8% from last month</span>
                </div>
              </div>
            </div>

            {/* Activity Requests */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Activity Requests</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                  {liveMetrics.activityRequests}
                </div>
                <div className="text-[11px] text-brand-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+24% from last month</span>
                </div>
              </div>
            </div>

            {/* Successful Matches */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Successful Matches</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                  {liveMetrics.successfulMatches}
                </div>
                <div className="text-[11px] text-brand-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18% from last month</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Charts & Reports Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* User Growth Line Chart */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">User Growth</h3>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Active Users ▾
                </span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="relative pt-2">
                <div className="text-right pb-1">
                  <span className="inline-block text-[10px] bg-dark-text text-white font-bold px-2 py-0.5 rounded-md shadow-xs">
                    3,945 active users • Sep 14
                  </span>
                </div>
                
                <div className="h-44 w-full flex items-end">
                  <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="growthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 130 Q 70 120 120 100 T 200 80 T 280 50 T 360 30 L 360 150 L 10 150 Z"
                      fill="url(#growthGrad)"
                    />
                    <path
                      d="M 10 130 Q 70 120 120 100 T 200 80 T 280 50 T 360 30"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="360" cy="30" r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
                  <span>Aug 20</span>
                  <span>Aug 25</span>
                  <span>Aug 30</span>
                  <span>Sep 4</span>
                  <span>Sep 9</span>
                  <span>Sep 14</span>
                  <span>Sep 17</span>
                </div>
              </div>
            </div>

            {/* Activity Categories Donut Breakdown */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">Activity Categories</h3>
                <span className="text-xs font-semibold text-slate-500">This Month ▾</span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                
                {/* SVG Donut */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
                    {/* Teal slice (Sports 28%) */}
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0D9488" strokeWidth="3.5" strokeDasharray="28 72" strokeDashoffset="0" />
                    {/* Green slice (Fitness 18%) */}
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeDasharray="18 82" strokeDashoffset="-28" />
                    {/* Purple slice (Gaming 12%) */}
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeDasharray="12 88" strokeDashoffset="-46" />
                    {/* Blue slice (Study 10%) */}
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="-58" />
                    {/* Amber slice (Food 8%) */}
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="8 92" strokeDashoffset="-68" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-extrabold text-dark-text leading-tight">1,230</span>
                    <span className="text-[9px] text-slate-400 font-medium">Requests</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-1.5 flex-1 text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>Sports</div>
                    <span className="font-bold text-dark-text">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>Fitness</div>
                    <span className="font-bold text-dark-text">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>Gaming</div>
                    <span className="font-bold text-dark-text">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>Study</div>
                    <span className="font-bold text-dark-text">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>Food</div>
                    <span className="font-bold text-dark-text">8%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Reports & Safety Card */}
            <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">Reports & Safety</h3>
                <button 
                  onClick={() => onComingSoon('Reports & Safety Full View')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-bold text-red-900">{liveMetrics.pendingReports} Pending Reports</div>
                      <div className="text-[10px] text-red-600">Need review</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-amber-900">{liveMetrics.blockedUsers} Blocked Users</div>
                      <div className="text-[10px] text-amber-600">This month</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="font-bold text-orange-900">{liveMetrics.inappropriateContent} Inappropriate Content</div>
                      <div className="text-[10px] text-orange-600">Needs action</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-emerald-900">{liveMetrics.criticalIssues} Critical Issues</div>
                      <div className="text-[10px] text-emerald-600">All clear</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Row 3: Recent Activity Requests & Recent Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Recent Activity Requests Table */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-soft overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">Recent Activity Requests</h3>
                <button
                  onClick={() => onComingSoon('Activity Requests Management')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="p-3.5 w-8">#</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Activity</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Interested</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {recentRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-3.5 font-bold text-slate-400">{r.id}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                            <span className="font-bold text-dark-text">{r.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-dark-text">
                          <span className="mr-1">{r.icon}</span>
                          {r.activity}
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">{r.location}</td>
                        <td className="p-3.5 text-slate-500">{r.date}</td>
                        <td className="p-3.5 font-bold text-dark-text">{r.interested}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button 
                            onClick={() => onComingSoon(`Manage Request #${r.id}`)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Reports List */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-soft overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-dark-text">Recent Reports</h3>
                  <button
                    onClick={() => onComingSoon('Safety Reports Queue')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentReports.map((rep) => (
                    <div key={rep.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 truncate">
                        <div className="font-bold text-dark-text truncate">{rep.title}</div>
                        <div className="text-[11px] text-slate-400">
                          User: <span className="font-semibold text-slate-600">{rep.user}</span> • {rep.time}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${rep.statusColor}`}>
                        {rep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 text-center">
                <button
                  onClick={() => onComingSoon('Content Moderation Tools')}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800"
                >
                  Open Moderation Desk →
                </button>
              </div>
            </div>

          </div>

          {/* Row 4: Top Locations, New Users & System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Top Locations */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">Top Locations</h3>
                <button 
                  onClick={() => onComingSoon('Location Analytics')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {topLocations.map((loc, idx) => (
                  <div key={loc.name} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-dark-text">{idx + 1}. {loc.name}</span>
                      <span className="text-slate-500">{loc.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 rounded-full" 
                        style={{ width: `${loc.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Users */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">New Users</h3>
                <button 
                  onClick={() => onComingSoon('User Directory')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {newUsers.map((u) => (
                  <div key={u.name} className="flex items-center gap-3 text-xs">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="truncate flex-1">
                      <div className="font-bold text-dark-text truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{u.location} • {u.joined}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dark-text">System Overview</h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </div>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-dark-text">API Server</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">99.98%</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-dark-text">Database (Supabase)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">99.95%</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-dark-text">Socket Server</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">99.97%</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-dark-text">Storage / CDN</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">99.99%</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}

export default AdminDashboardPage;
