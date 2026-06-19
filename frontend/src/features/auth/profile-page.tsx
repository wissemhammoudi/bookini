import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { changePasswordRequest } from '@/lib/api'
import { useAuth } from '@/features/auth/use-auth'

const changePasswordSchema = z
  .object({
    current_password: z.string().min(8, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((values) => values.new_password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

const getSubjectFromToken = (token: string | null) => {
  if (!token) {
    return 'Unknown user'
  }

  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return 'Unknown user'
    }
    const decoded = JSON.parse(window.atob(payload)) as { sub?: string }
    return decoded.sub ?? 'Unknown user'
  } catch {
    return 'Unknown user'
  }
}

export const ProfilePage = () => {
  const { token } = useAuth()
  const subject = useMemo(() => getSubjectFromToken(token), [token])

  const mutation = useMutation({ mutationFn: changePasswordRequest })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ChangePasswordFormValues) => {
    await mutation.mutateAsync({
      current_password: values.current_password,
      new_password: values.new_password,
    })
    reset()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Authenticated subject</Typography>
        <Typography color="text.secondary">{subject}</Typography>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 560 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6">Change password</Typography>
          {mutation.isError ? (
            <Alert severity="error">Could not change password.</Alert>
          ) : null}
          {mutation.isSuccess ? (
            <Alert severity="success">Password changed successfully.</Alert>
          ) : null}
          <TextField
            label="Current password"
            type="password"
            error={Boolean(errors.current_password)}
            helperText={errors.current_password?.message}
            {...register('current_password')}
          />
          <TextField
            label="New password"
            type="password"
            error={Boolean(errors.new_password)}
            helperText={errors.new_password?.message}
            {...register('new_password')}
          />
          <TextField
            label="Confirm new password"
            type="password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating...' : 'Update password'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
