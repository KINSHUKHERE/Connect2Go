import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();

  // Purge legacy cached conversations from storage to eliminate ghost unread counts
  useEffect(() => {
    try {
      localStorage.removeItem('c2g_cached_conversations');
      localStorage.removeItem('c2g_fast_conversations_v3');
      localStorage.removeItem('c2g_fast_conversations_v4');
      sessionStorage.removeItem('c2g_fast_conversations_v3');
    } catch (e) {}
  }, []);

  const [conversations, setConversationsState] = useState(() => {
    try {
      const cached = localStorage.getItem('c2g_fast_conversations_v4');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationIdState] = useState(() => {
    try {
      return localStorage.getItem('c2g_active_chat_id') || null;
    } catch (e) {
      return null;
    }
  });

  const [partnerTyping, setPartnerTyping] = useState(null);
  const socketRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const setConversations = (updater) => {
    setConversationsState((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('c2g_fast_conversations_v4', JSON.stringify(nextVal));
      } catch (e) {}
      return nextVal;
    });
  };

  const setActiveConversationId = (id) => {
    setActiveConversationIdState(id);
    try {
      if (id) {
        localStorage.setItem('c2g_active_chat_id', id);
        markConversationAsRead(id);
      } else {
        localStorage.removeItem('c2g_active_chat_id');
      }
    } catch (e) {}
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const fetchConversationsFromBackend = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/conversations`, {
        params: { user_id: user.id, user_email: user.email }
      });
      if (res.data?.success && Array.isArray(res.data?.conversations)) {
        const backendConvs = res.data.conversations;
        const cutoffMs = Date.now() - 48 * 60 * 60 * 1000;

        setConversations((prev) => {
          if (!prev || prev.length === 0) {
            return backendConvs.map((c) => ({
              ...c,
              messages: (c.messages || []).filter((m) => !m.created_at || new Date(m.created_at).getTime() >= cutoffMs)
            }));
          }

          if (backendConvs.length === 0) {
            return prev;
          }

          const mergedBackendConvs = backendConvs.map((bc) => {
            const localConv = prev.find(
              (lc) => lc.id === bc.id || (bc.peerId && String(lc.peerId) === String(bc.peerId))
            );
            if (!localConv) {
              return {
                ...bc,
                messages: (bc.messages || []).filter((m) => !m.created_at || new Date(m.created_at).getTime() >= cutoffMs)
              };
            }

            const bMsgs = bc.messages || [];
            const lMsgs = localConv.messages || [];

            const mergedMap = new Map();
            bMsgs.forEach((bm) => mergedMap.set(bm.id, bm));

            lMsgs.forEach((lm) => {
              const isTemp = String(lm.id).startsWith('temp-') || lm.tempId;
              const existsInBackend = bMsgs.some(
                (bm) => bm.id === lm.id || (lm.tempId && bm.id === lm.tempId) || (bm.text === lm.text && bm.sender === lm.sender)
              );
              if (isTemp || !existsInBackend) {
                const key = lm.id || lm.tempId || `temp-${lm.text}`;
                if (!mergedMap.has(key)) {
                  mergedMap.set(key, lm);
                }
              }
            });

            const finalMsgs = Array.from(mergedMap.values()).filter(
              (m) => !m.created_at || new Date(m.created_at).getTime() >= cutoffMs
            );

            return {
              ...bc,
              messages: finalMsgs,
              unreadCount: localConv.id === activeConversationId ? 0 : (bc.unreadCount || localConv.unreadCount || 0)
            };
          });

          // Preserve any local conversations that were not returned by backend
          const backendIds = new Set(backendConvs.map((bc) => bc.id));
          const unmatchedLocal = prev.filter(
            (lc) => !backendIds.has(lc.id) && !backendConvs.some((bc) => bc.peerId && String(bc.peerId) === String(lc.peerId))
          );

          return [...mergedBackendConvs, ...unmatchedLocal];
        });
      }
    } catch (e) {
      console.error('[Fetch Conversations Error]:', e.message);
    }
  };

  // Socket Connection Setup
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConversations([]);
      setActiveConversationId(null);
      return;
    }

    fetchConversationsFromBackend();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected as user:', user.id);
      socket.emit('join_user', { userId: user.id });
    });

    socket.on('receive_message', (msg) => {
      if (!msg || !msg.conversationId || !user) return;

      setConversations((prev) => {
        const isMe = String(msg.senderId) === String(user.id);
        const formattedMsg = {
          id: msg.id || msg.tempId || `msg-${Date.now()}`,
          sender: isMe ? 'me' : 'peer',
          senderId: msg.senderId,
          senderAlias: msg.senderAlias || 'Member',
          text: msg.text || '',
          time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: isMe ? true : false
        };

        const targetIndex = prev.findIndex(
          (c) => c.id === msg.conversationId || (msg.senderId && String(c.peerId) === String(msg.senderId))
        );

        if (targetIndex !== -1) {
          const targetConv = prev[targetIndex];
          const existingMsgs = targetConv.messages || [];

          if (isMe) {
            const matchesMsg = (m) =>
              m.id === msg.id ||
              (msg.tempId && (m.id === msg.tempId || m.tempId === msg.tempId)) ||
              (m.sender === 'me' && m.text === msg.text);

            const alreadyHas = existingMsgs.some(matchesMsg);
            const updatedMsgs = alreadyHas
              ? existingMsgs.map((m) => (matchesMsg(m) ? { ...formattedMsg, tempId: m.tempId || msg.tempId } : m))
              : [...existingMsgs, formattedMsg];

            const updatedConv = {
              ...targetConv,
              id: msg.conversationId,
              messages: updatedMsgs,
              unreadCount: 0
            };

            const nextArr = [...prev];
            nextArr[targetIndex] = updatedConv;
            return nextArr;
          } else {
            const alreadyHasPeerMsg = existingMsgs.some(
              (m) => m.id === msg.id || (m.sender === 'peer' && m.text === msg.text && m.time === formattedMsg.time)
            );
            if (alreadyHasPeerMsg) return prev;

            const isChatActivelyOpen = activeConversationId === targetConv.id || activeConversationId === msg.conversationId;
            const updatedConv = {
              ...targetConv,
              id: msg.conversationId,
              messages: [...existingMsgs, formattedMsg],
              unreadCount: isChatActivelyOpen ? 0 : (targetConv.unreadCount || 0) + 1
            };

            const nextArr = [...prev];
            nextArr[targetIndex] = updatedConv;
            return nextArr;
          }
        } else {
          // Add new conversation thread if not present in state
          const newConv = {
            id: msg.conversationId,
            peerId: msg.senderId || `peer-${msg.conversationId}`,
            peerName: msg.senderAlias || 'Partner',
            realPeerName: msg.senderAlias || 'Partner',
            anonymousAlias: msg.senderAlias || 'Partner',
            peerAvatar: '/avatars/female.png',
            activityTitle: 'Direct Chat',
            isRevealed: false,
            handshakeState: 'masked',
            unreadCount: isMe ? 0 : 1,
            messages: [formattedMsg]
          };

          setTimeout(() => fetchConversationsFromBackend(), 300);
          return [newConv, ...prev];
        }
      });
    });

    socket.on('typing_start', ({ userId, alias }) => {
      if (user && userId && String(userId) !== String(user.id)) {
        setPartnerTyping(alias || 'Partner');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setPartnerTyping(null);
        }, 3500);
      }
    });

    socket.on('typing_stop', ({ userId } = {}) => {
      if (!userId || (user && String(userId) !== String(user.id))) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setPartnerTyping(null);
      }
    });

    socket.on('messages_read', ({ conversationId, readerId }) => {
      if (readerId !== user.id) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              const updatedMsgs = (c.messages || []).map((m) =>
                m.sender === 'me' ? { ...m, isRead: true } : m
              );
              return { ...c, messages: updatedMsgs };
            }
            return c;
          })
        );
      }
    });

    socket.on('identity_reveal_requested', ({ conversationId, requesterId }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            const isMe = requesterId === user.id;
            return {
              ...c,
              handshakeState: isMe ? 'requested_by_me' : 'requested_by_peer'
            };
          }
          return c;
        })
      );
    });

    socket.on('identity_reveal_result', ({ conversationId, status, isRevealed }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            if (status === 'accepted' || isRevealed) {
              try {
                confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
              } catch (e) {}

              return {
                ...c,
                isRevealed: true,
                handshakeState: 'revealed',
                peerName: c.realPeerName || c.peerName,
                peerAvatar: c.realPeerAvatar || c.peerAvatar
              };
            } else {
              return {
                ...c,
                isRevealed: false,
                handshakeState: 'masked'
              };
            }
          }
          return c;
        })
      );
      // Refresh full profile data from backend to ensure symmetrical names and avatars
      fetchConversationsFromBackend();
    });

    socket.on('user_presence_updated', ({ userId, online }) => {
      setConversations((prev) =>
        prev.map((c) => (c.peerId === userId ? { ...c, online } : c))
      );
    });

    socket.on('conversation_deleted', ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setActiveConversationId((prevId) => (prevId === conversationId ? null : prevId));
    });

    socket.on('messages_cleared', ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, messages: [], unreadCount: 0 } : c))
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Join room when active conversation changes
  useEffect(() => {
    if (activeConversationId && socketRef.current) {
      socketRef.current.emit('join_conversation', {
        conversationId: activeConversationId,
        userId: user?.id,
        alias: user?.name
      });
    }
  }, [activeConversationId, user]);

  const sendMessage = async (conversationId, text) => {
    if (!text || !text.trim() || !user) return;
    const trimmed = text.trim();
    const tempId = `temp-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Instantly stop typing indicator when message is sent
    sendTypingNotification(conversationId, false);

    const localMsg = {
      id: tempId,
      sender: 'me',
      senderId: user.id,
      senderAlias: user.name || 'Member',
      text: trimmed,
      time: timeStr,
      isRead: false
    };

    // Optimistically update sender UI instantly
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...(c.messages || []), localMsg] }
          : c
      )
    );

    // Emit via socket if connected, or fallback to REST if disconnected
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', {
        tempId,
        conversationId,
        senderId: user.id,
        senderAlias: user.name || 'Member',
        text: trimmed
      });
    } else {
      try {
        await axios.post(`${API_BASE}/conversations/messages`, {
          tempId,
          conversationId,
          senderId: user.id,
          senderAlias: user.name || 'Member',
          text: trimmed
        });
      } catch (e) {
        console.error('[Send Message REST Error]:', e.message);
      }
    }
  };

  const sendTypingNotification = (conversationId, isTyping) => {
    if (!socketRef.current || !conversationId) return;

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    if (isTyping) {
      socketRef.current.emit('typing_start', { conversationId, userId: user?.id, alias: user?.name || 'Member' });

      // Automatically emit typing_stop if no character typed for 2.5 seconds
      typingDebounceRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('typing_stop', { conversationId, userId: user?.id });
        }
      }, 2500);
    } else {
      socketRef.current.emit('typing_stop', { conversationId, userId: user?.id });
    }
  };

  const requestIdentityReveal = async (conversationId) => {
    if (!conversationId || !user) return;

    // Local state update immediately
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, handshakeState: 'requested_by_me' } : c))
    );

    if (socketRef.current) {
      socketRef.current.emit('request_identity_reveal', {
        conversationId,
        requesterId: user.id,
        requesterAlias: user.name
      });
    }

    try {
      await axios.post(`${API_BASE}/conversations/reveal`, {
        conversationId,
        userId: user.id,
        action: 'request'
      });
    } catch (e) {}
  };

  const respondIdentityReveal = async (conversationId, accept) => {
    if (!conversationId || !user) return;

    if (accept) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? {
          ...c,
          isRevealed: true,
          handshakeState: 'revealed',
          peerName: c.realPeerName || c.peerName,
          peerAvatar: c.realPeerAvatar || c.peerAvatar
        } : c))
      );

      try {
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, handshakeState: 'masked' } : c))
      );
    }

    if (socketRef.current) {
      socketRef.current.emit('respond_identity_reveal', {
        conversationId,
        responderId: user.id,
        accept
      });
    }

    try {
      await axios.post(`${API_BASE}/conversations/reveal`, {
        conversationId,
        userId: user.id,
        action: accept ? 'accept' : 'reject'
      });
    } catch (e) {}
  };

  const updateHandshakeState = (conversationId, state) => {
    if (state === 'requested_by_me') {
      requestIdentityReveal(conversationId);
    } else if (state === 'revealed') {
      respondIdentityReveal(conversationId, true);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, handshakeState: state } : c))
      );
    }
  };

  const markConversationAsRead = (conversationId) => {
    if (!conversationId) return;

    if (socketRef.current && user) {
      socketRef.current.emit('mark_messages_read', { conversationId, userId: user.id });
    }

    try {
      axios.post(`${API_BASE}/conversations/read`, {
        conversationId,
        userId: user?.id
      });
    } catch (e) {}

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const updatedMsgs = (c.messages || []).map((m) => ({ ...m, isRead: true }));
          return { ...c, unreadCount: 0, messages: updatedMsgs };
        }
        return c;
      })
    );
  };

  const openOrCreateConversationWithPeer = async (peer) => {
    if (!user) return null;
    const peerName = typeof peer === 'string' ? peer : peer?.name || 'Partner';
    const peerId = typeof peer === 'object' ? peer.id : null;

    const existing = conversations.find(
      (c) => (peerId && c.peerId === peerId) || (c.peerName && c.peerName.toLowerCase() === peerName.toLowerCase()) || (c.realPeerName && c.realPeerName.toLowerCase() === peerName.toLowerCase())
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    try {
      const res = await axios.post(`${API_BASE}/conversations/open`, {
        userId: user.id,
        peerId: peerId || `usr-peer-${Date.now()}`,
        activityTitle: (typeof peer === 'object' && peer.title) || 'Direct Chat'
      });

      if (res.data?.success && res.data?.conversationId) {
        await fetchConversationsFromBackend();
        setActiveConversationId(res.data.conversationId);
        return res.data.conversationId;
      }
    } catch (e) {
      console.error('[Open Conversation Error]:', e.message);
    }

    const fallbackId = `conv-${Date.now()}`;
    const newConv = {
      id: fallbackId,
      peerId: peerId || `peer-${Date.now()}`,
      peerName: peerName,
      realPeerName: peerName,
      peerAvatar: (typeof peer === 'object' && peer.avatar) || '/avatars/female.png',
      activityTitle: (typeof peer === 'object' && peer.title) || 'Direct Chat',
      isRevealed: false,
      handshakeState: 'masked',
      messages: []
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(fallbackId);
    return fallbackId;
  };

  const deleteConversation = async (conversationId) => {
    if (!conversationId) return false;
    try {
      await axios.delete(`${API_BASE}/conversations/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
      return true;
    } catch (e) {
      console.error('[Delete Conversation Error]:', e.message);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
      return false;
    }
  };

  const clearConversationMessages = async (conversationId) => {
    if (!conversationId) return false;
    try {
      await axios.delete(`${API_BASE}/conversations/${conversationId}/messages`);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, messages: [], unreadCount: 0 } : c))
      );
      return true;
    } catch (e) {
      console.error('[Clear Messages Error]:', e.message);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, messages: [], unreadCount: 0 } : c))
      );
      return false;
    }
  };

  const getConvUnreadCount = (c) => {
    if (!c || !c.id) return 0;
    if (c.id === activeConversationId) return 0;
    const msgs = Array.isArray(c.messages) ? c.messages : [];
    if (msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && (lastMsg.sender === 'me' || (lastMsg.senderId && String(lastMsg.senderId) === String(user?.id)))) {
        return 0;
      }
      return msgs.filter((m) => (m.sender === 'peer' || (m.senderId && String(m.senderId) !== String(user?.id))) && !m.isRead).length;
    }
    return c.unreadCount || 0;
  };

  const unreadConversationsList = conversations.filter((c) => getConvUnreadCount(c) > 0);
  const unreadConversationsCount = unreadConversationsList.length;
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + getConvUnreadCount(c), 0);

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
        requestIdentityReveal,
        respondIdentityReveal,
        updateHandshakeState,
        markConversationAsRead,
        openOrCreateConversationWithPeer,
        deleteConversation,
        clearConversationMessages,
        getConvUnreadCount,
        totalUnreadMessages,
        unreadConversationsCount,
        unreadUsersCount: unreadConversationsCount,
        repliedChatsCount: unreadConversationsCount,
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
