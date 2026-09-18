import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext(null);

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-rohan',
    peerId: 'p-1',
    peerName: 'Rohan Sharma',
    peerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    activityTitle: 'Evening Badminton Doubles Rally',
    category: 'Sports',
    handshakeState: 'masked', // 'masked' | 'requested_by_me' | 'requested_by_peer' | 'revealed'
    online: true,
    unreadCount: 1,
    messages: [
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
    ]
  },
  {
    id: 'conv-priya',
    peerId: 'p-2',
    peerName: 'Priya Sharma',
    peerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    activityTitle: 'Morning 5K Jog & Cardio Session',
    category: 'Fitness',
    handshakeState: 'revealed',
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'peer',
        text: 'Hi! Saw you enjoy morning runs at Central Park loop. What pace do you usually run at?',
        time: 'Yesterday'
      },
      {
        id: 2,
        sender: 'me',
        text: 'Around 5:30 min/km for 5k! Very casual and fun pace.',
        time: 'Yesterday'
      }
    ]
  },
  {
    id: 'conv-aarav',
    peerId: 'p-3',
    peerName: 'Aarav Patel',
    peerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    activityTitle: 'React & GenAI Developers Sprint',
    category: 'Study',
    handshakeState: 'masked',
    online: false,
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'peer',
        text: 'Hey, I will bring the presentation slides for our weekend hackathon project!',
        time: 'Sep 16'
      }
    ]
  }
];

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(() => {
    try {
      const stored = localStorage.getItem('connect2go_conversations');
      return stored ? JSON.parse(stored) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState('conv-rohan');

  useEffect(() => {
    try {
      localStorage.setItem('connect2go_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const sendMessage = (conversationId, text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );
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

  const openOrCreateConversationWithPeer = (peer) => {
    const peerName = typeof peer === 'string' ? peer : peer?.name || 'Partner';
    const peerAvatar = typeof peer === 'object' ? peer.avatar : null;

    // Check if conversation already exists
    const existing = conversations.find((c) => c.peerName.toLowerCase() === peerName.toLowerCase());
    if (existing) {
      setActiveConversationId(existing.id);
      markConversationAsRead(existing.id);
      return existing.id;
    }

    // Create new conversation
    const newConv = {
      id: `conv-${Date.now()}`,
      peerId: `peer-${Date.now()}`,
      peerName,
      peerAvatar: peerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      activityTitle: peer.title || 'Nearby Activity Meetup',
      category: peer.category || 'Sports',
      handshakeState: 'masked',
      online: true,
      unreadCount: 0,
      messages: [
        {
          id: Date.now(),
          sender: 'peer',
          text: `Hi there! Looking forward to connecting for ${peer.title || 'our activity'}.`,
          time: 'Just now'
        }
      ]
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  };

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Number of distinct chats where the user got message replies / incoming messages
  const repliedChatsCount = conversations.filter((c) => {
    if (c.unreadCount && c.unreadCount > 0) return true;
    const lastMsg = c.messages[c.messages.length - 1];
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
        updateHandshakeState,
        markConversationAsRead,
        openOrCreateConversationWithPeer,
        totalUnreadMessages,
        repliedChatsCount
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
