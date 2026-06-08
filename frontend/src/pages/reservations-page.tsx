import { Paper, Stack, Typography } from '@mui/material'

export const ReservationsPage = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Reservations</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Reservation search, filtering, and creation flow will be delivered in Week
          9.
        </Typography>
      </Paper>
    </Stack>
  )
}
