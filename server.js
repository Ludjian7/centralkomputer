const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Routes
const routes = require('./server/routes');


// Initialize Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // More permissive for initial troubleshooting
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (Always reachable)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', time: new Date() });
});

// Skip auto DB init in production to avoid cold-start timeouts
if (process.env.NODE_ENV !== 'production') {
  const { testConnection } = require('./server/config/database');
  const { syncModels } = require('./server/models');
  testConnection().then(connected => {
    if (connected) syncModels();
  });
}



// API Routes
app.use('/api', routes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
 