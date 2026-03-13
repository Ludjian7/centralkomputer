const { sequelize } = require('../config/database');
const { User, Product, Supplier } = require('../models');
const bcrypt = require('bcryptjs');

// Seed data
const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        fullName: 'Administrator',
        role: 'admin',
        email: 'admin@example.com'
      });
      console.log('Admin user created');
    }

    // Create owner user if it doesn't exist
    const ownerExists = await User.findOne({ where: { username: 'owner' } });
    if (!ownerExists) {
      await User.create({
        username: 'owner',
        password: bcrypt.hashSync('owner123', 10),
        fullName: 'Store Owner',
        role: 'owner',
        email: 'owner@example.com'
      });
      console.log('Owner user created');
    }

    // Create employee user if it doesn't exist
    const employeeExists = await User.findOne({ where: { username: 'employee' } });
    if (!employeeExists) {
      await User.create({
        username: 'employee',
        password: bcrypt.hashSync('employee123', 10),
        fullName: 'Store Employee',
        role: 'karyawan',
        email: 'employee@example.com'
      });
      console.log('Employee user created');
    }

    // Create suppliers if they don't exist
    const supplier1Exists = await Supplier.findOne({ where: { name: 'Tech Distributors' } });
    let supplier1;
    if (!supplier1Exists) {
      supplier1 = await Supplier.create({
        name: 'Tech Distributors',
        contactPerson: 'John Smith',
        email: 'john@techdist.com',
        phone: '555-1234',
        address: '123 Tech Street',
        notes: 'Main hardware supplier'
      });
      console.log('Supplier 1 created');
    } else {
      supplier1 = supplier1Exists;
    }

    const supplier2Exists = await Supplier.findOne({ where: { name: 'Software Solutions' } });
    let supplier2;
    if (!supplier2Exists) {
      supplier2 = await Supplier.create({
        name: 'Software Solutions',
        contactPerson: 'Jane Doe',
        email: 'jane@softwaresol.com',
        phone: '555-5678',
        address: '456 Software Avenue',
        notes: 'Software and licenses supplier'
      });
      console.log('Supplier 2 created');
    } else {
      supplier2 = supplier2Exists;
    }

    // Create sample physical products
    const sampleProducts = [
      {
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop with RTX 3080',
        type: 'physical',
        sku: 'LAP-GAM-001',
        barcode: '1234567890123',
        price: 1999.99,
        cost: 1599.99,
        quantity: 10,
        minQuantity: 3,
        category: 'Laptops',
        brand: 'MSI',
        location: 'Shelf A1',
        supplierId: supplier1.id
      },
      {
        name: 'Office Desktop PC',
        description: 'Reliable desktop computer for office use',
        type: 'physical',
        sku: 'PC-OFF-001',
        barcode: '1234567890124',
        price: 799.99,
        cost: 599.99,
        quantity: 15,
        minQuantity: 5,
        category: 'Desktops',
        brand: 'Dell',
        location: 'Shelf B2',
        supplierId: supplier1.id
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with Cherry MX switches',
        type: 'physical',
        sku: 'KB-MEC-001',
        barcode: '1234567890125',
        price: 129.99,
        cost: 89.99,
        quantity: 20,
        minQuantity: 8,
        category: 'Peripherals',
        brand: 'Corsair',
        location: 'Shelf C3',
        supplierId: supplier1.id
      }
    ];

    // Create sample service products
    const sampleServices = [
      {
        name: 'PC Repair',
        description: 'Basic computer repair service',
        type: 'service',
        sku: 'SRV-REP-001',
        price: 75.00,
        cost: 25.00,
        category: 'Repair Services',
        duration: 60,
        serviceDetails: 'Includes hardware diagnostics, software troubleshooting, and basic repairs.'
      },
      {
        name: 'Virus Removal',
        description: 'Complete virus and malware removal service',
        type: 'service',
        sku: 'SRV-VIR-001',
        price: 89.99,
        cost: 30.00,
        category: 'Software Services',
        duration: 90,
        serviceDetails: 'Full system scan, malware removal, and security software installation.'
      },
      {
        name: 'Custom PC Building',
        description: 'Custom PC assembly service',
        type: 'service',
        sku: 'SRV-BLD-001',
        price: 149.99,
        cost: 50.00,
        category: 'Building Services',
        duration: 120,
        serviceDetails: 'Assembly of custom PC components, OS installation, and basic setup.'
      }
    ];

    // Insert products if they don't exist
    for (const productData of sampleProducts) {
      const exists = await Product.findOne({ where: { sku: productData.sku } });
      if (!exists) {
        await Product.create(productData);
        console.log(`Product ${productData.name} created`);
      }
    }

    // Insert services if they don't exist
    for (const serviceData of sampleServices) {
      const exists = await Product.findOne({ where: { sku: serviceData.sku } });
      if (!exists) {
        await Product.create(serviceData);
        console.log(`Service ${serviceData.name} created`);
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Run the seed function
seedDatabase(); 