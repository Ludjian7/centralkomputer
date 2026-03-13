const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sale_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serviceSchedule: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'service_schedule'
  },
  serviceStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'service_status',
    validate: {
      isIn: [['scheduled', 'in_progress', 'completed', 'cancelled']]
    }
  },
  serviceTechnician: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'service_technician'
  },
  // Menyimpan data produk saat penjualan untuk referensi historis
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_name'
  },
  productSku: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'product_sku'
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (saleItem) => {
      // Calculate subtotal based on price and quantity
      if (saleItem.price && saleItem.quantity) {
        saleItem.subtotal = saleItem.price * saleItem.quantity - (saleItem.discount || 0);
      }
    }
  }
});

module.exports = SaleItem; 