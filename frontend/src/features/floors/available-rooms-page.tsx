import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { listFloors } from '@/lib/api'

export const AvailableRoomsPage = () => {
  const roomsQuery = useQuery({
    queryKey: ['floors-available'],
    queryFn: () => listFloors('AVAILABLE'),
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Available rooms</Typography>

      {roomsQuery.isLoading ? (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Stack>
      ) : null}

      {roomsQuery.isError ? (
        <Alert severity="error">Could not load available rooms.</Alert>
      ) : null}

      <Grid container spacing={2}>
        {roomsQuery.data?.map((room) => (
          <Grid key={room.id} size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="h6">{room.name}</Typography>
                  <Chip label={room.status} size="small" color="success" />
                </Stack>
                <Typography color="text.secondary" variant="body2">
                  Building: {room.building} - Floor {room.floor_number}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Capacity: {room.capacity}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Location: {room.location}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
