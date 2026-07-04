import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import type { PublicBookingDetails } from '@/lib/api'
import { formatDate } from './booking-confirmation-utils'

export const BookingConfirmationHero = ({
  booking,
  endDate,
  numberOfDays,
  isLight,
}: {
  booking?: PublicBookingDetails
  endDate?: string
  numberOfDays?: number
  isLight: boolean
}) => {
  return (
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
            {endDate ? (
              <Chip
                label={`${formatDate(booking.booking_date)} - ${formatDate(endDate)}${numberOfDays ? ` (${numberOfDays} days)` : ''}`}
                variant="outlined"
              />
            ) : (
              <Chip label={formatDate(booking.booking_date)} variant="outlined" />
            )}
            <Chip label={`${booking.start_time} - ${booking.end_time}`} variant="outlined" />
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

export const BookingReferenceSearch = ({
  isLight,
  searchReference,
  onSearchReferenceChange,
  onSubmit,
}: {
  isLight: boolean
  searchReference: string
  onSearchReferenceChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}) => {
  return (
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
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Find Another Booking
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-end' }}>
            <TextField
              label="Booking Reference"
              value={searchReference}
              onChange={(e) => onSearchReferenceChange(e.target.value.toUpperCase())}
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
  )
}
