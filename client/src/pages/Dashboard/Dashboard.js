import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Avatar,
  IconButton,
  LinearProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
// LayoutStyles not imported (unused in this component)

// Chart components
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';

// Icons
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ComputerIcon from '@mui/icons-material/Computer';
import WebIcon from '@mui/icons-material/Web';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ArcElement
);

// Project card component
// eslint-disable-next-line no-unused-vars
const ProjectCard = ({ title, icon, team, daysLeft, progress, members }) => {
  const getIconComponent = () => {
    switch (icon) {
      case 'computer':
        return <ComputerIcon />;
      case 'web':
        return <WebIcon />;
      case 'store':
        return <StorefrontIcon />;
      case 'business':
        return <BusinessIcon />;
      case 'shopping':
        return <ShoppingBagIcon />;
      case 'campaign':
        return <CampaignIcon />;
      default:
        return <ComputerIcon />;
    }
  };

  const getIconBgColor = () => {
    switch (icon) {
      case 'computer':
        return '#FFCDD2';
      case 'web':
        return '#B2EBF2';
      case 'store':
        return '#C8E6C9';
      case 'business':
        return '#FFECB3';
      case 'shopping':
        return '#D1C4E9';
      case 'campaign':
        return '#BBDEFB';
      default:
        return '#E1F5FE';
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: getIconBgColor(), 
              color: '#333', 
              width: 48, 
              height: 48,
              mr: 2
            }}
          >
            {getIconComponent()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {team}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {daysLeft}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Typography variant="caption" fontWeight={600}>{progress}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
              }
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex' }}>
            {members.map((member, index) => (
              <Avatar 
                key={index}
                sx={{ 
                  width: 28, 
                  height: 28, 
                  fontSize: '0.8rem',
                  border: '2px solid #fff',
                  ml: index > 0 ? -1 : 0,
                  bgcolor: member.color || 'primary.main',
                }}
              >
                {member.initial}
              </Avatar>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [salesStats, setSalesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const { currentUser } = useContext(AuthContext);
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Get sales statistics
      const salesResponse = await axios.get(`/api/sales/statistics?timeRange=${timeRange}`);
      if (salesResponse.data.success) {
        setSalesStats(salesResponse.data.data);
      }
      
      // Get low stock products
      const productsResponse = await axios.get('/api/products/low-stock');
      if (productsResponse.data.success) {
        setLowStockProducts(productsResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Prepare chart data for daily sales
  const getSalesChartData = () => {
    if (!salesStats || !salesStats.dailySales) return null;
    
    const labels = salesStats.dailySales.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const salesData = salesStats.dailySales.map(item => Number(item.total) || 0);
    const ordersData = salesStats.dailySales.map(item => Number(item.count) || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Sales Amount',
          data: salesData,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light,
          yAxisID: 'y',
        },
        {
          label: 'Orders',
          data: ordersData,
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.light,
          yAxisID: 'y1',
        },
      ],
    };
  };
  
  // Prepare chart data for top products
  const getTopProductsChartData = () => {
    if (!salesStats || !salesStats.topProducts) return null;
    
    return {
      labels: salesStats.topProducts.map(product => product.product.name),
      datasets: [
        {
          label: 'Units Sold',
          data: salesStats.topProducts.map(product => product.totalQuantity),
          backgroundColor: [
            '#4caf50',
            '#2196f3',
            '#ff9800',
            '#9c27b0',
            '#f44336',
          ],
        },
      ],
    };
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales Amount (IDR)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
    },
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Top Selling Products',
      },
    },
  };
  
  if (loading && !salesStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box 
        sx={{ 
          mb: 4, 
          py: 3, 
          px: 4, 
          background: `linear-gradient(135deg, rgba(27, 65, 55, 0.18) 0%, rgba(61, 211, 123, 0.25) 100%)`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: '#1B4137' }}>
              Welcome, {currentUser?.name || currentUser?.username || 'User'}!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(27, 65, 55, 0.75)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" sx={{ textAlign: 'right', fontStyle: 'italic', color: 'rgba(27, 65, 55, 0.75)', mb: 0.5 }}>
              CENTRAL COMPUTER - LANGSA
            </Typography>
            <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', color: 'rgba(27, 65, 55, 0.6)' }}>
              Sales Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchDashboardData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            minHeight: '140px',
            background: 'linear-gradient(135deg, rgba(27, 65, 55, 0.02) 0%, rgba(61, 211, 123, 0.1) 100%)',
            borderLeft: '3px solid #1B4137'
          }}>
            <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
                  <PaymentsIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1">Total Sales</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {salesStats ? formatCurrency(salesStats.totalSales) : 'Rp0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  vs. Previous {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            minHeight: '140px',
            background: 'linear-gradient(135deg, rgba(255, 248, 240, 0.5) 0%, rgba(254, 113, 2, 0.08) 100%)',
            borderLeft: '3px solid #FE7102'
          }}>
            <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1, width: 32, height: 32 }}>
                  <ShoppingCartIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1">Orders</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {salesStats ? salesStats.totalOrders : 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  vs. Previous {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            minHeight: '140px',
            background: 'linear-gradient(135deg, rgba(232, 245, 233, 0.5) 0%, rgba(46, 125, 50, 0.08) 100%)',
            borderLeft: '3px solid #2E7D32'
          }}>
            <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1, width: 32, height: 32 }}>
                  <AttachMoneyIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1">Avg. Order</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {salesStats ? formatCurrency(salesStats.averageSaleValue) : 'Rp0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDownIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  vs. Previous {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            minHeight: '140px',
            background: 'linear-gradient(135deg, rgba(255, 243, 224, 0.5) 0%, rgba(255, 152, 0, 0.08) 100%)',
            borderLeft: '3px solid #FF9800'
          }}>
            <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 1, width: 32, height: 32 }}>
                  <InventoryIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1">Low Stock</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {lowStockProducts.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Items below minimum levels
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 244, 248, 0.95) 100%)',
            borderLeft: '3px solid #1976D2'
          }}>
            <Typography variant="h6" gutterBottom>Sales Trend</Typography>
            <Divider sx={{ mb: 2 }} />
            {!loading && salesStats && salesStats.dailySales ? (
              <Box sx={{ height: 360 }}>
                <Line options={lineChartOptions} data={getSalesChartData()} />
              </Box>
            ) : (
              <Box sx={{ height: 360, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(225, 238, 242, 0.95) 100%)',
            borderLeft: '3px solid #0097A7'
          }}>
            <Typography variant="h6" gutterBottom>Top Products</Typography>
            <Divider sx={{ mb: 2 }} />
            {!loading && salesStats && salesStats.topProducts ? (
              <Box sx={{ height: 360 }}>
                <Pie options={pieChartOptions} data={getTopProductsChartData()} />
              </Box>
            ) : (
              <Box sx={{ height: 360, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 243, 224, 0.6) 100%)',
            borderLeft: '3px solid #FF9800'
          }}>
            <Typography variant="h6" gutterBottom>Low Stock Products</Typography>
            <Divider sx={{ mb: 2 }} />
            {lowStockProducts.length > 0 ? (
              <List>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemAvatar>
                      <Avatar>
                        <StorefrontIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.quantity} in stock (Min: ${product.minQuantity})`}
                    />
                    <Box sx={{ width: '30%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(product.quantity / product.minQuantity) * 100}
                        color={product.quantity < product.minQuantity ? "error" : "warning"}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No low stock products found</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 245, 233, 0.6) 100%)',
            borderLeft: '3px solid #2E7D32'
          }}>
            <Typography variant="h6" gutterBottom>Recent Sales</Typography>
            <Divider sx={{ mb: 2 }} />
            {!loading && salesStats ? (
              <List>
                {salesStats.recentSales && salesStats.recentSales.map((sale) => (
                  <ListItem key={sale.id} divider>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sale.customerName || 'Walk-in Customer'}
                      secondary={`Invoice: ${sale.invoiceNumber} | ${new Date(sale.createdAt).toLocaleDateString()}`}
                    />
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(sale.total)}
                          </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 