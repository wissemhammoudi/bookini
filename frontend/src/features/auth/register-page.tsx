import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Link, Paper, Stack, Typography, Box } from '@mui/material'

import {
  RegisterForm,
  type RegisterFormValues,
  AuthBranding,
  ThemeToggle,
} from './components'
import { useAuth } from './hooks'
import { useColorMode } from '@/app/use-color-mode'
import { registerRequest } from '@/lib/api'

export const RegisterPage = () => {
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { mode } = useColorMode()
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

  const isLight = mode === 'light'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight
          ? 'linear-gradient(135deg, #f5f7fb 0%, #e4ecfa 100%)'
          : 'linear-gradient(135deg, #090e17 0%, #121e33 100%)',
        position: 'relative',
        py: 4,
        px: 2,
      }}
    >
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      <Stack spacing={3} sx={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
        <Paper
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: isLight
              ? '0 10px 30px rgba(0, 89, 179, 0.08)'
              : '0 10px 30px rgba(0, 0, 0, 0.4)',
            border: '1px solid',
            borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            background: isLight ? '#ffffff' : '#101d32',
          }}
        >
          <Stack spacing={3.5}>
            {/* Logo and Branding */}
            <AuthBranding />

            <Stack spacing={1}>
              <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                Create your account
              </Typography>
              <Typography color="text.secondary" align="center" variant="body2">
                Register to start reserving rooms and managing activities.
              </Typography>
            </Stack>

            <RegisterForm
              onSubmit={handleSubmit}
              error={error}
              isLoading={registerMutation.isPending}
            />

            <Typography color="text.secondary" variant="body2" align="center">
              Already registered?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
