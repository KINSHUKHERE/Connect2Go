import React, { useState, useRef } from 'react';
import { 
  MessageCircle, 
  CheckCheck, 
  Sparkles, 
  Shield, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { getSafeAvatar } from '../../utils/imageUtils.js';

export function MessageDropdown({ onOpenMessagesPage }) {
  const { conversations, totalUnreadMessages, repliedChatsCount, setActiveConversationId, markConversationAsRead } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const displayBadgeCount = repliedChatsCount > 0 ? repliedChatsCount : totalUnreadMessages;

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversationId(conv.id);
    markConversationAsRead(conv.id);
    setIsOpen(false);
    if (onOpenMessagesPage) {
      onOpenMessagesPage();
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navbar Chat Trigger Button */}
      <button
        onClick={() => {
          if (isOpen) {
            onOpenMessagesPage();
          } else {
            setIsOpen(true);
          }
        }}
        className="w-9 h-9 rounded-full border border-border/80 flex items-center justify-center text-dark-muted hover:text-brand-600 hover:bg-brand-50/60 transition-colors relative group"
        title="WhatsApp-style Messages & Chats"
        aria-label="Open Messages"
        aria-expanded={isOpen}
      >
        <MessageCircle className="w-4 h-4 text-slate-700 group-hover:text-brand-600 transition-colors" />
        {displayBadgeCount > 0 ? (
          <span 
            className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] bg-[#00a884] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-xs animate-pulse"
            title={`${displayBadgeCount} chats with replies`}
          >
            {displayBadgeCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-white" />
        )}
      </button>

      {/* WhatsApp-Style Popup */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-border/90 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/70 bg-[#00a884]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00a884] animate-pulse" />
              <h3 className="text-xs sm:text-sm font-extrabold text-dark-text tracking-tight">Chats</h3>
              {totalUnreadMessages > 0 && (
                <span className="text-[10px] font-bold bg-[#00a884] text-white px-2 py-0.5 rounded-full">
                  {totalUnreadMessages} unread
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenMessagesPage();
              }}
              className="text-[11px] font-bold text-[#00a884] hover:underline inline-flex items-center gap-0.5"
            >
              <span>Open in Full Page</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* WhatsApp-style Chats List */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1] || { text: 'No messages yet', time: '' };
              const isRevealed = conv.handshakeState === 'revealed';
              const avatar = getSafeAvatar(conv.peerName, conv.peerAvatar);

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3 relative ${
                    conv.unreadCount > 0 ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Avatar with Online Indicator */}
                  <div className="relative shrink-0">
                    <img
                      src={avatar}
                      alt={conv.peerName}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 bg-slate-100"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-white" />
                    )}
                  </div>

                  {/* Name, Last Message, and Time */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-dark-text truncate">
                        {conv.peerName}
                      </h4>
                      <span className={`text-[10px] shrink-0 ${conv.unreadCount > 0 ? 'text-[#00a884] font-bold' : 'text-dark-faint'}`}>
                        {lastMsg.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        {lastMsg.sender === 'me' && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                        )}
                        <span className="truncate">{lastMsg.text}</span>
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#00a884] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* WhatsApp-Style Footer */}
          <div 
            onClick={() => {
              setIsOpen(false);
              onOpenMessagesPage();
            }}
            className="p-2.5 bg-slate-50 border-t border-border/70 text-center hover:bg-slate-100/80 cursor-pointer transition-colors"
          >
            <span className="text-[11px] font-bold text-[#00a884]">
              View All Messages on Full Page →
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

export default MessageDropdown;
