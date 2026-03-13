import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    hireDate: '',
    isActive: true,
    gaji: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchEmployee = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/api/employees/${id}`);
          if (response.data.success) {
            const employee = response.data.data;
            setFormData({
              name: employee.name || '',
              email: employee.email || '',
              phone: employee.phone || '',
              position: employee.position || '',
              hireDate: employee.hireDate || '',
              isActive:
                employee.isActive !== undefined ? employee.isActive : true,
              gaji: employee.gaji || '',
              notes: employee.notes || '',
            });
          } else {
            setSubmitError('Failed to load employee data');
          }
        } catch (error) {
          console.error('Error fetching employee:', error);
          setSubmitError('Error loading employee data');
        } finally {
          setLoading(false);
        }
      };

      fetchEmployee();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Nama wajib diisi';
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError(null);
    setSubmitSuccess(false);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let response;

      if (isEditMode) {
        response = await api.put(`/api/employees/${id}`, formData);
      } else {
        response = await api.post('/api/employees', formData);
      }

      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate(isEditMode ? `/employees/${id}` : '/employees');
        }, 1500);
      } else {
        setSubmitError(response.data.message || 'Gagal menyimpan data karyawan');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      const apiMessage = error.response?.data?.message;
      setSubmitError(apiMessage || 'Terjadi kesalahan saat menyimpan data. Coba lagi.');
    }
  };

  if (loading) {
    return <Typography>Memuat data...</Typography>;
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
        >
          Kembali ke Karyawan
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Data karyawan berhasil disimpan!
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nama"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jabatan"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telepon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tanggal Masuk"
                name="hireDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.hireDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gaji"
                name="gaji"
                type="number"
                value={formData.gaji}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rp</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Catatan"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Aktif"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SaveIcon />}
                >
                  Simpan
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeForm;

