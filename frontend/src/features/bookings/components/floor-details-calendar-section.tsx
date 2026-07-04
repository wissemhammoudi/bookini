import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

import { WEEK_DAYS, toIsoDate } from '../floor-details-utils'
import type { PublicFloor } from '@/lib/api'

type FloorDetailsCalendarSectionProps = {
  isLight: boolean
  floor: PublicFloor
  bookingError: string | null
  selectedCalendarDate: string | null
  reservedByDate: Record<string, Array<{ start: string; end: string; status: string }>>
  dayCells: Array<Date | null>
  monthLabel: string
  onPreviousMonth: () => void
  onNextMonth: () => void
  onCalendarDateClick: (date: Date) => void
}

export const FloorDetailsCalendarSection = ({
  isLight,
  floor,
  bookingError,
  selectedCalendarDate,
  reservedByDate,
  dayCells,
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  onCalendarDateClick,
}: FloorDetailsCalendarSectionProps) => {
  const selectedDaySlots = selectedCalendarDate ? reservedByDate[selectedCalendarDate] ?? [] : []

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        background: isLight ? '#ffffff' : 'rgba(10, 14, 26, 0.45)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Reservation Calendar
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Choose an available date to open the booking form. Reserved dates are disabled.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={onPreviousMonth}
              startIcon={<ArrowBackIosNewIcon fontSize="small" />}
            >
              Prev
            </Button>
            <Button
              variant="outlined"
              onClick={onNextMonth}
              endIcon={<ArrowForwardIosIcon fontSize="small" />}
            >
              Next
            </Button>
          </Stack>
        </Stack>

        {bookingError ? <Alert severity="error">{bookingError}</Alert> : null}

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {monthLabel}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {WEEK_DAYS.map((dayName) => (
            <Box key={dayName} sx={{ py: 1, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }} color="text.secondary">
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{dayName.charAt(0)}</Box>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{dayName}</Box>
              </Typography>
            </Box>
          ))}

          {dayCells.map((day, index) => {
            if (!day) {
              return <Box key={`empty-${index}`} sx={{ height: { xs: 52, sm: 86 } }} />
            }

            const iso = toIsoDate(day)
            const reservedSlots = reservedByDate[iso] ?? []
            const isDisabled = reservedSlots.length > 0
            const isSelected = selectedCalendarDate === iso

            return (
              <Button
                key={iso}
                variant={isSelected ? 'contained' : 'outlined'}
                disabled={isDisabled}
                onClick={() => onCalendarDateClick(day)}
                sx={{
                  height: { xs: 52, sm: 86 },
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  justifyContent: { xs: 'center', sm: 'space-between' },
                  flexDirection: 'column',
                  p: { xs: 0.5, sm: 1 },
                  textTransform: 'none',
                  borderRadius: 2,
                  minWidth: 0,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {day.getDate()}
                </Typography>
                <Typography variant="caption" color={isSelected ? 'inherit' : 'text.secondary'} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {reservedSlots.length > 0 ? `${reservedSlots.length} reserved` : 'Available'}
                </Typography>
                {reservedSlots.length > 0 ? (
                  <Box sx={{ display: { xs: 'block', sm: 'none' }, width: 6, height: 6, borderRadius: '50%', bgcolor: isSelected ? 'common.white' : 'text.disabled', mt: 0.5 }} />
                ) : null}
              </Button>
            )
          })}
        </Box>

        {selectedCalendarDate ? (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: isLight ? 'rgba(0, 89, 179, 0.22)' : 'rgba(255, 255, 255, 0.22)' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Reserved slots for {selectedCalendarDate} ({floor.floor_name})
              </Typography>

              {selectedDaySlots.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No reserved slots for this date. Click this date to open the request form.
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {selectedDaySlots.map((slot, idx) => (
                    <Chip
                      key={`${selectedCalendarDate}-${idx}`}
                      label={`${slot.start} - ${slot.end}`}
                      size="small"
                      color={slot.status === 'CONFIRMED' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </Paper>
  )
}
