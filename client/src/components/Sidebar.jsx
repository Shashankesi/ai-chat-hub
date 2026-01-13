import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  User,
  Settings,
  BarChart3,
  Moon,
  LogOut,
  Shield,
  Search,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'chats', icon: MessageCircle, label: 'Chats', path: '/chat' },
    { id: 'search', icon: Search, label: 'Search', path: '/search' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    { id: 'privacy', icon: Shield, label: 'Privacy', path: '/privacy' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-16 lg:w-20 bg-gradient-to-b from-blue-600 to-purple-700 flex flex-col items-center py-4 space-y-6">
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.div>

      {/* Menu Items */}
      <div className="flex-1 flex flex-col space-y-2 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/30 backdrop-blur-lg'
                  : 'hover:bg-white/10'
              }`}
            >
              <Icon
                className={`w-6 h-6 mx-auto ${
                  isActive ? 'text-white' : 'text-white/70'
                }`}
              />

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.name}
            className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600"></div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-3 rounded-xl hover:bg-white/10 transition-all"
        >
          <LogOut className="w-5 h-5 text-white/70" />
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
