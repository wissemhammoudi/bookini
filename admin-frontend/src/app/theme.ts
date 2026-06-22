import { createTheme } from '@mui/material/styles'

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0F6FDB',
        light: '#4A9EFF',
        dark: '#0A4D9A',
      },
      secondary: {
        main: '#1EA88A',
        light: '#58D0B5',
        dark: '#14745F',
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
          ? { default: '#EDF3FA', paper: '#FFFFFF' }
          : { default: '#07111E', paper: '#0E1727' },
      text:
        mode === 'light'
          ? { primary: '#101828', secondary: '#5B6472' }
          : { primary: '#E5EEF9', secondary: '#98A6B7' },
    },
    shape: {
      borderRadius: 18,
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
            borderRadius: 14,
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
            borderRadius: 14,
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#0B1320',
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
            borderRadius: 20,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
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
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#0B1320',
          },
        },
      },
    },
  })
