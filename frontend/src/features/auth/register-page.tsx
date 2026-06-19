import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Link, Paper, Stack, Typography } from '@mui/material'

import {
  RegisterForm,
  type RegisterFormValues,
} from '@/features/auth/register-form'
import { useAuth } from '@/features/auth/use-auth'
import { registerRequest } from '@/lib/api'

export const RegisterPage = () => {
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const registerMutation = useMutation({ mutationFn: registerRequest })

  const handleSubmit = async (values: RegisterFormValues) => {
    setError(undefined)

    try {
      const tokens = await registerMutation.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
      })
      signIn({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      })
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Could not create account. Please verify your details.')
    }
  }

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', mt: 4 }}>
      <Paper sx={{ width: '100%', maxWidth: 520, p: 4 }} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h5">Create your account</Typography>
          <Typography color="text.secondary">
            Register to start reserving rooms and managing activities.
          </Typography>
          <RegisterForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={registerMutation.isPending}
          />
          <Typography color="text.secondary" variant="body2">
            Already registered?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  )
}
