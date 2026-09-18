import React from 'react';
import { 
  Compass, 
  PlusCircle, 
  Calendar, 
  Heart, 
  Shield, 
  ShieldAlert, 
  ExternalLink, 
  FileText, 
  Lock, 
  Sparkles,
  MapPin
} from 'lucide-react';

export function Footer({ 
  onNavigate, 
  onSelectTab, 
  onOpenCreate, 
  onOpenTerms, 
  onOpenPrivacy, 
  onComingSoon 
}) {
  return (
    <footer className="w-full bg-white border-t border-border/80 text-dark-text mt-16 transition-all">
      {/* Upper Footer Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Col 1: Brand & Tagline (4 cols) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div 
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group inline-flex"
            >
              <img 
                src="/favicon.png" 
                alt="Connect2Go Logo" 
                className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition-transform" 
              />
              <span className="text-xl font-extrabold tracking-tight text-dark-text">
                Connect<span className="text-brand-500">2Go</span>
              </span>
            </div>

            <p className="text-xs font-semibold text-brand-700 tracking-wide uppercase">
              "People Nearby. Activities Together."
            </p>

            <p className="text-xs text-dark-muted leading-relaxed max-w-sm">
              A community + activity partner discovery platform. Helping real people connect nearby for sports, study, hobbies, fitness, and real-world hangouts — safe, anonymous-first, and zero doomscrolling.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-800 text-[11px] font-bold rounded-full border border-brand-200/70">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Real-World Connections • Jaipur & Beyond</span>
            </div>
          </div>

          {/* Col 2: Quick Discovery Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="text-xs font-bold text-dark-text tracking-wider uppercase">Discover</h4>
            <ul className="space-y-2 text-xs font-medium text-dark-muted">
              <li>
                <button 
                  onClick={() => onSelectTab('home')}
                  className="hover:text-brand-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('explore')}
                  className="hover:text-brand-600 transition-colors"
                >
                  Explore Activities
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenCreate}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1 text-brand-600 font-bold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Host an Activity</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('matches')}
                  className="hover:text-brand-600 transition-colors"
                >
                  Matched Peers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('my-activities')}
                  className="hover:text-brand-600 transition-colors"
                >
                  My Activities
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust, Legal & Admin (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-bold text-dark-text tracking-wider uppercase">Platform & Safety</h4>
            <ul className="space-y-2 text-xs font-medium text-dark-muted">
              <li>
                <button 
                  onClick={() => onSelectTab('safety')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-brand-600" />
                  <span>Safety & Trust Center</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenTerms}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPrivacy}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              
              {/* Temporary Admin Quick Access Link */}
              <li className="pt-2">
                <a
                  href="/admin"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/admin');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-102"
                  title="Direct access to Admin Management Panel"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-brand-400" />
                  <span>Admin Control Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <p className="text-[10px] text-dark-faint mt-1 pl-1">
                  *Temporary direct navigation link
                </p>
              </li>
            </ul>
          </div>

          {/* Col 4: Creator / Developer Profile (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5 text-left bg-slate-50/80 p-5 rounded-2xl border border-border/80">
            <div>
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Created & Designed By
              </span>
              <h3 className="text-base font-extrabold text-dark-text mt-1.5">
                Kinshuk Khandelwal
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">
                Full-Stack & Product Engineer
              </p>
            </div>

            <p className="text-[11px] text-dark-muted leading-relaxed">
              Passionate about creating modern, community-driven web platforms that connect real people in the physical world.
            </p>

            {/* Social Links */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {/* LinkedIn Button */}
              <a
                href="https://www.linkedin.com/in/kinshuk-khandelwal-43024b290/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.87 0-1.57.7-1.57 1.57 0 .87.7 1.57 1.57 1.57.87 0 1.57-.7 1.57-1.57 0-.87-.7-1.57-1.57-1.57Z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* GitHub Button */}
              <a
                href="https://github.com/KINSHUKHERE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="w-full border-t border-border/70 py-6 px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dark-muted pb-24 sm:pb-6">
        <p>
          © 2026 <span className="font-bold text-dark-text">Connect2Go</span>. Developed with care by{' '}
          <a
            href="https://www.linkedin.com/in/kinshuk-khandelwal-43024b290/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-600 hover:underline"
          >
            Kinshuk Khandelwal
          </a>
          .
        </p>

        <div className="flex items-center gap-4 text-[11px] font-medium text-dark-faint">
          <span>Anti-Doomscroll</span>
          <span>•</span>
          <span>Anonymous-First</span>
          <span>•</span>
          <span>Physical Meetups Only</span>
        </div>
      </div>
    </footer>
  );
}
