import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Paper, Stack, Typography, Box, IconButton, Grid, alpha } from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'

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
        display: 'grid',
        placeItems: 'center',
        background: isLight
          ? 'radial-gradient(circle at top left, rgba(17, 111, 219, 0.10), transparent 26%), linear-gradient(135deg, #f6f9fd 0%, #e9f1fb 100%)'
          : 'radial-gradient(circle at top left, rgba(17, 111, 219, 0.18), transparent 26%), linear-gradient(135deg, #07111e 0%, #101c30 100%)',
        position: 'relative',
        py: 4,
        px: 2,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 'auto -10% 8% auto',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: isLight ? alpha('#1171d8', 0.08) : alpha('#1171d8', 0.14),
          filter: 'blur(30px)',
          pointerEvents: 'none',
        },
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

      <Grid container spacing={0} sx={{ width: '100%', maxWidth: 1180, zIndex: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            sx={{
              height: '100%',
              minHeight: { lg: 720 },
              p: { xs: 3, sm: 5 },
              borderRadius: { xs: 4, lg: '0 28px 28px 0' },
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.06)',
              boxShadow: isLight ? '0 24px 60px rgba(16, 24, 40, 0.08)' : '0 24px 60px rgba(0, 0, 0, 0.35)',
              background: isLight ? '#ffffff' : '#101d32',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Stack spacing={3.5} sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
              <Stack spacing={0.75}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Sign in to continue
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Use your administrator account to access the Bookini workspace.
                </Typography>
              </Stack>

              <LoginForm
                onSubmit={handleSubmit}
                error={error}
                isLoading={loginMutation.isPending}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
