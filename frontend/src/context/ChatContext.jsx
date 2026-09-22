import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);

  const fetchConversationsFromBackend = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/conversations`, {
        params: { user_id: user.id }
      });
      if (res.data?.success && Array.isArray(res.data?.conversations)) {
        setConversations(res.data.conversations);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      fetchConversationsFromBackend();
    } else {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [user]);

  const sendMessage = async (conversationId, text) => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      senderId: user?.id,
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...(c.messages || []), newMsg] } : c))
    );
  };

  const sendTypingNotification = () => {};
  const updateHandshakeState = () => {};
  const markConversationAsRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const openOrCreateConversationWithPeer = async (peer) => {
    const peerName = typeof peer === 'string' ? peer : peer?.name || 'Partner';
    const peerId = typeof peer === 'object' ? peer.id : null;

    const existing = conversations.find((c) => (peerId && c.peerId === peerId) || (c.peerName && c.peerName.toLowerCase() === peerName.toLowerCase()));
    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      peerId: peerId || `peer-${Date.now()}`,
      peerName,
      peerAvatar: (typeof peer === 'object' && peer.avatar) || '/avatars/female.png',
      activityTitle: (typeof peer === 'object' && peer.title) || 'Direct Chat',
      messages: []
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

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
        totalUnreadMessages: conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
        repliedChatsCount: conversations.length,
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
