import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Mic,
  X,
  Download,
  Pin,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ chat, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const { socket, typingUsers, joinChat, leaveChat, sendMessage, startTyping, stopTyping, markAsSeen } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (chat) {
      loadMessages();
      joinChat(chat._id);

      if (socket) {
        socket.on('message:new', handleNewMessage);
        socket.on('message:auto-reply', handleAutoReply);
      }

      return () => {
        leaveChat(chat._id);
        if (socket) {
          socket.off('message:new', handleNewMessage);
          socket.off('message:auto-reply', handleAutoReply);
        }
      };
    }
  }, [chat, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as seen when chat window is active
    if (messages.length > 0 && chat) {
      const unseenMessageIds = messages
        .filter(m => m.sender._id !== user._id && !m.seenBy.some(s => s.user === user._id))
        .map(m => m._id);

      if (unseenMessageIds.length > 0) {
        markAsSeen(chat._id, unseenMessageIds);
      }
    }
  }, [messages, chat]);

  const loadMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${chat._id}`);
      setMessages(res.data.data.messages);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.chat === chat._id) {
      setMessages((prev) => [...prev, message]);

      // Show AI suggestions if available
      if (message.aiFeatures?.smartReplies?.length > 0) {
        setAiSuggestions(message.aiFeatures.smartReplies);
        setShowAISuggestions(true);
      }
    }
  };

  const handleAutoReply = ({ from, text }) => {
    console.log('Auto-reply from focus mode:', text);
    // Show notification or toast
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedFile) return;

    if (selectedFile) {
      // Handle file upload
      const formData = new FormData();
      formData.append('chatId', chat._id);
      formData.append('file', selectedFile);
      if (newMessage.trim()) {
        formData.append('text', newMessage);
      }

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setNewMessage('');
        setSelectedFile(null);
      } catch (error) {
        console.error('Send message error:', error);
      }
    } else {
      // Send text message via socket
      sendMessage({
        chatId: chat._id,
        text: newMessage.trim()
      });

      setNewMessage('');
    }

    stopTyping(chat._id);
    setShowAISuggestions(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      startTyping(chat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(chat._id);
    }, 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}/pin`);
      loadMessages();
    } catch (error) {
      console.error('Pin message error:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
    setShowAISuggestions(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUser = () => {
    if (chat.isGroup) return null;
    return chat.members.find((m) => m.user._id !== user._id)?.user;
  };

  const otherUser = getOtherUser();
  const chatTypingUsers = typingUsers[chat._id] || [];
  const isOtherUserTyping = chatTypingUsers.length > 0;

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            {chat.isGroup ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            ) : (
              <>
                <img
                  src={otherUser?.avatar || '/default-avatar.png'}
                  alt={otherUser?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {onlineUsers.includes(otherUser?._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </>
            )}
          </div>

          <div>
            <h3 className="font-semibold">
              {chat.isGroup ? chat.name : otherUser?.name}
            </h3>
            <p className="text-xs text-gray-500">
              {isOtherUserTyping ? 'typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender._id === user._id;
              const showDate =
                index === 0 ||
                format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd') !==
                  format(new Date(message.createdAt), 'yyyy-MM-dd');

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                        {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isOwn && (
                        <img
                          src={message.sender.avatar || '/default-avatar.png'}
                          alt={message.sender.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}

                      <div>
                        <div
                          className={`chat-bubble ${
                            isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'
                          }`}
                        >
                          {message.isPinned && (
                            <Pin className="w-3 h-3 inline-block mr-1" />
                          )}
                          {message.content.text}

                          {message.aiFeatures?.isImportant && (
                            <Sparkles className="w-3 h-3 inline-block ml-1 text-yellow-400" />
                          )}
                        </div>

                        <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                          {isOwn && (
                            <span className="text-xs text-gray-500">
                              {message.status === 'seen' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showAISuggestions && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">AI Smart Replies</span>
              </div>
              <button onClick={() => setShowAISuggestions(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-white rounded-full text-sm hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {selectedFile && (
          <div className="mb-2 flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
            <Paperclip className="w-4 h-4" />
            <span className="text-sm flex-1">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 input"
          />

          <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
            <Smile className="w-5 h-5 text-gray-600" />
          </button>

          <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
            <Mic className="w-5 h-5 text-gray-600" />
          </button>

          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedFile}
            className="btn btn-primary"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
