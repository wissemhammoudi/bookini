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
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import {
  createActivityRequest,
  listActivitiesByReservation,
  listReservationHistory,
} from '@/lib/api'

const activitySchema = z.object({
  reservation_id: z.string().min(1, 'Please select a reservation'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

type ActivityFormValues = z.infer<typeof activitySchema>

export const ActivitiesPage = () => {
  const queryClient = useQueryClient()
  const reservationsQuery = useQuery({
    queryKey: ['reservations-history'],
    queryFn: listReservationHistory,
  })

  const reservationOptions = reservationsQuery.data ?? []
  const defaultReservationId = reservationOptions[0]?.id ?? ''

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      reservation_id: '',
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    if (defaultReservationId) {
      setValue('reservation_id', defaultReservationId)
    }
  }, [defaultReservationId, setValue])

  const reservationId = useWatch({ control, name: 'reservation_id' })

  const activitiesQuery = useQuery({
    queryKey: ['activities', reservationId],
    queryFn: () => listActivitiesByReservation(reservationId),
    enabled: Boolean(reservationId),
  })

  const createMutation = useMutation({
    mutationFn: createActivityRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['activities', reservationId],
      })
    },
  })

  const onSubmit = async (values: ActivityFormValues) => {
    await createMutation.mutateAsync(values)
    reset({
      reservation_id: values.reservation_id,
      title: '',
      description: '',
    })
  }

  const infoText = useMemo(() => {
    if (!reservationId) {
      return 'Select a reservation to view related activities.'
    }
    return `Activities for reservation ${reservationId}`
  }, [reservationId])

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Activities</Typography>
      <Typography color="text.secondary">{infoText}</Typography>

      <Paper sx={{ p: 3, maxWidth: 620 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          {createMutation.isError ? (
            <Alert severity="error">Could not create activity.</Alert>
          ) : null}
          <TextField
            label="Reservation"
            select
            error={Boolean(errors.reservation_id)}
            helperText={errors.reservation_id?.message}
            {...register('reservation_id')}
          >
            {reservationOptions.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.id}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Title"
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            {...register('title')}
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            {...register('description')}
          />

          <Button type="submit" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create activity'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Activity list
        </Typography>
        {activitiesQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : null}
        {activitiesQuery.isError ? (
          <Alert severity="error">Could not load activities.</Alert>
        ) : null}
        <Stack spacing={1}>
          {activitiesQuery.data?.map((activity) => (
            <Paper key={activity.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">{activity.title}</Typography>
              <Typography color="text.secondary" variant="body2">
                {activity.description || 'No description'}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}
