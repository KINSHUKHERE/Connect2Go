import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  CheckCheck, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
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
  MessageCircle,
  X,
  Check,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { getSafeAvatar } from '../utils/imageUtils.js';

export function MessagesPage({ onNavigate, onOpenSafety, onOpenReport }) {
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    activeConversation, 
    sendMessage, 
    sendTypingNotification,
    partnerTyping,
    requestIdentityReveal,
    cancelIdentityRevealRequest,
    respondIdentityReveal,
    updateHandshakeState, 
    markConversationAsRead,
    getConvUnreadCount,
    deleteConversation,
    clearConversationMessages
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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, conversationId: null, peerName: '' });
  const [clearModal, setClearModal] = useState({ isOpen: false, conversationId: null, peerName: '' });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, conversationId: null, peerName: '' });
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      setHeaderMenuOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (activeConversationId && activeConversation) {
      markConversationAsRead(activeConversationId);
    }
  }, [activeConversationId, activeConversation?.id, activeConversation?.messages?.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Pressing Esc key closes open chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveConversationId(null);
        setMobileView('list');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveConversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConversation.id, inputText);
    setInputText('');
  };

  const handleInitiateReveal = () => {
    if (activeConversation?.id) {
      requestIdentityReveal(activeConversation.id);
    }
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

  const isRevealed = activeConversation?.handshakeState === 'revealed' || activeConversation?.isRevealed;
  const handshakeState = activeConversation?.handshakeState || 'masked';
  const peerName = isRevealed ? (activeConversation?.realPeerName || activeConversation?.peerName || 'Partner') : (activeConversation?.peerName || activeConversation?.anonymousAlias || 'Partner');
  const peerAvatar = isRevealed ? getSafeAvatar(peerName, activeConversation?.realPeerAvatar || activeConversation?.peerAvatar) : getSafeAvatar(peerName, activeConversation?.peerAvatar || '');
  const anonymousAlias = peerName;

  return (
    <div className="w-full h-[calc(100vh-85px)] sm:h-[calc(100vh-95px)] min-h-[420px] max-h-[calc(100vh-85px)] flex flex-col text-left overflow-hidden">
      {/* Main Full-Page WhatsApp-Style Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-border/90 shadow-soft flex overflow-hidden">
        
        {/* Left Sidebar: Conversation List */}
        <div className={`w-full sm:w-72 md:w-80 lg:w-80 xl:w-96 shrink-0 border-r border-border/80 flex flex-col bg-slate-50/50 ${
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
                const convRevealed = conv.isRevealed || conv.handshakeState === 'revealed';
                const displayName = convRevealed ? (conv.realPeerName || conv.peerName) : (conv.peerName || conv.anonymousAlias);
                const avatar = convRevealed ? getSafeAvatar(displayName, conv.realPeerAvatar || conv.peerAvatar) : getSafeAvatar(displayName, conv.peerAvatar || '');

                const actualUnreadCount = getConvUnreadCount(conv);

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      markConversationAsRead(conv.id);
                      setMobileView('chat');
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        conversationId: conv.id,
                        peerName: displayName
                      });
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-100/60 ${
                      isSelected 
                        ? 'bg-slate-200/90 shadow-2xs' 
                        : 'hover:bg-slate-100/80 bg-transparent'
                    }`}
                  >
                    {/* Avatar & Online Dot */}
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs bg-slate-100"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00a884] ring-2 ring-white" />
                      )}
                    </div>

                    {/* Middle: Name & Last Message */}
                    <div className="flex-1 min-w-0 py-0.5 space-y-1">
                      <h4 className={`text-xs sm:text-sm truncate leading-tight ${isSelected ? 'font-extrabold text-[#00a884]' : 'font-bold text-dark-text'}`}>
                        {displayName}
                      </h4>

                      {partnerTyping && (isSelected || conv.id === activeConversationId) ? (
                        <p className="text-[11px] text-[#00a884] font-bold animate-pulse flex items-center gap-1 leading-tight">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping shrink-0" />
                          <span>typing...</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 leading-tight">
                          {lastMsg.sender === 'me' && (
                            <CheckCheck className={`w-3.5 h-3.5 shrink-0 ${lastMsg.isRead ? 'text-[#53bdeb]' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate">{lastMsg.text || 'No messages yet'}</span>
                        </p>
                      )}
                    </div>

                    {/* Right: Timestamp & Unread Badge */}
                    <div className="flex flex-col items-end justify-between py-0.5 shrink-0 min-w-[50px] self-stretch">
                      <span className={`text-[10px] sm:text-[11px] transition-colors ${
                        actualUnreadCount > 0 ? 'text-[#00a884] font-bold' : 'text-dark-faint font-medium'
                      }`}>
                        {lastMsg.time}
                      </span>

                      {actualUnreadCount > 0 ? (
                        <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#00a884] text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs mt-1">
                          {actualUnreadCount}
                        </span>
                      ) : (
                        <span className="h-[18px]" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  {searchQuery ? <Search className="w-5 h-5" /> : <MessageCircle className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-dark-text">
                    {searchQuery ? 'No chats found' : 'No active chats'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {searchQuery 
                      ? `No conversations matching "${searchQuery}"`
                      : 'Join an activity or connect with nearby members to start chatting!'}
                  </p>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-[#00a884] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Main Chat Thread Area */}
        <div className={`flex-1 flex flex-col bg-slate-50/40 ${
          mobileView === 'list' ? 'hidden sm:flex' : 'flex'
        }`}>
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3.5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-[#00a884] flex items-center justify-center shadow-2xs">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-extrabold text-dark-text tracking-tight">No Chat Open</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Select a conversation from the left sidebar to start messaging. Press <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 border border-slate-300 rounded text-slate-700">Esc</kbd> anytime to close active chat.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate && onNavigate('/')}
                className="text-xs font-bold shadow-xs"
              >
                Explore Nearby Activities
              </Button>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="p-3 sm:p-4 border-b border-border/80 bg-white flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Back to list on mobile */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="sm:hidden p-1 text-dark-muted hover:text-dark-text shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm ring-2 ${
                      isRevealed ? 'ring-emerald-500/40 bg-emerald-50' : 'ring-purple-200 bg-purple-100 text-purple-700'
                    }`}>
                      {isRevealed ? (
                        <img
                          src={peerAvatar}
                          alt={peerName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      )}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ring-2 ring-white ${
                      activeConversation?.online ? 'bg-[#00a884]' : 'bg-slate-400'
                    }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                      <h3 className="text-xs sm:text-sm font-extrabold text-dark-text tracking-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]">
                        {isRevealed ? peerName : anonymousAlias}
                      </h3>
                      <Badge variant={isRevealed ? 'mint' : 'anon'} size="sm" className="shrink-0 text-[10px] px-1.5 py-0.5">
                        {isRevealed ? '✓ Verified' : 'Masked'}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-dark-faint flex items-center gap-1 truncate max-w-[150px] sm:max-w-xs mt-0.5">
                      {partnerTyping ? (
                        <span className="text-[#00a884] font-extrabold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping shrink-0" />
                          <span>typing...</span>
                        </span>
                      ) : (
                        <>
                          <span className="shrink-0">{activeConversation?.online ? 'Online now' : 'Last seen recently'}</span>
                          <span>•</span>
                          <span className="truncate">{activeConversation?.activityTitle}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Top Right Action Controls */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {isRevealed ? (
                    <button
                      onClick={() => setShowProfileCard(!showProfileCard)}
                      className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-colors shrink-0"
                    >
                      {showProfileCard ? 'Hide Verified' : 'View Verified Info'}
                    </button>
                  ) : handshakeState === 'requested_by_me' ? (
                    <button
                      onClick={() => cancelIdentityRevealRequest(activeConversation.id)}
                      className="text-[10px] sm:text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                      title="Click to cancel reveal request"
                    >
                      <X className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cancel Request</span>
                    </button>
                  ) : handshakeState === 'requested_by_peer' ? (
                    <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                      <span>Respond Below</span>
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleInitiateReveal}
                      icon={Sparkles}
                      className="text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 font-bold shadow-xs shrink-0"
                    >
                      Request Reveal
                    </Button>
                  )}

                  {/* 3-Dot Options Dropdown Menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeaderMenuOpen(!headerMenuOpen);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-dark-text hover:bg-slate-100 transition-colors"
                      title="Chat options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                {headerMenuOpen && (
                  <div 
                    className="absolute right-0 top-10 z-40 w-48 bg-white border border-border rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        setClearModal({
                          isOpen: true,
                          conversationId: activeConversation.id,
                          peerName: isRevealed ? peerName : anonymousAlias
                        });
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clear Chat</span>
                    </button>

                    <button
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        if (onOpenReport) onOpenReport(peerName);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Report User</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        setDeleteModal({
                          isOpen: true,
                          conversationId: activeConversation.id,
                          peerName: isRevealed ? peerName : anonymousAlias
                        });
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Chat</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveConversationId(null);
                  setMobileView('list');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-dark-text hover:bg-slate-100 transition-colors ml-1"
                title="Close Chat (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dual Reveal Handshake Status Ribbon (Only shown when requested or revealed) */}
          {handshakeState === 'requested_by_me' && (
            <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200 text-amber-900 transition-all">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                  <span className="text-[11px] font-bold">
                    Handshake sent! Waiting for {peerName.split(' ')[0]} to accept...
                  </span>
                </div>
                <button
                  onClick={() => cancelIdentityRevealRequest(activeConversation.id)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}



          {/* Inline Identity Reveal Popup Window inside Chat Box */}
          {handshakeState === 'requested_by_peer' && (
            <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-purple-100/90 to-indigo-50 border-2 border-purple-300 shadow-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-purple-950 flex items-center gap-1.5">
                    <span>Identity Reveal Request Received!</span>
                  </h4>
                  <p className="text-xs text-purple-900 leading-relaxed">
                    <strong className="font-bold">{peerName}</strong> wants to reveal real identities with you. If you accept, both your full name, verified photo, and contact details will be shared.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => respondIdentityReveal(activeConversation.id, true)}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept & Reveal</span>
                    </button>
                    <button
                      onClick={() => respondIdentityReveal(activeConversation.id, false)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <span>{activeConversation?.peerRating ? `${activeConversation.peerRating} ★ (${activeConversation?.peerMeetups || 1} Meetups)` : 'Verified Partner (New)'}</span>
                </span>
              </div>
            </div>
          )}

          {/* Scrollable Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="text-center my-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50/90 px-3.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                🔒 Automated 48-Hour Auto-Delete & Safety Guard
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
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${m.isRead ? 'text-[#53bdeb]' : 'text-slate-300'}`} />
                    )}
                  </span>
                </div>
              );
            })}
            {partnerTyping && (
              <div className="px-4 py-1.5 bg-emerald-50 text-[11px] text-emerald-800 font-bold flex items-center gap-2 border-t border-emerald-100 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{partnerTyping} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder={isRevealed ? "Type a message..." : "Type a safe anonymous message..."}
              value={inputText}
              onChange={(e) => {
                const val = e.target.value;
                setInputText(val);
                if (activeConversationId) {
                  sendTypingNotification(activeConversationId, val.length > 0);
                }
              }}
              className="flex-1 h-11 px-4 text-xs sm:text-sm bg-slate-50 border border-border rounded-full focus:outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 transition-all"
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shrink-0 shadow-soft transition-transform active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          </>
        )}

        </div>

      </div>

      {/* Clear Chat Confirmation Modal */}
      {clearModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-text/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-dark-text">Clear Chat Messages?</h3>
                <p className="text-xs text-dark-muted">Messages will be cleared for everyone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to clear all message history with <strong className="font-bold text-dark-text">{clearModal.peerName}</strong>? Sent & received messages will be permanently deleted from database.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearModal({ isOpen: false, conversationId: null, peerName: '' })}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  const targetId = clearModal.conversationId;
                  setClearModal({ isOpen: false, conversationId: null, peerName: '' });
                  if (targetId) {
                    await clearConversationMessages(targetId);
                  }
                }}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              >
                Clear Messages
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-text/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-dark-text">Delete Conversation?</h3>
                <p className="text-xs text-dark-muted">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this chat with <strong className="font-bold text-dark-text">{deleteModal.peerName}</strong>? All messages will be permanently deleted from the database.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ isOpen: false, conversationId: null, peerName: '' })}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const targetId = deleteModal.conversationId;
                  setDeleteModal({ isOpen: false, conversationId: null, peerName: '' });
                  if (targetId) {
                    await deleteConversation(targetId);
                  }
                }}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Delete Chat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Right-Click Context Menu for Sidebar Chat Items */}
      {contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-48 bg-white border border-border rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 truncate">
            {contextMenu.peerName}
          </div>
          <button
            onClick={() => {
              const targetId = contextMenu.conversationId;
              const name = contextMenu.peerName;
              setContextMenu((prev) => ({ ...prev, visible: false }));
              setClearModal({ isOpen: true, conversationId: targetId, peerName: name });
            }}
            className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Clear Chat</span>
          </button>
          <button
            onClick={() => {
              const targetId = contextMenu.conversationId;
              const name = contextMenu.peerName;
              setContextMenu((prev) => ({ ...prev, visible: false }));
              setDeleteModal({ isOpen: true, conversationId: targetId, peerName: name });
            }}
            className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Chat</span>
          </button>
        </div>
      )}

    </div>
  );
}

export default MessagesPage;
