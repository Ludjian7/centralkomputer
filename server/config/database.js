const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.POSTGRES_URL
  ? new Sequelize(process.env.POSTGRES_URL + "?sslmode=require", {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database-toko.sqlite',
      logging: false
    });

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
}; 