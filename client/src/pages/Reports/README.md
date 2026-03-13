# Reports Module

The Reports module provides comprehensive analytics and insights for your computer store business data. It allows you to visualize sales performance, monitor inventory levels, track supplier activities, and view transaction details.

## Components

### ReportsHome

The main entry point for the Reports module, presenting available report types in a card-based interface with quick access to common reports.

**Path:** `/reports`

### SalesReport

Detailed analysis of sales data including:
- Total sales amount and order count
- Average order value
- Daily/monthly sales trends
- Top-selling products
- Recent sales transactions

**Path:** `/reports/sales`

**URL Parameters:**
- `range`: Predefined date ranges (`today`, `yesterday`, `last7Days`, `last30Days`, `thisMonth`, `lastMonth`)
- `tab`: Jump to specific tab (`salesTrends`, `topProducts`, `recentSales`)

### InventoryReport

Comprehensive inventory management reporting including:
- Total products count and inventory value
- Low stock and out-of-stock items identification
- Inventory value by category
- Detailed product listing with filtering options

**Path:** `/reports/inventory`

**URL Parameters:**
- `filter`: Filter by stock status (`inStock`, `lowStock`, `outOfStock`)

### TransactionsReport

Shows a list of sales transactions with basic filters:
- Date range
- Payment method
- Payment status

**Path:** `/reports/transactions`

### SupplierReport

Summarizes supplier performance and inventory contribution:
- Total/active suppliers
- Total products supplied
- Inventory value per supplier

**Path:** `/reports/suppliers`

## API Endpoints

The Reports module uses the following API endpoints:

### Sales Statistics
```
GET /api/sales/statistics
```

**Query Parameters:**
- `startDate`: Start date for filtering (YYYY-MM-DD)
- `endDate`: End date for filtering (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 15000000,
    "totalOrders": 120,
    "averageSaleValue": 125000,
    "topProducts": [...],
    "dailySales": [...],
    "recentSales": [...]
  }
}
```

### Products
```
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "count": 100,
  "data": [...]
}
```

### Sales Transactions
```
GET /api/sales/transactions
```

**Query Parameters:**
- `startDate`: Start date for filtering (YYYY-MM-DD)
- `endDate`: End date for filtering (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Page size (default: 10)
- `paymentMethod`: Optional (`cash`, `credit_card`, `debit_card`, `transfer`, `e_wallet`)
- `paymentStatus`: Optional (`pending`, `paid`, `partial`, `cancelled`, `refunded`)

### Supplier Report
```
GET /api/suppliers/report
```

**Query Parameters:**
- `onlyActive`: `true` to include active suppliers only

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalSuppliers": 5,
    "activeSuppliers": 4,
    "totalProducts": 42,
    "totalInventoryValue": 123456789
  },
  "data": [
    {
      "id": 1,
      "name": "Supplier A",
      "contactPerson": "John Doe",
      "phone": "08123456789",
      "email": "supplier@example.com",
      "city": "Bandung",
      "isActive": true,
      "totalProducts": 10,
      "totalStock": 150,
      "inventoryValue": 50000000
    }
  ]
}
```

## Dependencies

The Reports module requires the following dependencies:
- `@mui/material`: UI components
- `@mui/x-date-pickers`: Date picker components
- `date-fns`: Date manipulation library
- `recharts`: Chart visualization library
- `axios`: HTTP client for API requests

## Usage

To view reports, navigate to the Reports section via the sidebar menu. From there, you can:

1. Select a report type from the dashboard
2. Filter data by date range, category, or other criteria
3. Export or print reports as needed
4. Access quick reports for common business insights

## Future Enhancements

Planned improvements for the Reports module include:
- Export to PDF/Excel functionality
- Scheduled email reports
- Advanced filtering options
- Custom report builder
- Comparative analysis (current vs. previous periods)
- Profit margin analysis 