import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Paper, Stack, Typography } from '@mui/material'

import { LoginForm, type LoginFormValues } from '@/features/auth/login-form'
import { useAuth } from '@/features/auth/use-auth'
import { loginRequest } from '@/lib/api'

export const LoginPage = () => {
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const loginMutation = useMutation({ mutationFn: loginRequest })

  const handleSubmit = async (values: LoginFormValues) => {
    setError(undefined)

    try {
      const tokens = await loginMutation.mutateAsync(values)
      signIn({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      })

      const nextPath =
        (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'
      navigate(nextPath, { replace: true })
    } catch {
      setError('Could not sign in. Please try again.')
    }
  }

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', mt: 4 }}>
      <Paper sx={{ width: '100%', maxWidth: 480, p: 4 }} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h5">Welcome back</Typography>
          <Typography color="text.secondary">
            Sign in to access the administrative dashboard.
          </Typography>
          <LoginForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={loginMutation.isPending}
          />
        </Stack>
      </Paper>
      <Alert severity="info" sx={{ width: '100%', maxWidth: 480 }}>
        Use administrative credentials to sign in.
      </Alert>
    </Stack>
  )
}
