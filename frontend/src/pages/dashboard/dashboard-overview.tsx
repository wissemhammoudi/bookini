import { Box, Button, Chip, Grid, Paper, Skeleton, Stack, Typography, alpha } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import HistoryIcon from '@mui/icons-material/History'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'
import EuroIcon from '@mui/icons-material/Euro'

import type { FloorItem } from '@/lib/api'
import type { PublicBookingListItem } from '@/lib/api'
import type { ReservationItem } from '@/lib/api'

type DashboardOverviewProps = {
  isLoading: boolean
  floors: FloorItem[] | undefined
  currentReservations: ReservationItem[] | undefined
  historyReservations: ReservationItem[] | undefined
  publicBookings: PublicBookingListItem[]
  cancelingId: string | null
  totalFloors: number
  availableFloors: number
  activeReservationsCount: number
  historyCount: number
  totalSpent: number
  onCancelReservation: (reservationId: string) => void
}

const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

const formatDateOnly = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

const getFloorName = (floors: FloorItem[] | undefined, floorId: string) => {
  const floor = floors?.find((item) => item.id === floorId)
  if (!floor) return `Floor #${floorId}`
  return `${floor.name} (${floor.building})`
}

export const DashboardOverview = ({
  isLoading,
  floors,
  currentReservations,
  historyReservations,
  publicBookings,
  cancelingId,
  totalFloors,
  availableFloors,
  activeReservationsCount,
  historyCount,
  totalSpent,
  onCancelReservation,
}: DashboardOverviewProps) => {
  const activePublicBookings = publicBookings.filter(
    (item) => item.status === 'PENDING' || item.status === 'CONFIRMED',
  )
  const pastPublicBookings = publicBookings.filter(
    (item) => item.status !== 'PENDING' && item.status !== 'CONFIRMED',
  )

  return (
    <Stack spacing={4}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          User Dashboard
        </Typography>
        <Typography color="text.secondary">
          Live data from your bookings and reservations stored in database.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: (theme) => alpha(theme.palette.primary.main, 0.03) }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
                <CalendarTodayIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Available Floors
                </Typography>
                {isLoading ? <Skeleton width={120} height={36} /> : <Typography variant="h5" sx={{ fontWeight: 800 }}>{availableFloors} / {totalFloors}</Typography>}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: (theme) => alpha(theme.palette.success.main, 0.03) }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white', display: 'flex' }}>
                <EventAvailableIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Reservations
                </Typography>
                {isLoading ? <Skeleton width={100} height={36} /> : <Typography variant="h5" sx={{ fontWeight: 800 }}>{activeReservationsCount}</Typography>}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: (theme) => alpha(theme.palette.secondary.main, 0.03) }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'white', display: 'flex' }}>
                <HistoryIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Past Bookings Log
                </Typography>
                {isLoading ? <Skeleton width={100} height={36} /> : <Typography variant="h5" sx={{ fontWeight: 800 }}>{historyCount}</Typography>}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: (theme) => alpha(theme.palette.warning.main, 0.03) }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'white', display: 'flex' }}>
                <EuroIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Cost Spent
                </Typography>
                {isLoading ? <Skeleton width={100} height={36} /> : <Typography variant="h5" sx={{ fontWeight: 800 }}>{totalSpent.toFixed(2)} TND</Typography>}
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Active Reservations
          </Typography>

          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
            </Stack>
          ) : (!currentReservations || currentReservations.length === 0) && activePublicBookings.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
              <InfoIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No active bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a booking to see your live reservation data here.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {(currentReservations ?? []).map((reservation) => (
                <Paper
                  key={reservation.id}
                  elevation={0}
                  sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' } }}
                >
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {getFloorName(floors, reservation.floor_id)}
                      </Typography>
                      <Stack direction="row" spacing={2} color="text.secondary">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {floors?.find((item) => item.id === reservation.floor_id)?.location || 'Virtual Plan'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                          <Typography variant="caption">
                            {formatDateTime(reservation.start_time)} - {formatDateTime(reservation.end_time).split(',').pop()?.trim()}
                          </Typography>
                        </Box>
                      </Stack>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 0.5 }}>
                        <Chip label={reservation.status} size="small" color={reservation.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          Cost: N/A
                        </Typography>
                      </Box>
                    </Stack>

                    <Button variant="outlined" color="error" size="small" startIcon={<CancelOutlinedIcon />} disabled={cancelingId === reservation.id} onClick={() => onCancelReservation(reservation.id)} sx={{ fontWeight: 700, textTransform: 'none' }}>
                      {cancelingId === reservation.id ? 'Canceling...' : 'Cancel'}
                    </Button>
                  </Stack>
                </Paper>
              ))}

              {activePublicBookings.map((booking) => (
                <Paper key={booking.id} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: (theme) => alpha(theme.palette.primary.main, 0.03) }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {booking.room_name}
                    </Typography>
                    <Stack direction="row" spacing={2} color="text.secondary">
                      <Typography variant="caption">Ref: {booking.booking_reference}</Typography>
                      <Typography variant="caption">Date: {formatDateOnly(booking.booking_date)}</Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 0.5 }}>
                      <Chip label={booking.status} size="small" color={booking.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Cost: {booking.price.toFixed(2)} TND
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Past Bookings Log
          </Typography>

          {isLoading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={60} />
            </Stack>
          ) : (!historyReservations || historyReservations.length === 0) && pastPublicBookings.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                No past reservations
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {(historyReservations ?? []).map((reservation) => (
                <Paper key={reservation.id} elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4) }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                        {getFloorName(floors, reservation.floor_id)}
                      </Typography>
                      <Chip label={reservation.status} size="small" color={reservation.status === 'CANCELLED' ? 'error' : 'default'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18 }} />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(reservation.start_time)}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Cost: N/A
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}

              {pastPublicBookings.map((booking) => (
                <Paper key={booking.id} elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4) }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                        {booking.room_name}
                      </Typography>
                      <Chip label={booking.status} size="small" color={booking.status === 'CANCELLED' ? 'error' : 'default'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18 }} />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateOnly(booking.booking_date)}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Cost: {booking.price.toFixed(2)} TND
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Stack>
  )
}
