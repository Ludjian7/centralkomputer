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

// Add other routes as they are created
// router.use('/reports', reportRoutes);
// router.use('/transactions', transactionRoutes);

module.exports = router;