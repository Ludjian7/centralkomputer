import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/api/employees/${id}`);
        if (response.data.success) {
          setEmployee(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch employee details');
        }
      } catch (err) {
        setError('Error fetching employee details');
        console.error('Error fetching employee:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return <Typography>Loading employee details...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!employee) {
    return <Alert severity="warning">Employee not found</Alert>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')}>
          Kembali ke Karyawan
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
            onClick={() => navigate(`/employees/${id}/edit`)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {employee.name}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={employee.isActive ? 'Aktif' : 'Nonaktif'}
                color={employee.isActive ? 'success' : 'default'}
              />
            </Box>
            <Typography variant="body1" paragraph>
              {employee.notes || 'Tidak ada catatan tambahan.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informasi Karyawan
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Jabatan</Typography>
                <Typography variant="body1">
                  {employee.position || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Tanggal Masuk</Typography>
                <Typography variant="body1">
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString('id-ID')
                    : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body1">
                  {employee.email || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Telepon</Typography>
                <Typography variant="body1">
                  {employee.phone || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Gaji</Typography>
                <Typography variant="body1">
                  {employee.gaji 
                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(employee.gaji) 
                    : '-'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EmployeeDetail;

