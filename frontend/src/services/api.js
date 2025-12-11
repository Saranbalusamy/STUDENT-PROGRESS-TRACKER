import axios from 'axios';

const api = axios.create({
  // Default to backend port 5002 for local dev; can be overridden via REACT_APP_API_URL
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  timeout: 20000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, error => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  return response;
}, error => {
  // Handle authentication errors - but only for authenticated requests, not login attempts
  if (error.response?.status === 401) {
    // Check if this is a login request - if so, don't redirect
    const isLoginRequest = error.config?.url?.includes('/login');
    
    if (!isLoginRequest) {
      // Only redirect for authenticated requests that fail
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject({ ...error, message: 'Session expired. Please log in again.' });
    }
  }
  
  // Handle server connection errors
  if (error.code === 'ERR_NETWORK') {
    console.error('Server connection error:', error.message);
    return Promise.reject({ 
      ...error, 
      isConnectionError: true, 
      message: 'Unable to connect to the server. Please check your connection or try again later.' 
    });
  }
  
  // Log detailed error information
  console.error('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message,
    errorObject: error
  });
  
  // Handle request timeouts explicitly
  if (error.code === 'ECONNABORTED') {
    return Promise.reject({
      ...error,
      message: 'Request timed out. The AI assistant took too long to respond. Please try again.'
    });
  }

  return Promise.reject(error);
});

// Message-related API functions
export const messageApi = {
  // Get all messages for the current user
  getMessages: () => api.get('/messages').then(response => {
    // Log received messages
    console.log('API received messages:', response.data);
    return response;
  }),
  
  // Get a specific message by ID
  getMessage: (id) => api.get(`/messages/${id}`),
  
  // Send a new message
  sendMessage: (messageData) => {
    // Log what we're sending
    console.log('Sending message data:', messageData);
    return api.post('/messages', messageData);
  },
  
  // Delete a message
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  
  // Get unread message count
  getUnreadCount: () => api.get('/messages/unread'),
  
  // Refresh unread count after viewing messages
  refreshUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread');
      // Dispatch a custom event that other components can listen for
      const event = new CustomEvent('unread-messages-updated', { 
        detail: { count: response.data.unreadCount } 
      });
      window.dispatchEvent(event);
      return response;
    } catch (error) {
      console.error('Error refreshing unread count:', error);
      throw error;
    }
  }
};

// Teacher assistant API functions
export const teacherAssistantApi = {
  // Get assistant response
  getResponse: (query) => api.post('/teacher/assistant', { query })
};

// Analytics API functions
export const analyticsApi = {
  // Get admin analytics
  getLLMAnalytics: (timeframe) => api.get(`/analytics/llm?timeframe=${timeframe || 'last30days'}`),
  
  // Get popular questions
  getPopularQuestions: (timeframe) => api.get(`/analytics/popular-questions?timeframe=${timeframe || 'last30days'}`),
  
  // Get user engagement data
  getUserEngagement: () => api.get('/analytics/user-engagement'),
  
  // Get subject insights
  getSubjectInsights: (timeframe) => api.get(`/analytics/subject-insights?timeframe=${timeframe || 'last30days'}`),
  
  // Get personal analytics
  getPersonalAnalytics: () => api.get('/analytics/personal')
};

export default api;
