import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Compass, 
  Sliders, 
  Calendar, 
  Bell, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';

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

export function SettingsModal({ isOpen, onClose, user }) {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('connect2go_user_settings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('connect2go_user_settings', JSON.stringify(settings));
      setSavedSuccess(true);
      addToast('Privacy & activity preferences saved successfully!', 'success');
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      addToast('Failed to save preferences', 'error');
    }
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-dark-text/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl border border-border/80 shadow-2xl max-w-lg w-full overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-dark-text tracking-tight">Preferences & Privacy Hub</h2>
              <p className="text-xs text-dark-muted">Manage your discovery filters and privacy protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Section 1: Location Privacy Protection */}
          <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-dark-text flex items-center gap-1.5">
                    <span>Location Privacy Fuzzing</span>
                    <Badge variant="mint" size="sm">Active Guard</Badge>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Adds a randomized ~400m jitter to your coordinates. Other users see you in your general neighbourhood without discovering your exact residential address.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
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

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-white/70 px-3 py-1.5 rounded-xl border border-emerald-200/50">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Matching algorithm still guarantees precision within your selected radius.</span>
            </div>
          </div>

          {/* Section 2: Default Match Discovery Radius */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-dark-text uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-brand-600" />
                <span>Default Activity Search Radius</span>
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
              <span>1 km (Walking)</span>
              <span>5 km (Standard)</span>
              <span>15 km (City)</span>
              <span>25 km (Metro)</span>
            </div>
          </div>

          {/* Section 3: Skill Level Alignment */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-dark-text uppercase tracking-wider flex items-center gap-1.5">
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

          {/* Section 4: Availability Matrix */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Your Availability Window</span>
            </label>
            <p className="text-[11px] text-dark-muted">Select when you usually prefer participating in meetups.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'Morning', label: 'Morning (6 AM – 12 PM)' },
                { key: 'Afternoon', label: 'Afternoon (12 PM – 5 PM)' },
                { key: 'Evening', label: 'Evening (5 PM – 10 PM)' },
                { key: 'Weekends', label: 'Weekends (Sat & Sun)' },
              ].map((item) => {
                const active = settings.availability.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => toggleAvailability(item.key)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-brand-50/70 border-brand-300 text-brand-900 font-bold'
                        : 'bg-slate-50 border-border/80 text-dark-muted hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Notifications & Alerts */}
          <div className="space-y-3 pt-3 border-t border-border/70">
            <label className="text-xs font-bold text-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-brand-600" />
              <span>Real-Time Notifications</span>
            </label>

            <div className="space-y-2">
              {[
                { 
                  id: 'notifyActivityJoins', 
                  title: 'Activity Join Alerts', 
                  desc: 'Notify when someone joins your hosted activity' 
                },
                { 
                  id: 'notifyHandshakeRequests', 
                  title: 'Reveal Identity Handshakes', 
                  desc: 'Notify when a chat partner requests profile reveal' 
                },
                { 
                  id: 'notifyNearbyMatches', 
                  title: 'High-Compatibility Alerts', 
                  desc: 'Notify when a 90%+ match posts an activity nearby' 
                },
              ].map((item) => (
                <label 
                  key={item.id} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-border/60 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-dark-text">{item.title}</p>
                    <p className="text-[11px] text-dark-faint">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.id]}
                    onChange={(e) => setSettings((s) => ({ ...s, [item.id]: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
              className="text-xs font-bold shadow-xs px-5"
            >
              {savedSuccess ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
