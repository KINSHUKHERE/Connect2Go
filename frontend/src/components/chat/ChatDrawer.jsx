import React, { useState } from 'react';
import { X, Shield, Send, Sparkles, CheckCheck, Lock } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';

export function ChatDrawer({ isOpen, onClose, peerName = 'Rohan', onComingSoon }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'peer',
      text: 'Hey! Are you interested in playing badminton this evening?',
      time: '5:20 PM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Yes! I am available around 6:00 PM. Which court do you usually play at?',
      time: '5:21 PM'
    },
    {
      id: 3,
      sender: 'peer',
      text: 'There is a great court near Sitapura Arena. Court 2 is booked! Want to join?',
      time: '5:22 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealRequested, setRevealRequested] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'me',
        text: inputText,
        time: 'Just now'
      }
    ]);
    setInputText('');
  };

  const handleRequestReveal = () => {
    setRevealRequested(true);
    setTimeout(() => {
      setIsRevealed(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-dark-text/30 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-border flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-border bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  isRevealed ? 'bg-brand-100 text-brand-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {isRevealed ? (
                    <img 
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" 
                      alt={peerName} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-dark-text">
                    {isRevealed ? peerName : 'BadminPro #42 (Anonymous)'}
                  </h4>
                  <Badge variant={isRevealed ? 'mint' : 'anon'} size="sm">
                    {isRevealed ? 'Revealed' : 'Masked'}
                  </Badge>
                </div>
                <p className="text-[11px] text-dark-faint flex items-center gap-1">
                  {isRevealed ? 'Verified Community Profile' : 'Personal details aren’t shared yet'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reveal Identity Banner */}
          <div className="px-4 py-2.5 bg-brand-50/80 border-b border-brand-200/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-brand-900">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">
                {isRevealed
                  ? 'Identities Revealed! Real profiles & contact info unlocked.'
                  : revealRequested
                  ? 'Reveal requested! Handshake accepted.'
                  : 'Ready to meet offline? Tap to reveal real profiles.'}
              </span>
            </div>

            {!isRevealed && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleRequestReveal}
                className="text-[11px] h-7 px-2.5 shrink-0 font-bold"
              >
                {revealRequested ? 'Revealing...' : 'Reveal Identity'}
              </Button>
            )}
          </div>

          {/* Message Bubbles Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-canvas/40">
            <div className="text-center my-2">
              <span className="text-[10px] font-semibold text-dark-faint bg-white px-2.5 py-1 rounded-full border border-border/80">
                End-to-End Anonymous & Encrypted
              </span>
            </div>

            {messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
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
            })}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a safe message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
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
