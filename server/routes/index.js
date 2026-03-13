const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const supplierRoutes = require('./supplierRoutes');
const saleRoutes = require('./saleRoutes');
const employeeRoutes = require('./employeeRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/sales', saleRoutes);
router.use('/employees', employeeRoutes);

// Database initialization route (one-time use)
router.get('/init-db', async (req, res) => {
  try {
    const { User, syncModels } = require('../models');
    const results = [];
    
    // 1. Sync database (Create tables if missing)

    results.push('Synchronizing database...');
    const synced = await syncModels();
    if (!synced) {
        throw new Error('Database synchronization failed. Check your connection settings.');
    }
    results.push('Database sync complete.');
    
    // 2. Create admin user
    const adminExists = await User.findOne({ where: { username: 'admin' } });

    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123', // Model hook will hash this
        role: 'admin',
        email: 'admin@example.com'
      });
      results.push('Admin user created (admin / admin123)');
    } else {
      results.push('Admin user already exists');
    }

    // Create owner
    const ownerExists = await User.findOne({ where: { username: 'owner' } });
    if (!ownerExists) {
      await User.create({
        username: 'owner',
        password: 'owner123',
        role: 'owner',
        email: 'owner@example.com'
      });
      results.push('Owner user created (owner / owner123)');
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;