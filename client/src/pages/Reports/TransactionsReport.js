import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../config/api';
import { format, subDays, isValid } from 'date-fns';
import ReportsNav from './ReportsNav';

const TransactionsReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalPages: 0,
  });
  const [transactions, setTransactions] = useState([]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDateTime = (date) =>
    format(new Date(date), 'dd/MM/yyyy HH:mm');

  const syncStateFromSearchParams = () => {
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');
    const method = searchParams.get('paymentMethod');
    const status = searchParams.get('paymentStatus');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);

    if (start) {
      const parsed = new Date(start);
      if (isValid(parsed)) {
        setStartDate(parsed);
      }
    }
    if (end) {
      const parsed = new Date(end);
      if (isValid(parsed)) {
        setEndDate(parsed);
      }
    }
    if (method) {
      setPaymentMethod(method);
    }
    if (status) {
      setPaymentStatus(status);
    }
    setPage(pageParam - 1);
    setRowsPerPage(limitParam);
  };

  useEffect(() => {
    syncStateFromSearchParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTransactions = async () => {
    if (!isValid(startDate) || !isValid(endDate)) {
      setError('Please select valid dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        page: page + 1,
        limit: rowsPerPage,
      };

      if (paymentMethod !== 'all') {
        params.paymentMethod = paymentMethod;
      }

      if (paymentStatus !== 'all') {
        params.paymentStatus = paymentStatus;
      }

      const response = await api.get('/api/sales/transactions', {
        params,
      });

      if (response.data.success) {
        setSummary(response.data.summary);
        setTransactions(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, paymentMethod, paymentStatus, startDate, endDate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage + 1));
      return next;
    });
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      next.set('limit', String(newLimit));
      return next;
    });
  };

  const handleFilterChange = (type, value) => {
    if (type === 'paymentMethod') {
      setPaymentMethod(value);
    } else if (type === 'paymentStatus') {
      setPaymentStatus(value);
    }

    setPage(0);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      if (type === 'paymentMethod') {
        if (value === 'all') {
          next.delete('paymentMethod');
        } else {
          next.set('paymentMethod', value);
        }
      }
      if (type === 'paymentStatus') {
        if (value === 'all') {
          next.delete('paymentStatus');
        } else {
          next.set('paymentStatus', value);
        }
      }
      return next;
    });
  };

  const handleDateChange = (type, date) => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    if (!date || !isValid(date)) {
      return;
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (type === 'start') {
        next.set('startDate', format(date, 'yyyy-MM-dd'));
      } else {
        next.set('endDate', format(date, 'yyyy-MM-dd'));
      }
      return next;
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transaction Reports
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4">
                  {summary.totalTransactions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summary.totalAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {!loading && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => handleDateChange('start', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => handleDateChange('end', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) =>
                      handleFilterChange('paymentMethod', e.target.value)
                    }
                  >
                    <MenuItem value="all">All Methods</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="debit_card">Debit Card</MenuItem>
                    <MenuItem value="transfer">Transfer</MenuItem>
                    <MenuItem value="e_wallet">E-Wallet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={paymentStatus}
                    label="Payment Status"
                    onChange={(e) =>
                      handleFilterChange('paymentStatus', e.target.value)
                    }
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="partial">Partial</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transactions
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
                  {transactions.length > 0 ? (
                    transactions.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                        <TableCell>
                          {sale.invoiceNumber ||
                            `INV-${String(sale.id).padStart(6, '0')}`}
                        </TableCell>
                        <TableCell>
                          {sale.customerName || 'Walk-in Customer'}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell>
                          {sale.paymentStatus
                            ? sale.paymentStatus.toUpperCase()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {sale.paymentMethod
                            ? sale.paymentMethod.replace('_', ' ').toUpperCase()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={summary.totalTransactions}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default TransactionsReport;

