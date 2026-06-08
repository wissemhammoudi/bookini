import { Grid, Paper, Stack, Typography } from '@mui/material'

export const DashboardPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">User Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Quick Reserve</Typography>
            <Typography color="text.secondary">
              Pick a room and reserve it in under 10 seconds.
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Today&apos;s Activity</Typography>
            <Typography color="text.secondary">
              Upcoming events and reservations appear here.
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Occupancy Snapshot</Typography>
            <Typography color="text.secondary">
              Week 9 will connect these cards to real dashboard APIs.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
