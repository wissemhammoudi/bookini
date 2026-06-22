import { createTheme } from '@mui/material/styles'

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1171D8',
      },
      secondary: {
        main: '#2AA88A',
      },
      background:
        mode === 'light'
          ? { default: '#EFF4FA', paper: '#FFFFFF' }
          : { default: '#08111F', paper: '#0F1727' },
    },
    shape: {
      borderRadius: 18,
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
            borderRadius: 14,
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
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
