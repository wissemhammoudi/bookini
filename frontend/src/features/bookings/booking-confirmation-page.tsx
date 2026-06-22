import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  alpha,
} from '@mui/material'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
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
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { getPublicBookingByReference } from '@/lib/api'

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
  const { reference = '' } = useParams()
  const navigate = useNavigate()
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const [searchReference, setSearchReference] = useState(reference)

  const bookingQuery = useQuery({
    queryKey: ['public-booking', reference],
    queryFn: () => getPublicBookingByReference(reference),
    enabled: Boolean(reference),
    retry: false,
  })

  const booking = bookingQuery.data

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchReference) {
      navigate(`/booking-confirmation/${searchReference}`)
    }
  }

  const downloadICalendar = () => {
    if (!booking) return

    const event = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bookiwa7dek//EN
BEGIN:VEVENT
UID:${booking.booking_reference}@bookiwa7dek.com
DTSTAMP:20240622T143000Z
DTSTART:${booking.booking_date.replace(/-/g, '')}T${booking.start_time.replace(/:/g, '')}00
DTEND:${booking.booking_date.replace(/-/g, '')}T${booking.end_time.replace(/:/g, '')}00
SUMMARY:${booking.room_name} - bookiwa7dek Booking
DESCRIPTION:Booking Reference: ${booking.booking_reference}\\nGuest: ${booking.guest_name}\\nParticipants: ${booking.participants}
LOCATION:${booking.room_name}
END:VEVENT
END:VCALENDAR`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(event))
    element.setAttribute('download', `${booking.booking_reference}.ics`)
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
      <PublicNavbar isLight={isLight} />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
          {bookingQuery.isLoading ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              Loading booking details...
            </Alert>
          ) : null}

          {bookingQuery.isError ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              Booking not found. Please check your reference and try again.
            </Alert>
          ) : null}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.1)' : 'rgba(255, 255, 255, 0.08)',
              background: isLight
                ? 'linear-gradient(135deg, #ffffff 0%, #f6fbff 100%)'
                : 'linear-gradient(135deg, rgba(16,29,50,0.94) 0%, rgba(10,14,26,0.92) 100%)',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'success.main',
                      boxShadow: '0 8px 18px rgba(76, 175, 80, 0.28)',
                    }}
                  >
                    <VerifiedOutlinedIcon sx={{ fontSize: '2rem', color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                      Booking status
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.03em' }}>
                      Booking Confirmed
                    </Typography>
                    <Typography color="text.secondary">
                      Your reservation is locked in. Use the reference below to revisit this booking anytime.
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  icon={<CheckCircleIcon />}
                  label="Confirmed"
                  color="success"
                  sx={{ fontWeight: 800, px: 1 }}
                />
              </Stack>

              {booking ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={booking.booking_reference} variant="outlined" sx={{ fontWeight: 800 }} />
                  <Chip label={booking.room_name} variant="outlined" />
                  <Chip label={new Date(booking.booking_date).toLocaleDateString()} variant="outlined" />
                  <Chip label={`${booking.start_time} - ${booking.end_time}`} variant="outlined" />
                </Stack>
              ) : null}
            </Stack>
          </Paper>

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
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Find Another Booking
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
          {booking ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 3,
                    background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                    p: 4,
                    height: '100%',
                  }}
                >
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                        Space Details
                      </Typography>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <LocationOnIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Room Name
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.room_name}
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
                              {new Date(booking.booking_date).toLocaleDateString('en-US', {
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
                              {booking.start_time} - {booking.end_time}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>

                    <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)' }} />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                        Price Summary
                      </Typography>
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
                            <Typography sx={{ fontWeight: 700 }}>Total Amount</Typography>
                          </Stack>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            €{booking.price.toFixed(2)}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 3,
                    background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                    p: 4,
                    height: '100%',
                  }}
                >
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                        Guest Information
                      </Typography>
                      <Stack spacing={1.75}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <PersonIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Guest Name
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.guest_name}
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
                              {booking.guest_email}
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
                              {booking.guest_phone}
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

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Quick Actions
                      </Typography>
                      <Stack spacing={1.5}>
                        <Button
                          variant="contained"
                          endIcon={<DownloadIcon />}
                          onClick={downloadICalendar}
                          sx={{ fontWeight: 800 }}
                        >
                          Download iCalendar
                        </Button>
                        <Button href="/" variant="outlined" sx={{ fontWeight: 800 }}>
                          Back to Home
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          ) : null}

          {/* Support Info */}
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Questions about your booking?
            </Typography>
            <Typography variant="body2" color="inherit">
              Contact support@bookiwa7dek.com or call +216 00 000 000 if you need changes or assistance.
            </Typography>
          </Alert>
        </Stack>
      </Container>
    </Box>
  )
}
