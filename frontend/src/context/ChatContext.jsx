import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const ChatContext = createContext(null);

const MOCK_CONV_IDS = ['conv-rohan', 'conv-priya', 'conv-aarav'];
const MOCK_PEER_NAMES = ['rohan sharma', 'priya sharma', 'aarav patel'];

const isMockConv = (c) => {
  if (!c) return true;
  const idMatch = MOCK_CONV_IDS.includes(c.id);
  const nameMatch = MOCK_PEER_NAMES.includes((c.peerName || '').toLowerCase());
  return idMatch || nameMatch;
};

const getInitialConversations = () => {
  try {
    const saved = localStorage.getItem('connect2go_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => !isMockConv(c));
      }
    }
  } catch (e) {}
  return [];
};

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(getInitialConversations);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const socketRef = useRef(null);

  // Purge any legacy predefined/mock conversations from localStorage & state on mount
  useEffect(() => {
    setConversations((prev) => {
      const cleaned = prev.filter((c) => !isMockConv(c));
      try {
        localStorage.setItem('connect2go_conversations', JSON.stringify(cleaned));
      } catch (e) {}
      return cleaned;
    });
  }, []);

  // Persist conversations to localStorage on state changes
  useEffect(() => {
    try {
      const cleaned = conversations.filter((c) => !isMockConv(c));
      localStorage.setItem('connect2go_conversations', JSON.stringify(cleaned));
    } catch (e) {}
  }, [conversations]);

  // Fetch conversations from Backend API on mount or when user logs in
  const fetchConversationsFromBackend = async () => {
    try {
      let activeUser = user;
      if (!activeUser) {
        try {
          const stored = localStorage.getItem('connect2go_user');
          if (stored) activeUser = JSON.parse(stored);
        } catch (e) {}
      }

      if (!activeUser) return;

      const res = await axios.get(`${API_BASE}/conversations`, {
        params: {
          user_id: activeUser.id,
          user_email: activeUser.email
        },
        timeout: 4000
      });

      if (res.data?.success && Array.isArray(res.data?.conversations)) {
        const backendConvs = res.data.conversations.filter((c) => !isMockConv(c));
        setConversations((prev) => {
          // Merge backend conversations with local conversations so no messages are lost
          const map = new Map();
          prev.filter((c) => !isMockConv(c)).forEach((c) => map.set(c.id, c));
          backendConvs.forEach((bConv) => {
            const existing = map.get(bConv.id);
            if (existing) {
              // Merge messages
              const msgMap = new Map();
              (existing.messages || []).forEach((m) => msgMap.set(String(m.id), m));
              (bConv.messages || []).forEach((m) => msgMap.set(String(m.id), m));
              map.set(bConv.id, {
                ...existing,
                ...bConv,
                messages: Array.from(msgMap.values())
              });
            } else {
              map.set(bConv.id, bConv);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Backend conversations fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchConversationsFromBackend();
  }, [user]);

  // Connect to Socket.IO real-time chat server
  useEffect(() => {
    let socket;
    try {
      socket = io(SOCKET_URL, { reconnectionAttempts: 5, timeout: 3000 });
      socketRef.current = socket;

      if (user?.id) {
        socket.emit('join_user', { userId: user.id });
      }

      socket.on('receive_message', (incomingMsg) => {
        const targetConvId = incomingMsg.conversationId || incomingMsg.conversation_id;
        const msgText = incomingMsg.text || incomingMsg.content || '';
        const msgSenderId = incomingMsg.senderId || incomingMsg.sender_id;
        const msgSenderAlias = incomingMsg.senderAlias || incomingMsg.sender_alias || 'Partner';
        const isMe = user && (msgSenderId === user.id || msgSenderAlias === user.username);

        const newMsgObj = {
          id: incomingMsg.id || Date.now(),
          sender: isMe ? 'me' : 'peer',
          senderId: msgSenderId,
          senderAlias: msgSenderAlias,
          text: msgText,
          time: incomingMsg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversations((prev) => {
          const exists = prev.some((c) => c.id === targetConvId);
          if (exists) {
            return prev.map((c) => {
              if (c.id === targetConvId) {
                const msgExists = (c.messages || []).some((m) => String(m.id) === String(newMsgObj.id));
                if (msgExists) return c;
                const isCurrentActive = targetConvId === activeConversationId;
                return {
                  ...c,
                  unreadCount: isCurrentActive || isMe ? c.unreadCount : (c.unreadCount || 0) + 1,
                  messages: [...(c.messages || []), newMsgObj]
                };
              }
              return c;
            });
          }

          // Create new conversation entry if not exists locally
          const brandNewConv = {
            id: targetConvId,
            peerId: msgSenderId || `peer-${Date.now()}`,
            peerName: msgSenderAlias,
            peerAvatar: '/avatars/male.png',
            activityTitle: 'Direct Chat',
            category: 'Social',
            handshakeState: 'masked',
            online: true,
            unreadCount: isMe ? 0 : 1,
            messages: [newMsgObj]
          };
          return [brandNewConv, ...prev];
        });
      });

      socket.on('typing_start', ({ alias }) => {
        setPartnerTyping(alias || 'Partner');
      });

      socket.on('typing_stop', () => {
        setPartnerTyping(false);
      });
    } catch (e) {
      console.warn('Socket connection fallback:', e);
    }

    return () => {
      socket?.disconnect();
    };
  }, [user, activeConversationId]);

  // Join active conversation Socket.IO room when active conversation changes
  useEffect(() => {
    if (activeConversationId && socketRef.current) {
      socketRef.current.emit('join_conversation', {
        conversationId: activeConversationId,
        alias: user?.username || user?.name || 'Member'
      });
    }
  }, [activeConversationId, user]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);

  const sendMessage = async (conversationId, text) => {
    if (!text.trim()) return;

    const trimmedText = text.trim();
    const tempMsgId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempMsgId,
      sender: 'me',
      senderId: user?.id,
      senderAlias: user?.username || user?.name || 'You',
      text: trimmedText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update local React state & LocalStorage immediately (optimistic UI)
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg]
          };
        }
        return c;
      })
    );

    // Emit Socket.IO message
    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        conversationId,
        senderId: user?.id,
        senderAlias: user?.username || user?.name || 'You',
        text: trimmedText
      });
      socketRef.current.emit('typing_stop', { conversationId });
    }

    // Post to Backend REST API (Supabase DB persistence)
    try {
      const res = await axios.post(`${API_BASE}/conversations/messages`, {
        conversationId,
        senderId: user?.id,
        senderAlias: user?.username || user?.name || 'You',
        text: trimmedText
      });

      if (res.data?.message?.id) {
        const realId = res.data.message.id;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                messages: c.messages.map((m) => (m.id === tempMsgId ? { ...m, id: realId } : m))
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.warn('Backend message save error:', err.message);
    }
  };

  const sendTypingNotification = (conversationId, isTyping) => {
    if (socketRef.current && conversationId) {
      if (isTyping) {
        socketRef.current.emit('typing_start', {
          conversationId,
          alias: user?.username || user?.name || 'Partner'
        });
      } else {
        socketRef.current.emit('typing_stop', { conversationId });
      }
    }
  };

  const updateHandshakeState = (conversationId, newState) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            handshakeState: newState
          };
        }
        return c;
      })
    );
  };

  const markConversationAsRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: 0
          };
        }
        return c;
      })
    );
  };

  const openOrCreateConversationWithPeer = async (peer) => {
    const peerName = typeof peer === 'string' ? peer : peer?.name || 'Partner';
    const peerId = typeof peer === 'object' ? peer.id : null;
    const peerAvatar = typeof peer === 'object' ? peer.avatar : null;
    const peerUsername = typeof peer === 'object' ? peer.username : null;

    // Check if conversation already exists in active session
    const existing = conversations.find(
      (c) =>
        (peerId && c.peerId === peerId) ||
        (c.peerName && c.peerName.toLowerCase() === peerName.toLowerCase()) ||
        (peerUsername && c.peerUsername && c.peerUsername.toLowerCase() === peerUsername.toLowerCase())
    );

    if (existing) {
      setActiveConversationId(existing.id);
      markConversationAsRead(existing.id);
      return existing.id;
    }

    // Attempt to open or create via Backend API
    try {
      const res = await axios.post(`${API_BASE}/conversations/open`, {
        currentUserId: user?.id,
        currentUserUsername: user?.username,
        peerId,
        peerName,
        peerUsername,
        activityTitle: peer.title || 'Nearby Activity Meetup'
      });

      if (res.data?.success && res.data?.conversationId) {
        const convId = res.data.conversationId;
        const newConv = {
          id: convId,
          peerId: peerId || `peer-${Date.now()}`,
          peerName,
          peerUsername: peerUsername || peerName.toLowerCase().replace(/\s+/g, '_'),
          peerAvatar: peerAvatar || '/avatars/male.png',
          activityTitle: peer.title || 'Nearby Activity Meetup',
          category: peer.category || 'Sports',
          handshakeState: 'masked',
          online: true,
          unreadCount: 0,
          messages: [
            {
              id: `welcome-${convId}`,
              sender: 'peer',
              text: `Hi there! Looking forward to connecting for ${peer.title || 'our activity'}.`,
              time: 'Just now'
            }
          ]
        };

        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== convId)]);
        setActiveConversationId(convId);
        return convId;
      }
    } catch (err) {
      console.warn('Backend open conversation error:', err.message);
    }

    // Local fallback
    const fallbackId = `conv-${Date.now()}`;
    const newConv = {
      id: fallbackId,
      peerId: peerId || `peer-${Date.now()}`,
      peerName,
      peerUsername: peerUsername || peerName.toLowerCase().replace(/\s+/g, '_'),
      peerAvatar: peerAvatar || '/avatars/male.png',
      activityTitle: peer.title || 'Nearby Activity Meetup',
      category: peer.category || 'Sports',
      handshakeState: 'masked',
      online: true,
      unreadCount: 0,
      messages: [
        {
          id: `welcome-${fallbackId}`,
          sender: 'peer',
          text: `Hi there! Looking forward to connecting for ${peer.title || 'our activity'}.`,
          time: 'Just now'
        }
      ]
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(fallbackId);
    return fallbackId;
  };

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const repliedChatsCount = conversations.filter((c) => {
    if (c.unreadCount && c.unreadCount > 0) return true;
    const lastMsg = c.messages && c.messages[c.messages.length - 1];
    return lastMsg && lastMsg.sender === 'peer';
  }).length;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        activeConversation,
        sendMessage,
        sendTypingNotification,
        partnerTyping,
        updateHandshakeState,
        markConversationAsRead,
        openOrCreateConversationWithPeer,
        totalUnreadMessages,
        repliedChatsCount,
        refreshConversations: fetchConversationsFromBackend
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
