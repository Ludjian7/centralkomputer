const { Supplier, Product } = require('../models');
const { Op, fn, col } = require('sequelize');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Get all suppliers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get supplier summary for reports
exports.getSupplierReport = async (req, res) => {
  try {
    const onlyActive = req.query.onlyActive === 'true';

    const supplierWhere = {};
    if (onlyActive) {
      supplierWhere.isActive = true;
    }

    const suppliers = await Supplier.findAll({
      where: supplierWhere,
      include: [
        {
          model: Product,
          as: 'products',
          attributes: [
            'id',
            'name',
            'sku',
            'quantity',
            'price',
            'cost',
          ],
        },
      ],
      order: [['name', 'ASC']],
    });

    const data = suppliers.map((supplier) => {
      const products = supplier.products || [];

      const totalProducts = products.length;
      const totalStock = products.reduce(
        (sum, p) => sum + (p.quantity || 0),
        0,
      );
      const inventoryValue = products.reduce(
        (sum, p) => sum + (parseFloat(p.cost || 0) * (p.quantity || 0)),
        0,
      );

      return {
        id: supplier.id,
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        city: supplier.city,
        isActive: supplier.isActive,
        totalProducts,
        totalStock,
        inventoryValue,
      };
    });

    const summary = {
      totalSuppliers: data.length,
      activeSuppliers: data.filter((s) => s.isActive).length,
      totalProducts: data.reduce((sum, s) => sum + s.totalProducts, 0),
      totalInventoryValue: data.reduce(
        (sum, s) => sum + s.inventoryValue,
        0,
      ),
    };

    return res.status(200).json({
      success: true,
      summary,
      data,
    });
  } catch (error) {
    console.error('Get supplier report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get single supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'sku', 'quantity', 'price']
        }
      ]
    });
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      postalCode,
      notes
    } = req.body;
    
    // Create supplier
    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      postalCode,
      notes
    });
    
    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      postalCode,
      notes,
      isActive
    } = req.body;
    
    // Check if supplier exists
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Update supplier
    await supplier.update({
      name: name || supplier.name,
      contactPerson: contactPerson !== undefined ? contactPerson : supplier.contactPerson,
      email: email !== undefined ? email : supplier.email,
      phone: phone !== undefined ? phone : supplier.phone,
      address: address !== undefined ? address : supplier.address,
      city: city !== undefined ? city : supplier.city,
      postalCode: postalCode !== undefined ? postalCode : supplier.postalCode,
      notes: notes !== undefined ? notes : supplier.notes,
      isActive: isActive !== undefined ? isActive : supplier.isActive
    });
    
    return res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete supplier (soft delete by setting isActive to false)
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier exists
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Check if supplier has associated products
    const productCount = await Product.count({ where: { supplierId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. ${productCount} products are associated with this supplier.`
      });
    }
    
    // Soft delete by setting isActive to false
    await supplier.update({ isActive: false });
    
    return res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 