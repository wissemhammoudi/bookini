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

import { listAdmins, updateAdminRole } from '../lib/api'

const adminRoleSchema = z.object({
  email: z.email('Email is invalid'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
})

type AdminRoleValues = z.infer<typeof adminRoleSchema>

export const AdminManagementPage = () => {
  const queryClient = useQueryClient()
  const adminsQuery = useQuery({
    queryKey: ['admins-list'],
    queryFn: listAdmins,
  })

  const updateMutation = useMutation({
    mutationFn: updateAdminRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admins-list'] })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRoleValues>({
    resolver: zodResolver(adminRoleSchema),
    defaultValues: {
      email: '',
      role: 'ADMIN',
    },
  })

  const onSubmit = async (values: AdminRoleValues) => {
    await updateMutation.mutateAsync(values)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Admin management</Typography>

      <Paper sx={{ p: 3, maxWidth: 560 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          {updateMutation.isError ? (
            <Alert severity="error">Could not update admin role.</Alert>
          ) : null}
          {updateMutation.isSuccess ? (
            <Alert severity="success">Admin role updated.</Alert>
          ) : null}
          <TextField
            label="User email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField label="Role" select {...register('role')}>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update role'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current admins
        </Typography>
        <Stack spacing={1}>
          {adminsQuery.data?.map((admin) => (
            <Paper key={admin.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2">{admin.full_name}</Typography>
              <Typography color="text.secondary" variant="body2">
                {admin.email} - {admin.role}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}
