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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SupplierDetail = () => {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await axios.get(`/api/suppliers/${id}`);
        if (response.data.success) {
          setSupplier(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch supplier details');
        }
      } catch (error) {
        setError('Error fetching supplier details');
        console.error('Error fetching supplier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await axios.delete(`/api/suppliers/${id}`);
        if (response.data.success) {
          navigate('/suppliers');
        } else {
          setError(response.data.message || 'Failed to delete supplier');
        }
      } catch (error) {
        setError('Error deleting supplier. The supplier may have associated products.');
        console.error('Error deleting supplier:', error);
      }
    }
  };

  if (loading) {
    return <Typography>Loading supplier details...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!supplier) {
    return <Alert severity="warning">Supplier not found</Alert>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/suppliers')}
        >
          Back to Suppliers
        </Button>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            sx={{ mr: 1 }}
            onClick={() => navigate(`/suppliers/${id}/edit`)}
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
            <Typography variant="h4" gutterBottom>{supplier.name}</Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={supplier.isActive ? 'Active' : 'Inactive'} 
                color={supplier.isActive ? 'success' : 'default'} 
              />
            </Box>
            <Typography variant="body1" paragraph>
              {supplier.notes || 'No additional notes available.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Contact Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Contact Person</Typography>
                    <Typography variant="body1">{supplier.contactPerson || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Email</Typography>
                    <Typography variant="body1">{supplier.email || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Phone</Typography>
                    <Typography variant="body1">{supplier.phone || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Address</Typography>
                    <Typography variant="body1">{supplier.address || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">City</Typography>
                    <Typography variant="body1">{supplier.city || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Postal Code</Typography>
                    <Typography variant="body1">{supplier.postalCode || '-'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {supplier.products && supplier.products.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Products Supplied</Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplier.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default SupplierDetail; 