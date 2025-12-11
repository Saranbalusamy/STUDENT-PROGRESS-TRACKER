 import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials, userType) => {
    try {
      let endpoint = '';
      switch (userType) {
        case 'admin':
          endpoint = '/admin/login';
          break;
        case 'teacher':
          endpoint = '/teacher/login';
          break;
        case 'student':
          endpoint = '/student/login';
          break;
        default:
          throw new Error('Invalid user type');
      }
      
      console.log('Attempting login:', { endpoint, userType, credentials: { ...credentials, password: '[HIDDEN]' } });
      
      const response = await api.post(endpoint, credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setToken(token);
        setUser(user);
        return { success: true };
      }
      
      console.log('Login failed:', response.data.message);
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Server error: ${error.response.status}`;
        return { success: false, message: errorMessage };
      } else if (error.request) {
        // Network error
        return { success: false, message: 'Network error. Please check your connection.' };
      } else {
        // Other error
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
