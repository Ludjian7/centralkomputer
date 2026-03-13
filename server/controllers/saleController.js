const { Sale, SaleItem, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all sales with pagination
exports.getAllSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build date filter if provided
    const whereCondition = {};
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereCondition.createdAt = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereCondition.createdAt = {
        [Op.lte]: endDate
      };
    }

    const sales = await Sale.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'type']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return res.status(200).json({
      success: true,
      count: sales.count,
      totalPages: Math.ceil(sales.count / limit),
      currentPage: page,
      data: sales.rows
    });
  } catch (error) {
    console.error('Get all sales error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transactions list for reports with optional filters
exports.getTransactionReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const paymentMethod = req.query.paymentMethod || null;
    const paymentStatus = req.query.paymentStatus || null;

    const whereCondition = {};

    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereCondition.createdAt = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereCondition.createdAt = {
        [Op.lte]: endDate,
      };
    }

    if (paymentMethod) {
      whereCondition.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      whereCondition.paymentStatus = paymentStatus;
    }

    const { count, rows } = await Sale.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: [
        'id',
        'invoiceNumber',
        'customerName',
        'total',
        'paymentMethod',
        'paymentStatus',
        'createdAt',
      ],
    });

    const totalAmount =
      (await Sale.sum('total', {
        where: whereCondition,
      })) || 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalTransactions: count,
        totalAmount,
        page,
        totalPages: Math.ceil(count / limit),
      },
      data: rows,
    });
  } catch (error) {
    console.error('Get transaction report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get single sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new sale
exports.createSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      paymentMethod,
      paymentStatus,
      notes,
      discount: requestDiscount
    } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Sale items are required'
      });
    }

    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    let discount = parseFloat(requestDiscount) || 0;
    let total = 0;
    
    // Validate and prepare items data
    const saleItems = [];
    for (const item of items) {
      // Check if product exists and has enough quantity (for physical products)
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }
      
      // Check stock for physical products
      if (product.type === 'physical' && product.quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }
      
      // Calculate item total
      const itemPrice = parseFloat(item.price || product.price);
      const itemSubtotal = itemPrice * item.quantity;
      
      // Add to sale totals
      subtotal += itemSubtotal;
      
      // Prepare item data
      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
        productName: product.name,
        productSku: product.sku
      });
      
      // For physical products, reduce stock
      if (product.type === 'physical') {
        await product.update(
          { quantity: product.quantity - item.quantity },
          { transaction }
        );
      }
    }
    
    // Apply tax and calculate final total
    tax = subtotal * 0.11; // Example: 11% tax
    total = subtotal + tax - discount;
    
    // Create sale
    const sale = await Sale.create(
      {
        customerName,
        customerPhone,
        customerEmail,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: paymentStatus || 'paid',
        notes,
        userId: req.session.userId || null
      },
      { transaction }
    );
    
    // Create sale items
    for (const item of saleItems) {
      await SaleItem.create(
        {
          ...item,
          saleId: sale.id
        },
        { transaction }
      );
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Fetch complete sale with items
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'type']
            }
          ]
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: completeSale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      paymentStatus,
      notes
    } = req.body;
    
    // Check if sale exists
    const sale = await Sale.findByPk(id);
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    // Update sale basic info
    await sale.update(
      {
        customerName: customerName || sale.customerName,
        customerPhone: customerPhone !== undefined ? customerPhone : sale.customerPhone,
        customerEmail: customerEmail !== undefined ? customerEmail : sale.customerEmail,
        paymentMethod: paymentMethod || sale.paymentMethod,
        paymentStatus: paymentStatus || sale.paymentStatus,
        notes: notes !== undefined ? notes : sale.notes
      },
      { transaction }
    );
    
    // Commit transaction
    await transaction.commit();
    
    // Fetch updated sale
    const updatedSale = await Sale.findByPk(id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'type']
            }
          ]
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Sale updated successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Update sale error:', error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if sale exists
    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: SaleItem,
          as: 'items'
        }
      ]
    });
    
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    // For each sale item, if it's a physical product, restore stock
    for (const item of sale.items) {
      const product = await Product.findByPk(item.productId);
      if (product && product.type === 'physical') {
        await product.update(
          { quantity: product.quantity + item.quantity },
          { transaction }
        );
      }
    }
    
    // Delete sale items
    await SaleItem.destroy({
      where: { saleId: id },
      transaction
    });
    
    // Delete sale
    await sale.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Delete sale error:', error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get sales statistics
exports.getSalesStatistics = async (req, res) => {
  try {
    console.log('Sales statistics request received:', req.query);
    
    const timeRange = req.query.timeRange || 'month';
    let startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // If startDate wasn't provided, calculate it based on timeRange
    if (!startDate) {
      startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }
    }
    
    console.log('Date range:', { startDate, endDate, timeRange });
    
    try {
      // Total sales amount (with error handling)
      const totalSales = await Sale.sum('total', {
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      // Total number of sales (with error handling)
      const totalOrders = await Sale.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      // Average sale value
      const averageSaleValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Daily sales (simplify query if there's an issue)
      let dailySales = [];
      try {
        dailySales = await Sale.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('total')), 'total']
          ],
          where: {
            createdAt: {
              [Op.between]: [startDate, endDate]
            }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });
      } catch (dailyError) {
        console.error('Error getting daily sales:', dailyError);
        // Provide empty array if query fails
        dailySales = [];
      }
      
      // Top selling products (simplify query if there's an issue)
      let topProducts = [];
      try {
        topProducts = await SaleItem.findAll({
          attributes: [
            'productId',
            [sequelize.fn('SUM', sequelize.col('SaleItem.quantity')), 'totalQuantity'],
            [sequelize.fn('SUM', sequelize.col('SaleItem.subtotal')), 'totalAmount']
          ],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'type']
            },
            {
              model: Sale,
              as: 'sale',
              attributes: [],
              where: {
                createdAt: {
                  [Op.between]: [startDate, endDate]
                }
              }
            }
          ],
          group: ['productId', 'product.id'],
          order: [[sequelize.fn('SUM', sequelize.col('SaleItem.quantity')), 'DESC']],
          limit: 5
        });
      } catch (productsError) {
        console.error('Error getting top products:', productsError);
        // Provide empty array if query fails
        topProducts = [];
      }
      
      // Recent sales (simplify query if there's an issue)
      let recentSales = [];
      try {
        recentSales = await Sale.findAll({
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 5
        });
      } catch (recentError) {
        console.error('Error getting recent sales:', recentError);
        // Provide empty array if query fails
        recentSales = [];
      }
      
      return res.status(200).json({
        success: true,
        data: {
          totalSales,
          totalOrders,
          averageSaleValue,
          topProducts,
          dailySales,
          recentSales
        }
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      throw queryError;
    }
  } catch (error) {
    console.error('Get sales statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 