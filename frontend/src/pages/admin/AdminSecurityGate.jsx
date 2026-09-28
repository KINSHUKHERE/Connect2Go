import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  LogOut, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle,
  Mail,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminSecurityGate({ reason = 'unauthenticated', user, onSignOut, onBackToHome }) {
  const isUnauthenticated = reason === 'unauthenticated';
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState('herekinshuk@gmail.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter administrator email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signInWithEmail(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-brand-500/30 selection:text-white">
      
      {/* Security Ambient Background Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Security Container Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Badge & Security Icon */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Connect2Go Admin Portal</span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-emerald-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-lg shadow-brand-500/10">
            {isUnauthenticated ? (
              <Lock className="w-7 h-7 stroke-[2.2]" />
            ) : (
              <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isUnauthenticated ? 'Administrator Sign In' : '403 — Access Denied'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isUnauthenticated ? (
              'Authenticate with platform administrator credentials to access the Operations Hub.'
            ) : (
              <span>
                Signed in as <strong className="text-white">{user?.name || user?.email}</strong>. This account does not hold administrator clearance.
              </span>
            )}
          </p>
        </div>

        {/* Direct Admin Login Form (n8n Style Direct Authentication) */}
        {isUnauthenticated ? (
          <form onSubmit={handleAdminLogin} className="space-y-4 text-left pt-1">
            {errorMsg && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Administrator Email / Username
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="herekinshuk@gmail.com"
                  className="w-full h-11 pl-10 pr-4 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder:text-slate-600 rounded-xl text-xs font-semibold outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder:text-slate-600 rounded-xl text-xs font-semibold outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full h-11 bg-red-600/80 hover:bg-red-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch to Admin Account</span>
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
          <span>Connect2Go Zero-Trust Operations Hub</span>
        </div>

      </div>

    </div>
  );
}

export default AdminSecurityGate;
