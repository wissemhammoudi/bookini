import { useQuery } from '@tanstack/react-query'
import { Grid, Paper, Skeleton, Stack, Typography } from '@mui/material'

import {
  listCurrentReservations,
  listFloors,
  listReservationHistory,
} from '../lib/api'

export const DashboardPage = () => {
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

  const isLoading =
    floorsQuery.isLoading || currentQuery.isLoading || historyQuery.isLoading

  const totalRooms = floorsQuery.data?.length ?? 0
  const availableRooms =
    floorsQuery.data?.filter((item) => item.status === 'AVAILABLE').length ?? 0

  return (
    <Stack spacing={3}>
      <Typography variant="h4">User Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Available rooms</Typography>
            {isLoading ? (
              <Skeleton width={120} />
            ) : (
              <Typography color="text.secondary">
                {availableRooms} of {totalRooms} rooms are currently available.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Current reservations</Typography>
            {currentQuery.isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography color="text.secondary">
                You have {currentQuery.data?.length ?? 0} active reservations.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Reservation history</Typography>
            {historyQuery.isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography color="text.secondary">
                Total reservations: {historyQuery.data?.length ?? 0}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
