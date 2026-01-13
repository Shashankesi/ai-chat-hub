import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Chat List */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`w-full lg:w-80 xl:w-96 border-r border-gray-200 bg-white ${
          selectedChat ? 'hidden lg:block' : 'block'
        }`}
      >
        <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`flex-1 ${selectedChat ? 'block' : 'hidden lg:block'}`}
      >
        <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
      </motion.div>
    </div>
  );
};

export default Chat;
