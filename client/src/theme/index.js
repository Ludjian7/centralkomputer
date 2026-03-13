import { createTheme } from '@mui/material/styles';

// New color palette from the uploaded image
const colors = {
  darkGreen: '#1B4137',
  lightGreen: '#3DD37B',
  navy: '#232E3F',
  white: '#FFFFFF',
  orange: '#FE7102'
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.darkGreen,
      light: colors.lightGreen,
      dark: '#153229',
      contrastText: colors.white,
    },
    secondary: {
      main: colors.orange,
      light: '#FF9A4F',
      dark: '#D05E00',
      contrastText: colors.white,
    },
    background: {
      default: '#F5F7FA',
      paper: colors.white,
    },
    text: {
      primary: colors.navy,
      secondary: '#637085',
    },
    success: {
      main: colors.lightGreen,
      light: '#7EEAB0',
      dark: '#2AA65B',
    },
    info: {
      main: '#2196F3',
      light: '#90CAF9',
      dark: '#1976D2',
    },
    warning: {
      main: colors.orange,
      light: '#FFCC80',
      dark: '#D05E00',
    },
    error: {
      main: '#F44336',
      light: '#FFCDD2',
      dark: '#D32F2F',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.05)',
    '0px 16px 24px rgba(0, 0, 0, 0.05)',
    '0px 24px 32px rgba(0, 0, 0, 0.05)',
    '0px 32px 40px rgba(0, 0, 0, 0.05)',
    '0px 40px 48px rgba(0, 0, 0, 0.05)',
    '0px 48px 56px rgba(0, 0, 0, 0.05)',
    '0px 56px 64px rgba(0, 0, 0, 0.05)',
    '0px 64px 72px rgba(0, 0, 0, 0.05)',
    '0px 72px 80px rgba(0, 0, 0, 0.05)',
    '0px 80px 88px rgba(0, 0, 0, 0.05)',
    '0px 88px 96px rgba(0, 0, 0, 0.05)',
    '0px 96px 104px rgba(0, 0, 0, 0.05)',
    '0px 104px 112px rgba(0, 0, 0, 0.05)',
    '0px 112px 120px rgba(0, 0, 0, 0.05)',
    '0px 120px 128px rgba(0, 0, 0, 0.05)',
    '0px 128px 136px rgba(0, 0, 0, 0.05)',
    '0px 136px 144px rgba(0, 0, 0, 0.05)',
    '0px 144px 152px rgba(0, 0, 0, 0.05)',
    '0px 152px 160px rgba(0, 0, 0, 0.05)',
    '0px 160px 168px rgba(0, 0, 0, 0.05)',
    '0px 168px 176px rgba(0, 0, 0, 0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.white,
          color: colors.navy,
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: 16,
          padding: 24,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: 24,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          marginBottom: 24,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px 24px',
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.darkGreen,
          color: colors.white,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.10)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          padding: '0 24px',
        },
      },
    },
  },
});

export default theme; 