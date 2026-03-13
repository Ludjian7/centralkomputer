import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (res.data.success) {
          setCurrentUser(res.data.data);
        }
      } catch (err) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (usernameOrEmail, password) => {
    try {
      setError(null);
      // Determine if input is email or username
      const isEmail = usernameOrEmail.includes('@');
      const loginData = isEmail 
        ? { email: usernameOrEmail, password } 
        : { username: usernameOrEmail, password };
      
      const res = await api.post('/api/auth/login', loginData);
      if (res.data.success) {
        setCurrentUser(res.data.data);
        navigate('/');
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const res = await api.post('/api/auth/register', userData);
      if (res.data.success) {
        navigate('/login');
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.get('/api/auth/logout');
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 