import { Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Grid,
  Paper,
  alpha,
} from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useColorMode } from '@/app/use-color-mode'

/**
 * Landing Page
 * Homepage with hero section and company overview
 * Showcases booking platform features and benefits
 */
export const LandingPage = () => {
  const { mode, toggleMode } = useColorMode()
  const isLight = mode === 'light'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: alpha(isLight ? '#ffffff' : '#0f1419', isLight ? 0.6 : 0.5),
          backdropFilter: 'blur(18px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              bookiwa7dek
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={toggleMode} color="inherit" size="small">
                {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
              <Button component={RouterLink} to="/login" variant="outlined" size="small">
                Sign In
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Hero Section */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.35fr) minmax(320px, 0.65fr)' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Box>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: '0.22em',
                    color: 'primary.main',
                    fontWeight: 700,
                  }}
                >
                  bookiwa7dek workspace platform
                </Typography>
                <Chip label="v1.0" size="small" variant="outlined" />
              </Stack>
              <Typography
                variant="h2"
                sx={{ fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.04 }}
              >
                Describe your company, manage rooms, and keep teams in sync.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
                bookiwa7dek helps organizations publish a clean company interface, present services,
                support contact requests, and run reservations with clear roles for users, admins,
                and super admins.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  component={RouterLink} 
                  to="/book" 
                  variant="contained" 
                  size="large"
                  sx={{
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0, 89, 179, 0.2)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 89, 179, 0.3)',
                    },
                  }}
                >
                  Book Now
                </Button>
                <Button 
                  href="#contact" 
                  variant="outlined" 
                  size="large"
                  sx={{
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Contact us
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              background: isLight
                ? 'linear-gradient(135deg, rgba(0, 89, 179, 0.05) 0%, rgba(0, 120, 215, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0, 89, 179, 0.1) 0%, rgba(0, 120, 215, 0.1) 100%)',
              borderRadius: 4,
              p: 4,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Key Features
            </Typography>
            <Stack spacing={1.5}>
              {['Public booking interface', 'Admin dashboard', 'Real-time availability', 'Partnership requests'].map((feature) => (
                <Box key={feature} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                  <Typography variant="body2">{feature}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* About Section */}
        <Box id="about" sx={{ pt: { xs: 8, md: 12 } }}>
          <Stack spacing={1.5} sx={{ mb: 3, maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
              Company overview
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Build a polished company story and keep operations organized.
            </Typography>
            <Typography color="text.secondary">
              This front-end can act as a public home for your company while still supporting the
              internal reservation system, admin management, and reporting tools behind login.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {[
              {
                title: 'Public Site',
                description: 'Professional landing page with company information and services.',
              },
              {
                title: 'Admin Tools',
                description: 'Comprehensive dashboard for managing floors, reservations, and staff.',
              },
              {
                title: 'Role-Based Access',
                description: 'Super admin, admin, and user roles with appropriate permissions.',
              },
            ].map((item) => (
              <Paper
                key={item.title}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Contact Section */}
        <Box id="contact" sx={{ pt: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            Ready to get started?
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button component={RouterLink} to="/book" variant="contained" size="large" sx={{ fontWeight: 700 }}>
              Book a Room
            </Button>
            <Button component={RouterLink} to="/contact" variant="outlined" size="large" sx={{ fontWeight: 700 }}>
              Contact Us
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
