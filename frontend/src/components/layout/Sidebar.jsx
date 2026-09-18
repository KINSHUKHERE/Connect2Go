import React from 'react';
import { 
  Home, 
  Compass, 
  PlusCircle, 
  MessageCircle, 
  Bell, 
  User, 
  Settings, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../ui/Badge.jsx';

export function Sidebar({ currentTab, setCurrentTab, onNavigate, onOpenCreate, onOpenChat, onComingSoon }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'create', label: 'Create Activity', icon: PlusCircle, isAction: true },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: '2', action: onOpenChat },
    { id: 'notifications', label: 'Notifications', icon: Bell, comingSoon: true },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings, comingSoon: true },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between py-6 px-4 bg-white border-r border-border/80 min-h-[calc(100vh-4rem)] select-none">
      <div className="space-y-6">
        
        {/* Navigation list */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    onOpenCreate();
                  } else if (item.action) {
                    item.action();
                  } else if (item.comingSoon) {
                    onComingSoon(item.label);
                  } else {
                    setCurrentTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-dark-muted hover:bg-slate-50 hover:text-dark-text'
                } ${item.isAction ? 'text-brand-600 hover:text-brand-700' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-dark-muted'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <Badge variant="primary" size="sm">
                    {item.badge}
                  </Badge>
                )}

                {item.comingSoon && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Panel Footer Card */}
      <div className="p-3.5 bg-slate-900 rounded-lg text-white space-y-2 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold tracking-wide">ADMIN PANEL</span>
          </div>
          <span className="text-[9px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-bold">
            Separate URL
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Manage users, moderate requests, and view platform reports.
        </p>
        <a
          href="/admin"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/admin');
            }
          }}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-bold transition-all shadow-xs"
        >
          <span>Open /admin</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}
