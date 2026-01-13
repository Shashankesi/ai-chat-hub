import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Plus, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../context/SocketContext';

const ChatList = ({ selectedChat, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    loadChats();

    if (socket) {
      socket.on('message:new', (message) => {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === message.chat
              ? { ...chat, lastMessage: message }
              : chat
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('message:new');
      }
    };
  }, [socket]);

  const loadChats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chats`);
      setChats(res.data.data.chats);
    } catch (error) {
      console.error('Load chats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherUser = (chat) => {
    if (chat.isGroup) return null;
    return chat.members.find((m) => m.user._id !== chat.currentUserId)?.user;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Messages</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="input pl-10 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const isOnline = otherUser && isUserOnline(otherUser._id);

              return (
                <motion.div
                  key={chat._id}
                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.8)' }}
                  onClick={() => onSelectChat(chat)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {chat.isGroup ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <>
                          <img
                            src={otherUser?.avatar || '/default-avatar.png'}
                            alt={otherUser?.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {chat.isGroup ? chat.name : otherUser?.name}
                        </h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                              addSuffix: false
                            })}
                          </span>
                        )}
                      </div>

                      {chat.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.sender?.name}:{' '}
                          {chat.lastMessage.content.text || 'Media'}
                        </p>
                      )}

                      {chat.unreadCount > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="btn btn-primary w-full flex items-center justify-center">
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatList;
