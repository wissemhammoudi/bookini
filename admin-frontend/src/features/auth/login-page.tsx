import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Paper, Stack, Typography, Box, IconButton, Avatar, Chip } from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

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
        py: 4,
        px: 2,
      }}
    >
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
                <AdminPanelSettingsIcon sx={{ color: '#ffffff' }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                bookini Admin
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                Admin access
              </Typography>
              <Typography color="text.secondary" align="center" variant="body2">
                Sign in to access the redesigned Bookini administrative workspace.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip label="Super Admin" />
              <Chip label="Organization Admin" />
              <Chip label="Dark / Light Theme" />
            </Stack>

            <LoginForm
              onSubmit={handleSubmit}
              error={error}
              isLoading={loginMutation.isPending}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
