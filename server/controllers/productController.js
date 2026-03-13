const { Product, Supplier, sequelize } = require('../models');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Filter condition based on product type if specified
    const whereCondition = {};
    if (type === 'physical' || type === 'service') {
      whereCondition.type = type;
    }
    
    const products = await Product.findAll({
      where: whereCondition,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'contactPerson', 'phone', 'email']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      sku,
      barcode,
      price,
      cost,
      quantity,
      minQuantity,
      category,
      brand,
      location,
      supplierId,
      image,
      duration,
      serviceDetails
    } = req.body;
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    
    // Check if supplier exists if supplierId is provided
    if (supplierId) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      type: type || 'physical',
      sku,
      barcode,
      price,
      cost,
      quantity: type === 'service' ? 0 : (quantity || 0),
      minQuantity: type === 'service' ? 0 : (minQuantity || 5),
      category,
      brand,
      location,
      supplierId,
      image,
      duration: type === 'service' ? duration : null,
      serviceDetails: type === 'service' ? serviceDetails : null
    });
    
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      sku,
      barcode,
      price,
      cost,
      quantity,
      minQuantity,
      category,
      brand,
      location,
      supplierId,
      isActive,
      image,
      duration,
      serviceDetails
    } = req.body;
    
    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if SKU already exists (if changed)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ where: { sku } });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }
    
    // Check if supplier exists if supplierId is provided
    if (supplierId && supplierId !== product.supplierId) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }
    
    // Determine product type
    const productType = type || product.type;
    
    // Update product
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      type: productType,
      sku: sku || product.sku,
      barcode: barcode !== undefined ? barcode : product.barcode,
      price: price !== undefined ? price : product.price,
      cost: cost !== undefined ? cost : product.cost,
      quantity: productType === 'service' ? 0 : (quantity !== undefined ? quantity : product.quantity),
      minQuantity: productType === 'service' ? 0 : (minQuantity !== undefined ? minQuantity : product.minQuantity),
      category: category !== undefined ? category : product.category,
      brand: brand !== undefined ? brand : product.brand,
      location: location !== undefined ? location : product.location,
      supplierId: supplierId !== undefined ? supplierId : product.supplierId,
      isActive: isActive !== undefined ? isActive : product.isActive,
      image: image !== undefined ? image : product.image,
      duration: productType === 'service' ? (duration !== undefined ? duration : product.duration) : null,
      serviceDetails: productType === 'service' ? (serviceDetails !== undefined ? serviceDetails : product.serviceDetails) : null
    });
    
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete product (soft delete by setting isActive to false)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Soft delete by setting isActive to false
    await product.update({ isActive: false });
    
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get low stock products (quantity below minQuantity)
exports.getLowStockProducts = async (req, res) => {
  try {
    // Import operator explicitly
    const { Op } = require('sequelize');
    
    const products = await Product.findAll({
      where: {
        isActive: true,
        type: 'physical',
        quantity: {
          [Op.lt]: sequelize.col('min_quantity')
        }
      },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'contactPerson', 'phone', 'email']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 