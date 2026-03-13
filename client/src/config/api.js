import axios from 'axios';

// In production (Vercel), use relative URL so /api/* routes to the same domain.
// In development, proxy through localhost:5001 (where Express runs).
const isProduction = process.env.NODE_ENV === 'production';

const api = axios.create({
  baseURL: isProduction ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:5001'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    // Attach JWT token from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const { token } = JSON.parse(userData);
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
