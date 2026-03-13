const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { isAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');

// Sale routes - temporarily disabled authentication for testing
router.get('/', saleController.getAllSales);
router.get('/statistics', saleController.getSalesStatistics);
router.get('/transactions', saleController.getTransactionReport);
router.get('/:id', saleController.getSaleById);
router.post('/', saleController.createSale);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router; 