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
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      try {
        const res = await api.get('/api/auth/me');
        if (res.data.success) {
          // Update stored user data if needed (role changes, etc)
          const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...res.data.data };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.log('Not authenticated');
        if (err.response?.status === 401) {
          setCurrentUser(null);
          localStorage.removeItem('user');
        }
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
        const userData = res.data.data;
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
    return false;
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
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('user');
      navigate('/login');
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