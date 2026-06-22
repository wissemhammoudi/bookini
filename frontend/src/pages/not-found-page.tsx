import { Button, Stack, Typography, Box, Paper, IconButton } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { useColorMode } from '@/app/use-color-mode'

export const NotFoundPage = () => {
  const { mode, toggleMode } = useColorMode()
  const isLight = mode === 'light'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight
          ? 'linear-gradient(135deg, #f5f7fb 0%, #e4ecfa 100%)'
          : 'linear-gradient(135deg, #090e17 0%, #121e33 100%)',
        position: 'relative',
        py: 4,
        px: 2,
      }}
    >
      {/* Floating Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton
          onClick={toggleMode}
          color="inherit"
          sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
        >
          {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
      </Box>

      <Stack spacing={3} sx={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
        <Paper
          sx={{
            width: '100%',
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            boxShadow: isLight
              ? '0 10px 30px rgba(0, 89, 179, 0.08)'
              : '0 10px 30px rgba(0, 0, 0, 0.4)',
            border: '1px solid',
            borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            background: isLight ? '#ffffff' : '#101d32',
          }}
        >
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            {/* Big 404 Text */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '5.5rem', sm: '7rem' },
                lineHeight: 1,
                background: 'linear-gradient(45deg, #0059B3 30%, #00A88F 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.05em',
              }}
            >
              404
            </Typography>

            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Oops! Page not found
              </Typography>
              <Typography color="text.secondary" variant="body2">
                We can't seem to find the page you're looking for. It might have been moved or deleted.
              </Typography>
            </Stack>

            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 89, 179, 0.2)',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(0, 89, 179, 0.3)',
                },
              }}
            >
              Back to Home
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}

