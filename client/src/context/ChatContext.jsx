import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatAPI, messageAPI } from '../services/api';
import { getSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
      setupSocketListeners();
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat._id);
      joinChatRoom(activeChat._id);
    }
  }, [activeChat]);

  const setupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('message:new', handleNewMessage);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stop-typing', handleStopTyping);
    socket.on('message:seen-update', handleSeenUpdate);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
  };

  const cleanupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off('message:new', handleNewMessage);
    socket.off('user:typing', handleUserTyping);
    socket.off('user:stop-typing', handleStopTyping);
    socket.off('message:seen-update', handleSeenUpdate);
    socket.off('user:online', handleUserOnline);
    socket.off('user:offline', handleUserOffline);
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      const { data } = await chatAPI.getChats();
      setChats(data.data.chats);
    } catch (error) {
      console.error('Load chats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId, page = 1) => {
    try {
      const { data } = await messageAPI.getMessages(chatId, page);

      if (page === 1) {
        setMessages(data.data.messages);
      } else {
        setMessages(prev => [...data.data.messages, ...prev]);
      }

      // Mark messages as seen
      await messageAPI.markAsSeen(chatId);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const joinChatRoom = (chatId) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:join', chatId);
    }
  };

  const sendMessage = async (text, replyTo = null) => {
    if (!activeChat || !text.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('message:send', {
        chatId: activeChat._id,
        text: text.trim(),
        replyTo
      });
    }
  };

  const handleNewMessage = (message) => {
    // Add message to list
    setMessages(prev => [...prev, message]);

    // Update chat's last message
    setChats(prev =>
      prev.map(chat =>
        chat._id === message.chat
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );

    // Auto-scroll to bottom
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  const handleUserTyping = ({ userId, chatId }) => {
    if (activeChat?._id === chatId) {
      setTypingUsers(prev => ({ ...prev, [userId]: true }));
    }
  };

  const handleStopTyping = ({ userId, chatId }) => {
    if (activeChat?._id === chatId) {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }
  };

  const handleSeenUpdate = ({ messageId, seenBy, chatId }) => {
    if (activeChat?._id === chatId) {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? {
                ...msg,
                status: 'seen',
                seenBy: [...(msg.seenBy || []), { user: seenBy, seenAt: new Date() }]
              }
            : msg
        )
      );
    }
  };

  const handleUserOnline = ({ userId }) => {
    setChats(prev =>
      prev.map(chat => ({
        ...chat,
        members: chat.members.map(member =>
          member.user._id === userId
            ? { ...member, user: { ...member.user, isOnline: true } }
            : member
        )
      }))
    );
  };

  const handleUserOffline = ({ userId, lastSeen }) => {
    setChats(prev =>
      prev.map(chat => ({
        ...chat,
        members: chat.members.map(member =>
          member.user._id === userId
            ? { ...member, user: { ...member.user, isOnline: false, lastSeen } }
            : member
        )
      }))
    );
  };

  const startTyping = () => {
    if (activeChat) {
      const socket = getSocket();
      if (socket) {
        socket.emit('typing:start', { chatId: activeChat._id });
      }
    }
  };

  const stopTyping = () => {
    if (activeChat) {
      const socket = getSocket();
      if (socket) {
        socket.emit('typing:stop', { chatId: activeChat._id });
      }
    }
  };

  const createNewChat = async (userId) => {
    try {
      const { data } = await chatAPI.createChat(userId);
      setChats(prev => [data.data.chat, ...prev]);
      setActiveChat(data.data.chat);
      return data.data.chat;
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  };

  const createGroup = async (groupData) => {
    try {
      const { data } = await chatAPI.createGroupChat(groupData);
      setChats(prev => [data.data.chat, ...prev]);
      setActiveChat(data.data.chat);
      return data.data.chat;
    } catch (error) {
      console.error('Create group error:', error);
      throw error;
    }
  };

  const value = {
    chats,
    activeChat,
    messages,
    typingUsers,
    loading,
    setActiveChat,
    sendMessage,
    startTyping,
    stopTyping,
    createNewChat,
    createGroup,
    loadChats,
    loadMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
