import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  CardContent,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import { format } from 'date-fns';
import { StyledDetailCard, themeColors } from '../../components/Layout/LayoutStyles';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/sales?page=${page + 1}&limit=${rowsPerPage}`);
      setSales(response.data.data);
      setTotalCount(response.data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search functionality
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await axios.delete(`/api/sales/${id}`);
        fetchSales();
      } catch (err) {
        console.error('Error deleting sale:', err);
        setError('Failed to delete sale. Please try again later.');
      }
    }
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
        return <Chip label="Lunas" color="success" size="small" />;
      case 'pending':
        return <Chip label="Tertunda" color="warning" size="small" />;
      case 'canceled':
        return <Chip label="Dibatalkan" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Transaksi Penjualan
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/sales/new"
              sx={{ bgcolor: themeColors.secondary }}
            >
              Transaksi Baru
            </Button>
          </Grid>
        </Grid>
      </Box>

      <StyledDetailCard color={themeColors.info} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Cari berdasarkan nama pelanggan atau nomor faktur"
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ maxWidth: '300px' }}
              />
            </Grid>
            <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button startIcon={<FilterListIcon />} sx={{ color: themeColors.grey }}>
                Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </StyledDetailCard>

      <StyledDetailCard color={themeColors.primary} sx={{ p: 0, overflowX: 'auto', width: '100%' }}>
        <TableContainer sx={{ minWidth: '100%', maxWidth: '100%' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Tanggal</TableCell>
                <TableCell>No. Faktur</TableCell>
                <TableCell>Pelanggan</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Item</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Metode</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Memuat data...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Tidak ada transaksi ditemukan. Buat transaksi pertama Anda!
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {format(new Date(sale.createdAt), 'dd/MM/yy')}
                    </TableCell>
                    <TableCell>
                      INV-{String(sale.id).padStart(6, '0')}
                    </TableCell>
                    <TableCell>
                      {sale.customerName || 'Pelanggan Umum'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {sale.items?.length || 0} item
                    </TableCell>
                    <TableCell>
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusChip(sale.paymentStatus)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {sale.paymentMethod.replace('_', ' ')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        component={RouterLink}
                        to={`/sales/${sale.id}`}
                        size="small"
                        title="Lihat Detail"
                        sx={{ color: themeColors.info }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        component={RouterLink}
                        to={`/sales/${sale.id}/edit`}
                        size="small"
                        title="Edit Transaksi"
                        sx={{ color: themeColors.warning }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(sale.id)}
                        size="small"
                        title="Hapus Transaksi"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Baris:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
            sx={{ 
              '.MuiTablePagination-selectLabel': {
                display: { xs: 'none', sm: 'block' }
              }
            }}
          />
        </Box>
      </StyledDetailCard>
    </Container>
  );
};

export default SalesList; 