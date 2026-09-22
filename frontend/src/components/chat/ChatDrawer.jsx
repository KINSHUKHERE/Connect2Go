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
  AlertCircle
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
    openOrCreateConversationWithPeer, 
    sendTypingNotification, 
    partnerTyping 
  } = useChat();

  // Resolve peer info whether passed as object or string
  const resolvedPeer = typeof peer === 'object' && peer !== null ? peer : { name: peerName };
  const realName = resolvedPeer.name || peerName || 'Partner';
  const realAvatar = getSafeAvatar(realName, resolvedPeer.avatar || '');
  const anonymousAlias = `ActivePeer #${Math.abs(realName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900 + 100)}`;

  // Handshake State: 'masked' | 'requested_by_me' | 'requested_by_peer' | 'revealed'
  const [handshakeState, setHandshakeState] = useState('masked');
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && peer) {
      openOrCreateConversationWithPeer(resolvedPeer).then((id) => {
        if (id) setCurrentConvId(id);
      });
    }
  }, [isOpen, peer]);

  const activeMessages = activeConversation?.messages || [];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, isOpen, handshakeState]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const targetId = currentConvId || activeConversation?.id;
    if (targetId) {
      sendMessage(targetId, inputText);
    }
    setInputText('');
  };

  // User initiates the Reveal Handshake
  const handleInitiateReveal = () => {
    setHandshakeState('requested_by_me');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'system',
        text: `You sent an Identity Reveal Request. Waiting for ${realName.split(' ')[0]} to accept...`,
        time: 'Just now'
      }
    ]);

    // Simulate peer accepting after 2.5s
    setTimeout(() => {
      completeHandshake();
    }, 2400);
  };

  // Trigger incoming peer request (for testing / demo)
  const handleSimulatePeerRequest = () => {
    setHandshakeState('requested_by_peer');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'system',
        text: `${realName.split(' ')[0]} requested a mutual Identity Reveal Handshake!`,
        time: 'Just now'
      }
    ]);
  };

  // Accept incoming peer handshake
  const handleAcceptPeerRequest = () => {
    completeHandshake();
  };

  // Completion logic with Confetti celebration
  const completeHandshake = () => {
    setHandshakeState('revealed');
    setShowProfileCard(true);

    // Confetti blast
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Confetti error:', e);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'milestone',
        text: '🎉 Identity Handshake Complete! Both members consented. Real identities and verified trust credentials are now unlocked.',
        time: 'Just now'
      }
    ]);
  };

  const isRevealed = handshakeState === 'revealed';

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
                      src={realAvatar} 
                      alt={realName} 
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
                    {isRevealed ? realName : anonymousAlias}
                  </h4>
                  <Badge variant={isRevealed ? 'mint' : 'anon'} size="sm">
                    {isRevealed ? '✓ Verified' : 'Masked'}
                  </Badge>
                </div>
                <p className="text-[11px] text-dark-faint flex items-center gap-1">
                  {isRevealed 
                    ? '98% Community Trust • Safety Verified' 
                    : 'Personal details hidden until mutual consent'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenReport ? onOpenReport(realName) : null}
                className="p-1.5 rounded-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                title={`Report ${realName} for safety violation`}
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Handshake Protocol Banner */}
          <div className={`px-4 py-3 border-b transition-all ${
            isRevealed 
              ? 'bg-emerald-50/90 border-emerald-200/80' 
              : handshakeState === 'requested_by_peer'
              ? 'bg-purple-50/90 border-purple-200/80'
              : handshakeState === 'requested_by_me'
              ? 'bg-amber-50/90 border-amber-200/80'
              : 'bg-brand-50/90 border-brand-200/70'
          }`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  {isRevealed ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : handshakeState === 'requested_by_me' ? (
                    <Sparkles className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                  ) : handshakeState === 'requested_by_peer' ? (
                    <Unlock className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-brand-600 shrink-0" />
                  )}

                  <div className="text-[11px] font-semibold text-dark-text leading-tight">
                    {isRevealed && (
                      <span className="text-emerald-900 font-bold">Mutual Reveal Complete! Verified profile unlocked.</span>
                    )}
                    {handshakeState === 'requested_by_me' && (
                      <span className="text-amber-900 font-bold">Handshake Sent! Waiting for {realName.split(' ')[0]} to accept...</span>
                    )}
                    {handshakeState === 'requested_by_peer' && (
                      <span className="text-purple-900 font-bold">{realName.split(' ')[0]} requested to reveal identities!</span>
                    )}
                    {handshakeState === 'masked' && (
                      <span className="text-brand-900">Ready to meet offline? Request mutual profile reveal.</span>
                    )}
                  </div>
                </div>

                {/* Main Action Buttons */}
                {handshakeState === 'masked' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleInitiateReveal}
                    className="text-[11px] h-7 px-3 shrink-0 font-bold shadow-xs"
                  >
                    Request Reveal
                  </Button>
                )}

                {handshakeState === 'requested_by_me' && (
                  <button
                    onClick={completeHandshake}
                    className="text-[10px] font-bold text-amber-800 bg-amber-200/70 hover:bg-amber-300/80 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                    title="Simulate peer accepting now"
                  >
                    Simulate Accept
                  </button>
                )}

                {handshakeState === 'requested_by_peer' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleAcceptPeerRequest}
                      className="text-[11px] h-7 px-2.5 font-bold"
                    >
                      Accept Reveal
                    </Button>
                  </div>
                )}

                {isRevealed && (
                  <button
                    onClick={() => setShowProfileCard((prev) => !prev)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0"
                  >
                    {showProfileCard ? 'Hide Details' : 'View Details'}
                  </button>
                )}
              </div>

              {/* Masked Quick Demo Helper: lets user test incoming peer request too */}
              {handshakeState === 'masked' && (
                <div className="flex items-center justify-between text-[10px] text-dark-faint pt-1 border-t border-brand-200/40">
                  <span>Double-blind verification protocol</span>
                  <button
                    type="button"
                    onClick={handleSimulatePeerRequest}
                    className="text-brand-700 hover:underline font-bold"
                  >
                    Simulate peer request →
                  </button>
                </div>
              )}
            </div>
          </div>

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
              <span className="text-[10px] font-semibold text-dark-faint bg-white px-3 py-1 rounded-full border border-border/80 shadow-2xs">
                🔒 End-to-End Anonymous Chat & Safety Guard
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
                    {isMe && <CheckCheck className="w-3 h-3 text-brand-500" />}
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
    </div>
  );
}

export default ChatDrawer;
