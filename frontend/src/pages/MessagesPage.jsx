import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  CheckCheck, 
  Shield, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Unlock, 
  UserCheck, 
  Phone, 
  MapPin, 
  MoreVertical, 
  ArrowLeft,
  Smile,
  AlertCircle,
  X
} from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar } from '../utils/imageUtils.js';

export function MessagesPage({ onNavigate, onOpenSafety }) {
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    activeConversation, 
    sendMessage, 
    updateHandshakeState, 
    markConversationAsRead 
  } = useChat();

  if (!user) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto text-2xl shadow-soft">
          <Lock className="w-8 h-8 text-brand-600" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-dark-text tracking-tight">
            Sign In to Access Messages
          </h2>
          <p className="text-xs sm:text-sm text-dark-muted max-w-md mx-auto leading-relaxed">
            Direct partner chat, real-time messaging, and the privacy reveal handshake are reserved for verified community members.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => onNavigate && onNavigate('/login')}
            className="font-bold text-xs shadow-xs"
          >
            Sign In to Start Chatting
          </Button>
        </div>
      </div>
    );
  }

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [mobileView, setMobileView] = useState('chat'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeConversationId) {
      markConversationAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConversation.id, inputText);
    setInputText('');
  };

  const handleInitiateReveal = () => {
    updateHandshakeState(activeConversation.id, 'requested_by_me');
    setTimeout(() => {
      completeHandshake();
    }, 2200);
  };

  const completeHandshake = () => {
    updateHandshakeState(activeConversation.id, 'revealed');
    setShowProfileCard(true);
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredConversations = conversations.filter((c) => {
    if (!q) return true;
    const peerMatch = c.peerName?.toLowerCase().includes(q);
    const activityMatch = c.activityTitle?.toLowerCase().includes(q);
    const messageMatch = c.messages?.some((m) => m.text?.toLowerCase().includes(q));
    return peerMatch || activityMatch || messageMatch;
  });

  const isRevealed = activeConversation?.handshakeState === 'revealed';
  const handshakeState = activeConversation?.handshakeState || 'masked';
  const peerName = activeConversation?.peerName || 'Partner';
  const peerAvatar = getSafeAvatar(peerName, activeConversation?.peerAvatar);
  const anonymousAlias = `ActivePeer #${Math.abs(peerName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900 + 100)}`;

  return (
    <div className="w-full h-[calc(100vh-105px)] min-h-[620px] flex flex-col text-left">
      {/* Main Full-Page WhatsApp-Style Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-border/90 shadow-soft flex overflow-hidden">
        
        {/* Left Sidebar: Conversation List */}
        <div className={`w-full sm:w-80 md:w-96 border-r border-border/80 flex flex-col bg-slate-50/50 ${
          mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
        }`}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/70 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-dark-text tracking-tight flex items-center gap-2">
                <span>Chats</span>
                <span className="text-xs font-bold text-[#00a884] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {conversations.length}
                </span>
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chats, contacts, or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 text-xs bg-slate-100 border border-transparent focus:border-[#00a884] focus:bg-white rounded-xl focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-dark-text p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                const lastMsg = conv.messages[conv.messages.length - 1] || { text: '', time: '' };
                const avatar = getSafeAvatar(conv.peerName, conv.peerAvatar);

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setMobileView('chat');
                    }}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-50/70 border-l-4 border-l-[#00a884]' 
                        : 'hover:bg-slate-100/70 bg-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt={conv.peerName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs bg-slate-100"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs truncate ${isSelected ? 'font-extrabold text-[#00a884]' : 'font-bold text-dark-text'}`}>
                          {conv.peerName}
                        </h4>
                        <span className="text-[10px] text-dark-faint shrink-0">
                          {lastMsg.time}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        {lastMsg.sender === 'me' && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                        )}
                        <span className="truncate">{lastMsg.text}</span>
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 truncate">
                          {conv.activityTitle}
                        </span>
                      </div>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-dark-text">No chats found</p>
                  <p className="text-[11px] text-slate-400">No conversations or messages matching "{searchQuery}"</p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-[#00a884] hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Main Chat Thread Area */}
        <div className={`flex-1 flex flex-col bg-slate-50/40 ${
          mobileView === 'list' ? 'hidden sm:flex' : 'flex'
        }`}>
          
          {/* Active Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-border/80 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to list on mobile */}
              <button
                onClick={() => setMobileView('list')}
                className="sm:hidden p-1 text-dark-muted hover:text-dark-text"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ring-2 ${
                  isRevealed ? 'ring-emerald-500/40 bg-emerald-50' : 'ring-purple-200 bg-purple-100 text-purple-700'
                }`}>
                  {isRevealed ? (
                    <img
                      src={peerAvatar}
                      alt={peerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                  activeConversation?.online ? 'bg-[#00a884]' : 'bg-slate-400'
                }`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-dark-text tracking-tight">
                    {isRevealed ? peerName : anonymousAlias}
                  </h3>
                  <Badge variant={isRevealed ? 'mint' : 'anon'} size="sm">
                    {isRevealed ? '✓ Verified' : 'Masked'}
                  </Badge>
                </div>
                <p className="text-[11px] text-dark-faint flex items-center gap-1.5">
                  <span>{activeConversation?.online ? 'Online now' : 'Last seen recently'}</span>
                  <span>•</span>
                  <span>{activeConversation?.activityTitle}</span>
                </p>
              </div>
            </div>

            {/* Top Right Action Controls */}
            <div className="flex items-center gap-2">
              {isRevealed ? (
                <button
                  onClick={() => setShowProfileCard(!showProfileCard)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  {showProfileCard ? 'Hide Verified Info' : 'View Verified Info'}
                </button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleInitiateReveal}
                  icon={Sparkles}
                  className="text-xs font-bold shadow-xs"
                >
                  Request Reveal
                </Button>
              )}
            </div>
          </div>

          {/* Dual Reveal Handshake Status Ribbon */}
          <div className={`px-4 py-2.5 border-b transition-all ${
            isRevealed
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              : handshakeState === 'requested_by_me'
              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
              : 'bg-brand-50/80 border-brand-200/70 text-brand-900'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                {isRevealed ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-brand-600 shrink-0" />
                )}
                <span className="text-[11px]">
                  {isRevealed
                    ? 'Dual Reveal Handshake Complete! Real contact & verified identity unlocked.'
                    : handshakeState === 'requested_by_me'
                    ? `Handshake sent! Waiting for ${peerName.split(' ')[0]} to accept...`
                    : 'Personal details hidden. Tap "Request Reveal" to share verified contact details.'}
                </span>
              </div>

              {handshakeState === 'requested_by_me' && (
                <button
                  onClick={completeHandshake}
                  className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Simulate Accept
                </button>
              )}
            </div>
          </div>

          {/* Unlocked Profile Card (when revealed) */}
          {isRevealed && showProfileCard && (
            <div className="bg-emerald-50/40 p-4 border-b border-emerald-200/70 space-y-2 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Unlocked Verified Credentials</span>
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Community Member
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Active member in Jaipur. Committed to safe, positive offline activity meetups.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91 98290 412XX</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>4.9 ★ (18 Meetups)</span>
                </span>
              </div>
            </div>
          )}

          {/* Scrollable Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="text-center my-2">
              <span className="text-[10px] font-semibold text-dark-faint bg-white/90 px-3 py-1 rounded-full border border-border/80 shadow-2xs">
                🔒 Protected by Connect2Go Anonymous Safety Guard
              </span>
            </div>

            {activeConversation?.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#00a884] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-dark-text border border-border/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-dark-faint mt-1 px-1 flex items-center gap-1">
                    {m.time}
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#00a884]" />}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder={isRevealed ? "Type a message..." : "Type a safe anonymous message..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 h-11 px-4 text-xs sm:text-sm bg-slate-50 border border-border rounded-full focus:outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 transition-all"
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shrink-0 shadow-soft transition-transform active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

export default MessagesPage;
