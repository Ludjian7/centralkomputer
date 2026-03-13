const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { isAuthenticated, authorizeRoles } = require('../middleware/authMiddleware');

// Supplier routes - temporarily disabled authentication for testing
router.get('/', supplierController.getAllSuppliers);
router.get('/report', supplierController.getSupplierReport);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router; 