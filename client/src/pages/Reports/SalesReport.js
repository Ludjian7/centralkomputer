import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Card, 
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { 
  DatePicker
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ReportsNav from './ReportsNav';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { format, subDays, startOfMonth, endOfMonth, isValid } from 'date-fns';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const SalesReport = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Date filters
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('lastMonth');
  
  // Sales data
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageSaleValue: 0,
    topProducts: [],
    dailySales: [],
    recentSales: []
  });

  // Handler for tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch sales statistics from the API
  const fetchSalesData = useCallback(async () => {
    if (!isValid(startDate) || !isValid(endDate)) {
      setError('Please select valid dates');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await axios.get('/api/sales/statistics', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (response.data.success) {
        setSalesData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch sales data');
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(err.message || 'Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Handle date range changes
  const handleDateRangeChange = (event) => {
    const range = event.target.value;
    setDateRange(range);
    
    const today = new Date();
    let newStartDate;
    let newEndDate = today;
    
    switch (range) {
      case 'today':
        newStartDate = today;
        break;
      case 'yesterday':
        newStartDate = subDays(today, 1);
        newEndDate = subDays(today, 1);
        break;
      case 'last7Days':
        newStartDate = subDays(today, 6);
        break;
      case 'last30Days':
        newStartDate = subDays(today, 29);
        break;
      case 'thisMonth':
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newStartDate = startOfMonth(lastMonth);
        newEndDate = endOfMonth(lastMonth);
        break;
      case 'custom':
        // Keep current custom dates
        return;
      default:
        newStartDate = subDays(today, 29);
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Initialize filters and tab from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rangeParam = params.get('range');
    const tabParam = params.get('tab');

    const allowedRanges = new Set([
      'today',
      'yesterday',
      'last7Days',
      'last30Days',
      'thisMonth',
      'lastMonth',
      'custom',
    ]);

    if (rangeParam && allowedRanges.has(rangeParam)) {
      handleDateRangeChange({ target: { value: rangeParam } });
    }

    if (tabParam) {
      const tabMapping = {
        salesTrends: 0,
        topProducts: 1,
        recentSales: 2,
      };

      if (tabMapping[tabParam] !== undefined) {
        setTabValue(tabMapping[tabParam]);
      }
    }
  }, [location.search]);

  // Initial data fetching
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Fetch data when date range changes, but not for custom
  useEffect(() => {
    if (dateRange !== 'custom') {
      fetchSalesData();
    }
  }, [startDate, endDate, dateRange, fetchSalesData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy');
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Daily sales chart data
    const dailySalesData = salesData.dailySales.map(day => ({
      date: formatDate(day.date),
      sales: parseFloat(day.total),
      orders: parseInt(day.count)
    }));

    // Top products chart data
    const topProductsData = salesData.topProducts.map(product => ({
      name: product.product.name,
      value: parseInt(product.totalQuantity)
    }));

    return { dailySalesData, topProductsData };
  };

  // Chart data
  const { dailySalesData, topProductsData } = salesData.dailySales ? prepareChartData() : { dailySalesData: [], topProductsData: [] };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sales Reports
        </Typography>
        <ReportsNav />
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={handleDateRangeChange}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="last7Days">Last 7 Days</MenuItem>
                  <MenuItem value="last30Days">Last 30 Days</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newDate) => {
                    setStartDate(newDate);
                    setDateRange('custom');
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  disabled={dateRange !== 'custom'}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => {
                    setEndDate(newDate);
                    setDateRange('custom');
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  disabled={dateRange !== 'custom'}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={fetchSalesData}
                disabled={loading || !isValid(startDate) || !isValid(endDate) || dateRange !== 'custom'}
              >
                {loading ? 'Loading...' : 'Apply Filter'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

      {/* Sales summary cards */}
      {!loading && !error && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Sales
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(salesData.totalSales)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4">
                  {salesData.totalOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Order Value
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(salesData.averageSaleValue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs for different report views */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Sales Trends" />
          <Tab label="Top Products" />
          <Tab label="Recent Sales" />
        </Tabs>
      </Box>

      {/* Tab content */}
      {!loading && !error && (
        <>
          {/* Sales Trends */}
          {tabValue === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Sales Trend
                </Typography>
                <Box sx={{ height: 400, mt: 2 }}>
                  {dailySalesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailySalesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="sales" 
                          name="Sales Amount" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="orders" 
                          name="Number of Orders" 
                          stroke="#82ca9d" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No sales data available for the selected period
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Top Products */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Selling Products
                    </Typography>
                    <Box sx={{ height: 400, mt: 2 }}>
                      {topProductsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={topProductsData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {topProductsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body1" color="text.secondary">
                            No product data available for the selected period
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Products by Sales
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Quantity Sold</TableCell>
                            <TableCell align="right">Revenue</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {salesData.topProducts.length > 0 ? (
                            salesData.topProducts.map((product) => (
                              <TableRow key={product.productId}>
                                <TableCell>{product.product.name}</TableCell>
                                <TableCell>{product.product.type}</TableCell>
                                <TableCell align="right">{product.totalQuantity}</TableCell>
                                <TableCell align="right">{formatCurrency(product.totalAmount)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No product data available for the selected period
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Recent Sales */}
          {tabValue === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Sales
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Payment Status</TableCell>
                        <TableCell>Payment Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesData.recentSales.length > 0 ? (
                        salesData.recentSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                            <TableCell>{sale.invoiceNumber || `INV-${String(sale.id).padStart(6, '0')}`}</TableCell>
                            <TableCell>{sale.customerName || 'Walk-in Customer'}</TableCell>
                            <TableCell align="right">{formatCurrency(sale.total)}</TableCell>
                            <TableCell>{sale.paymentStatus.toUpperCase()}</TableCell>
                            <TableCell>{sale.paymentMethod.replace('_', ' ').toUpperCase()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No recent sales data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default SalesReport; 