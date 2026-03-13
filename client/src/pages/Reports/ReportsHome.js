import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardActionArea,
  Divider,
  Breadcrumbs,
  Link,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InsightsIcon from '@mui/icons-material/Insights';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ReportsHome = () => {
  const location = useLocation();
  
  const isTransactionsReport = location.pathname === '/reports/transactions';
  const isSuppliersReport = location.pathname === '/reports/suppliers';
  const isStoresReport = location.pathname === '/reports/stores';
  const isMainReportsPage = location.pathname === '/reports';
  
  // Opsi laporan yang tersedia
  const reportOptions = [
    {
      title: 'Dashboard Laporan',
      description: 'Ringkasan semua laporan dan metrik penting',
      icon: <InsightsIcon sx={{ fontSize: 40 }} />,
      path: '/reports',
      color: 'rgba(90, 195, 150, 0.7)'
    },
    {
      title: 'Laporan Penjualan',
      description: 'Analisis performa penjualan dan tren',
      icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
      path: '/reports/sales',
      color: 'rgba(100, 180, 230, 0.7)'
    },
    {
      title: 'Laporan Inventaris',
      description: 'Monitor stok dan pergerakan produk',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      path: '/reports/inventory',
      color: 'rgba(240, 154, 86, 0.7)'
    },
    {
      title: 'Laporan Transaksi',
      description: 'Riwayat transaksi dan analisis pembayaran',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      path: '/reports/transactions',
      color: 'rgba(152, 120, 210, 0.7)'
    },
    {
      title: 'Laporan Supplier',
      description: 'Analisis performa supplier dan pembelian',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/reports/suppliers',
      color: 'rgba(220, 120, 170, 0.7)'
    },
    {
      title: 'Laporan Toko',
      description: 'Performa toko dan analisis cabang',
      icon: <StorefrontIcon sx={{ fontSize: 40 }} />,
      path: '/reports/stores',
      color: 'rgba(135, 185, 95, 0.7)'
    }
  ];

  // Menampilkan konten berdasarkan route
  const renderPageContent = () => {
    // Placeholder pages for reports under development
    if (isStoresReport) {
      return (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorefrontIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Store Reports
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Store reports are currently under development. This feature will allow you to analyze store 
              performance metrics, compare different branches, and track sales by location.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon in the next update. Please check back later.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Planned Features:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Sales comparison between branches</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Performance metrics by store location</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Employee productivity analysis by store</Typography>
                <Typography component="li" variant="body2">Customer traffic analysis</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    } else if (isTransactionsReport) {
      return (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ReceiptIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Transaction Reports
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Transaction reports are currently under development. This feature will allow you to track all transactions, 
              filter by payment methods, and analyze transaction trends over time.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon in the next update. Please check back later.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Planned Features:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Payment method analysis</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Transaction volume trends</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Average transaction value report</Typography>
                <Typography component="li" variant="body2">Refund and return tracking</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    } else if (isSuppliersReport) {
      return (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Supplier Reports
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Supplier reports are currently under development. This feature will allow you to analyze supplier 
              performance, track purchase history, and identify top suppliers.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon in the next update. Please check back later.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Planned Features:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Supplier reliability metrics</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Purchase history by supplier</Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>Cost comparison between suppliers</Typography>
                <Typography component="li" variant="body2">Lead time analysis</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    } else {
      return (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Laporan & Analisis
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Akses semua laporan dan analisis untuk mendapatkan wawasan tentang kinerja bisnis Anda.
            </Typography>

            {/* Kartu laporan utama */}
            <Grid container spacing={3}>
              {reportOptions.map((report, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `1px solid ${report.path === location.pathname ? report.color : 'rgba(0, 0, 0, 0.12)'}`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                        borderColor: report.color,
                      }
                    }}
                  >
                    <CardActionArea 
                      component={RouterLink}
                      to={report.path}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ 
                        width: '100%',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            backgroundColor: report.color,
                            mr: 2,
                            color: '#fff'
                          }}>
                            {report.icon}
                          </Box>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {report.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {report.description}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

        </>
      );
    }
  };

  // Menentukan breadcrumb berdasarkan path
  const getBreadcrumbLabel = () => {
    if (isTransactionsReport) return 'Transaction Reports';
    if (isSuppliersReport) return 'Supplier Reports';
    if (isStoresReport) return 'Store Reports';
    return 'Reports Dashboard';
  };

  return (
    <Container maxWidth="xl">
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3, mt: 1 }}
      >
        <Link 
          component={RouterLink} 
          to="/" 
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        {!isMainReportsPage && (
          <Link
            component={RouterLink}
            to="/reports"
            color="inherit"
          >
            Reports
          </Link>
        )}
        <Typography color="text.primary">{getBreadcrumbLabel()}</Typography>
      </Breadcrumbs>

      {renderPageContent()}
    </Container>
  );
};

export default ReportsHome; 