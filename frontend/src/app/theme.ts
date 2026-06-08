import { createTheme } from '@mui/material/styles'

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0059B3',
      },
      secondary: {
        main: '#00A88F',
      },
      background:
        mode === 'light'
          ? { default: '#F5F7FB', paper: '#FFFFFF' }
          : { default: '#0C1525', paper: '#101D32' },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: ['Public Sans', 'Segoe UI', 'sans-serif'].join(','),
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
