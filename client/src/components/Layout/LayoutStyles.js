import { styled } from '@mui/material/styles';
import { Card, Paper } from '@mui/material';

// Styled components for consistent layout across all modules
export const StyledStatCard = styled(Card)(({ theme, color = '#1B4137' }) => ({
  minHeight: '140px',
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${color === '#1B4137' 
    ? 'rgba(27, 65, 55, 0.05)'
    : color === '#FE7102' 
      ? 'rgba(255, 248, 240, 0.4)'
      : color === '#2E7D32' 
        ? 'rgba(232, 245, 233, 0.4)'
        : color === '#FF9800' 
          ? 'rgba(255, 243, 224, 0.4)'
          : 'rgba(240, 244, 248, 0.4)'} 100%)`,
  borderLeft: `3px solid ${color}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

export const StyledDetailCard = styled(Paper)(({ theme, color = '#1976D2' }) => ({
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${
    color === '#1976D2' 
      ? 'rgba(240, 244, 248, 0.9)'
      : color === '#0097A7' 
        ? 'rgba(225, 238, 242, 0.9)'
        : color === '#FF9800' 
          ? 'rgba(255, 243, 224, 0.6)'
          : color === '#2E7D32' 
            ? 'rgba(232, 245, 233, 0.6)'
            : 'rgba(240, 244, 248, 0.4)'
  } 100%)`,
  borderLeft: `3px solid ${color}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  }
}));

// Theme colors for consistent usage
export const themeColors = {
  primary: '#1B4137',     // Dark green
  secondary: '#FE7102',   // Orange
  success: '#2E7D32',     // Forest green
  warning: '#FF9800',     // Amber
  info: '#1976D2',        // Blue 
  cyan: '#0097A7',        // Cyan
  lightGreen: '#4CAF50',  // Light green
  deepOrange: '#E65100',  // Deep orange
  grey: '#607D8B'         // Blue grey
};

// Background gradients for layout sections
export const layoutGradients = {
  mainBackground: 'linear-gradient(135deg, rgba(27, 65, 55, 0.08) 0%, rgba(61, 211, 123, 0.12) 50%, rgba(254, 113, 2, 0.06) 100%)',
  contentBackground: 'linear-gradient(135deg, rgba(27, 65, 55, 0.02) 0%, rgba(61, 211, 123, 0.05) 50%, rgba(254, 113, 2, 0.02) 100%)',
  pageContainer: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)'
};

export default {
  StyledStatCard,
  StyledDetailCard,
  themeColors,
  layoutGradients
}; 