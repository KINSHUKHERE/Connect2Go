import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  LogIn, 
  Bell, 
  PlusCircle, 
  User, 
  Shield, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGeo } from '../../context/GeoContext.jsx';
import { Button } from '../ui/Button.jsx';
import { getSafeAvatar } from '../../utils/imageUtils.js';
import { NotificationDropdown } from './NotificationDropdown.jsx';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  onNavigate, 
  onOpenAuth, 
  onOpenCreate, 
  onOpenChat, 
  onOpenLocationPicker,
  onOpenSettings,
  onComingSoon 
}) {
  const { user, logout } = useAuth();
  const { locationName } = useGeo();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setProfileDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-border/80 transition-all shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Name */}
        <div 
          onClick={() => handleSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Connect2Go Home"
        >
          <img 
            src="/favicon.png" 
            alt="Connect2Go Logo" 
            className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col text-left">
            <span className="text-xl font-extrabold tracking-tight text-dark-text flex items-center gap-1">
              Connect<span className="text-brand-500">2Go</span>
            </span>
            <span className="text-[10px] font-semibold text-dark-faint -mt-1 hidden sm:inline">
              People Nearby. Activities Together.
            </span>
          </div>
        </div>

        {/* Center Desktop Quick Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-border/50">
          <button
            onClick={() => handleSelectTab('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-white text-dark-text shadow-xs font-bold'
                : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleSelectTab('explore')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-white text-dark-text shadow-xs font-bold'
                : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => handleSelectTab('my-activities')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'my-activities'
                ? 'bg-white text-dark-text shadow-xs font-bold'
                : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            My Activities
          </button>
          <button
            onClick={() => handleSelectTab('matches')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'matches'
                ? 'bg-white text-dark-text shadow-xs font-bold'
                : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            Matches
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Host Activity CTA Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenCreate}
            icon={PlusCircle}
            className="hidden sm:inline-flex font-bold text-xs shadow-xs"
          >
            Host Activity
          </Button>

          {/* Location Indicator with Live GPS & Map Picker */}
          <div 
            onClick={onOpenLocationPicker || (() => onComingSoon('Change Location (GPS & Map Pinning)'))}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100/70 border border-brand-200/60 rounded-full text-xs font-medium text-brand-800 cursor-pointer transition-colors"
            title="Click to change location or detect live GPS"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate max-w-[140px]">{locationName}</span>
          </div>

          {/* Live Activity & Safety Notifications Tray */}
          <NotificationDropdown
            onOpenChat={(peer) => onOpenChat && onOpenChat(peer)}
            onSelectTab={handleSelectTab}
            onOpenSettings={() => {
              setProfileDropdownOpen(false);
              onOpenSettings && onOpenSettings();
            }}
          />

          {/* Profile Bar with Hover & Click Dropdown */}
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {user ? (
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border/80 hover:bg-slate-50 transition-all focus:outline-none"
                aria-expanded={profileDropdownOpen}
                title="Account Menu"
              >
                <img
                  src={getSafeAvatar(user.name, user.avatar)}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-500/50 bg-slate-100"
                />
                <span className="text-xs font-semibold text-dark-text hidden sm:inline max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-dark-muted transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 hover:bg-slate-50 text-dark-text transition-all font-semibold text-xs"
                aria-expanded={profileDropdownOpen}
                title="Account Menu"
              >
                <User className="w-3.5 h-3.5 text-dark-muted" />
                <span className="hidden sm:inline">Account</span>
                <ChevronDown className={`w-3.5 h-3.5 text-dark-muted transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 top-full pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-border/90 p-1.5 space-y-1 text-left">
                  {user ? (
                    <>
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                        <img
                          src={getSafeAvatar(user.name, user.avatar)}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-dark-text truncate">{user.name}</p>
                          <p className="text-[11px] text-dark-muted truncate">@{user.username || 'user'}</p>
                        </div>
                      </div>

                      <div className="h-px bg-border/60 my-1"></div>

                      {/* Dropdown Navigation Links */}
                      <button
                        onClick={() => handleSelectTab('profile')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          activeTab === 'profile'
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-dark-text hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-4 h-4 text-brand-600" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => handleSelectTab('safety')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          activeTab === 'safety'
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-dark-text hover:bg-slate-50'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-brand-600" />
                        <span>Safety & Trust</span>
                      </button>

                      <button
                        onClick={() => handleSelectTab('settings')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          activeTab === 'settings'
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-dark-text hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Settings & Privacy</span>
                        </div>
                        <span className="text-[9px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200">
                          Active
                        </span>
                      </button>

                      <div className="h-px bg-border/60 my-1"></div>

                      {/* Logout Option */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest Header */}
                      <div className="px-3 py-2 bg-slate-50 rounded-xl">
                        <p className="text-xs font-bold text-dark-text">Guest User</p>
                        <p className="text-[11px] text-dark-muted">Sign in to host & join activities</p>
                      </div>

                      {/* Login CTA */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In / Register</span>
                      </button>

                      <div className="h-px bg-border/60 my-1"></div>

                      <button
                        onClick={() => handleSelectTab('safety')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-dark-text hover:bg-slate-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-brand-600" />
                        <span>Safety & Trust</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onComingSoon('Settings');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-dark-text hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Settings</span>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
