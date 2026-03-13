import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NoteIcon from '@mui/icons-material/Note';
import axios from 'axios';
import { format } from 'date-fns';
import { StyledDetailCard, StyledStatCard, themeColors } from '../../components/Layout/LayoutStyles';

const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const response = await axios.get(`/api/sales/${id}`);
        setSale(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sale details:', err);
        setError('Failed to load sale details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/sales/${id}`);
        navigate('/sales');
      } catch (err) {
        console.error('Error deleting sale:', err);
        setError('Failed to delete sale. Please try again.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip label="Paid" color="success" size="small" sx={{ fontWeight: 500 }} />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 500 }} />;
      case 'cancelled':
      case 'canceled':
        return <Chip label="Canceled" color="error" size="small" sx={{ fontWeight: 500 }} />;
      case 'refunded':
        return <Chip label="Refunded" color="info" size="small" sx={{ fontWeight: 500 }} />;
      case 'partial':
        return <Chip label="Partial" color="secondary" size="small" sx={{ fontWeight: 500 }} />;
      default:
        return <Chip label={status} color="default" size="small" sx={{ fontWeight: 500 }} />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <Chip icon={<PaymentIcon />} label="Credit Card" variant="outlined" size="small" />;
      case 'debit_card':
        return <Chip icon={<PaymentIcon />} label="Debit Card" variant="outlined" size="small" />;
      case 'cash':
        return <Chip icon={<PaymentIcon />} label="Cash" variant="outlined" size="small" />;
      case 'transfer':
        return <Chip icon={<PaymentIcon />} label="Transfer" variant="outlined" size="small" />;
      case 'e_wallet':
        return <Chip icon={<PaymentIcon />} label="E-Wallet" variant="outlined" size="small" />;
      default:
        return <Chip icon={<PaymentIcon />} label={method} variant="outlined" size="small" />;
    }
  };

  // Convert number to words in Indonesian
  const numberToWords = (num) => {
    const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const teens = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
    const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];
    
    const formatNumber = (n) => {
      if (n === 0) return '';
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
      if (n < 1000) return units[Math.floor(n / 100)] + ' Ratus' + (n % 100 !== 0 ? ' ' + formatNumber(n % 100) : '');
      if (n < 1000000) return formatNumber(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 !== 0 ? ' ' + formatNumber(n % 1000) : '');
      if (n < 1000000000) return formatNumber(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 !== 0 ? ' ' + formatNumber(n % 1000000) : '');
      return formatNumber(Math.floor(n / 1000000000)) + ' Milyar' + (n % 1000000000 !== 0 ? ' ' + formatNumber(n % 1000000000) : '');
    };
    
    return formatNumber(num);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sales')}
          sx={{ mt: 2 }}
        >
          Kembali ke Penjualan
        </Button>
      </Container>
    );
  }

  if (!sale) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Sale not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sales')}
          sx={{ mt: 2 }}
        >
          Kembali ke Penjualan
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }} className="print-content">
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, md: 3 } }} className="no-print">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sales')}
          sx={{ mb: 2 }}
        >
          Kembali ke Penjualan
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ReceiptIcon sx={{ color: themeColors.primary, mr: 1.5, fontSize: 28 }} />
          <Typography variant="h5" component="h1" fontWeight="500">
            Detail Penjualan
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: { xs: 3, md: 4 } }} className="no-print">
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/sales/${id}/edit`}
              sx={{
                borderColor: themeColors.info,
                color: themeColors.info,
                '&:hover': {
                  borderColor: themeColors.info,
                  backgroundColor: `${themeColors.info}10`
                }
              }}
            >
              Edit
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                bgcolor: themeColors.secondary,
                '&:hover': {
                  bgcolor: '#E66700'
                }
              }}
            >
              Cetak Kwitansi
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Invoice Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: { xs: 2, md: 3 },
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          mb: { xs: 1, md: 2 }
        }}>
          <Box>
            <Typography variant="h5" className="print-header" fontWeight="600" color={themeColors.primary}>
              Faktur #{String(sale.id).padStart(6, '0')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {sale.invoiceNumber}
            </Typography>
          </Box>
          <Box sx={{ mt: isMobile ? 2 : 0 }}>
            <Typography variant="body2" fontWeight="500">
              Tanggal: {format(new Date(sale.createdAt), 'dd MMMM yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Waktu: {format(new Date(sale.createdAt), 'HH:mm:ss')}
            </Typography>
          </Box>
        </Box>
        
        {/* Standard receipt template for print */}
        <Box className="print-only" sx={{ mt: 0 }}>
          <Box sx={{ border: '2px solid #000', p: 2, mb: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>KWITANSI</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>No. {sale.invoiceNumber || `INV-${String(sale.id).padStart(6, '0')}`}</Typography>
            </Box>
            
            <Divider sx={{ mb: 3, borderColor: '#000', borderWidth: '1px' }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Typography variant="body1" fontWeight="600">Sudah Terima Dari</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body1" fontWeight="500">
                  : {sale.customer?.name || sale.customerName || 'Pelanggan Umum'}
                </Typography>
              </Grid>
              
              <Grid item xs={3}>
                <Typography variant="body1" fontWeight="600">Sejumlah</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body1" fontWeight="500" sx={{ 
                  border: '1px solid #000', 
                  p: 1, 
                  bgcolor: 'rgba(0,0,0,0.05)',
                  fontStyle: 'italic'
                }}>
                  : {formatCurrency(sale.total)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>Terbilang:</Typography>
                <Typography variant="body1" sx={{ 
                  border: '1px solid #000', 
                  p: 1, 
                  textTransform: 'capitalize',
                  fontWeight: 500
                }}>
                  # {numberToWords(Math.round(sale.total))} Rupiah #
                </Typography>
              </Grid>
              
              <Grid item xs={3}>
                <Typography variant="body1" fontWeight="600">Untuk Pembayaran</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body1" fontWeight="500">
                  : Pembelian Produk Komputer dan Aksesoris
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 4
            }}>
              <Box sx={{ textAlign: 'center', width: '200px' }}>
                <Typography variant="body1" sx={{ mb: 8 }}>
                  {format(new Date(sale.createdAt), 'dd MMMM yyyy')}
                </Typography>
                <Typography variant="body1" fontWeight="500">( Central Computers )</Typography>
                <Divider sx={{ mt: 1, borderColor: '#000' }} />
              </Box>
            </Box>
          </Box>
          
          <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>Detail Pembelian:</Typography>
          <TableContainer sx={{ border: '1px solid #000', mb: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #000' }}>Nama Barang</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '1px solid #000' }}>Jumlah</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '1px solid #000' }}>Harga Satuan</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '1px solid #000' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ borderBottom: '1px solid #aaa' }}>{item.product.name}</TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid #aaa' }}>{item.quantity}</TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #aaa' }}>{formatCurrency(item.price)}</TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #aaa' }}>{formatCurrency(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} sx={{ border: 'none' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, border: 'none' }}>Subtotal:</TableCell>
                  <TableCell align="right" sx={{ border: 'none' }}>{formatCurrency(sale.subtotal)}</TableCell>
                </TableRow>
                {sale.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ border: 'none' }}></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: 'none' }}>Diskon:</TableCell>
                    <TableCell align="right" sx={{ border: 'none', color: 'error.main' }}>- {formatCurrency(sale.discount)}</TableCell>
                  </TableRow>
                )}
                {sale.tax > 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ border: 'none' }}></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: 'none' }}>Pajak:</TableCell>
                    <TableCell align="right" sx={{ border: 'none' }}>{formatCurrency(sale.tax)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={2} sx={{ border: 'none' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', border: 'none' }}>Total:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', border: 'none' }}>{formatCurrency(sale.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="500">Metode Pembayaran: {sale.paymentMethod.replace('_', ' ').toUpperCase()}</Typography>
            {sale.paymentReference && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>Referensi: {sale.paymentReference}</Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Barang yang sudah dibeli tidak dapat dikembalikan kecuali ada perjanjian tertulis.
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
              Terima kasih atas kepercayaan Anda berbelanja di Central Computers!
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Customer & Payment Info Combined */}
      <StyledStatCard color={themeColors.info} sx={{ mb: { xs: 2, md: 3 } }} className="no-print">
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ color: themeColors.info, mr: 1 }} />
              <Typography variant="h6" fontWeight="500">
                Informasi Pelanggan & Pembayaran
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {/* Customer Info */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: themeColors.info }}>
                  Detail Pelanggan
                </Typography>
                <Typography variant="body1" fontWeight="500" sx={{ mb: 1 }}>
                  {sale.customer?.name || sale.customerName || 'Pelanggan Umum'}
                </Typography>
                {(sale.customer?.address || sale.customerAddress) && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Alamat: {sale.customer?.address || sale.customerAddress}
                  </Typography>
                )}
                {(sale.customer?.phone || sale.customerPhone) && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Telepon: {sale.customer?.phone || sale.customerPhone}
                  </Typography>
                )}
                {(sale.customer?.email || sale.customerEmail) && (
                  <Typography variant="body2">
                    Email: {sale.customer?.email || sale.customerEmail}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Payment Info */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: themeColors.secondary }}>
                  <PaymentIcon sx={{ color: themeColors.secondary, mr: 1, fontSize: '1.1rem', verticalAlign: 'text-bottom' }} />
                  Detail Pembayaran
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Status</Typography>
                    <Box>
                      {getPaymentStatusChip(sale.paymentStatus)}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Metode</Typography>
                    <Box>
                      {getPaymentMethodIcon(sale.paymentMethod)}
                    </Box>
                  </Grid>
                  {sale.paymentReference && (
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Referensi</Typography>
                      <Typography variant="body2" fontWeight="500">{sale.paymentReference}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </StyledStatCard>

      {/* Order Items */}
      <StyledDetailCard color={themeColors.success} sx={{ mb: { xs: 2, md: 3 } }} className="no-print">
        <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 1, md: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCartIcon sx={{ color: themeColors.success, mr: 1 }} />
            <Typography variant="h6" fontWeight="500">
              Item Pesanan
            </Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>SKU</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>Harga</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>Jumlah</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>Diskon</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>{item.product.name}</TableCell>
                  <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>{item.product.sku}</TableCell>
                  <TableCell align="right" sx={{ py: { xs: 1.5, md: 2 } }}>{formatCurrency(item.price)}</TableCell>
                  <TableCell align="right" sx={{ py: { xs: 1.5, md: 2 } }}>{item.quantity}</TableCell>
                  <TableCell align="right" sx={{ py: { xs: 1.5, md: 2 } }}>
                    {item.discount ? formatCurrency(item.discount) : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ py: { xs: 1.5, md: 2 }, fontWeight: 500 }}>
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ 
                p: { xs: 2, md: 3 }, 
                bgcolor: theme.palette.background.paper, 
                borderRadius: 1,
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <Grid container sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">
                      {formatCurrency(sale.subtotal)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Diskon:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" color={sale.discount > 0 ? 'error.main' : 'text.primary'}>
                      {sale.discount > 0 ? `- ${formatCurrency(sale.discount)}` : formatCurrency(0)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pajak:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">
                      {formatCurrency(sale.tax || 0)}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600" align="right" color={themeColors.success}>
                      {formatCurrency(sale.total)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </StyledDetailCard>

      {/* Notes */}
      <StyledDetailCard color={themeColors.grey} sx={{ mb: { xs: 3, md: 4 } }} className="no-print">
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NoteIcon sx={{ color: themeColors.grey, mr: 1 }} />
            <Typography variant="h6" fontWeight="500">
              Catatan
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            {sale.notes || 'Tidak ada catatan untuk penjualan ini.'}
          </Typography>
        </CardContent>
      </StyledDetailCard>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body, html {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
          .MuiContainer-root {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .MuiPaper-root {
            box-shadow: none !important;
            border: none !important;
          }
          .MuiTableCell-root {
            padding: 8px !important;
            border-color: #000 !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          
          /* Hide sidebar, header, and all navigation elements */
          .MuiDrawer-root,
          header,
          nav,
          .MuiAppBar-root,
          aside,
          .sidebar,
          .navigation,
          .header-area,
          .MuiDrawer-paper,
          footer {
            display: none !important;
          }
          
          /* Make sure the content takes full width */
          main, .main-content, .content-area, .MuiBox-root, .MuiContainer-root {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
          }
          
          /* Override any padding or margin from the layout */
          .MuiContainer-root, .content-wrapper {
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          /* Force the print content to be centered */
          .print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default SaleDetail; 