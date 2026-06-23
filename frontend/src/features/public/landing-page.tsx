import { useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  Avatar,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CategoryIcon from '@mui/icons-material/Category'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PeopleIcon from '@mui/icons-material/People'
import StarIcon from '@mui/icons-material/Star'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined'
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined'
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import InfoIcon from '@mui/icons-material/Info'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'
import { listPublicRooms } from '@/lib/api'

/**
 * Landing Page
 * Homepage with a professional, minimalistic color palette and clean design tokens.
 */
export const LandingPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const navigate = useNavigate()
  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  // Search form state
  const [location, setLocation] = useState('')
  const [spaceType, setSpaceType] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (spaceType) params.append('type', spaceType)
    if (date) params.append('date', date)
    if (capacity) params.append('capacity', capacity)
    navigate(`/book?${params.toString()}`)
  }

  // Cohesive professional slate/blue gradients for hero items
  const heroSpaces = [
    {
      name: 'Meeting Rooms',
      icon: <MeetingRoomOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    },
    {
      name: 'Coworking Offices',
      icon: <LaptopMacOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    },
    {
      name: 'Event Halls',
      icon: <CelebrationOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    },
    {
      name: 'Sports Fields',
      icon: <SportsSoccerOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    },
    {
      name: 'Training Rooms',
      icon: <SchoolOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    },
  ]

  // Monochromatic categories
  const categories = [
    {
      title: 'Meeting Rooms',
      icon: <MeetingRoomOutlinedIcon sx={{ fontSize: '2rem', color: isLight ? '#0f172a' : '#e2e8f0' }} />,
      desc: 'Professional spaces for private boards and team syncs.',
    },
    {
      title: 'Coworking Spaces',
      icon: <LaptopMacOutlinedIcon sx={{ fontSize: '2rem', color: isLight ? '#0f172a' : '#e2e8f0' }} />,
      desc: 'Flexible hot desks and dedicated offices.',
    },
    {
      title: 'Event Venues',
      icon: <CelebrationOutlinedIcon sx={{ fontSize: '2rem', color: isLight ? '#0f172a' : '#e2e8f0' }} />,
      desc: 'Large halls and creative spaces for gatherings.',
    },
    {
      title: 'Sports Facilities',
      icon: <SportsSoccerOutlinedIcon sx={{ fontSize: '2rem', color: isLight ? '#0f172a' : '#e2e8f0' }} />,
      desc: 'Fields, courts, and training grounds.',
    },
    {
      title: 'Training Rooms',
      icon: <SchoolOutlinedIcon sx={{ fontSize: '2rem', color: isLight ? '#0f172a' : '#e2e8f0' }} />,
      desc: 'Classrooms fully equipped for workshops and lectures.',
    },
    {
      title: 'Private Dining Spaces',
      icon: <RestaurantOutlinedIcon sx={{ fontSize: '2rem', color: isLight ? '#0f172a' : '#e2e8f0' }} />,
      desc: 'Elegant dining rooms for professional lunches.',
    },
  ]

  // Clean grey steps
  const steps = [
    { num: '01', title: 'Search', desc: 'Find spaces that match your needs.' },
    { num: '02', title: 'Reserve', desc: 'Choose a date and submit your reservation.' },
    { num: '03', title: 'Confirm', desc: 'Receive confirmation from the space manager.' },
    { num: '04', title: 'Enjoy', desc: 'Use the space and focus on your activity.' },
  ]

  // Monochromatic minimal icons
  const advantages = [
    {
      title: 'Verified Spaces',
      desc: 'Every space is managed by approved administrators.',
      icon: <VerifiedIcon sx={{ fontSize: '2.25rem', color: isLight ? '#1e293b' : '#94a3b8' }} />,
    },
    {
      title: 'Easy Reservations',
      desc: 'Reserve in just a few clicks.',
      icon: <TouchAppIcon sx={{ fontSize: '2.25rem', color: isLight ? '#1e293b' : '#94a3b8' }} />,
    },
    {
      title: 'Transparent Information',
      desc: 'Clear descriptions, photos, and availability.',
      icon: <InfoIcon sx={{ fontSize: '2.25rem', color: isLight ? '#1e293b' : '#94a3b8' }} />,
    },
    {
      title: 'Multiple Space Types',
      desc: 'From business meetings to events and sports activities.',
      icon: <CategoryIcon sx={{ fontSize: '2.25rem', color: isLight ? '#1e293b' : '#94a3b8' }} />,
    },
  ]

  const featuredSpaces = useMemo(
    () =>
      [...(roomsQuery.data ?? [])]
        .sort((left, right) => {
          const ratingDelta = (right.average_rating ?? 0) - (left.average_rating ?? 0)
          if (ratingDelta !== 0) return ratingDelta
          return (right.rating_count ?? 0) - (left.rating_count ?? 0)
        })
        .slice(0, 3),
    [roomsQuery.data],
  )

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
          : 'linear-gradient(180deg, #0b0f19 0%, #111827 45%, #0f172a 100%)',
      }}
    >
      <PublicNavbar isLight={isLight} />

      {/* 1. Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid',
          borderColor: isLight ? 'rgba(0, 89, 179, 0.05)' : 'rgba(255, 255, 255, 0.04)',
          background: isLight
            ? 'linear-gradient(180deg, rgba(246, 249, 253, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)'
            : 'linear-gradient(180deg, rgba(11, 15, 25, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)',
          // Ambient background glows
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            right: '10%',
            width: { xs: 250, md: 450 },
            height: { xs: 250, md: 450 },
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(0, 89, 179, 0.06) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(17, 113, 216, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10%',
            left: '5%',
            width: { xs: 200, md: 350 },
            height: { xs: 200, md: 350 },
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(0, 168, 143, 0.04) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0, 168, 143, 0.06) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={4}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Chip
                    label="Space Booking Simplified"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      borderColor: 'divider',
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
                      background: 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
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
                  Bookini helps you discover and reserve meeting rooms, coworking spaces, event
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
                      bgcolor: 'primary.main',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 'none',
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
                      borderColor: isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: 'text.primary',
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
                    : 'rgba(17, 24, 39, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
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
                      background: isLight ? '#ffffff' : alpha('#1f2937', 0.6),
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateX(6px)',
                        borderColor: 'text.primary',
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
      </Box>

      {/* 2. Search Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: isLight ? '#ffffff' : '#111827',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.02)',
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
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
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
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  transition: 'all 0.25s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'text.primary',
                  },
                }}
                onClick={() => navigate(`/book?type=${encodeURIComponent(cat.title)}`)}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ mb: 2 }}>
                    {cat.icon}
                  </Box>
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
                      opacity: 0.05,
                      color: 'text.primary',
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

      {/* 5. Why Choose bookiblastek */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                Benefits
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                Why Choose bookiblastek
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
                      background: isLight ? '#ffffff' : alpha('#1f2937', 0.5),
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: 'text.primary',
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
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
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
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'text.primary',
                  },
                }}
              >
                {/* Featured space image */}
                <Box
                  sx={{
                    height: 200,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={space.cover_image || space.gallery?.[0] || `https://picsum.photos/seed/${encodeURIComponent(space.name)}/800/500`}
                    alt={space.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.55) 100%)',
                    }}
                  />
                  <Chip
                    label={`${space.price}/hr`}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 700,
                      bgcolor: 'rgba(15, 23, 42, 0.92)',
                      color: '#ffffff',
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
                        {space.address ?? 'Tunis, Tunisia'}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 1 }}
                    >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {space.capacity}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {(space.average_rating ?? 0).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({space.rating_count ?? 0})
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
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
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
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Stack spacing={2}>
                  <FormatQuoteIcon sx={{ fontSize: '2.5rem', color: 'text.secondary', opacity: 0.3 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{test.text}"
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', pt: 3 }}>
                  <Avatar sx={{ bgcolor: 'text.secondary', fontWeight: 700 }}>
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
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #030712 0%, #0f172a 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
                color: '#0f172a',
                fontWeight: 800,
                px: 5,
                py: 2,
                borderRadius: 3,
                fontSize: '1rem',
                transition: 'all 0.2s',
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
