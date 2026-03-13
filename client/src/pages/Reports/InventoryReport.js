import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../config/api';
import ReportsNav from './ReportsNav';

const InventoryReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const location = useLocation();
  
  // Fetch products data
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/products');
      if (response.data.success) {
        const productsData = response.data.data;
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData
          .filter(p => p.category)
          .map(p => p.category))];
        setCategories(uniqueCategories);
        
        // Calculate inventory summary
        const physicalProducts = productsData.filter(p => p.type === 'physical');
        const lowStock = physicalProducts.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;
        const outOfStock = physicalProducts.filter(p => p.quantity === 0).length;
        const totalValue = physicalProducts.reduce((sum, product) => {
          return sum + (parseFloat(product.cost) * product.quantity);
        }, 0);
        
        setInventorySummary({
          totalProducts: physicalProducts.length,
          totalValue,
          lowStockItems: lowStock,
          outOfStockItems: outOfStock
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Initialize filters from URL query parameters and fetch products
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');

    if (filterParam === 'inStock' || filterParam === 'lowStock' || filterParam === 'outOfStock') {
      setStockFilter(filterParam);
    }

    fetchProducts();
  }, [location.search]);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        (product.sku && product.sku.toLowerCase().includes(lowerCaseQuery)) ||
        (product.barcode && product.barcode.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply stock filter (only for physical products)
    if (stockFilter !== 'all') {
      result = result.filter(product => {
        if (product.type !== 'physical') return false;
        
        switch (stockFilter) {
          case 'inStock':
            return product.quantity > product.minQuantity;
          case 'lowStock':
            return product.quantity > 0 && product.quantity <= product.minQuantity;
          case 'outOfStock':
            return product.quantity === 0;
          default:
            return true;
        }
      });
    }
    
    setFilteredProducts(result);
  }, [products, searchQuery, categoryFilter, stockFilter]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Get stock status chip
  const getStockStatusChip = (product) => {
    if (product.type !== 'physical') {
      return <Chip label="Service" color="info" size="small" />;
    }
    
    if (product.quantity === 0) {
      return <Chip 
        icon={<ErrorIcon />} 
        label="Out of Stock" 
        color="error" 
        size="small" 
      />;
    }
    
    if (product.quantity <= product.minQuantity) {
      return <Chip 
        icon={<WarningIcon />} 
        label="Low Stock" 
        color="warning" 
        size="small" 
      />;
    }
    
    return <Chip 
      icon={<CheckCircleIcon />} 
      label="In Stock" 
      color="success" 
      size="small" 
    />;
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    // Filter physical products with categories
    const topCategories = categories.map(category => {
      const productsInCategory = products.filter(
        p => p.type === 'physical' && p.category === category
      );
      
      const totalStock = productsInCategory.reduce((sum, p) => sum + p.quantity, 0);
      const totalValue = productsInCategory.reduce(
        (sum, p) => sum + (parseFloat(p.cost) * p.quantity), 0
      );
      
      return {
        category,
        stock: totalStock,
        value: totalValue
      };
    });
    
    // Sort by total value descending
    return topCategories.sort((a, b) => b.value - a.value).slice(0, 5);
  };
  
  const chartData = prepareChartData();
  
  // Calculate stock value by cost
  const calculateProductValue = (product) => {
    if (product.type !== 'physical') return 0;
    return parseFloat(product.cost) * product.quantity;
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Report
        </Typography>
        <ReportsNav />
      </Box>
      
      {/* Error display */}
      {error && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Summary cards */}
      {!loading && !error && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4">
                  {inventorySummary.totalProducts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Physical products in inventory
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inventory Value
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(inventorySummary.totalValue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total cost of inventory
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: inventorySummary.lowStockItems > 0 ? 'warning.light' : 'inherit' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Low Stock Items
                </Typography>
                <Typography variant="h4">
                  {inventorySummary.lowStockItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products below minimum quantity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: inventorySummary.outOfStockItems > 0 ? 'error.light' : 'inherit' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Out of Stock
                </Typography>
                <Typography variant="h4">
                  {inventorySummary.outOfStockItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products with zero quantity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Inventory by category chart */}
      {!loading && !error && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inventory Value by Category
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Inventory Value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Filters */}
      {!loading && !error && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by name, SKU, barcode"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stock Status</InputLabel>
                  <Select
                    value={stockFilter}
                    label="Stock Status"
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Products</MenuItem>
                    <MenuItem value="inStock">In Stock</MenuItem>
                    <MenuItem value="lowStock">Low Stock</MenuItem>
                    <MenuItem value="outOfStock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Products table */}
      {!loading && !error && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inventory Details
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Min Qty</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell align="right">{formatCurrency(product.cost)}</TableCell>
                          <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                          <TableCell align="right">{product.type === 'physical' ? product.quantity : 'N/A'}</TableCell>
                          <TableCell align="right">{product.type === 'physical' ? product.minQuantity : 'N/A'}</TableCell>
                          <TableCell align="right">
                            {product.type === 'physical' ? formatCurrency(calculateProductValue(product)) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getStockStatusChip(product)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default InventoryReport; 