import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip, 
  Divider,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch product details');
        }
      } catch (error) {
        setError('Error fetching product details');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`/api/products/${id}`);
        if (response.data.success) {
          navigate('/products');
        } else {
          setError(response.data.message || 'Failed to delete product');
        }
      } catch (error) {
        setError('Error deleting product');
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return <Typography>Loading product details...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!product) {
    return <Alert severity="warning">Product not found</Alert>;
  }

  const isService = product.type === 'service';

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => navigate(`/products/edit/${id}`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" gutterBottom>{product.name}</Typography>
              {isService ? (
                <Chip 
                  icon={<MiscellaneousServicesIcon />}
                  label="Service" 
                  color="secondary" 
                  sx={{ ml: 2 }}
                />
              ) : (
                <Chip 
                  icon={<InventoryIcon />}
                  label="Physical Product" 
                  color="primary" 
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={product.isActive ? 'Active' : 'Inactive'} 
                color={product.isActive ? 'success' : 'default'} 
                sx={{ mr: 1 }}
              />
              {!isService && product.quantity <= product.minQuantity && (
                <Chip label="Low Stock" color="warning" />
              )}
            </Box>
            <Typography variant="body1" paragraph>
              {product.description || 'No description available.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Product Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">SKU</Typography>
                    <Typography variant="body1">{product.sku}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Barcode</Typography>
                    <Typography variant="body1">{product.barcode || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Price</Typography>
                    <Typography variant="body1">${parseFloat(product.price).toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Cost</Typography>
                    <Typography variant="body1">${parseFloat(product.cost).toFixed(2)}</Typography>
                  </Grid>
                  
                  {!isService && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Quantity</Typography>
                        <Typography variant="body1">{product.quantity}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Min. Quantity</Typography>
                        <Typography variant="body1">{product.minQuantity}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Location</Typography>
                        <Typography variant="body1">{product.location || '-'}</Typography>
                      </Grid>
                    </>
                  )}
                  
                  {isService && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Duration</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body1">{product.duration} minutes</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Service Details</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {product.serviceDetails || 'No additional details.'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Category</Typography>
                    <Typography variant="body1">{product.category || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Brand</Typography>
                    <Typography variant="body1">{product.brand || '-'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {product.supplier && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Supplier Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Supplier Name</Typography>
              <Typography variant="body1">{product.supplier.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Contact Person</Typography>
              <Typography variant="body1">{product.supplier.contactPerson || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Phone</Typography>
              <Typography variant="body1">{product.supplier.phone || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography variant="body1">{product.supplier.email || '-'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ProductDetail; 