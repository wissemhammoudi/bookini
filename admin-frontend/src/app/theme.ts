import { createTheme } from '@mui/material/styles'

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0059B3',
        light: '#337acc',
        dark: '#003e7e',
      },
      secondary: {
        main: '#00A88F',
        light: '#33b9a5',
        dark: '#007564',
      },
      success: {
        main: '#1F9D6A',
      },
      warning: {
        main: '#C98900',
      },
      error: {
        main: '#D64545',
      },
      background:
        mode === 'light'
          ? { default: '#F5F7FB', paper: '#FFFFFF' }
          : { default: '#0C1525', paper: '#101D32' },
      text:
        mode === 'light'
          ? { primary: '#101828', secondary: '#5B6472' }
          : { primary: '#E5EEF9', secondary: '#98A6B7' },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: ['Inter', 'Public Sans', 'Segoe UI', 'sans-serif'].join(','),
      h3: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 800,
      },
      button: {
        fontWeight: 700,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 8,
            paddingInline: 16,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          fullWidth: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#101D32',
          },
          notchedOutline: {
            borderColor: mode === 'light' ? 'rgba(16, 24, 40, 0.12)' : 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#101D32',
          },
        },
      },
    },
  })
