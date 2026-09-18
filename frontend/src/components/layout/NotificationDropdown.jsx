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

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'handshake',
    title: 'Reveal Identity Request',
    description: 'Rohan Sharma wants to complete the Dual Reveal Handshake for Badminton Session.',
    time: '12m ago',
    unread: true,
    actionType: 'chat',
    peer: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      interests: ['Badminton', 'Running', 'Fitness'],
      distanceKm: 0.8,
    }
  },
  {
    id: 'n2',
    type: 'join',
    title: 'Partner Joined Activity',
    description: 'Aarav Patel joined your "React & GenAI Coding Sprint" at Malviya Nagar.',
    time: '42m ago',
    unread: true,
    actionType: 'activity'
  },
  {
    id: 'n3',
    type: 'match',
    title: 'High Compatibility Match (95%)',
    description: 'Priya Sharma is also looking for an evening running partner within 1.2 km.',
    time: '2h ago',
    unread: true,
    actionType: 'matches'
  },
  {
    id: 'n4',
    type: 'safety',
    title: 'Privacy Fuzzing Active',
    description: 'Your location is protected with ~400m neighbourhood jitter for public listings.',
    time: '5h ago',
    unread: false,
    actionType: 'settings'
  }
];

export function NotificationDropdown({ onOpenChat, onSelectTab, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('connect2go_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const containerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('connect2go_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

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
    // Mark this one as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setIsOpen(false);

    if (notif.actionType === 'chat' && onOpenChat) {
      onOpenChat(notif.peer || { name: 'Rohan Sharma' });
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
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full border border-border/80 flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-slate-50 transition-colors relative"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-border/90 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Top Bar */}
          <div className="px-4 py-3 border-b border-border/70 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-dark-text">Activity Alerts</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-dark-muted space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[11px] text-dark-faint">Activity joins and reveal handshakes will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    n.unread ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs truncate ${n.unread ? 'font-bold text-dark-text' : 'font-medium text-slate-700'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-dark-faint shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                    {n.actionType === 'chat' && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline">
                        <MessageCircle className="w-3 h-3" />
                        <span>View Chat Handshake →</span>
                      </div>
                    )}
                  </div>

                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-border/70 text-center">
            <span className="text-[10px] font-semibold text-dark-faint">
              Protected by Connect2Go Trust & Safety Protocol
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
