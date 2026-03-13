# Central Computer Management System

Sistem manajemen toko komputer berbasis web untuk mengelola produk, penjualan, supplier, dan laporan.

## Deskripsi

Central Computer adalah aplikasi manajemen toko komputer yang dibangun dengan arsitektur client-server. Aplikasi ini memungkinkan pengelolaan inventaris produk (barang fisik dan jasa layanan), transaksi penjualan, data supplier, serta laporan penjualan dan inventaris.

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Material UI (MUI) |
| Backend | Express.js |
| Database | SQLite (Sequelize ORM) |
| Authentication | bcryptjs, express-session |
| Charts | Chart.js, Recharts |
| Build Tool | react-app-rewired |

## Struktur Project

```
central/
├── client/                    # React Frontend
│   ├── public/
│   └── src/
│       ├── components/        # Komponen UI
│       ├── config/           # Konfigurasi API
│       ├── context/          # Auth Context
│       ├── pages/            # Halaman (Auth, Dashboard, Products, etc)
│       ├── theme/           # Tema MUI
│       ├── App.js
│       └── index.js
├── server/                    # Express Backend
│   ├── config/               # Konfigurasi Database
│   ├── controllers/         # Logika Bisnis
│   ├── middleware/          # Middleware Autentikasi
│   ├── models/              # Model Sequelize
│   ├── routes/              # API Routes
│   └── seeders/             # Data Awal
├── server.js                 # Entry Point Backend
└── package.json
```

## Database Models

### User
- id, username, email, password, role (admin/owner/karyawan), isActive, timestamps

### Product
- id, name, description, type (physical/service), sku, barcode, price, cost, quantity, minQuantity, category, brand, location, isActive, image, duration, serviceDetails, supplierId, timestamps

### Supplier
- id, name, contactPerson, email, phone, address, notes, isActive, timestamps

### Sale
- id, customerName, customerPhone, customerEmail, subtotal, tax, discount, total, paymentMethod, paymentStatus, invoiceNumber, notes, userId, timestamps

### SaleItem
- id, saleId, productId, quantity, price, subtotal, productName, productSku, serviceTechnician, timestamps

## Relasi Database

```
┌─────────────┐       ┌─────────────┐
│    User     │       │   Supplier  │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ username    │       │ name        │
│ email       │       │ contact     │
│ password    │       │ email       │
│ role        │       │ phone       │
│ isActive    │       │ address     │
└──────┬──────┘       └──────┬──────┘
       │                    │
       │ 1:N                │ 1:N
       ▼                    ▼
┌─────────────┐       ┌─────────────┐
│    Sale     │       │  Product    │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ total       │       │ name        │
│ subtotal    │       │ sku (unique)│
│ tax         │       │ price       │
│ discount    │       │ cost        │
│ invoiceNum  │       │ quantity    │
│ userId (FK) │       │ supplierId  │
│ paymentMethod│      │ (FK)        │
│ paymentStatus│      │ type        │
└──────┬──────┘       └──────┬──────┘
       │                      │
       │ 1:N                  │ 1:N
       ▼                      ▼
┌─────────────┐       ┌─────────────┐
│  SaleItem   │       │             │
├─────────────┤       │             │
│ id (PK)     │       │             │
│ saleId (FK) │◄─────│             │
│ productId(FK)│◄──────             │
│ quantity    │                     │
│ price       │                     │
│ subtotal    │                     │
│ productName │                     │
│ productSku  │                     │
└─────────────┘                     │
```

**Penjelasan Relasi:**
- User (1) ────< Sale (N): Setiap penjualan dibuat oleh satu user
- Supplier (1) ────< Product (N): Setiap produk memiliki satu supplier
- Sale (1) ────< SaleItem (N): Setiap penjualan memiliki banyak item
- Product (1) ────< SaleItem (N): Setiap produk bisa ada di banyak item penjualan

## API Endpoints

### Authentication
- POST /api/auth/login - Login
- POST /api/auth/register - Register
- GET /api/auth/logout - Logout
- GET /api/auth/me - Get current user

### Products
- GET /api/products - All products
- GET /api/products/:id - Get by ID
- GET /api/products/low-stock - Low stock products
- POST /api/products - Create
- PUT /api/products/:id - Update
- DELETE /api/products/:id - Delete

### Suppliers
- GET /api/suppliers, GET /api/suppliers/:id, POST /api/suppliers, PUT /api/suppliers/:id, DELETE /api/suppliers/:id

### Sales
- GET /api/sales, GET /api/sales/:id, GET /api/sales/statistics, POST /api/sales, PUT /api/sales/:id, DELETE /api/sales/:id

