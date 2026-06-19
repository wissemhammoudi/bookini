import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createReservationRequest, listFloors } from '@/lib/api'

const reservationSchema = z
  .object({
    floor_id: z.string().min(1, 'Please select a room'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
  })
  .refine(
    (values) => new Date(values.start_time).getTime() < new Date(values.end_time).getTime(),
    {
      path: ['end_time'],
      message: 'End time must be after start time',
    },
  )

type ReservationFormValues = z.infer<typeof reservationSchema>

export const CreateReservationPage = () => {
  const queryClient = useQueryClient()
  const roomsQuery = useQuery({
    queryKey: ['floors-available'],
    queryFn: () => listFloors('AVAILABLE'),
  })

  const createMutation = useMutation({
    mutationFn: createReservationRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations-history'] })
      await queryClient.invalidateQueries({ queryKey: ['reservations-current'] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      floor_id: '',
      start_time: '',
      end_time: '',
    },
  })

  const onSubmit = async (values: ReservationFormValues) => {
    await createMutation.mutateAsync(values)
    reset()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Create reservation</Typography>
      <Paper sx={{ p: 3, maxWidth: 560 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          {createMutation.isError ? (
            <Alert severity="error">Could not create reservation.</Alert>
          ) : null}
          {createMutation.isSuccess ? (
            <Alert severity="success">Reservation created successfully.</Alert>
          ) : null}

          {roomsQuery.isLoading ? (
            <Stack sx={{ alignItems: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <TextField
              label="Room"
              select
              error={Boolean(errors.floor_id)}
              helperText={errors.floor_id?.message}
              {...register('floor_id')}
            >
              {roomsQuery.data?.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name} ({room.building} - F{room.floor_number})
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Start"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            error={Boolean(errors.start_time)}
            helperText={errors.start_time?.message}
            {...register('start_time')}
          />
          <TextField
            label="End"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            error={Boolean(errors.end_time)}
            helperText={errors.end_time?.message}
            {...register('end_time')}
          />

          <Button type="submit" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create reservation'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
