import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { Link, Paper, Stack, Typography, Box, IconButton, Avatar } from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { LoginForm, type LoginFormValues } from '@/features/auth/login-form'
import { useAuth } from '@/features/auth/use-auth'
import { useColorMode } from '@/app/use-color-mode'
import { loginRequest } from '@/lib/api'

export const LoginPage = () => {
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
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

      const nextPath =
        (location.state as { from?: string } | null)?.from ?? '/'
      navigate(nextPath ?? '/dashboard', { replace: true })
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
        py: 4,
        px: 2,
      }}
    >
      {/* Back Button */}
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButton
          onClick={() => navigate('/')}
          color="inherit"
          sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
          title="Go back to home"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Floating Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton
          onClick={toggleMode}
          color="inherit"
          sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
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
            {/* Logo and Branding */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', alignSelf: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 10px rgba(0, 89, 179, 0.3)',
                }}
              >
                <MeetingRoomIcon sx={{ color: '#ffffff' }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                bookiwa7dek
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" align="center" variant="body2">
                Sign in to manage reservations and activities.
              </Typography>
            </Stack>

            <LoginForm
              onSubmit={handleSubmit}
              error={error}
              isLoading={loginMutation.isPending}
            />

            <Typography color="text.secondary" variant="body2" align="center">
              New here?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create your account
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}