## User Roles
- admin: Full akses
- owner: Full akses (tanpa manajemen user)
- karyawan: Terbatas

## Fitur per Modul

### Authentication
- Login dengan username atau email
- Register user baru
- Session-based authentication
- Logout
- Role-based access control (admin/owner/karyawan)

### Dashboard
- **Stats Cards:**
  - Total Sales (penjualan dalam periode)
  - Orders (jumlah pesanan)
  - Average Order Value (rata-rata nilai pesanan)
  - Low Stock (produk di bawah minimum)
- **Charts:**
  - Sales Trend (Line Chart) - menampilkan grafik penjualan harian
  - Top Products (Pie Chart) - produk terlaris
- **Lists:**
  - Low Stock Products - daftar produk yang stoknya di bawah minimum
  - Recent Sales - penjualan terbaru
- **Filter:** Time range (week/month/quarter/year)

### Products (Manajemen Produk)
- **Tipe Produk:**
  - Physical (barang fisik) - punya stok
  - Service (jasa layanan) - tidak punya stok, punya durasi
- **Fitur:**
  - List semua produk dengan filter type
  - Tambah/Edit/Delete produk
  - SKU & Barcode
  - Harga jual & Harga beli (cost)
  - Stok quantity & Minimum quantity
  - Kategori & Brand
  - Lokasi penyimpanan
  - Gambar produk
  - Asociasi dengan supplier
- **Service-specific:**
  - Duration (durasi dalam menit)
  - Service details (deskripsi layanan)

### Sales (Transaksi Penjualan)
- **Fitur:**
  - Buat transaksi baru
  - Tambah multiple items (produk/jasa)
  - Auto-kalkulasi:
    - Subtotal = Σ(price × quantity)
    - Tax = 11% dari subtotal
    - Total = Subtotal + Tax - Discount
  - Customer info (nama, phone, email)
- **Payment:**
  - Methods: cash, credit_card, debit_card, transfer, e_wallet
  - Status: pending, paid, partial, cancelled, refunded
- **Invoice:**
  - Auto-generate: INV-YYYYMMDD-XXXX
  - Format: INV-20240312-0001
- **Stock Management:**
  - Physical: stok berkurang saat penjualan
  - Service: tidak affect stok
  - Delete sale → restore stock

### Suppliers (Manajemen Supplier)
- **Fitur:**
  - CRUD supplier
  - Contact person
  - Phone & Email
  - Address
  - Notes
  - Associated products list

### Reports (Laporan)
- Sales Report - laporan penjualan berdasarkan tanggal
- Inventory Report - laporan inventaris/stok

## Instalasi

```bash
# Install dependencies
npm install
cd client && npm install

# Jalankan seeder
npm run seed

# Jalankan aplikasi
npm run dev        # Backend (port 5001)
npm run client     # Frontend (port 3000)
npm run dev:full   # Both
```

## Kredensial Default
- admin / admin123 (admin)
- owner / owner123 (owner)  
- employee / employee123 (karyawan)

## Scripts
- npm start - Production server
- npm run dev - Development server
- npm run client - React frontend
- npm run dev:full - Full dev mode
- npm run seed - Seed database
- npm run build - Build React app

## Environment Variables

Buat file `.env` di root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database (SQLite - Default)
DB_DIALECT=sqlite
DB_STORAGE=toko_komputer.sqlite

# Database (PostgreSQL - Optional)
# DATABASE_URL=postgresql://user:password@host:5432/dbname
# DB_DIALECT=postgres

# Session
SESSION_SECRET=your-secret-key-min-32-characters-here

# Production (Vercel/Netlify)
# NODE_ENV=production
# FRONTEND_URL=https://your-app.vercel.app
```

### Penjelasan Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| PORT | 5001 | Port server backend |
| NODE_ENV | development | development/production |
| DB_DIALECT | sqlite | Jenis database |
| DB_STORAGE | toko_komputer.sqlite | Nama file SQLite |
| DATABASE_URL | - | PostgreSQL connection string |
| SESSION_SECRET | - | Secret key untuk session |
| FRONTEND_URL | - | URL frontend untuk CORS (production) |

### switch Database (SQLite ke PostgreSQL)

1. Install PostgreSQL driver:
```bash
npm install pg pg-hstore
```

2. Update `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/toko_komputer
DB_DIALECT=postgres
```

3. Hapus file SQLite lama (opsional):
```bash
rm toko_komputer.sqlite
```

4. Run ulang:
```bash
npm run seed
```
