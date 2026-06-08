import { useQuery } from '@tanstack/react-query'
import { Alert, Grid, Paper, Stack, Typography } from '@mui/material'

import { getAdminDashboard, getStatisticsSummary } from '../lib/api'

export const AdminDashboardPage = () => {
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
  })
  const statsQuery = useQuery({
    queryKey: ['statistics-summary'],
    queryFn: getStatisticsSummary,
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Admin dashboard</Typography>

      {dashboardQuery.isError ? (
        <Alert severity="error">Admin access required for this page.</Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Your role</Typography>
            <Typography variant="h6">
              {dashboardQuery.data?.role ?? 'Unavailable'}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Total reservations</Typography>
            <Typography variant="h6">
              {statsQuery.data?.total_reservations ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Active users</Typography>
            <Typography variant="h6">{statsQuery.data?.active_users ?? 0}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
