import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Edit3, 
  Check, 
  Plus, 
  X, 
  Award, 
  Heart, 
  Sliders, 
  Lock,
  Camera,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useGeo } from '../context/GeoContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar, handleAvatarError } from '../utils/imageUtils.js';

export function ProfilePage({ onNavigate, onOpenSettings, onOpenSafety, onComingSoon }) {
  const { user } = useAuth();
  const { locationName } = useGeo();
  const { addToast } = useToast();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || 'Passionate about sports, weekend morning runs, tech hackathons, and meeting genuine people nearby in Jaipur.');
  const [interests, setInterests] = useState(user?.interests || ['Badminton', 'Running', 'Coding', 'Music', 'Fitness']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const handleSaveBio = () => {
    setIsEditingBio(false);
    addToast('Profile bio updated successfully!', 'success');
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    if (!interests.includes(newTagInput.trim())) {
      setInterests([...interests, newTagInput.trim()]);
      addToast(`Added "${newTagInput.trim()}" to interests!`, 'info');
    }
    setNewTagInput('');
    setShowAddTag(false);
  };

  const handleRemoveInterest = (tag) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  const name = user?.name || 'Kinshuk Khandelwal';
  const avatar = getSafeAvatar(name, user?.avatar);

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
            onClick={onOpenSettings}
            icon={Sliders}
            className="text-xs font-semibold"
          >
            Settings & Privacy
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenSafety}
            icon={ShieldCheck}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          >
            Safety Center
          </Button>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-border/80 p-6 sm:p-8 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                onError={(e) => handleAvatarError(e, name)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-brand-100 shadow-md bg-slate-100"
              />
              <button 
                onClick={() => onComingSoon('Photo Upload (Cloudinary)')}
                className="absolute inset-0 bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold"
                title="Change Profile Photo"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>Change</span>
              </button>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Status" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                  {name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ID Verified Member</span>
                </span>
              </div>
              <p className="text-xs text-brand-600 font-semibold">@{user?.username || 'kinshukh'}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-dark-muted pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>{locationName || 'Poornima Campus, Jaipur'}</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Member since Sept 2026</span>
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-600">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                  <span>4.9 ★ Community Rating</span>
                </span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsEditingBio(!isEditingBio)}
            icon={Edit3}
            className="text-xs font-bold shrink-0 shadow-xs"
          >
            {isEditingBio ? 'Done Editing' : 'Edit Profile'}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border/70">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-dark-text">12</div>
            <div className="text-[11px] font-semibold text-dark-faint mt-0.5">Activities Hosted</div>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-brand-600">19</div>
            <div className="text-[11px] font-semibold text-dark-faint mt-0.5">Sessions Joined</div>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-emerald-600">98%</div>
            <div className="text-[11px] font-semibold text-dark-faint mt-0.5">Trust & Safety Score</div>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-purple-600">24</div>
            <div className="text-[11px] font-semibold text-dark-faint mt-0.5">Verified Peers</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bio & Preferences vs Activity History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Bio & Interests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About & Bio Card */}
          <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                <span>About & Activity Bio</span>
              </h3>
              {!isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-brand-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingBio(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveBio}
                    icon={Check}
                    className="text-xs font-bold"
                  >
                    Save Bio
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {bio}
              </p>
            )}

            {/* Interests & Hobbies */}
            <div className="space-y-3 pt-4 border-t border-border/70">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Activity Hobbies & Interests ({interests.length})</span>
                </h4>
                <button
                  onClick={() => setShowAddTag(!showAddTag)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Hobby</span>
                </button>
              </div>

              {showAddTag && (
                <form onSubmit={handleAddInterest} className="flex gap-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="e.g. Table Tennis, Cycling, Photography..."
                    className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-brand-500"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="primary" className="text-xs font-bold h-9">
                    Add
                  </Button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200/80 group"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(tag)}
                      className="text-brand-400 hover:text-red-500 transition-colors"
                      title="Remove interest"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Activity History Card */}
          <div className="bg-white rounded-3xl border border-border/80 p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Recent Activity History</span>
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: 'h1',
                  title: 'Evening Badminton Doubles Rally',
                  category: 'Sports',
                  role: 'Host',
                  date: 'Today, 6:00 PM',
                  venue: 'Campus Sports Arena Court 2',
                  status: 'Upcoming'
                },
                {
                  id: 'h2',
                  title: 'Morning 5K Jog & Cardio Session',
                  category: 'Fitness',
                  role: 'Participant',
                  date: 'Yesterday',
                  venue: 'Central Park Green Loop',
                  status: 'Completed'
                },
                {
                  id: 'h3',
                  title: 'React & GenAI Developers Sprint',
                  category: 'Study',
                  role: 'Host',
                  date: 'Sept 15, 2026',
                  venue: 'Sitapura Tech Park Hub',
                  status: 'Completed'
                }
              ].map((act) => (
                <div 
                  key={act.id} 
                  className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-dark-text">{act.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {act.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-dark-muted flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-brand-600" />
                      <span>{act.venue}</span>
                      <span>•</span>
                      <span>{act.date}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={act.status === 'Upcoming' ? 'mint' : 'default'} size="sm">
                      {act.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Privacy Shield & Trust Status */}
        <div className="space-y-6">
          
          {/* Privacy Fuzzing Status Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-dark-text">Privacy Guard Status</h4>
                <p className="text-[11px] text-emerald-800 font-semibold">Active & Shielding</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-200/50">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-dark-text">~400m Location Fuzzing:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Your exact home or apartment is never broadcasted to strangers.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-200/50">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-dark-text">Dual Handshake Guard:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Contact details remain anonymous until mutual agreement.</p>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={onOpenSettings}
              className="w-full text-xs font-bold bg-white"
            >
              Configure Privacy Settings →
            </Button>
          </div>

          {/* Trust Badges Showcase */}
          <div className="bg-white border border-border/80 rounded-3xl p-6 shadow-soft space-y-4">
            <h4 className="text-sm font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Community Badges</span>
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-xs font-bold text-dark-text">Super Host</p>
                  <p className="text-[11px] text-dark-faint">Successfully organized 10+ activities</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                <span className="text-xl">🛡️</span>
                <div>
                  <p className="text-xs font-bold text-dark-text">Safety Pledge Signed</p>
                  <p className="text-[11px] text-dark-faint">Committed to respectful meetups</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-brand-50/60 border border-brand-200/60">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-xs font-bold text-dark-text">Quick Responder</p>
                  <p className="text-[11px] text-dark-faint">Replies to chat requests in &lt; 5 mins</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProfilePage;
