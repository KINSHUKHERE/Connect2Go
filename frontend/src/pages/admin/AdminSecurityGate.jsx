import React from 'react';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  LogOut, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

export function AdminSecurityGate({ reason = 'unauthenticated', user, onSignInAdmin, onSignOut, onBackToHome }) {
  const isUnauthenticated = reason === 'unauthenticated';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-red-500/30 selection:text-white">
      
      {/* Security Ambient Background Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Security Container Card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Badge & Security Icon */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-500/15 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Connect2Go Security Protocol</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
            {isUnauthenticated ? (
              <Lock className="w-8 h-8 stroke-[2.2]" />
            ) : (
              <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isUnauthenticated ? 'Administrator Access Required' : '403 — Access Denied'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {isUnauthenticated ? (
              'The Operations Hub is restricted to verified Connect2Go platform administrators. Please authenticate with administrator credentials to proceed.'
            ) : (
              <span>
                You are currently signed in as <strong className="text-white">{user?.name || user?.email}</strong>. This account does not hold administrative clearance.
              </span>
            )}
          </p>
        </div>

        {/* Audit Log Warning Notice */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-2.5 text-left text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-200 text-[11px]">Zero-Trust Security Active</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Unauthorized access attempts to the administrative hub are monitored and logged for platform audit compliance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {isUnauthenticated ? (
            <button
              type="button"
              onClick={onSignInAdmin}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Administrator</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignOut}
              className="w-full h-11 bg-red-600/80 hover:bg-red-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToHome}
            className="w-full h-11 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-300 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Connect2Go Homepage</span>
          </button>
        </div>

        {/* Security Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Connect2Go Platform Protection System</span>
        </div>

      </div>

    </div>
  );
}

export default AdminSecurityGate;
