import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link as MuiLink,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const { currentUser, loading, error, login, clearError } = useContext(AuthContext);

  useEffect(() => {
    // Clear any previous errors
    clearError();
    // Reset error visibility when component mounts
    setIsErrorVisible(false);
  }, [clearError]);

  useEffect(() => {
    // Show error alert if there's an error
    if (error) {
      setIsErrorVisible(true);
    }
  }, [error]);

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseError = () => {
    setIsErrorVisible(false);
    clearError();
  };

  const validate = () => {
    const errors = {};
    // Username/Email validation
    if (!formData.usernameOrEmail.trim()) {
      errors.usernameOrEmail = 'Username is required';
    } else if (formData.usernameOrEmail.trim().length < 3) {
      errors.usernameOrEmail = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Increment attempt count
    setAttemptCount(prevCount => prevCount + 1);
    
    // Submit form
    try {
      await login(formData.usernameOrEmail, formData.password);
    } catch (err) {
      // Error is handled by context, just make sure it's visible
      setIsErrorVisible(true);
      
      // After 3 failed attempts, show additional guidance
      if (attemptCount >= 2) {
        setFormErrors(prev => ({
          ...prev,
          general: 'Multiple failed attempts. Please verify your credentials or contact support.'
        }));
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(61, 211, 123, 0.1) 0%, rgba(254, 113, 2, 0.05) 100%)',
        padding: 2
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 'md',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {/* Form Container - Now on the left */}
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: '100%', md: '45%' },
            minHeight: { md: 450 },
            order: { xs: 2, md: 1 },
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ 
            fontWeight: 600, 
            letterSpacing: 1, 
            mb: 3,
            color: '#232E3F',
            textAlign: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '40px',
              height: '3px',
              background: 'linear-gradient(to right, #3DD37B, #FE7102)',
              margin: '8px auto 0',
              borderRadius: '2px'
            }
          }}>
            LOG IN
          </Typography>
          
          <Collapse in={isErrorVisible}>
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                '& .MuiAlert-message': {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
              icon={<ErrorOutlineIcon fontSize="inherit" />}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseError}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error || "Authentication failed. Please check your credentials."}
            </Alert>
          </Collapse>

          {formErrors.general && (
            <Alert 
              severity="warning" 
              sx={{ width: '100%', mb: 2 }}
              icon={<ErrorOutlineIcon fontSize="inherit" />}
            >
              {formErrors.general}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ 
            width: '100%', 
            maxWidth: '320px',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="usernameOrEmail"
              label="Username"
              name="usernameOrEmail"
              autoComplete="username"
              autoFocus
              value={formData.usernameOrEmail}
              onChange={handleChange}
              error={!!formErrors.usernameOrEmail}
              helperText={formErrors.usernameOrEmail}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-error fieldset': {
                    borderColor: 'error.main',
                    borderWidth: '2px'
                  }
                } 
              }}
              InputProps={{
                endAdornment: formErrors.usernameOrEmail && (
                  <InputAdornment position="end">
                    <ErrorOutlineIcon color="error" fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-error fieldset': {
                    borderColor: 'error.main',
                    borderWidth: '2px'
                  }
                } 
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formErrors.password && <ErrorOutlineIcon color="error" fontSize="small" sx={{ mr: 1 }} />}
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mb: 3, 
                py: 1.2,
                background: 'linear-gradient(135deg, #3DD37B 0%, #FE7102 100%)',
                boxShadow: '0 4px 10px rgba(254, 113, 2, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #35BD6E 0%, #E66700 100%)',
                  boxShadow: '0 6px 12px rgba(254, 113, 2, 0.4)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  <span>Logging in...</span>
                </Box>
              ) : 'LOG IN'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                @Central_Computer
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Forgot password? <MuiLink component={Link} to="/forgot-password" sx={{ color: '#3DD37B' }}>Reset here</MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        {/* Logo Container - Now on the right */}
        <Paper
          elevation={3}
          sx={{
            width: { xs: '100%', md: '45%' },
            minHeight: { md: 450 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            mb: { xs: 3, md: 0 },
            p: 4,
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            position: 'relative',
            order: { xs: 1, md: 2 },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: { xs: '50%', md: -20 },
              top: { xs: -20, md: '50%' },
              transform: { xs: 'translateX(-50%)', md: 'translateY(-50%)' },
              width: { xs: 80, md: 2 },
              height: { xs: 2, md: 80 },
              background: 'linear-gradient(to right, #3DD37B, #FE7102)',
              borderRadius: 4,
              boxShadow: '0 0 8px rgba(254, 113, 2, 0.3)',
            },
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2
            }}
          >
            <Box
              component="img"
              src="/images/central-computer-logo.png"
              alt="Central Computer Logo"
              sx={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain',
                maxHeight: { xs: '200px', md: '300px' }
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 