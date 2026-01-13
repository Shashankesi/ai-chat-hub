import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Calendar, Image, Video, File, Filter } from 'lucide-react';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    mediaType: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);

    try {
      const params = {
        query: query.trim(),
        ...filters
      };

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/search`, {
        params
      });

      setResults(res.data.data.messages);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'document':
        return <File className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Search Messages</h1>
            <p className="text-gray-600">Find any message across all conversations</p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 mb-6"
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for messages..."
                  className="input pl-10 text-lg"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From Date</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">To Date</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Media Type</label>
                  <select
                    value={filters.mediaType}
                    onChange={(e) => setFilters({ ...filters, mediaType: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="text">Text Only</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="voice">Voice</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="text-sm text-gray-600 mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>

              {results.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={message.sender.avatar || '/default-avatar.png'}
                      alt={message.sender.name}
                      className="w-10 h-10 rounded-full"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{message.sender.name}</h3>
                          {message.chat?.isGroup && (
                            <span className="text-xs text-gray-500">
                              in {message.chat.name}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2">{message.content.text}</p>

                      {message.type !== 'text' && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          {getMediaIcon(message.type)}
                          <span className="capitalize">{message.type}</span>
                        </div>
                      )}

                      {message.aiFeatures?.isImportant && (
                        <div className="mt-2">
                          <span className="badge badge-warning">Important</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : query && !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Search;
