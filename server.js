const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Health Check - Top Priority (No dependencies)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.POSTGRES_URL,
    time: new Date() 
  });
});

// 2. Delayed Route Loading (Isolates crashes in controllers/models)
app.use('/api', (req, res, next) => {
  try {
    // Only require once and cache it
    if (!app.get('routes_loaded')) {
      app.set('routes_instance', require('./server/routes'));
      app.set('routes_loaded', true);
    }
    app.get('routes_instance')(req, res, next);
  } catch (err) {
    console.error('CRITICAL ERROR LOADING ROUTES:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load application routes',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// Start server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

 