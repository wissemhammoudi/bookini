import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Paper, Stack, Typography } from '@mui/material'

import { cancelReservationRequest, listAdminReservations } from '@/lib/api'

export const ReservationManagementPage = () => {
  const queryClient = useQueryClient()
  const reservationsQuery = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: listAdminReservations,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReservationRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
    },
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Reservation management</Typography>

      {reservationsQuery.isError ? (
        <Alert severity="error">Admin access required to manage reservations.</Alert>
      ) : null}

      {reservationsQuery.data?.map((reservation) => (
        <Paper key={reservation.id} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">{reservation.id}</Typography>
            <Typography color="text.secondary" variant="body2">
              User: {reservation.user_id}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Floor: {reservation.floor_id}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Status: {reservation.status}
            </Typography>
            {reservation.status !== 'CANCELLED' ? (
              <Button
                sx={{ alignSelf: 'flex-start' }}
                color="error"
                variant="outlined"
                onClick={() => cancelMutation.mutate(reservation.id)}
              >
                Cancel reservation
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
