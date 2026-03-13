import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import ReportsNav from './ReportsNav';

const SupplierReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onlyActive, setOnlyActive] = useState('all');
  const [summary, setSummary] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalProducts: 0,
    totalInventoryValue: 0,
  });
  const [rows, setRows] = useState([]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const fetchReport = async (filterActive) => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filterActive === 'active') {
        params.onlyActive = true;
      }

      const response = await axios.get('/api/suppliers/report', { params });

      if (response.data.success) {
        setSummary(response.data.summary || {});
        setRows(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch supplier report');
      }
    } catch (err) {
      console.error('Error fetching supplier report:', err);
      setError(err.message || 'Failed to load supplier report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(onlyActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyActive]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Supplier Reports
        </Typography>
        <ReportsNav />
      </Box>

      {error && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Suppliers
                  </Typography>
                  <Typography variant="h4">
                    {summary.totalSuppliers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Suppliers
                  </Typography>
                  <Typography variant="h4">
                    {summary.activeSuppliers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {summary.totalProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Inventory Value
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(summary.totalInventoryValue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={onlyActive}
                      onChange={(e) => setOnlyActive(e.target.value)}
                    >
                      <MenuItem value="all">All Suppliers</MenuItem>
                      <MenuItem value="active">Active Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supplier Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell align="right">Products</TableCell>
                      <TableCell align="right">Total Stock</TableCell>
                      <TableCell align="right">Inventory Value</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>{supplier.name}</TableCell>
                          <TableCell>{supplier.contactPerson || '-'}</TableCell>
                          <TableCell>{supplier.phone || '-'}</TableCell>
                          <TableCell>{supplier.email || '-'}</TableCell>
                          <TableCell>{supplier.city || '-'}</TableCell>
                          <TableCell align="right">
                            {supplier.totalProducts}
                          </TableCell>
                          <TableCell align="right">
                            {supplier.totalStock}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(supplier.inventoryValue)}
                          </TableCell>
                          <TableCell>
                            {supplier.isActive ? (
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                label="Inactive"
                                color="default"
                                size="small"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No suppliers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default SupplierReport;

