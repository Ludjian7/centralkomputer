const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_phone'
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_email'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'cash',
    field: 'payment_method',
    validate: {
      isIn: [['cash', 'credit_card', 'debit_card', 'transfer', 'e_wallet']]
    }
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status',
    validate: {
      isIn: [['pending', 'paid', 'partial', 'cancelled', 'refunded']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'invoice_number'
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (sale) => {
      // Generate invoice number pattern: INV-YYYYMMDD-XXXX
      if (!sale.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Count existing sales for today to generate sequential number
        const todaySales = await Sale.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(date.setHours(0, 0, 0, 0))
            }
          }
        });
        
        // Format invoice number
        const sequence = String(todaySales + 1).padStart(4, '0');
        sale.invoiceNumber = `INV-${year}${month}${day}-${sequence}`;
      }
    }
  }
});

module.exports = Sale; 