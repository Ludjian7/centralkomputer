import React from 'react';
import { Box } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

const Logo = ({ size = 'medium', color = 'primary' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 40;
      case 'medium':
      default:
        return 32;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: getSize(),
        height: getSize(),
        borderRadius: '50%',
        backgroundColor: `${color}.main`,
        color: `${color}.contrastText`,
      }}
    >
      <ComputerIcon sx={{ fontSize: getSize() * 0.6 }} />
    </Box>
  );
};

export default Logo; 