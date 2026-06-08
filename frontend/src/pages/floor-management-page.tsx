import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { apiClient } from '../lib/api-client'
import { listFloors } from '../lib/api'
import type { ApiResponse, FloorItem } from '../lib/api-types'

const createFloorSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().min(1),
  building: z.string().min(1),
  floor_number: z.number(),
  location: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']),
})

type CreateFloorValues = z.infer<typeof createFloorSchema>

export const FloorManagementPage = () => {
  const queryClient = useQueryClient()
  const floorsQuery = useQuery({
    queryKey: ['floors-all'],
    queryFn: () => listFloors(),
  })

  const createMutation = useMutation({
    mutationFn: async (payload: CreateFloorValues) => {
      const response = await apiClient.post<ApiResponse<FloorItem>>('/floors', payload)
      return response.data.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['floors-all'] })
      await queryClient.invalidateQueries({ queryKey: ['floors-available'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (floorId: string) => {
      await apiClient.delete(`/floors/${floorId}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['floors-all'] })
      await queryClient.invalidateQueries({ queryKey: ['floors-available'] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFloorValues>({
    resolver: zodResolver(createFloorSchema),
    defaultValues: {
      name: '',
      capacity: 1,
      building: '',
      floor_number: 1,
      location: '',
      description: '',
      status: 'AVAILABLE',
    },
  })

  const onSubmit = async (values: CreateFloorValues) => {
    await createMutation.mutateAsync(values)
    reset()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Floor management</Typography>
      <Paper sx={{ p: 3, maxWidth: 680 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          {createMutation.isError ? (
            <Alert severity="error">Could not create floor.</Alert>
          ) : null}
          <TextField label="Name" {...register('name')} error={Boolean(errors.name)} />
          <TextField
            label="Capacity"
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            error={Boolean(errors.capacity)}
          />
          <TextField label="Building" {...register('building')} />
          <TextField
            label="Floor number"
            type="number"
            {...register('floor_number', { valueAsNumber: true })}
          />
          <TextField label="Location" {...register('location')} />
          <TextField label="Description" multiline minRows={2} {...register('description')} />
          <TextField label="Status" select {...register('status')}>
            <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
            <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
            <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create floor'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Existing floors
        </Typography>
        <Stack spacing={1}>
          {floorsQuery.data?.map((floor) => (
            <Paper key={floor.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography>
                  {floor.name} - {floor.building} F{floor.floor_number}
                </Typography>
                <Button
                  color="error"
                  onClick={() => deleteMutation.mutate(floor.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}
