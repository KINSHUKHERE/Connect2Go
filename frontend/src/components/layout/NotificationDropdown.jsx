import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Users, 
  Heart, 
  ShieldCheck, 
  Check, 
  Trash2, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export function NotificationDropdown({ onOpenChat, onSelectTab, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const containerRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setIsOpen(false);

    if (notif.actionType === 'chat' && onOpenChat) {
      onOpenChat(notif.peer || { name: 'Partner' });
    } else if (notif.actionType === 'matches' && onSelectTab) {
      onSelectTab('matches');
    } else if (notif.actionType === 'activity' && onSelectTab) {
      onSelectTab('my-activities');
    } else if (notif.actionType === 'settings' && onOpenSettings) {
      onOpenSettings();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'handshake':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'join':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'match':
        return <Heart className="w-4 h-4 text-brand-600 fill-brand-100" />;
      case 'safety':
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl border transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs ring-2 ring-brand-100'
            : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-2xs hover:shadow-xs'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-50 via-white to-brand-50/40 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                  0 Unread
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600" /> Read all
                </button>
                <button
                  onClick={clearAll}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* List or Empty State */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/80">
            {notifications.length === 0 ? (
              <div className="py-10 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto shadow-xs">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-800">
                    No notifications yet
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Activity requests, mutual matches, and safety alerts will appear here in real-time.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 flex items-start gap-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    n.unread ? 'bg-brand-50/50 border-l-4 border-l-brand-500' : ''
                  }`}
                >
                  <div className="p-2 rounded-2xl bg-slate-100/80 border border-slate-200/60 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {n.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
