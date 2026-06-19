import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { cancelReservationRequest, listReservationHistory } from '@/lib/api'

export const ReservationsPage = () => {
  const queryClient = useQueryClient()
  const reservationsQuery = useQuery({
    queryKey: ['reservations-history'],
    queryFn: listReservationHistory,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReservationRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations-history'] })
      await queryClient.invalidateQueries({ queryKey: ['reservations-current'] })
    },
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">My reservations</Typography>

      {reservationsQuery.isLoading ? (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Stack>
      ) : null}

      {reservationsQuery.isError ? (
        <Alert severity="error">Could not load reservations.</Alert>
      ) : null}

      {reservationsQuery.data?.map((reservation) => (
        <Paper key={reservation.id} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="subtitle1">Reservation #{reservation.id}</Typography>
              <Chip label={reservation.status} size="small" />
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Floor: {reservation.floor_id}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Start: {new Date(reservation.start_time).toLocaleString()}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              End: {new Date(reservation.end_time).toLocaleString()}
            </Typography>

            {reservation.status !== 'CANCELLED' ? (
              <Button
                sx={{ alignSelf: 'flex-start' }}
                color="error"
                variant="outlined"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(reservation.id)}
              >
                Cancel reservation
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ))}

      {reservationsQuery.data && reservationsQuery.data.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            You have no reservations yet.
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  )
}
