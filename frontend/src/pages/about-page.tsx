import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  alpha,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import GroupsIcon from '@mui/icons-material/Groups'
import AnalyticsIcon from '@mui/icons-material/Analytics'

import { useColorMode } from '@/app/use-color-mode'

export const AboutPage = () => {
  const navigate = useNavigate()
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
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: alpha(isLight ? '#ffffff' : '#0f1419', isLight ? 0.82 : 0.85),
          backdropFilter: 'blur(18px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/')}
                color="inherit"
                sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                About Us
              </Typography>
            </Stack>

            <IconButton
              onClick={toggleMode}
              color="inherit"
              sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
            >
              {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={8}>
          {/* Hero Section */}
          <Box>
            <Stack spacing={3}>
              <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
                About bookiwa7dek
              </Typography>
              <Typography variant="h6" color="text.secondary">
                We're building the future of workspace management and floor reservations with smart,
                intuitive tools designed for modern organizations.
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

          {/* Our Mission */}
          <Box>
            <Stack spacing={3}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Our Mission
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                bookiwa7dek simplifies workspace management by providing organizations with a
                centralized platform for managing room reservations, tracking occupancy, and maintaining
                clear communication across teams. We empower companies to optimize their physical spaces
                while keeping operations organized and efficient.
              </Typography>
            </Stack>
          </Box>

          {/* Core Values */}
          <Box>
            <Stack spacing={3}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Our Core Values
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {[
                  {
                    icon: SecurityIcon,
                    title: 'Security First',
                    description:
                      'User data protection and role-based access control are fundamental to our design.',
                  },
                  {
                    icon: SpeedIcon,
                    title: 'Simplicity & Speed',
                    description:
                      'Fast, intuitive interfaces that reduce complexity and save time for users.',
                  },
                  {
                    icon: GroupsIcon,
                    title: 'Team Collaboration',
                    description:
                      'Clear role management and real-time synchronization keep teams aligned.',
                  },
                  {
                    icon: AnalyticsIcon,
                    title: 'Data-Driven Insights',
                    description:
                      'Comprehensive analytics help organizations understand space usage and optimize operations.',
                  },
                ].map((value) => {
                  const Icon = value.icon
                  return (
                    <Paper
                      key={value.title}
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
                        background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha('#1976d2', 0.1),
                            color: 'primary.main',
                          }}
                        >
                          <Icon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {value.title}
                        </Typography>
                        <Typography color="text.secondary">{value.description}</Typography>
                      </Stack>
                    </Paper>
                  )
                })}
              </Box>
            </Stack>
          </Box>

          {/* Why Choose Us */}
          <Box>
            <Stack spacing={3}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Why Choose bookiwa7dek?
              </Typography>
              <Stack spacing={2}>
                {[
                  'Centralized reservation management for all rooms and floors',
                  'Real-time occupancy tracking and analytics',
                  'Role-based access control (Users, Admins, Super Admins)',
                  'Public-facing company interface and contact management',
                  'Built-in activity logging and audit trails',
                  'Responsive design that works on all devices',
                  'Seamless integration with your existing workflows',
                  'Dedicated support and regular updates',
                ].map((point, index) => (
                  <Stack key={index} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    >
                      <Typography sx={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography sx={{ pt: 0.5 }}>{point}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              background: isLight
                ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                : `linear-gradient(135deg, ${alpha('#101d32', 0.6)} 0%, ${alpha('#0a0e1a', 0.8)} 100%)`,
              textAlign: 'center',
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Ready to transform your workspace management?
              </Typography>
              <Typography color="text.secondary">
                Join organizations already using bookiwa7dek to streamline their operations.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', pt: 1 }}>
                <Button
                  href="/register"
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
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outlined"
                  size="large"
                  sx={{ fontWeight: 700 }}
                >
                  Back to Home
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
