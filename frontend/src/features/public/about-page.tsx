import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Paper,
  alpha,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import SpeedIcon from '@mui/icons-material/Speed'
import VerifiedIcon from '@mui/icons-material/Verified'
import InfoIcon from '@mui/icons-material/Info'
import HubIcon from '@mui/icons-material/Hub'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'

export const AboutPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const offers = [
    {
      title: 'For Users',
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: '2.25rem', color: '#3b82f6' }} />,
      color: '#3b82f6',
      items: [
        'Easy space discovery',
        'Online reservations',
        'Availability checking',
        'Reservation history',
      ],
    },
    {
      title: 'For Space Managers',
      icon: <BusinessCenterOutlinedIcon sx={{ fontSize: '2.25rem', color: '#10b981' }} />,
      color: '#10b981',
      items: [
        'Space management',
        'Reservation tracking',
        'Availability management',
        'Reservation approvals',
      ],
    },
    {
      title: 'For Administrators',
      icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: '2.25rem', color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      items: [
        'Facility management',
        'Space organization',
        'User management',
        'Reservation monitoring',
      ],
    },
  ]

  const values = [
    {
      title: 'Simplicity',
      desc: 'Easy-to-use platform.',
      icon: <SpeedIcon sx={{ fontSize: '2rem', color: '#3b82f6' }} />,
    },
    {
      title: 'Reliability',
      desc: 'Accurate availability and reservation tracking.',
      icon: <VerifiedIcon sx={{ fontSize: '2rem', color: '#10b981' }} />,
    },
    {
      title: 'Transparency',
      desc: 'Clear information and reservation processes.',
      icon: <InfoIcon sx={{ fontSize: '2rem', color: '#f59e0b' }} />,
    },
    {
      title: 'Innovation',
      desc: 'Modern tools for managing spaces.',
      icon: <HubIcon sx={{ fontSize: '2rem', color: '#8b5cf6' }} />,
    },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f1f5f9 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #0f172a 100%)',
      }}
    >
      <PublicNavbar isLight={isLight} />

      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: isLight
            ? 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                  About Us
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.1,
                  }}
                >
                  Connecting People With the{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Right Spaces
                  </Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.15rem', lineHeight: 1.7 }}>
                  BookiWa7dek is a reservation platform designed to connect people with spaces that fit
                  their needs. Whether you're organizing a meeting, hosting an event, conducting
                  training, or looking for a workspace, our platform makes finding and reserving
                  spaces simple and efficient.
                </Typography>
              </Stack>
            </Grid>

            {/* Mission & Vision Cards */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    background: isLight ? '#ffffff' : alpha('#1e293b', 0.4),
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                      }}
                    >
                      <FlagOutlinedIcon fontSize="medium" />
                    </Box>
                    <Stack spacing={1}>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Our Mission
                      </Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.6 }}>
                        To simplify space reservations and help organizations maximize the use of
                        their facilities.
                      </Typography>
                    </Stack>
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    background: isLight ? '#ffffff' : alpha('#1e293b', 0.4),
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                      }}
                    >
                      <VisibilityOutlinedIcon fontSize="medium" />
                    </Box>
                    <Stack spacing={1}>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Our Vision
                      </Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.6 }}>
                        To become the leading platform for space reservation and management across
                        Tunisia and beyond.
                      </Typography>
                    </Stack>
                  </Box>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* What We Offer */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Offerings
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            What We Offer
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {offers.map((offer, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  background: isLight ? '#ffffff' : alpha('#1e293b', 0.4),
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 12px 30px ${alpha(offer.color, 0.08)}`,
                    borderColor: offer.color,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box>{offer.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {offer.title}
                    </Typography>
                    <Stack spacing={2}>
                      {offer.items.map((item, itemIdx) => (
                        <Stack key={itemIdx} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: alpha(offer.color, 0.1),
                              display: 'grid',
                              placeItems: 'center',
                              color: offer.color,
                              flexShrink: 0,
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 14, fontWeight: 900 }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Our Values */}
      <Box
        sx={{
          py: 12,
          background: isLight
            ? 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)'
            : 'linear-gradient(180deg, #0a0e1a 0%, #0f172a 100%)',
          borderTop: '1px solid',
          borderColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: 'primary.main',
                  }}
                >
                  <EmojiObjectsOutlinedIcon />
                  <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                    Core Philosophy
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                  Our Values
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  We design our platform around simple principles to make space management fluid and accessible.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={3}>
                {values.map((val, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                        background: isLight ? '#ffffff' : alpha('#1e293b', 0.5),
                        height: '100%',
                      }}
                    >
                      <Box sx={{ mb: 2 }}>{val.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                        {val.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {val.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 6, md: 8 },
            borderRadius: 5,
            background: isLight
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)',
          }}
        >
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              Join bookiwa7dek Today
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400 }}>
              Simplify how your organization syncs resources, bookings, and operations.
            </Typography>
            <Button
              component={RouterLink}
              to="/book"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#ffffff',
                color: isLight ? '#059669' : '#047857',
                fontWeight: 800,
                px: 5,
                py: 2,
                borderRadius: 3,
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.95),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
