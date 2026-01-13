import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await analyticsAPI.getDashboard();
      setAnalytics(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Chat Analytics</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-sm text-gray-600">Messages Sent</div>
          <div className="text-3xl font-bold">{analytics?.totalMessagesSent || 0}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-600">Total Chats</div>
          <div className="text-3xl font-bold">{analytics?.totalChats || 0}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-600">Productivity Score</div>
          <div className="text-3xl font-bold">{analytics?.productivityScore || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
