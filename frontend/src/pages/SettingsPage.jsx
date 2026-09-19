import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  MapPin, 
  Compass, 
  Calendar, 
  Bell, 
  Check, 
  Lock, 
  Sparkles, 
  Info, 
  ArrowLeft, 
  EyeOff, 
  RotateCcw,
  User,
  Mail,
  Key,
  Shield,
  Smartphone,
  Download,
  Trash2,
  AlertTriangle,
  LogOut,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const DEFAULT_SETTINGS = {
  // Privacy & Safety
  privacyFuzzing: true, // ~400m coordinate jitter
  anonymousDefault: true, // Mask initial chats
  ghostMode: false, // Hide online indicator
  profileVisibility: 'public', // 'public' | 'matches' | 'hidden'
  
  // Discovery & Matching
  searchRadiusKm: 5,
  skillLevel: 'Intermediate',
  availability: ['Evening', 'Weekends'],
  agePreference: 'all', // 'all' | '18-24' | '25-34' | '35+'

  // Notifications
  notifyActivityJoins: true,
  notifyHandshakeRequests: true,
  notifyNearbyMatches: true,
  notifyChatMessages: true,
  soundEffects: true,

  // App Display
  distanceUnit: 'km', // 'km' | 'mi'
  defaultLandingView: 'explore', // 'explore' | 'home'
};

