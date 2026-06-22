import { useQuery } from '@tanstack/react-query'
import { Alert, Grid, Paper, Stack, Typography } from '@mui/material'

import {
  getMostReservedRooms,
  getPeakHours,
  getStatisticsSummary,
} from '@/lib/api'

const MiniBars = ({ labels, series }: { labels: string[]; series: number[] }) => {
  const maxValue = Math.max(...series, 1)
  return (
    <Stack spacing={1}>
      {labels.map((label, index) => (
        <Stack key={`${label}-${index}`} spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {label} ({series[index] ?? 0})
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              height: 10,
              width: `${((series[index] ?? 0) / maxValue) * 100}%`,
              minWidth: 8,
            }}
          />
        </Stack>
      ))}
    </Stack>
  )
}

export const StatisticsPage = () => {
  const summaryQuery = useQuery({
    queryKey: ['statistics-summary'],
    queryFn: getStatisticsSummary,
  })
  const roomsQuery = useQuery({
    queryKey: ['statistics-most-rooms'],
    queryFn: getMostReservedRooms,
  })
  const peakQuery = useQuery({
    queryKey: ['statistics-peak-hours'],
    queryFn: getPeakHours,
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Statistics</Typography>

      {summaryQuery.isError ? (
        <Alert severity="error">Could not load statistics.</Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Daily reservations</Typography>
            <Typography variant="h6">{summaryQuery.data?.daily_reservations ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Monthly reservations</Typography>
            <Typography variant="h6">
              {summaryQuery.data?.monthly_reservations ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Cancellation rate</Typography>
            <Typography variant="h6">{summaryQuery.data?.cancellation_rate ?? 0}%</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Most reserved rooms
            </Typography>
            <MiniBars
              labels={roomsQuery.data?.chart.labels ?? []}
              series={roomsQuery.data?.chart.series ?? []}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Peak reservation hours
            </Typography>
            <MiniBars
              labels={peakQuery.data?.chart.labels ?? []}
              series={peakQuery.data?.chart.series ?? []}
            />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
