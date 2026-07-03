import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Paper,
  Stack,
  Typography,
  Box,
  IconButton,
  Link,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { LoginForm, type LoginFormValues } from '@/features/auth/login-form'
import { useAuth } from '@/features/auth/use-auth'
import { useColorMode } from '@/app/use-color-mode'
import { getCurrentUserProfile, loginRequest } from '@/lib/api'

export const LoginPage = () => {
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signOut } = useAuth()
  const { mode, toggleMode } = useColorMode()
  const loginMutation = useMutation({ mutationFn: loginRequest })

  const handleSubmit = async (values: LoginFormValues) => {
    setError(undefined)

    try {
      const tokens = await loginMutation.mutateAsync(values)
      signIn({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      })

      const profile = await getCurrentUserProfile()
      if (profile.role === 'USER') {
        signOut()
        setError('This portal is restricted to Super Admin and Organization Admin accounts.')
        return
      }

      const nextPath =
        (location.state as { from?: string } | null)?.from ?? '/app/dashboard'
      navigate(nextPath, { replace: true })
    } catch {
      setError('Could not sign in. Please check your credentials and try again.')
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
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButton
          onClick={() => navigate('/')}
          color="inherit"
          sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
          title="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Floating Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <IconButton
          onClick={toggleMode}
          sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
          title="Toggle color mode"
        >
          {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
      </Box>

      <Stack spacing={3} sx={{ width: '100%', maxWidth: 450, alignItems: 'center' }}>
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
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <Box component="img" src="/navbar_logo.png" alt="Bookiblastek" sx={{ height: 64, width: 'auto', display: 'block', mb: 0.5 }} />
              <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" align="center" variant="body2">
                Sign in to manage organizations, places, floors, and reservations.
              </Typography>
            </Stack>

            <LoginForm
              onSubmit={handleSubmit}
              error={error}
              isLoading={loginMutation.isPending}
            />

            <Typography color="text.secondary" variant="body2" align="center">
              This portal is for admin accounts only.{' '}
              <Link
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Go to dashboard
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
