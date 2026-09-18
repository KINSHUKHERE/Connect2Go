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
  UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const DEFAULT_SETTINGS = {
  privacyFuzzing: true, // ~400m coordinate jitter
  searchRadiusKm: 5,
  skillLevel: 'Intermediate',
  availability: ['Evening', 'Weekends'],
  notifyActivityJoins: true,
  notifyHandshakeRequests: true,
  notifyNearbyMatches: true,
  anonymousDefault: true,
};

export function SettingsPage({ onNavigate, onOpenSafety }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('connect2go_user_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }, []);

  const handleSave = (e) => {
    e?.preventDefault();
    try {
      localStorage.setItem('connect2go_user_settings', JSON.stringify(settings));
      setIsSaved(true);
      addToast('Preferences & privacy settings saved successfully!', 'success');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      addToast('Failed to save preferences', 'error');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('connect2go_user_settings', JSON.stringify(DEFAULT_SETTINGS));
    addToast('Settings reset to platform defaults', 'info');
  };

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

  return (
    <div className="w-full space-y-6 text-left pb-20">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-muted hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
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
            className="text-xs font-bold shadow-xs"
          >
            {isSaved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Page Title Card */}
      <div className="bg-white rounded-3xl border border-border/80 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-soft">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-dark-text tracking-tight">Settings & Privacy Hub</h1>
            <p className="text-xs sm:text-sm text-dark-muted mt-0.5">
              Control location fuzzing, default matching filters, schedule availability, and alerts.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200 self-start sm:self-auto">
          Connected as @{user?.username || 'user'}
        </span>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Location Privacy Protection */}
        <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">
              Location Privacy & Fuzzing
            </h3>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-dark-text">
                    ~400m Coordinate Fuzzing (Jitter Shield)
                  </h4>
                  <Badge variant="mint" size="sm">Active</Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Adds a randomized ~400m offset to your GPS location for nearby discovery. Other users only see your neighbourhood, never your exact apartment or residence.
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

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
              <Info className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
              <span>Matching algorithm still guarantees precision within your selected radius.</span>
            </div>
          </div>

          {/* Masked Anonymous Default */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-dark-text flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-purple-600" />
                <span>Masked Identity on Initial Chats</span>
              </h4>
              <p className="text-[11px] text-dark-muted leading-relaxed">
                Always start chats with an anonymous moniker (e.g. ActivePeer #42). Real profile is only revealed after mutual consent via the Dual Reveal Handshake.
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
        </div>

        {/* Section 2: Discovery Radius & Skill Preferences */}
        <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">
              Discovery & Matching Preferences
            </h3>
          </div>

          {/* Search Radius Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Default Activity Discovery Radius</span>
              </label>
              <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {settings.searchRadiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={settings.searchRadiusKm}
              onChange={(e) => setSettings((s) => ({ ...s, searchRadiusKm: Number(e.target.value) }))}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-semibold text-dark-faint px-0.5">
              <span>1 km (Walk)</span>
              <span>5 km (Neighbourhood)</span>
              <span>15 km (City)</span>
              <span>25 km (Metro)</span>
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-2.5 pt-4 border-t border-border/70">
            <label className="text-xs font-bold text-dark-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Preferred Activity Skill Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((lvl) => {
                const isSelected = settings.skillLevel === lvl;
                return (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSettings((s) => ({ ...s, skillLevel: lvl }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
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
        </div>

        {/* Section 3: Availability Window Matrix */}
        <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">
              Availability Schedule Matrix
            </h3>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            The Algorithmic Matching Engine assigns up to 20 points when an activity's time slot aligns with your preferred availability.
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

        {/* Section 4: Notification Alerts & Activity Pings */}
        <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">
              Activity & Security Notifications
            </h3>
          </div>

          <div className="space-y-2.5">
            {[
              { 
                id: 'notifyActivityJoins', 
                title: 'Activity Join Alerts', 
                desc: 'Alert when a nearby peer joins an activity you are hosting' 
              },
              { 
                id: 'notifyHandshakeRequests', 
                title: 'Reveal Handshake Requests', 
                desc: 'Instant prompt when a chat partner asks to reveal identities' 
              },
              { 
                id: 'notifyNearbyMatches', 
                title: 'High-Affinity Match Alerts', 
                desc: 'Notify when a 90%+ matching companion posts nearby' 
              },
            ].map((item) => (
              <label 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-border/60 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-dark-text">{item.title}</p>
                  <p className="text-[11px] text-dark-faint">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.id]}
                  onChange={(e) => setSettings((s) => ({ ...s, [item.id]: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSafety}
              icon={ShieldCheck}
              className="text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 font-semibold"
            >
              Read Community Safety & Trust Guidelines →
            </Button>
          </div>
        </div>

      </div>

      {/* Sticky Save Bar on Mobile / Bottom */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('/')}
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
          {isSaved ? 'Preferences Saved!' : 'Save All Preferences'}
        </Button>
      </div>

    </div>
  );
}

export default SettingsPage;
