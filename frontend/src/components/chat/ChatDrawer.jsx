import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Send, 
  Sparkles, 
  CheckCheck, 
  Lock, 
  Unlock, 
  UserCheck, 
  Phone, 
  ExternalLink,
  Info,
  Check,
  AlertCircle,
  Trash2,
  MoreVertical,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useChat } from '../../context/ChatContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { getSafeAvatar } from '../../utils/imageUtils.js';

export function ChatDrawer({ isOpen, onClose, peer, peerName = 'Partner', onComingSoon, onOpenReport }) {
  const { 
    activeConversation, 
    sendMessage, 
    markConversationAsRead,
    openOrCreateConversationWithPeer, 
    sendTypingNotification, 
    partnerTyping,
    requestIdentityReveal,
    cancelIdentityRevealRequest,
    respondIdentityReveal,
    deleteConversation,
    clearConversationMessages
  } = useChat();

  // Resolve peer info whether passed as object or string
  const resolvedPeer = typeof peer === 'object' && peer !== null ? peer : { name: peerName };
  const realName = resolvedPeer.name || peerName || 'Partner';
  const realAvatar = getSafeAvatar(realName, resolvedPeer.avatar || '');
  const anonymousAlias = `ActivePeer #${Math.abs(realName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900 + 100)}`;

  const [showProfileCard, setShowProfileCard] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && peer) {
      openOrCreateConversationWithPeer(resolvedPeer).then((id) => {
        if (id) {
          setCurrentConvId(id);
          markConversationAsRead(id);
        }
      });
    }
  }, [isOpen, peer]);

  const activeMessages = activeConversation?.messages || [];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, isOpen]);

  // Pressing Esc key closes open chat drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetConvId = currentConvId || activeConversation?.id;
  const isRevealed = activeConversation?.isRevealed || activeConversation?.handshakeState === 'revealed';
  const handshakeState = activeConversation?.handshakeState || 'masked';
  const displayName = isRevealed 
    ? (realName || activeConversation?.realPeerName || activeConversation?.peerName || 'Partner') 
    : (activeConversation?.peerName || activeConversation?.anonymousAlias || 'Partner');
  const displayAvatar = isRevealed 
    ? getSafeAvatar(displayName, realAvatar || activeConversation?.realPeerAvatar || '') 
    : getSafeAvatar(displayName, activeConversation?.peerAvatar || '');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (targetConvId) {
      sendMessage(targetConvId, inputText);
    }
    setInputText('');
  };

  const handleInitiateReveal = () => {
    if (targetConvId) {
      requestIdentityReveal(targetConvId);
    }
  };

  const handleAcceptPeerRequest = () => {
    if (targetConvId) {
      respondIdentityReveal(targetConvId, true);
    }
  };

  const handleRejectPeerRequest = () => {
    if (targetConvId) {
      respondIdentityReveal(targetConvId, false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-dark-text/30 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-border flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-border bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ring-2 ${
                  isRevealed ? 'ring-emerald-500/40 bg-emerald-50' : 'ring-purple-200 bg-purple-100 text-purple-700'
                }`}>
                  {isRevealed ? (
                    <img 
                      src={displayAvatar} 
                      alt={displayName} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                  isRevealed ? 'bg-emerald-500' : 'bg-brand-500'
                }`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-dark-text tracking-tight">
                    {displayName}
                  </h4>
                  <Badge variant={isRevealed ? 'mint' : 'anon'} size="sm">
                    {isRevealed ? '✓ Verified' : 'Masked'}
                  </Badge>
                </div>
                <p className="text-[11px] text-dark-faint flex items-center gap-1">
                  {partnerTyping ? (
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>typing...</span>
                    </span>
                  ) : isRevealed 
                    ? '98% Community Trust • Safety Verified' 
                    : 'Personal details hidden until mutual consent'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-slate-200/60 transition-colors"
                  title="Chat options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div 
                    className="absolute right-0 top-9 z-40 w-48 bg-white border border-border rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowClearModal(true);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clear Chat</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        if (onOpenReport) onOpenReport(realName);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Report User</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteModal(true);
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
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Handshake Protocol Banner (Only rendered when requested or revealed) */}
          {handshakeState === 'requested_by_me' && (
            <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200/80 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                  <span className="text-[11px] font-bold text-amber-900">
                    Handshake Sent! Waiting for {(isRevealed ? realName : anonymousAlias).split(' ')[0]} to accept...
                  </span>
                </div>
                <button
                  onClick={() => cancelIdentityRevealRequest(targetConvId)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold transition-colors shrink-0"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}



          {/* Inline Identity Reveal Request Popup Box inside Chat Box */}
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
                    <strong className="font-bold">{isRevealed ? realName : anonymousAlias}</strong> wants to reveal real identities with you. If you accept, both your full name, verified photo, and contact details will be shared.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleAcceptPeerRequest}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept & Reveal</span>
                    </button>
                    <button
                      onClick={handleRejectPeerRequest}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unlocked Verified Profile Card (Visible when revealed and expanded) */}
          {isRevealed && showProfileCard && (
            <div className="bg-emerald-50/50 p-4 border-b border-emerald-200/60 space-y-2 text-left animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Unlocked Real Profile</span>
                </span>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  ID Verified
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {resolvedPeer.bio || `Active member of Connect2Go Jaipur. Enjoying friendly badminton matches, weekend outdoor activities, and group sports.`}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>+91 98290 412XX (Unlocked)</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <Sparkles className="w-3 h-3 text-brand-600" />
                  <span>14 Verified Activities</span>
                </span>
              </div>
            </div>
          )}

          {/* Message Bubbles Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-canvas/40">
            <div className="text-center my-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                🔒 Automated 48-Hour Auto-Delete & Safety Guard
              </span>
            </div>

            {activeMessages.length === 0 ? (
              <div className="py-16 text-center text-dark-muted space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-dark-text">Start the conversation</p>
                  <p className="text-[11px] text-dark-faint max-w-xs mx-auto">
                    Type a message below to coordinate plans and meet up safely.
                  </p>
                </div>
              </div>
            ) : (
              activeMessages.map((m) => {
              if (m.type === 'milestone') {
                return (
                  <div key={m.id} className="my-3 p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-center space-y-1 shadow-xs">
                    <p className="text-xs font-bold text-emerald-900 leading-snug">{m.text}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Safe Meetup Guidelines are now enabled.</p>
                  </div>
                );
              }

              if (m.type === 'system') {
                return (
                  <div key={m.id} className="text-center my-2">
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      {m.text}
                    </span>
                  </div>
                );
              }

              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-brand-500 text-white rounded-br-xs shadow-xs'
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
            }))}

            {partnerTyping && (
              <div className="px-3 py-1.5 bg-emerald-50 text-[11px] text-emerald-800 font-bold flex items-center gap-2 border border-emerald-200 rounded-xl animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{partnerTyping} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder={isRevealed ? "Type a message..." : "Type a safe anonymous message..."}
              value={inputText}
              onChange={(e) => {
                const val = e.target.value;
                setInputText(val);
                if (currentConvId || activeConversation?.id) {
                  sendTypingNotification(currentConvId || activeConversation?.id, val.length > 0);
                }
              }}
              className="flex-1 h-11 px-4 text-xs bg-slate-50 border border-border rounded-full focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-soft transition-transform active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>

        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearModal && (
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
              Are you sure you want to clear all message history with <strong className="font-bold text-dark-text">{isRevealed ? realName : anonymousAlias}</strong>? All sent & received messages will be permanently deleted from database.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearModal(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  setShowClearModal(false);
                  if (targetConvId) {
                    await clearConversationMessages(targetConvId);
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
      {showDeleteModal && (
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
              Are you sure you want to delete this chat with <strong className="font-bold text-dark-text">{isRevealed ? realName : anonymousAlias}</strong>? All messages will be permanently deleted from the database.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  setShowDeleteModal(false);
                  if (targetConvId) {
                    await deleteConversation(targetConvId);
                    onClose();
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
    </div>
  );
}

export default ChatDrawer;
