const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Employee = require('./Employee');

// Import other models as they are created
// const Customer = require('./Customer');
// const Transaction = require('./Transaction');

// Define model relationships
// Product belongs to Supplier
Product.belongsTo(Supplier, {
  foreignKey: 'supplierId',
  as: 'supplier'
});

// Supplier has many Products
Supplier.hasMany(Product, {
  foreignKey: 'supplierId',
  as: 'products'
});

// Sale has many SaleItems
Sale.hasMany(SaleItem, {
  foreignKey: 'saleId',
  as: 'items',
  onDelete: 'CASCADE'
});

// SaleItem belongs to Sale
SaleItem.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale'
});

// SaleItem belongs to Product
SaleItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Product has many SaleItems
Product.hasMany(SaleItem, {
  foreignKey: 'productId',
  as: 'saleItems'
});

// Sale belongs to User (who created the sale)
Sale.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User has many Sales
User.hasMany(Sale, {
  foreignKey: 'userId',
  as: 'sales'
});

// If serviceTechnician is a User reference
SaleItem.belongsTo(User, {
  foreignKey: 'serviceTechnician',
  as: 'technician'
});

// Sync all models with database
const syncModels = async () => {
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF');
    await sequelize.sync();
    await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('All models were synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Error synchronizing models:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Product,
  Supplier,
  Sale,
  SaleItem,
  Employee,
  // Export other models as they are created
  // Customer,
  // Transaction,
  syncModels
}; 