import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh')
};

// User APIs
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updatePrivacy: (data) => api.put('/users/privacy', data),
  toggleFocusMode: (data) => api.put('/users/focus-mode', data),
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  getUserById: (userId) => api.get(`/users/${userId}`)
};

// Chat APIs
export const chatAPI = {
  createChat: (userId) => api.post('/chats', { userId }),
  createGroupChat: (data) => api.post('/chats/group', data),
  getChats: () => api.get('/chats'),
  getChatById: (chatId) => api.get(`/chats/${chatId}`),
  updateGroupChat: (chatId, data) => api.put(`/chats/${chatId}`, data),
  addMembers: (chatId, memberIds) => api.post(`/chats/${chatId}/members`, { memberIds }),
  removeMember: (chatId, userId) => api.delete(`/chats/${chatId}/members/${userId}`),
  updateExpiryRules: (chatId, rules) => api.put(`/chats/${chatId}/expiry`, rules),
  createPoll: (chatId, data) => api.post(`/chats/${chatId}/polls`, data),
  votePoll: (chatId, pollId, optionIndex) => api.post(`/chats/${chatId}/polls/${pollId}/vote`, { optionIndex })
};

// Message APIs
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (chatId, page = 1, limit = 50) => api.get(`/messages/${chatId}?page=${page}&limit=${limit}`),
  deleteMessage: (messageId, deleteForEveryone) => api.delete(`/messages/${messageId}`, { data: { deleteForEveryone } }),
  togglePinMessage: (messageId) => api.put(`/messages/${messageId}/pin`),
  markAsSeen: (chatId) => api.put(`/messages/${chatId}/seen`),
  searchMessages: (params) => api.get('/messages/search', { params }),
  getSummary: (chatId, messageCount) => api.get(`/messages/${chatId}/summary?messageCount=${messageCount}`)
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getWeeklyReport: () => api.get('/analytics/weekly-report')
};

export default api;
