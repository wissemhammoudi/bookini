import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DownloadIcon from '@mui/icons-material/Download'

import type { PublicBookingDetails } from '@/lib/api'
import { formatDate, formatPrice } from './booking-confirmation-utils'

export const BookingDetailsGrid = ({
  booking,
  endDate,
  numberOfDays,
  isLight,
  onDownloadICalendar,
}: {
  booking: PublicBookingDetails
  endDate?: string
  numberOfDays?: number
  isLight: boolean
  onDownloadICalendar: () => void
}) => {
  return (
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
                      {endDate ? (
                        <>
                          {formatDate(booking.booking_date, 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {' - '}
                          {formatDate(endDate, 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {numberOfDays ? ` (${numberOfDays} days)` : ''}
                        </>
                      ) : (
                        formatDate(booking.booking_date, 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      )}
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
                  background: (theme) => alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
                    <AttachMoneyIcon sx={{ fontSize: '1.3rem', color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 700 }}>Total Amount</Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatPrice(booking.price)} TND
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
                  onClick={onDownloadICalendar}
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
  )
}
