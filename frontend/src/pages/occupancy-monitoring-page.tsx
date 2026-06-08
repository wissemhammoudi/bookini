import { useQuery } from '@tanstack/react-query'
import { Alert, LinearProgress, Paper, Stack, Typography } from '@mui/material'

import { getOccupancyMetrics } from '../lib/api'

export const OccupancyMonitoringPage = () => {
  const occupancyQuery = useQuery({
    queryKey: ['occupancy-metrics'],
    queryFn: getOccupancyMetrics,
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Occupancy monitoring</Typography>

      {occupancyQuery.isError ? (
        <Alert severity="error">Could not load occupancy metrics.</Alert>
      ) : null}

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2">Occupancy rate</Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {occupancyQuery.data?.occupancy_percentage ?? 0}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={occupancyQuery.data?.occupancy_percentage ?? 0}
          sx={{ height: 10, borderRadius: 999 }}
        />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Occupied: {occupancyQuery.data?.occupied_rooms ?? 0} / Total:{' '}
          {occupancyQuery.data?.total_rooms ?? 0}
        </Typography>
      </Paper>
    </Stack>
  )
}
