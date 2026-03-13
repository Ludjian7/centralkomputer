import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  InputAdornment,
  alpha,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../../config/api';
import { StyledDetailCard, themeColors, layoutGradients } from '../../components/Layout/LayoutStyles';

const PAYMENT_METHODS = ['cash', 'credit_card', 'bank_transfer', 'digital_wallet'];
const PAYMENT_STATUSES = ['paid', 'pending', 'canceled'];

const SaleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [sale, setSale] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    notes: ''
  });

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [useTax, setUseTax] = useState(true);

  // Fetch available products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data.data.filter(product => product.isActive));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    }
  }, []);

  // Fetch sale details if editing
  const fetchSaleDetails = useCallback(async () => {
    if (!isEditing) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/sales/${id}`);
      const saleData = response.data.data;
      
      // Format data for the form
      setSale({
        customerName: saleData.customerName || '',
        customerPhone: saleData.customerPhone || '',
        customerEmail: saleData.customerEmail || '',
        items: saleData.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          product: item.product
        })),
        subtotal: saleData.subtotal,
        tax: saleData.tax,
        discount: saleData.discount,
        total: saleData.total,
        paymentMethod: saleData.paymentMethod,
        paymentStatus: saleData.paymentStatus,
        notes: saleData.notes || ''
      });
      setUseTax(saleData.tax > 0);
    } catch (err) {
      console.error('Error fetching sale details:', err);
      setError('Failed to load sale details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    fetchProducts();
    fetchSaleDetails();
  }, [id, fetchSaleDetails, fetchProducts]);

  // Calculate totals when items change
  const calculateTotals = useCallback(() => {
    const subtotal = sale.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = useTax ? subtotal * 0.11 : 0; // 11% tax
    const total = subtotal + tax - sale.discount;

    setSale(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  }, [sale.items, sale.discount, useTax]);

  useEffect(() => {
    calculateTotals();
  }, [sale.items, sale.discount, calculateTotals, useTax]);

  // Handle adding a product to the sale
  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    // Check if product is already in the list
    const existingItemIndex = sale.items.findIndex(item => item.productId === selectedProduct.id);

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...sale.items];
      const item = updatedItems[existingItemIndex];
      const newQuantity = item.quantity + quantity;
      
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: newQuantity,
        subtotal: selectedProduct.price * newQuantity
      };

      setSale(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Add new item
      const newItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        price: selectedProduct.price,
        subtotal: selectedProduct.price * quantity,
        product: selectedProduct
      };

      setSale(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    // Reset selection
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Handle removing a product from the sale
  const handleRemoveItem = (index) => {
    const updatedItems = [...sale.items];
    updatedItems.splice(index, 1);

    setSale(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Handle input change for customer info and notes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSale(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle discount change
  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setSale(prev => ({
      ...prev,
      discount: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sale.items.length === 0) {
      setError('Please add at least one item to the sale');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const saleData = {
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerEmail: sale.customerEmail,
        items: sale.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        })),
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        notes: sale.notes,
        discount: parseFloat(sale.discount) || 0
      };

      console.log('Submitting sale data:', saleData);

      if (isEditing) {
        await api.put(`/api/sales/${id}`, saleData);
      } else {
        await api.post('/api/sales', saleData);
      }

      navigate('/sales');
    } catch (err) {
      console.error('Error saving sale:', err);
      setError(err.response?.data?.message || 'Failed to save sale. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        background: layoutGradients.mainBackground,
        minHeight: '100vh',
        height: '100vh',
        pt: 2,
        pb: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sales')}
            sx={{
              bgcolor: alpha(themeColors.primary, 0.1),
              '&:hover': {
                bgcolor: alpha(themeColors.primary, 0.2),
              }
            }}
          >
            Kembali
          </Button>
          <Typography variant="h4" component="h1" sx={{ 
            mt: 1, 
            mb: 1,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            color: themeColors.primary,
            textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
          }}>
            {isEditing ? 'Edit Sale' : 'Transaksi Baru'}
          </Typography>
        </Box>

        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: alpha(themeColors.warning, 0.1), borderRadius: 1, border: `1px solid ${alpha(themeColors.warning, 0.3)}` }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit} style={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledDetailCard color={themeColors.primary} sx={{ mb: 2, height: '100px', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ py: 1, px: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: '0.9rem',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: themeColors.primary
                  }}>
                    <PersonIcon sx={{ mr: 1, fontSize: '1.1rem', color: themeColors.primary }} />
                    Informasi Pelanggan
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nama Pelanggan"
                        name="customerName"
                        value={sale.customerName}
                        onChange={handleInputChange}
                        size="small"
                        inputProps={{ style: { fontSize: '0.8rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: themeColors.primary,
                            },
                          },
                          '& .MuiInputBase-root': {
                            height: '32px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nomor Telepon"
                        name="customerPhone"
                        value={sale.customerPhone}
                        onChange={handleInputChange}
                        size="small"
                        inputProps={{ style: { fontSize: '0.8rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: themeColors.primary,
                            },
                          },
                          '& .MuiInputBase-root': {
                            height: '32px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Alamat"
                        name="customerEmail"
                        value={sale.customerEmail}
                        onChange={handleInputChange}
                        size="small"
                        inputProps={{ style: { fontSize: '0.8rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: themeColors.primary,
                            },
                          },
                          '& .MuiInputBase-root': {
                            height: '32px',
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledDetailCard>

              <StyledDetailCard color={themeColors.secondary} sx={{ mb: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <CardContent sx={{ py: 1, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: '0.9rem',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: themeColors.secondary
                  }}>
                    <ShoppingCartIcon sx={{ mr: 1, fontSize: '1.1rem', color: themeColors.secondary }} />
                    Item Penjualan
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={products}
                        getOptionLabel={(option) => `${option.name} (${formatCurrency(option.price)}) [ID: ${option.id}]`}
                        value={selectedProduct}
                        onChange={(event, newValue) => {
                          setSelectedProduct(newValue);
                        }}
                        size="small"
                        ListboxProps={{ style: { fontSize: '0.8rem' } }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Pilih Produk"
                            fullWidth
                            InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: themeColors.secondary,
                                },
                                height: '32px',
                                fontSize: '0.8rem'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Jumlah"
                        type="number"
                        InputProps={{ 
                          inputProps: { 
                            min: 1,
                            style: { fontSize: '0.8rem' }
                          }
                        }}
                        InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: themeColors.secondary,
                            },
                            height: '32px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={handleAddItem}
                        disabled={!selectedProduct}
                        size="small"
                        sx={{ 
                          height: '32px',
                          fontSize: '0.75rem',
                          bgcolor: themeColors.secondary,
                          '&:hover': {
                            bgcolor: alpha(themeColors.secondary, 0.9),
                          },
                          '&.Mui-disabled': {
                            bgcolor: alpha(themeColors.secondary, 0.4),
                          }
                        }}
                      >
                        Tambah
                      </Button>
                    </Grid>
                  </Grid>

                  <TableContainer component={Paper} variant="outlined" sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'unset',
                    overflowY: 'auto',
                    border: `1px solid ${alpha(themeColors.secondary, 0.2)}`,
                    borderRadius: 1,
                    height: '100%',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(themeColors.secondary, 0.2),
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(themeColors.secondary, 0.05),
                    },
                  }}>
                    <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
                      <TableHead sx={{ bgcolor: alpha(themeColors.secondary, 0.1) }}>
                        <TableRow>
                          <TableCell sx={{ py: 1, fontSize: '0.75rem', width: '35%' }}>Produk</TableCell>
                          <TableCell align="center" sx={{ py: 1, fontSize: '0.75rem', width: '20%' }}>Harga</TableCell>
                          <TableCell align="center" sx={{ py: 1, fontSize: '0.75rem', width: '15%' }}>Jumlah</TableCell>
                          <TableCell align="right" sx={{ py: 1, fontSize: '0.75rem', width: '20%' }}>Subtotal</TableCell>
                          <TableCell align="center" sx={{ py: 1, fontSize: '0.75rem', width: '10%' }}>Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sale.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 2, color: 'text.secondary', fontSize: '0.75rem' }}>
                              Belum ada item yang ditambahkan
                            </TableCell>
                          </TableRow>
                        ) : (
                          sale.items.map((item, index) => (
                            <TableRow key={index} sx={{
                              '&:nth-of-type(odd)': {
                                bgcolor: alpha(themeColors.secondary, 0.03),
                              },
                              '&:hover': {
                                bgcolor: alpha(themeColors.secondary, 0.07),
                              }
                            }}>
                              <TableCell sx={{ py: 1, fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</TableCell>
                              <TableCell align="center" sx={{ py: 1, fontSize: '0.75rem' }}>{formatCurrency(item.price)}</TableCell>
                              <TableCell align="center" sx={{ py: 1, fontSize: '0.75rem' }}>{item.quantity}</TableCell>
                              <TableCell align="right" sx={{ py: 1, fontSize: '0.75rem' }}>{formatCurrency(item.subtotal)}</TableCell>
                              <TableCell align="center" sx={{ py: 0 }}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveItem(index)}
                                  sx={{ p: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </StyledDetailCard>

              <StyledDetailCard color={themeColors.info} sx={{ mb: 0, height: '100px', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ py: 1, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: '0.9rem',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: themeColors.info
                  }}>
                    <NoteIcon sx={{ mr: 1, fontSize: '1.1rem', color: themeColors.info }} />
                    Informasi Tambahan
                  </Typography>
                  <TextField
                    fullWidth
                    label="Catatan"
                    name="notes"
                    multiline
                    rows={1}
                    value={sale.notes}
                    onChange={handleInputChange}
                    size="small"
                    inputProps={{ style: { fontSize: '0.8rem', padding: '4px 8px' } }}
                    InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: themeColors.info,
                        },
                        height: '40px',
                      }
                    }}
                  />
                </CardContent>
              </StyledDetailCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <StyledDetailCard color={themeColors.success} sx={{ height: '100%', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ py: 1, px: 2, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: '0.9rem',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: themeColors.success
                  }}>
                    <ReceiptIcon sx={{ mr: 1, fontSize: '1.1rem', color: themeColors.success }} />
                    Ringkasan Penjualan
                  </Typography>
                  <Box sx={{ mt: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: '0.85rem' }}>Subtotal:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography align="right" fontWeight="medium" sx={{ fontSize: '0.85rem' }}>{formatCurrency(sale.subtotal)}</Typography>
                      </Grid>

                      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={useTax}
                              onChange={(e) => setUseTax(e.target.checked)}
                              size="small"
                              color="success"
                              sx={{ mr: 0.5 }}
                            />
                          }
                          label={<Typography sx={{ fontSize: '0.85rem' }}>Tax (11%)</Typography>}
                          sx={{ m: 0, ml: -1 }}
                        />
                      </Grid>
                      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography align="right" fontWeight="medium" sx={{ fontSize: '0.85rem' }}>{formatCurrency(sale.tax)}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: '0.85rem' }}>Discount:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          size="small"
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, style: { fontSize: '0.85rem', padding: '4px 8px' } },
                            startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.85rem' } }}>Rp</InputAdornment>,
                          }}
                          value={sale.discount}
                          onChange={handleDiscountChange}
                          sx={{ 
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: themeColors.success,
                              },
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }} color={themeColors.success}>Total:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography align="right" fontWeight="bold" color={themeColors.success} sx={{ fontSize: '0.95rem' }}>
                          {formatCurrency(sale.total)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 1 }} size="small">
                          <InputLabel sx={{ fontSize: '0.85rem' }}>Metode Pembayaran</InputLabel>
                          <Select
                            name="paymentMethod"
                            value={sale.paymentMethod}
                            label="Metode Pembayaran"
                            onChange={handleInputChange}
                            sx={{
                              fontSize: '0.85rem',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(themeColors.success, 0.3),
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: themeColors.success,
                              },
                            }}
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <MenuItem key={method} value={method} sx={{ fontSize: '0.85rem' }}>
                                {method.replace('_', ' ').toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 2 }} size="small">
                          <InputLabel sx={{ fontSize: '0.85rem' }}>Status Pembayaran</InputLabel>
                          <Select
                            name="paymentStatus"
                            value={sale.paymentStatus}
                            label="Status Pembayaran"
                            onChange={handleInputChange}
                            sx={{
                              fontSize: '0.85rem',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(themeColors.success, 0.3),
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: themeColors.success,
                              },
                            }}
                          >
                            {PAYMENT_STATUSES.map((status) => (
                              <MenuItem key={status} value={status} sx={{ fontSize: '0.85rem' }}>
                                {status.toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="medium"
                          fullWidth
                          disabled={submitting || sale.items.length === 0}
                          sx={{
                            py: 1,
                            fontSize: '0.85rem',
                            background: `linear-gradient(135deg, ${themeColors.success} 0%, ${themeColors.primary} 100%)`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${themeColors.success} 20%, ${themeColors.primary} 120%)`,
                            },
                            '&.Mui-disabled': {
                              background: alpha(themeColors.success, 0.4),
                            }
                          }}
                        >
                          {submitting
                            ? 'Menyimpan...'
                            : isEditing
                              ? 'Perbarui Transaksi'
                              : 'Selesaikan Transaksi'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </StyledDetailCard>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
};

export default SaleForm; 