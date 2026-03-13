const { Sequelize } = require('sequelize');
require('pg'); // Explicitly require for Vercel bundler detection
require('dotenv').config();

const dbUrl = process.env.POSTGRES_URL;

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectModule: require('pg'),
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
    console.log('Database connection established successfully.');
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
 