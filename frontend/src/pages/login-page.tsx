import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Paper, Stack, Typography } from '@mui/material'

import { LoginForm, type LoginFormValues } from '../features/auth/login-form'
import { useAuth } from '../features/auth/use-auth'

type LoginResponse = {
  access_token: string
}

export const LoginPage = () => {
  const [error, setError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(undefined)

    try {
      // Week 8 foundation uses a fake token to validate auth flow plumbing.
      // Week 9 will replace this with a real API call through react-query.
      const fakeResult: LoginResponse = {
        access_token: `dev-token:${values.email}`,
      }
      signIn(fakeResult.access_token)

      const nextPath =
        (location.state as { from?: string } | null)?.from ?? '/'
      navigate(nextPath, { replace: true })
    } catch {
      setError('Could not sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', mt: 4 }}>
      <Paper sx={{ width: '100%', maxWidth: 480, p: 4 }} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h5">Welcome back</Typography>
          <Typography color="text.secondary">
            Sign in to manage reservations and activities.
          </Typography>
          <LoginForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
        </Stack>
      </Paper>
      <Alert severity="info" sx={{ width: '100%', maxWidth: 480 }}>
        Development mode uses a local mock token. API integration follows in Week 9.
      </Alert>
    </Stack>
  )
}
