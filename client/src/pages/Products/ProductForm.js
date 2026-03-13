import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CardContent,
  Grid, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { StyledDetailCard, themeColors } from '../../components/Layout/LayoutStyles';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'physical',
    sku: '',
    barcode: '',
    price: '',
    cost: '',
    quantity: '',
    minQuantity: '',
    category: '',
    brand: '',
    location: '',
    supplierId: '',
    isActive: true,
    duration: '',
    serviceDetails: ''
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Fetch suppliers for dropdown
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('/api/suppliers');
        if (response.data.success) {
          setSuppliers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();

    // If in edit mode, fetch product data
    if (isEditMode) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/products/${id}`);
          if (response.data.success) {
            const product = response.data.data;
            setFormData({
              name: product.name || '',
              description: product.description || '',
              type: product.type || 'physical',
              sku: product.sku || '',
              barcode: product.barcode || '',
              price: product.price || '',
              cost: product.cost || '',
              quantity: product.quantity || '',
              minQuantity: product.minQuantity || '',
              category: product.category || '',
              brand: product.brand || '',
              location: product.location || '',
              supplierId: product.supplierId || '',
              isActive: product.isActive !== undefined ? product.isActive : true,
              duration: product.duration || '',
              serviceDetails: product.serviceDetails || ''
            });
          } else {
            setSubmitError('Failed to load product data');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setSubmitError('Error loading product data');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required';
    }
    
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      errors.price = 'Valid price is required';
    }
    
    if (formData.cost === '' || isNaN(formData.cost) || Number(formData.cost) < 0) {
      errors.cost = 'Valid cost is required';
    }
    
    if (formData.type === 'physical') {
      if (formData.quantity === '' || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
        errors.quantity = 'Valid quantity is required';
      }
      
      if (formData.minQuantity === '' || isNaN(formData.minQuantity) || Number(formData.minQuantity) < 0) {
        errors.minQuantity = 'Valid minimum quantity is required';
      }
    }
    
    if (formData.type === 'service' && formData.duration === '') {
      errors.duration = 'Duration is required for service products';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset status
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Format data for API
    const productData = {
      ...formData,
      price: Number(formData.price),
      cost: Number(formData.cost),
      quantity: formData.type === 'physical' ? Number(formData.quantity) : 0,
      minQuantity: formData.type === 'physical' ? Number(formData.minQuantity) : 0,
      supplierId: formData.supplierId || null,
      duration: formData.type === 'service' ? Number(formData.duration) : null
    };
    
    try {
      let response;
      
      if (isEditMode) {
        // Update existing product
        response = await axios.put(`/api/products/${id}`, productData);
      } else {
        // Create new product
        response = await axios.post('/api/products', productData);
      }
      
      if (response.data.success) {
        setSubmitSuccess(true);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(isEditMode ? `/products/${id}` : '/products');
        }, 1500);
      } else {
        setSubmitError(response.data.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitError('Error saving product. Please try again.');
    }
  };

  if (loading) {
    return <Typography>Memuat data...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
        >
          Kembali
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Produk berhasil disimpan!
        </Alert>
      )}

      <StyledDetailCard color={themeColors.info}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nama Produk"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Jenis Produk</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Jenis Produk"
                  >
                    <MenuItem value="physical">Barang</MenuItem>
                    <MenuItem value="service">Jasa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Kode Produk (SKU)"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={!!formErrors.sku}
                  helperText={formErrors.sku}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Harga Jual"
                  name="price"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                  value={formData.price}
                  onChange={handleChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Harga Modal"
                  name="cost"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                  value={formData.cost}
                  onChange={handleChange}
                  error={!!formErrors.cost}
                  helperText={formErrors.cost}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    label="Supplier"
                  >
                    <MenuItem value="">Tidak Ada</MenuItem>
                    {suppliers.map(supplier => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {formData.type === 'physical' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Jumlah Stok"
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      error={!!formErrors.quantity}
                      helperText={formErrors.quantity}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Stok Minimum"
                      name="minQuantity"
                      type="number"
                      value={formData.minQuantity}
                      onChange={handleChange}
                      error={!!formErrors.minQuantity}
                      helperText={formErrors.minQuantity}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Lokasi"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}

              {formData.type === 'service' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Durasi (menit)"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleChange}
                      error={!!formErrors.duration}
                      helperText={formErrors.duration}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Detail Jasa"
                      name="serviceDetails"
                      multiline
                      rows={2}
                      value={formData.serviceDetails}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kategori"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Merek"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Deskripsi"
                  name="description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Aktif"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ bgcolor: themeColors.secondary }}
                >
                  Simpan Produk
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </StyledDetailCard>
    </Box>
  );
};

export default ProductForm; 