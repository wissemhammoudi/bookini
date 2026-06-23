import { useState } from 'react'
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import AdsClickIcon from '@mui/icons-material/AdsClick'
import SendIcon from '@mui/icons-material/Send'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import CelebrationIcon from '@mui/icons-material/Celebration'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import PersonIcon from '@mui/icons-material/Person'
import HelpIcon from '@mui/icons-material/Help'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'

export const ReservationsInfoPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [expanded, setExpanded] = useState<string | false>(false)
  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  // Consistent professional slate-based steps color accents
  const steps = [
    {
      step: 'Step 1',
      title: 'Browse Spaces',
      desc: 'Explore available spaces using filters such as Location, Category, Capacity, and Availability.',
      icon: <SearchIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
      color: '#475569',
    },
    {
      step: 'Step 2',
      title: 'Select a Space',
      desc: 'View photos, description, capacity details, standard amenities, and live availability schedules.',
      icon: <AdsClickIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
      color: '#334155',
    },
    {
      step: 'Step 3',
      title: 'Submit Reservation',
      desc: 'Choose your desired date, startTime, duration, and submit your reservation request.',
      icon: <SendIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
      color: '#1e293b',
    },
    {
      step: 'Step 4',
      title: 'Approval Process',
      desc: 'The space administrator reviews the request. Booking status changes to Pending, Approved, or Rejected.',
      icon: <FactCheckIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
      color: '#0f172a',
    },
    {
      step: 'Step 5',
      title: 'Use the Space',
      desc: 'Receive instant email/platform confirmation and enjoy your fully reserved space.',
      icon: <CelebrationIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />,
      color: '#020617',
    },
  ]

  // Clean monochromatic roles setup
  const roles = [
    {
      role: 'Super Admin',
      icon: <WorkspacePremiumIcon sx={{ fontSize: '3rem', color: 'text.primary' }} />,
      badge: '👑 Platform Owner',
      color: '#475569',
      manages: ['Platform settings', 'Administrators', 'All reservations', 'Global statistics'],
    },
    {
      role: 'Admin',
      icon: <CorporateFareIcon sx={{ fontSize: '3rem', color: 'text.primary' }} />,
      badge: '🏢 Space Manager',
      color: '#334155',
      manages: ['Places & Locations', 'Specific Spaces & Rooms', 'Reservations & Approvals', 'Availability schedules'],
    },
    {
      role: 'User',
      icon: <PersonIcon sx={{ fontSize: '3rem', color: 'text.primary' }} />,
      badge: '👤 Space Booker',
      color: '#1e293b',
      manages: ['Search spaces', 'Make reservations', 'Track reservation status', 'Manage bookings'],
    },
  ]

  const faqs = [
    {
      id: 'faq1',
      question: 'How do I reserve a space?',
      answer: 'Simply browse the home or booking page, choose the space type and filter that matches your requirements. Select the space, pick your date/time slots, and click submit to trigger a request to the space manager.',
    },
    {
      id: 'faq2',
      question: 'Can I cancel a reservation?',
      answer: 'Yes, reservations can be cancelled directly from your user profile dashboard according to the specific cancellation policy configured for the space.',
    },
    {
      id: 'faq3',
      question: 'How long does approval take?',
      answer: 'Typically, local space managers review requests and provide approval or feedback within 24 hours of submission.',
    },
    {
      id: 'faq4',
      question: 'Can I manage multiple spaces?',
      answer: 'Yes, users with Administrator roles are allowed to configure and manage multiple rooms, amenities, and scheduling calendars across various locations.',
    },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f1f5f9 100%)'
          : 'linear-gradient(180deg, #0b0f19 0%, #111827 45%, #0f172a 100%)',
      }}
    >
      <PublicNavbar isLight={isLight} />


      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: isLight
            ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f1f5f9 100%)'
            : 'linear-gradient(180deg, #0b0f19 0%, #111827 45%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Left: Title & Description */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                  User Guide
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
                  How It Works
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.15rem', lineHeight: 1.7 }}>
                  Getting your space booked is a simple, seamless process. Follow our easy guide to get started.
                </Typography>
              </Stack>
            </Grid>

            {/* Right: Image */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px -12px rgba(0,0,0,0.1)',
                  position: 'relative',
                  pt: '75%', // 4:3 aspect ratio
                  background: isLight
                    ? 'linear-gradient(135deg, #f1f5f9, #ffffff)'
                    : 'linear-gradient(135deg, #1f2937, #374151)',
                }}
              >
                <Box
                  component="img"
                  src="/how-it-works.webp"
                  alt="Booking process visualization"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stepper Timeline Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={3}>
          {steps.map((step, idx) => (
            <Grid size={{ xs: 12, md: 2.4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'text.primary',
                  },
                }}
              >
                <Box sx={{ height: 6, bgcolor: step.color }} />
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                          color: 'text.primary',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                        }}
                      >
                        {step.step}
                      </Typography>
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 850 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {step.desc}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Roles Section */}
      <Box
        sx={{
          py: 12,
          background: isLight
            ? 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
            : 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 12,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
              Access Controls
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              User Roles & Permissions
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              We maintain role-based boundaries to ensure clear workflows and secure setups.
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {roles.map((r, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: isLight ? '#ffffff' : alpha('#1f2937', 0.5),
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                        color: 'text.primary',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {r.icon}
                    </Box>
                    <Stack spacing={1}>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {r.role}
                      </Typography>
                      <Chip
                        label={r.badge}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                          color: 'text.primary',
                        }}
                      />
                    </Stack>

                    <Stack spacing={1.5} sx={{ alignSelf: 'stretch', textAlign: 'left', pt: 2 }}>
                      {r.manages.map((m, mIdx) => (
                        <Stack key={mIdx} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.primary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {m}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <HelpIcon sx={{ fontSize: '3rem', color: 'text.secondary', mx: 'auto', opacity: 0.8 }} />
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Frequently Asked Questions
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx}
              elevation={0}
              expanded={expanded === faq.id}
              onChange={handleAccordionChange(faq.id)}
              sx={{
                borderRadius: '12px !important',
                border: '1px solid',
                borderColor: 'divider',
                background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                mb: 1,
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 6, md: 8 },
            borderRadius: 5,
            background: isLight
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #030712 0%, #0f172a 100%)',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              Reserve Your First Space Now
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400 }}>
              Choose a time, date, and space type to coordinate your next workshop, sync, or match.
            </Typography>
            <Button
              component={RouterLink}
              to="/book"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#ffffff',
                color: '#0f172a',
                fontWeight: 800,
                px: 5,
                py: 2,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Start Booking
            </Button>
          </Stack>
        </Paper>
      </Container>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
