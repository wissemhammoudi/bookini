import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'

import { changePasswordRequest } from '@/lib/api'

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

export const ChangePasswordForm = () => {
  const passwordMutation = useMutation({ mutationFn: changePasswordRequest })
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirmPassword: '',
    },
  })

  const onPasswordSubmit = async (values: ChangePasswordFormValues) => {
    await passwordMutation.mutateAsync({
      current_password: values.current_password,
      new_password: values.new_password,
    })
    passwordForm.reset()
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            Change Password
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Update your account password to maintain security.
          </Typography>
        </Box>

        <Divider />

        <Stack
          component="form"
          spacing={3}
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          noValidate
        >
          {passwordMutation.isError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Could not change password. Verify your current password.
            </Alert>
          )}
          {passwordMutation.isSuccess && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Password changed successfully.
            </Alert>
          )}

          <TextField
            label="Current Password"
            type="password"
            error={Boolean(passwordForm.formState.errors.current_password)}
            helperText={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <LockIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                ),
              },
            }}
          />

          <TextField
            label="New Password"
            type="password"
            error={Boolean(passwordForm.formState.errors.new_password)}
            helperText={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <LockIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                ),
              },
            }}
          />

          <TextField
            label="Confirm New Password"
            type="password"
            error={Boolean(passwordForm.formState.errors.confirmPassword)}
            helperText={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <LockIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={passwordMutation.isPending}
            sx={{ alignSelf: 'flex-start', px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
