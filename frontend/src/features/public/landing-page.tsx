import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  Paper,
  alpha,
  Grid,
  TextField,
  MenuItem,
  Rating,
  Avatar,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CategoryIcon from '@mui/icons-material/Category'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PeopleIcon from '@mui/icons-material/People'
import StarIcon from '@mui/icons-material/Star'
import VerifiedIcon from '@mui/icons-material/Verified'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import InfoIcon from '@mui/icons-material/Info'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'

/**
 * Landing Page
 * Homepage with hero section, space type preview, interactive search, categories,
 * how it works, features, featured spaces, testimonials, and CTA.
 */
export const LandingPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const navigate = useNavigate()

  // Search form state
  const [location, setLocation] = useState('')
  const [spaceType, setSpaceType] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to the booking page with query parameters
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (spaceType) params.append('type', spaceType)
    if (date) params.append('date', date)
    if (capacity) params.append('capacity', capacity)
    navigate(`/book?${params.toString()}`)
  }

  // Previews for Hero Section visual
  const heroSpaces = [
    { name: 'Meeting Rooms', icon: '🏢', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    { name: 'Coworking Offices', icon: '💻', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    { name: 'Event Halls', icon: '🎉', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
    { name: 'Sports Fields', icon: '⚽', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { name: 'Training Rooms', icon: '🎓', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
  ]

  // Categories
  const categories = [
    { title: 'Meeting Rooms', icon: '📍', desc: 'Professional spaces for private boards and team syncs.' },
    { title: 'Coworking Spaces', icon: '💻', desc: 'Flexible hot desks and dedicated offices.' },
    { title: 'Event Venues', icon: '🎉', desc: 'Large halls and creative spaces for gatherings.' },
    { title: 'Sports Facilities', icon: '⚽', desc: 'Fields, courts, and training grounds.' },
    { title: 'Training Rooms', icon: '🎓', desc: 'Classrooms fully equipped for workshops and lectures.' },
    { title: 'Private Dining Spaces', icon: '🍽️', desc: 'Elegant dining rooms for professional lunches.' },
  ]

  // Steps
  const steps = [
    { num: '01', title: 'Search', desc: 'Find spaces that match your needs.' },
    { num: '02', title: 'Reserve', desc: 'Choose a date and submit your reservation.' },
    { num: '03', title: 'Confirm', desc: 'Receive confirmation from the space manager.' },
    { num: '04', title: 'Enjoy', desc: 'Use the space and focus on your activity.' },
  ]

  // Why choose
  const advantages = [
    {
      title: 'Verified Spaces',
      desc: 'Every space is managed by approved administrators.',
      icon: <VerifiedIcon sx={{ fontSize: '2.5rem', color: '#3b82f6' }} />,
    },
    {
      title: 'Easy Reservations',
      desc: 'Reserve in just a few clicks.',
      icon: <TouchAppIcon sx={{ fontSize: '2.5rem', color: '#10b981' }} />,
    },
    {
      title: 'Transparent Information',
      desc: 'Clear descriptions, photos, and availability.',
      icon: <InfoIcon sx={{ fontSize: '2.5rem', color: '#f59e0b' }} />,
    },
    {
      title: 'Multiple Space Types',
      desc: 'From business meetings to events and sports activities.',
      icon: <CategoryIcon sx={{ fontSize: '2.5rem', color: '#8b5cf6' }} />,
    },
  ]

  // Featured Spaces
  const featuredSpaces = [
    {
      name: 'Premium Boardroom A',
      location: 'Downtown Paris',
      capacity: 'Up to 12 people',
      rating: 4.9,
      price: '€15/hr',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(29,78,216,0.5) 100%)',
    },
    {
      name: 'Creative Events Lounge',
      location: 'Mitte Berlin',
      capacity: 'Up to 50 people',
      rating: 4.8,
      price: '€45/hr',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(190,24,93,0.5) 100%)',
    },
    {
      name: 'Executive Training Hall',
      location: 'Tunis Center',
      capacity: 'Up to 30 people',
      rating: 4.7,
      price: '€25/hr',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(109,40,217,0.5) 100%)',
    },
  ]

  // Testimonials
  const testimonials = [
    {
      text: 'Finding a meeting room has never been easier.',
      author: 'Sarah L.',
      role: 'Tech Lead',
    },
    {
      text: 'The reservation process was quick and simple.',
      author: 'Ahmed K.',
      role: 'Event Organizer',
    },
    {
      text: 'Perfect solution for organizing workshops.',
      author: 'Maria S.',
      role: 'Educator',
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

      {/* 1. Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        <Grid container spacing={5} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={4}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Chip
                  label="All-in-one booking platform"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                />
              </Stack>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' },
                }}
              >
                Reserve the{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Perfect Space
                </Box>{' '}
                in Minutes
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ fontWeight: 400, maxWidth: 600, lineHeight: 1.6 }}
              >
                BookiWa7dek helps you discover and reserve meeting rooms, coworking spaces, event
                venues, sports facilities, and more—all from one platform.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                <Button
                  component={RouterLink}
                  to="/book"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    fontWeight: 700,
                    px: 4,
                    py: 1.8,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 28px rgba(59, 130, 246, 0.35)',
                    },
                  }}
                >
                  Find a Space
                </Button>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="outlined"
                  size="large"
                  sx={{
                    fontWeight: 700,
                    px: 4,
                    py: 1.8,
                    borderRadius: 3,
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.2)' : 'rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  List Your Space
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Hero Visual showing space types */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: { xs: 2, sm: 4 },
                borderRadius: 5,
                background: isLight
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(15, 23, 42, 0.3)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Discover Spaces
              </Typography>
              {heroSpaces.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 3,
                    background: isLight ? '#ffffff' : alpha('#1e293b', 0.6),
                    border: '1px solid',
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateX(6px)',
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.08)',
                    },
                  }}
                  onClick={() => navigate(`/book?type=${encodeURIComponent(item.name)}`)}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        background: item.gradient,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  </Stack>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 2. Search Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: isLight ? '#ffffff' : '#0f172a',
            border: '1px solid',
            borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            Where would you like to go?
          </Typography>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="">Any Location</MenuItem>
                <MenuItem value="Paris">Paris</MenuItem>
                <MenuItem value="Berlin">Berlin</MenuItem>
                <MenuItem value="Tunis">Tunis</MenuItem>
                <MenuItem value="Madrid">Madrid</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Space Type"
                value={spaceType}
                onChange={(e) => setSpaceType(e.target.value)}
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="">Any Type</MenuItem>
                <MenuItem value="Meeting Rooms">Meeting Rooms</MenuItem>
                <MenuItem value="Coworking Offices">Coworking Offices</MenuItem>
                <MenuItem value="Event Halls">Event Halls</MenuItem>
                <MenuItem value="Sports Fields">Sports Fields</MenuItem>
                <MenuItem value="Training Rooms">Training Rooms</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                variant="outlined"
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="">Any Capacity</MenuItem>
                <MenuItem value="1-5">1 - 5 People</MenuItem>
                <MenuItem value="6-15">6 - 15 People</MenuItem>
                <MenuItem value="16-50">16 - 50 People</MenuItem>
                <MenuItem value="50+">50+ People</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 1.5 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  py: 1.8,
                  fontWeight: 700,
                  borderRadius: 2.5,
                  minWidth: { md: '120px' },
                }}
              >
                <SearchIcon sx={{ mr: 0.5 }} /> Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* 3. Popular Categories */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Popular Categories
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Find the Perfect Setting
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {categories.map((cat, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  background: isLight ? '#ffffff' : alpha('#1e293b', 0.4),
                  transition: 'all 0.25s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 12px 24px rgba(59, 130, 246, 0.08)',
                  },
                }}
                onClick={() => navigate(`/book?type=${encodeURIComponent(cat.title)}`)}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h2" sx={{ mb: 2, fontSize: '2.5rem' }}>
                    {cat.icon}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {cat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {cat.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 4. How It Works */}
      <Box
        sx={{
          py: 12,
          background: isLight
            ? 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)'
            : 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: isLight ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.03)',
          mb: 12,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
              Process
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              How It Works
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {steps.map((step, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Box sx={{ position: 'relative', textAlign: 'center', p: 2 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: '4.5rem',
                      fontWeight: 900,
                      opacity: 0.08,
                      color: isLight ? '#000000' : '#ffffff',
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  >
                    {step.num}
                  </Typography>
                  <Stack spacing={1} sx={{ zIndex: 2, position: 'relative' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, mx: 'auto', lineHeight: 1.6 }}>
                      {step.desc}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Why Choose BookiWa7dek */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                Benefits
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                Why Choose BookiWa7dek
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, pt: 1 }}>
                We provide a professional and unified interface designed to handle reservations of
                diverse spaces quickly. Get full transparency, absolute reliability, and zero friction.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={3}>
              {advantages.map((adv, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: isLight ? '#ffffff' : alpha('#1e293b', 0.5),
                      border: '1px solid',
                      borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{adv.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                      {adv.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {adv.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* 6. Featured Spaces */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Featured
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Top Rated Spaces
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {featuredSpaces.map((space, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  background: isLight ? '#ffffff' : alpha('#1e293b', 0.4),
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                {/* Visual Placeholder representing image */}
                <Box
                  sx={{
                    height: 200,
                    background: space.gradient,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <Typography variant="h3" sx={{ opacity: 0.8 }}>
                    🏢
                  </Typography>
                  <Chip
                    label={space.price}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 700,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {space.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {space.location}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        👥 {space.capacity}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {space.rating}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 7. Testimonials */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Testimonials
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            What Our Members Say
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {testimonials.map((test, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  background: isLight ? '#ffffff' : alpha('#1e293b', 0.4),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Stack spacing={2}>
                  <FormatQuoteIcon sx={{ fontSize: '2.5rem', color: 'primary.main', opacity: 0.3 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{test.text}"
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', pt: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
                    {test.author[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {test.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.role}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 8. Call To Action */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 6, md: 8 },
            borderRadius: 5,
            background: isLight
              ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #1e3a8a 0%, #581c87 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(124, 58, 237, 0.25)',
          }}
        >
          {/* Background shapes */}
          <Box
            sx={{
              position: 'absolute',
              top: '-50%',
              left: '-20%',
              width: '60%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-50%',
              right: '-20%',
              width: '60%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          <Stack spacing={4} sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' } }}>
              Ready to Find Your Next Space?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
              Create an account or login to start choosing from verified boardrooms, sports fields, coworking halls, and more.
            </Typography>
            <Button
              component={RouterLink}
              to="/book"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#ffffff',
                color: isLight ? '#2563eb' : '#1e3a8a',
                fontWeight: 800,
                px: 5,
                py: 2,
                borderRadius: 3,
                fontSize: '1rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.95),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
                },
              }}
            >
              Start Booking
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