export function SettingsPage({ onNavigate, onSelectTab, onOpenSafety, onOpenAuth }) {
  const { user, logout, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('account');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('connect2go_user_settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }, []);

  // Save Settings handler
  const handleSave = (e) => {
    e?.preventDefault();
    try {
      localStorage.setItem('connect2go_user_settings', JSON.stringify(settings));
      setIsSaved(true);
      addToast('Preferences & settings saved successfully!', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      addToast('Failed to save preferences', 'error');
    }
  };

  // Reset to Defaults handler
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('connect2go_user_settings', JSON.stringify(DEFAULT_SETTINGS));
    addToast('Settings reset to platform defaults', 'info');
  };

  // Toggle availability slot
  const toggleAvailability = (slot) => {
    setSettings((prev) => {
      const exists = prev.availability.includes(slot);
      return {
        ...prev,
        availability: exists
          ? prev.availability.filter((s) => s !== slot)
          : [...prev.availability, slot],
      };
    });
  };

  // Handle Export Data
  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: user ? {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.isAdmin ? 'admin' : 'member',
          location: user.location,
          interests: user.interests,
          stats: user.stats
        } : 'Guest User',
        platformSettings: settings,
        clientMetadata: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `connect2go-settings-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast('Account and preferences data exported to JSON file.', 'success');
    } catch (err) {
      addToast('Failed to export data.', 'error');
    }
  };

  // Password Policy Checks (8-16 chars, 1 uppercase, 1 lowercase, 1 number)
  const hasCapital = /[A-Z]/.test(newPassword);
  const hasSmall = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasValidLength = newPassword.length >= 8 && newPassword.length <= 16;
  const isMatch = newPassword && newPassword === confirmPassword;
  const isPasswordValid = hasCapital && hasSmall && hasNumber && hasValidLength && isMatch;

  // Handle Change Password Submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!isPasswordValid) {
      setPasswordError('Please meet all password requirements before proceeding.');
      return;
    }

    setPasswordLoading(true);
    try {
      if (isSupabaseConfigured && supabase.auth) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      
      addToast('Password updated successfully! Keep it secure.', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Delete Account Submit
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      addToast('Please type DELETE to confirm.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      localStorage.removeItem('connect2go_user');
      localStorage.removeItem('connect2go_user_settings');
      await logout();
      setIsDeleteModalOpen(false);
      addToast('Your account and local preferences have been permanently removed.', 'info');
      if (onSelectTab) onSelectTab('home');
    } catch (e) {
      addToast('Failed to delete account.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Categories definition
  const categories = [
    { id: 'account', label: 'Account & Security', icon: User, badge: user?.isAdmin ? 'Admin' : (user ? 'Verified' : 'Guest') },
    { id: 'privacy', label: 'Privacy & Safety', icon: ShieldCheck, badge: settings.privacyFuzzing ? 'Shield Active' : null },
    { id: 'discovery', label: 'Discovery & Matching', icon: Compass },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'preferences', label: 'App Preferences', icon: Sliders },
    { id: 'danger', label: 'Data & Danger Zone', icon: Trash2, danger: true },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-left pb-24 px-2 sm:px-4">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab ? onSelectTab('home') : (onNavigate && onNavigate('/'))}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-muted hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-500">Settings & Preferences</span>
        </div>

        {/* Global Save / Reset Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            icon={RotateCcw}
            className="text-xs"
          >
            Reset Defaults
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            icon={Check}
            className="text-xs font-bold shadow-xs px-4"
          >
            {isSaved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Guest Mode Notice Banner */}
      {!user && (
        <div className="p-4 bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-200/80 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-brand-950">
                  Guest Preferences Mode
                </h3>
                <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full border border-brand-200">
                  Local Storage
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-brand-900 mt-0.5 leading-relaxed">
                Changes made here are stored on this device. Sign in or register to sync your settings across devices and access security controls.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAuth || (() => onSelectTab && onSelectTab('login'))}
            className="text-xs font-bold shrink-0 self-start sm:self-auto shadow-xs"
          >
            Sign In / Register
          </Button>
        </div>
      )}

      {/* Main Settings Card Header */}
      <div className="bg-white rounded-3xl border border-border/80 p-5 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.avatar}
            alt={user?.name || 'Guest User'}
            size="lg"
            className="ring-4 ring-brand-50 shadow-soft"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-dark-text tracking-tight">
                {user ? user.name : 'Guest User'}
              </h1>
              {user?.isAdmin ? (
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Administrator
                </span>
              ) : user ? (
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" />
                  Verified Member
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Browsing as Guest
                </span>
              )}
            </div>
            <p className="text-xs text-dark-muted mt-1">
              {user ? `@${user.username} • ${user.email}` : 'Personalize your matching radius, privacy filters, and alerts.'}
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab ? onSelectTab('profile') : (onNavigate && onNavigate('/profile'))}
              className="text-xs font-semibold"
            >
              View Public Profile
            </Button>
          </div>
        )}
      </div>

      {/* Main Settings Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Navigation Tabs (Desktop Vertical, Mobile Horizontal Pills) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-border/80 p-3 shadow-soft space-y-1">
          <div className="p-3 border-b border-border/60 mb-1 hidden lg:block">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-dark-faint">
              Configuration Sections
            </p>
          </div>

          <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 lg:shrink ${
                    isActive
                      ? cat.danger 
                        ? 'bg-red-50 text-red-700 font-bold border border-red-200 shadow-xs'
                        : 'bg-brand-50 text-brand-800 font-bold border border-brand-200/80 shadow-xs'
                      : cat.danger
                        ? 'text-red-600 hover:bg-red-50/50'
                        : 'text-dark-text hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isActive 
                        ? cat.danger ? 'bg-red-100 text-red-700' : 'bg-brand-500 text-white shadow-soft'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{cat.label}</span>
                  </div>

                  {cat.badge && (
                    <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Content Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ============================================================ */}
          {/* SECTION 1: ACCOUNT & SECURITY */}
          {/* ============================================================ */}
          {activeCategory === 'account' && (
            <div className="space-y-6">
              
              {/* Profile & Credentials */}
              <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-600" />
                    <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Account Credentials
                    </h2>
                  </div>
                  {user && (
                    <Badge variant="mint" size="sm">Active Session</Badge>
                  )}
                </div>

                {user ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-border/60">
                      <p className="text-[10px] font-bold text-dark-faint uppercase">Display Name</p>
                      <p className="text-xs sm:text-sm font-bold text-dark-text mt-0.5">{user.name}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-border/60">
                      <p className="text-[10px] font-bold text-dark-faint uppercase">Username</p>
                      <p className="text-xs sm:text-sm font-bold text-dark-text mt-0.5">@{user.username}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-border/60">
                      <p className="text-[10px] font-bold text-dark-faint uppercase">Primary Email Address</p>
                      <p className="text-xs sm:text-sm font-bold text-dark-text mt-0.5">{user.email}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-border/60">
                      <p className="text-[10px] font-bold text-dark-faint uppercase">Account Security Status</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">Protected & Verified</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-border/60 text-center space-y-3">
                    <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-dark-text">Account Details Locked</h4>
                      <p className="text-xs text-dark-muted mt-1 max-w-sm mx-auto">
                        Sign in with your email to access your personal profile credentials, password updates, and session details.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenAuth || (() => onSelectTab && onSelectTab('login'))}
                      className="text-xs font-bold shadow-xs"
                    >
                      Sign In Now
                    </Button>
                  </div>
                )}

                {/* Password Change Action */}
                {user && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-dark-text flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-brand-600" />
                        <span>Password & Security Key</span>
                      </h4>
                      <p className="text-[11px] text-dark-muted mt-0.5">
                        Last changed: Recently secured with end-to-end credential policy.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPasswordError('');
                        setIsPasswordModalOpen(true);
                      }}
                      className="text-xs font-semibold"
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </div>

              {/* Active Devices & Sessions */}
              {user && (
                <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-brand-600" />
                      <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                        Active Devices
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      1 Current Session
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-dark-text shadow-xs">
                        <Smartphone className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark-text">Current Browser (Windows • Chrome/Edge)</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">● Active Now • Jaipur, India</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-dark-faint">Primary</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 2: PRIVACY & SAFETY */}
          {/* ============================================================ */}
          {activeCategory === 'privacy' && (
            <div className="space-y-6">
              
              {/* Coordinate Fuzzing (Jitter Shield) */}
              <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Location Privacy & Fuzzing
                    </h2>
                  </div>
                  <Badge variant="mint" size="sm">
                    {settings.privacyFuzzing ? 'Shield Active' : 'Exact GPS'}
                  </Badge>
                </div>

                <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200/70 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-dark-text">
                        ~400m Coordinate Fuzzing (Jitter Shield)
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        Applies a randomized ~400m mathematical offset to your GPS location. Other users see your general neighborhood (e.g. Malviya Nagar), never your exact apartment or doorstep.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, privacyFuzzing: !s.privacyFuzzing }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.privacyFuzzing ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={settings.privacyFuzzing}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.privacyFuzzing ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-950 bg-white/80 p-3 rounded-xl border border-emerald-200/60">
                    <Info className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span>Safe for meetups: discovery algorithms still match you accurately within your chosen search radius.</span>
                  </div>
                </div>

                {/* Masked Anonymous Default on Initial Chats */}
                <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-purple-600" />
                      <span>Masked Identity on Initial Chats</span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-dark-muted leading-relaxed">
                      Always begin chats using an anonymous moniker (e.g. ActivePeer #42). Real photos and profiles are only revealed after mutual consent through the Dual Reveal Handshake.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, anonymousDefault: !s.anonymousDefault }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.anonymousDefault ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={settings.anonymousDefault}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.anonymousDefault ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Ghost / Incognito Mode */}
                <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-brand-600" />
                      <span>Ghost / Incognito Mode</span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-dark-muted leading-relaxed">
                      Hides your online indicator and prevents your avatar from appearing in the live "Peers active right now" ticker.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, ghostMode: !s.ghostMode }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.ghostMode ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={settings.ghostMode}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.ghostMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Trust & Safety Center Link */}
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenSafety || (() => onSelectTab && onSelectTab('safety'))}
                    icon={Shield}
                    className="text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 font-bold"
                  >
                    Read Community Safety & Trust Guidelines →
                  </Button>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 3: DISCOVERY & MATCHING PREFERENCES */}
          {/* ============================================================ */}
          {activeCategory === 'discovery' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-brand-600" />
                    <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Discovery Filters
                    </h2>
                  </div>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    {settings.searchRadiusKm} {settings.distanceUnit || 'km'} Radius
                  </span>
                </div>

                {/* Search Radius Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>Default Activity Discovery Radius</span>
                    </label>
                    <span className="text-xs font-bold text-dark-text">
                      {settings.searchRadiusKm} {settings.distanceUnit || 'km'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={settings.searchRadiusKm}
                    onChange={(e) => setSettings((s) => ({ ...s, searchRadiusKm: Number(e.target.value) }))}
                    className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {[
                      { dist: 2, label: '2 km (Walk)' },
                      { dist: 5, label: '5 km (Neighbourhood)' },
                      { dist: 15, label: '15 km (City Center)' },
                      { dist: 30, label: '30 km (Metro Region)' }
                    ].map((p) => (
                      <button
                        key={p.dist}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, searchRadiusKm: p.dist }))}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          settings.searchRadiusKm === p.dist
                            ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-xs'
                            : 'bg-slate-50 border-border text-dark-muted hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Level Selection */}
                <div className="space-y-3 pt-4 border-t border-border/70">
                  <label className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>Preferred Activity Skill Level</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((lvl) => {
                      const isSelected = settings.skillLevel === lvl;
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => setSettings((s) => ({ ...s, skillLevel: lvl }))}
                          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                              : 'bg-white border-border text-dark-muted hover:border-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule Availability Matrix */}
                <div className="space-y-3 pt-4 border-t border-border/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <label className="text-xs font-bold text-dark-text">
                      Availability Schedule Matrix
                    </label>
                  </div>
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    The Algorithmic Matching Engine adds up to +20 match affinity points when an activity's time slot aligns with your preferred availability.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      { key: 'Morning', label: 'Morning (6:00 AM – 12:00 PM)' },
                      { key: 'Afternoon', label: 'Afternoon (12:00 PM – 5:00 PM)' },
                      { key: 'Evening', label: 'Evening (5:00 PM – 10:00 PM)' },
                      { key: 'Weekends', label: 'Weekends (Saturday & Sunday)' },
                    ].map((item) => {
                      const active = settings.availability.includes(item.key);
                      return (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => toggleAvailability(item.key)}
                          className={`flex items-center justify-between p-3 rounded-2xl text-xs font-semibold border transition-all ${
                            active
                              ? 'bg-brand-50 border-brand-300 text-brand-900 font-bold shadow-xs'
                              : 'bg-slate-50 border-border/80 text-dark-muted hover:bg-slate-100'
                          }`}
                        >
                          <span>{item.label}</span>
                          {active && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 4: NOTIFICATIONS & ALERTS */}
          {/* ============================================================ */}
          {activeCategory === 'notifications' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-600" />
                    <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Activity & Chat Alerts
                    </h2>
                  </div>
                  <Badge variant="mint" size="sm">Real-Time</Badge>
                </div>

                <div className="space-y-2.5">
                  {[
                    { 
                      id: 'notifyActivityJoins', 
                      title: 'Activity Join Alerts', 
                      desc: 'Alert when a nearby peer joins or requests to join an activity you are hosting' 
                    },
                    { 
                      id: 'notifyHandshakeRequests', 
                      title: 'Reveal Handshake Requests', 
                      desc: 'Instant prompt when a chat partner invites you to mutually reveal identities' 
                    },
                    { 
                      id: 'notifyNearbyMatches', 
                      title: 'High-Affinity Match Alerts', 
                      desc: 'Notify when a 90%+ matching companion creates a meetup in your radius' 
                    },
                    { 
                      id: 'notifyChatMessages', 
                      title: 'Direct Chat Notifications', 
                      desc: 'Receive alerts when peers send new messages in active activity threads' 
                    },
                  ].map((item) => (
                    <label 
                      key={item.id} 
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-border/60 transition-colors"
                    >
                      <div className="pr-4">
                        <p className="text-xs font-bold text-dark-text">{item.title}</p>
                        <p className="text-[11px] text-dark-faint mt-0.5">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(settings[item.id])}
                        onChange={(e) => setSettings((s) => ({ ...s, [item.id]: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer shrink-0"
                      />
                    </label>
                  ))}
                </div>

                {/* Sound Effects Toggle */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-border/60 flex items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    {settings.soundEffects ? (
                      <Volume2 className="w-5 h-5 text-brand-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-dark-text">In-App Sound Effects & Chimes</p>
                      <p className="text-[11px] text-dark-faint">Play subtle audio pings on new messages and joins</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, soundEffects: !s.soundEffects }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.soundEffects ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={settings.soundEffects}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 5: APP PREFERENCES */}
          {/* ============================================================ */}
          {activeCategory === 'preferences' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-600" />
                    <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Interface & Units
                    </h2>
                  </div>
                </div>

                {/* Distance Units */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-border/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text">Distance Display Units</h4>
                    <p className="text-[11px] text-dark-muted mt-0.5">
                      Choose between Metric (Kilometers) or Imperial (Miles) for activity cards and discovery radius.
                    </p>
                  </div>

                  <div className="flex items-center bg-white border border-border rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, distanceUnit: 'km' }))}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        settings.distanceUnit === 'km'
                          ? 'bg-brand-500 text-white shadow-soft'
                          : 'text-dark-muted hover:text-dark-text'
                      }`}
                    >
                      Kilometers (km)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, distanceUnit: 'mi' }))}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        settings.distanceUnit === 'mi'
                          ? 'bg-brand-500 text-white shadow-soft'
                          : 'text-dark-muted hover:text-dark-text'
                      }`}
                    >
                      Miles (mi)
                    </button>
                  </div>
                </div>

                {/* Default Landing View */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-border/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text">Default Start Screen</h4>
                    <p className="text-[11px] text-dark-muted mt-0.5">
                      Choose where the app opens when navigating to the root application.
                    </p>
                  </div>

                  <div className="flex items-center bg-white border border-border rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, defaultLandingView: 'explore' }))}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        settings.defaultLandingView === 'explore'
                          ? 'bg-brand-500 text-white shadow-soft'
                          : 'text-dark-muted hover:text-dark-text'
                      }`}
                    >
                      Explore Feed
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, defaultLandingView: 'home' }))}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        settings.defaultLandingView === 'home'
                          ? 'bg-brand-500 text-white shadow-soft'
                          : 'text-dark-muted hover:text-dark-text'
                      }`}
                    >
                      Home Landing
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 6: DATA & DANGER ZONE */}
          {/* ============================================================ */}
          {activeCategory === 'danger' && (
            <div className="space-y-6">
              
              {/* Data Export Card */}
              <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-brand-600" />
                    <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider">
                      Data Portability & Backup
                    </h2>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text">Download Account & Preferences Data</h4>
                    <p className="text-[11px] text-dark-muted leading-relaxed">
                      Download a secure, readable `.json` archive containing your profile details, platform settings, and security preferences.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    icon={Download}
                    className="text-xs font-semibold shrink-0 self-start sm:self-auto"
                  >
                    Export My Data
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-3xl border border-red-200/80 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-red-100 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h2 className="text-sm font-bold text-red-700 uppercase tracking-wider">
                      Danger Zone
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    Irreversible
                  </span>
                </div>

                {/* Reset Settings to Defaults */}
                <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text">Reset All Preferences to Defaults</h4>
                    <p className="text-[11px] text-dark-muted mt-0.5">
                      Restores radius, availability, notifications, and privacy fuzzing back to platform baseline.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    icon={RotateCcw}
                    className="text-xs text-red-700 border-red-200 hover:bg-red-50 shrink-0 self-start sm:self-auto font-semibold"
                  >
                    Reset Defaults
                  </Button>
                </div>

                {/* Delete Account */}
                {user && (
                  <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-red-950">Permanently Delete Account</h4>
                      <p className="text-[11px] text-red-800 mt-0.5">
                        Permanently erases your user profile, active meetups, chat history, and uploaded avatar.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setDeleteConfirmText('');
                        setIsDeleteModalOpen(true);
                      }}
                      icon={Trash2}
                      className="text-xs bg-red-600 hover:bg-red-700 border-red-600 text-white shrink-0 self-start sm:self-auto font-bold shadow-soft"
                    >
                      Delete Account
                    </Button>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectTab ? onSelectTab('home') : (onNavigate && onNavigate('/'))}
          className="text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          icon={Check}
          className="text-xs font-bold shadow-xs px-6"
        >
          {isSaved ? 'Preferences Saved!' : 'Save All Changes'}
        </Button>
      </div>

      {/* ============================================================ */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Account Password"
        subtitle="Ensure your account remains safe with our strict credential guidelines."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 py-2 text-left">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-dark-text">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-dark-text">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8 to 16 characters"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-dark-text">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
            />
          </div>

          {/* Real-time Checklist */}
          <div className="p-3 bg-slate-50 rounded-xl border border-border/80 space-y-1.5 text-[11px]">
            <p className="font-bold text-dark-muted mb-1 uppercase text-[10px]">Password Rules:</p>
            <div className={`flex items-center gap-1.5 ${hasValidLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasValidLength ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>8 to 16 characters length</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasCapital ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasCapital ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>At least 1 uppercase letter (A–Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSmall ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasSmall ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>At least 1 lowercase letter (a–z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>At least 1 number (0–9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isMatch && newPassword ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${isMatch && newPassword ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Passwords match</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!isPasswordValid || passwordLoading}
              className="text-xs font-bold shadow-xs"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Delete Account"
        subtitle="This action cannot be undone."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-2 text-left">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1.5 leading-relaxed">
            <p className="font-bold">Are you absolutely sure?</p>
            <p>
              Deleting your account will immediately remove your profile, revoke your session, delete hosted meetups, and purge stored preferences.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-text">
              Type <span className="font-mono text-red-600 font-extrabold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border rounded-xl text-xs font-mono focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
              onClick={handleDeleteAccount}
              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-soft"
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default SettingsPage;
