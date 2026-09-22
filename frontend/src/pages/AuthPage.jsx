import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Check,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Users,
  Gamepad2,
  BookOpen,
  Compass,
  Activity,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { checkPasswordPolicy } from '../utils/authUtils.js';
import { DEFAULT_UNKNOWN_AVATAR } from '../utils/imageUtils.js';

export function AuthPage({ mode = 'signin', onNavigate }) {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    authLoading, 
    authError, 
    setAuthError 
  } = useAuth();
  
  const toast = useToast();

  const [authMode, setAuthMode] = useState(mode === 'signup' ? 'signup' : 'signin');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [localError, setLocalError] = useState(null);

  // Optional Avatar Upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('/avatars/male.png');
  const fileInputRef = React.useRef(null);

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be smaller than 5MB.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync mode when prop changes
  useEffect(() => {
    setAuthMode(mode === 'signup' ? 'signup' : 'signin');
    setLocalError(null);
    if (setAuthError) setAuthError(null);
  }, [mode, setAuthError]);

  // Real-time password criteria evaluation
  const passwordPolicy = checkPasswordPolicy(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSocialClick = (provider) => {
    toast.info(`${provider} sign-in is coming soon! Please use your email and password.`);
  };

  const handleForgotPassword = (e) => {
    e?.preventDefault();
    toast.info('Password reset instructions will be sent to your email. Feature coming soon!');
  };

  const handleTermsClick = (e, type) => {
    e?.preventDefault();
    toast.info(`Connect2Go ${type}: Built for safe, respectful, and verified real-world community meetups.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (setAuthError) setAuthError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (authMode === 'signup') {
      const trimmedName = name.trim();
      const trimmedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

      if (!trimmedName) {
        setLocalError('Please enter your full name.');
        return;
      }

      if (!trimmedUsername) {
        setLocalError('Please choose a username (e.g. alex_ninja99) for public anonymity.');
        return;
      }

      if (!agreeTerms) {
        setLocalError('Please agree to the Terms of Service and Privacy Policy.');
        toast.warning('Please agree to the Terms of Service to continue.');
        return;
      }

      // Enforce strict password policy: 8-16 chars, 1 capital, 1 small, 1 number
      if (!passwordPolicy.isSatisfied) {
        const pendingList = passwordPolicy.pendingRules.map(r => r.pendingMessage).join(' • ');
        setLocalError(`Password requirement not filled: ${pendingList}`);
        toast.error('Please satisfy all password requirements before signing up.');
        return;
      }

      // Enforce confirm password
      if (!confirmPassword.trim()) {
        setLocalError('Please confirm your password.');
        toast.error('Confirm password is required.');
        return;
      }

      if (trimmedPassword !== confirmPassword.trim()) {
        setLocalError('Passwords do not match. Please re-enter confirm password.');
        toast.error('Passwords do not match.');
        return;
      }

      const defaultAvatarForGender = gender.toLowerCase() === 'female' ? '/avatars/female.png' : '/avatars/male.png';
      const finalAvatar = avatarPreview || defaultAvatarForGender;
      const res = await signUpWithEmail(trimmedEmail, trimmedPassword, trimmedName, trimmedUsername, gender, finalAvatar);
      if (res?.success) {
        toast.success(`Welcome to Connect2Go, @${trimmedUsername}!`);
        if (onNavigate) onNavigate('home');
      }
    } else {
      // Login / Sign In Flow
      const res = await signInWithEmail(trimmedEmail, trimmedPassword);
      if (res?.success) {
        if (trimmedEmail.toLowerCase() === 'herekinshuk@gmail.com' || res?.isAdmin) {
          toast.success('Signed in as Administrator (Kinshuk Khandelwal)!');
          if (onNavigate) onNavigate('admin');
        } else {
          toast.success('Signed in successfully!');
          if (onNavigate) onNavigate('home');
        }
      }
    }
  };

  return (
    <div className="h-screen max-h-screen w-full overflow-hidden bg-[#F8FAFC] flex flex-col justify-center items-center p-2 sm:p-4 lg:p-6 font-sans antialiased text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      
      {/* Main Split-Screen Container - Centered and Viewport-Locked */}
      <div className="w-full max-w-5xl xl:max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full max-h-[96vh] md:max-h-[640px] lg:max-h-[670px] my-auto transition-all duration-300">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: VISUAL / HERO SHOWCASE (Desktop & Tablet)            */}
        {/* ================================================================= */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-6 relative overflow-hidden flex-col justify-between p-6 lg:p-7 xl:p-8 transition-all duration-500 h-full">
          
          {authMode === 'signin' ? (
            /* ----------------- LOGIN HERO ----------------- */
            <>
              {/* Outdoor Summit Lifestyle Photo */}
              <img 
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80" 
                alt="Outdoor Friends Summit" 
                className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-900/60" />

              {/* Brand Header */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 flex items-center justify-center text-white shadow-md">
                  <MapPin className="w-4 h-4 fill-emerald-500 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">Connect2Go</h2>
                  <p className="text-[11px] text-white/80 font-medium">People Nearby. Activities Together.</p>
                </div>
              </div>

              {/* Headline & Activity Badges */}
              <div className="relative z-10 space-y-4 my-auto pt-3 pb-2">
                <div className="space-y-1.5">
                  <h1 className="text-3xl xl:text-4xl font-black text-white leading-[1.12] tracking-tight">
                    Find Your<br />
                    People.<br />
                    <span className="text-[#22C55E]">In The Real World.</span>
                  </h1>
                  <p className="text-xs xl:text-sm text-slate-200/90 font-medium max-w-md leading-relaxed pt-0.5">
                    Discover people who share your interests, join activities, and build meaningful connections — offline.
                  </p>
                </div>

                {/* 4 Activity Badges */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex flex-col items-center gap-1 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-bold text-white/90">Meet</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm">
                      <Gamepad2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-[11px] font-bold text-white/90">Play</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-[11px] font-bold text-white/90">Learn</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm">
                      <Compass className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-[11px] font-bold text-white/90">Explore</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quote & Floating Glass Highlight Card */}
              <div className="relative z-10 flex items-end justify-between gap-3 pt-2">
                <div className="text-white/85 font-serif italic text-xs xl:text-sm leading-snug">
                  “More Activities,<br />
                  More Friends,<br />
                  A Happier You.”
                </div>

                {/* Floating Highlight Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/40 flex items-center gap-2.5 shrink-0 animate-in fade-in duration-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-extrabold text-slate-900">Badminton Today</p>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500">3 people nearby • 1.2 km away</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ----------------- SIGNUP HERO ----------------- */
            <>
              {/* Soft Light Mint Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-[#DCFCE7]" />
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

              {/* Brand Header */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white shadow-md flex items-center justify-center">
                  <MapPin className="w-4 h-4 fill-white text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Connect2Go</h2>
                  <p className="text-[11px] text-slate-500 font-medium">People Nearby. Activities Together.</p>
                </div>
              </div>

              {/* Slogan & Visual Collage */}
              <div className="relative z-10 space-y-3 my-auto py-1">
                <div className="font-serif italic text-slate-800 text-base xl:text-lg font-semibold leading-snug">
                  “Same Interests<br />
                  New Friends<br />
                  Real Experiences”
                </div>

                {/* Photo Collage Compacted for Viewport Fit */}
                <div className="grid grid-cols-3 gap-2 max-w-xs xl:max-w-sm pt-1">
                  <div className="space-y-2">
                    <img
                      src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=350&q=80"
                      alt="Running in morning"
                      className="w-full h-24 object-cover rounded-xl shadow-xs hover:scale-[1.02] transition-transform"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=350&q=80"
                      alt="Friends laughing"
                      className="w-full h-18 object-cover rounded-xl shadow-xs hover:scale-[1.02] transition-transform"
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <img
                      src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=350&q=80"
                      alt="Cycling together"
                      className="w-full h-34 object-cover rounded-xl shadow-xs hover:scale-[1.02] transition-transform"
                    />
                  </div>
                  <div className="space-y-2">
                    <img
                      src="https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=350&q=80"
                      alt="Hiking meetup"
                      className="w-full h-18 object-cover rounded-xl shadow-xs hover:scale-[1.02] transition-transform"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=350&q=80"
                      alt="Team high five"
                      className="w-full h-24 object-cover rounded-xl shadow-xs hover:scale-[1.02] transition-transform"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Highlight Card */}
              <div className="relative z-10 flex items-center justify-end pt-1">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-100 flex items-center gap-2.5 animate-in fade-in duration-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-extrabold text-slate-900">Running Group</p>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                        5 interested
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500">Starting in 45m • 2.3 km away</p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: MODERN AUTHENTICATION FORM (Mobile & Desktop)       */}
        {/* ================================================================= */}
        <div className="col-span-1 md:col-span-7 lg:col-span-6 flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 bg-white h-full overflow-y-auto">
          
          {/* Top Bar: Return Link & Mode Switcher */}
          <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#22C55E] transition-colors cursor-pointer"
              title="Return to Connect2Go homepage"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Connect2Go</span>
            </button>

            <div className="text-xs text-slate-500 font-medium">
              {authMode === 'signin' ? (
                <span>
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setLocalError(null);
                      if (onNavigate) onNavigate('signup');
                    }}
                    className="font-bold text-[#22C55E] hover:text-[#16A34A] transition-colors cursor-pointer ml-1"
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setLocalError(null);
                      if (onNavigate) onNavigate('login');
                    }}
                    className="font-bold text-[#22C55E] hover:text-[#16A34A] transition-colors cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Mobile Top Brand (Shown on small screens) */}
          <div className="md:hidden flex items-center justify-center gap-2 pt-2 pb-1 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-3.5 h-3.5 fill-white text-emerald-600" />
            </div>
            <span className="text-base font-black text-slate-900 tracking-tight">Connect2Go</span>
          </div>

          {/* Form Content Area */}
          <div className="space-y-3 my-auto py-1">
            
            {/* Header Title */}
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{authMode === 'signin' ? 'Welcome Back' : 'Create Your Account'}</span>
                {authMode === 'signin' && <span className="text-xl select-none">👋</span>}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {authMode === 'signin'
                  ? 'Sign in to continue your journey'
                  : "Let's get you started on your journey."}
              </p>
            </div>

            {/* Social Logins on Sign In Page */}
            {authMode === 'signin' && (
              <div className="space-y-2 pt-0.5">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="w-full h-10 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Continue with Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="w-full h-10 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.85-12.03-14.3-6.03-8.99-10.8-19.14-14.3-30.47-3.5-11.33-5.25-22.13-5.25-32.4 0-14.65 3.63-26.68 10.89-36.1 7.26-9.42 16.32-14.24 27.17-14.48 4.8 0 10.15 1.25 16.06 3.75 5.91 2.5 9.87 3.82 11.89 3.96 1.76-.23 5.86-1.59 12.3-4.08 6.44-2.49 12.04-3.61 16.8-3.36 12.56.64 22.56 4.85 29.98 12.63-10.97 6.64-16.33 15.65-16.08 27.02.26 8.92 3.69 16.27 10.29 22.04 6.6 5.77 14.33 9.07 23.19 9.9-2.14 6.37-4.73 12.7-7.77 18.99zM119.22 31.8c0-7.1 2.57-13.79 7.71-20.08 5.14-6.28 11.66-10.27 19.56-11.96.22 1.48.33 2.76.33 3.84 0 7.02-2.6 13.7-7.81 20.04-5.21 6.34-11.8 10.28-19.79 11.81z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-slate-200"></div>
                  <span className="absolute bg-white px-2.5 text-[10px] font-semibold text-slate-400">
                    or sign in with email
                  </span>
                </div>
              </div>
            )}

            {/* Error Message Notice */}
            {(localError || authError) && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-semibold leading-relaxed">{localError || authError}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">

              {/* Profile Photo Upload (Optional - Sign Up Only) */}
              {authMode === 'signup' && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Profile Photo <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="relative shrink-0">
                      <img
                        src={avatarPreview || DEFAULT_UNKNOWN_AVATAR}
                        alt="Avatar Preview"
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/30 bg-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs hover:bg-emerald-600 transition-colors cursor-pointer"
                        title="Choose photo"
                      >
                        <Camera className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[11px] font-bold text-slate-800 truncate">
                        {avatarFile ? avatarFile.name : 'Default Avatar'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {avatarFile ? 'Custom photo selected' : 'Upload photo or keep default icon'}
                      </p>
                      <div className="flex items-center gap-2.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                        >
                          {avatarPreview ? 'Change Photo' : '+ Choose Photo'}
                        </button>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
              
              {/* Full Name (Sign Up Only) */}
              {authMode === 'signup' && (
                <div className="space-y-0.5 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Username & Gender Fields (Sign Up Only) */}
              {authMode === 'signup' && (
                <>
                  {/* Username Field */}
                  <div className="space-y-0.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Username <span className="text-[10px] font-normal text-emerald-600">(Public Identity)</span>
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 font-bold text-xs pointer-events-none">@</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. alex_j24"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full h-10 pl-8 pr-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white focus:ring-2 focus:ring-[#22C55E]/20 transition-all font-semibold"
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200/60 mt-1">
                      <span>🔒 Only your username will be visible to others for complete anonymity.</span>
                    </p>
                  </div>

                  {/* Gender Selector */}
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Gender <span className="text-[10px] font-normal text-slate-400">(Determines default avatar icon)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGender('Male');
                          if (!avatarFile) setAvatarPreview('/avatars/male.png');
                        }}
                        className={`h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          gender === 'Male'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>👦 Male</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGender('Female');
                          if (!avatarFile) setAvatarPreview('/avatars/female.png');
                        }}
                        className={`h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          gender === 'Female'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>👩 Female</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGender('Other');
                          if (!avatarFile) setAvatarPreview('/avatars/male.png');
                        }}
                        className={`h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          gender === 'Other'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>✨ Other</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="space-y-0.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Password
                  </label>
                  {authMode === 'signup' && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {password.length}/16 chars
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={16}
                    placeholder={authMode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full h-10 pl-9 pr-9 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                      authMode === 'signup' && password.length > 0 && !passwordPolicy.isSatisfied
                        ? 'bg-amber-50/30 border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                        : authMode === 'signup' && password.length > 0 && passwordPolicy.isSatisfied
                          ? 'bg-emerald-50/30 border border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'bg-slate-50/70 border border-slate-200 focus:border-[#22C55E] focus:bg-white focus:ring-2 focus:ring-[#22C55E]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Error Reminder (Only shown while typing invalid password) */}
                {authMode === 'signup' && password.length > 0 && !passwordPolicy.isSatisfied && (
                  <p className="text-[11px] font-semibold text-amber-600 flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>Must be 8-16 chars, contain 1 uppercase (A-Z), 1 lowercase (a-z), & 1 number.</span>
                  </p>
                )}
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {authMode === 'signup' && (
                <div className="space-y-0.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Confirm Password
                    </label>
                  </div>

                  <div className="relative flex items-center">
                    <Lock className={`w-4 h-4 absolute left-3 pointer-events-none ${
                      confirmMismatch ? 'text-red-500' : passwordsMatch ? 'text-emerald-500' : 'text-slate-400'
                    }`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      maxLength={16}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full h-10 pl-9 pr-9 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                        confirmMismatch
                          ? 'bg-red-50/40 border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-900'
                          : passwordsMatch
                            ? 'bg-emerald-50/40 border border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-900'
                            : 'bg-slate-50/70 border border-slate-200 focus:border-[#22C55E] focus:bg-white focus:ring-2 focus:ring-[#22C55E]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {confirmMismatch && (
                    <div className="p-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold text-red-700 animate-in fade-in duration-150">
                      <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                      <span>Warning: Confirm password does not match.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Options: Remember Me & Forgot Password (Sign In) */}
              {authMode === 'signin' && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#22C55E] border-slate-300 focus:ring-[#22C55E] accent-[#22C55E] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-[#22C55E] hover:text-[#16A34A] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Form Options: Terms of Service Checkbox (Sign Up) */}
              {authMode === 'signup' && (
                <div className="pt-0.5">
                  <label className="flex items-start gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-[#22C55E] border-slate-300 focus:ring-[#22C55E] accent-[#22C55E] cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] font-medium text-slate-600 leading-tight">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => handleTermsClick(e, 'Terms of Service')}
                        className="font-bold text-[#22C55E] hover:underline"
                      >
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={(e) => handleTermsClick(e, 'Privacy Policy')}
                        className="font-bold text-[#22C55E] hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                </div>
              )}

              {/* Primary Submit CTA Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {authLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Social Divider & Row */}
            {authMode === 'signup' && (
              <div className="space-y-2 pt-1">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200"></div>
                  <span className="absolute bg-white px-2 text-[10px] font-semibold text-slate-400">
                    or sign up with
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2.5">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleSocialClick('Google')}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Sign up with Google"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    onClick={() => handleSocialClick('Apple')}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Sign up with Apple"
                  >
                    <svg className="w-3.5 h-3.5 fill-slate-900" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.85-12.03-14.3-6.03-8.99-10.8-19.14-14.3-30.47-3.5-11.33-5.25-22.13-5.25-32.4 0-14.65 3.63-26.68 10.89-36.1 7.26-9.42 16.32-14.24 27.17-14.48 4.8 0 10.15 1.25 16.06 3.75 5.91 2.5 9.87 3.82 11.89 3.96 1.76-.23 5.86-1.59 12.3-4.08 6.44-2.49 12.04-3.61 16.8-3.36 12.56.64 22.56 4.85 29.98 12.63-10.97 6.64-16.33 15.65-16.08 27.02.26 8.92 3.69 16.27 10.29 22.04 6.6 5.77 14.33 9.07 23.19 9.9-2.14 6.37-4.73 12.7-7.77 18.99zM119.22 31.8c0-7.1 2.57-13.79 7.71-20.08 5.14-6.28 11.66-10.27 19.56-11.96.22 1.48.33 2.76.33 3.84 0 7.02-2.6 13.7-7.81 20.04-5.21 6.34-11.8 10.28-19.79 11.81z" />
                    </svg>
                  </button>

                  {/* Discord */}
                  <button
                    type="button"
                    onClick={() => handleSocialClick('Discord')}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Sign up with Discord"
                  >
                    <svg className="w-3.5 h-3.5 fill-[#5865F2]" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer Security / Privacy Guarantee (Sign In) */}
          {authMode === 'signin' && (
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 text-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
              <span>Your data is safe with us. We never share your personal information.</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AuthPage;
