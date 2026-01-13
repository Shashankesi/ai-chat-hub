import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('user:online', ({ userId }) => {
        setOnlineUsers((prev) => [...new Set([...prev, userId])]);
      });

      newSocket.on('user:offline', ({ userId }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      newSocket.on('user:typing', ({ userId, chatId }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: [...new Set([...(prev[chatId] || []), userId])]
        }));
      });

      newSocket.on('user:stop-typing', ({ userId, chatId }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter((id) => id !== userId)
        }));
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('chat:join', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('chat:leave', chatId);
    }
  };

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('message:send', data);
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit('typing:start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('typing:stop', { chatId });
    }
  };

  const markAsSeen = (chatId, messageIds) => {
    if (socket) {
      socket.emit('message:seen', { chatId, messageIds });
    }
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsSeen
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
