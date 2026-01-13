import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Check, Moon, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Privacy = () => {
  const [settings, setSettings] = useState({
    showOnlineStatus: 'everyone',
    showLastSeen: 'everyone',
    readReceipts: true
  });
  const [focusMode, setFocusMode] = useState({
    isActive: false,
    autoReply: 'I am currently in focus mode and will respond later.'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePrivacyChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleFocusModeToggle = () => {
    setFocusMode({
      ...focusMode,
      isActive: !focusMode.isActive
    });
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    setMessage('');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/privacy`, settings);
      setMessage('Privacy settings updated successfully!');
    } catch (error) {
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFocusMode = async () => {
    setLoading(true);
    setMessage('');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/focus-mode`, focusMode);
      setMessage('Focus mode updated successfully!');
    } catch (error) {
      setMessage('Failed to update focus mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Privacy & Focus</h1>
            <p className="text-gray-600">Control who can see your information</p>
          </motion.div>

          {message && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg ${
                message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold">Privacy Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Online Status */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Who can see when you're online?
                </label>
                <div className="space-y-2">
                  {['everyone', 'contacts', 'nobody'].map((option) => (
                    <label key={option} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="showOnlineStatus"
                        value={option}
                        checked={settings.showOnlineStatus === option}
                        onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.value)}
                        className="mr-3"
                      />
                      <span className="capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Last Seen */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Who can see your last seen?
                </label>
                <div className="space-y-2">
                  {['everyone', 'contacts', 'nobody'].map((option) => (
                    <label key={option} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="showLastSeen"
                        value={option}
                        checked={settings.showLastSeen === option}
                        onChange={(e) => handlePrivacyChange('showLastSeen', e.target.value)}
                        className="mr-3"
                      />
                      <span className="capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Read Receipts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Read Receipts</h3>
                  <p className="text-sm text-gray-600">Let others know when you've read their messages</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('readReceipts', !settings.readReceipts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.readReceipts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.readReceipts ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSavePrivacy}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                Save Privacy Settings
              </button>
            </div>
          </motion.div>

          {/* Focus Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Moon className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">Focus Mode</h2>
                  <p className="text-sm text-gray-600">Minimize distractions during important work</p>
                </div>
              </div>
              <button
                onClick={handleFocusModeToggle}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  focusMode.isActive ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    focusMode.isActive ? 'transform translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            {focusMode.isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Auto-Reply Message
                  </label>
                  <textarea
                    value={focusMode.autoReply}
                    onChange={(e) => setFocusMode({ ...focusMode, autoReply: e.target.value })}
                    className="input h-24 resize-none"
                    placeholder="Your auto-reply message..."
                  />
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-start">
                    <Bell className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">When active:</h4>
                      <ul className="text-sm text-purple-700 mt-2 space-y-1">
                        <li className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Non-priority chats are muted
                        </li>
                        <li className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Auto-reply sent to incoming messages
                        </li>
                        <li className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Reduced notifications
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveFocusMode}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  Save Focus Mode Settings
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
