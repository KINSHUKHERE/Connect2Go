import React from 'react';
import { Home, Compass, Plus, MessageCircle, Settings } from 'lucide-react';

export function BottomNavigation({ currentTab, setCurrentTab, onOpenCreate, onOpenChat }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-border/80 px-3 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setCurrentTab('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          currentTab === 'home' ? 'text-brand-600 font-bold' : 'text-dark-muted'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[11px] font-medium">Home</span>
      </button>

      <button
        onClick={() => setCurrentTab('explore')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          currentTab === 'explore' ? 'text-brand-600 font-bold' : 'text-dark-muted'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[11px] font-medium">Explore</span>
      </button>

      {/* Center Create Button */}
      <button
        onClick={onOpenCreate}
        className="w-12 h-12 -mt-5 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 active:scale-95 transition-transform"
        title="Create Activity"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={() => setCurrentTab('messages')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors relative ${
          currentTab === 'messages' ? 'text-brand-600 font-bold' : 'text-dark-muted'
        }`}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-[11px] font-medium">Chat</span>
        <span className="absolute top-1 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
      </button>

      <button
        onClick={() => setCurrentTab('settings')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          currentTab === 'settings' ? 'text-brand-600 font-bold' : 'text-dark-muted'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[11px] font-medium">Settings</span>
      </button>
    </nav>
  );
}
