const bcrypt = require('bcryptjs');
const { User, Supplier, Product, Sale, SaleItem, sequelize } = require('../models');

// Function untuk menghasilkan invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${month}${random}`;
};

// Seed data dummy
const seedData = async () => {
  try {
    console.log('Mulai mengisi data dummy...');

    // Hapus data yang ada (opsional)
    // PostgreSQL tidak menggunakan FOREIGN_KEY_CHECKS
    try {
      await SaleItem.destroy({ truncate: { cascade: true } });
      await Sale.destroy({ truncate: { cascade: true } });
      await Product.destroy({ truncate: { cascade: true } });
      await Supplier.destroy({ truncate: { cascade: true } });
      await User.destroy({ truncate: { cascade: true } });
      console.log('Data lama dibersihkan');
    } catch (error) {
      console.log('Gagal membersihkan data lama, melanjutkan proses:', error.message);
    }

    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        username: 'karyawan',
        email: 'karyawan@example.com',
        password: hashedPassword,
        role: 'karyawan'
      },
      {
        username: 'owner',
        email: 'owner@example.com',
        password: hashedPassword,
        role: 'owner'
      }
    ]);
    console.log(`${users.length} users dibuat`);

    // Seed Suppliers
    const suppliers = await Supplier.bulkCreate([
      {
        name: 'PT Komputer Sejahtera',
        contactPerson: 'Budi Santoso',
        email: 'budi@komputersejahtera.com',
        phone: '081234567890',
        address: 'Jl. Komputer No. 123',
        city: 'Jakarta',
        postalCode: '12345'
      },
      {
        name: 'CV Elektronik Maju',
        contactPerson: 'Siti Aminah',
        email: 'siti@elektronikmaju.com',
        phone: '087654321098',
        address: 'Jl. Elektronik No. 456',
        city: 'Bandung',
        postalCode: '54321'
      },
      {
        name: 'UD Komponen Lengkap',
        contactPerson: 'Agus Widodo',
        email: 'agus@komponenlengkap.com',
        phone: '089876543210',
        address: 'Jl. Komponen No. 789',
        city: 'Surabaya',
        postalCode: '67890'
      }
    ]);
    console.log(`${suppliers.length} suppliers dibuat`);

    // Seed Products
    const products = await Product.bulkCreate([
      {
        name: 'Laptop ASUS ROG',
        description: 'Laptop gaming dengan performa tinggi',
        sku: 'LP-ASUS-001',
        barcode: '8901234567890',
        price: 15000000,
        cost: 13000000,
        quantity: 10,
        minQuantity: 3,
        category: 'Laptop',
        brand: 'ASUS',
        location: 'Rak A1',
        supplierId: suppliers[0].id
      },
      {
        name: 'Monitor LG 24 inch',
        description: 'Monitor LED dengan resolusi Full HD',
        sku: 'MN-LG-001',
        barcode: '8901234567891',
        price: 2500000,
        cost: 2000000,
        quantity: 15,
        minQuantity: 5,
        category: 'Monitor',
        brand: 'LG',
        location: 'Rak B2',
        supplierId: suppliers[1].id
      },
      {
        name: 'Keyboard Mechanical RGB',
        description: 'Keyboard gaming dengan backlight RGB',
        sku: 'KB-MCH-001',
        barcode: '8901234567892',
        price: 1200000,
        cost: 900000,
        quantity: 20,
        minQuantity: 8,
        category: 'Keyboard',
        brand: 'Logitech',
        location: 'Rak C3',
        supplierId: suppliers[2].id
      },
      {
        name: 'Mouse Gaming Wireless',
        description: 'Mouse gaming tanpa kabel dengan sensor presisi tinggi',
        sku: 'MS-GM-001',
        barcode: '8901234567893',
        price: 800000,
        cost: 600000,
        quantity: 25,
        minQuantity: 10,
        category: 'Mouse',
        brand: 'Logitech',
        location: 'Rak C4',
        supplierId: suppliers[2].id
      },
      {
        name: 'SSD 1TB',
        description: 'Solid State Drive dengan kapasitas 1TB',
        sku: 'SSD-1TB-001',
        barcode: '8901234567894',
        price: 1800000,
        cost: 1500000,
        quantity: 12,
        minQuantity: 5,
        category: 'Storage',
        brand: 'Samsung',
        location: 'Rak D1',
        supplierId: suppliers[0].id
      }
    ]);
    console.log(`${products.length} products dibuat`);

    // Seed Sales dan SaleItems
    const sales = [];
    for (let i = 0; i < 10; i++) {
      // Buat sale
      const sale = await Sale.create({
        invoiceNumber: generateInvoiceNumber(),
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random dalam 30 hari terakhir
        userId: users[Math.floor(Math.random() * users.length)].id,
        customerName: ['Joko', 'Dewi', 'Rudi', 'Nina', 'Budi'][Math.floor(Math.random() * 5)],
        customerPhone: `08${Math.floor(Math.random() * 10000000000)}`,
        paymentMethod: ['cash', 'credit_card', 'transfer'][Math.floor(Math.random() * 3)],
        paymentStatus: 'paid',
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0
      });
      
      sales.push(sale);
      
      // Tambahkan 1-3 items ke sale
      const numItems = Math.floor(Math.random() * 3) + 1;
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(product.price);
        const discount = 0;
        const total = quantity * price - discount;
        
        await SaleItem.create({
          saleId: sale.id,
          productId: product.id,
          quantity: quantity,
          price: price,
          discount: discount,
          total: total,
          productName: product.name,
          productSku: product.sku
        });
        
        subtotal += total;
        
        // Update stok produk
        await product.update({
          quantity: product.quantity - quantity
        });
      }
      
      // Update total sale
      const tax = subtotal * 0.11; // PPN 11%
      const total = subtotal + tax;
      
      await sale.update({
        subtotal: subtotal,
        tax: tax,
        total: total
      });
    }
    console.log(`${sales.length} sales dengan items dibuat`);

    console.log('Selesai mengisi data dummy!');
    return true;
  } catch (error) {
    console.error('Error saat mengisi data dummy:', error);
    return false;
  }
};

// Export fungsi untuk digunakan dari file lain
module.exports = seedData;

// Jika file ini dijalankan langsung
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Proses seeding selesai');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} 