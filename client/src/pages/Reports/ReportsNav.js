import React from 'react';
import { Box, Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const ReportsNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Button
        component={RouterLink}
        to="/reports/sales"
        variant={currentPath === '/reports/sales' ? 'contained' : 'outlined'}
      >
        Sales Reports
      </Button>
      <Button
        component={RouterLink}
        to="/reports/inventory"
        variant={currentPath === '/reports/inventory' ? 'contained' : 'outlined'}
      >
        Inventory Report
      </Button>
      <Button
        component={RouterLink}
        to="/reports/transactions"
        variant={currentPath === '/reports/transactions' ? 'contained' : 'outlined'}
      >
        Transaction Reports
      </Button>
      <Button
        component={RouterLink}
        to="/reports/suppliers"
        variant={currentPath === '/reports/suppliers' ? 'contained' : 'outlined'}
      >
        Supplier Reports
      </Button>
    </Box>
  );
};

export default ReportsNav;
