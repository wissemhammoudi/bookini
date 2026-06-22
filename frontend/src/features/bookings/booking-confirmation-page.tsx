import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Chip,
  alpha,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EventIcon from '@mui/icons-material/Event'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DownloadIcon from '@mui/icons-material/Download'

import { useColorMode } from '@/app/use-color-mode'

// Mock booking data - in production, fetch from API
const MOCK_BOOKINGS: Record<string, any> = {
  'BK-2024-001': {
    reference: 'BK-2024-001',
    roomName: 'Meeting Room A',
    date: '2024-06-28',
    startTime: '10:00',
    endTime: '12:00',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+216 90 000 000',
    participants: 4,
    plan: 'starter',
    price: 10,
    status: 'confirmed',
    notes: 'Client meeting with team',
  },
}

/**
 * Booking Confirmation Page
 * Displays booking details and allows searching for existing bookings
 * 
 * Features:
 * - Display full booking confirmation with reference
 * - Search for bookings by reference
 * - Download booking as iCalendar file
 * - Support contact information
 */
export const BookingConfirmationPage = () => {
  const { reference = 'BK-2024-001' } = useParams()
  const navigate = useNavigate()
  const { mode, toggleMode } = useColorMode()
  const isLight = mode === 'light'
  const [searchReference, setSearchReference] = useState(reference)

  const booking = MOCK_BOOKINGS[searchReference] || MOCK_BOOKINGS['BK-2024-001']

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchReference) {
      navigate(`/booking-confirmation/${searchReference}`)
    }
  }

  const downloadICalendar = () => {
    const event = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bookiwa7dek//EN
BEGIN:VEVENT
UID:${booking.reference}@bookiwa7dek.com
DTSTAMP:20240622T143000Z
DTSTART:${booking.date.replace(/-/g, '')}T${booking.startTime.replace(/:/g, '')}00
DTEND:${booking.date.replace(/-/g, '')}T${booking.endTime.replace(/:/g, '')}00
SUMMARY:${booking.roomName} - bookiwa7dek Booking
DESCRIPTION:Booking Reference: ${booking.reference}\\nGuest: ${booking.guestName}\\nParticipants: ${booking.participants}
LOCATION:${booking.roomName}
END:VEVENT
END:VCALENDAR`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(event))
    element.setAttribute('download', `${booking.reference}.ics`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

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
                Booking Confirmation
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

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
          {/* Success Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'success.main',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: '2rem', color: '#fff' }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
              Booking Confirmed!
            </Typography>
            <Typography color="text.secondary">
              Your reservation has been successfully booked. Check your email for details.
            </Typography>
          </Box>

          {/* Search Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
              background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
            }}
          >
            <form onSubmit={handleSearch}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  View Another Booking
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-end' }}>
                  <TextField
                    label="Booking Reference"
                    value={searchReference}
                    onChange={(e) => setSearchReference(e.target.value.toUpperCase())}
                    fullWidth
                    size="small"
                    placeholder="e.g., BK-2024-001"
                  />
                  <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>
                    Search
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>

          {/* Booking Details Card */}
          <Paper
            elevation={0}
            sx={{
              border: '2px solid',
              borderColor: 'success.main',
              borderRadius: 3,
              background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
              p: 4,
            }}
          >
            <Stack spacing={3}>
              {/* Reference & Status */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    BOOKING REFERENCE
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    {booking.reference}
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Confirmed"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

              {/* Room Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Room Details
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <LocationOnIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Room Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.roomName}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <EventIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.startTime} - {booking.endTime}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

              {/* Guest Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Guest Information
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PersonIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Guest Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.guestName}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <EmailIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.guestEmail}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PhoneIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.guestPhone}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PersonIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Participants
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.participants} people
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

              {/* Price Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  background: alpha('primary.main', 0.05),
                }}
              >
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
                    <AttachMoneyIcon sx={{ fontSize: '1.3rem', color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 700 }}>Total Amount:</Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    €{booking.price.toFixed(2)}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              endIcon={<DownloadIcon />}
              onClick={downloadICalendar}
              sx={{ fontWeight: 700 }}
            >
              Download iCalendar
            </Button>
            <Button
              href="/"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            >
              Back to Home
            </Button>
          </Stack>

          {/* Support Info */}
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Questions about your booking?
            </Typography>
            <Typography variant="body2" color="inherit">
              Contact our support team at support@bookiwa7dek.com or call +216 00 000 000
            </Typography>
          </Alert>
        </Stack>
      </Container>
    </Box>
  )
}
