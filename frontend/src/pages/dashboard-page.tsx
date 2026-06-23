import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useState } from 'react'

import {
  listCurrentReservations,
  listFloors,
  listReservationHistory,
  cancelReservationRequest,
} from '@/lib/api'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import HistoryIcon from '@mui/icons-material/History'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'

export const DashboardPage = () => {
  const queryClient = useQueryClient()
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const floorsQuery = useQuery({
    queryKey: ['floors-all'],
    queryFn: () => listFloors(),
  })
  const currentQuery = useQuery({
    queryKey: ['reservations-current'],
    queryFn: listCurrentReservations,
  })
  const historyQuery = useQuery({
    queryKey: ['reservations-history'],
    queryFn: listReservationHistory,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReservationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations-current'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-history'] })
      setCancelingId(null)
    },
    onError: (err) => {
      console.error(err)
      setCancelingId(null)
      alert("Failed to cancel reservation. Please try again.")
    }
  })

  const isLoading =
    floorsQuery.isLoading || currentQuery.isLoading || historyQuery.isLoading

  const totalRooms = floorsQuery.data?.length ?? 0
  const availableRooms =
    floorsQuery.data?.filter((item) => item.status === 'AVAILABLE').length ?? 0

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return isoString
    }
  }

  const getFloorName = (floorId: string) => {
    const floor = floorsQuery.data?.find((f) => f.id === floorId)
    if (!floor) return `Floor #${floorId}`
    return `${floor.name} (${floor.building})`
  }

  const handleCancelClick = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      setCancelingId(id)
      cancelMutation.mutate(id)
    }
  }

  return (
    <Stack spacing={4}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          User Dashboard
        </Typography>
        <Typography color="text.secondary">
          Manage your room bookings, active floor plans, and reservation logs.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
                <CalendarTodayIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Available Floors
                </Typography>
                {isLoading ? (
                  <Skeleton width={120} height={36} />
                ) : (
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {availableRooms} / {totalRooms}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => alpha(theme.palette.success.main, 0.03),
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white', display: 'flex' }}>
                <EventAvailableIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Reservations
                </Typography>
                {currentQuery.isLoading ? (
                  <Skeleton width={100} height={36} />
                ) : (
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {currentQuery.data?.length ?? 0}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => alpha(theme.palette.secondary.main, 0.03),
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'white', display: 'flex' }}>
                <HistoryIcon />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Past Bookings Log
                </Typography>
                {historyQuery.isLoading ? (
                  <Skeleton width={100} height={36} />
                ) : (
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {historyQuery.data?.length ?? 0}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Sections */}
      <Grid container spacing={4}>
        {/* Column 1: Active Reservations */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Active Reservations
          </Typography>

          {currentQuery.isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
            </Stack>
          ) : !currentQuery.data || currentQuery.data.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <InfoIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No active bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore our spaces to schedule your next reservation.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {currentQuery.data.map((res) => (
                <Paper
                  key={res.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {getFloorName(res.floor_id)}
                      </Typography>
                      <Stack direction="row" spacing={2} color="text.secondary">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {floorsQuery.data?.find((f) => f.id === res.floor_id)?.location || "Virtual Plan"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                          <Typography variant="caption">
                            {formatDateTime(res.start_time)} - {formatDateTime(res.end_time).split(',').pop()?.trim()}
                          </Typography>
                        </Box>
                      </Stack>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Chip
                          label={res.status}
                          size="small"
                          color={res.status === 'CONFIRMED' ? 'success' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                    </Stack>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelOutlinedIcon />}
                      disabled={cancelingId === res.id}
                      onClick={() => handleCancelClick(res.id)}
                      sx={{ fontWeight: 700, textTransform: 'none' }}
                    >
                      {cancelingId === res.id ? 'Canceling...' : 'Cancel'}
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Column 2: History Log */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Past Bookings Log
          </Typography>

          {historyQuery.isLoading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={60} />
            </Stack>
          ) : !historyQuery.data || historyQuery.data.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                No past reservations
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {historyQuery.data.map((res) => (
                <Paper
                  key={res.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4),
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                        {getFloorName(res.floor_id)}
                      </Typography>
                      <Chip
                        label={res.status}
                        size="small"
                        color={res.status === 'CANCELLED' ? 'error' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(res.start_time)}
                    </Typography>
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
